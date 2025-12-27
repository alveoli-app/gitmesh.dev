import matter from 'gray-matter'
import { z } from 'zod'

// Blog post frontmatter schema
export const BlogPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  author: z.string().min(1, 'Author is required'),
  publishedAt: z.string().datetime('Invalid date format'),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  newsletter: z.boolean().optional(),
})

// Page frontmatter schema
export const PageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
})

export type BlogPostFrontmatter = {
  title: string
  excerpt: string
  author: string
  publishedAt: string
  tags: string[]
  featured: boolean
  newsletter: boolean
}
export type PageFrontmatter = z.infer<typeof PageSchema>

export interface ParsedContent<T = any> {
  frontmatter: T
  content: string
  slug: string
}

/**
 * Parse MDX content and validate frontmatter
 */
export function parseMDX<T>(
  content: string,
  schema: z.ZodSchema<T>,
  slug: string
): ParsedContent<T> {
  try {
    const { data, content: mdxContent } = matter(content)
    
    // Validate frontmatter against schema
    const frontmatter = schema.parse(data)
    
    return {
      frontmatter,
      content: mdxContent.trim(),
      slug,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid frontmatter in ${slug}: ${error.message}`)
    }
    throw new Error(`Failed to parse MDX content in ${slug}: ${error}`)
  }
}

/**
 * Parse blog post MDX content
 */
export function parseBlogPost(content: string, slug: string): ParsedContent<BlogPostFrontmatter> {
  const parsed = parseMDX(content, BlogPostSchema, slug)
  return {
    ...parsed,
    frontmatter: {
      ...parsed.frontmatter,
      tags: parsed.frontmatter.tags || [],
      featured: parsed.frontmatter.featured ?? false,
      newsletter: parsed.frontmatter.newsletter ?? false,
    }
  }
}

/**
 * Parse page MDX content
 */
export function parsePage(content: string, slug: string): ParsedContent<PageFrontmatter> {
  return parseMDX(content, PageSchema, slug)
}

/**
 * Generate slug from filename
 */
export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')    // Remove special characters
    .replace(/[\s_-]+/g, '-')    // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '')     // Remove leading/trailing hyphens
}

/**
 * Extract date from blog post filename
 */
export function extractDateFromFilename(filename: string): Date | null {
  const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/)
  if (dateMatch) {
    return new Date(dateMatch[1])
  }
  return null
}

/**
 * Validate MDX content structure
 */
export function validateMDXContent(content: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check if content has frontmatter
  if (!content.startsWith('---')) {
    errors.push('Content must start with frontmatter (---)')
  }
  
  // Check for closing frontmatter
  const frontmatterEnd = content.indexOf('---', 3)
  if (frontmatterEnd === -1) {
    errors.push('Frontmatter must be closed with ---')
  }
  
  // Check if there's actual content after frontmatter
  const contentAfterFrontmatter = content.slice(frontmatterEnd + 3).trim()
  if (!contentAfterFrontmatter) {
    errors.push('Content body cannot be empty')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}