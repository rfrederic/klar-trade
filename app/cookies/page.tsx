import Link from "next/link";
import Image from "next/image";
import { Cookie } from "lucide-react";

export const metadata = { title: "Cookie Policy — KlarTrade" };

const cookieTypes = [
  {
    name: "Strictly necessary",
    desc: "Required for core functions and security. Cannot be disabled.",
    required: true,
  },
  {
    name: "Functional",
    desc: "Remember preferences such as theme, language, and other settings.",
    required: false,
  },
  {
    name: "Analytics",
    desc: "Help us understand usage and improve the product.",
    required: false,
  },
  {
    name: "Advertising",
    desc: "Used for marketing measurement and targeting. Only where permitted.",
    required: false,
  },
];

const useCases = [
  {
    label: "Essential operations",
    desc: "Help the site and app work correctly, including security, fraud prevention, and session management.",
  },
  {
    label: "Preferences",
    desc: "Remember settings like theme, language, and other user choices.",
  },
  {
    label: "Analytics",
    desc: "Understand usage and improve performance, such as which pages are visited and how features are used.",
  },
  {
    label: "Marketing (if enabled)",
    desc: "Measure ad performance and show relevant content. We only do this where permitted and based on your choices.",
  },
];

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-[#F2F0EB]">
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="dot-grid absolute inset-0 opacity-10" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-5 border-b border-white/[0.05]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 flex items-center justify-center">
              <Image src="/klar-removebg-preview.png" alt="KlarTrade" width={44} height={44} className="object-contain" />
            </div>
            <span className="text-[14px] font-bold tracking-tight">
              Klar<span className="text-[#4BA3D4]">Trade</span>
            </span>
          </Link>
          <Link href="/" className="text-sm text-[#6B7280] hover:text-[#F2F0EB] transition-colors">
            ← Back
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-6 py-16">

        {/* Title */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#03588C]/15 border border-[#03588C]/25 flex items-center justify-center flex-shrink-0">
              <Cookie className="w-5 h-5 text-[#4BA3D4]" />
            </div>
            <h1 className="text-4xl font-black">Cookie Policy</h1>
          </div>
          <p className="text-[#6B7280] text-sm mb-6">Last updated: 05 June 2026</p>
          <p className="text-[#6B7280] leading-relaxed">
            This Cookie Policy explains how KlarTrade uses cookies and similar technologies
            on our website and within our web app.
          </p>
        </div>

        <div className="space-y-10">

          {/* What are cookies */}
          <section>
            <h2 className="text-lg font-bold text-[#F2F0EB] mb-3 pb-3 border-b border-white/[0.06]">
              What are cookies?
            </h2>
            <p className="text-[#6B7280] text-sm leading-relaxed">
              Cookies are small files stored on your device that help websites and apps function
              properly, remember preferences, and understand how users interact with pages.
            </p>
          </section>

          {/* What we use cookies for */}
          <section>
            <h2 className="text-lg font-bold text-[#F2F0EB] mb-4 pb-3 border-b border-white/[0.06]">
              What we use cookies for
            </h2>
            <p className="text-[#6B7280] text-sm mb-5">We use cookies and similar technologies to:</p>
            <div className="space-y-3">
              {useCases.map((u) => (
                <div key={u.label} className="glass rounded-xl p-4">
                  <p className="text-sm font-semibold text-[#F2F0EB] mb-1">{u.label}</p>
                  <p className="text-xs text-[#6B7280] leading-relaxed">{u.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Types of cookies */}
          <section>
            <h2 className="text-lg font-bold text-[#F2F0EB] mb-4 pb-3 border-b border-white/[0.06]">
              Types of cookies
            </h2>
            <div className="space-y-3">
              {cookieTypes.map((c) => (
                <div key={c.name} className="flex items-start justify-between gap-4 glass rounded-xl p-4">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#F2F0EB] mb-0.5">{c.name}</p>
                    <p className="text-xs text-[#6B7280] leading-relaxed">{c.desc}</p>
                  </div>
                  <span className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${
                    c.required
                      ? "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20"
                      : "text-[#6B7280] bg-white/[0.04] border-white/[0.08]"
                  }`}>
                    {c.required ? "Required" : "Optional"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Third-party cookies */}
          <section>
            <h2 className="text-lg font-bold text-[#F2F0EB] mb-3 pb-3 border-b border-white/[0.06]">
              Third-party cookies
            </h2>
            <p className="text-[#6B7280] text-sm leading-relaxed">
              Some features may involve third parties, such as analytics, support chat, or payment
              providers. These third parties may set their own cookies and have their own policies.
            </p>
          </section>

          {/* Your choices */}
          <section>
            <h2 className="text-lg font-bold text-[#F2F0EB] mb-3 pb-3 border-b border-white/[0.06]">
              Your choices
            </h2>
            <p className="text-[#6B7280] text-sm mb-4">You can control cookies in two ways:</p>
            <ul className="space-y-2.5 ml-1">
              {[
                "Use our cookie banner or settings (where available) to accept or reject non-essential cookies.",
                "Adjust your browser settings to block or delete cookies. Blocking essential cookies may cause parts of the site or app to stop working.",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-[#6B7280]">
                  <span className="w-1 h-1 rounded-full bg-[#03588C] mt-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-lg font-bold text-[#F2F0EB] mb-3 pb-3 border-b border-white/[0.06]">
              Changes to this policy
            </h2>
            <p className="text-[#6B7280] text-sm leading-relaxed">
              We may update this Cookie Policy from time to time. We will update the
              &ldquo;Last updated&rdquo; date above.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-lg font-bold text-[#F2F0EB] mb-3 pb-3 border-b border-white/[0.06]">
              Contact
            </h2>
            <p className="text-[#6B7280] text-sm mb-2">
              If you have questions about cookies or privacy, contact us at:
            </p>
            <a href="mailto:support@klartrade.com" className="text-sm text-[#4BA3D4] hover:underline">
              support@klartrade.com
            </a>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8 px-6 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/klar-removebg-preview.png" alt="KlarTrade" width={28} height={28} className="object-contain" />
            <span className="text-sm font-bold">Klar<span className="text-[#4BA3D4]">Trade</span></span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-[#6B7280]">
            <Link href="/privacy"         className="hover:text-[#F2F0EB] transition-colors">Privacy Policy</Link>
            <Link href="/terms"           className="hover:text-[#F2F0EB] transition-colors">Terms of Service</Link>
            <Link href="/risk-disclaimer" className="hover:text-[#F2F0EB] transition-colors">Risk Disclaimer</Link>
            <Link href="/cookies"         className="text-[#F2F0EB]">Cookie Policy</Link>
          </div>
          <p className="text-xs text-[#6B7280]">© {new Date().getFullYear()} KlarTrade. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
