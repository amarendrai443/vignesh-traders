import React from 'react';
import { WhatsAppIcon } from './WhatsAppIcon';

export const WhatsAppWidget: React.FC = () => {
  const phoneNumber = '919444810111';
  const prefilledMessage = encodeURIComponent('Hello I have an inquiry about dry fruit orders');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${prefilledMessage}`;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5">
      {/* Tooltip prompt on desktop */}
      <div className="hidden sm:flex items-center px-3 py-1.5 rounded-full bg-white text-[#2D241E] border border-[#EFE9DF] text-xs font-semibold shadow-md pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#25D366] mr-2 inline-block animate-pulse" />
        <span>Chat with Vignesh Traders</span>
      </div>

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp with Vignesh Traders"
        className="relative group w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] flex items-center justify-center text-white shadow-xl shadow-emerald-900/25 transition-transform duration-200 active:scale-95"
      >
        {/* Subtle Outer Pulse Ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366]/30 animate-ping -z-10" />

        {/* Latest Official WhatsApp Icon */}
        <WhatsAppIcon className="w-8 h-8 fill-white" />
      </a>
    </div>
  );
};

export default WhatsAppWidget;
