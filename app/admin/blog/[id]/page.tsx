"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { ArrowLeft, Loader2, Save, Eye, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featured_image_url: string | null
  meta_description: string | null
  status: string
  published_at: string | null
  created_at: string
  author_id: string | null
}

export default function EditBlogPostPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [post, setPost] = useState<BlogPost | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image_url: "",
    meta_description: "",
    status: "draft",
  })

  useEffect(() => {
    fetchPost()
  }, [params.id])

  const fetchPost = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      setError("Failed to load post")
      setLoading(false)
      return
    }

    setPost(data)
    setFormData({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || "",
      content: data.content,
      featured_image_url: data.featured_image_url || "",
      meta_description: data.meta_description || "",
      status: data.status,
    })
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const status = publish ? "published" : formData.status
      const published_at =
        status === "published" && post?.status !== "published"
          ? new Date().toISOString()
          : status === "published"
          ? post?.published_at
          : null

      const { error: updateError } = await supabase
        .from("blog_posts")
        .update({
          title: formData.title,
          slug: formData.slug,
          excerpt: formData.excerpt || null,
          content: formData.content,
          featured_image_url: formData.featured_image_url || null,
          meta_description: formData.meta_description || null,
          status,
          published_at,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)

      if (updateError) throw updateError

      // Refresh data
      fetchPost()
    } catch (err: any) {
      console.error("Error updating post:", err)
      setError(err.message || "Failed to update post")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)

    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", params.id)

    if (error) {
      setError(error.message)
      setDeleting(false)
      return
    }

    router.push("/admin/blog")
  }

  const handleUnpublish = async () => {
    setSaving(true)

    const { error } = await supabase
      .from("blog_posts")
      .update({
        status: "draft",
        published_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)

    if (!error) {
      fetchPost()
    } else {
      setError(error.message)
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Post not found</h2>
          <Link href="/admin/blog">
            <Button className="mt-4">Back to Blog</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/admin/blog">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>
      </div>

      <div className="mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Edit Post</CardTitle>
                <CardDescription>
                  Last updated: {new Date(post.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={
                    post.status === "published"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-700"
                  }
                >
                  {post.status}
                </Badge>
                {post.status === "published" && (
                  <Link href={`/blog/${post.slug}`} target="_blank">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmit(e)} className="space-y-6">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter post title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/blog/</span>
                  <Input
                    id="slug"
                    placeholder="post-url-slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Brief description shown in blog listing..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your post content here... (Markdown supported)"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={15}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Supports Markdown formatting
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="featured_image_url">Featured Image URL</Label>
                <Input
                  id="featured_image_url"
                  type="url"
                  placeholder="https://..."
                  value={formData.featured_image_url}
                  onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                />
                {formData.featured_image_url && (
                  <img
                    src={formData.featured_image_url}
                    alt="Preview"
                    className="mt-2 h-32 w-full rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none"
                    }}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  placeholder="SEO description for search engines..."
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.meta_description.length}/160 characters
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>

                {post.status === "draft" ? (
                  <Button
                    type="button"
                    variant="default"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={saving}
                    onClick={(e) => handleSubmit(e, true)}
                  >
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Eye className="mr-2 h-4 w-4" />
                    Publish
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving}
                    onClick={handleUnpublish}
                  >
                    Unpublish
                  </Button>
                )}

                <div className="flex-1" />

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" disabled={deleting}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
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
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deleting ? (
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
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
