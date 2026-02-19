
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/container"

export function Navbar() {
  return (
    <nav className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container className="h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {/* Logo placeholder - using text/icon */}
          <div className="w-8 h-8 bg-primary rounded-tr-xl rounded-bl-xl flex items-center justify-center text-primary-foreground font-bold text-lg">
            B
          </div>
          <span className="font-bold text-xl tracking-tight">Bookmyinfluencer</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="/discover" className="hover:text-foreground transition-colors">
            Marketplace
          </Link>
          <Link href="/brand/login" className="hover:text-foreground transition-colors">
            For Brands
          </Link>
          <Link href="/login" className="hover:text-foreground transition-colors">
            For Creators
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="font-medium" asChild>
            <Link href="/login">
              Log In
            </Link>
          </Button>
          <Button className="font-medium bg-slate-800 hover:bg-slate-700" asChild>
            <Link href="/register">
              Sign Up
            </Link>
          </Button>
        </div>
      </Container>
    </nav>
  )
}
