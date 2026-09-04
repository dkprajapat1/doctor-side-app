import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import { getDoctorQueue, getEmergencies, resolveEmergency } from '../services/api';
import Link from 'next/link';
import { 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  XCircle, 
  User, 
  Calendar, 
  FileText, 
  ArrowRight, 
  ShieldCheck, 
  Activity, 
  AlertOctagon, 
  Phone, 
  Check,
  Flame,
  Sparkles
} from 'lucide-react';

export default function DoctorDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [resolvingEmgId, setResolvingEmgId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [queueRes, emgRes] = await Promise.all([
        getDoctorQueue(),
        getEmergencies().catch(() => ({ emergencies: [] }))
      ]);

      if (queueRes.error) {
        if (queueRes.message.includes('token') || queueRes.message.includes('authorized')) {
          localStorage.removeItem('doctor_token');
          router.push('/');
          return;
        }
        setErrorMsg(queueRes.message);
      } else {
        setData(queueRes);
      }

      if (emgRes && emgRes.emergencies) {
        setEmergencies(emgRes.emergencies);
      }
    } catch (err) {
      setErrorMsg('Failed to sync queue data with server.');
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
    fetchDashboardData();
    // Auto-poll queue & emergencies every 3 seconds for real-time sync with MongoDB
    const interval = setInterval(fetchDashboardData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('doctor_token');
    router.push('/');
  };

  const handleResolveEmergency = async (emgId) => {
    setResolvingEmgId(emgId);
    try {
      await resolveEmergency(emgId);
      fetchDashboardData();
    } catch (e) {
      console.error('Failed to resolve emergency:', e);
    } finally {
      setResolvingEmgId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F1E9] flex items-center justify-center">
        <div className="flex items-center space-x-3 text-[#0D9488]">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="font-semibold text-[#0F172A]">Syncing Live OPD Queue & Clinical Records...</span>
        </div>
      </div>
    );
  }

  const doctor = data?.doctor || {};
  const stats = data?.stats || {};
  const activeQueue = data?.activeQueue || [];
  const solvedQueue = data?.solvedQueue || [];
  const removedQueue = data?.removedQueue || [];
  const noAttemptQueue = data?.noAttemptQueue || [];

  // Helper to sort by earliest time slot first (9:00 AM before 11:00 AM)
  const parseTimeToMinutes = (apt) => {
    const str = (apt.slotLabel || apt.slotId || '').trim();
    const match = str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const meridian = match[3] ? match[3].toUpperCase() : null;
      if (meridian === 'PM' && hours < 12) hours += 12;
      if (meridian === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    }
    return (apt.queueNumber || 999) * 10;
  };

  const sortedActiveQueue = [...activeQueue].sort((a, b) => {
    const timeDiff = parseTimeToMinutes(a) - parseTimeToMinutes(b);
    if (timeDiff !== 0) return timeDiff;
    return (a.queueNumber || 0) - (b.queueNumber || 0);
  });

  return (
    <div className="min-h-screen bg-[#F6F1E9] text-[#0F172A] font-['Plus_Jakarta_Sans',sans-serif]">
      <Header doctor={doctor} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Doctor Identity & OPD Banner */}
        <div className="rounded-3xl bg-[#0F172A] text-white p-7 sm:p-8 shadow-warm-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-[#0D9488]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start sm:items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-[#0D9488]/20 border border-[#0D9488]/40 flex items-center justify-center text-[#14B8A6] shrink-0">
                <ShieldCheck className="w-9 h-9" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">{doctor.name}</h1>
                  <span className="text-xs bg-[#0D9488] text-white font-semibold px-3 py-0.5 rounded-full shadow-2xs">
                    {doctor.department}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mt-1">
                  {doctor.hospital || 'AIIMS Metro Hospital'} • OPD Physician Desk • Real-time MongoDB Queue
                </p>
              </div>
            </div>

            <button
              onClick={fetchDashboardData}
              className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 🚨 LIVE DATABASE-BACKED EMERGENCY SECTION                                 */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-white border border-[#E2DBD1] p-6 sm:p-7 shadow-warm-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2DBD1] pb-4">
            <div className="flex items-center space-x-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
              </span>
              <h2 className="text-lg font-bold text-[#0F172A] flex items-center space-x-2">
                <span>🚨 Emergency Requests</span>
              </h2>
              <span className="text-xs font-mono font-bold bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200">
                {emergencies.length} ACTIVE
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#64748B]">
              Real-time Hospital Triage Feed
            </span>
          </div>

          {emergencies.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#64748B] flex items-center justify-center space-x-2 bg-[#F6F1E9]/50 rounded-2xl border border-[#E2DBD1]/60">
              <CheckCircle2 className="w-4 h-4 text-[#5F8F73]" />
              <span>No active emergency requests across triage units. All units normal.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {emergencies.map((emg) => {
                const pat = emg.patient || {};
                const emgTime = new Date(emg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div
                    key={emg._id}
                    className="p-5 rounded-2xl border-2 border-rose-200 bg-rose-50/40 hover:bg-rose-50/70 transition-all space-y-3 relative shadow-2xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-base text-[#0F172A]">{pat.name || 'Emergency Patient'}</span>
                          <span className="text-[10px] font-mono font-extrabold bg-rose-600 text-white px-2 py-0.5 rounded-full">
                            {emg.status || 'ACTIVE'}
                          </span>
                        </div>
                        <p className="text-xs text-[#64748B] mt-0.5">
                          {pat.age || 35}Y / {pat.gender || 'M'} • Blood: <strong className="text-rose-700">{pat.bloodType || 'O+'}</strong>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-[#0F172A] bg-white px-2.5 py-1 rounded-lg border border-rose-200 block shadow-2xs">
                          {emgTime}
                        </span>
                        <span className="text-[10px] text-[#64748B] block mt-1">Request Time</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-rose-200/80 text-xs text-[#0F172A] space-y-1">
                      <div className="font-semibold text-rose-900 flex items-center gap-1.5">
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>{emg.reason || 'Urgent medical assistance requested'}</span>
                      </div>
                      {emg.notes && (
                        <p className="text-[11px] text-[#64748B] italic">{emg.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div className="flex items-center space-x-1.5 text-[#64748B]">
                        <Phone className="w-3.5 h-3.5" />
                        <span className="font-mono">{pat.phone || '+91 9876543210'}</span>
                      </div>

                      <button
                        onClick={() => handleResolveEmergency(emg._id)}
                        disabled={resolvingEmgId === emg._id}
                        className="rounded-full bg-[#5F8F73] hover:bg-[#4A735C] text-white px-3.5 py-1.5 font-semibold text-xs inline-flex items-center space-x-1 shadow-2xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{resolvingEmgId === emg._id ? 'Resolving...' : 'Acknowledge & Resolve'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-white border border-[#E2DBD1] p-5 shadow-warm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-[#E6F4F1] text-[#0D9488] flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#0F172A]">{stats.activeQueueCount || activeQueue.length}</div>
              <div className="text-xs font-medium text-[#64748B]">Patients in Queue</div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#E2DBD1] p-5 shadow-warm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] text-[#5F8F73] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#0F172A]">{stats.solvedCount || solvedQueue.length}</div>
              <div className="text-xs font-medium text-[#64748B]">Solved Today</div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#E2DBD1] p-5 shadow-warm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-[#FFFBEB] text-[#C9954D] flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#0F172A]">{stats.noAttemptCount || noAttemptQueue.length}</div>
              <div className="text-xs font-medium text-[#64748B]">Rescheduled</div>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#E2DBD1] p-5 shadow-warm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-[#FEF2F2] text-[#DC6B63] flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-[#0F172A]">{stats.removedCount || removedQueue.length}</div>
              <div className="text-xs font-medium text-[#64748B]">Removed</div>
            </div>
          </div>
        </div>

        {/* Active Queue Table / List */}
        <div className="rounded-3xl bg-white border border-[#E2DBD1] p-6 sm:p-8 shadow-warm-lg space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#E2DBD1] pb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] flex items-center space-x-2">
                <Clock className="w-5 h-5 text-[#0D9488]" />
                <span>Today's Active Patient Consultation Queue</span>
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">Live OPD queue for {doctor.department}</p>
            </div>
            <span className="text-xs font-mono font-bold bg-[#E6F4F1] text-[#0D9488] px-3 py-1 rounded-full border border-[#0D9488]/30">
              {activeQueue.length} Waiting
            </span>
          </div>

          {sortedActiveQueue.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-[#E2DBD1] rounded-2xl bg-[#F6F1E9]/30">
              <User className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" />
              <p className="text-sm font-bold text-[#0F172A]">No active patients currently in your queue.</p>
              <p className="text-xs text-[#64748B] mt-1">Bookings made in the intake kiosk will appear here in real time.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E2DBD1]/60">
              {sortedActiveQueue.map((apt) => {
                const pat = apt.patient || {};
                return (
                  <div
                    key={apt._id}
                    className="py-5 hover:bg-[#F6F1E9]/40 px-3 rounded-2xl transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start space-x-4">
                      {/* Queue Number Badge */}
                      <div className="w-13 h-13 rounded-2xl bg-[#0D9488] text-white font-extrabold flex items-center justify-center text-xl shadow-2xs shrink-0 font-mono">
                        #{apt.queueNumber}
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-base text-[#0F172A]">{pat.name || 'Patient'}</span>
                          <span className="text-xs bg-[#EEE8DF] text-[#475569] font-semibold px-2.5 py-0.5 rounded-full">
                            {pat.age || 35}Y / {pat.gender || 'M'} • Blood: {pat.bloodType || 'O+'}
                          </span>
                          {apt.status === 'RESCHEDULED' && (
                            <span className="text-[10px] bg-[#FEF3C7] text-[#92400E] font-bold px-2 py-0.5 rounded-full border border-[#FCD34D]">
                              Rescheduled
                            </span>
                          )}
                        </div>

                        <div className="text-xs font-semibold text-[#0D9488]">
                          Slot: {apt.slotLabel} • Ref ID: <span className="font-mono text-[#475569]">{apt.appointmentId}</span>
                        </div>

                        <div className="text-xs text-[#475569] line-clamp-1">
                          <strong className="text-[#0F172A]">Chief Complaint:</strong> {apt.problem}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/patient/${apt.appointmentId}`}
                      className="rounded-full bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-xs px-5 py-2.5 flex items-center space-x-1.5 shadow-xs transition-all active:scale-95 shrink-0 self-end md:self-auto cursor-pointer"
                    >
                      <span>Open Clinical Record & AI Summary</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
