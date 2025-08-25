import { Button } from "@/components/ui/button"

export default function Dashboard() {
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <p className="text-lg">Your SafeGig dashboard</p>
      <Button variant="outline" className="mt-4">
        Create New Gig
      </Button>
    </main>
  )
}
