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
import { SiteFooter } from "@/components/site-footer"
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
            <div className="mt-4 flex items-center justify-center">
              <img
                src="/100%25 U.S. Army Combat Veteran Owned.png"
                alt=""
                width={100}
                height={100}
              />
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/mailings">
                <Button size="lg" className="text-lg">
                  Claim Your Category
                </Button>
              </Link>
              <Link href="/demo/dashboard">
                <Button size="lg" variant="outline" className="text-lg">
                  See Demo Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Background decoration - blurred circles */}
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-emerald-100/50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-emerald-100/50 blur-3xl" />

        {/* Animated flowing wave SVG - positioned at bottom */}
        <div className="absolute inset-x-0 bottom-0 z-0 overflow-hidden">
          <svg
            viewBox="0 0 1440 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[120%] -ml-[10%] h-auto min-w-[800px]"
            preserveAspectRatio="none"
          >
            {/* Back wave - slowest */}
            <path
              d="M0,192L48,176C96,160,192,128,288,133.3C384,139,480,181,576,192C672,203,768,181,864,154.7C960,128,1056,96,1152,101.3C1248,107,1344,149,1392,170.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              className="fill-emerald-100/40 animate-wave-slow"
            />
            {/* Middle wave - medium speed */}
            <path
              d="M0,256L48,245.3C96,235,192,213,288,208C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,213.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              className="fill-emerald-200/30 animate-wave-medium"
            />
            {/* Front wave - fastest */}
            <path
              d="M0,288L48,282.7C96,277,192,267,288,272C384,277,480,299,576,293.3C672,288,768,256,864,250.7C960,245,1056,267,1152,272C1248,277,1344,267,1392,261.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              className="fill-white animate-wave-fast"
            />
          </svg>
        </div>
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
              { icon: Mail, text: "Your ad on 5,000 postcards", link: null },
              { icon: Lock, text: "Category exclusivity (no competitors on your mailer)", link: null },
              { icon: QrCode, text: "Unique QR code linked to your landing page", link: "/demo/landing", linkText: "See example" },
              { icon: BarChart3, text: "Real-time scan tracking dashboard", link: "/demo/dashboard", linkText: "See demo" },
              { icon: CheckCircle, text: "Proof of delivery", link: null },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border bg-card p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <item.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <p className="flex-1 font-medium">{item.text}</p>
                {item.link && (
                  <Link href={item.link}>
                    <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                      {item.linkText} →
                    </Button>
                  </Link>
                )}
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

      <SiteFooter />
    </div>
  )
}
