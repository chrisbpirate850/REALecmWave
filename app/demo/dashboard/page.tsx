"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Mail,
  QrCode,
  TrendingUp,
  Calendar,
  ExternalLink,
  Gift,
  MapPin,
  ArrowLeft,
  Info,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { AnalyticsChart } from "@/components/analytics-chart"

// Generate realistic mock data for the past 14 days
function generateMockChartData() {
  const data = []
  const today = new Date()

  for (let i = 13; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Generate realistic scan numbers - higher at start (post-mail), tapering off
    const baseScans = Math.max(1, Math.floor(25 - i * 1.5))
    const variance = Math.floor(Math.random() * 8) - 4
    const scans = Math.max(0, baseScans + variance)

    data.push({
      date: date.toLocaleDateString("en-US"),
      scans,
    })
  }

  return data
}

// Mock data for the demo
const MOCK_BUSINESS = {
  name: "Emerald Coast Dental",
  category: "Dental & Med-Spa",
}

const MOCK_AD_SPOTS = [
  {
    id: "demo-1",
    mailingTitle: "Niceville Q1 2025",
    side: "front",
    gridPosition: 3,
    status: "active",
    mailDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
    zipCodes: ["32578"],
    estimatedRecipients: 4800,
    scans: 127,
    conversions: 23,
    hasLandingPage: true,
    slug: "demo",
  },
  {
    id: "demo-2",
    mailingTitle: "Gulf Breeze Q1 2025",
    side: "back",
    gridPosition: 2,
    status: "active",
    mailDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    zipCodes: ["32561"],
    estimatedRecipients: 4500,
    scans: 84,
    conversions: 12,
    hasLandingPage: true,
    slug: "demo",
  },
]

const mockChartData = generateMockChartData()
const totalScans = MOCK_AD_SPOTS.reduce((sum, spot) => sum + spot.scans, 0)
const totalConversions = MOCK_AD_SPOTS.reduce((sum, spot) => sum + spot.conversions, 0)

export default function DemoDashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader showAuthButtons={false} />

      <main className="container flex-1 py-12">
        {/* Demo Banner */}
        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-blue-800">
              <strong>Demo Mode:</strong> This is a sample dashboard showing what advertisers see after purchasing an ad spot.
            </span>
            <Link href="/mailings">
              <Button size="sm" className="gap-1">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </AlertDescription>
        </Alert>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Welcome back, {MOCK_BUSINESS.name}</h1>
          <p className="text-muted-foreground">Track your campaigns and view analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ad Spots</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{MOCK_AD_SPOTS.length}</div>
              <p className="text-xs text-muted-foreground">Across all mailings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">QR Scans</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalScans}</div>
              <p className="text-xs text-muted-foreground">Landing page views</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <Gift className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{totalConversions}</div>
              <p className="text-xs text-muted-foreground">Offers redeemed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{MOCK_AD_SPOTS.filter(s => s.status === "active").length}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Scan Activity Over Time</CardTitle>
            <CardDescription>Combined QR code scans across all your advertisements</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart data={mockChartData} />
          </CardContent>
        </Card>

        {/* Ad Spots List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Ad Spots</CardTitle>
            <CardDescription>Manage your advertisements and view performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_AD_SPOTS.map((spot) => {
                const statusColor = "bg-emerald-100 text-emerald-700"
                const mailDate = new Date(spot.mailDate)
                const daysActive = Math.floor((Date.now() - mailDate.getTime()) / (1000 * 60 * 60 * 24))
                const scanRate = ((spot.scans / spot.estimatedRecipients) * 100).toFixed(2)
                const conversionRate = spot.scans > 0 ? ((spot.conversions / spot.scans) * 100).toFixed(1) : "0"

                return (
                  <div key={spot.id} className="rounded-lg border p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{spot.mailingTitle}</h3>
                        <p className="text-sm text-muted-foreground">
                          {spot.side === "front" ? "Front" : "Back"} Side - Position {spot.gridPosition}
                        </p>
                      </div>
                      <Badge className={statusColor}>{spot.status}</Badge>
                    </div>

                    <div className="mb-3 grid grid-cols-2 gap-4 text-sm md:grid-cols-5">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {mailDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{spot.zipCodes.join(", ")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <QrCode className="h-4 w-4 text-muted-foreground" />
                        <span>{spot.scans} scans ({scanRate}%)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Gift className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium text-emerald-600">
                          {spot.conversions} redeemed ({conversionRate}%)
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>{daysActive} days active</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link href="/demo/analytics">
                        <Button variant="outline" size="sm">
                          View Full Analytics
                        </Button>
                      </Link>
                      <Link href="/demo/landing">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="mr-1 h-3 w-3" />
                          View Landing Page
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" disabled>
                        Download QR Code
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="mt-12 rounded-lg border-2 border-emerald-200 bg-emerald-50 p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold">Ready to reach 5,000 households?</h2>
          <p className="mb-6 text-muted-foreground">
            Claim your category on an upcoming mailing and start tracking your results.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/mailings">
              <Button size="lg" className="gap-2">
                View Available Mailings
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="lg" variant="outline">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
