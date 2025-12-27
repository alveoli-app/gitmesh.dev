'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Save,
  Eye,
  Code,
  X,
  Plus,
  Calendar,
  User,
  FileText,
  Tag,
  Mail,
  Send
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { MDXPreview } from './mdx-preview'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface BlogPostData {
  slug: string
  title: string
  excerpt: string
  content: string
  author: string
  publishedAt: string
  tags: string[]
  featured: boolean
  newsletter: boolean
  filename: string
  wordCount: number
}

/**
 * Properties for the BlogPostEditor component.
 * @param slug - Optional slug for the item being edited. If null, a new item is created.
 * @param onClose - Callback triggered after saving or when the user navigates back.
 */
interface BlogPostEditorProps {
  slug?: string | null
  onClose: (saved: boolean) => void
}

/**
 * Options for configuring the newsletter email dispatch.
 */
interface NewsletterOptions {
  customSubject?: string
  customContent?: string
  targetTags: string[]
}

/**
 * BlogPostEditor
 * A comprehensive editor for blog posts, announcements, and welfare information.
 * Uses MDX for content and supports tag-based targeting for newsletters.
 */
export function BlogPostEditor({ slug, onClose }: BlogPostEditorProps) {
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Local state for the content form data
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    publishedAt: new Date().toISOString().slice(0, 16), // Format for datetime-local input
    tags: [] as string[],
    featured: false,
    newsletter: false,
  })

  // State for the interactive tag input
  const [newTag, setNewTag] = useState('')
  const [activeTab, setActiveTab] = useState('edit')

  // Newsletter workflow state
  const [showNewsletterDialog, setShowNewsletterDialog] = useState(false)
  const [newsletterSending, setNewsletterSending] = useState(false)
  const { toast } = useToast()

  const isEditing = Boolean(slug)

  useEffect(() => {
    if (slug) {
      fetchPost()
    }
  }, [slug])

  const fetchPost = async () => {
    if (!slug) return

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/content/blog/${slug}`)
      const result = await response.json()

      if (result.success) {
        const post = result.data
        setFormData({
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          author: post.author,
          publishedAt: new Date(post.publishedAt).toISOString().slice(0, 16),
          tags: post.tags,
          featured: post.featured,
          newsletter: post.newsletter,
        })
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch blog post',
          variant: 'destructive',
        })
        onClose(false)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch blog post',
        variant: 'destructive',
      })
      onClose(false)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Persists the current form state to the database via the API.
   * Can optionally trigger a newsletter dispatch.
   */
  const handleSave = async (sendNewsletter = false) => {
    // Basic validation to ensure required fields are present
    if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim() || !formData.author.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)

      const url = isEditing
        ? `/api/admin/content/blog/${slug}`
        : '/api/admin/content/blog'

      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData, // Spread form data
          publishedAt: new Date(formData.publishedAt).toISOString(), // Ensure UTC string
          sendNewsletter,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: isEditing
            ? 'Blog post updated successfully'
            : 'Blog post created successfully',
        })

        // Handle post-save newsletter workflow feedback
        if (sendNewsletter && result.newsletterResult) {
          const { newsletterResult } = result
          if (newsletterResult.success) {
            toast({
              title: 'Newsletter Sent',
              description: `Newsletter sent to ${newsletterResult.totalSent} subscribers`,
            })
          } else {
            toast({
              title: 'Newsletter Failed',
              description: newsletterResult.error || 'Failed to send newsletter',
              variant: 'destructive',
            })
          }
        }

        onClose(true)
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to save blog post',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('[Editor] Fatal error during save:', error)
      toast({
        title: 'Error',
        description: 'Failed to save blog post',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const handleSaveAndNewsletter = () => {
    if (formData.newsletter) {
      setShowNewsletterDialog(true)
    } else {
      handleSave(false)
    }
  }

  const handleNewsletterConfirm = async (options: NewsletterOptions) => {
    setShowNewsletterDialog(false)
    setNewsletterSending(true)

    try {
      // First save the blog post
      await handleSave(false)

      // Then send newsletter with the saved post
      const postSlug = slug || generateSlugFromTitle(formData.title)
      await sendNewsletterForPost(postSlug, options)
    } finally {
      setNewsletterSending(false)
    }
  }

  const generateSlugFromTitle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const sendNewsletterForPost = async (postSlug: string, options: NewsletterOptions) => {
    try {
      const response = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: options.customSubject || `New Blog Post: ${formData.title}`,
          customContent: options.customContent,
          includePosts: [postSlug],
          tags: options.targetTags,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Newsletter Sent',
          description: `Newsletter sent to ${result.totalSent} subscribers`,
        })
      } else {
        toast({
          title: 'Newsletter Failed',
          description: result.error || 'Failed to send newsletter',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Newsletter Error',
        description: 'Failed to send newsletter',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => onClose(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => onClose(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-semibold">
              {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h2>
            <p className="text-sm text-gray-600">
              {isEditing ? `Editing: ${formData.title}` : 'Create a new blog post with MDX support'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => handleSave(false)} disabled={saving || newsletterSending} variant="outline">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Only'}
          </Button>
          <Button onClick={handleSaveAndNewsletter} disabled={saving || newsletterSending}>
            {newsletterSending ? (
              <>
                <Mail className="h-4 w-4 mr-2 animate-pulse" />
                Sending...
              </>
            ) : formData.newsletter ? (
              <>
                <Send className="h-4 w-4 mr-2" />
                Save & Send Newsletter
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Post
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit" className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="mt-4">
                  <Textarea
                    placeholder="Write your blog post content in MDX format..."
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="min-h-[500px] font-mono text-sm"
                  />
                  <div className="mt-2 text-xs text-gray-500">
                    Word count: {formData.content.split(/\s+/).filter(word => word.length > 0).length}
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="mt-4">
                  <div className="border rounded-lg p-4 min-h-[500px] bg-white">
                    <MDXPreview content={formData.content} />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter post title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Brief description of the post"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Author & Date */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Author & Date
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  placeholder="Author name"
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="publishedAt">Published Date *</Label>
                <Input
                  id="publishedAt"
                  type="datetime-local"
                  value={formData.publishedAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button size="sm" onClick={addTag} disabled={!newTag.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Featured Post</Label>
                  <div className="text-sm text-gray-600">
                    Show in featured section
                  </div>
                </div>
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                  className="data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-700"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Newsletter</Label>
                  <div className="text-sm text-gray-600">
                    Include in newsletter
                  </div>
                </div>
                <Switch
                  checked={formData.newsletter}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, newsletter: checked }))}
                  className="data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-700"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Newsletter Dialog */}
      <NewsletterDialog
        open={showNewsletterDialog}
        onOpenChange={setShowNewsletterDialog}
        onConfirm={handleNewsletterConfirm}
        postTitle={formData.title}
        postTags={formData.tags}
      />
    </div>
  )
}

interface NewsletterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (options: NewsletterOptions) => void
  postTitle: string
  postTags: string[]
}

function NewsletterDialog({ open, onOpenChange, onConfirm, postTitle, postTags }: NewsletterDialogProps) {
  const [options, setOptions] = useState<NewsletterOptions>({
    customSubject: '',
    customContent: '',
    targetTags: []
  })

  const handleConfirm = () => {
    onConfirm(options)
    // Reset options for next time
    setOptions({
      customSubject: '',
      customContent: '',
      targetTags: []
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Newsletter
          </DialogTitle>
          <DialogDescription>
            Configure newsletter settings for "{postTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newsletter-subject">Custom Subject (optional)</Label>
            <Input
              id="newsletter-subject"
              placeholder={`New Blog Post: ${postTitle}`}
              value={options.customSubject}
              onChange={(e) => setOptions(prev => ({ ...prev, customSubject: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newsletter-content">Additional Content (optional)</Label>
            <Textarea
              id="newsletter-content"
              placeholder="Add custom message to include with the blog post..."
              rows={3}
              value={options.customContent}
              onChange={(e) => setOptions(prev => ({ ...prev, customContent: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Target Subscribers</Label>
            <Select
              value={options.targetTags.length > 0 ? 'tagged' : 'all'}
              onValueChange={(value) => {
                if (value === 'all') {
                  setOptions(prev => ({ ...prev, targetTags: [] }))
                } else if (value === 'tagged') {
                  setOptions(prev => ({ ...prev, targetTags: postTags }))
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All confirmed subscribers</SelectItem>
                <SelectItem value="tagged" disabled={postTags.length === 0}>
                  Subscribers with matching tags {postTags.length > 0 && `(${postTags.join(', ')})`}
                </SelectItem>
              </SelectContent>
            </Select>
            {postTags.length === 0 && (
              <p className="text-sm text-gray-500">
                Add tags to the blog post to enable tag-based targeting
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            <Send className="h-4 w-4 mr-2" />
            Send Newsletter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}