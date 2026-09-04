import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { loginDoctor, acceptNotice, getPublicDoctors } from '../services/api';
import NoticeModal from '../components/NoticeModal';
import { Stethoscope, Lock, Building, UserCheck, ArrowRight, ShieldCheck, HeartPulse, Sparkles } from 'lucide-react';

export default function DoctorLoginPage() {
  const router = useRouter();
  const [showNotice, setShowNotice] = useState(false);
  const [demoDoctorsList, setDemoDoctorsList] = useState([]);

  const [formData, setFormData] = useState({
    hospitalId: 'HOSP101',
    doctorId: 'DOC-CARD-01',
    password: 'doctor123'
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('doctor_token');
    if (token) {
      router.push('/dashboard');
      return;
    }

    // Dynamically fetch seeded demo doctors from MongoDB
    getPublicDoctors()
      .then(res => {
        if (res.doctors && res.doctors.length > 0) {
          setDemoDoctorsList(res.doctors);
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDemoSelect = (doc) => {
    setFormData({
      hospitalId: doc.hospitalId || 'HOSP101',
      doctorId: doc.doctorId,
      password: 'doctor123'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await loginDoctor(formData);
      if (res.error) {
        setErrorMsg(res.message);
        setLoading(false);
        return;
      }

      localStorage.setItem('doctor_token', res.token);

      const noticeAccepted = localStorage.getItem('doctor_notice_accepted');
      if (!noticeAccepted && !res.doctor?.noticeAccepted) {
        setShowNotice(true);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Doctor authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleNoticeAccept = async () => {
    localStorage.setItem('doctor_notice_accepted', 'true');
    setShowNotice(false);
    try {
      await acceptNotice();
    } catch (e) {}
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F6F1E9] text-[#0F172A] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <NoticeModal isOpen={showNotice} onAccept={handleNoticeAccept} />

      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-[#0D9488] rounded-3xl flex items-center justify-center text-white shadow-warm-lg mb-4">
          <HeartPulse className="w-9 h-9" />
        </div>
        <span className="font-mono text-xs uppercase tracking-widest text-[#0D9488] font-semibold">
          Hospital & OPD Portal
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif text-[#0F172A] font-bold mt-1 tracking-tight">
          Physician Consultation Desk
        </h1>
        <p className="mt-2 text-sm text-[#64748B]">
          AIIMS Metro Hospital • Live Patient Queue & Intake Management
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-[#E2DBD1] shadow-warm-lg">
          
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-[#0F172A]">Doctor Authentication</h2>
            <p className="text-xs text-[#64748B] mt-1">Sign in with your hospital credentials to access your OPD queue</p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Dynamic Demo Physician Quick-Selector from MongoDB */}
          <div className="mb-6 bg-[#F6F1E9] p-4 rounded-2xl border border-[#E2DBD1]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-mono font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Select Demo Physician</span>
              </span>
              <span className="text-[10px] bg-[#E6F4F1] text-[#0D9488] font-mono font-bold px-2 py-0.5 rounded-full border border-[#0D9488]/20">
                Database Records
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(demoDoctorsList.length > 0 ? demoDoctorsList : [
                { doctorId: 'DOC-CARD-01', name: 'Dr. Rajesh Sharma', department: 'Cardiology' },
                { doctorId: 'DOC-NEUR-01', name: 'Dr. Ananya Roy', department: 'Neurology' },
                { doctorId: 'DOC-ORTH-01', name: 'Dr. Vikram Malhotra', department: 'Orthopedics' }
              ]).map((doc) => {
                const isSelected = formData.doctorId === doc.doctorId;
                return (
                  <button
                    key={doc.doctorId}
                    type="button"
                    onClick={() => handleDemoSelect(doc)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-sm'
                        : 'bg-white text-[#0F172A] border-[#E2DBD1] hover:border-[#0D9488]/40 hover:bg-[#EEE8DF]'
                    }`}
                  >
                    <div className="text-xs font-bold truncate">{doc.name.replace('Dr. ', '')}</div>
                    <div className={`text-[10px] truncate ${isSelected ? 'text-teal-100' : 'text-[#64748B]'}`}>
                      {doc.department}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#475569] uppercase mb-1.5">Hospital ID</label>
              <div className="relative">
                <Building className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="hospitalId"
                  required
                  value={formData.hospitalId}
                  onChange={handleChange}
                  placeholder="e.g. HOSP101"
                  className="pl-10 w-full p-3 text-sm rounded-2xl border border-[#E2DBD1] bg-white text-[#0F172A] focus:outline-hidden focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] uppercase mb-1.5">Doctor ID</label>
              <div className="relative">
                <UserCheck className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="doctorId"
                  required
                  value={formData.doctorId}
                  onChange={handleChange}
                  placeholder="e.g. DOC-CARD-01"
                  className="pl-10 w-full p-3 text-sm rounded-2xl border border-[#E2DBD1] bg-white text-[#0F172A] focus:outline-hidden focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] uppercase mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pl-10 w-full p-3 text-sm rounded-2xl border border-[#E2DBD1] bg-white text-[#0F172A] focus:outline-hidden focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#0D9488] hover:bg-[#0F766E] text-white py-3.5 font-semibold text-sm flex items-center justify-center space-x-2 transition-all shadow-sm active:scale-95 cursor-pointer mt-6"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Doctor Desk'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
