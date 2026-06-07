import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "Privacy Policy — KlarTrade" };

const sections = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "1.1 Personal Information",
        items: [
          "Name",
          "Email address",
          "Payment information (handled by Stripe)",
          "Profile picture (optional)",
        ],
      },
      {
        subtitle: "1.2 Usage Data",
        items: [
          "Login activity",
          "Device/browser information",
          "IP address",
          "Session duration",
          "Crash logs",
        ],
      },
      {
        subtitle: "1.3 Trading-Related Data",
        preamble: "If you connect broker accounts:",
        items: [
          "Trade history",
          "PnL",
          "Balance",
          "Metrics used for journaling & analytics",
        ],
      },
      {
        subtitle: "1.4 AI Interactions",
        preamble: "Messages typed into:",
        items: [
          "KlarAI",
          "Notebook",
          "Journal entries",
          "Prompts and responses",
        ],
        note: "This data helps improve your account experience and AI accuracy.",
      },
    ],
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Information",
    body: "We use your data to:",
    items: [
      "Provide access to the Platform",
      "Display analytics and metrics",
      "Improve AI personalization",
      "Troubleshoot issues",
      "Send important product updates",
      "Prevent fraud and misuse",
      "Improve user experience",
    ],
    closing: "We do not sell your data.",
  },
  {
    id: "payment",
    title: "3. Payment Information",
    body: "Payments are processed by Stripe. We do not store your card details.",
    link: { label: "Stripe Privacy Policy", href: "https://stripe.com/privacy" },
  },
  {
    id: "ai-processing",
    title: "4. AI Processing",
    body: "Your AI inputs may be securely processed by Anthropic (Claude) to deliver responses, improve accuracy, and personalize your usage. We do not sell or publish your private trading data.",
  },
  {
    id: "data-security",
    title: "5. Data Security",
    body: "We use:",
    items: [
      "Encryption in transit and at rest",
      "Authentication via Supabase Auth",
      "Role-based access controls",
      "Regular security audits",
    ],
    closing: "However, no system is 100% secure. You use the Platform at your own risk.",
  },
  {
    id: "sharing",
    title: "6. Sharing Your Data",
    body: "We may share data with:",
    items: [
      "Hosting providers",
      "AI service providers",
      "Market data providers",
      "Analytics tools",
      "Customer support systems",
    ],
    closing: "We do not sell data to third parties for marketing purposes.",
  },
  {
    id: "your-rights",
    title: "7. Your Rights",
    body: "Depending on your region, you may request:",
    items: [
      "Access to your data",
      "Correction of inaccurate data",
      "Deletion of your account",
      "Export of your data",
    ],
    closing: "To request: support@klartrade.com",
  },
  {
    id: "retention",
    title: "8. Data Retention",
    body: "We retain your data while your account is active. If you delete your account, we delete or anonymize data unless required by law.",
  },
  {
    id: "cookies",
    title: "9. Cookies & Tracking",
    body: "We use cookies for:",
    items: [
      "Authentication",
      "User experience",
      "Analytics",
    ],
    closing: "You may disable cookies in your browser, but some features may not work.",
  },
  {
    id: "children",
    title: "10. Children",
    body: "KlarTrade is not intended for users under 18.",
  },
  {
    id: "updates",
    title: "11. Policy Updates",
    body: "We may update this Privacy Policy as needed. The new version will be posted on this page.",
  },
  {
    id: "contact",
    title: "12. Contact",
    body: "For privacy questions, contact us at:",
    closing: "support@klartrade.com",
  },
];

export default function PrivacyPage() {
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
              <Image
                src="/klar-removebg-preview.png"
                alt="KlarTrade"
                width={44}
                height={44}
                className="object-contain"
              />
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

      {/* Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-black mb-3">Privacy Policy</h1>
          <p className="text-[#6B7280] text-sm">Last updated: 05 June 2026</p>
          <p className="text-[#6B7280] mt-4 leading-relaxed">
            Your privacy is important to us. This Privacy Policy explains how KlarTrade
            (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) collects, uses, and protects your information.
          </p>
        </div>

        {/* TOC */}
        <nav className="glass rounded-2xl p-6 mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#4BA3D4] mb-4">Contents</p>
          <ol className="space-y-1.5">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-sm text-[#6B7280] hover:text-[#F2F0EB] transition-colors"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Sections */}
        <div className="space-y-12">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-8">
              <h2 className="text-xl font-bold text-[#F2F0EB] mb-4 pb-3 border-b border-white/[0.06]">
                {s.title}
              </h2>

              {/* Sub-sections (section 1) */}
              {"content" in s && Array.isArray(s.content) && (
                <div className="space-y-6">
                  {(s.content as {
                    subtitle: string;
                    preamble?: string;
                    items: string[];
                    note?: string;
                  }[]).map((sub) => (
                    <div key={sub.subtitle}>
                      <h3 className="text-sm font-semibold text-[#F2F0EB] mb-2">{sub.subtitle}</h3>
                      {sub.preamble && (
                        <p className="text-[#6B7280] text-sm mb-2">{sub.preamble}</p>
                      )}
                      <ul className="space-y-1.5 ml-1">
                        {sub.items.map((item) => (
                          <li key={item} className="flex items-start gap-2.5 text-sm text-[#6B7280]">
                            <span className="w-1 h-1 rounded-full bg-[#03588C] mt-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      {sub.note && (
                        <p className="text-[#6B7280] text-sm mt-3 italic">{sub.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Body text */}
              {"body" in s && s.body && (
                <p className="text-[#6B7280] text-sm leading-relaxed mb-3">{s.body as string}</p>
              )}

              {/* Bullet list */}
              {"items" in s && Array.isArray(s.items) && (
                <ul className="space-y-1.5 ml-1 mb-3">
                  {(s.items as string[]).map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-[#6B7280]">
                      <span className="w-1 h-1 rounded-full bg-[#03588C] mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {/* External link */}
              {"link" in s && s.link && (
                <a
                  href={(s.link as { label: string; href: string }).href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#4BA3D4] hover:underline"
                >
                  {(s.link as { label: string; href: string }).label} →
                </a>
              )}

              {/* Closing line */}
              {"closing" in s && s.closing && (
                <p className={`text-sm leading-relaxed ${
                  (s.closing as string).includes("@") ? "text-[#4BA3D4]" : "text-[#6B7280]"
                }`}>
                  {s.closing as string}
                </p>
              )}
            </section>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8 px-6 mt-16">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/klar-removebg-preview.png" alt="KlarTrade" width={28} height={28} className="object-contain" />
            <span className="text-sm font-bold">Klar<span className="text-[#4BA3D4]">Trade</span></span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-[#6B7280]">
            <Link href="/terms"   className="hover:text-[#F2F0EB] transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="text-[#F2F0EB]">Privacy Policy</Link>
          </div>
          <p className="text-xs text-[#6B7280]">© {new Date().getFullYear()} KlarTrade. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
