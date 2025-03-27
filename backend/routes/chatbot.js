import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
router.use(cors());

// Doctor Database with Complete Information
const doctorDatabase = {
  "dr_sharma": {
    id: "dr_sharma",
    name: "Dr. Rajesh Sharma",
    qualifications: {
      degrees: [
        "MBBS - AIIMS Delhi",
        "MD - General Medicine",
        "DM - Cardiology"
      ],
      awards: [
        "Best Cardiologist Award 2020 (IMA)",
        "Young Achiever in Cardiology 2015"
      ],
      experience: "15+ years, trained at Cleveland Clinic"
    },
    clinic: {
      address: "Heart Care Specialists, 5th Floor, Medanta Hospital",
      location: "Golf Course Road, Delhi",
      googleMaps: "https://maps.example.com/dr-sharma-clinic"
    },
    schedule: {
      days: "Monday to Saturday",
      hours: "9:00 AM - 1:00 PM and 4:00 PM - 8:00 PM",
      peakHours: "10:00 AM - 12:00 PM and 6:00 PM - 8:00 PM",
      closed: "Sundays and public holidays"
    },
    contact: {
      phone: "+91-9876543210",
      emergency: "+91-9876512345",
      email: "dr.sharma@heartcare.example.com",
      website: "www.heartcare.example.com"
    },
    services: [
      "Comprehensive heart checkups",
      "Angioplasty and stenting",
      "ECG and stress tests",
      "Echocardiography",
      "Preventive cardiology"
    ]
  }
};

// Available Questions
const availableQuestions = [
  "What are Dr. Sharma's qualifications?",
  "Where is the clinic located?",
  "What are the consultation timings?",
  "Is the doctor available today?",
  "How to contact for emergencies?",
  "What services does the doctor provide?"
];

// Enhanced Response Handler
const handleQuestion = (question) => {
  const q = question.toLowerCase();
  const doctor = doctorDatabase["dr_sharma"];

  try {
    // 1. Qualifications Question
    if (q.includes('qualif') || q.includes('degree') || q.includes('educat')) {
      return `Dr. Sharma's qualifications:\n\n` +
             `🎓 Degrees:\n- ${doctor.qualifications.degrees.join('\n- ')}\n\n` +
             `🏆 Awards:\n- ${doctor.qualifications.awards.join('\n- ')}\n\n` +
             `💼 Experience: ${doctor.qualifications.experience}`;
    }

    // 2. Location Question
    else if (q.includes('location') || q.includes('clinic') || q.includes('address')) {
      return `Clinic Location:\n\n` +
             `🏥 ${doctor.clinic.address}\n` +
             `📍 ${doctor.clinic.location}\n\n` +
             `📌 Map: ${doctor.clinic.googleMaps}`;
    }

    // 3. Timings Question
    else if (q.includes('timing') || q.includes('hour') || q.includes('schedule')) {
      return `Consultation Hours:\n\n` +
             `📅 ${doctor.schedule.days}\n` +
             `⏰ ${doctor.schedule.hours}\n\n` +
             `🚨 Emergency services available 24/7`;
    }

    // 4. Availability Question
    else if (q.includes('available') || q.includes('today')) {
      return `Current Availability:\n\n` +
             `✅ Dr. Sharma is available as per regular schedule\n` +
             `📞 For same-day appointments, call: ${doctor.contact.phone}\n\n` +
             `🚨 Emergency contact: ${doctor.contact.emergency}`;
    }

    // 5. Emergency Contact Question
    else if (q.includes('emergency') || q.includes('contact') || q.includes('call')) {
      return `Emergency Contact Information:\n\n` +
             `🚨 24/7 Emergency Line: ${doctor.contact.emergency}\n` +
             `📞 Clinic Reception: ${doctor.contact.phone}\n` +
             `📧 Email: ${doctor.contact.email}\n` +
             `🌐 Website: ${doctor.contact.website}`;
    }

    // 6. Services Question
    else if (q.includes('service') || q.includes('provide') || q.includes('treatment')) {
      return `Medical Services Offered:\n\n` +
             `❤️ ${doctor.services.join('\n❤️ ')}\n\n` +
             `All services use state-of-the-art equipment and techniques.`;
    }

    // Default Response
    return `I can help you with information about:\n\n` +
           `• Dr. Sharma's qualifications\n` +
           `• Clinic location\n` +
           `• Appointment scheduling\n` +
           `• Available services\n\n` +
           `Please select one of the questions above.`;
    
  } catch (error) {
    console.error("Error generating response:", error);
    throw new Error("I'm having trouble answering that right now");
  }
};

// Chat Endpoint with Robust Error Handling
router.post('/chat', (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        answer: "Please provide a question to answer",
        availableQuestions
      });
    }

    const answer = handleQuestion(question);
    
    return res.json({
      success: true,
      answer,
      availableQuestions
    });

  } catch (error) {
    console.error("Chat endpoint error:", error.message);
    return res.status(500).json({
      success: false,
      answer: "I'm having some technical difficulties. Please try again later.",
      availableQuestions
    });
  }
});

// Questions Endpoint
router.get('/questions', (req, res) => {
  try {
    res.json({
      success: true,
      availableQuestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Couldn't load questions"
    });
  }
});

export default router;