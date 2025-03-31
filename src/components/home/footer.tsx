import { Button } from "@/components/ui/button"
import { Plane } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex items-center gap-2">
          <Plane className="h-5 w-5 text-primary" />
          <p className="text-sm text-muted-foreground">© 2024 Bluebird Edu. All rights reserved.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" className="text-sm font-medium" asChild>
            <Link href="/privacy">Privacy Policy</Link>
          </Button>
          <Button variant="ghost" className="text-sm font-medium" asChild>
            <Link href="/terms">Terms of Service</Link>
          </Button>
          <Button variant="ghost" className="text-sm font-medium" asChild>
            <Link href="/contact">Contact</Link>
          </Button>
        </div>
      </div>
    </footer>
  )
}

