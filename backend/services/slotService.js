const Appointment = require('../models/Appointment');

const DEFINED_SLOTS = [
  { slotId: 'slot-0900', label: '09:00 AM - 09:30 AM' },
  { slotId: 'slot-0930', label: '09:30 AM - 10:00 AM' },
  { slotId: 'slot-1000', label: '10:00 AM - 10:30 AM' },
  { slotId: 'slot-1030', label: '10:30 AM - 11:00 AM' },
  { slotId: 'slot-1100', label: '11:00 AM - 11:30 AM' },
  { slotId: 'slot-1130', label: '11:30 AM - 12:00 PM' },
  { slotId: 'slot-1200', label: '12:00 PM - 12:30 PM' },
  { slotId: 'slot-1230', label: '12:30 PM - 01:00 PM' },
  { slotId: 'slot-0200', label: '02:00 PM - 02:30 PM' },
  { slotId: 'slot-0230', label: '02:30 PM - 03:00 PM' },
  { slotId: 'slot-0300', label: '03:00 PM - 03:30 PM' },
  { slotId: 'slot-0330', label: '03:30 PM - 04:00 PM' },
  { slotId: 'slot-0400', label: '04:00 PM - 04:30 PM' },
  { slotId: 'slot-0430', label: '04:30 PM - 05:00 PM' }
];

const MAX_SLOT_CAPACITY = 50;

function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Helper to parse slot / time string to minutes from midnight
 */
function parseTimeToMinutes(item) {
  const str = (item.slotLabel || item.slotId || item.time || '').trim();
  const match = str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridian = match[3] ? match[3].toUpperCase() : null;
    if (meridian === 'PM' && hours < 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  const slotMatch = str.match(/slot-?(\d{2})(\d{2})/i);
  if (slotMatch) {
    return parseInt(slotMatch[1], 10) * 60 + parseInt(slotMatch[2], 10);
  }
  return 999999;
}

/**
 * Get active appointment count in a specific slot
 */
async function getSlotActiveCount(doctorId, slotId, date = getTodayString()) {
  return await Appointment.countDocuments({
    doctor: doctorId,
    slotId: slotId,
    date: date,
    status: { $in: ['CONFIRMED', 'IN_QUEUE', 'RESCHEDULED'] }
  });
}

/**
 * Find the next available slot with active capacity < 50 strictly following currentSlotId
 */
async function findNextAvailableSlot(doctorId, currentSlotId, date = getTodayString()) {
  const currentIndex = DEFINED_SLOTS.findIndex(s => s.slotId === currentSlotId);
  const searchOrder = [
    ...DEFINED_SLOTS.slice(currentIndex + 1),
    ...DEFINED_SLOTS.slice(0, currentIndex + 1)
  ];

  for (const slot of searchOrder) {
    if (slot.slotId === currentSlotId) continue; // Must be a new slot
    const count = await getSlotActiveCount(doctorId, slot.slotId, date);
    if (count < MAX_SLOT_CAPACITY) {
      return slot;
    }
  }

  throw new Error('All OPD slots for this date have reached maximum capacity (50/50 patients).');
}

/**
 * Automatically re-sequence active appointments in contiguous 1, 2, 3... order
 * based on chronological time slot so the doctor always knows who is #1 (next in line).
 */
async function resequenceDoctorActiveQueue(doctorId, date = getTodayString()) {
  const activeAppointments = await Appointment.find({
    doctor: doctorId,
    date: date,
    status: { $in: ['CONFIRMED', 'IN_QUEUE', 'RESCHEDULED'] }
  });

  // Sort by earliest time slot first; within the same slot: CONFIRMED before RESCHEDULED, then by time
  activeAppointments.sort((a, b) => {
    const timeDiff = parseTimeToMinutes(a) - parseTimeToMinutes(b);
    if (timeDiff !== 0) return timeDiff;
    if (a.status !== b.status) {
      if (a.status === 'CONFIRMED') return -1;
      if (b.status === 'CONFIRMED') return 1;
    }
    return (new Date(a.createdAt || 0).getTime()) - (new Date(b.createdAt || 0).getTime());
  });

  const bulkOps = [];
  for (let i = 0; i < activeAppointments.length; i++) {
    const newSeq = i + 1;
    if (activeAppointments[i].queueNumber !== newSeq) {
      activeAppointments[i].queueNumber = newSeq;
      bulkOps.push({
        updateOne: {
          filter: { _id: activeAppointments[i]._id },
          update: { $set: { queueNumber: newSeq } }
        }
      });
    }
  }

  if (bulkOps.length > 0) {
    await Appointment.bulkWrite(bulkOps);
  }

  return activeAppointments;
}

module.exports = {
  DEFINED_SLOTS,
  MAX_SLOT_CAPACITY,
  getTodayString,
  parseTimeToMinutes,
  getSlotActiveCount,
  findNextAvailableSlot,
  resequenceDoctorActiveQueue
};
