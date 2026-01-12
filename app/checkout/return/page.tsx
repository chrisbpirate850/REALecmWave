"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2 } from "lucide-react"

export default function CheckoutReturnPage() {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    // The webhook handles the actual processing
    // This page just confirms to the user
    const timer = setTimeout(() => {
      setStatus("success")
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-emerald-600" />
            <p className="mt-4 text-lg font-medium">Processing your payment...</p>
            <p className="mt-2 text-sm text-muted-foreground">Please wait while we confirm your purchase</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>Your ad spot has been reserved</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-emerald-50 p-4 text-sm">
            <p className="font-medium text-emerald-900">What happens next?</p>
            <ul className="mt-2 space-y-1 text-emerald-700">
              <li>• Your QR code and landing page have been created</li>
              <li>• Check your dashboard to view your ad details</li>
              <li>• We'll contact you if we need any design approvals</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Button className="w-full" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
            <Button className="w-full bg-transparent" variant="outline" onClick={() => router.push("/mailings")}>
              Browse More Mailings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
