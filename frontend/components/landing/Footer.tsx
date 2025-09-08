import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-serif font-bold text-primary mb-4">SafeGig</h3>
            <p className="text-muted-foreground mb-4">
              Blockchain-powered escrow for secure freelance transactions. Built with trust, transparency, and
              fairness in mind.
            </p>
            <Link href="/connect">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
                Launch App
              </Button>
            </Link>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">GitHub</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Whitepaper</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Smart Contracts</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-foreground mb-4">Community</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Discord</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Telegram</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 SafeGig. Built on blockchain for a trustless future.</p>
        </div>
      </div>
    </footer>
  )
}
