const API_BASE = "http://127.0.0.1:5001/api";

async function loginDoctor(doctorId) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      hospitalId: "HOSP101",
      doctorId: doctorId,
      password: "doctor123"
    })
  }).then(r => r.json());
  return res;
}

async function runTests() {
  console.log("==================================================");
  console.log("RUNNING END-TO-END VERIFICATION SUITE");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  // TEST 1: Public Demo Doctors List from DB
  console.log("--> TEST 1: Fetching Demo Doctors from MongoDB...");
  try {
    const res = await fetch(`${API_BASE}/doctor/public-list`).then(r => r.json());
    if (res.success && res.doctors && res.doctors.length >= 3) {
      console.log(`[PASS] Fetched ${res.doctors.length} demo doctors from MongoDB:`);
      res.doctors.forEach(d => console.log(`  - ${d.name} (${d.department}) [${d.doctorId}]`));
      passed++;
    } else {
      console.error("[FAIL] Unexpected public doctors response:", res);
      failed++;
    }
  } catch (e) {
    console.error("[FAIL] Demo doctors test failed:", e.message);
    failed++;
  }

  // TEST 2: Doctor Authentication (Dr. Rajesh Sharma)
  console.log("\n--> TEST 2: Doctor Authentication...");
  let cardioToken = "";
  let neuroToken = "";
  try {
    const cardioRes = await loginDoctor("DOC-CARD-01");
    if (cardioRes.success && cardioRes.token) {
      cardioToken = cardioRes.token;
      console.log(`[PASS] Dr. Rajesh Sharma authenticated: ${cardioRes.doctor.name} (${cardioRes.doctor.department})`);
      passed++;
    } else {
      console.error("[FAIL] Cardio doctor auth failed:", cardioRes);
      failed++;
    }

    const neuroRes = await loginDoctor("DOC-NEUR-01");
    if (neuroRes.success && neuroRes.token) {
      neuroToken = neuroRes.token;
      console.log(`[PASS] Dr. Ananya Roy authenticated: ${neuroRes.doctor.name} (${neuroRes.doctor.department})`);
      passed++;
    }
  } catch (e) {
    console.error("[FAIL] Doctor auth failed:", e.message);
    failed++;
  }

  const cardioHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${cardioToken}`
  };

  const neuroHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${neuroToken}`
  };

  // TEST 3: Doctor Queue & Patient Details with Synthetic AI Summary
  console.log("\n--> TEST 3: Doctor Queue & Database-Backed AI Summary...");
  try {
    const queueRes = await fetch(`${API_BASE}/doctor/queue`, { headers: cardioHeaders }).then(r => r.json());
    if (queueRes.success && queueRes.activeQueue && queueRes.activeQueue.length > 0) {
      const firstApt = queueRes.activeQueue[0];
      console.log(`[PASS] Queue fetched: ${queueRes.activeQueue.length} patient(s). First patient: ${firstApt.patient?.name} (Queue #${firstApt.queueNumber})`);
      passed++;

      // Fetch Patient Detail
      const detailRes = await fetch(`${API_BASE}/doctor/patient/${firstApt.appointmentId}`, { headers: cardioHeaders }).then(r => r.json());
      if (detailRes.success && detailRes.appointment) {
        const apt = detailRes.appointment;
        const hasValidSummary = apt.aiSummary && apt.aiSummary.includes("CLINICAL INTAKE SUMMARY") && !apt.aiSummary.includes("Not specified");
        if (hasValidSummary) {
          console.log(`[PASS] Patient detail & AI summary fetched from MongoDB. Summary source: ${apt.summarySource || 'DEMO'}`);
          console.log("  Summary preview:\n" + apt.aiSummary.split("\n").slice(0, 4).map(l => "    " + l).join("\n"));
          passed++;
        } else {
          console.error("[FAIL] AI summary is invalid:", apt.aiSummary);
          failed++;
        }
      } else {
        console.error("[FAIL] Patient detail fetch failed:", detailRes);
        failed++;
      }
    } else {
      console.error("[FAIL] Empty or invalid doctor queue:", queueRes);
      failed++;
    }
  } catch (e) {
    console.error("[FAIL] Doctor queue test failed:", e.message);
    failed++;
  }

  // TEST 4: Database-Backed Emergency Requests & Resolution
  console.log("\n--> TEST 4: Live Database-Backed Emergency Requests...");
  try {
    const emgRes = await fetch(`${API_BASE}/doctor/emergencies`, { headers: cardioHeaders }).then(r => r.json());
    if (emgRes.success && emgRes.emergencies && emgRes.emergencies.length > 0) {
      console.log(`[PASS] Retrieved ${emgRes.emergencies.length} active emergency request(s) from MongoDB:`);
      emgRes.emergencies.forEach((emg, idx) => {
        console.log(`  ${idx + 1}. [${emg.status}] Patient: ${emg.patient?.name} | Severity: ${emg.severity} | Reason: ${emg.reason}`);
      });
      passed++;

      // Test Emergency Resolution
      const testEmg = emgRes.emergencies[0];
      const resolveRes = await fetch(`${API_BASE}/doctor/emergencies/${testEmg._id}/resolve`, {
        method: "POST",
        headers: cardioHeaders
      }).then(r => r.json());

      if (resolveRes.success && resolveRes.emergency?.status === "RESOLVED") {
        console.log(`[PASS] Successfully resolved emergency ${testEmg.emergencyId}`);
        passed++;
      } else {
        console.error("[FAIL] Emergency resolve failed:", resolveRes);
        failed++;
      }
    } else {
      console.error("[FAIL] No emergencies found or request failed:", emgRes);
      failed++;
    }
  } catch (e) {
    console.error("[FAIL] Emergency test failed:", e.message);
    failed++;
  }

  // TEST 5: Doctor Consultation Actions
  console.log("\n--> TEST 5: Doctor Consultation Actions (Solve / No-Attempt / Remove)...");
  try {
    // 5A. SOLVE
    const solveRes = await fetch(`${API_BASE}/action/solve/APT-DEMO-CARD-001`, {
      method: "POST",
      headers: cardioHeaders
    }).then(r => r.json());

    if (solveRes.success && solveRes.appointment?.status === "SOLVED") {
      console.log(`[PASS] SOLVE action verified for APT-DEMO-CARD-001 (Status: SOLVED)`);
      passed++;
    } else {
      console.error("[FAIL] SOLVE action failed:", solveRes);
      failed++;
    }

    // 5B. NO ATTEMPT (Reschedule)
    const noAttemptRes = await fetch(`${API_BASE}/action/no-attempt/APT-DEMO-CARD-002`, {
      method: "POST",
      headers: cardioHeaders
    }).then(r => r.json());

    if (noAttemptRes.success && noAttemptRes.appointment?.status === "RESCHEDULED") {
      console.log(`[PASS] NO ATTEMPT action verified for APT-DEMO-CARD-002 (Status: RESCHEDULED, New Slot: ${noAttemptRes.appointment.slotLabel}, Queue #${noAttemptRes.appointment.queueNumber})`);
      passed++;
    } else {
      console.error("[FAIL] NO ATTEMPT action failed:", noAttemptRes);
      failed++;
    }

    // 5C. REMOVE (with authorized doctor Dr. Ananya Roy)
    const removeRes = await fetch(`${API_BASE}/action/remove/APT-DEMO-NEUR-001`, {
      method: "POST",
      headers: neuroHeaders
    }).then(r => r.json());

    if (removeRes.success && removeRes.appointment?.status === "REMOVED") {
      console.log(`[PASS] REMOVE action verified for APT-DEMO-NEUR-001 (Status: REMOVED)`);
      passed++;
    } else {
      console.error("[FAIL] REMOVE action failed:", removeRes);
      failed++;
    }

  } catch (e) {
    console.error("[FAIL] Action test failed:", e.message);
    failed++;
  }

  // TEST 6: Doctor Data Isolation
  console.log("\n--> TEST 6: Doctor Data Isolation & Security...");
  try {
    // Dr. Rajesh Sharma (Cardiology) attempts to access Dr. Ananya Roy's patient (Neurology)
    const unauthorizedRes = await fetch(`${API_BASE}/doctor/patient/APT-DEMO-NEUR-001`, {
      headers: cardioHeaders
    }).then(r => r.json());

    if (unauthorizedRes.error && unauthorizedRes.message.includes("unauthorized")) {
      console.log(`[PASS] Data isolation verified: Dr. Rajesh Sharma cannot access Dr. Ananya Roy's patient record.`);
      passed++;
    } else {
      console.error("[FAIL] Data isolation breach:", unauthorizedRes);
      failed++;
    }
  } catch (e) {
    console.error("[FAIL] Isolation test failed:", e.message);
    failed++;
  }

  console.log("\n==================================================");
  console.log(`FINAL TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");
}

runTests();
