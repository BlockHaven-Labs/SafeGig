export default function UserPathways() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple workflows designed for clients, freelancers, and administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Clients */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-serif font-bold text-blue-400">C</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-foreground mb-4">For Clients</h3>
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-white font-bold">1</span>
                  </div>
                  <p className="text-muted-foreground">Post your gig with description, price, and deadline</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-white font-bold">2</span>
                  </div>
                  <p className="text-muted-foreground">Fund the escrow when a freelancer accepts</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-white font-bold">3</span>
                  </div>
                  <p className="text-muted-foreground">Release payment when satisfied or open dispute</p>
                </div>
              </div>
            </div>

            {/* Freelancers */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-serif font-bold text-blue-500">F</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-foreground mb-4">For Freelancers</h3>
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-white font-bold">1</span>
                  </div>
                  <p className="text-muted-foreground">Browse available gigs and find perfect matches</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-white font-bold">2</span>
                  </div>
                  <p className="text-muted-foreground">Accept gig and start working with secured payment</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-white font-bold">3</span>
                  </div>
                  <p className="text-muted-foreground">Deliver work and request payment release</p>
                </div>
              </div>
            </div>

            {/* Admins */}
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-serif font-bold text-slate-400">A</span>
              </div>
              <h3 className="text-2xl font-serif font-bold text-foreground mb-4">For Admins</h3>
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-slate-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-white font-bold">1</span>
                  </div>
                  <p className="text-muted-foreground">Monitor platform activity and user interactions</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-slate-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-white font-bold">2</span>
                  </div>
                  <p className="text-muted-foreground">Review and resolve disputes fairly</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-slate-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-white font-bold">3</span>
                  </div>
                  <p className="text-muted-foreground">Collect platform fees and maintain system</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
  )
}