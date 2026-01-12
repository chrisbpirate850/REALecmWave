import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  MapPin,
  Home,
  QrCode,
  BarChart3,
  Shield,
  Mail,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Zap,
  Target,
  Lock,
} from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { createClient } from "@/lib/supabase/server"
import { LandingPostcardPreview } from "@/components/landing-postcard-preview"
import { cn } from "@/lib/utils"

// The 12 business categories
const CATEGORIES = [
  { id: 1, name: "Legal & Estate Planning", icon: "⚖️" },
  { id: 2, name: "Financial Services", icon: "📈" },
  { id: 3, name: "Dental & Med-Spa", icon: "🦷" },
  { id: 4, name: "Chiropractic & Physical Therapy", icon: "💪" },
  { id: 5, name: "HVAC, Plumbing & Electrical", icon: "🔧" },
  { id: 6, name: "Landscaping, Pools & Remodeling", icon: "🏡" },
  { id: 7, name: "Real Estate", icon: "🏠" },
  { id: 8, name: "Accounting, Insurance & Professional Services", icon: "📊" },
  { id: 9, name: "Auto Sales, Repair & Detailing", icon: "🚗" },
  { id: 10, name: "Restaurants & Fitness", icon: "🍽️" },
  { id: 11, name: "Senior Care & Childcare", icon: "👨‍👩‍👧" },
  { id: 12, name: "Veterinary & Pet Services", icon: "🐕" },
]

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch the current active mailing with ad spots
  const { data: currentMailing } = await supabase
    .from("mailings")
    .select(`
      *,
      ad_spots (
        id,
        position,
        side,
        grid_position,
        status,
        price,
        ad_copy_url,
        category
      )
    `)
    .eq("status", "active")
    .order("scheduled_mail_date", { ascending: true })
    .limit(1)
    .single()

  const availableSpots = currentMailing?.ad_spots?.filter(
    (spot: { status: string }) => spot.status === "available"
  ).length || 0

  const totalSpots = 12

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-emerald-50 to-white py-20 md:py-28">
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              Limited to 12 Businesses Per Mailing
            </Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              One ZIP Code. One Category.{" "}
              <span className="text-emerald-600">Zero Competition.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
              Be the only business in your category to reach 5,000 households this quarter.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/mailings">
                <Button size="lg" className="text-lg">
                  Claim Your Category
                </Button>
              </Link>
              <Link href="#see-it">
                <Button size="lg" variant="outline" className="text-lg">
                  See the Postcard
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Background decoration */}
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-emerald-100/50 blur-3xl" />
      </section>

      {/* THE FORMAT SECTION */}
      <section className="container py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              The 9×12 Mega-Postcard
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              The largest postcard USPS allows. Too big to miss, too useful to toss.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden border-2 border-emerald-100">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                  <Home className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="text-3xl font-bold text-emerald-600">5,000</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  homes in a single ZIP code
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 border-emerald-100">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                  <Shield className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="text-3xl font-bold text-emerald-600">12</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  businesses total—one per category
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 border-emerald-100">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                  <Clock className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="text-3xl font-bold text-emerald-600">14-21</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  day shelf life on the counter
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 border-emerald-100">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="text-3xl font-bold text-emerald-600">$675</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  instead of $4,500+ to mail yourself
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="border-y bg-muted/30 py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How It Works</h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mb-3 text-xl font-semibold">Pick your category</h3>
              <p className="text-muted-foreground">
                Choose from 12 business categories. If yours is open, it's yours for the quarter.
              </p>
            </div>
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mb-3 text-xl font-semibold">Send us your ad</h3>
              <p className="text-muted-foreground">
                Upload your design or we'll help you create one. You get a 3"×4" spot plus a QR code that tracks every scan.
              </p>
            </div>
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mb-3 text-xl font-semibold">Hit 5,000 mailboxes</h3>
              <p className="text-muted-foreground">
                Your postcard arrives the same week as 11 other non-competing local businesses. Homeowners see one clear option per category.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THE CATEGORIES SECTION */}
      <section className="container py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Twelve spots. One business each. No overlap.
            </h2>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((category) => {
              // Check if this category is claimed (simplified - in real app, would check against ad_spots)
              const isClaimed = false // Placeholder - would be dynamic based on currentMailing?.ad_spots

              return (
                <div
                  key={category.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-4 transition-colors",
                    isClaimed
                      ? "border-gray-200 bg-gray-50"
                      : "border-emerald-200 bg-emerald-50/50 hover:border-emerald-300 hover:bg-emerald-50"
                  )}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <div className="flex-1">
                    <p className={cn(
                      "font-medium",
                      isClaimed ? "text-gray-500" : "text-gray-900"
                    )}>
                      {category.name}
                    </p>
                  </div>
                  <Badge
                    variant={isClaimed ? "secondary" : "default"}
                    className={cn(
                      isClaimed
                        ? "bg-gray-200 text-gray-600"
                        : "bg-emerald-600 hover:bg-emerald-600"
                    )}
                  >
                    {isClaimed ? "Claimed" : "Available"}
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* THE MATH SECTION */}
      <section className="border-y bg-slate-900 py-20 text-white md:py-28">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              The Math
            </h2>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {/* DIY Column */}
              <Card className="border-slate-700 bg-slate-800">
                <CardContent className="pt-6">
                  <h3 className="mb-6 text-center text-xl font-semibold text-slate-300">
                    Do it yourself
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                      <span className="text-slate-400">Design</span>
                      <span className="font-medium text-white">$300</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                      <span className="text-slate-400">Printing 5,000 9×12 postcards</span>
                      <span className="font-medium text-white">$1,800</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                      <span className="text-slate-400">USPS postage</span>
                      <span className="font-medium text-white">$2,100</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                      <span className="text-slate-400">Mailing list</span>
                      <span className="font-medium text-white">$300</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-lg font-semibold text-white">Total</span>
                      <span className="text-2xl font-bold text-red-400">~$4,500</span>
                    </div>
                    <div className="mt-4 text-center">
                      <span className="text-sm text-slate-400">$0.90 per household</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Our Way Column */}
              <Card className="border-emerald-500 bg-emerald-600">
                <CardContent className="flex h-full flex-col items-center justify-center pt-6 text-center">
                  <h3 className="mb-4 text-xl font-semibold text-emerald-100">
                    Do it with us
                  </h3>
                  <div className="text-6xl font-bold text-white">$675</div>
                  <div className="mt-2 rounded-full bg-white/20 px-4 py-1">
                    <span className="text-lg font-semibold text-white">Just $0.13 per household</span>
                  </div>
                  <p className="mt-4 text-emerald-100">
                    Same households. Same format. One-twelfth the cost.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET SECTION */}
      <section className="container py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            What You Get
          </h2>

          <div className="mt-12 space-y-4">
            {[
              { icon: Mail, text: "Your ad on 5,000 postcards" },
              { icon: Lock, text: "Category exclusivity (no competitors on your mailer)" },
              { icon: QrCode, text: "Unique QR code linked to your landing page" },
              { icon: BarChart3, text: "Real-time scan tracking dashboard" },
              { icon: CheckCircle, text: "Proof of delivery" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border bg-card p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <item.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEE IT SECTION */}
      <section id="see-it" className="border-y bg-muted/30 py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              See It
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              Preview the actual postcard with current advertisers and available spots
            </p>

            <div className="mt-12">
              <LandingPostcardPreview mailing={currentMailing} />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="container py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            FAQ
          </h2>

          <Accordion type="single" collapsible className="mt-12">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left text-base font-medium">
                What if my category is already taken?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Join the waitlist. You'll get first priority for the next quarterly mailing.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left text-base font-medium">
                What if the postcard doesn't fill up?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We don't mail partial postcards. If we don't fill all 12 spots, you don't pay.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left text-base font-medium">
                Can I be on multiple mailings?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes. Each ZIP code runs separately. Claim your category in as many as you want.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left text-base font-medium">
                Do you design the ad for me?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We can help. Upload what you have or describe your offer and we'll work with you.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CURRENT MAILING SECTION */}
      <section className="border-t bg-emerald-50 py-20 md:py-28">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Current Mailing
            </h2>

            {currentMailing ? (
              <div className="mt-8">
                <Card className="mx-auto max-w-md border-2 border-emerald-200">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-bold">{currentMailing.title}</h3>
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Mail date:{" "}
                          {new Date(currentMailing.scheduled_mail_date).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>ZIP: {currentMailing.zip_codes?.join(", ")}</span>
                      </div>
                    </div>
                    <div className="mt-6 rounded-lg bg-emerald-100 p-4">
                      <p className="text-2xl font-bold text-emerald-700">
                        {availableSpots} of {totalSpots} spots available
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-8">
                  <Link href="/mailings">
                    <Button size="lg" className="text-lg">
                      Claim Your Category
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-8">
                <p className="text-muted-foreground">
                  No active mailing at this time. Check back soon!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t bg-slate-900 py-12 text-slate-300">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-2">
            <Mail className="h-6 w-6 text-emerald-500" />
            <span className="text-lg font-bold text-white">Emerald Coast Marketing Wave</span>
          </div>
          <p className="mt-4 text-sm">
            Serving Niceville, Navarre, and Gulf Breeze
          </p>
          <p className="mt-4 text-sm">
            Questions?{" "}
            <a
              href="mailto:chris@libertysprinciples.com"
              className="text-emerald-400 hover:text-emerald-300 hover:underline"
            >
              chris@libertysprinciples.com
            </a>
          </p>
          <p className="mt-6 text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Emerald Coast Marketing Wave. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
