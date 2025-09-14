import Image from "next/image";

export default function SubHeroSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary/5">
      <div className="bg-gradient-to-r from-card to-background rounded-2xl p-8 border border-border">
        <Image
          src="/handShake.png"
          alt="escrow handshake escrow illustration"
          width={600}
          height={400}
          className="mx-auto rounded-lg"
        />
      </div>
    </section>
  );
}
