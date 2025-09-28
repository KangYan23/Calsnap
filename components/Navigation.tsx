"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Calculator, BarChart3, Utensils, Home, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const cn = (
  ...classes: Array<string | undefined | null | false>
) => classes.filter(Boolean).join(" ");

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/meal-analysis", label: "Meal Analysis", icon: Utensils },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
];

export default function Navigation() {
  const pathname = usePathname();

  // Don't show navigation on landing or login pages
  if (pathname === "/" || pathname === "/login") {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-200/50 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">CaloriSnap</span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "outline"}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-green-500 text-white shadow-lg"
                        : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="outline"
              size="sm"
              className="text-gray-600 hover:text-green-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 py-4">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "outline"}
                    className={cn(
                      "w-full justify-start flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-green-500 text-white shadow-lg"
                        : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
