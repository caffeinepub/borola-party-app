import { Button } from "@/components/ui/button";
import { Link, Outlet, useRouter } from "@tanstack/react-router";
import { Menu, Star, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { to: "/", label: "Home", ocid: "nav.home.link" },
  { to: "/mlas", label: "MLAs", ocid: "nav.mlas.link" },
  { to: "/candidates", label: "Candidates", ocid: "nav.candidates.link" },
  { to: "/join", label: "Join the Party", ocid: "nav.join.link" },
  { to: "/supporters", label: "Supporters", ocid: "nav.supporters.link" },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const currentPath = router.state.location.pathname;

  return (
    <div className="min-h-screen flex flex-col font-body">
      {/* Tricolor top accent bar */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-saffron" />
        <div className="flex-1 bg-white border-y border-border" />
        <div
          className="flex-1"
          style={{ backgroundColor: "oklch(var(--india-green))" }}
        />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-navy shadow-navy">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link
              to="/"
              className="flex items-center gap-2 group"
              data-ocid="nav.home.link"
            >
              <div className="w-9 h-9 rounded-full bg-saffron flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Star className="w-5 h-5 text-navy" fill="currentColor" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-display text-white text-lg font-bold tracking-widest uppercase">
                  BOROLA
                </span>
                <span className="text-saffron text-[10px] tracking-[0.2em] uppercase font-semibold -mt-0.5">
                  PARTY
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = currentPath === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    data-ocid={link.ocid}
                    className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
                      isActive
                        ? "bg-saffron text-navy"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-white/10"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden bg-navy-dark border-t border-white/10">
            <div className="px-4 py-2 space-y-1">
              {navLinks.map((link) => {
                const isActive = currentPath === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    data-ocid={link.ocid}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-md text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-saffron text-navy"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-navy text-white/70">
        {/* Tricolor stripe */}
        <div className="h-0.5 w-full flex">
          <div className="flex-1 bg-saffron" />
          <div className="flex-1 bg-white/30" />
          <div
            className="flex-1"
            style={{ backgroundColor: "oklch(var(--india-green))" }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-saffron flex items-center justify-center">
                <Star className="w-4 h-4 text-navy" fill="currentColor" />
              </div>
              <span className="font-display text-white font-bold tracking-widest uppercase text-sm">
                BOROLA PARTY
              </span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-white/60 mb-1">
                Building a stronger tomorrow — together.
              </p>
              <p className="text-xs text-white/40">
                © {new Date().getFullYear()}. Built with{" "}
                <span className="text-saffron">♥</span> using{" "}
                <a
                  href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                    typeof window !== "undefined"
                      ? window.location.hostname
                      : "",
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/50 hover:text-saffron transition-colors"
                >
                  caffeine.ai
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
