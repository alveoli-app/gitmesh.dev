import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-protection'
import { generateSlug } from '@/lib/content-parser'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'

/**
 * Schema for creating or updating content items.
 * Supports blog posts, announcements, and welfare information.
 */
const CreateContentSchema = z.object({
  type: z.enum(['blog', 'announcement', 'welfare']).default('blog'),
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  content: z.string().min(1, 'Content is required'),
  author: z.string().min(1, 'Author is required'),
  publishedAt: z.string().datetime(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  newsletter: z.boolean().default(false),
  sendNewsletter: z.boolean().default(false), // UI-only flag to trigger newsletter dispatch
})

/**
 * GET /api/admin/content/blog
 * Fetches a list of content items filtered by type.
 * 
 * @param request - The NextRequest object containing query parameters
 * @returns A JSON response with the requested content items
 */
export async function GET(request: NextRequest) {
  try {
    // Security check: Only allow super admins
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'blog'

    // Query Supabase with descending order based on publication date
    const { data: content, error } = await supabase
      .from('content')
      .select('*')
      .eq('type', type)
      .order('published_at', { ascending: false })

    if (error) {
      console.error('[CMS_API] Supabase error during GET:', error)
      throw error
    }

    return NextResponse.json({
      success: true,
      data: (content || []).map((post: any) => ({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        author: post.author,
        publishedAt: post.published_at,
        tags: post.tags,
        featured: post.featured,
        newsletter: post.newsletter,
        filename: null, // No longer file-based
        wordCount: post.content.split(/\s+/).length,
        // Include content for editing if needed, but list usually doesn't need full content
        content: post.content,
      }))
    })
  } catch (error) {
    console.error('[CMS_API] Failed to fetch content:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch blog posts'
      },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

/**
 * POST /api/admin/content/blog
 * Creates a new content item in the database and optionally sends a newsletter.
 * 
 * @param request - The NextRequest object containing the content payload
 * @returns A success response with the new content slug
 */
export async function POST(request: NextRequest) {
  try {
    // Security check: Only allow super admins
    await requireAdmin()

    const body = await request.json()
    const validatedData = CreateContentSchema.parse(body)

    // Automatically generate a URL-safe slug from the title
    const slug = generateSlug(validatedData.title)

    // Persistence layer: Supabase 'content' table
    const { data, error } = await supabase
      .from('content')
      .insert({
        slug,
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
      .select()
      .single()

    if (error) {
      console.error('[CMS_API] Supabase error during POST:', error)
      throw error
    }

    let newsletterResult = null

    // Optional: Dispatch newsletter if the item is flagged for it
    if (validatedData.sendNewsletter && validatedData.newsletter) {
      try {
        newsletterResult = await sendNewsletterForContent(slug, validatedData)
      } catch (newsletterError) {
        // Log error but prioritize main operation's success
        console.error('[CMS_API] Newsletter dispatch failed:', newsletterError)
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
        message: 'Blog post created successfully'
      },
      newsletterResult
    })
  } catch (error) {
    console.error('[CMS_API] Error creating content:', error)

    // Handle Zod validation errors with specific details
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
        error: error instanceof Error ? error.message : 'Failed to create blog post'
      },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    )
  }
}

/**
 * Internal helper to trigger the newsletter service for a specific item.
 */
async function sendNewsletterForContent(slug: string, postData: any) {
  // Ensure the base URL is correctly resolved for server-side fetch
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const response = await fetch(`${baseUrl}/api/admin/newsletter/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject: `New Blog Post: ${postData.title}`,
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
