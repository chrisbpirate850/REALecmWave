"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  Loader2,
  Copy,
  Check,
  Mail,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Mailing {
  id: string
  title: string
  scheduled_mail_date: string
  price_per_spot: number
}

interface AdSpot {
  id: string
  position: number
  side: string
  grid_position: number
  status: string
  price: number
}

interface GeneratedLink {
  url: string
  spotId: string
  mailingTitle: string
  price: number
  email: string
  createdAt: Date
}

export default function CustomCheckoutPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [mailings, setMailings] = useState<Mailing[]>([])
  const [spots, setSpots] = useState<AdSpot[]>([])
  const [generatedLinks, setGeneratedLinks] = useState<GeneratedLink[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [selectedMailing, setSelectedMailing] = useState<string>("")
  const [selectedSpot, setSelectedSpot] = useState<string>("")
  const [customPrice, setCustomPrice] = useState<string>("")
  const [advertiserEmail, setAdvertiserEmail] = useState<string>("")

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

  useEffect(() => {
    // Set default price when spot is selected
    if (selectedSpot && spots.length > 0) {
      const spot = spots.find(s => s.id === selectedSpot)
      if (spot && !customPrice) {
        setCustomPrice(String(spot.price))
      }
    }
  }, [selectedSpot])

  const fetchMailings = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("mailings")
      .select("id, title, scheduled_mail_date, price_per_spot")
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
      .select("id, position, side, grid_position, status, price")
      .eq("mailing_id", mailingId)
      .eq("status", "available")
      .order("position", { ascending: true })

    if (data) {
      setSpots(data)
    }
  }

  const generateCheckoutLink = async () => {
    if (!selectedMailing || !selectedSpot || !customPrice || !advertiserEmail) {
      setError("Please fill in all fields")
      return
    }

    setGenerating(true)
    setError(null)

    try {
      const response = await fetch("/api/custom-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotId: selectedSpot,
          mailingId: selectedMailing,
          price: parseFloat(customPrice),
          email: advertiserEmail,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate checkout link")
      }

      const mailing = mailings.find(m => m.id === selectedMailing)

      setGeneratedLinks(prev => [
        {
          url: data.url,
          spotId: selectedSpot,
          mailingTitle: mailing?.title || "",
          price: parseFloat(customPrice),
          email: advertiserEmail,
          createdAt: new Date(),
        },
        ...prev,
      ])

      // Reset form
      setSelectedSpot("")
      setCustomPrice("")
      setAdvertiserEmail("")

      // Refresh spots
      fetchSpots(selectedMailing)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const selectedMailingData = mailings.find(m => m.id === selectedMailing)

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
        <h1 className="text-3xl font-bold">Custom Checkout</h1>
        <p className="text-muted-foreground">
          Generate payment links with negotiated pricing for advertisers
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Generator Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Generate Payment Link
            </CardTitle>
            <CardDescription>
              Create a custom checkout link for a negotiated price
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label>Select Mailing</Label>
              <Select value={selectedMailing} onValueChange={setSelectedMailing}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a mailing..." />
                </SelectTrigger>
                <SelectContent>
                  {mailings.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.title} - ${m.price_per_spot}/spot
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Available Spot</Label>
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
                      Position {s.position} ({s.side.toUpperCase()} - Grid {s.grid_position}) - ${s.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedMailing && spots.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  All spots in this mailing are sold or reserved
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Advertiser Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="advertiser@example.com"
                value={advertiserEmail}
                onChange={e => setAdvertiserEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Receipt will be sent to this email
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Custom Price ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  value={customPrice}
                  onChange={e => setCustomPrice(e.target.value)}
                  className="pl-9"
                />
              </div>
              {selectedMailingData && (
                <p className="text-xs text-muted-foreground">
                  Standard price: ${selectedMailingData.price_per_spot}
                </p>
              )}
            </div>

            <Button
              onClick={generateCheckoutLink}
              disabled={generating || !selectedMailing || !selectedSpot || !customPrice || !advertiserEmail}
              className="w-full"
            >
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LinkIcon className="mr-2 h-4 w-4" />
              )}
              Generate Payment Link
            </Button>
          </CardContent>
        </Card>

        {/* Generated Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Generated Links
            </CardTitle>
            <CardDescription>
              Recently created payment links (this session only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedLinks.length === 0 ? (
              <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
                <LinkIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No links generated yet
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {generatedLinks.map((link, index) => (
                  <div
                    key={index}
                    className="rounded-lg border p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{link.mailingTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {link.email}
                        </p>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700">
                        ${link.price}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={link.url}
                        readOnly
                        className="text-xs"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(link.url, String(index))}
                      >
                        {copied === String(index) ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(link.url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Created {link.createdAt.toLocaleTimeString()}
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
