"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Save, Eye } from "lucide-react"
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

export default function NewBlogPostPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featured_image_url: "",
    meta_description: "",
    status: "draft",
  })

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || slugify(title),
    }))
  }

  const handleSubmit = async (e: React.FormEvent, publish = false) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Get current user for author_id
      const { data: { user } } = await supabase.auth.getUser()

      const status = publish ? "published" : formData.status
      const published_at = status === "published" ? new Date().toISOString() : null

      const { data, error: insertError } = await supabase
        .from("blog_posts")
        .insert({
          title: formData.title,
          slug: formData.slug || slugify(formData.title),
          excerpt: formData.excerpt || null,
          content: formData.content,
          featured_image_url: formData.featured_image_url || null,
          meta_description: formData.meta_description || null,
          status,
          published_at,
          author_id: user?.id,
        })
        .select()
        .single()

      if (insertError) throw insertError

      router.push("/admin/blog")
    } catch (err: any) {
      console.error("Error creating post:", err)
      setError(err.message || "Failed to create post")
    } finally {
      setLoading(false)
    }
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
            <CardTitle>Create New Post</CardTitle>
            <CardDescription>
              Write a new blog post. You can save as draft or publish immediately.
            </CardDescription>
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
                  onChange={(e) => handleTitleChange(e.target.value)}
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

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  variant="default"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={loading}
                  onClick={(e) => handleSubmit(e, true)}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Eye className="mr-2 h-4 w-4" />
                  Publish Now
                </Button>
                <Link href="/admin/blog">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
