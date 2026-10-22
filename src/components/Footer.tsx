import React from 'react';
import { Phone, Mail, MapPin, Truck, ShieldCheck, Clock, Sparkles } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F4EFEA] border-t border-[#EFE9DF] text-[#6E6359] text-xs pt-12 pb-8" id="contact">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="https://i.ibb.co/s9tyVqzN/image.png"
                alt="Vignesh Traders Logo"
                className="h-8 w-8 object-contain rounded-md flex-shrink-0"
              />
              <span className="font-serif font-bold text-[#2D241E] text-base tracking-wide">
                VIGNESH TRADERS
              </span>
            </div>
            <p className="text-xs text-[#6E6359] leading-relaxed">
              Wholesale &amp; Retail merchants of California Almonds, Jumbo Cashews, Kashmiri Walnuts, Afghani Figs, and festive gift boxes. Sourced fresh from growers.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#A89E92]">
              <span>విఘ్నేష్ ట్రేడర్స్ — నరసరావుపేట</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2.5">
            <h4 className="font-serif font-bold text-[#2D241E] text-sm">
              Contact &amp; Store Location
            </h4>
            <div className="space-y-2 text-[#2D241E]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#B45309] mt-0.5 flex-shrink-0" />
                <span className="text-xs text-[#6E6359]">
                  Kakumanu Bazar, Narasaraopet - 522601, Palnadu Dist.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#B45309] flex-shrink-0" />
                <a href="tel:+919444810111" className="hover:text-[#B45309] font-medium transition">
                  +91 94448 10111
                </a>
              </div>
              <div className="flex items-center gap-2">
                <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366] flex-shrink-0" />
                <a
                  href="https://wa.me/919444810111?text=Hello%20Vignesh%20Traders%20I%20have%20an%20order%20inquiry"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#25D366] font-medium transition"
                >
                  WhatsApp: +91 94448 10111
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#B45309] flex-shrink-0" />
                <a href="mailto:orders@vigneshtraders.com" className="hover:text-[#B45309] transition">
                  orders@vigneshtraders.com
                </a>
              </div>
            </div>
          </div>

          {/* Business Hours & Policies */}
          <div className="space-y-2.5">
            <h4 className="font-serif font-bold text-[#2D241E] text-sm">
              Business Hours
            </h4>
            <ul className="space-y-1.5 text-[#6E6359]">
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#B45309] flex-shrink-0" />
                <span>Mon – Sat: 9:00 AM – 9:30 PM</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#B45309] flex-shrink-0" />
                <span>Sunday: 10:00 AM – 2:00 PM</span>
              </li>
              <li className="flex items-center gap-2 pt-1">
                <Truck className="w-3.5 h-3.5 text-[#25D366] flex-shrink-0" />
                <span>Dispatch within 24–48 Business Hours</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#25D366] flex-shrink-0" />
                <span>100% Quality Assurance Guarantee</span>
              </li>
            </ul>
          </div>

          {/* Wholesale & Custom Gift Packs */}
          <div className="space-y-2.5">
            <h4 className="font-serif font-bold text-[#2D241E] text-sm">
              Wholesale &amp; Retail Packs
            </h4>
            <p className="text-[#6E6359] leading-relaxed">
              Available in <strong>250g, 500g, and 1kg</strong> sealed pouches. Special pricing for wedding hampers, corporate gifting, and festive bulk orders.
            </p>
            <div className="pt-1">
              <a
                href="https://wa.me/919444810111?text=Hello%20I%20want%20to%20inquire%20about%20bulk%20or%20wedding%20gift%20packs"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/20 font-bold text-xs transition"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366]" />
                <span>Bulk Inquiry via WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[#EFE9DF] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#6E6359]">
          <p>© {new Date().getFullYear()} Vignesh Traders. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span>Kakumanu Bazar, Narasaraopet</span>
            <span>•</span>
            <span>FSSAI Quality Certified</span>
            <span>•</span>
            <span>Wholesale &amp; Retail</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
