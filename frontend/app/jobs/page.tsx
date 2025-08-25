import { Button } from "@/components/ui/button"

export default function Jobs() {
  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Jobs</h1>
      <p className="text-lg">Browse available jobs</p>
      <Button variant="secondary" className="mt-4">
        Filter Jobs
      </Button>
    </main>
  )
}
