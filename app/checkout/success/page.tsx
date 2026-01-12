import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default async function CheckoutSuccessPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>Your ad spot has been reserved</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Thank you for your purchase. Your ad spot has been confirmed and you'll receive a confirmation email
            shortly.
          </p>
          <div className="space-y-2">
            <Link href="/dashboard">
              <Button className="w-full" size="lg">
                View Dashboard
              </Button>
            </Link>
            <Link href="/mailings">
              <Button variant="outline" className="w-full bg-transparent">
                Browse More Mailings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
