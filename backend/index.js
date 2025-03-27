import express from 'express';    
import cors from 'cors';            
import bodyParser from 'body-parser';  
import dotenv from 'dotenv';   
import supabase from './supabase.js';
import appointmentRoutes from './routes/appointments.js';

dotenv.config();  // Load environment variables

const app = express();
app.use(cors());  
app.use(bodyParser.json());



// Test Supabase connection
app.get('/test-supabase', async (req, res) => {
    try {
      await supabase.rpc('pg_sleep', { seconds: 1 }); // Dummy call to test DB connectivity
      res.status(200).send('Supabase is connected!');
    } catch (err) {
      console.error('Error connecting to Supabase:', err.message);
      res.status(500).send('Supabase connection failed.');
    }
  });
  

// Routes
app.get('/', (req, res) => {
    res.send('Welcome to the MediQ Backend!');
  });

app.use('/api/appointments',appointmentRoutes)

  
// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});