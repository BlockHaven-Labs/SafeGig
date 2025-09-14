import { Handshake, Scale, Shield, Zap } from "lucide-react";
import { Card, CardContent } from "../ui/card";

export default function CoreFeature() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">Why Choose SafeGig?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built on blockchain technology to ensure secure, transparent, and fair freelance transactions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-card-foreground mb-2">Safe Payments</h3>
                <p className="text-muted-foreground">
                  Funds locked in smart contract until job is completed to your satisfaction.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Handshake className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-card-foreground mb-2">Trustless Escrow</h3>
                <p className="text-muted-foreground">
                  No intermediaries needed. Smart contracts handle everything automatically.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-card-foreground mb-2">Quick Contracts</h3>
                <p className="text-muted-foreground">
                  Create and accept freelance jobs in minutes with our streamlined interface.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Scale className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-card-foreground mb-2">Fair Dispute Handling</h3>
                <p className="text-muted-foreground">
                  Optional governance system ensures fair resolution of any disputes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
  )
}