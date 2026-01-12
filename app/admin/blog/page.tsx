"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
} from "@/components/ui/alert-dialog"
import {
  FileText,
  Plus,
  Loader2,
  Search,
  Eye,
  Edit,
  Trash2,
  Calendar,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  status: string
  published_at: string | null
  created_at: string
  featured_image_url: string | null
  profiles?: {
    business_name: string
    email: string
  }
}

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  published: "bg-emerald-100 text-emerald-700",
}

export default function AdminBlogPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      setFilteredPosts(
        posts.filter(
          p =>
            p.title.toLowerCase().includes(term) ||
            p.slug.toLowerCase().includes(term) ||
            p.excerpt?.toLowerCase().includes(term)
        )
      )
    } else {
      setFilteredPosts(posts)
    }
  }, [posts, searchTerm])

  const fetchPosts = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("blog_posts")
      .select(`
        *,
        profiles:author_id (
          business_name,
          email
        )
      `)
      .order("created_at", { ascending: false })

    if (data) {
      setPosts(data)
    }

    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)

    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", id)

    if (!error) {
      setPosts(prev => prev.filter(p => p.id !== id))
    }

    setDeleting(null)
  }

  const publishedCount = posts.filter(p => p.status === "published").length
  const draftCount = posts.filter(p => p.status === "draft").length

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog</h1>
          <p className="text-muted-foreground">Manage your blog posts and content</p>
        </div>
        <Link href="/admin/blog/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{publishedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Posts
          </CardTitle>
          <CardDescription>
            Showing {filteredPosts.length} of {posts.length} posts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPosts.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No Posts Found</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {searchTerm ? "Try adjusting your search" : "Create your first blog post"}
              </p>
              {!searchTerm && (
                <Link href="/admin/blog/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Post
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-start justify-between rounded-lg border p-4 hover:bg-muted/50"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    {post.featured_image_url ? (
                      <img
                        src={post.featured_image_url}
                        alt={post.title}
                        className="h-16 w-24 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-24 items-center justify-center rounded bg-muted">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{post.title}</h3>
                        <Badge className={STATUS_COLORS[post.status]}>
                          {post.status}
                        </Badge>
                      </div>
                      {post.excerpt && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {post.status === "published" && post.published_at
                            ? new Date(post.published_at).toLocaleDateString()
                            : new Date(post.created_at).toLocaleDateString()}
                        </span>
                        <span>/blog/{post.slug}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.status === "published" && (
                      <Link href={`/blog/${post.slug}`} target="_blank">
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <Link href={`/admin/blog/${post.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Post?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{post.title}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(post.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            {deleting === post.id ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
