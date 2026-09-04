import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function NoticeModal({ isOpen, onAccept }) {
  const [isChecked, setIsChecked] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/70 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-7 shadow-warm-lg border border-[#E2DBD1] animate-fadeIn">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 bg-[#E6F4F1] rounded-2xl text-[#0D9488]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-[#0F172A]">Physician Clinical Governance Notice</h2>
            <p className="text-xs text-[#64748B]">Clinical Decision Support & Intake Standards</p>
          </div>
        </div>

        <div className="space-y-3 text-xs text-[#475569] mb-6 bg-[#F6F1E9] p-4.5 rounded-2xl border border-[#E2DBD1] leading-relaxed">
          <p className="font-semibold text-[#0F172A]">
            Please acknowledge the hospital governance protocol regarding AI summaries:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-[#475569]">
            <li>
              <strong>Clinical Reference Aid:</strong> AI summaries and structured extractions in this dashboard serve as cognitive reference tools to accelerate consultation review.
            </li>
            <li>
              <strong>Source Verification:</strong> Attending physicians must review underlying patient-reported symptoms, verified clinical facts, and uploaded diagnostic files.
            </li>
            <li>
              <strong>Final Authority:</strong> Clinical judgment, diagnosis, and prescription authority remain solely with the registered medical practitioner.
            </li>
          </ul>
        </div>

        <div className="flex items-start space-x-3 mb-6 p-3.5 bg-[#E6F4F1]/60 rounded-2xl border border-[#0D9488]/30">
          <input
            type="checkbox"
            id="notice-check"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded-md text-[#0D9488] focus:ring-[#0D9488] cursor-pointer accent-[#0D9488]"
          />
          <label htmlFor="notice-check" className="text-xs font-semibold text-[#0F172A] cursor-pointer leading-tight">
            I acknowledge that AI summaries are clinical assistance tools and I commit to verifying original patient records before prescribing.
          </label>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            disabled={!isChecked}
            onClick={() => onAccept && onAccept()}
            className="rounded-full bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white font-semibold text-xs px-6 py-3 flex items-center space-x-2 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <span>Acknowledge & Access Doctor Queue</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
