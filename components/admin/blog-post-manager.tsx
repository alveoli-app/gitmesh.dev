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
  RefreshCw
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

/**
 * Summary data for a content item, used in the management list view.
 */
interface ContentSummary {
  slug: string
  title: string
  excerpt: string
  author: string
  publishedAt: string
  tags: string[]
  featured: boolean
  newsletter: boolean
  filename: string
  wordCount: number
}

/**
 * BlogPostManager
 * The primary dashboard for managing site content.
 * Provides filtering by type (Blog, Announcement, Welfare), search, and tag/author filters.
 */
export function BlogPostManager() {
  const [posts, setPosts] = useState<ContentSummary[]>([])
  const [loading, setLoading] = useState(true)

  // UI filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTag, setFilterTag] = useState<string>('')
  const [filterAuthor, setFilterAuthor] = useState<string>('')

  // Editor visibility state
  const [showEditor, setShowEditor] = useState(false)
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const { toast } = useToast()

  /**
   * Fetches the content list from the API based on the currently selected type.
   */
  const fetchContent = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/content/blog')
      const result = await response.json()

      if (result.success) {
        setPosts(result.data)
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to fetch blog posts',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('[Manager] Fetch error:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch blog posts',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContent()
  }, [])

  const handleDelete = async (slug: string) => {
    try {
      const response = await fetch(`/api/admin/content/blog/${slug}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Blog post deleted successfully',
        })
        fetchContent()
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete blog post',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete blog post',
        variant: 'destructive',
      })
    }
  }

  const handleEditorClose = (saved: boolean) => {
    setShowEditor(false)
    setEditingPost(null)
    if (saved) {
      fetchContent()
    }
  }

  // Filter posts based on search and filters
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchTerm === '' ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTag = filterTag === '' || post.tags.includes(filterTag)
    const matchesAuthor = filterAuthor === '' || post.author === filterAuthor

    return matchesSearch && matchesTag && matchesAuthor
  })

  // Get unique tags and authors for filters
  const allTags = Array.from(new Set(posts.flatMap(post => post.tags))).sort()
  const allAuthors = Array.from(new Set(posts.map(post => post.author))).sort()

  if (showEditor) {
    return (
      <BlogPostEditor
        slug={editingPost}
        onClose={handleEditorClose}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowEditor(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Blog Post
          </Button>
          <Button variant="outline" onClick={fetchContent} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="text-sm text-gray-600">
          {filteredPosts.length} of {posts.length} posts
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search posts..."
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

      {/* Posts List */}
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
      ) : filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {posts.length === 0 ? 'No blog posts yet' : 'No posts match your filters'}
            </h3>
            <p className="text-gray-600 mb-4">
              {posts.length === 0
                ? 'Get started by creating your first blog post.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {posts.length === 0 && (
              <Button onClick={() => setShowEditor(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Post
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map((post) => (
            <Card key={post.slug} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base line-clamp-2 flex-1">
                    {post.title}
                  </CardTitle>
                  <div className="flex gap-1 flex-shrink-0">
                    {post.featured && (
                      <div title="Featured">
                        <Star className="h-4 w-4 text-yellow-500" />
                      </div>
                    )}
                    {post.newsletter && (
                      <div title="Newsletter">
                        <Mail className="h-4 w-4 text-blue-500" />
                      </div>
                    )}
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {post.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{post.tags.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {post.wordCount} words
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingPost(post.slug)
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
                        <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{post.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(post.slug)}
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