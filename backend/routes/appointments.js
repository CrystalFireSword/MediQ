import express from 'express';
import supabase from '../supabase.js';

const router = express.Router();

// 📌 Book Appointment Route
router.post('/book-appointment', async (req, res) => {
  try {
    const { patientName, phoneNumber, appointmentTime, serviceType, notes } = req.body;

    // ✅ Validate required fields
    if (!patientName || !phoneNumber || !appointmentTime || !serviceType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // 1️⃣ Parse the appointment time and determine time slot
    const appointmentDate = new Date(appointmentTime);
    const dateOnly = appointmentDate.toISOString().split('T')[0];
    
    // Determine time slot boundaries
    const hours = appointmentDate.getHours();
    const isMorningSlot = hours >= 9 && hours < 12;
    const timeSlotStart = isMorningSlot ? '09:00:00' : '13:00:00';
    const timeSlotEnd = isMorningSlot ? '12:00:00' : '17:00:00';
    const timeSlotName = isMorningSlot ? 'Morning' : 'Evening';

    // 2️⃣ Fetch existing appointments for the same date and time slot
    const { data: existingAppointments, error: fetchError } = await supabase
      .from('appointments')
      .select('queue_number')
      .gte('appointment_time', `${dateOnly}T${timeSlotStart}`)
      .lt('appointment_time', `${dateOnly}T${timeSlotEnd}`)
      .order('queue_number', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Supabase Fetch Error:', fetchError.message);
      return res.status(500).json({ message: 'Error checking existing appointments' });
    }

    // 3️⃣ Calculate new queue number
    const lastQueueNumber = existingAppointments?.[0]?.queue_number || 0;
    const newQueueNumber = lastQueueNumber + 1;

    // 4️⃣ Insert new appointment with calculated queue number
    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          patient_name: patientName,
          phone_number: phoneNumber,
          appointment_time: appointmentTime, // Keep as proper timestamp
          service_type: serviceType,
          notes: notes || '',
          status: 'pending',
          queue_number: newQueueNumber,
          // time_slot: timeSlotName, // Store as text if you want to display it
          appointment_time: `${dateOnly}T${timeSlotStart}`, // Store slot boundaries if needed
          //time_slot_end: `${dateOnly}T${timeSlotEnd}`
        },
      ])
      .select('id, queue_number, patient_id, appointment_time');

    // ❌ Handle errors
    if (error) {
      console.error('Supabase Insert Error:', error.message);
      return res.status(500).json({ message: 'Error booking appointment' });
    }

    // ✅ Success Response
    res.json({
      message: 'Appointment booked successfully!',
      id: data[0].id,
      queueNumber: data[0].queue_number,
      patientId: data[0].patient_id,
      timeSlot: data[0].appointment_time
    });

  } catch (err) {
    console.error('Server Error:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

router.get('/single/:id', async (req, res) => {
  const { single, id } = req.params;

  try {
    // Use Supabase instead of pool.query
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase Query Error:', error.message);
      return res.status(500).json({ message: 'Error fetching appointment' });
    }

    if (!data) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(data); // Send appointment details
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// appointments.js
router.get('/list', async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = supabase
      .from('appointments')
      .select('*')
      .order('appointment_time', { ascending: true });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(
        `patient_name.ilike.%${search}%,phone_number.ilike.%${search}%,queue_number.eq.${search}`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const stats = {
      pending: data.filter(app => app.status === 'pending').length,
      inProgress: data.filter(app => app.status === 'in_progress').length,
      completed: data.filter(app => app.status === 'completed').length,
      cancelled: data.filter(app => app.status === 'cancelled').length,
      total: data.length,
      averageWaitTime: 15
    };

    res.json({
      appointments: data,
      stats
    });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ 
      message: 'Internal Server Error',
      error: err.message 
    });
  }
});
// Add this to your appointments.js router
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Check if appointment exists first
    const { data: existingAppointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existingAppointment) {
      return res.status(404).json({ 
        success: false,
        message: 'Appointment not found'
      });
    }

    // Simply update the status in the appointments table
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    res.json({ 
      success: true,
      message: `Status updated to ${status}`,
      appointment: data[0]
    });

  } catch (err) {
    console.error('Status update error:', {
      message: err.message,
      stack: err.stack,
      supabaseError: err.error
    });
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to update appointment status',
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

import twilio from 'twilio';

// Initialize Twilio client (store these in environment variables)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Add this new endpoint
router.post('/send-whatsapp', async (req, res) => {
  try {
    const { phoneNumber, patientName, status } = req.body;

    // Validate input
    if (!phoneNumber || !patientName || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Format phone number (remove non-digit characters and add country code if needed)
    const formattedNumber = phoneNumber.replace(/\D/g, '');
    const toNumber = `whatsapp:+${formattedNumber}`;

    // Create message based on status
    let messageBody;
    switch(status) {
      case 'pending':
        messageBody = `Hi ${patientName}, your appointment is pending confirmation.`;
        break;
      case 'in_progress':
        messageBody = `Hi ${patientName}, the doctor is now ready to see you.`;
        break;
      case 'completed':
        messageBody = `Hi ${patientName}, thank you for your visit!`;
        break;
      default:
        messageBody = `Hi ${patientName}, your appointment status: ${status}`;
    }

    // Send via Twilio
    const message = await twilioClient.messages.create({
      body: messageBody,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`, // Your Twilio WhatsApp number
      to: toNumber
    });

    res.json({
      success: true,
      message: 'WhatsApp notification sent',
      sid: message.sid
    });

  } catch (error) {
    console.error('WhatsApp send error:', error);
    res.status(500).json({ 
      error: 'Failed to send WhatsApp',
      details: error.message 
    });
  }
});

export default router;