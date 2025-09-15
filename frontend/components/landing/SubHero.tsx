import Image from "next/image";

export default function SubHeroSection() {
  return (
    <section className="bg-primary/9">
      <div className="">
        <Image
          src="/handShake.png"
          alt="escrow handshake escrow illustration"
          width={600}
          height={400}
          className="mx-auto"
        />
      </div>
    </section>
  );
}
