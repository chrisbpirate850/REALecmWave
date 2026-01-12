"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  TrendingUp,
  Calendar,
  MapPin,
  QrCode,
  Gift,
  Info,
  ArrowRight,
  Users,
  Target,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { AnalyticsChart } from "@/components/analytics-chart"

// Generate realistic mock data for the past 21 days
function generateMockChartData() {
  const data = []
  const today = new Date()

  for (let i = 20; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Generate realistic scan numbers - peak in first week, then taper
    let baseScans
    if (i > 14) {
      baseScans = Math.floor(Math.random() * 5) + 2 // Days 15-21: low initial
    } else if (i > 7) {
      baseScans = Math.floor(Math.random() * 15) + 20 // Days 8-14: peak
    } else {
      baseScans = Math.floor(Math.random() * 10) + 5 // Days 1-7: tapering
    }

    data.push({
      date: date.toLocaleDateString("en-US"),
      scans: baseScans,
    })
  }

  return data
}

const mockChartData = generateMockChartData()
const totalScans = mockChartData.reduce((sum, d) => sum + d.scans, 0)

// Mock spot data
const MOCK_SPOT = {
  mailingTitle: "Niceville Q1 2025",
  side: "front",
  gridPosition: 3,
  status: "active",
  mailDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
  zipCodes: ["32578"],
  estimatedRecipients: 4800,
  scans: totalScans,
  conversions: Math.floor(totalScans * 0.18), // ~18% conversion rate
  landingPageSlug: "demo",
  headline: "New Patient Special - $99 Cleaning & Exam",
}

export default function DemoAnalyticsPage() {
  const daysActive = Math.floor((Date.now() - MOCK_SPOT.mailDate.getTime()) / (1000 * 60 * 60 * 24))
  const scanRate = ((MOCK_SPOT.scans / MOCK_SPOT.estimatedRecipients) * 100).toFixed(2)
  const conversionRate = ((MOCK_SPOT.conversions / MOCK_SPOT.scans) * 100).toFixed(1)
  const costPerScan = (675 / MOCK_SPOT.scans).toFixed(2)
  const costPerConversion = (675 / MOCK_SPOT.conversions).toFixed(2)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader showAuthButtons={false} />

      <main className="container flex-1 py-12">
        {/* Demo Banner */}
        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-blue-800">
              <strong>Demo Mode:</strong> This is a sample analytics view showing detailed campaign performance.
            </span>
            <Link href="/mailings">
              <Button size="sm" className="gap-1">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </AlertDescription>
        </Alert>

        <div className="mb-6">
          <Link href="/demo/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{MOCK_SPOT.mailingTitle}</h1>
            <p className="text-muted-foreground">
              {MOCK_SPOT.side === "front" ? "Front" : "Back"} Side - Position {MOCK_SPOT.gridPosition}
            </p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700">{MOCK_SPOT.status}</Badge>
        </div>

        {/* Key Metrics - Row 1 */}
        <div className="mb-4 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{MOCK_SPOT.scans}</div>
              <p className="text-xs text-muted-foreground">QR code engagements</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <Gift className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{MOCK_SPOT.conversions}</div>
              <p className="text-xs text-muted-foreground">Offers redeemed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scan Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{scanRate}%</div>
              <p className="text-xs text-muted-foreground">Of recipients scanned</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{conversionRate}%</div>
              <p className="text-xs text-muted-foreground">Scans to redemptions</p>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics - Row 2 */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Days Active</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{daysActive}</div>
              <p className="text-xs text-muted-foreground">Since mail date</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Homes Reached</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{MOCK_SPOT.estimatedRecipients.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Estimated recipients</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Per Scan</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">${costPerScan}</div>
              <p className="text-xs text-muted-foreground">$675 / {MOCK_SPOT.scans} scans</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Per Conversion</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">${costPerConversion}</div>
              <p className="text-xs text-muted-foreground">$675 / {MOCK_SPOT.conversions} conversions</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Scan Activity Over Time</CardTitle>
            <CardDescription>Daily QR code scans for your advertisement</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsChart data={mockChartData} />
          </CardContent>
        </Card>

        {/* Campaign Details */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium">Mail Date</div>
                <div className="text-sm text-muted-foreground">
                  {MOCK_SPOT.mailDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Target Areas</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {MOCK_SPOT.zipCodes.join(", ")} (Niceville)
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Ad Position</div>
                <div className="text-sm text-muted-foreground">
                  {MOCK_SPOT.side === "front" ? "Front" : "Back"} Side, Spot {MOCK_SPOT.gridPosition}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Investment</div>
                <div className="text-sm text-muted-foreground">$675 per mailing</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Landing Page</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium">Status</div>
                <Badge variant="default" className="mt-1">
                  Published
                </Badge>
              </div>
              <div>
                <div className="text-sm font-medium">Headline</div>
                <div className="text-sm text-muted-foreground">{MOCK_SPOT.headline}</div>
              </div>
              <div>
                <div className="text-sm font-medium">URL</div>
                <div className="break-all text-sm text-muted-foreground">/offers/{MOCK_SPOT.landingPageSlug}</div>
              </div>
              <Link href="/demo/landing">
                <Button variant="outline" className="w-full bg-transparent">
                  View Landing Page
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* ROI Summary */}
        <Card className="mt-8 border-2 border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              ROI Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">{MOCK_SPOT.conversions}</div>
                <div className="text-sm text-muted-foreground">New Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">${costPerConversion}</div>
                <div className="text-sm text-muted-foreground">Cost per Customer</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600">
                  ${(MOCK_SPOT.conversions * 350).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Est. Revenue (avg $350/customer)</div>
              </div>
            </div>
            <div className="mt-6 text-center text-sm text-muted-foreground">
              Based on an average new patient value of $350, this campaign generated an estimated{" "}
              <strong className="text-emerald-700">
                {((MOCK_SPOT.conversions * 350) / 675 * 100 - 100).toFixed(0)}% ROI
              </strong>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
