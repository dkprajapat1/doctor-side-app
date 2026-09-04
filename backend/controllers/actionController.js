const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const slotService = require('../services/slotService');

function buildAptQuery(appointmentId, doctorId) {
  const query = { doctor: doctorId };
  if (mongoose.Types.ObjectId.isValid(appointmentId)) {
    query.$or = [{ _id: appointmentId }, { appointmentId: appointmentId }];
  } else {
    query.appointmentId = appointmentId;
  }
  return query;
}

// @desc    Solve appointment (Mark as completed)
// @route   POST /api/action/solve/:appointmentId
const solveAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctorId = req.doctor._id;

    const query = buildAptQuery(appointmentId, doctorId);
    const appointment = await Appointment.findOne(query);

    if (!appointment) {
      return res.status(404).json({ error: true, message: 'Appointment not found or unauthorized.' });
    }

    appointment.status = 'SOLVED';
    appointment.statusMessage = 'Completed: Consultation solved by physician.';
    appointment.solvedAt = new Date();
    await appointment.save();

    // Re-sequence remaining active queue so the next patient becomes #1
    await slotService.resequenceDoctorActiveQueue(doctorId, appointment.date);

    return res.json({
      success: true,
      action: 'SOLVE',
      message: `Appointment ${appointment.appointmentId} marked as SOLVED. Active queue updated.`,
      appointment
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

// @desc    No Attempt (Reschedule to next available slot)
// @route   POST /api/action/no-attempt/:appointmentId
const noAttemptAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctorId = req.doctor._id;

    const query = buildAptQuery(appointmentId, doctorId);
    const appointment = await Appointment.findOne(query);

    if (!appointment) {
      return res.status(404).json({ error: true, message: 'Appointment not found or unauthorized.' });
    }

    // Save previous slot details for clinical audit
    const previousSlotId = appointment.slotId;
    const previousSlotLabel = appointment.slotLabel;
    const previousQueueNumber = appointment.queueNumber;

    // Find next available slot for this doctor with capacity < 50
    const nextSlot = await slotService.findNextAvailableSlot(doctorId, previousSlotId, appointment.date);

    appointment.status = 'RESCHEDULED';
    appointment.rescheduledFromSlot = previousSlotLabel;
    appointment.rescheduledFromQueueNumber = previousQueueNumber;
    appointment.slotId = nextSlot.slotId;
    appointment.slotLabel = nextSlot.label;
    appointment.rescheduledAt = new Date();
    await appointment.save();

    // Re-sequence active queue in chronological order so all positions 1, 2, 3... are contiguous
    await slotService.resequenceDoctorActiveQueue(doctorId, appointment.date);

    const updatedApt = await Appointment.findById(appointment._id);

    return res.json({
      success: true,
      action: 'NO_ATTEMPT',
      message: `Appointment rescheduled to slot ${nextSlot.label} (Queue #${updatedApt.queueNumber}).`,
      appointment: updatedApt
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

// @desc    Remove appointment from active queue
// @route   POST /api/action/remove/:appointmentId
const removeAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctorId = req.doctor._id;

    const query = buildAptQuery(appointmentId, doctorId);
    const appointment = await Appointment.findOne(query);

    if (!appointment) {
      return res.status(404).json({ error: true, message: 'Appointment not found or unauthorized.' });
    }

    appointment.status = 'REMOVED';
    appointment.statusMessage = 'Appointment Removed: Your appointment has been removed by the doctor. Please book another available appointment.';
    appointment.removedAt = new Date();
    await appointment.save();

    // Re-sequence active queue
    await slotService.resequenceDoctorActiveQueue(doctorId, appointment.date);

    return res.json({
      success: true,
      action: 'REMOVE',
      message: `Appointment ${appointment.appointmentId} removed from active queue.`,
      appointment
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  solveAppointment,
  noAttemptAppointment,
  removeAppointment
};
