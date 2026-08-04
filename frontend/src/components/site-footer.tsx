import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

export function SiteFooter() {
  return (
    <footer className="relative mt-32 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-700 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_30%_20%,white,transparent_40%)]" />
      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid lg:grid-cols-4 gap-12">
          <div className="lg:col-span-2 max-w-md">
            <div className="flex items-center gap-3 mb-5">
              <img
                src={logo}
                alt="SELFLESS ORGANIZATION BD"
                className="h-12 w-12 object-contain transition-transform hover:scale-105 shrink-0"
              />
              <div>
                <div className="font-display font-bold text-lg">SELFLESS ORGANIZATION BD</div>
                <div className="text-xs opacity-80 tracking-wider">A HUMANITARIAN ORGANIZATION</div>
              </div>
            </div>
            <p className="text-sm/relaxed opacity-90">
              A volunteer-driven humanitarian organization. We believe every small act of kindness
              can grow into lasting change for the communities we serve.
            </p>
            <form className="mt-6 flex gap-2 glass rounded-xl p-1.5">
              <input
                placeholder="Subscribe to newsletter"
                className="flex-1 bg-transparent px-3 py-2 text-sm placeholder:text-primary-foreground/60 focus:outline-none"
              />
              <button className="bg-warm-gradient text-accent-foreground px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-transform">
                Join
              </button>
            </form>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ["/about", "About Us"],
                ["/activities", "Activities"],
                ["/donate", "Donate"],
                ["/volunteer", "Volunteer"],
                ["/achievements", "Achievement"],
                ["/reports", "Reports"],
                ["/gallery", "Gallery"],
              ].map(([to, l]) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="opacity-80 hover:opacity-100 hover:translate-x-1 inline-block transition-all"
                  >
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-sm opacity-90">
              <li className="flex gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Chattogram, Bangladesh</span>
              </li>
              <li className="flex gap-2">
                <Phone className="h-4 w-4 mt-0.5 shrink-0" />
                <span>01886-339475</span>
              </li>
              <li className="flex gap-2">
                <Mail className="h-4 w-4 mt-0.5 shrink-0" />
                <span>sobd.official@gmail.com</span>
              </li>
            </ul>
            <div className="flex gap-2 mt-5">
              {[
                { Icon: Facebook, href: "https://www.facebook.com/SOBD2020" },
                { Icon: Instagram, href: "https://www.instagram.com/sobd_2020/" },
                { Icon: Youtube, href: "https://www.youtube.com/@SOBD-2020" },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="social"
                  className="h-9 w-9 rounded-lg glass flex items-center justify-center hover:bg-warm-gradient hover:scale-110 transition-all"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/15 mt-12 pt-6 flex flex-col sm:flex-row justify-between gap-3 text-xs opacity-75">
          <p>© {new Date().getFullYear()} SELFLESS ORGANIZATION BD. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/contact" className="hover:opacity-100">
              Privacy
            </Link>
            <Link to="/contact" className="hover:opacity-100">
              Terms
            </Link>
            <Link to="/reports" className="hover:opacity-100">
              Transparency
            </Link>
          </div>
        </div>
        <div className="mt-4 text-center text-xs tracking-wide text-white/80">
          Developed by{" "}
          <a
            href="https://www.facebook.com/aamsayem01"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-amber-300 hover:text-amber-200 underline-offset-4 hover:underline transition-colors"
          >
            Abdullah Al Mahmud Sayem
          </a>
        </div>
      </div>
    </footer>
  );
}
