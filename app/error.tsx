"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail, Home, RefreshCw } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-red-50 to-white px-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-emerald-600">
          <Mail className="h-8 w-8" />
          <span className="text-xl font-bold">ECMWave</span>
        </div>

        <h1 className="mt-8 text-4xl font-bold text-slate-900">
          Something went wrong
        </h1>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          We apologize for the inconvenience. An unexpected error has occurred. Please try again or contact support if the problem persists.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Need help?{" "}
          <Link href="/contact" className="text-emerald-600 hover:underline">
            Contact us
          </Link>
        </p>

        {error.digest && (
          <p className="mt-4 text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
