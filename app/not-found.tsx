import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-emerald-600">
          <Mail className="h-8 w-8" />
          <span className="text-xl font-bold">ECMWave</span>
        </div>

        <h1 className="mt-8 text-7xl font-bold text-slate-900">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-slate-700">
          Page Not Found
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted-foreground">
          Sorry, we couldn't find the page you're looking for. It may have been moved or doesn't exist.
        </p>

        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button className="gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Link href="/mailings">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              View Mailings
            </Button>
          </Link>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Need help?{" "}
          <Link href="/contact" className="text-emerald-600 hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  )
}
