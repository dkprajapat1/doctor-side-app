import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Stethoscope, LogOut, Shield, User, HeartPulse } from 'lucide-react';

export default function Header({ doctor, onLogout }) {
  const router = useRouter();

  return (
    <header className="bg-[#F6F1E9]/90 backdrop-blur-md border-b border-[#E2DBD1] sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Emblem & App Title */}
        <Link href="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-11 h-11 rounded-2xl bg-[#0D9488] flex items-center justify-center text-white shadow-xs group-hover:bg-[#0F766E] transition-colors">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif text-xl font-bold text-[#0F172A] tracking-tight">MediKiosk</span>
              <span className="text-[10px] font-mono font-semibold bg-[#E6F4F1] text-[#0D9488] px-2 py-0.5 rounded-full border border-[#0D9488]/30">
                PHYSICIAN DESK
              </span>
            </div>
            <p className="text-xs text-[#64748B] font-medium">Clinical Intake & OPD Queue System</p>
          </div>
        </Link>

        {doctor ? (
          <div className="flex items-center space-x-4">
            {/* Doctor Profile Pill */}
            <div className="hidden sm:flex items-center space-x-3 bg-white border border-[#E2DBD1] px-4 py-2 rounded-full shadow-2xs">
              <div className="w-7 h-7 rounded-full bg-[#0D9488]/15 text-[#0D9488] font-bold text-xs flex items-center justify-center">
                {doctor.name ? doctor.name.replace('Dr. ', '').charAt(0) : 'D'}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-[#0F172A] leading-tight">{doctor.name}</div>
                <div className="text-[10px] text-[#0D9488] font-semibold">{doctor.department} • {doctor.hospital || 'AIIMS Metro'}</div>
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={onLogout}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full border border-red-200 text-red-700 bg-red-50/70 hover:bg-red-100 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              title="Sign Out of Doctor Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="text-xs font-semibold text-[#64748B]">Physician Authentication</div>
        )}
      </div>
    </header>
  );
}
