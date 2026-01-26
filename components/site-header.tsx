"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Mail, Menu, X } from "lucide-react"

type NavLink = {
  href: string
  label: string
  variant?: "default" | "ghost" | "outline"
}

type SiteHeaderProps = {
  showAuthButtons?: boolean
  showDashboard?: boolean
  showMailings?: boolean
  showEDDM?: boolean
  showBlog?: boolean
}

export function SiteHeader({
  showAuthButtons = true,
  showDashboard = false,
  showMailings = true,
  showEDDM = true,
  showBlog = true
}: SiteHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks: NavLink[] = []

  if (showMailings) {
    navLinks.push({ href: "/mailings", label: "Mailings", variant: "ghost" })
  }

  if (showEDDM) {
    navLinks.push({ href: "/eddm", label: "EDDM Tools", variant: "ghost" })
  }

  if (showBlog) {
    navLinks.push({ href: "/blog", label: "Blog", variant: "ghost" })
  }

  if (showDashboard) {
    navLinks.push({ href: "/dashboard", label: "Dashboard", variant: "ghost" })
  }

  const authLinks: NavLink[] = showAuthButtons ? [
    { href: "/auth/login", label: "Sign In", variant: "outline" },
    { href: "/auth/sign-up", label: "Get Started", variant: "default" },
  ] : []

  const allLinks = [...navLinks, ...authLinks]

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-emerald-600" />
          <span className="text-lg font-bold sm:text-xl">
            <span className="hidden sm:inline">Emerald Coast Marketing Wave</span>
            <span className="sm:hidden">ECM Wave</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button variant={link.variant || "ghost"}>{link.label}</Button>
            </Link>
          ))}
          {authLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button variant={link.variant || "default"}>{link.label}</Button>
            </Link>
          ))}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] sm:w-[320px]">
            <div className="flex flex-col gap-6 pt-6">
              {/* Mobile Logo */}
              <Link
                href="/"
                className="flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <Mail className="h-6 w-6 text-emerald-600" />
                <span className="text-lg font-bold">ECM Wave</span>
              </Link>

              {/* Mobile Nav Links */}
              <nav className="flex flex-col gap-3">
                {allLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                  >
                    <Button
                      variant={link.variant || "ghost"}
                      className="w-full justify-start text-lg"
                      size="lg"
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
