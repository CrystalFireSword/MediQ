import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BookAppointment from './pages/BookAppointment';
import QueueStatus from './pages/QueueStatus';
import DoctorDashboard from './pages/DoctorDashboard';
import Login from './pages/Login';
import DoctorLogin from './pages/DoctorLogin'
import Chatbot from './components/Chatbot';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Chatbot />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book" element={<BookAppointment />} />
            <Route path="/queue/single/:id" element={<QueueStatus />} />
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path = "/doctorlogin" element = {<DoctorLogin/>}/>
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;