import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "Terms & Conditions — KlarTrade" };

const sections = [
  {
    id: "about",
    title: "1. About KlarTrade",
    body: `KlarTrade is a web-based trading journal and performance tracking platform operated by Breka Group LLC, a company registered in Wyoming, United States (“we”, “our”, “us”). Our platform helps traders plan, execute, journal, and review their trades.`,
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    body: "By using KlarTrade you confirm that:",
    items: [
      "You are at least 18 years old",
      "You have the legal capacity to enter into a binding agreement",
      "You are not prohibited from using the platform under any applicable law",
    ],
  },
  {
    id: "account",
    title: "3. Your Account",
    items: [
      "You are responsible for keeping your login credentials secure",
      "You must provide accurate and up-to-date information when registering",
      "You are responsible for all activity that occurs under your account",
      "Notify us immediately at support@klartrade.com if you suspect unauthorized access",
    ],
  },
  {
    id: "acceptable-use",
    title: "4. Acceptable Use",
    body: "You agree not to:",
    items: [
      "Use KlarTrade for any unlawful purpose",
      "Attempt to reverse engineer, copy, or replicate any part of the platform",
      "Share your account with others",
      "Upload harmful, fraudulent, or misleading content",
      "Interfere with the platform's security or infrastructure",
    ],
  },
  {
    id: "subscriptions",
    title: "5. Subscription & Payments",
    items: [
      "KlarTrade offers paid subscription plans",
      "Payments are processed securely by Stripe",
      "We do not store your card details",
      "Subscriptions renew automatically unless cancelled before the renewal date",
      "All prices are displayed on our pricing page and may change with notice",
    ],
    link: { label: "Stripe Privacy Policy", href: "https://stripe.com/privacy" },
  },
  {
    id: "refunds",
    title: "6. Refunds",
    items: [
      "Refund requests are reviewed on a case-by-case basis",
      "Contact us at support@klartrade.com within 7 days of your charge if you believe a refund is warranted",
      "We reserve the right to decline refunds for usage that has already occurred",
    ],
  },
  {
    id: "ip",
    title: "7. Intellectual Property",
    body: "All content, features, branding, and technology within KlarTrade are owned by Breka Group LLC. You may not copy, reproduce, distribute, or create derivative works without our written permission.",
  },
  {
    id: "third-party",
    title: "8. Third-Party Integrations",
    body: "KlarTrade integrates with third-party services including brokers, AI providers, and analytics tools. We are not responsible for the availability, accuracy, or actions of these third parties. Their own terms and policies apply.",
  },
  {
    id: "no-advice",
    title: "9. No Financial Advice",
    body: "KlarTrade is an educational and analytical tool only. Nothing on the platform constitutes financial, investment, legal, or tax advice. You are solely responsible for your trading decisions.",
  },
  {
    id: "warranties",
    title: "10. Disclaimer of Warranties",
    body: "KlarTrade is provided \"as is\" without warranties of any kind. We do not guarantee that the platform will be uninterrupted, error-free, or always available.",
  },
  {
    id: "liability",
    title: "11. Limitation of Liability",
    body: "To the maximum extent permitted by law, Breka Group LLC shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of KlarTrade, including trading losses.",
  },
  {
    id: "termination",
    title: "12. Termination",
    body: "We reserve the right to suspend or terminate your account at any time if you violate these Terms. You may cancel your account at any time by contacting support@klartrade.com.",
  },
  {
    id: "changes",
    title: "13. Changes to These Terms",
    body: "We may update these Terms & Conditions from time to time. We will notify you of significant changes via email or an in-app notice. Continued use of the platform after changes means you accept the updated terms.",
  },
  {
    id: "governing-law",
    title: "14. Governing Law",
    body: "These Terms are governed by the laws of the State of Wyoming, United States. Any disputes shall be resolved in the courts of Wyoming.",
  },
  {
    id: "contact",
    title: "15. Contact",
    body: "For any questions regarding these Terms:",
    contact: [
      { label: "Email", value: "support@klartrade.com", href: "mailto:support@klartrade.com" },
      { label: "Company", value: "Breka Group LLC, Wyoming, United States" },
    ],
  },
];

export default function TermsPage() {
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
          <h1 className="text-4xl font-black mb-3">Terms &amp; Conditions</h1>
          <p className="text-[#6B7280] text-sm mb-6">Last updated: 05 June 2026</p>
          <div className="glass rounded-2xl p-6 border-l-2 border-[#03588C]/60">
            <p className="text-[#6B7280] text-sm leading-relaxed">
              Please read these Terms &amp; Conditions carefully before using KlarTrade.
              By accessing or using the platform, you agree to be bound by these terms.
            </p>
          </div>
        </div>

        {/* TOC */}
        <nav className="glass rounded-2xl p-6 mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#4BA3D4] mb-4">Contents</p>
          <ol className="space-y-1.5">
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-sm text-[#6B7280] hover:text-[#F2F0EB] transition-colors">
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-8">
              <h2 className="text-lg font-bold text-[#F2F0EB] mb-3 pb-3 border-b border-white/[0.06]">
                {s.title}
              </h2>

              {"body" in s && s.body && (
                <p className="text-[#6B7280] text-sm leading-relaxed mb-3">{s.body}</p>
              )}

              {"items" in s && s.items && (
                <ul className="space-y-2 ml-1 mb-3">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-[#6B7280]">
                      <span className="w-1 h-1 rounded-full bg-[#03588C] mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {"link" in s && s.link && (
                <a
                  href={s.link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#4BA3D4] hover:underline"
                >
                  {s.link.label} →
                </a>
              )}

              {"contact" in s && s.contact && (
                <div className="space-y-2">
                  {s.contact.map((c) => (
                    <div key={c.label} className="flex items-center gap-2 text-sm">
                      <span className="text-[#6B7280] w-16 flex-shrink-0">{c.label}:</span>
                      {"href" in c && c.href ? (
                        <a href={c.href} className="text-[#4BA3D4] hover:underline">{c.value}</a>
                      ) : (
                        <span className="text-[#6B7280]">{c.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
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
            <Link href="/terms"           className="text-[#F2F0EB]">Terms of Service</Link>
            <Link href="/risk-disclaimer" className="hover:text-[#F2F0EB] transition-colors">Risk Disclaimer</Link>
            <Link href="/cookies"         className="hover:text-[#F2F0EB] transition-colors">Cookie Policy</Link>
          </div>
          <p className="text-xs text-[#6B7280]">© {new Date().getFullYear()} KlarTrade. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
