const API_BASE = process.env.NEXT_PUBLIC_DOCTOR_API_URL || 'http://127.0.0.1:5001/api';

function getHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('doctor_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function loginDoctor(data) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function getMe() {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getHeaders()
  });
  return res.json();
}

export async function acceptNotice() {
  const res = await fetch(`${API_BASE}/auth/accept-notice`, {
    method: 'POST',
    headers: getHeaders()
  });
  return res.json();
}

export async function getPublicDoctors() {
  const res = await fetch(`${API_BASE}/doctor/public-list`);
  return res.json();
}

export async function getDoctorQueue() {
  const res = await fetch(`${API_BASE}/doctor/queue`, {
    headers: getHeaders()
  });
  return res.json();
}

export async function getPatientDetail(appointmentId) {
  const res = await fetch(`${API_BASE}/doctor/patient/${appointmentId}`, {
    headers: getHeaders()
  });
  return res.json();
}

export async function getEmergencies() {
  const res = await fetch(`${API_BASE}/doctor/emergencies`, {
    headers: getHeaders()
  });
  return res.json();
}

export async function resolveEmergency(emergencyId) {
  const res = await fetch(`${API_BASE}/doctor/emergencies/${emergencyId}/resolve`, {
    method: 'POST',
    headers: getHeaders()
  });
  return res.json();
}

export async function solveAppointment(appointmentId) {
  const res = await fetch(`${API_BASE}/action/solve/${appointmentId}`, {
    method: 'POST',
    headers: getHeaders()
  });
  return res.json();
}

export async function noAttemptAppointment(appointmentId) {
  const res = await fetch(`${API_BASE}/action/no-attempt/${appointmentId}`, {
    method: 'POST',
    headers: getHeaders()
  });
  return res.json();
}

export async function removeAppointment(appointmentId) {
  const res = await fetch(`${API_BASE}/action/remove/${appointmentId}`, {
    method: 'POST',
    headers: getHeaders()
  });
  return res.json();
}
