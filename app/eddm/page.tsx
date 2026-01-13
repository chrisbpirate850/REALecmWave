"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  MapPin,
  Home,
  Users,
  DollarSign,
  ExternalLink,
  Map,
  Calculator,
  FileText,
  ArrowRight,
  Info,
  CheckCircle,
  Truck,
  Mail,
  Target,
  MousePointer,
  ClipboardList,
  CreditCard,
} from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"

// Coverage area data for Emerald Coast
const COVERAGE_AREAS = [
  {
    name: "Navarre",
    zipCode: "32566",
    households: 5200,
    avgIncome: "$72,000",
    avgAge: "38",
    avgHouseholdSize: "2.6",
    description: "Growing beach community with young families and military personnel from nearby bases.",
    mapColor: "bg-blue-500",
  },
  {
    name: "Niceville",
    zipCode: "32578",
    households: 4800,
    avgIncome: "$85,000",
    avgAge: "42",
    avgHouseholdSize: "2.4",
    description: "Established family community near Eglin AFB with higher household incomes.",
    mapColor: "bg-emerald-500",
  },
  {
    name: "Gulf Breeze",
    zipCode: "32561",
    households: 4500,
    avgIncome: "$95,000",
    avgAge: "45",
    avgHouseholdSize: "2.3",
    description: "Affluent coastal community with established homeowners and retirees.",
    mapColor: "bg-amber-500",
  },
]

// EDDM pricing info
const EDDM_RATES = {
  retailPostage: 0.2128, // per piece for EDDM Retail
  minPieces: 200,
  maxPiecesPerDay: 5000,
}

