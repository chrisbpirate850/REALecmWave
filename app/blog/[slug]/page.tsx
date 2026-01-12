import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"
import { Metadata } from "next"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, meta_description, excerpt, featured_image_url")
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (!post) {
    return {
      title: "Post Not Found | Emerald Coast Marketing Wave",
    }
  }

  return {
    title: `${post.title} | Emerald Coast Marketing Wave`,
    description: post.meta_description || post.excerpt || undefined,
    openGraph: {
      title: post.title,
      description: post.meta_description || post.excerpt || undefined,
      images: post.featured_image_url ? [post.featured_image_url] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from("blog_posts")
    .select(`
      *,
      profiles:author_id (
        business_name
      )
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (error || !post) {
    notFound()
  }

  // Simple markdown-like rendering (basic implementation)
  const renderContent = (content: string) => {
    // Convert markdown-style formatting to HTML
    let html = content
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-emerald-600 hover:underline">$1</a>')
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-4">')
      // Lists
      .replace(/^\- (.*$)/gim, '<li class="ml-4">$1</li>')

    return `<p class="mb-4">${html}</p>`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back Link */}
      <div className="border-b">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <Link href="/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>

      {/* Featured Image */}
      {post.featured_image_url && (
        <div className="h-64 w-full md:h-96">
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Article */}
      <article className="py-12">
        <div className="mx-auto max-w-3xl px-4">
          {/* Header */}
          <header className="mb-8 border-b pb-8">
            <h1 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(post.published_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {post.profiles?.business_name && (
                <span>By {post.profiles.business_name}</span>
              )}
            </div>
          </header>

          {/* Content */}
          <div
            className="prose prose-lg max-w-none prose-emerald"
            dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
          />
        </div>
      </article>

      {/* CTA Section */}
      <section className="border-t bg-gradient-to-b from-emerald-50 to-background py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <Mail className="mx-auto mb-4 h-12 w-12 text-emerald-600" />
          <h2 className="mb-4 text-2xl font-bold">
            Ready to Reach More Customers?
          </h2>
          <p className="mb-8 text-muted-foreground">
            Get your business in front of thousands of local households with our shared postcard mailings.
            Affordable, effective, and trackable with QR codes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/mailings">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                View Available Mailings
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="lg" variant="outline">
                Learn How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* More Posts */}
      <section className="border-t py-12">
        <div className="mx-auto max-w-4xl px-4">
          <h3 className="mb-6 text-xl font-semibold">More from our Blog</h3>
          <MorePosts currentSlug={slug} />
        </div>
      </section>
    </div>
  )
}

async function MorePosts({ currentSlug }: { currentSlug: string }) {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, featured_image_url, published_at")
    .eq("status", "published")
    .neq("slug", currentSlug)
    .order("published_at", { ascending: false })
    .limit(3)

  if (!posts || posts.length === 0) {
    return (
      <p className="text-muted-foreground">No other posts yet. Check back soon!</p>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {posts.map((post) => (
        <Link key={post.id} href={`/blog/${post.slug}`}>
          <div className="group rounded-lg border p-4 transition-all hover:shadow-md">
            {post.featured_image_url && (
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="mb-3 h-32 w-full rounded object-cover"
              />
            )}
            <h4 className="font-medium group-hover:text-emerald-600">
              {post.title}
            </h4>
            <p className="mt-1 text-sm text-muted-foreground">
              {post.published_at &&
                new Date(post.published_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
