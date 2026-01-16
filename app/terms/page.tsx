import { SiteHeader } from "@/components/site-header"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service - Emerald Coast Marketing Wave",
  description: "Terms of service for Emerald Coast Marketing Wave postcard marketing services.",
}

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1 py-12 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Terms of Service
            </h1>
            <p className="mt-4 text-muted-foreground">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>

            <div className="mt-8 space-y-8 text-muted-foreground">
              <section>
                <h2 className="text-xl font-semibold text-foreground">Agreement to Terms</h2>
                <p className="mt-3">
                  By accessing or using Emerald Coast Marketing Wave's website and services at ecmwave.com, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">Description of Services</h2>
                <p className="mt-3">
                  Emerald Coast Marketing Wave provides shared 9x12 postcard marketing services. Businesses can purchase ad spots on postcards that are mailed via USPS Every Door Direct Mail (EDDM) to targeted ZIP codes in the Emerald Coast area. Each postcard features up to 12 non-competing businesses, with category exclusivity guaranteed per mailing.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">Account Registration</h2>
                <p className="mt-3">
                  To purchase ad spots, you must create an account with accurate and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">Ad Content Guidelines</h2>
                <p className="mt-3">
                  You are responsible for your ad content. By submitting ad artwork, you represent that:
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-6">
                  <li>You own or have rights to use all content in your ad</li>
                  <li>Your ad does not infringe on any third-party intellectual property</li>
                  <li>Your ad content is truthful and not misleading</li>
                  <li>Your ad complies with all applicable laws and regulations</li>
                  <li>Your ad does not contain obscene, defamatory, or offensive material</li>
                </ul>
                <p className="mt-3">
                  We reserve the right to reject or remove any ad content that violates these guidelines.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">Payment and Refunds</h2>
                <div className="mt-3 space-y-3">
                  <p><strong className="text-foreground">Payment:</strong> All payments are processed securely through Stripe. By purchasing an ad spot, you authorize us to charge the amount displayed at checkout.</p>
                  <p><strong className="text-foreground">Mailing Guarantee:</strong> We do not mail partial postcards. If a mailing does not fill all 12 spots before the print deadline, the mailing will be postponed or cancelled, and you will receive a full refund or credit.</p>
                  <p><strong className="text-foreground">Cancellation:</strong> You may cancel your ad spot for a full refund up to 14 days before the scheduled print date. After this deadline, no refunds will be issued as production will have begun.</p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">Category Exclusivity</h2>
                <p className="mt-3">
                  We guarantee that only one business per category will appear on each postcard mailing. Categories are defined by us and are subject to our reasonable discretion. If a dispute arises regarding category classification, our decision is final.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">QR Code and Analytics</h2>
                <p className="mt-3">
                  Each ad spot includes a unique QR code linked to a landing page. We provide scan analytics through your dashboard. While we strive for accuracy, we do not guarantee the completeness or accuracy of analytics data.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">Limitation of Liability</h2>
                <p className="mt-3">
                  To the maximum extent permitted by law, Emerald Coast Marketing Wave shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, arising from your use of our services. Our total liability shall not exceed the amount you paid for the specific mailing in question.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">Disclaimer</h2>
                <p className="mt-3">
                  Our services are provided "as is" without warranties of any kind. We do not guarantee any specific results from your advertising campaigns. Response rates and ROI depend on many factors outside our control.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">Changes to Terms</h2>
                <p className="mt-3">
                  We may modify these Terms at any time. Continued use of our services after changes constitutes acceptance of the new terms. We will notify registered users of material changes via email.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">Governing Law</h2>
                <p className="mt-3">
                  These Terms are governed by the laws of the State of Florida, without regard to conflict of law principles. Any disputes shall be resolved in the courts of Okaloosa County, Florida.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-foreground">Contact</h2>
                <p className="mt-3">
                  For questions about these Terms, contact us at{" "}
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
