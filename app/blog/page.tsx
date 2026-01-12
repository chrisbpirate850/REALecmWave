import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Blog | Emerald Coast Marketing Wave",
  description: "Tips, insights, and success stories about local advertising with shared postcard mailings.",
}

export default async function BlogPage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, featured_image_url, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-emerald-50 to-background py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Marketing Insights
          </h1>
          <p className="text-lg text-muted-foreground">
            Tips, strategies, and success stories to help your business grow with local advertising.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4">
          {!posts || posts.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="mb-2 text-xl font-semibold">No Posts Yet</h2>
              <p className="text-muted-foreground">
                Check back soon for marketing tips and insights.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="overflow-hidden transition-all hover:shadow-lg">
                    <div className="md:flex">
                      {/* Thumbnail */}
                      {post.featured_image_url ? (
                        <div className="md:w-72 md:shrink-0">
                          <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="h-48 w-full object-cover md:h-full"
                          />
                        </div>
                      ) : (
                        <div className="flex h-48 items-center justify-center bg-muted md:h-auto md:w-72 md:shrink-0">
                          <FileText className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}

                      <CardContent className="flex flex-1 flex-col justify-center p-6">
                        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {post.published_at &&
                            new Date(post.published_at).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                        </div>
                        <h2 className="mb-2 text-xl font-semibold md:text-2xl">
                          {post.title}
                        </h2>
                        {post.excerpt && (
                          <p className="mb-4 text-muted-foreground line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-emerald-600">
                          Read More
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-emerald-50 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold">Ready to Grow Your Business?</h2>
          <p className="mb-8 text-muted-foreground">
            Join local businesses reaching thousands of homes through shared postcard mailings.
          </p>
          <Link href="/mailings">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
              Browse Available Mailings
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
