"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { Mail, MapPin, Phone, Info, ArrowRight, Gift, CheckCircle } from "lucide-react"
import Link from "next/link"

// Mock business data
const MOCK_LANDING_PAGE = {
  headline: "New Patient Special - $99 Cleaning & Exam",
  offerDescription:
    "Welcome to Emerald Coast Dental! As a special thank you for receiving our postcard, we're offering new patients a comprehensive cleaning and exam for just $99 (regularly $275). This includes full X-rays, a thorough cleaning, and a personalized treatment plan. Limited time offer - mention this postcard when you call!",
  ctaText: "Claim This Offer",
  businessName: "Emerald Coast Dental",
  phone: "(850) 555-0123",
  email: "appointments@emeraldcoastdental.com",
  zipCodes: ["32578"],
  adImageUrl: "/placeholder.svg", // Using placeholder for demo
}

export default function DemoLandingPage() {
  const [claimed, setClaimed] = useState(false)
  const [showDialog, setShowDialog] = useState(false)

  const handleClaim = () => {
    setClaimed(true)
    setShowDialog(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-emerald-50 to-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="flex items-center gap-2">
            <Mail className="h-6 w-6 text-emerald-600" />
            <span className="text-xl font-bold">Emerald Coast Marketing Wave</span>
          </div>
        </div>
      </header>

      {/* Demo Banner */}
      <div className="border-b bg-blue-50">
        <div className="container py-3">
          <Alert className="border-blue-200 bg-transparent">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-blue-800">
                <strong>Demo Mode:</strong> This is what customers see when they scan your QR code.
              </span>
              <div className="flex gap-2">
                <Link href="/demo/dashboard">
                  <Button size="sm" variant="outline">
                    View Dashboard
                  </Button>
                </Link>
                <Link href="/mailings">
                  <Button size="sm" className="gap-1">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Main Content */}
      <main className="container flex-1 py-12">
        <div className="mx-auto max-w-3xl">
          {/* Featured Badge */}
          <div className="mb-6 text-center">
            <Badge className="bg-emerald-100 text-emerald-700">Featured Local Offer</Badge>
          </div>

          {/* Main Card */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white">
              <CardTitle className="text-center text-3xl">{MOCK_LANDING_PAGE.headline}</CardTitle>
              <CardDescription className="text-center text-lg text-emerald-50">
                {MOCK_LANDING_PAGE.businessName}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Ad Copy Image Placeholder */}
                <div className="overflow-hidden rounded-lg border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100 p-8 shadow-md">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-200">
                      <Gift className="h-10 w-10 text-emerald-600" />
                    </div>
                    <h3 className="mb-2 text-2xl font-bold text-emerald-800">$99</h3>
                    <p className="text-emerald-700">New Patient Special</p>
                    <p className="mt-2 text-sm text-emerald-600">Cleaning & Exam (Reg. $275)</p>
                  </div>
                </div>

                {/* Offer Description */}
                <div>
                  <p className="text-lg leading-relaxed text-foreground">
                    {MOCK_LANDING_PAGE.offerDescription}
                  </p>
                </div>

                {/* Business Info */}
                <div className="rounded-lg border bg-muted/50 p-4">
                  <h3 className="mb-3 font-semibold">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-emerald-600" />
                      <a href={`tel:${MOCK_LANDING_PAGE.phone}`} className="hover:underline">
                        {MOCK_LANDING_PAGE.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-emerald-600" />
                      <a href={`mailto:${MOCK_LANDING_PAGE.email}`} className="hover:underline">
                        {MOCK_LANDING_PAGE.email}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Service Area */}
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 text-emerald-600" />
                    <div>
                      <div className="text-sm font-medium">Serving the Emerald Coast</div>
                      <div className="text-sm text-muted-foreground">
                        Zip codes: {MOCK_LANDING_PAGE.zipCodes.join(", ")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Claim Offer Button */}
                {claimed ? (
                  <div className="rounded-lg border-2 border-emerald-500 bg-emerald-50 p-6 text-center">
                    <CheckCircle className="mx-auto mb-3 h-12 w-12 text-emerald-600" />
                    <h3 className="mb-2 text-xl font-bold text-emerald-800">Offer Claimed!</h3>
                    <p className="text-emerald-700">
                      Show this screen to {MOCK_LANDING_PAGE.businessName} when you visit to redeem your offer.
                    </p>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Claimed on {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                ) : (
                  <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
                    <AlertDialogTrigger asChild>
                      <Button size="lg" className="w-full text-lg">
                        <Gift className="mr-2 h-5 w-5" />
                        {MOCK_LANDING_PAGE.ctaText}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Claim This Offer?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-3">
                          <p>
                            By claiming this offer, you confirm that you will redeem it at{" "}
                            <strong>{MOCK_LANDING_PAGE.businessName}</strong>.
                          </p>
                          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
                            <strong>Important:</strong> Only claim this offer when you are at the business
                            location or ready to make an appointment. This helps the business track their
                            marketing effectiveness.
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClaim}>
                          Yes, Claim Offer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {/* Trust Indicators */}
                <div className="border-t pt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    This offer is brought to you by a trusted local business serving the Emerald Coast
                    community.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* About Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-center text-xl">About This Offer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-muted-foreground">
                You received this offer via a 9x12 postcard mailing to {MOCK_LANDING_PAGE.zipCodes.join(", ")}{" "}
                through Emerald Coast Marketing Wave. This offer is exclusive to residents who received the
                postcard.
              </p>
            </CardContent>
          </Card>

          {/* Advertiser CTA */}
          <Card className="mt-6 border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-6 text-center">
              <h3 className="mb-2 text-lg font-semibold">Are you a local business owner?</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Get your offer in front of 5,000 households with category exclusivity.
              </p>
              <Link href="/mailings">
                <Button variant="outline" className="gap-2">
                  Learn More
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Powered by Emerald Coast Marketing Wave</p>
          <p className="mt-1">Connecting local businesses with the Emerald Coast community</p>
          <p className="mt-3">
            A project by{" "}
            <a
              href="https://christopherjbradley.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:text-emerald-500 hover:underline"
            >
              Christopher J. Bradley
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
