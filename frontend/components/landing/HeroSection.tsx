import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden  ">
      <div className="absolute inset-0 z-0">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1200 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="neonPulse1" cx="80%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(34,197,94,0.8)" />
              <stop offset="30%" stopColor="rgba(34,197,94,0.6)" />
              <stop offset="70%" stopColor="rgba(16,185,129,0.4)" />
              <stop offset="100%" stopColor="rgba(16,185,129,0)" />
            </radialGradient>
            <radialGradient id="neonPulse2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(59,130,246,0.8)" />
              <stop offset="25%" stopColor="rgba(59,130,246,0.6)" />
              <stop offset="60%" stopColor="rgba(37,99,235,0.4)" />
              <stop offset="100%" stopColor="rgba(37,99,235,0)" />
            </radialGradient>
            <radialGradient id="neonPulse3" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(20,184,166,0.8)" />
              <stop offset="35%" stopColor="rgba(20,184,166,0.6)" />
              <stop offset="75%" stopColor="rgba(13,148,136,0.4)" />
              <stop offset="100%" stopColor="rgba(13,148,136,0)" />
            </radialGradient>
            <linearGradient id="threadFade1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(0,0,0,0)" />
              <stop offset="15%" stopColor="rgba(20,184,166,0.3)" />
              <stop offset="85%" stopColor="rgba(20,184,166,0.3)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>
            <linearGradient id="threadFade2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(0,0,0,0)" />
              <stop offset="12%" stopColor="rgba(34,197,94,0.3)" />
              <stop offset="88%" stopColor="rgba(34,197,94,0.3)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>
            <linearGradient id="threadFade3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(0,0,0,0)" />
              <stop offset="18%" stopColor="rgba(59,130,246,0.3)" />
              <stop offset="82%" stopColor="rgba(59,130,246,0.3)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>
            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <g>
            {/* Flowing threads with animated circles */}
            <path
              id="thread1"
              d="M50 720 Q200 590 350 540 Q500 490 650 520 Q800 550 950 460 Q1100 370 1200 340"
              stroke="url(#threadFade1)"
              strokeWidth="0.8"
              fill="none"
              opacity="0.6"
            />
            <circle
              r="2"
              fill="url(#neonPulse1)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="4s" repeatCount="indefinite">
                <mpath href="#thread1" />
              </animateMotion>
            </circle>

            <path
              id="thread2"
              d="M80 730 Q250 620 400 570 Q550 520 700 550 Q850 580 1000 490 Q1150 400 1300 370"
              stroke="url(#threadFade2)"
              strokeWidth="1.2"
              fill="none"
              opacity="0.5"
            />
            <circle
              r="2.5"
              fill="url(#neonPulse2)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="5s" repeatCount="indefinite">
                <mpath href="#thread2" />
              </animateMotion>
            </circle>

            <path
              id="thread3"
              d="M20 710 Q180 580 320 530 Q460 480 600 510 Q740 540 880 450 Q1020 360 1200 330"
              stroke="url(#threadFade3)"
              strokeWidth="1.0"
              fill="none"
              opacity="0.6"
            />
            <circle
              r="2"
              fill="url(#neonPulse3)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="4.5s" repeatCount="indefinite">
                <mpath href="#thread3" />
              </animateMotion>
            </circle>

            <path
              id="thread4"
              d="M120 740 Q280 640 450 590 Q620 540 770 570 Q920 600 1070 510 Q1220 420 1350 390"
              stroke="url(#threadFade1)"
              strokeWidth="0.6"
              fill="none"
              opacity="0.4"
            />
            <circle
              r="1.5"
              fill="url(#neonPulse1)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="5.5s" repeatCount="indefinite">
                <mpath href="#thread4" />
              </animateMotion>
            </circle>

            <path
              id="thread5"
              d="M60 725 Q220 600 380 550 Q540 500 680 530 Q820 560 960 470 Q1100 380 1280 350"
              stroke="url(#threadFade2)"
              strokeWidth="0.9"
              fill="none"
              opacity="0.5"
            />
            <circle
              r="2.2"
              fill="url(#neonPulse2)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="4.2s" repeatCount="indefinite">
                <mpath href="#thread5" />
              </animateMotion>
            </circle>
          </g>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <h1 className="text-4xl text-blue-500 sm:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-6">
          Escrow for Freelance Gigs,{" "}
          <span className="text-blue-400">Powered by Blockchain</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Secure your freelance payments with smart contract escrow. No
          intermediaries, just transparent blockchain technology ensuring fair
          transactions for everyone.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              Launch App
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="border-blue-500 text-blue-400 hover:bg-blue-500/10 hover:text-blue-700 px-8 py-3 bg-transparent"
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
}
