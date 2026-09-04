const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');
const Emergency = require('./models/Emergency');

const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sih_healthcare';

async function seedData() {
  try {
    await mongoose.connect(connStr);
    console.log('[Seed] Connected to MongoDB sih_healthcare...');

    // Clear stale collections
    await Appointment.deleteMany({});
    await Emergency.deleteMany({});
    console.log('[Seed] Cleared stale appointment and emergency records.');

    const doctorPass = await bcrypt.hash('doctor123', 10);
    const patientPass = await bcrypt.hash('patient123', 10);

    // 1. Idempotently Upsert Demo Doctors (6 core specialty doctors)
    const demoDoctors = [
      {
        hospitalId: 'HOSP101',
        doctorId: 'DOC-CARD-01',
        name: 'Dr. Rajesh Sharma',
        email: 'rajesh.cardio@aiims.org',
        password: doctorPass,
        department: 'Cardiology',
        specialization: 'Interventional Cardiology',
        hospital: 'AIIMS Metro Hospital',
        isDemo: true
      },
      {
        hospitalId: 'HOSP101',
        doctorId: 'DOC-NEUR-01',
        name: 'Dr. Ananya Roy',
        email: 'ananya.neuro@aiims.org',
        password: doctorPass,
        department: 'Neurology',
        specialization: 'Cognitive Neurology',
        hospital: 'AIIMS Metro Hospital',
        isDemo: true
      },
      {
        hospitalId: 'HOSP101',
        doctorId: 'DOC-ORTH-01',
        name: 'Dr. Vikram Malhotra',
        email: 'vikram.ortho@aiims.org',
        password: doctorPass,
        department: 'Orthopedics',
        specialization: 'Joint Replacement & Spine',
        hospital: 'AIIMS Metro Hospital',
        isDemo: true
      },
      {
        hospitalId: 'HOSP101',
        doctorId: 'DOC-PEDI-01',
        name: 'Dr. Sunita Patel',
        email: 'sunita.pedi@aiims.org',
        password: doctorPass,
        department: 'Pediatrics',
        specialization: 'Pediatric Care & Immunology',
        hospital: 'AIIMS Metro Hospital',
        isDemo: true
      },
      {
        hospitalId: 'HOSP101',
        doctorId: 'DOC-GEN-01',
        name: 'Dr. Amit Verma',
        email: 'amit.general@aiims.org',
        password: doctorPass,
        department: 'General Medicine',
        specialization: 'Internal Medicine & Critical Care',
        hospital: 'AIIMS Metro Hospital',
        isDemo: true
      },
      {
        hospitalId: 'HOSP101',
        doctorId: 'DOC-DERM-01',
        name: 'Dr. Priya Nair',
        email: 'priya.derm@aiims.org',
        password: doctorPass,
        department: 'Dermatology',
        specialization: 'Clinical & Cosmetic Dermatology',
        hospital: 'AIIMS Metro Hospital',
        isDemo: true
      }
    ];

    const seededDoctors = {};
    for (const doc of demoDoctors) {
      const d = await Doctor.findOneAndUpdate({ doctorId: doc.doctorId }, doc, { upsert: true, new: true });
      seededDoctors[doc.doctorId] = d;
    }
    console.log('[Seed] 6 Demo doctors seeded successfully.');

    // 2. Upsert Diverse Demo Patients
    const demoPatients = [
      {
        name: 'Aarav Mehta',
        email: 'aarav.mehta@example.com',
        password: patientPass,
        phone: '+91 9876543210',
        age: 44,
        gender: 'Male',
        bloodType: 'O+',
        medicalHistory: ['Essential Hypertension (3 yrs)', 'Penicillin Allergy'],
        declarationAccepted: true
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@example.com',
        password: patientPass,
        phone: '+91 9123456789',
        age: 32,
        gender: 'Female',
        bloodType: 'B+',
        medicalHistory: ['Episodic Migraine', 'Mild Bronchial Asthma'],
        declarationAccepted: true
      },
      {
        name: 'Rajeshwar Patel',
        email: 'rajeshwar.patel@example.com',
        password: patientPass,
        phone: '+91 9988776655',
        age: 58,
        gender: 'Male',
        bloodType: 'A+',
        medicalHistory: ['Grade II Osteoarthritis', 'Type 2 Diabetes'],
        declarationAccepted: true
      },
      {
        name: 'Sunita Devi',
        email: 'sunita.devi@example.com',
        password: patientPass,
        phone: '+91 9765432109',
        age: 56,
        gender: 'Female',
        bloodType: 'AB+',
        medicalHistory: ['Type 2 Diabetes (8 yrs)', 'Bilateral Ankle Edema', 'Ciprofloxacin Allergy'],
        declarationAccepted: true
      },
      {
        name: 'Rahul Verma',
        email: 'rahul.verma@example.com',
        password: patientPass,
        phone: '+91 9654321098',
        age: 38,
        gender: 'Male',
        bloodType: 'B+',
        medicalHistory: ['Occipital Tension Headaches', 'Borderline Hypertension'],
        declarationAccepted: true
      },
      {
        name: 'Kavita Nambiar',
        email: 'kavita.nambiar@example.com',
        password: patientPass,
        phone: '+91 9543210987',
        age: 48,
        gender: 'Female',
        bloodType: 'O-',
        medicalHistory: ['Hypothyroidism (Levothyroxine 75mcg)', 'Chronic Fatigue', 'Sulfa Allergy'],
        declarationAccepted: true
      },
      {
        name: 'Master Aniket Gupta',
        email: 'aniket.gupta@example.com',
        password: patientPass,
        phone: '+91 9432109876',
        age: 8,
        gender: 'Male',
        bloodType: 'A+',
        medicalHistory: ['Recurrent Allergic Bronchitis', 'Nut Allergy'],
        declarationAccepted: true
      },
      {
        name: 'Vikramaditya Sengupta',
        email: 'vikram.sengupta@example.com',
        password: patientPass,
        phone: '+91 9321098765',
        age: 67,
        gender: 'Male',
        bloodType: 'B+',
        medicalHistory: ['Post-PCI Stenting (2024)', 'Dyslipidemia', 'On Dual Antiplatelets'],
        declarationAccepted: true
      },
      {
        name: 'Meera Deshmukh',
        email: 'meera.deshmukh@example.com',
        password: patientPass,
        phone: '+91 9210987654',
        age: 29,
        gender: 'Female',
        bloodType: 'O+',
        medicalHistory: ['Atopic Dermatitis', 'Nickel Contact Allergy'],
        declarationAccepted: true
      }
    ];

    const seededPatients = {};
    for (const pat of demoPatients) {
      const p = await Patient.findOneAndUpdate({ email: pat.email }, pat, { upsert: true, new: true });
      seededPatients[pat.email] = p;
    }
    console.log('[Seed] 9 Demo patients seeded successfully.');

    const todayStr = new Date().toISOString().split('T')[0];

    // 3. Seed Appointments with Rich Multi-turn Data and Documents
    const demoAppointments = [
      // CARDIOLOGY (Dr. Rajesh Sharma)
      {
        appointmentId: 'APT-CARD-001',
        patient: seededPatients['aarav.mehta@example.com']._id,
        doctor: seededDoctors['DOC-CARD-01']._id,
        slotId: 'slot-0900',
        slotLabel: '09:00 AM - 09:30 AM',
        queueNumber: 1,
        date: todayStr,
        problem: 'Substernal chest tightness & epigastric discomfort on exertion for 2 hours, radiating to left shoulder with mild breathlessness.',
        followupAnswers: [
          { question: 'When did the chest pain begin and does it radiate?', answer: 'Started 2 hours ago climbing stairs, radiating to left shoulder and neck.' },
          { question: 'Are you experiencing shortness of breath or sweating?', answer: 'Yes, mild breathlessness and cold sweating.' },
          { question: 'Do you have personal or family history of heart disease?', answer: 'Hypertensive for 3 years on Telmisartan. Father had MI at age 52.' }
        ],
        documents: [
          {
            documentId: 'DOC-ECG-001',
            filename: 'Apollo_Cardiology_ECG_Report.pdf',
            fileType: 'pdf',
            extractedText: 'ECG FINDINGS: Normal sinus rhythm, rate 78 bpm. Mild non-specific ST segment flattening in anterolateral leads V4-V6. No acute ST elevation observed.',
            confidence: 0.98
          }
        ],
        summarySource: 'DEMO',
        aiSummary: `CLINICAL INTAKE SUMMARY [DEMO REFERENCE]\n--------------------------------------------------------------------------------\nPATIENT: Aarav Mehta | AGE/GENDER: 44Y / Male | BLOOD: O+\nDEPARTMENT: Cardiology | ATTENDING: Dr. Rajesh Sharma\n\nCHIEF COMPLAINT:\nAcute substernal chest tightness and epigastric discomfort starting 2 hours prior during physical exertion (climbing stairs). Radiates to left shoulder with diaphoresis.\n\nINTAKE SYMPTOMATOLOGY:\n- Severity: Rated 7/10 pressure-like discomfort, partially relieved by rest.\n- Associated Findings: Mild dyspnea on exertion (+), diaphoresis (+), palpitations (-).\n- Prior History: Essential Hypertension (3 years, on Telmisartan 40mg OD). No prior myocardial infarction.\n- Document Findings: Attached ECG report indicates normal sinus rhythm with mild non-specific ST-T changes.\n\nRECOMMENDED CLINICAL ACTION:\nImmediate 12-lead serial ECG, cardiac troponin panel (high-sensitivity Troponin-I), and blood pressure monitoring.`,
        status: 'CONFIRMED'
      },
      {
        appointmentId: 'APT-CARD-002',
        patient: seededPatients['vikram.sengupta@example.com']._id,
        doctor: seededDoctors['DOC-CARD-01']._id,
        slotId: 'slot-0930',
        slotLabel: '09:30 AM - 10:00 AM',
        queueNumber: 2,
        date: todayStr,
        problem: 'Routine 6-month post-angioplasty follow-up and lipid panel review.',
        followupAnswers: [
          { question: 'Are you experiencing any recurrence of angina or chest heaviness?', answer: 'No chest pain. Mild fatigue after walking 2 km.' },
          { question: 'Are you taking your blood thinners regularly?', answer: 'Yes, taking Aspirin 75mg and Clopidogrel 75mg daily without skipping.' }
        ],
        documents: [
          {
            documentId: 'DOC-LIPID-001',
            filename: 'DrLalPath_Lipid_Profile.pdf',
            fileType: 'pdf',
            extractedText: 'LIPID PROFILE: Total Cholesterol: 168 mg/dL, LDL: 64 mg/dL (Target <70 mg/dL), HDL: 46 mg/dL, Triglycerides: 142 mg/dL. Renal Profile: Serum Creatinine 1.0 mg/dL.',
            confidence: 0.99
          }
        ],
        summarySource: 'DEMO',
        aiSummary: `CLINICAL INTAKE SUMMARY [DEMO REFERENCE]\n--------------------------------------------------------------------------------\nPATIENT: Vikramaditya Sengupta | AGE/GENDER: 67Y / Male | BLOOD: B+\nDEPARTMENT: Cardiology | ATTENDING: Dr. Rajesh Sharma\n\nCHIEF COMPLAINT:\nRoutine 6-month post-PCI coronary stenting surveillance and medication compliance audit.\n\nINTAKE SYMPTOMATOLOGY:\n- Status: Asymptomatic at rest. NYHA Class I functional status.\n- Medication Audit: Dual antiplatelet therapy (DAPT) compliant. Atorvastatin 40mg hs tolerated well.\n- Lab Biomarkers: LDL well-controlled at 64 mg/dL. Renal function normal.\n\nRECOMMENDED CLINICAL ACTION:\nMaintain DAPT protocol, echocardiography annual review scheduled, lifestyle counseling.`,
        status: 'CONFIRMED'
      },
      {
        appointmentId: 'APT-CARD-003',
        patient: seededPatients['priya.sharma@example.com']._id,
        doctor: seededDoctors['DOC-CARD-01']._id,
        slotId: 'slot-1000',
        slotLabel: '10:00 AM - 10:30 AM',
        queueNumber: 3,
        date: todayStr,
        problem: 'Occasional palpitations and rapid heart flutter after exercise.',
        followupAnswers: [
          { question: 'How often do palpitations occur?', answer: 'Twice this week during morning jogging, lasting 5-10 minutes.' },
          { question: 'Any associated syncope, dizziness or breathlessness?', answer: 'No fainting. Felt lightheaded once.' }
        ],
        documents: [],
        summarySource: 'DEMO',
        aiSummary: `CLINICAL INTAKE SUMMARY [DEMO REFERENCE]\n--------------------------------------------------------------------------------\nPATIENT: Priya Sharma | AGE/GENDER: 32Y / Female | BLOOD: B+\nDEPARTMENT: Cardiology | ATTENDING: Dr. Rajesh Sharma\n\nCHIEF COMPLAINT:\nExertional palpitations and rapid heartbeat sensations without syncope.\n\nRECOMMENDED CLINICAL ACTION:\n24-Hour Holter monitor evaluation, serum electrolytes (K+, Mg++), thyroid profile.`,
        status: 'CONFIRMED'
      },
      {
        appointmentId: 'APT-CARD-004',
        patient: seededPatients['sunita.devi@example.com']._id,
        doctor: seededDoctors['DOC-CARD-01']._id,
        slotId: 'slot-1030',
        slotLabel: '10:30 AM - 11:00 AM',
        queueNumber: 4,
        date: todayStr,
        problem: 'Progressive bilateral ankle swelling and exertional breathlessness over 2 weeks.',
        followupAnswers: [
          { question: 'Do your ankles swell more towards the evening?', answer: 'Yes, pitting swelling around ankles. Tight shoes.' },
          { question: 'Do you need extra pillows to sleep at night?', answer: 'Sleep on 2 pillows; feel breathless when lying flat.' }
        ],
        documents: [
          {
            documentId: 'DOC-LAB-004',
            filename: 'Metabolic_Panel_HbA1c.pdf',
            fileType: 'pdf',
            extractedText: 'LAB RESULTS: Fasting Blood Sugar: 164 mg/dL, HbA1c: 8.6%, Serum Creatinine: 1.4 mg/dL, eGFR: 48 mL/min/1.73m2 (Stage 3a CKD).',
            confidence: 0.97
          }
        ],
        summarySource: 'DEMO',
        aiSummary: `CLINICAL INTAKE SUMMARY [DEMO REFERENCE]\n--------------------------------------------------------------------------------\nPATIENT: Sunita Devi | AGE/GENDER: 56Y / Female | BLOOD: AB+\nDEPARTMENT: Cardiology | ATTENDING: Dr. Rajesh Sharma\n\nCHIEF COMPLAINT:\nExertional dyspnea and bilateral pitting ankle edema with orthopnea (2-pillow requirement).\n\nINTAKE SYMPTOMATOLOGY:\n- Cardiovascular: Exertional dyspnea (+), orthopnea (+), PND (-), ankle edema (+).\n- Comorbidities: Longstanding T2D (8 yrs) and CKD Stage 3a (Creatinine 1.4, eGFR 48).\n\nRECOMMENDED CLINICAL ACTION:\n2D Echocardiography for ejection fraction / diastolic dysfunction, initiate low-dose loop diuretic, nephrology co-consult.`,
        status: 'CONFIRMED'
      },

      // NEUROLOGY (Dr. Ananya Roy)
      {
        appointmentId: 'APT-NEUR-001',
        patient: seededPatients['priya.sharma@example.com']._id,
        doctor: seededDoctors['DOC-NEUR-01']._id,
        slotId: 'slot-0900',
        slotLabel: '09:00 AM - 09:30 AM',
        queueNumber: 1,
        date: todayStr,
        problem: 'Severe unilateral throbbing right-sided headache for 3 days with photophobia and nausea.',
        followupAnswers: [
          { question: 'How frequently do these headaches occur and what is the pain intensity?', answer: 'Rated 8/10 throbbing intensity on the right temporal region.' },
          { question: 'Have you noticed any visual disturbances or dizziness?', answer: 'Photophobia and mild blurriness without aura.' },
          { question: 'Did you take any migraine medications?', answer: 'Took Naproxen 500mg with minimal relief.' }
        ],
        documents: [
          {
            documentId: 'DOC-NEUR-002',
            filename: 'Neurology_Prescription_Slip.pdf',
            fileType: 'pdf',
            extractedText: 'CLINICAL NOTE: Known history of migraine with nausea. Advised trigger management, adequate hydration, and SOS Naproxen.',
            confidence: 0.95
          }
        ],
        summarySource: 'DEMO',
        aiSummary: `CLINICAL INTAKE SUMMARY [DEMO REFERENCE]\n--------------------------------------------------------------------------------\nPATIENT: Priya Sharma | AGE/GENDER: 32Y / Female | BLOOD: B+\nDEPARTMENT: Neurology | ATTENDING: Dr. Ananya Roy\n\nCHIEF COMPLAINT:\nRight-sided hemicranial throbbing headache lasting 72 hours, aggravated by bright light and screen exposure.\n\nRECOMMENDED CLINICAL ACTION:\nNeurological examination, Sumatriptan 50mg SOS prescription, and migraine prophylaxis review (Propranolol / Topiramate).`,
        status: 'CONFIRMED'
      },
      {
        appointmentId: 'APT-NEUR-002',
        patient: seededPatients['rahul.verma@example.com']._id,
        doctor: seededDoctors['DOC-NEUR-01']._id,
        slotId: 'slot-0930',
        slotLabel: '09:30 AM - 10:00 AM',
        queueNumber: 2,
        date: todayStr,
        problem: 'Occipital band-like headache and neck tension radiating to shoulders after long desk work.',
        followupAnswers: [
          { question: 'How long does the pain last?', answer: 'Continuous heavy ache for the past 5 days, worse in late afternoons.' },
          { question: 'Any numbness or tingling in the arms?', answer: 'No arm weakness or numbness.' }
        ],
        documents: [],
        summarySource: 'DEMO',
        aiSummary: `CLINICAL INTAKE SUMMARY [DEMO REFERENCE]\n--------------------------------------------------------------------------------\nPATIENT: Rahul Verma | AGE/GENDER: 38Y / Male | BLOOD: B+\nDEPARTMENT: Neurology | ATTENDING: Dr. Ananya Roy\n\nCHIEF COMPLAINT:\nChronic tension-type headache with cervicogenic muscular spasm related to prolonged postural strain.\n\nRECOMMENDED CLINICAL ACTION:\nErgonomic correction, neck isometric physiotherapy, short-course muscle relaxant.`,
        status: 'CONFIRMED'
      },

      // ORTHOPEDICS (Dr. Vikram Malhotra)
      {
        appointmentId: 'APT-ORTH-001',
        patient: seededPatients['rajeshwar.patel@example.com']._id,
        doctor: seededDoctors['DOC-ORTH-01']._id,
        slotId: 'slot-0900',
        slotLabel: '09:00 AM - 09:30 AM',
        queueNumber: 1,
        date: todayStr,
        problem: 'Bilateral knee joint pain and morning stiffness lasting >45 minutes for past 6 months.',
        followupAnswers: [
          { question: 'Which joint is affected and is there visible swelling?', answer: 'Both knees, especially medial joint line. No acute erythema.' },
          { question: 'Does the pain worsen during movement or stairs?', answer: 'Pain sharply increases when climbing stairs and standing from low chairs.' }
        ],
        documents: [
          {
            documentId: 'DOC-RAD-003',
            filename: 'Knee_Radiograph_Report.pdf',
            fileType: 'pdf',
            extractedText: 'RADIOLOGY REPORT: Bilateral Knee Weight-Bearing Radiograph. Moderate medial joint space narrowing, subchondral sclerosis, and marginal osteophytes present. Kellgren-Lawrence Grade II Osteoarthritis.',
            confidence: 0.96
          }
        ],
        summarySource: 'DEMO',
        aiSummary: `CLINICAL INTAKE SUMMARY [DEMO REFERENCE]\n--------------------------------------------------------------------------------\nPATIENT: Rajeshwar Patel | AGE/GENDER: 58Y / Male | BLOOD: A+\nDEPARTMENT: Orthopedics | ATTENDING: Dr. Vikram Malhotra\n\nCHIEF COMPLAINT:\nProgressive bilateral weight-bearing knee pain and joint stiffness, notably worse after waking and stairs.\n\nRECOMMENDED CLINICAL ACTION:\nPhysical therapy assessment, quadriceps strengthening regimen, NSAID topical gel, intra-articular hyaluronic acid review.`,
        status: 'CONFIRMED'
      },

      // PEDIATRICS (Dr. Sunita Patel)
      {
        appointmentId: 'APT-PEDI-001',
        patient: seededPatients['aniket.gupta@example.com']._id,
        doctor: seededDoctors['DOC-PEDI-01']._id,
        slotId: 'slot-0900',
        slotLabel: '09:00 AM - 09:30 AM',
        queueNumber: 1,
        date: todayStr,
        problem: 'Recurrent night-time dry coughing and mild wheeze following viral upper respiratory infection.',
        followupAnswers: [
          { question: 'How long has the cough been present?', answer: 'Last 10 days, worse between 2 AM and 5 AM.' },
          { question: 'Any fever or difficulty breathing today?', answer: 'No high fever today; breathing is slightly faster when running.' }
        ],
        documents: [],
        summarySource: 'DEMO',
        aiSummary: `CLINICAL INTAKE SUMMARY [DEMO REFERENCE]\n--------------------------------------------------------------------------------\nPATIENT: Master Aniket Gupta | AGE/GENDER: 8Y / Male | BLOOD: A+\nDEPARTMENT: Pediatrics | ATTENDING: Dr. Sunita Patel\n\nCHIEF COMPLAINT:\nPost-viral reactive airway cough with nocturnal exacerbation.\n\nRECOMMENDED CLINICAL ACTION:\nChest auscultation, Levosalbutamol inhaler with spacer, pediatric allergy evaluation.`,
        status: 'CONFIRMED'
      },

      // GENERAL MEDICINE (Dr. Amit Verma)
      {
        appointmentId: 'APT-GEN-001',
        patient: seededPatients['kavita.nambiar@example.com']._id,
        doctor: seededDoctors['DOC-GEN-01']._id,
        slotId: 'slot-0900',
        slotLabel: '09:00 AM - 09:30 AM',
        queueNumber: 1,
        date: todayStr,
        problem: 'Chronic generalized fatigue, cold intolerance, and 4 kg unintended weight gain despite low appetite.',
        followupAnswers: [
          { question: 'Are you taking thyroid medication?', answer: 'Taking Eltroxin 75mcg in morning on empty stomach for 2 years.' },
          { question: 'Have you checked your TSH recently?', answer: 'Last blood test was 8 months ago.' }
        ],
        documents: [],
        summarySource: 'DEMO',
        aiSummary: `CLINICAL INTAKE SUMMARY [DEMO REFERENCE]\n--------------------------------------------------------------------------------\nPATIENT: Kavita Nambiar | AGE/GENDER: 48Y / Female | BLOOD: O-\nDEPARTMENT: General Medicine | ATTENDING: Dr. Amit Verma\n\nCHIEF COMPLAINT:\nUnresolved lethargy, weight gain, and cold intolerance in known hypothyroidism.\n\nRECOMMENDED CLINICAL ACTION:\nSerum TSH, Free T3/T4, Complete Blood Count, Serum Ferritin, Vitamin D & B12 screening.`,
        status: 'CONFIRMED'
      },

      // DERMATOLOGY (Dr. Priya Nair)
      {
        appointmentId: 'APT-DERM-001',
        patient: seededPatients['meera.deshmukh@example.com']._id,
        doctor: seededDoctors['DOC-DERM-01']._id,
        slotId: 'slot-0900',
        slotLabel: '09:00 AM - 09:30 AM',
        queueNumber: 1,
        date: todayStr,
        problem: 'Intensely pruritic erythematous scaly plaques in flexural folds of both arms and neck for 3 weeks.',
        followupAnswers: [
          { question: 'Does the itching interfere with sleep?', answer: 'Yes, severe nocturnal itching.' },
          { question: 'Any recent change in soaps or cosmetics?', answer: 'Started using a scented body wash 1 month ago.' }
        ],
        documents: [],
        summarySource: 'DEMO',
        aiSummary: `CLINICAL INTAKE SUMMARY [DEMO REFERENCE]\n--------------------------------------------------------------------------------\nPATIENT: Meera Deshmukh | AGE/GENDER: 29Y / Female | BLOOD: O+\nDEPARTMENT: Dermatology | ATTENDING: Dr. Priya Nair\n\nCHIEF COMPLAINT:\nAtopic dermatitis flare-up with flexural eczema and intense pruritus.\n\nRECOMMENDED CLINICAL ACTION:\nTopical Fluticasone cream, barrier repair ceramides, non-sedating oral antihistamine.`,
        status: 'CONFIRMED'
      }
    ];

    for (const apt of demoAppointments) {
      await Appointment.create(apt);
    }
    console.log('[Seed] Multi-specialty demo appointments seeded successfully.');

    // 4. Seed 4 Real Database Emergency Records
    const demoEmergencies = [
      {
        emergencyId: 'EMG-DEMO-001',
        patient: seededPatients['aarav.mehta@example.com']._id,
        status: 'ACTIVE',
        severity: 'CRITICAL',
        reason: 'Acute crushing chest discomfort radiating to left arm with cold diaphoresis.',
        notes: 'Priority triage: Resuscitation Bay 1. 12-Lead ECG stat ordered.'
      },
      {
        emergencyId: 'EMG-DEMO-002',
        patient: seededPatients['priya.sharma@example.com']._id,
        status: 'ACTIVE',
        severity: 'HIGH',
        reason: 'Acute intractable migraine attack with persistent vomiting and dehydration.',
        notes: 'Observation cubicle 3: IV antiemetic and hydration initiated.'
      },
      {
        emergencyId: 'EMG-DEMO-003',
        patient: seededPatients['sunita.devi@example.com']._id,
        status: 'ACTIVE',
        severity: 'CRITICAL',
        reason: 'Acute respiratory distress with SpO2 89% on room air and bilateral basal crepitations.',
        notes: 'High-flow oxygen started via nasal cannula; chest X-ray ordered.'
      },
      {
        emergencyId: 'EMG-DEMO-004',
        patient: seededPatients['aniket.gupta@example.com']._id,
        status: 'ACTIVE',
        severity: 'HIGH',
        reason: 'Acute febrile episode (103.2°F) with tachypnea and severe wheezing.',
        notes: 'Pediatric emergency triage: Nebulization stat with Budesonide/Levosalbutamol.'
      }
    ];

    for (const emg of demoEmergencies) {
      await Emergency.create(emg);
    }
    console.log('[Seed] 4 Demo database emergency records seeded successfully.');

    await mongoose.disconnect();
    console.log('[Seed] Seeding complete.');
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
}

seedData();
