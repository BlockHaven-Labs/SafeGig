import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CTASection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/5">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
          Ready to Secure Your Freelance Work?
        </h2>
        <p className="text-xl text-muted-foreground mb-8">
          Join the future of freelance payments with blockchain-powered escrow.
        </p>
        <Link href="/connect">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
            Launch App
          </Button>
        </Link>
      </div>
    </section>
  )
}