export default function EDDMResourcesPage() {
  const [selectedZip, setSelectedZip] = useState<string | null>(null)
  const [calculatorPieces, setCalculatorPieces] = useState(5000)

  const estimatedPostage = calculatorPieces * EDDM_RATES.retailPostage

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-100">
              USPS Every Door Direct Mail
            </Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              EDDM Route Planning{" "}
              <span className="text-blue-600">Resources</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
              Use USPS Every Door Direct Mail to reach every household in targeted ZIP codes.
              Access the official route selection tool and plan your campaigns.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://eddm.usps.com/eddm/select-routes.htm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="gap-2 text-lg">
                  <Map className="h-5 w-5" />
                  Open USPS Route Tool
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
              <Link href="/mailings">
                <Button size="lg" variant="outline" className="text-lg">
                  View Our Mailings
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Background decoration */}
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />
      </section>

      {/* QUICK ACCESS SECTION */}
      <section className="container py-16">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Quick Access: Our Coverage Areas
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Click any area to open the USPS EDDM tool pre-loaded with that ZIP code
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {COVERAGE_AREAS.map((area) => (
              <Card
                key={area.zipCode}
                className="group relative overflow-hidden transition-all hover:shadow-lg"
              >
                <div className={`absolute left-0 top-0 h-1 w-full ${area.mapColor}`} />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        {area.name}
                      </CardTitle>
                      <CardDescription className="mt-1 text-lg font-semibold">
                        ZIP {area.zipCode}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      ~{area.households.toLocaleString()} homes
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {area.description}
                  </p>
                  <div className="mb-4 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-md bg-muted p-2">
                      <div className="font-semibold">{area.avgIncome}</div>
                      <div className="text-muted-foreground">Avg Income</div>
                    </div>
                    <div className="rounded-md bg-muted p-2">
                      <div className="font-semibold">{area.avgAge}</div>
                      <div className="text-muted-foreground">Avg Age</div>
                    </div>
                    <div className="rounded-md bg-muted p-2">
                      <div className="font-semibold">{area.avgHouseholdSize}</div>
                      <div className="text-muted-foreground">HH Size</div>
                    </div>
                  </div>
                  <a
                    href={`https://eddm.usps.com/eddm/select-routes.htm?searchType=zip&searchVal=${area.zipCode}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full gap-2" variant="outline">
                      Select Routes in {area.zipCode}
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT IS EDDM SECTION */}
      <section className="border-y bg-muted/30 py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                What is Every Door Direct Mail?
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                EDDM is a USPS service that lets you send mail to every address in selected postal routes
                without needing a mailing list or individual addresses.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold">No Mailing List</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Target by geography, not individual names
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                    <DollarSign className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold">Low Postage</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Just $0.213 per piece for retail EDDM
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                    <Users className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="font-semibold">Demographic Filters</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Filter by age, income, and household size
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <Truck className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">USPS Delivery</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Reliable delivery to every door on the route
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* HOW TO USE THE TOOL SECTION */}
      <section className="container py-16">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How to Use the USPS EDDM Tool
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Follow these steps to select routes and plan your mailing
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold">Search Location</h3>
              <p className="text-muted-foreground">
                Enter a ZIP code, city, or address to view available carrier routes in that area.
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                <MousePointer className="h-4 w-4" />
                <span>Use search bar at top</span>
              </div>
            </div>

            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold">View Routes</h3>
              <p className="text-muted-foreground">
                Click "Show Table" to see details on each carrier route including household counts and demographics.
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                <FileText className="h-4 w-4" />
                <span>Review route details</span>
              </div>
            </div>

            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold">Filter & Select</h3>
              <p className="text-muted-foreground">
                Use filters (age, income, household size) to narrow routes. Click routes on the map to select them.
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                <ClipboardList className="h-4 w-4" />
                <span>Build your route list</span>
              </div>
            </div>

            <div className="relative">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                4
              </div>
              <h3 className="mb-2 text-xl font-semibold">Review & Order</h3>
              <p className="text-muted-foreground">
                Review your Order Summary with total pieces and cost, then proceed to create your mailing.
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-600">
                <CreditCard className="h-4 w-4" />
                <span>Complete your order</span>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <a
              href="https://eddm.usps.com/eddm/select-routes.htm"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="gap-2">
                <Map className="h-5 w-5" />
                Try the Route Selection Tool
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* COST CALCULATOR SECTION */}
      <section className="border-y bg-slate-900 py-16 text-white">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                EDDM Postage Calculator
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-300">
                Estimate your USPS postage costs for Every Door Direct Mail
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <Card className="border-slate-700 bg-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Calculator className="h-5 w-5" />
                    Postage Estimator
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    EDDM Retail rate: ${EDDM_RATES.retailPostage.toFixed(4)} per piece
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="pieces" className="text-slate-200">
                        Number of pieces (households)
                      </Label>
                      <Input
                        id="pieces"
                        type="number"
                        min={200}
                        max={50000}
                        value={calculatorPieces}
                        onChange={(e) => setCalculatorPieces(Number(e.target.value))}
                        className="mt-2 border-slate-600 bg-slate-700 text-white"
                      />
                      <p className="mt-1 text-xs text-slate-400">
                        Min: 200 pieces | Max: 5,000 per ZIP per day
                      </p>
                    </div>

                    <div className="rounded-lg bg-slate-700 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300">Estimated Postage</span>
                        <span className="text-2xl font-bold text-emerald-400">
                          ${estimatedPostage.toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-slate-400">Per piece</span>
                        <span className="text-slate-300">
                          ${EDDM_RATES.retailPostage.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-700 bg-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Info className="h-5 w-5" />
                    EDDM Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                      <span className="text-slate-300">
                        Minimum 200 pieces, maximum 5,000 per ZIP code per day
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                      <span className="text-slate-300">
                        Mail must be between 6.125" × 11" and 12" × 15"
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                      <span className="text-slate-300">
                        Must weigh 3.3 oz or less (for flats)
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                      <span className="text-slate-300">
                        Bundle in groups of 50-100 pieces by route
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                      <span className="text-slate-300">
                        Drop off at your local Post Office
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* WHY USE OUR SERVICE SECTION */}
      <section className="container py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Use Emerald Coast Marketing Wave?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Skip the complexity of managing your own EDDM campaign
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Card className="border-2 border-slate-200">
              <CardHeader>
                <CardTitle className="text-xl">DIY EDDM Mailing</CardTitle>
                <CardDescription>Do everything yourself</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-red-500">✗</span>
                    Design your own postcard
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-red-500">✗</span>
                    Print 5,000+ pieces ($1,800+)
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-red-500">✗</span>
                    Pay full postage (~$1,065 for 5,000)
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-red-500">✗</span>
                    Bundle and sort by route
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-red-500">✗</span>
                    Deliver to Post Office yourself
                  </li>
                </ul>
                <div className="mt-4 rounded-lg bg-red-50 p-3 text-center">
                  <span className="text-lg font-bold text-red-600">~$4,500+ total</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Mail className="h-5 w-5 text-emerald-600" />
                  ECM Wave Shared Postcard
                </CardTitle>
                <CardDescription>We handle everything</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    Just upload your 3.8" × 3.8" ad
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    Share costs with 11 other businesses
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    Category exclusivity (no competitors)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    QR code tracking included
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    We print, bundle, and mail
                  </li>
                </ul>
                <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-center">
                  <span className="text-lg font-bold text-emerald-600">Just $675 per spot</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Link href="/mailings">
              <Button size="lg" className="gap-2 text-lg">
                View Available Mailings
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* HELPFUL LINKS SECTION */}
      <section className="border-t bg-muted/30 py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-2xl font-bold">USPS Resources</h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <a
                href="https://eddm.usps.com/eddm/select-routes.htm"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted"
              >
                <Map className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Route Selection Tool</div>
                  <div className="text-sm text-muted-foreground">Select and filter routes</div>
                </div>
                <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
              </a>

              <a
                href="https://www.usps.com/business/every-door-direct-mail.htm"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted"
              >
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">EDDM Overview</div>
                  <div className="text-sm text-muted-foreground">Learn about EDDM</div>
                </div>
                <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
              </a>

              <a
                href="https://www.usps.com/business/prices.htm"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-muted"
              >
                <DollarSign className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">USPS Pricing</div>
                  <div className="text-sm text-muted-foreground">Current postage rates</div>
                </div>
                <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
              </a>
            </div>
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
          <p className="mt-4 text-xs text-slate-500">
            A project by{" "}
            <a
              href="https://christopherjbradley.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 hover:underline"
            >
              Christopher J. Bradley
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
