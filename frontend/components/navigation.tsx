"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletButton } from "../contexts/wallet-button";
import { Button } from "./ui/button";
import { Shield, Users, Briefcase, Settings } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: Shield },
    { href: "/freelancer", label: "Find Work", icon: Briefcase },
    { href: "/client", label: "Post Gigs", icon: Users },
    { href: "/admin", label: "Admin", icon: Settings },
  ];

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold font-mono">SafeGig</span>
        </Link>

        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                asChild
                className="flex items-center space-x-2"
              >
                <Link href={item.href}>
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </Button>
            );
          })}
        </div>

        <WalletButton />
      </div>
    </nav>
  );
}
