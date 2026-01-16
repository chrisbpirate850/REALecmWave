import { SiteHeader } from "@/components/site-header"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy - Emerald Coast Marketing Wave",
  description: "Privacy policy for Emerald Coast Marketing Wave postcard marketing services.",
}

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 py-12 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-muted-foreground">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>

            <div className="mt-8 space-y-8 text-muted-foreground">
              <section>
                <h2 className="text-xl font-semibold text-foreground">Overview</h2>
                <p className="mt-3">
                  Emerald Coast Marketing Wave ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website ecmwave.com and use our postcard marketing services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">Information We Collect</h2>
                <div className="mt-3 space-y-3">
                  <p><strong className="text-foreground">Personal Information:</strong> When you create an account or purchase ad spots, we collect your name, email address, phone number, business name, and billing information.</p>
                  <p><strong className="text-foreground">Usage Data:</strong> We automatically collect information about how you interact with our website, including IP address, browser type, pages visited, and time spent on pages.</p>
                  <p><strong className="text-foreground">QR Code Analytics:</strong> When recipients scan QR codes on our postcards, we collect anonymized scan data including timestamp, general location, and device type to provide analytics to advertisers.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">How We Use Your Information</h2>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>Process your ad spot purchases and payments</li>
                  <li>Send transactional emails about your orders and account</li>
                  <li>Provide QR code scan analytics for your campaigns</li>
                  <li>Improve our website and services</li>
                  <li>Respond to your inquiries and support requests</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">Information Sharing</h2>
                <p className="mt-3">
                  We do not sell your personal information. We may share your information with:
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li><strong className="text-foreground">Service Providers:</strong> Third parties that help us operate our business (payment processing via Stripe, email delivery via Resend, hosting via Vercel)</li>
                  <li><strong className="text-foreground">Legal Requirements:</strong> When required by law or to protect our rights</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">Data Security</h2>
                <p className="mt-3">
                  We implement appropriate technical and organizational measures to protect your personal information. Payment information is processed securely through Stripe and is never stored on our servers.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">Your Rights</h2>
                <p className="mt-3">
                  You have the right to access, correct, or delete your personal information. You may also opt out of marketing communications at any time. To exercise these rights, contact us at chris@libertysprinciples.com.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">Cookies</h2>
                <p className="mt-3">
                  We use essential cookies to maintain your session and preferences. We also use Vercel Analytics to understand website usage, which collects anonymized data.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">Changes to This Policy</h2>
                <p className="mt-3">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
                <p className="mt-3">
                  If you have questions about this Privacy Policy, please contact us at{" "}
                  <a href="mailto:chris@libertysprinciples.com" className="text-emerald-600 hover:underline">
                    chris@libertysprinciples.com
                  </a>{" "}
                  or visit our{" "}
                  <Link href="/contact" className="text-emerald-600 hover:underline">
                    contact page
                  </Link>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t bg-slate-900 py-8 text-slate-300">
        <div className="container text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Emerald Coast Marketing Wave. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
