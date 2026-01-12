"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CreditCard,
  Loader2,
  Search,
  Download,
  ExternalLink,
  DollarSign,
  RefreshCw,
  Calendar,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Payment {
  id: string
  amount: number
  status: string
  stripe_payment_intent_id: string | null
  stripe_session_id: string | null
  created_at: string
  user_id: string
  ad_spot_id: string
  profiles?: {
    business_name: string
    email: string
  }
  ad_spots?: {
    position: number
    mailings: {
      title: string
    }
  }
}

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-purple-100 text-purple-700",
}

export default function AdminPaymentsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [payments, searchTerm, statusFilter, dateFilter])

  const fetchPayments = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        profiles:user_id (
          business_name,
          email
        ),
        ad_spots:ad_spot_id (
          position,
          mailings (
            title
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (data) {
      setPayments(data)
    }

    setLoading(false)
  }

  const applyFilters = () => {
    let filtered = [...payments]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        p =>
          p.profiles?.business_name?.toLowerCase().includes(term) ||
          p.profiles?.email?.toLowerCase().includes(term) ||
          p.stripe_payment_intent_id?.toLowerCase().includes(term)
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter)
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date()
      let startDate: Date

      switch (dateFilter) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7))
          break
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1))
          break
        case "quarter":
          startDate = new Date(now.setMonth(now.getMonth() - 3))
          break
        default:
          startDate = new Date(0)
      }

      filtered = filtered.filter(p => new Date(p.created_at) >= startDate)
    }

    setFilteredPayments(filtered)
  }

  const exportCSV = () => {
    const headers = [
      "Date",
      "Business Name",
      "Email",
      "Mailing",
      "Spot Position",
      "Amount",
      "Status",
      "Stripe Payment ID",
    ]

    const rows = filteredPayments.map(p => [
      new Date(p.created_at).toLocaleDateString(),
      p.profiles?.business_name || "",
      p.profiles?.email || "",
      p.ad_spots?.mailings?.title || "",
      p.ad_spots?.position?.toString() || "",
      p.amount.toFixed(2),
      p.status,
      p.stripe_payment_intent_id || "",
    ])

    const csv = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `payments_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const totalRevenue = payments
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const filteredTotal = filteredPayments
    .filter(p => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0)

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payments</h1>
          <p className="text-muted-foreground">Track and export payment records</p>
        </div>
        <Button onClick={exportCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filtered Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${filteredTotal.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Current selection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-xs text-muted-foreground">All payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${payments.length > 0 ? (totalRevenue / payments.filter(p => p.status === "completed").length).toFixed(0) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per completed payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by business, email, or payment ID..."
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
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="quarter">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={fetchPayments}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>
            Showing {filteredPayments.length} of {payments.length} payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
              <CreditCard className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No Payments Found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Payments will appear here after purchase"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        ${Number(payment.amount).toLocaleString()}
                      </span>
                      <Badge className={STATUS_COLORS[payment.status]}>
                        {payment.status}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      {payment.profiles?.business_name && (
                        <span>{payment.profiles.business_name}</span>
                      )}
                      {payment.ad_spots?.mailings?.title && (
                        <>
                          <span>·</span>
                          <span>
                            {payment.ad_spots.mailings.title} - Position {payment.ad_spots.position}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {payment.stripe_payment_intent_id && (
                      <a
                        href={`https://dashboard.stripe.com/payments/${payment.stripe_payment_intent_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Stripe
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
