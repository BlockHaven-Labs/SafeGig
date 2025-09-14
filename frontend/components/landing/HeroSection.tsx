import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="pt-20 pb-40 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1200 850"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="neonPulse1" cx="80%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(59,130,246,0.8)" />
              <stop offset="30%" stopColor="rgba(59,130,246,0.6)" />
              <stop offset="70%" stopColor="rgba(37,99,235,0.4)" />
              <stop offset="100%" stopColor="rgba(16,185,129,0)" />
            </radialGradient>
            <radialGradient id="neonPulse2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(34,197,94,0.8)" />
              <stop offset="25%" stopColor="rgba(34,197,94,0.6)" />
              <stop offset="60%" stopColor="rgba(16,185,129,0.4)" />
              <stop offset="100%" stopColor="rgba(37,99,235,0)" />
            </radialGradient>
            <radialGradient id="neonPulse3" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(59,130,246,0.8)" />
              <stop offset="35%" stopColor="rgba(59,130,246,0.6)" />
              <stop offset="75%" stopColor="rgba(37,99,235,0.4)" />
              <stop offset="100%" stopColor="rgba(13,148,136,0)" />
            </radialGradient>
            <linearGradient id="threadFade1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(0,0,0,0)" />
              <stop offset="15%" stopColor="rgba(59,130,246,0.8)" />
              <stop offset="85%" stopColor="rgba(37,99,235,0.4)" />
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
            {/* Original 5 threads */}
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

            {/* Additional 31 threads */}
            <path
              id="thread6"
              d="M150 735 Q300 660 480 610 Q660 560 800 590 Q940 620 1080 530 Q1220 440 1400 410"
              stroke="url(#threadFade3)"
              strokeWidth="1.3"
              fill="none"
              opacity="0.6"
            />
            <circle
              r="2.8"
              fill="url(#neonPulse1)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="5.2s" repeatCount="indefinite">
                <mpath href="#thread6" />
              </animateMotion>
            </circle>

            <path
              id="thread7"
              d="M40 715 Q190 585 340 535 Q490 485 630 515 Q770 545 910 455 Q1050 365 1250 335"
              stroke="url(#threadFade1)"
              strokeWidth="0.9"
              fill="none"
              opacity="0.8"
            />
            <circle
              r="2"
              fill="url(#neonPulse3)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="4.8s" repeatCount="indefinite">
                <mpath href="#thread7" />
              </animateMotion>
            </circle>

            <path
              id="thread8"
              d="M100 728 Q260 630 420 580 Q580 530 720 560 Q860 590 1000 500 Q1140 410 1320 380"
              stroke="url(#threadFade2)"
              strokeWidth="1.4"
              fill="none"
              opacity="0.7"
            />
            <circle
              r="3"
              fill="url(#neonPulse2)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="5.8s" repeatCount="indefinite">
                <mpath href="#thread8" />
              </animateMotion>
            </circle>

            <path
              id="thread9"
              d="M30 722 Q170 595 310 545 Q450 495 590 525 Q730 555 870 465 Q1010 375 1180 345"
              stroke="url(#threadFade3)"
              strokeWidth="0.5"
              fill="none"
              opacity="0.6"
            />
            <circle
              r="1.2"
              fill="url(#neonPulse1)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="6s" repeatCount="indefinite">
                <mpath href="#thread9" />
              </animateMotion>
            </circle>

            <path
              id="thread10"
              d="M90 732 Q240 625 390 575 Q540 525 680 555 Q820 585 960 495 Q1100 405 1300 375"
              stroke="url(#threadFade1)"
              strokeWidth="1.1"
              fill="none"
              opacity="0.8"
            />
            <circle
              r="2.5"
              fill="url(#neonPulse3)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="4.3s" repeatCount="indefinite">
                <mpath href="#thread10" />
              </animateMotion>
            </circle>

            <path
              id="thread11"
              d="M70 727 Q210 605 360 555 Q510 505 650 535 Q790 565 930 475 Q1070 385 1260 355"
              stroke="url(#threadFade2)"
              strokeWidth="0.4"
              fill="none"
              opacity="0.5"
            />
            <circle
              r="1"
              fill="url(#neonPulse2)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="5.7s" repeatCount="indefinite">
                <mpath href="#thread11" />
              </animateMotion>
            </circle>

            <path
              id="thread12"
              d="M110 738 Q270 645 430 595 Q590 545 730 575 Q870 605 1010 515 Q1150 425 1380 395"
              stroke="url(#threadFade3)"
              strokeWidth="1.5"
              fill="none"
              opacity="0.7"
            />
            <circle
              r="3.2"
              fill="url(#neonPulse1)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="4.7s" repeatCount="indefinite">
                <mpath href="#thread12" />
              </animateMotion>
            </circle>

            <path
              id="thread13"
              d="M45 718 Q185 588 325 538 Q465 488 605 518 Q745 548 885 458 Q1025 368 1220 338"
              stroke="url(#threadFade1)"
              strokeWidth="0.7"
              fill="none"
              opacity="0.6"
            />
            <circle
              r="1.8"
              fill="url(#neonPulse3)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="5.3s" repeatCount="indefinite">
                <mpath href="#thread13" />
              </animateMotion>
            </circle>

            <path
              id="thread14"
              d="M130 721 Q290 630 460 580 Q630 530 770 560 Q910 590 1050 500 Q1190 410 1350 380"
              stroke="url(#threadFade2)"
              strokeWidth="1.0"
              fill="none"
              opacity="0.8"
            />
            <circle
              r="2.3"
              fill="url(#neonPulse2)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="4.9s" repeatCount="indefinite">
                <mpath href="#thread14" />
              </animateMotion>
            </circle>

            <path
              id="thread15"
              d="M25 713 Q165 583 305 533 Q445 483 585 513 Q725 543 865 453 Q1005 363 1200 333"
              stroke="url(#threadFade3)"
              strokeWidth="0.3"
              fill="none"
              opacity="0.4"
            />
            <circle
              r="0.8"
              fill="url(#neonPulse1)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="6.2s" repeatCount="indefinite">
                <mpath href="#thread15" />
              </animateMotion>
            </circle>

            <path
              id="thread16"
              d="M85 719 Q235 605 385 555 Q535 505 675 535 Q815 565 955 475 Q1095 385 1320 355"
              stroke="url(#threadFade1)"
              strokeWidth="1.5"
              fill="none"
              opacity="0.9"
            />
            <circle
              r="3.2"
              fill="url(#neonPulse2)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="4.1s" repeatCount="indefinite">
                <mpath href="#thread16" />
              </animateMotion>
            </circle>

            <path
              id="thread17"
              d="M140 716 Q280 640 420 590 Q560 540 700 570 Q840 600 980 510 Q1120 420 1300 390"
              stroke="url(#threadFade2)"
              strokeWidth="0.6"
              fill="none"
              opacity="0.5"
            />
            <circle
              r="1.5"
              fill="url(#neonPulse1)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="5.1s" repeatCount="indefinite">
                <mpath href="#thread17" />
              </animateMotion>
            </circle>

            <path
              id="thread18"
              d="M35 724 Q175 650 315 600 Q455 550 595 580 Q735 610 875 520 Q1015 430 1240 400"
              stroke="url(#threadFade3)"
              strokeWidth="1.2"
              fill="none"
              opacity="0.7"
            />
            <circle
              r="2.8"
              fill="url(#neonPulse2)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="4.6s" repeatCount="indefinite">
                <mpath href="#thread18" />
              </animateMotion>
            </circle>

            <path
              id="thread19"
              d="M105 729 Q245 655 385 605 Q525 555 665 585 Q805 615 945 525 Q1085 435 1360 405"
              stroke="url(#threadFade1)"
              strokeWidth="0.8"
              fill="none"
              opacity="0.6"
            />
            <circle
              r="2"
              fill="url(#neonPulse3)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="5.4s" repeatCount="indefinite">
                <mpath href="#thread19" />
              </animateMotion>
            </circle>

            <path
              id="thread20"
              d="M65 726 Q205 615 345 565 Q485 515 625 545 Q765 575 905 485 Q1045 395 1280 365"
              stroke="url(#threadFade2)"
              strokeWidth="1.4"
              fill="none"
              opacity="0.8"
            />
            <circle
              r="3"
              fill="url(#neonPulse1)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="4.4s" repeatCount="indefinite">
                <mpath href="#thread20" />
              </animateMotion>
            </circle>

            <path
              id="thread21"
              d="M115 734 Q255 670 395 620 Q535 570 675 600 Q815 630 955 540 Q1095 450 1340 420"
              stroke="url(#threadFade3)"
              strokeWidth="0.5"
              fill="none"
              opacity="0.4"
            />
            <circle
              r="1.2"
              fill="url(#neonPulse2)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="5.9s" repeatCount="indefinite">
                <mpath href="#thread21" />
              </animateMotion>
            </circle>

            <path
              id="thread22"
              d="M55 723 Q195 620 335 570 Q475 520 615 550 Q755 580 895 490 Q1035 400 1220 370"
              stroke="url(#threadFade1)"
              strokeWidth="1.1"
              fill="none"
              opacity="0.7"
            />
            <circle
              r="2.5"
              fill="url(#neonPulse3)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="4.8s" repeatCount="indefinite">
                <mpath href="#thread22" />
              </animateMotion>
            </circle>

            <path
              id="thread23"
              d="M125 731 Q265 645 405 595 Q545 545 685 575 Q825 605 965 515 Q1105 425 1380 395"
              stroke="url(#threadFade2)"
              strokeWidth="0.9"
              fill="none"
              opacity="0.6"
            />
            <circle
              r="2.2"
              fill="url(#neonPulse1)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="5.2s" repeatCount="indefinite">
                <mpath href="#thread23" />
              </animateMotion>
            </circle>

            <path
              id="thread24"
              d="M75 720 Q215 610 355 560 Q495 510 635 540 Q775 570 915 480 Q1055 390 1260 360"
              stroke="url(#threadFade3)"
              strokeWidth="1.3"
              fill="none"
              opacity="0.8"
            />
            <circle
              r="2.9"
              fill="url(#neonPulse2)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="4.2s" repeatCount="indefinite">
                <mpath href="#thread24" />
              </animateMotion>
            </circle>

            <path
              id="thread25"
              d="M135 736 Q275 675 415 625 Q555 575 695 605 Q835 635 975 545 Q1115 455 1400 425"
              stroke="url(#threadFade1)"
              strokeWidth="0.7"
              fill="none"
              opacity="0.5"
            />
            <circle
              r="1.8"
              fill="url(#neonPulse3)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="5.6s" repeatCount="indefinite">
                <mpath href="#thread25" />
              </animateMotion>
            </circle>

            <path
              id="thread26"
              d="M95 733 Q235 635 375 585 Q515 535 655 565 Q795 595 935 505 Q1075 415 1340 385"
              stroke="url(#threadFade2)"
              strokeWidth="1.0"
              fill="none"
              opacity="0.7"
            />
            <circle
              r="2.4"
              fill="url(#neonPulse1)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="4.7s" repeatCount="indefinite">
                <mpath href="#thread26" />
              </animateMotion>
            </circle>

            <path
              id="thread27"
              d="M145 717 Q285 625 425 575 Q565 525 705 555 Q845 585 985 495 Q1125 405 1320 375"
              stroke="url(#threadFade3)"
              strokeWidth="0.4"
              fill="none"
              opacity="0.4"
            />
            <circle
              r="1"
              fill="url(#neonPulse2)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="6.1s" repeatCount="indefinite">
                <mpath href="#thread27" />
              </animateMotion>
            </circle>

            <path
              id="thread28"
              d="M15 712 Q155 595 295 545 Q435 495 575 525 Q715 555 855 465 Q995 375 1200 345"
              stroke="url(#threadFade1)"
              strokeWidth="1.5"
              fill="none"
              opacity="0.9"
            />
            <circle
              r="3.1"
              fill="url(#neonPulse3)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="4.3s" repeatCount="indefinite">
                <mpath href="#thread28" />
              </animateMotion>
            </circle>

            <path
              id="thread29"
              d="M165 739 Q305 690 445 640 Q585 590 725 620 Q865 650 1005 560 Q1145 470 1420 440"
              stroke="url(#threadFade2)"
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
              <animateMotion dur="5.3s" repeatCount="indefinite">
                <mpath href="#thread29" />
              </animateMotion>
            </circle>

            <path
              id="thread30"
              d="M175 741 Q315 680 455 630 Q595 580 735 610 Q875 640 1015 550 Q1155 460 1380 430"
              stroke="url(#threadFade3)"
              strokeWidth="1.2"
              fill="none"
              opacity="0.8"
            />
            <circle
              r="2.7"
              fill="url(#neonPulse2)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="4.5s" repeatCount="indefinite">
                <mpath href="#thread30" />
              </animateMotion>
            </circle>

            <path
              id="thread31"
              d="M185 744 Q325 685 465 635 Q605 585 745 615 Q885 645 1025 555 Q1165 465 1400 435"
              stroke="url(#threadFade1)"
              strokeWidth="0.6"
              fill="none"
              opacity="0.5"
            />
            <circle
              r="1.5"
              fill="url(#neonPulse3)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="5.8s" repeatCount="indefinite">
                <mpath href="#thread31" />
              </animateMotion>
            </circle>

            <path
              id="thread32"
              d="M195 747 Q335 690 475 640 Q615 590 755 620 Q895 650 1035 560 Q1175 470 1420 440"
              stroke="url(#threadFade2)"
              strokeWidth="1.4"
              fill="none"
              opacity="0.8"
            />
            <circle
              r="3"
              fill="url(#neonPulse1)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="4.1s" repeatCount="indefinite">
                <mpath href="#thread32" />
              </animateMotion>
            </circle>

            <path
              id="thread33"
              d="M205 750 Q345 695 485 645 Q625 595 765 625 Q905 655 1045 565 Q1185 475 1440 445"
              stroke="url(#threadFade3)"
              strokeWidth="0.9"
              fill="none"
              opacity="0.6"
            />
            <circle
              r="2.1"
              fill="url(#neonPulse2)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="5.1s" repeatCount="indefinite">
                <mpath href="#thread33" />
              </animateMotion>
            </circle>

            <path
              id="thread34"
              d="M215 753 Q355 700 495 650 Q635 600 775 630 Q915 660 1055 570 Q1195 480 1460 450"
              stroke="url(#threadFade1)"
              strokeWidth="1.1"
              fill="none"
              opacity="0.7"
            />
            <circle
              r="2.6"
              fill="url(#neonPulse3)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="4.9s" repeatCount="indefinite">
                <mpath href="#thread34" />
              </animateMotion>
            </circle>

            <path
              id="thread35"
              d="M225 756 Q365 705 505 655 Q645 605 785 635 Q925 665 1065 575 Q1205 485 1480 455"
              stroke="url(#threadFade2)"
              strokeWidth="0.3"
              fill="none"
              opacity="0.4"
            />
            <circle
              r="0.8"
              fill="url(#neonPulse1)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="6.3s" repeatCount="indefinite">
                <mpath href="#thread35" />
              </animateMotion>
            </circle>

            <path
              id="thread36"
              d="M235 759 Q375 710 515 660 Q655 610 795 640 Q935 670 1075 580 Q1215 490 1500 460"
              stroke="url(#threadFade3)"
              strokeWidth="1.5"
              fill="none"
              opacity="0.9"
            />
            <circle
              r="3.2"
              fill="url(#neonPulse2)"
              opacity="1"
              filter="url(#neonGlow)"
            >
              <animateMotion dur="4.0s" repeatCount="indefinite">
                <mpath href="#thread36" />
              </animateMotion>
            </circle>
          </g>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <h1 className="text-4xl text-white sm:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-6">
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
