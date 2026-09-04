import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import { getMe, getPatientDetail, solveAppointment, noAttemptAppointment, removeAppointment } from '../../services/api';
import Link from 'next/link';
import { 
  CheckCircle2, 
  RefreshCw, 
  XCircle, 
  ArrowLeft, 
  User, 
  FileText, 
  Activity, 
  AlertTriangle, 
  Shield, 
  Clock, 
  Sparkles,
  HelpCircle,
  Stethoscope,
  HeartPulse
} from 'lucide-react';

export default function DoctorPatientDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [doctor, setDoctor] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const fetchDetail = async () => {
    if (!id) return;
    try {
      const res = await getPatientDetail(id);
      if (res.error) {
        setErrorMsg(res.message);
      } else {
        setAppointment(res.appointment);
      }
    } catch (err) {
      setErrorMsg('Failed to load patient details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('doctor_token');
    if (!token) {
      router.push('/');
      return;
    }
    getMe().then(res => { if (res.doctor) setDoctor(res.doctor); });

    if (id) {
      fetchDetail();
    }
  }, [id]);

  // Action Handlers
  const handleSolve = async () => {
    if (!confirm('Mark this consultation as SOLVED/Completed?')) return;
    setActionLoading(true);
    setErrorMsg('');
    try {
      const res = await solveAppointment(id);
      if (res.error) {
        setErrorMsg(res.message);
      } else {
        setActionSuccessMsg('Consultation successfully marked as SOLVED.');
        fetchDetail();
      }
    } catch (e) {
      setErrorMsg('Failed to solve appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleNoAttempt = async () => {
    if (!confirm('Consultation not attempted? This will automatically reschedule the patient to the next available slot.')) return;
    setActionLoading(true);
    setErrorMsg('');
    try {
      const res = await noAttemptAppointment(id);
      if (res.error) {
        setErrorMsg(res.message);
      } else {
        setActionSuccessMsg(`Appointment rescheduled to slot ${res.appointment.slotLabel} (Queue #${res.appointment.queueNumber}).`);
        fetchDetail();
      }
    } catch (e) {
      setErrorMsg('Failed to reschedule appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Remove this appointment from active queue? (History audit will be preserved)')) return;
    setActionLoading(true);
    setErrorMsg('');
    try {
      const res = await removeAppointment(id);
      if (res.error) {
        setErrorMsg(res.message);
      } else {
        setActionSuccessMsg('Appointment removed from active queue.');
        fetchDetail();
      }
    } catch (e) {
      setErrorMsg('Failed to remove appointment.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F1E9] flex items-center justify-center">
        <div className="flex items-center space-x-3 text-[#0D9488]">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="font-semibold text-[#0F172A]">Loading Clinical Record & AI Summary...</span>
        </div>
      </div>
    );
  }

  const apt = appointment || {};
  const pat = apt.patient || {};
  const docs = apt.documents || [];
  const answers = apt.followupAnswers || [];

  return (
    <div className="min-h-screen bg-[#F6F1E9] text-[#0F172A] font-['Plus_Jakarta_Sans',sans-serif]">
      <Header doctor={doctor} onLogout={() => { localStorage.removeItem('doctor_token'); router.push('/'); }} />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center text-xs font-semibold text-[#475569] hover:text-[#0F172A] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Queue Dashboard
          </Link>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#64748B]">
            <span>Status:</span>
            <span className={`px-3 py-1 rounded-full uppercase font-mono text-[11px] font-bold ${
              apt.status === 'SOLVED' ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]' :
              apt.status === 'RESCHEDULED' ? 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]' :
              apt.status === 'REMOVED' ? 'bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]' :
              'bg-[#E6F4F1] text-[#0D9488] border border-[#0D9488]/30'
            }`}>
              {apt.status}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-medium flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {actionSuccessMsg && (
          <div className="p-4 bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] rounded-2xl text-xs font-medium flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-[#059669]" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* PRIMARY DOCTOR ACTIONS (SOLVE / NO ATTEMPT / REMOVE) */}
        <div className="rounded-3xl bg-[#0F172A] text-white p-6 shadow-warm-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#14B8A6] font-semibold">
                OPD Clinical Decisions
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">Physician Consultation Actions</h2>
              <p className="text-xs text-slate-300 mt-0.5">Perform action on patient #{apt.queueNumber} ({pat.name || 'Patient'})</p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* 1. SOLVE BUTTON */}
              <button
                type="button"
                disabled={actionLoading || apt.status === 'SOLVED'}
                onClick={handleSolve}
                className="bg-[#5F8F73] hover:bg-[#4A735C] text-white font-semibold text-xs px-5 py-2.5 rounded-full flex items-center space-x-1.5 shadow-2xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>SOLVE</span>
              </button>

              {/* 2. NO ATTEMPT BUTTON */}
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleNoAttempt}
                className="bg-[#C9954D] hover:bg-[#B3813B] text-white font-semibold text-xs px-5 py-2.5 rounded-full flex items-center space-x-1.5 shadow-2xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>NO ATTEMPT</span>
              </button>

              {/* 3. REMOVE BUTTON */}
              <button
                type="button"
                disabled={actionLoading || apt.status === 'REMOVED'}
                onClick={handleRemove}
                className="bg-[#DC6B63] hover:bg-[#C8554D] text-white font-semibold text-xs px-5 py-2.5 rounded-full flex items-center space-x-1.5 shadow-2xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>REMOVE</span>
              </button>
            </div>
          </div>
        </div>

        {/* PROMINENT AI SUMMARY (DATABASE-BACKED SYNTHETIC RECORD) */}
        <div className="rounded-3xl bg-white border-2 border-[#0D9488]/30 p-6 sm:p-7 shadow-warm-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2DBD1] pb-3">
            <h2 className="text-base font-bold text-[#0F172A] flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#0D9488]" />
              <span>Doctor-Facing AI Clinical Summary</span>
            </h2>
            <span className="text-[10px] font-mono font-bold bg-[#E6F4F1] text-[#0D9488] px-3 py-1 rounded-full border border-[#0D9488]/30">
              {apt.summarySource === 'DEMO' ? 'DATABASE SYNTHETIC DEMO' : 'MODULE 2 VALIDATED'}
            </span>
          </div>

          <div className="p-5 bg-[#0F172A] text-slate-100 rounded-2xl font-mono text-xs whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner">
            {apt.aiSummary || 'No AI summary stored for this appointment record.'}
          </div>
        </div>

        {/* Patient Problem & Profile Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 rounded-3xl bg-white border border-[#E2DBD1] p-6 shadow-warm space-y-5">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider flex items-center space-x-2 border-b border-[#E2DBD1] pb-3">
              <User className="w-4 h-4 text-[#0D9488]" />
              <span>Patient Stated Problem & AI Intake Q&A</span>
            </h3>

            <div>
              <span className="text-xs font-semibold text-[#64748B] uppercase block mb-1.5">Chief Complaint</span>
              <div className="p-3.5 bg-[#F6F1E9] rounded-2xl border border-[#E2DBD1] text-xs sm:text-sm text-[#0F172A] font-medium leading-relaxed">
                {apt.problem}
              </div>
            </div>

            {/* AI Follow-up Questions & Answers */}
            <div>
              <span className="text-xs font-semibold text-[#64748B] uppercase block mb-2.5">
                AI Intake Questions & Answers ({answers.length})
              </span>
              {answers.length === 0 ? (
                <p className="text-xs text-[#94A3B8]">No follow-up questions recorded for this session.</p>
              ) : (
                <div className="space-y-2.5">
                  {answers.map((fa, i) => (
                    <div key={i} className="p-3.5 bg-[#F6F1E9] rounded-2xl border border-[#E2DBD1] text-xs space-y-1">
                      <div className="font-bold text-[#0D9488]">Q{i + 1}: {fa.question}</div>
                      <div className="text-[#0F172A] font-medium pl-2 border-l-2 border-[#0D9488]/40">
                        {fa.answer}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Patient Demographics Sidebar */}
          <div className="rounded-3xl bg-white border border-[#E2DBD1] p-6 shadow-warm space-y-4">
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider border-b border-[#E2DBD1] pb-3 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-[#0D9488]" />
              <span>Demographics</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#64748B] block font-medium">Patient Full Name</span>
                <span className="font-bold text-[#0F172A] text-sm">{pat.name}</span>
              </div>

              <div>
                <span className="text-[#64748B] block font-medium">Age & Gender</span>
                <span className="font-semibold text-[#0F172A]">{pat.age || 35} Years / {pat.gender || 'Male'}</span>
              </div>

              <div>
                <span className="text-[#64748B] block font-medium">Blood Group</span>
                <span className="font-bold text-[#0D9488] font-mono">{pat.bloodType || 'O+'}</span>
              </div>

              <div>
                <span className="text-[#64748B] block font-medium">Contact Phone</span>
                <span className="font-semibold text-[#0F172A] font-mono">{pat.phone || '+91 9876543210'}</span>
              </div>

              <div className="pt-2 border-t border-[#E2DBD1]">
                <span className="text-[#64748B] block font-medium mb-1.5">Medical History</span>
                <div className="flex flex-wrap gap-1">
                  {pat.medicalHistory && pat.medicalHistory.length > 0 ? (
                    pat.medicalHistory.map((h, idx) => (
                      <span key={idx} className="bg-[#EEE8DF] text-[#475569] px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                        {h}
                      </span>
                    ))
                  ) : (
                    <span className="text-[#94A3B8]">No preexisting conditions</span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Attached Documents & OCR Clinical Findings */}
        <div className="rounded-3xl bg-white border border-[#E2DBD1] p-6 shadow-warm space-y-4">
          <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider flex items-center space-x-2 border-b border-[#E2DBD1] pb-3">
            <FileText className="w-4 h-4 text-[#0D9488]" />
            <span>Attached Clinical Records & OCR Findings ({docs.length})</span>
          </h3>

          {docs.length === 0 ? (
            <p className="text-xs text-[#94A3B8] py-2">No external documents attached to this consultation record.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {docs.map((doc, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-[#E2DBD1] bg-[#F6F1E9]/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-xs text-[#0F172A] truncate">{doc.filename}</div>
                    <span className="text-[10px] bg-[#E6F4F1] text-[#0D9488] font-bold font-mono px-2 py-0.5 rounded-full uppercase">
                      {doc.fileType || 'PDF'}
                    </span>
                  </div>

                  {doc.extractedText && (
                    <div className="p-3 bg-white border border-[#E2DBD1] rounded-xl text-[11px] font-mono text-[#475569] max-h-36 overflow-y-auto leading-relaxed">
                      {doc.extractedText}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
