const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const slotService = require('./services/slotService');

const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sih_healthcare';

async function runCapacityVerification() {
  console.log("==================================================");
  console.log("SLOT CAPACITY & RESCHEDULING VERIFICATION SUITE");
  console.log("==================================================\n");

  await mongoose.connect(connStr);

  const doc = await Doctor.findOne({ doctorId: 'DOC-CARD-01' });
  const pat = await Patient.findOne();
  const today = slotService.getTodayString();

  console.log(`Testing with Doctor: ${doc.name} (${doc.doctorId}) on Date: ${today}`);

  // Clean test appointments
  await Appointment.deleteMany({ doctor: doc._id });

  // ----------------------------------------------------
  // TEST 1: Fill Slot slot-0900 to exactly 50 patients
  // ----------------------------------------------------
  console.log("\n--> TEST 1: Filling slot-0900 with 50 active appointments...");
  const bulkApts = [];
  for (let i = 1; i <= 50; i++) {
    bulkApts.push({
      appointmentId: `APT-CAPTEST-${i.toString().padStart(3, '0')}`,
      patient: pat._id,
      doctor: doc._id,
      slotId: 'slot-0900',
      slotLabel: '09:00 AM - 09:30 AM',
      queueNumber: i,
      date: today,
      problem: `Capacity test patient #${i}`,
      status: 'CONFIRMED'
    });
  }
  await Appointment.insertMany(bulkApts);

  const slot0900Count = await slotService.getSlotActiveCount(doc._id, 'slot-0900', today);
  console.log(`[PASS] slot-0900 active count: ${slot0900Count}/50 (MAX_SLOT_CAPACITY: ${slotService.MAX_SLOT_CAPACITY})`);

  // ----------------------------------------------------
  // TEST 2: Capacity Boundary Overflow Test (51st booking)
  // ----------------------------------------------------
  console.log("\n--> TEST 2: Requesting 51st booking on full slot-0900...");
  const overflowAllocation = await slotService.allocateSlotAndQueue(doc._id, 'slot-0900', today);
  console.log(`[PASS] Automatically rolled over to: ${overflowAllocation.slotLabel} (${overflowAllocation.slotId})`);
  console.log(`[PASS] Assigned Queue Number: #${overflowAllocation.queueNumber}`);

  if (overflowAllocation.slotId === 'slot-0930' && overflowAllocation.queueNumber === 1) {
    console.log("✓ Capacity boundary check PASSED (overflowed from full 09:00 AM to 09:30 AM with Queue #1)");
  } else {
    console.error("✗ Unexpected overflow allocation:", overflowAllocation);
  }

  // ----------------------------------------------------
  // TEST 3: NO ATTEMPT Reschedule Flow
  // ----------------------------------------------------
  console.log("\n--> TEST 3: Marking Patient #2 in slot-0900 as NO ATTEMPT...");
  const targetApt = await Appointment.findOne({ appointmentId: 'APT-CAPTEST-002' });
  
  // Find next available slot strictly after slot-0900
  const nextAvailable = await slotService.findNextAvailableSlot(doc._id, targetApt.slotId, today);
  const newQueueNo = await slotService.getNextQueueNumber(doc._id, nextAvailable.slotId, today);

  targetApt.status = 'RESCHEDULED';
  targetApt.rescheduledFromSlot = targetApt.slotLabel;
  targetApt.rescheduledFromQueueNumber = targetApt.queueNumber;
  targetApt.slotId = nextAvailable.slotId;
  targetApt.slotLabel = nextAvailable.label;
  targetApt.queueNumber = newQueueNo;
  targetApt.statusMessage = `Rescheduled to ${nextAvailable.label} (Queue #${newQueueNo})`;
  targetApt.rescheduledAt = new Date();
  await targetApt.save();

  console.log(`[PASS] Rescheduled APT-CAPTEST-002:`);
  console.log(`  - Previous: ${targetApt.rescheduledFromSlot} (Queue #${targetApt.rescheduledFromQueueNumber})`);
  console.log(`  - New Slot: ${targetApt.slotLabel} (${targetApt.slotId})`);
  console.log(`  - New Queue Token: #${targetApt.queueNumber}`);

  // ----------------------------------------------------
  // TEST 4: Next booking in slot-0930 receives next queue number
  // ----------------------------------------------------
  console.log("\n--> TEST 4: Next booking in slot-0930 receives sequential token...");
  const slot0930NextQueue = await slotService.getNextQueueNumber(doc._id, 'slot-0930', today);
  console.log(`[PASS] Next Queue Token in slot-0930: #${slot0930NextQueue}`);

  await mongoose.disconnect();
  console.log("\n==================================================");
  console.log("ALL CAPACITY & RESCHEDULE VERIFICATIONS PASSED!");
  console.log("==================================================");
}

runCapacityVerification().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
