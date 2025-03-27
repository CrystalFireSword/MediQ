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

    // 🛠️ Insert data into Supabase
    const { data, error } = await supabase
      .from('appointments')
      .insert([
        {
          patient_name: patientName,
          phone_number: phoneNumber,
          appointment_time: appointmentTime,
          service_type: serviceType,
          notes: notes || '', // Default to empty string if not provided
          status: 'pending',
        },
      ])
      .select('id, queue_number, patient_id');

    // ❌ Handle errors
    if (error) {
      console.error('Supabase Insert Error:', error.message);
      return res.status(500).json({ message: 'Error booking appointment' });
    }

    // ✅ Success Response
    res.json({
      message: 'Appointment booked successfully!',
      id: data[0].id, // Return appointment ID
      queueNumber: data[0].queue_number, // Return queue number
      patientId: data[0].patient_id, // Return patient ID if needed
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
  console.log('Fetching all patients...'); // Add logging
  try {
    const { status, search } = req.query;
    console.log(status, search)
    console.log('Query params:', { status, search }); // Log incoming params

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
      console.error('Supabase error:', error);
      throw error;
    }

    console.log(`Found ${data.length} appointments`); // Log results

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
export default router;