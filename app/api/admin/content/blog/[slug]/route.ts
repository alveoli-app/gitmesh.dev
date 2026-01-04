import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-protection'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

/**
 * Schema for updating an existing content item.
 * Requires all fields for a full update, but supports the UI-only newsletter flag.
 */
const UpdateContentSchema = z.object({
  type: z.enum(['blog', 'announcement', 'welfare']).default('blog'),
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  content: z.string().min(1, 'Content is required'),
  author: z.string().min(1, 'Author is required'),
  publishedAt: z.string().datetime(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  newsletter: z.boolean().default(false),
  sendNewsletter: z.boolean().default(false), // Flag to trigger high-priority newsletter dispatch
})

interface RouteParams {
  params: Promise<{
    slug: string
  }>
}

/**
 * GET /api/admin/content/blog/[slug]
 * Retrieves a single content item by its URL-safe slug.
 * 
 * @param params - Contains the unique slug for the item
 * @returns JSON containing the item data or 404 if not found
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  try {
    // Audit authorization
    await requireAdmin()

    // Singular lookup on the unique 'slug' index
    const { data: item, error } = await supabase
      .from('content')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !item) {
      if (error && error.code !== 'PGRST116') {
        console.error('[CMS_API_ITEM] Supabase lookup error:', error)
      }
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        slug: item.slug,
        title: item.title,
        excerpt: item.excerpt,
        content: item.content,
        author: item.author,
        publishedAt: item.published_at,
        tags: item.tags,
        featured: item.featured,
        newsletter: item.newsletter,
        filename: null,
        wordCount: item.content.split(/\s+/).length,
      }
    })
  } catch (error) {
    console.error('[CMS_API_ITEM] Fatal error fetching item:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch blog post'
      },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

/**
 * PUT /api/admin/content/blog/[slug]
 * Updates an existng content item and optionally re-dispatches a newsletter.
 * 
 * @returns JSON with the updated status
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  try {
    // Verify admin credentials
    await requireAdmin()

    const body = await request.json()
    const validatedData = UpdateContentSchema.parse(body)

    // Update row by slug
    const { data, error } = await supabase
      .from('content')
      .update({
        type: validatedData.type,
        title: validatedData.title,
        excerpt: validatedData.excerpt,
        content: validatedData.content,
        author: validatedData.author,
        published_at: validatedData.publishedAt,
        tags: validatedData.tags,
        featured: validatedData.featured,
        newsletter: validatedData.newsletter,
      })
      .eq('slug', slug)
      .select()
      .single()

    if (error) {
      console.error('[CMS_API_ITEM] Supabase update fail:', error)
      throw error
    }

    let newsletterResult = null

    // Handle newsletter re-dispatch if requested
    if (validatedData.sendNewsletter && validatedData.newsletter) {
      try {
        newsletterResult = await sendNewsletterForContent(slug, validatedData)
      } catch (newsletterError) {
        console.error('[CMS_API_ITEM] Newsletter update failed:', newsletterError)
        newsletterResult = {
          success: false,
          error: newsletterError instanceof Error ? newsletterError.message : 'Newsletter sending failed'
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        slug,
        message: 'Blog post updated successfully'
      },
      newsletterResult
    })
  } catch (error) {
    console.error('[CMS_API_ITEM] Error during PUT:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update blog post'
      },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

async function sendNewsletterForContent(slug: string, postData: any) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const response = await fetch(`${baseUrl}/api/admin/newsletter/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: `Updated Blog Post: ${postData.title}`,
      includePosts: [slug],
      tags: postData.tags,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to send newsletter')
  }

  return await response.json()
}

/**
 * DELETE /api/admin/content/blog/[slug]
 * Physically removes a content item from the 'content' table.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { slug } = await params
  try {
    await requireAdmin()

    const { error } = await supabase
      .from('content')
      .delete()
      .eq('slug', slug)

    if (error) {
      console.error('[CMS_API_ITEM] Supabase delete error:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      data: {
        slug,
        message: 'Blog post deleted successfully'
      }
    })
  } catch (error) {
    console.error('[CMS_API_ITEM] Failed to delete item:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete blog post'
      },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}