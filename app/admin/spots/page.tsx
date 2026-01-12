"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Grid3X3, MoreHorizontal, Loader2, Search, Image as ImageIcon, ExternalLink, RefreshCw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface AdSpot {
  id: string
  position: number
  side: string
  grid_position: number
  status: string
  price: number
  advertiser_id: string | null
  artwork_url: string | null
  purchased_at: string | null
  mailing_id: string
  mailings: {
    id: string
    title: string
    scheduled_mail_date: string
    status: string
  }
  profiles?: {
    id: string
    business_name: string
    email: string
  }
}

interface Mailing {
  id: string
  title: string
}

const STATUS_COLORS: Record<string, string> = {
  available: "bg-gray-100 text-gray-700",
  reserved: "bg-yellow-100 text-yellow-700",
  purchased: "bg-emerald-100 text-emerald-700",
  uploaded: "bg-blue-100 text-blue-700",
}

export default function AdminSpotsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [spots, setSpots] = useState<AdSpot[]>([])
  const [mailings, setMailings] = useState<Mailing[]>([])
  const [filteredSpots, setFilteredSpots] = useState<AdSpot[]>([])

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [mailingFilter, setMailingFilter] = useState("all")

  // Dialog state
  const [selectedSpot, setSelectedSpot] = useState<AdSpot | null>(null)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<"release" | "view" | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [spots, searchTerm, statusFilter, mailingFilter])

  const fetchData = async () => {
    setLoading(true)

    const [spotsResult, mailingsResult] = await Promise.all([
      supabase
        .from("ad_spots")
        .select(`
          *,
          mailings (
            id,
            title,
            scheduled_mail_date,
            status
          ),
          profiles:advertiser_id (
            id,
            business_name,
            email
          )
        `)
        .order("purchased_at", { ascending: false, nullsFirst: false }),
      supabase
        .from("mailings")
        .select("id, title")
        .order("scheduled_mail_date", { ascending: false }),
    ])

    if (spotsResult.data) {
      setSpots(spotsResult.data)
    }
    if (mailingsResult.data) {
      setMailings(mailingsResult.data)
    }

    setLoading(false)
  }

  const applyFilters = () => {
    let filtered = [...spots]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        s =>
          s.profiles?.business_name?.toLowerCase().includes(term) ||
          s.profiles?.email?.toLowerCase().includes(term) ||
          s.mailings?.title?.toLowerCase().includes(term)
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(s => s.status === statusFilter)
    }

    // Mailing filter
    if (mailingFilter !== "all") {
      filtered = filtered.filter(s => s.mailing_id === mailingFilter)
    }

    setFilteredSpots(filtered)
  }

  const handleReleaseSpot = async () => {
    if (!selectedSpot) return
    setActionLoading(true)

    const { error } = await supabase
      .from("ad_spots")
      .update({
        status: "available",
        advertiser_id: null,
        artwork_url: null,
        purchased_at: null,
      })
      .eq("id", selectedSpot.id)

    if (!error) {
      fetchData()
    }

    setActionLoading(false)
    setActionDialogOpen(false)
    setSelectedSpot(null)
    setActionType(null)
  }

  const openActionDialog = (spot: AdSpot, type: "release" | "view") => {
    setSelectedSpot(spot)
    setActionType(type)
    setActionDialogOpen(true)
  }

  const statusCounts = {
    all: spots.length,
    available: spots.filter(s => s.status === "available").length,
    reserved: spots.filter(s => s.status === "reserved").length,
    purchased: spots.filter(s => s.status === "purchased").length,
    uploaded: spots.filter(s => s.status === "uploaded").length,
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
        <h1 className="text-3xl font-bold">Ad Spots</h1>
        <p className="text-muted-foreground">Manage all advertising spots across mailings</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Total", value: statusCounts.all, color: "bg-slate-100 text-slate-700" },
          { label: "Available", value: statusCounts.available, color: "bg-gray-100 text-gray-700" },
          { label: "Reserved", value: statusCounts.reserved, color: "bg-yellow-100 text-yellow-700" },
          { label: "Purchased", value: statusCounts.purchased, color: "bg-emerald-100 text-emerald-700" },
          { label: "Uploaded", value: statusCounts.uploaded, color: "bg-blue-100 text-blue-700" },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <Badge className={stat.color}>{stat.value}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by business name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="purchased">Purchased</SelectItem>
                <SelectItem value="uploaded">Uploaded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={mailingFilter} onValueChange={setMailingFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Mailing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Mailings</SelectItem>
                {mailings.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={fetchData}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Spots List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-5 w-5" />
            Ad Spots
          </CardTitle>
          <CardDescription>
            Showing {filteredSpots.length} of {spots.length} spots
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSpots.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
              <Grid3X3 className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No Spots Found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all" || mailingFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create a mailing to generate ad spots"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSpots.map((spot) => (
                <div
                  key={spot.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    {/* Artwork thumbnail */}
                    <div className="relative h-12 w-16 overflow-hidden rounded border bg-muted">
                      {spot.artwork_url ? (
                        <img
                          src={spot.artwork_url}
                          alt="Artwork"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {spot.mailings?.title} - Position {spot.position}
                        </span>
                        <Badge className={STATUS_COLORS[spot.status]}>
                          {spot.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{spot.side.toUpperCase()} - Grid {spot.grid_position}</span>
                        <span>${spot.price}</span>
                        {spot.profiles && (
                          <>
                            <span>·</span>
                            <span>{spot.profiles.business_name}</span>
                          </>
                        )}
                      </div>
                      {spot.purchased_at && (
                        <p className="text-xs text-muted-foreground">
                          Purchased: {new Date(spot.purchased_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/admin/mailings/${spot.mailing_id}`}>
                      <Button variant="outline" size="sm">
                        View Mailing
                      </Button>
                    </Link>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {spot.artwork_url && (
                          <DropdownMenuItem
                            onClick={() => window.open(spot.artwork_url!, "_blank")}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Artwork
                          </DropdownMenuItem>
                        )}
                        {(spot.status === "purchased" || spot.status === "uploaded" || spot.status === "reserved") && (
                          <DropdownMenuItem
                            onClick={() => openActionDialog(spot, "release")}
                            className="text-red-600"
                          >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Release Spot
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Release Confirmation Dialog */}
      <Dialog open={actionDialogOpen && actionType === "release"} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release Ad Spot?</DialogTitle>
            <DialogDescription>
              This will make the spot available again and remove all associated data including artwork.
              {selectedSpot?.profiles && (
                <span className="block mt-2 font-medium">
                  Current owner: {selectedSpot.profiles.business_name} ({selectedSpot.profiles.email})
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReleaseSpot}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Release Spot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
