import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Heart } from "lucide-react";
import logo from "@/assets/logo.png";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/activities", label: "Activities" },
  { to: "/sokkhom", label: "Shokkhom Foundation" },
  { to: "/committee", label: "Leadership" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div
          className={`glass-strong rounded-2xl flex items-center justify-between gap-4 px-4 py-2.5 transition-all ${
            scrolled ? "shadow-soft" : ""
          }`}
        >
          <Link to="/" className="flex items-center gap-2.5 group shrink-0 min-w-0">
            <img
              src={logo}
              alt="SELFLESS ORGANIZATION BD"
              className="h-10 w-10 object-contain transition-transform group-hover:scale-105 shrink-0"
            />
            <div className="flex flex-col leading-none sm:leading-tight min-w-0">
              <span className="font-display font-bold text-[9.5px] min-[360px]:text-[11px] sm:text-[12px] lg:text-[13px] text-ink whitespace-nowrap">
                SELFLESS ORGANIZATION BD
              </span>
              <span className="text-[7.5px] min-[360px]:text-[8.5px] sm:text-[9px] lg:text-[10px] text-muted-foreground tracking-wide whitespace-nowrap mt-0.5 sm:mt-0">
                A HUMANITARIAN ORGANIZATION
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="px-3 py-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
                activeProps={{ className: "text-primary bg-primary/8" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-900 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Admin
            </Link>
            <Link
              to="/donate"
              className="hidden sm:inline-flex items-center gap-2 bg-emerald-gradient text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold shadow-glow hover:scale-[1.03] active:scale-95 transition-transform"
            >
              <Heart className="h-4 w-4 fill-current" />
              Donate
            </Link>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
              className="lg:hidden h-10 w-10 rounded-xl glass flex items-center justify-center"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden mt-2 glass-strong rounded-2xl p-2 shadow-soft animate-in fade-in slide-in-from-top-2">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-primary/5 text-sm"
              >
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
            <Link
              to="/donate"
              onClick={() => setOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 bg-emerald-gradient text-primary-foreground px-4 py-3 rounded-xl text-sm font-semibold"
            >
              <Heart className="h-4 w-4 fill-current" /> Donate Now
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
