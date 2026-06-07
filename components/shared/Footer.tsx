import Link from "next/link";
import Image from "next/image";
import { Twitter, Github, Linkedin } from "lucide-react";

const footerLinks = {
  Product: ["Features", "Dashboard", "Pricing", "Changelog"],
  Company: ["About", "Blog", "Careers", "Press"],
  Resources: ["Documentation", "API", "Community", "Support"],
  Legal: ["Privacy", "Terms", "Cookies", "Security"],
};

const footerHrefs: Record<string, string> = {
  Terms: "/terms",
  Privacy: "/privacy",

};

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#050508]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 flex items-center justify-center">
                <Image src="/klar-removebg-preview.png" alt="KlarTrade logo" width={48} height={48} className="object-contain" />
              </div>
              <span className="text-[17px] font-bold font-display text-white">
                Klar<span className="text-indigo-400">trade</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              The trading discipline platform built for serious traders who want clarity over chaos.
            </p>
            <div className="flex items-center gap-3">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg border border-white/[0.08] bg-white/[0.03] flex items-center justify-center text-slate-500 hover:text-white hover:border-white/[0.16] hover:bg-white/[0.07] transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
                {category}
              </p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href={footerHrefs[link] ?? "#"}
                      className="text-sm text-slate-500 hover:text-slate-300 transition-colors duration-200"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            © {new Date().getFullYear()} Klartrade. All rights reserved.
          </p>
          <p className="text-sm text-slate-600">
            Built for traders who choose <span className="text-indigo-400">clarity</span> over chaos.
          </p>
        </div>
      </div>
    </footer>
  );
}
