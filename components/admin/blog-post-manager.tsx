'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { BlogPostEditor } from './blog-post-editor'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  Star,
  Mail,
  RefreshCw,
  LayoutGrid
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

/**
 * Summary data for a content item, used in the management list view.
 */
interface ContentSummary {
  slug: string
  title: string
  type: 'blog' | 'announcement' | 'welfare'
  excerpt: string
  author: string
  publishedAt: string
  tags: string[]
  featured: boolean
  newsletter: boolean
  wordCount: number
}

/**
 * BlogPostManager
 * The primary dashboard for managing site content.
 * Provides filtering by type (Blog, Announcement, Welfare), search, and tag/author filters.
 */
export function BlogPostManager() {
  const [items, setItems] = useState<ContentSummary[]>([])
  const [loading, setLoading] = useState(true)

  // UI filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [contentType, setContentType] = useState<'blog' | 'announcement' | 'welfare'>('blog')
  const [filterTag, setFilterTag] = useState<string>('')
  const [filterAuthor, setFilterAuthor] = useState<string>('')

  // Editor visibility state
  const [showEditor, setShowEditor] = useState(false)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const { toast } = useToast()

  /**
   * Fetches the content list from the API based on the currently selected type.
   */
  const fetchContent = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/content/blog?type=${contentType}`)
      const result = await response.json()

      if (result.success) {
        setItems(result.data)
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch content',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('[Manager] Fetch error:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch content',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContent()
  }, [contentType])

  const handleDelete = async (slug: string) => {
    try {
      const response = await fetch(`/api/admin/content/blog/${slug}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Content deleted successfully',
        })
        fetchContent()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete content',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete content',
        variant: 'destructive',
      })
    }
  }

  const handleEditorClose = (saved: boolean) => {
    setShowEditor(false)
    setEditingItem(null)
    if (saved) {
      fetchContent()
    }
  }

  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
    const matchesSearch = searchTerm === '' ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTag = filterTag === '' || item.tags.includes(filterTag)
    const matchesAuthor = filterAuthor === '' || item.author === filterAuthor

    return matchesSearch && matchesTag && matchesAuthor
  })

  // Get unique tags and authors for filters
  const allTags = Array.from(new Set(items.flatMap(item => item.tags))).sort()
  const allAuthors = Array.from(new Set(items.map(item => item.author))).sort()

  if (showEditor) {
    return (
      <BlogPostEditor
        slug={editingItem}
        onClose={handleEditorClose}
      />
    )
  }

  const typeLabels = {
    blog: 'Blog Posts',
    announcement: 'Announcements',
    welfare: 'Welfare Info'
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowEditor(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New {contentType === 'blog' ? 'Blog Post' : contentType === 'announcement' ? 'Announcement' : 'Welfare Info'}
          </Button>
          <Button variant="outline" onClick={fetchContent} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          {filteredItems.length} of {items.length} {typeLabels[contentType]}
        </div>
      </div>

      {/* Type Selector & Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Content Type & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
              <SelectTrigger className="bg-blue-50 border-blue-200">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blog">Blog Posts</SelectItem>
                <SelectItem value="announcement">Announcements</SelectItem>
                <SelectItem value="welfare">Welfare Information</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterTag || "all"} onValueChange={(value) => setFilterTag(value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tags</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterAuthor || "all"} onValueChange={(value) => setFilterAuthor(value === "all" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by author" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All authors</SelectItem>
                {allAuthors.map(author => (
                  <SelectItem key={author} value={author}>{author}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {items.length === 0 ? `No ${typeLabels[contentType]} yet` : 'No items match your filters'}
            </h3>
            <p className="text-gray-600 mb-4">
              {items.length === 0
                ? `Get started by creating your first ${contentType}.`
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {items.length === 0 && (
              <Button onClick={() => setShowEditor(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First {contentType === 'blog' ? 'Post' : contentType === 'announcement' ? 'Announcement' : 'Welfare Info'}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.slug} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base line-clamp-2 flex-1">
                    {item.title}
                  </CardTitle>
                  <div className="flex gap-1 flex-shrink-0">
                    {item.featured && (
                      <div title="Featured">
                        <Star className="h-4 w-4 text-yellow-500" />
                      </div>
                    )}
                    {item.newsletter && (
                      <div title="Newsletter">
                        <Mail className="h-4 w-4 text-blue-500" />
                      </div>
                    )}
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {item.excerpt}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {item.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {item.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.publishedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {item.wordCount} words
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingItem(item.slug)
                      setShowEditor(true)
                    }}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Content</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{item.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(item.slug)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
