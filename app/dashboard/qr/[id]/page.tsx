import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { QRCodeDisplay } from "@/components/qr-code-display"

export default async function QRCodePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: spot, error } = await supabase
    .from("ad_spots")
    .select(
      `
      *,
      mailings (
        title
      )
    `,
    )
    .eq("id", id)
    .eq("advertiser_id", user.id)
    .single()

  if (error || !spot || !spot.qr_code_data) {
    notFound()
  }

  return (
    <div className="container max-w-2xl py-12">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>QR Code for Your Ad</CardTitle>
          <CardDescription>
            {spot.mailings?.title} - {spot.side === "front" ? "Front" : "Back"} Side, Position {spot.grid_position}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <QRCodeDisplay url={spot.qr_code_data} size={300} showDownload />

          <div className="space-y-2">
            <div className="text-sm font-medium">Landing Page URL</div>
            <div className="break-all rounded-lg bg-muted p-3 text-sm">{spot.qr_code_data}</div>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4">
            <h3 className="mb-2 font-semibold">Instructions</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li>1. Download the QR code using the button above</li>
              <li>2. Include it in your ad design</li>
              <li>3. Make sure it's at least 1 inch square for easy scanning</li>
              <li>4. Test the QR code before submitting your final ad</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
