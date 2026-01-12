"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

const ZIP_OPTIONS = [
  { value: "32566", label: "32566 - Navarre" },
  { value: "32578", label: "32578 - Niceville" },
  { value: "32561", label: "32561 - Gulf Breeze" },
]

export default function NewMailingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    zipCodes: [] as string[],
    mailDate: "",
    pricePerSpot: "675",
    estimatedRecipients: "5000",
    status: "draft",
  })

  const handleZipToggle = (zip: string) => {
    setFormData(prev => ({
      ...prev,
      zipCodes: prev.zipCodes.includes(zip)
        ? prev.zipCodes.filter(z => z !== zip)
        : [...prev.zipCodes, zip]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create the mailing
      const { data: mailing, error: mailingError } = await supabase
        .from("mailings")
        .insert({
          title: formData.title,
          zip_codes: formData.zipCodes,
          scheduled_mail_date: formData.mailDate,
          price_per_spot: parseFloat(formData.pricePerSpot),
          estimated_recipients: parseInt(formData.estimatedRecipients),
          status: formData.status,
        })
        .select()
        .single()

      if (mailingError) throw mailingError

      // Create 12 ad spots (6 front, 6 back)
      const adSpots = []
      for (let side of ["front", "back"]) {
        for (let gridPos = 1; gridPos <= 6; gridPos++) {
          const position = side === "front" ? gridPos : gridPos + 6
          adSpots.push({
            mailing_id: mailing.id,
            position,
            side,
            grid_position: gridPos,
            status: "available",
            price: parseFloat(formData.pricePerSpot),
          })
        }
      }

      const { error: spotsError } = await supabase
        .from("ad_spots")
        .insert(adSpots)

      if (spotsError) throw spotsError

      router.push(`/admin/mailings/${mailing.id}`)
    } catch (err: any) {
      console.error("Error creating mailing:", err)
      setError(err.message || "Failed to create mailing")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/admin/mailings">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Mailings
          </Button>
        </Link>
      </div>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create New Mailing</CardTitle>
            <CardDescription>
              Set up a new postcard campaign. 12 ad spots will be created automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Q2 2026 - Navarre"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Target ZIP Codes</Label>
                <div className="flex flex-wrap gap-2">
                  {ZIP_OPTIONS.map((zip) => (
                    <button
                      key={zip.value}
                      type="button"
                      onClick={() => handleZipToggle(zip.value)}
                      className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
                        formData.zipCodes.includes(zip.value)
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {zip.label}
                    </button>
                  ))}
                </div>
                {formData.zipCodes.length === 0 && (
                  <p className="text-xs text-muted-foreground">Select at least one ZIP code</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mailDate">Scheduled Mail Date</Label>
                <Input
                  id="mailDate"
                  type="date"
                  value={formData.mailDate}
                  onChange={(e) => setFormData({ ...formData, mailDate: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pricePerSpot">Price Per Spot ($)</Label>
                  <Input
                    id="pricePerSpot"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.pricePerSpot}
                    onChange={(e) => setFormData({ ...formData, pricePerSpot: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedRecipients">Estimated Recipients</Label>
                  <Input
                    id="estimatedRecipients"
                    type="number"
                    min="0"
                    value={formData.estimatedRecipients}
                    onChange={(e) => setFormData({ ...formData, estimatedRecipients: e.target.value })}
                    required
                  />
                </div>
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
                    <SelectItem value="active">Active (Accepting Orders)</SelectItem>
                    <SelectItem value="printing">Printing</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading || formData.zipCodes.length === 0}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Mailing
                </Button>
                <Link href="/admin/mailings">
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
