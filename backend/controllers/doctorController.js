const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Emergency = require('../models/Emergency');
const slotService = require('../services/slotService');

// @desc    Get doctor appointment queue for authorized doctor/department
// @route   GET /api/doctor/queue
const getQueue = async (req, res) => {
  try {
    const doctorId = req.doctor._id;

    // Resequence active queue so appointments are always contiguous #1, #2, #3...
    await slotService.resequenceDoctorActiveQueue(doctorId);

    // Retrieve active appointments assigned to this doctor
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate('patient', 'name email phone age gender bloodType medicalHistory');
    // Helper to parse time slot to minutes from midnight
    const parseTimeToMinutes = (item) => {
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
      return (item.queueNumber || 999) * 10;
    };

    // Sort by earliest time slot first, then queue number
    appointments.sort((a, b) => {
      const timeDiff = parseTimeToMinutes(a) - parseTimeToMinutes(b);
      if (timeDiff !== 0) return timeDiff;
      return (a.queueNumber || 0) - (b.queueNumber || 0);
    });

    const activeQueue = appointments.filter(a => ['CONFIRMED', 'IN_QUEUE', 'RESCHEDULED'].includes(a.status));
    const solvedQueue = appointments.filter(a => a.status === 'SOLVED');
    const removedQueue = appointments.filter(a => a.status === 'REMOVED');
    const noAttemptQueue = appointments.filter(a => a.status === 'NO_ATTEMPT');

    return res.json({
      success: true,
      doctor: {
        id: req.doctor._id,
        doctorId: req.doctor.doctorId,
        name: req.doctor.name,
        department: req.doctor.department,
        specialization: req.doctor.specialization,
        hospital: req.doctor.hospital
      },
      stats: {
        totalAppointments: appointments.length,
        activeQueueCount: activeQueue.length,
        solvedCount: solvedQueue.length,
        noAttemptCount: noAttemptQueue.length,
        removedCount: removedQueue.length
      },
      activeQueue,
      solvedQueue,
      noAttemptQueue,
      removedQueue
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

// @desc    Get patient appointment detail
// @route   GET /api/doctor/patient/:appointmentId
const getPatientDetail = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctorId = req.doctor._id;

    const query = { doctor: doctorId };
    if (mongoose.Types.ObjectId.isValid(appointmentId)) {
      query.$or = [{ _id: appointmentId }, { appointmentId: appointmentId }];
    } else {
      query.appointmentId = appointmentId;
    }

    const appointment = await Appointment.findOne(query)
      .populate('patient', 'name email phone age gender bloodType medicalHistory');

    if (!appointment) {
      return res.status(404).json({ error: true, message: 'Patient appointment not found or unauthorized for this doctor.' });
    }

    return res.json({
      success: true,
      appointment
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

// @desc    Get live database-backed emergency requests
// @route   GET /api/doctor/emergencies
const getEmergencies = async (req, res) => {
  try {
    const emergencies = await Emergency.find({ status: 'ACTIVE' })
      .populate('patient', 'name email phone age gender bloodType medicalHistory')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: emergencies.length,
      emergencies
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

// @desc    Resolve an emergency request
// @route   POST /api/doctor/emergencies/:id/resolve
const resolveEmergency = async (req, res) => {
  try {
    const { id } = req.params;
    const query = mongoose.Types.ObjectId.isValid(id) ? { $or: [{ _id: id }, { emergencyId: id }] } : { emergencyId: id };
    
    const emergency = await Emergency.findOne(query);
    if (!emergency) {
      return res.status(404).json({ error: true, message: 'Emergency record not found.' });
    }

    emergency.status = 'RESOLVED';
    emergency.resolvedAt = new Date();
    emergency.resolvedBy = req.doctor._id;
    await emergency.save();

    return res.json({
      success: true,
      message: `Emergency ${emergency.emergencyId} resolved successfully.`,
      emergency
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

// @desc    Get public demo doctors list for dynamic login switcher
// @route   GET /api/doctor/public-list
const getPublicDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isDemo: true }).select('doctorId name department specialization hospital hospitalId isDemo');
    return res.json({
      success: true,
      doctors
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

module.exports = {
  getQueue,
  getPatientDetail,
  getEmergencies,
  resolveEmergency,
  getPublicDoctors
};
