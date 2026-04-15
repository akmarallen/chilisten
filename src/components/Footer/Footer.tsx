import { Link } from "react-router-dom";
import { MessageCircle, Mail, Phone, BookOpen, Instagram } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-[#1e110a] text-[#e8d5be]">
      <div className="h-[3px] w-full bg-linear-to-r from-[#8B5E3C] via-[#d4a96a] to-[#8B5E3C]" />

      <div className="max-w-[1280px] mx-auto px-6 py-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.2fr] gap-10 mb-12">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3 no-underline group">
              <div className="w-11 h-11 rounded-[10px] bg-linear-to-r from-[#7a4020] to-[#C8874E] flex items-center justify-center shadow-[0_4px_16px_rgba(139,94,60,0.4)] shrink-0">
                <BookOpen size={22} className="text-white" />
              </div>
              <div>
                <div className="text-[1.3rem] font-semibold text-[#f5e6d0] leading-tight">
                  {t("header.logo")}
                </div>
                <div className="text-[0.7rem] text-[#a07850] font-light">
                  {t("header.tagline")}
                </div>
              </div>
            </Link>
            <p className="text-[0.83rem] text-[#9a7a5a] leading-[1.65] font-light max-w-[240px]">
              {t("footer.about")}
            </p>
          </div>

          <div>
            <div className="text-base font-medium text-[#f0dfc0] mb-4 pb-2 border-b border-[#b48c5a]/20">
              {t("nav.home")}
            </div>
            <nav className="flex flex-col gap-2">
              <a
                href="#how"
                className="text-[0.83rem] text-[#9a7a5a] font-light hover:text-[#d4a96a] transition-colors leading-relaxed"
              >
                {t("home.how_it_works")}
              </a>
              <Link
                to="/catalog"
                className="text-[0.83rem] text-[#9a7a5a] font-light hover:text-[#d4a96a] transition-colors leading-relaxed"
              >
                {t("nav.catalog")}
              </Link>
              <a
                href="#rules"
                className="text-[0.83rem] text-[#9a7a5a] font-light hover:text-[#d4a96a] transition-colors leading-relaxed"
              >
                {t("footer.rules")}
              </a>
            </nav>
          </div>

          <div>
            <div className="text-base font-medium text-[#f0dfc0] mb-4 pb-2 border-b border-[#b48c5a]/20">
              {t("footer.contacts")}
            </div>
            <div className="flex flex-col gap-2">
              <a
                href="mailto:info@chilisten.kg"
                className="flex items-center gap-2 text-[0.83rem] text-[#9a7a5a] font-light hover:text-[#d4a96a] transition-colors"
              >
                <Mail size={14} /> info@chilisten.kg
              </a>
              <a
                href="tel:+996703252162"
                className="flex items-center gap-2 text-[0.83rem] text-[#9a7a5a] font-light hover:text-[#d4a96a] transition-colors"
              >
                <Phone size={14} /> +996 703 252 162
              </a>
              <a
                href="#privacy"
                className="text-[0.83rem] text-[#9a7a5a] font-light hover:text-[#d4a96a] transition-colors mt-1"
              >
                {t("footer.privacy")}
              </a>
              <a
                href="#terms"
                className="text-[0.83rem] text-[#9a7a5a] font-light hover:text-[#d4a96a] transition-colors"
              >
                {t("footer.terms")}
              </a>
            </div>
          </div>

          {/* Social Column */}
          <div>
            <div className="text-base font-medium text-[#f0dfc0] mb-4 pb-2 border-b border-[#b48c5a]/20">
              {t("footer.follow_us")}
            </div>
            <div className="flex gap-2.5 mb-4">
              <a
                href="https://instagram.com/chilistenim"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-[10px] bg-[#8b5e3c]/20 border border-[#b48c5a]/20 flex items-center justify-center text-[#c4956a] hover:bg-[#8b5e3c]/35 hover:text-[#f0c080] transition-all"
                title="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://t.me/chilistenbooks"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-[10px] bg-[#8b5e3c]/20 border border-[#b48c5a]/20 flex items-center justify-center text-[#c4956a] hover:bg-[#8b5e3c]/35 hover:text-[#f0c080] transition-all"
                title="Telegram"
              >
                <MessageCircle size={18} />
              </a>
            </div>
            <p className="text-[0.78rem] text-[#7a5a3a] font-light leading-relaxed">
              {t("footer.subscribe")}
            </p>
          </div>
        </div>

        <hr className="border-none border-t border-[#b48c5a]/10 mb-6" />

        <div className="flex flex-wrap items-center justify-between gap-3 text-[0.78rem] font-light text-[#6a4a2a]">
          <span>
            © {currentYear} Chilisten. {t("footer.copyright")}
          </span>

          <div className="flex items-center gap-2 text-[0.7rem] text-[#b48c5a]/40 tracking-[0.15em]">
            <span>◆</span>
            <span>◇</span>
            <span>◆</span>
          </div>

          <span className="hover:text-[#9a7a5a] transition-colors">
            {t("footer.powered_by")}
          </span>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="h-[3px] w-full bg-linear-to-r from-[#8B5E3C] via-[#d4a96a] to-[#8B5E3C]" />
    </footer>
  );
};
