"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { ArrowLeft, Loader2, Trash2, Mail, Send, Calendar, MapPin, Users, Grid3X3 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

const ZIP_OPTIONS = [
  { value: "32566", label: "32566 - Navarre" },
  { value: "32578", label: "32578 - Niceville" },
  { value: "32561", label: "32561 - Gulf Breeze" },
]

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-emerald-100 text-emerald-700",
  printing: "bg-blue-100 text-blue-700",
  sent: "bg-purple-100 text-purple-700",
  completed: "bg-slate-100 text-slate-700",
  cancelled: "bg-red-100 text-red-700",
}

interface AdSpot {
  id: string
  position: number
  side: string
  grid_position: number
  status: string
  price: number
  advertiser_id: string | null
  ad_copy_url: string | null
}

interface Mailing {
  id: string
  title: string
  zip_codes: string[]
  scheduled_mail_date: string
  price_per_spot: number
  estimated_recipients: number
  status: string
  ad_spots: AdSpot[]
}

export default function EditMailingPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mailing, setMailing] = useState<Mailing | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    zipCodes: [] as string[],
    mailDate: "",
    pricePerSpot: "",
    estimatedRecipients: "",
    status: "draft",
  })

  useEffect(() => {
    fetchMailing()
  }, [params.id])

  const fetchMailing = async () => {
    setLoading(true)
    const { data, error } = await supabase
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
          advertiser_id,
          ad_copy_url
        )
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("Error fetching mailing:", error)
      setError("Failed to load mailing: " + error.message)
      setLoading(false)
      return
    }

    setMailing(data)
    setFormData({
      title: data.title,
      zipCodes: data.zip_codes || [],
      mailDate: data.scheduled_mail_date,
      pricePerSpot: String(data.price_per_spot),
      estimatedRecipients: String(data.estimated_recipients),
      status: data.status,
    })
    setLoading(false)
  }

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
    setSaving(true)
    setError(null)

    const { error: updateError } = await supabase
      .from("mailings")
      .update({
        title: formData.title,
        zip_codes: formData.zipCodes,
        scheduled_mail_date: formData.mailDate,
        price_per_spot: parseFloat(formData.pricePerSpot),
        estimated_recipients: parseInt(formData.estimatedRecipients),
        status: formData.status,
      })
      .eq("id", params.id)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    // Update ad spot prices if changed
    const { error: spotsError } = await supabase
      .from("ad_spots")
      .update({ price: parseFloat(formData.pricePerSpot) })
      .eq("mailing_id", params.id)
      .eq("status", "available")

    if (spotsError) {
      console.error("Error updating spot prices:", spotsError)
    }

    setSaving(false)
    fetchMailing()
  }

  const handleMarkAsSent = async () => {
    setSaving(true)
    const { error } = await supabase
      .from("mailings")
      .update({ status: "sent" })
      .eq("id", params.id)

    if (error) {
      setError(error.message)
    } else {
      setFormData(prev => ({ ...prev, status: "sent" }))
      fetchMailing()
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    setDeleting(true)

    // Check if any spots are sold
    const soldSpots = mailing?.ad_spots.filter(
      s => s.status === "purchased" || s.status === "uploaded"
    ).length || 0

    if (soldSpots > 0) {
      setError("Cannot delete mailing with sold spots")
      setDeleting(false)
      return
    }

    // Delete ad spots first
    await supabase
      .from("ad_spots")
      .delete()
      .eq("mailing_id", params.id)

    // Delete mailing
    const { error } = await supabase
      .from("mailings")
      .delete()
      .eq("id", params.id)

    if (error) {
      setError(error.message)
      setDeleting(false)
      return
    }

    router.push("/admin/mailings")
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!mailing) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Mailing not found</h2>
          <Link href="/admin/mailings">
            <Button className="mt-4">Back to Mailings</Button>
          </Link>
        </div>
      </div>
    )
  }

  const soldSpots = mailing.ad_spots.filter(
    s => s.status === "purchased" || s.status === "uploaded"
  ).length
  const availableSpots = mailing.ad_spots.filter(s => s.status === "available").length
  const canDelete = soldSpots === 0

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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Edit Mailing</CardTitle>
                  <CardDescription>Update campaign details</CardDescription>
                </div>
                <Badge className={STATUS_COLORS[mailing.status] || STATUS_COLORS.draft}>
                  {mailing.status}
                </Badge>
              </div>
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
                    <p className="text-xs text-muted-foreground">
                      Only updates available spots
                    </p>
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

                <div className="flex flex-wrap gap-3 pt-4">
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>

                  {mailing.status === "printing" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleMarkAsSent}
                      disabled={saving}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Mark as Sent
                    </Button>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={!canDelete || deleting}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Mailing?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this mailing and all its ad spots.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {deleting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {!canDelete && (
                    <p className="text-xs text-muted-foreground self-center">
                      Cannot delete: {soldSpots} spots sold
                    </p>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Ad Spots */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ad Spots</CardTitle>
                  <CardDescription>
                    {soldSpots} sold · {availableSpots} available
                  </CardDescription>
                </div>
                <Link href={`/admin/mailings/${params.id}/export`}>
                  <Button variant="outline" size="sm">
                    Export for Print
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Front Side */}
                <div>
                  <h4 className="mb-3 text-sm font-medium">Front Side</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {mailing.ad_spots
                      .filter(s => s.side === "front")
                      .sort((a, b) => a.grid_position - b.grid_position)
                      .map((spot) => (
                        <SpotCard key={spot.id} spot={spot} />
                      ))}
                  </div>
                </div>

                {/* Back Side */}
                <div>
                  <h4 className="mb-3 text-sm font-medium">Back Side</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {mailing.ad_spots
                      .filter(s => s.side === "back")
                      .sort((a, b) => a.grid_position - b.grid_position)
                      .map((spot) => (
                        <SpotCard key={spot.id} spot={spot} />
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Campaign Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Mail Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(mailing.scheduled_mail_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">ZIP Codes</p>
                  <p className="text-sm text-muted-foreground">
                    {mailing.zip_codes?.join(", ") || "None selected"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Recipients</p>
                  <p className="text-sm text-muted-foreground">
                    {mailing.estimated_recipients?.toLocaleString()} homes
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Grid3X3 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Spots</p>
                  <p className="text-sm text-muted-foreground">
                    {soldSpots}/{mailing.ad_spots.length} sold
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium">Revenue</p>
                <p className="text-2xl font-bold text-emerald-600">
                  ${(soldSpots * mailing.price_per_spot).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  of ${(mailing.ad_spots.length * mailing.price_per_spot).toLocaleString()} potential
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/admin/mailings/${params.id}/export`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="mr-2 h-4 w-4" />
                  Export for Print
                </Button>
              </Link>
              <Link href={`/mailings/${params.id}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Grid3X3 className="mr-2 h-4 w-4" />
                  View Public Page
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function SpotCard({ spot }: { spot: AdSpot }) {
  const statusColors: Record<string, string> = {
    available: "bg-gray-50 border-gray-200",
    reserved: "bg-yellow-50 border-yellow-200",
    purchased: "bg-emerald-50 border-emerald-200",
    uploaded: "bg-blue-50 border-blue-200",
  }

  return (
    <div
      className={`aspect-square rounded-lg border-2 p-2 text-center ${
        statusColors[spot.status] || statusColors.available
      }`}
    >
      <p className="text-xs font-medium">#{spot.grid_position}</p>
      <p className="text-[10px] text-muted-foreground capitalize">{spot.status}</p>
      {spot.advertiser_id && (
        <p className="mt-1 truncate text-[9px] font-medium text-emerald-600">
          Sold
        </p>
      )}
    </div>
  )
}
