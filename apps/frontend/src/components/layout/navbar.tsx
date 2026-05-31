"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  Zap,
  Home,
  Compass,
  Users,
  Bell,
  Accessibility,
  Globe,
  ChevronDown,
  Sparkles,
} from "lucide-react";

const navLinks = [
  { href: "/",              label: "Anasayfa",        icon: Home },
  { href: "/campus-guide",  label: "Kampüs Rehberi",  icon: Compass },
  { href: "/discover",      label: "Keşfet",          icon: Users },
  { href: "/event",         label: "Etkinlik",        icon: Bell },
  { href: "/accessibility", label: "Engelsiz SAÜ",    icon: Accessibility },
];

const languages = [
  { code: "tr", label: "Türkçe", flag: "🇹🇷" }
];

// Bu sayfalarda navbar her zaman koyu (beyaz bg) görünür
const LIGHT_BG_PAGES = ["/volt", "/campus-guide", "/discover", "/event", "/accessibility", "/admin"];

export function Navbar() {
  const [scrolled, setScrolled]       = useState(false);
  const [open, setOpen]               = useState(false);
  const [currentLang, setCurrentLang] = useState(languages[0]);
  const pathname = usePathname();

  const isLightPage = LIGHT_BG_PAGES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const showDark    = scrolled || isLightPage;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        showDark
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-105",
              showDark ? "text-white" : "bg-white text-slate-900 shadow-md"
            )}
            style={showDark ? { backgroundColor: "#001f5a" } : {}}
          >
            <Zap size={18} />
          </div>
          <div className="flex flex-col leading-none">
            <span
              className="text-sm font-bold tracking-wide transition-colors duration-300"
              style={{ color: showDark ? "#001f5a" : "#ffffff" }}
            >
              SAU VIBE
            </span>
            <span className={cn("text-[10px]", showDark ? "text-slate-500" : "text-white/80")}>
              Sakarya Üniversitesi
            </span>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={(e) => {
                  if (isActive) {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  isActive
                    ? showDark
                      ? "text-white shadow-sm font-semibold"
                      : "bg-white/20 text-white font-semibold backdrop-blur-sm"
                    : showDark
                      ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
                style={isActive && showDark ? { backgroundColor: "#001f5a" } : {}}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* SAĞ: VOLT + DİL SEÇİCİ */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className={cn(
              "relative overflow-hidden group gap-2 transition-all duration-500 font-bold rounded-full px-5 border-0 shadow-md",
              showDark
                ? "bg-gradient-to-r from-[#001f5a] via-[#0047b3] to-[#001f5a] bg-[length:200%_auto] text-white hover:shadow-blue-200 hover:-translate-y-0.5"
                : "bg-gradient-to-r from-[#f4a522] via-[#ffc766] to-[#f4a522] bg-[length:200%_auto] text-[#001f5a] hover:shadow-[0_0_15px_rgba(244,165,34,0.4)] hover:-translate-y-0.5"
            )}
          >
            <Link
              href="/volt"
              onClick={(e) => {
                if (pathname === "/volt") {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              <Sparkles
                size={16}
                className={cn(
                  "transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110",
                  showDark ? "text-[#f4a522]" : "text-[#001f5a]"
                )}
              />
              <span className="tracking-wide">VOLT</span>
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "gap-1.5 transition-all duration-300 font-medium border ml-1",
                  showDark
                    ? "bg-transparent hover:bg-slate-50/50"
                    : "bg-white/10 hover:bg-white/20 border-white/20 text-white"
                )}
                style={showDark ? { borderColor: "#001f5a", color: "#001f5a" } : {}}
              >
                <Globe size={14} style={showDark ? { color: "#001f5a" } : { color: "rgba(255,255,255,0.8)" }} />
                <span>{currentLang.flag}</span>
                <span className="text-xs font-semibold">{currentLang.code.toUpperCase()}</span>
                <ChevronDown size={12} style={showDark ? { color: "#001f5a" } : {}} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white border border-slate-200 shadow-md">
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setCurrentLang(lang)}
                  className={cn(
                    "gap-2 cursor-pointer focus:bg-slate-100",
                    currentLang.code === lang.code && "bg-slate-50 font-semibold text-[#001f5a]"
                  )}
                >
                  <span>{lang.flag}</span>
                  <span className="text-sm">{lang.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* MOBİL MENÜ */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className={showDark ? "text-slate-900 hover:bg-slate-100" : "text-white hover:bg-white/10"}
            >
              <Menu size={22} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-white text-slate-900">
            <SheetTitle className="flex items-center gap-2 mb-6">
              <Zap size={18} style={{ color: "#001f5a" }} />
              <span className="font-bold tracking-wide" style={{ color: "#001f5a" }}>SAU VIBE</span>
            </SheetTitle>
            <nav className="flex flex-col gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={(e) => {
                      if (isActive) {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive ? "text-white font-semibold" : "hover:bg-slate-100 text-slate-700"
                    )}
                    style={isActive ? { backgroundColor: "#001f5a" } : {}}
                  >
                    <Icon size={18} />
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-400 mb-2 px-1">Dil Seçin</p>
              <div className="grid grid-cols-2 gap-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setCurrentLang(lang)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                      currentLang.code === lang.code ? "text-white font-medium" : "hover:bg-slate-100 text-slate-600"
                    )}
                    style={currentLang.code === lang.code ? { backgroundColor: "#001f5a" } : {}}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <Button
                asChild
                className="w-full text-white gap-2 rounded-xl group transition-all duration-300"
                style={{ background: "linear-gradient(to right, #001f5a, #0047b3, #001f5a)" }}
              >
                <Link
                  href="/volt"
                  onClick={(e) => {
                    if (pathname === "/volt") {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                    setOpen(false);
                  }}
                >
                  <Sparkles size={18} className="text-[#f4a522] group-hover:rotate-12 transition-transform duration-300" />
                  <span className="font-semibold text-base">Vibe AI&apos;a Sor</span>
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
