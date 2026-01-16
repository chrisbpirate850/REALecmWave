"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Gift,
  Loader2,
  CheckCircle,
  ExternalLink,
  QrCode,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
  X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Mailing {
  id: string
  title: string
  scheduled_mail_date: string
}

interface AdSpot {
  id: string
  position: number
  side: string
  grid_position: number
  status: string
  category?: string
}

interface AssignedSpot {
  spotId: string
  mailingTitle: string
  email: string
  qrCodeUrl: string
  landingPageUrl: string
  createdAt: Date
}

export default function AssignSpotPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [mailings, setMailings] = useState<Mailing[]>([])
  const [spots, setSpots] = useState<AdSpot[]>([])
  const [assignedSpots, setAssignedSpots] = useState<AssignedSpot[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [selectedMailing, setSelectedMailing] = useState<string>("")
  const [selectedSpot, setSelectedSpot] = useState<string>("")
  const [advertiserEmail, setAdvertiserEmail] = useState<string>("")
  const [businessName, setBusinessName] = useState<string>("")
  const [adCopyUrl, setAdCopyUrl] = useState<string>("")
  const [offerText, setOfferText] = useState<string>("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchMailings()
  }, [])

  useEffect(() => {
    if (selectedMailing) {
      fetchSpots(selectedMailing)
    } else {
      setSpots([])
      setSelectedSpot("")
    }
  }, [selectedMailing])

  const fetchMailings = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("mailings")
      .select("id, title, scheduled_mail_date")
      .in("status", ["draft", "active"])
      .order("scheduled_mail_date", { ascending: true })

    if (data) {
      setMailings(data)
    }
    setLoading(false)
  }

  const fetchSpots = async (mailingId: string) => {
    const { data } = await supabase
      .from("ad_spots")
      .select("id, position, side, grid_position, status, category")
      .eq("mailing_id", mailingId)
      .eq("status", "available")
      .order("position", { ascending: true })

    if (data) {
      setSpots(data)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setAdCopyUrl("") // Clear URL if file is selected
      // Create preview
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin-upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      return data.url
    } catch (err) {
      console.error("File upload failed:", err)
      return null
    } finally {
      setUploading(false)
    }
  }

  const assignSpot = async () => {
    if (!selectedMailing || !selectedSpot || !advertiserEmail) {
      setError("Please select a mailing, spot, and enter an email")
      return
    }

    setAssigning(true)
    setError(null)
    setSuccess(null)

    try {
      // Upload file first if selected
      let finalAdCopyUrl = adCopyUrl
      if (selectedFile) {
        const uploadedUrl = await uploadFile(selectedFile)
        if (uploadedUrl) {
          finalAdCopyUrl = uploadedUrl
        } else {
          throw new Error("Failed to upload artwork file")
        }
      }

      const response = await fetch("/api/assign-spot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotId: selectedSpot,
          mailingId: selectedMailing,
          advertiserEmail,
          businessName,
          adCopyUrl: finalAdCopyUrl,
          offerText,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to assign spot")
      }

      const mailing = mailings.find(m => m.id === selectedMailing)

      setAssignedSpots(prev => [
        {
          spotId: selectedSpot,
          mailingTitle: mailing?.title || "",
          email: advertiserEmail,
          qrCodeUrl: data.qrCodeUrl,
          landingPageUrl: data.landingPageUrl,
          createdAt: new Date(),
        },
        ...prev,
      ])

      setSuccess(`Spot assigned to ${advertiserEmail}! QR code and landing page created.`)

      // Reset form
      setSelectedSpot("")
      setAdvertiserEmail("")
      setBusinessName("")
      setAdCopyUrl("")
      setOfferText("")
      clearFile()

      // Refresh spots
      fetchSpots(selectedMailing)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setAssigning(false)
    }
  }

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Assign Free Spot</h1>
        <p className="text-muted-foreground">
          Give away ad spots without payment (comps, trades, promotions)
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assignment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Assign Spot
            </CardTitle>
            <CardDescription>
              Assign an ad spot to an advertiser without requiring payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-600">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <Label>Select Mailing *</Label>
              <Select value={selectedMailing} onValueChange={setSelectedMailing}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a mailing..." />
                </SelectTrigger>
                <SelectContent>
                  {mailings.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Available Spot *</Label>
              <Select
                value={selectedSpot}
                onValueChange={setSelectedSpot}
                disabled={!selectedMailing || spots.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !selectedMailing
                        ? "Select a mailing first"
                        : spots.length === 0
                        ? "No available spots"
                        : "Choose a spot..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {spots.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      Position {s.position} ({s.side.toUpperCase()} - Grid {s.grid_position})
                      {s.category && ` - ${s.category}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Advertiser Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="advertiser@example.com"
                value={advertiserEmail}
                onChange={e => setAdvertiserEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                placeholder="Joe's Pizza"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Ad Artwork</Label>
              {previewUrl ? (
                <div className="relative rounded-lg border p-2">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-32 w-full object-contain rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={clearFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 truncate">
                    {selectedFile?.name}
                  </p>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Click to upload artwork
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-xs text-muted-foreground">
                Optional - can be added later
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="offerText">Offer/Landing Page Text</Label>
              <Textarea
                id="offerText"
                placeholder="Get 10% off your first order..."
                value={offerText}
                onChange={e => setOfferText(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={assignSpot}
              disabled={assigning || uploading || !selectedMailing || !selectedSpot || !advertiserEmail}
              className="w-full"
            >
              {assigning || uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {uploading ? "Uploading..." : "Assigning..."}
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Assign Free Spot
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recently Assigned */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Recently Assigned
            </CardTitle>
            <CardDescription>
              Spots assigned this session
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignedSpots.length === 0 ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
                <Gift className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No spots assigned yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedSpots.map((spot, index) => (
                  <div
                    key={index}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{spot.mailingTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {spot.email}
                        </p>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700">
                        FREE
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <QrCode className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate flex-1">{spot.qrCodeUrl}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(spot.qrCodeUrl, `qr-${index}`)}
                      >
                        {copied === `qr-${index}` ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Link href={spot.landingPageUrl} target="_blank" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Landing Page
                        </Button>
                      </Link>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Assigned {spot.createdAt.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
