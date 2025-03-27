import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Calendar, Clock, User, Phone, ChevronRight, ArrowLeft } from 'lucide-react';

const BookAppointment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [queueNumber, setQueueNumber] = useState<number | null>(null);
  const [redirectMessage, setRedirectMessage] = useState('');
  const [formData, setFormData] = useState({
    patientName: '',
    phoneNumber: '',
    appointmentTime: '',
    serviceType: 'general',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  // Early validation
  if (loading) return;
  
  setLoading(true);
  let shouldNavigate = false;
  let navigateId = '';

  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/appointments/book-appointment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to book appointment');
    }

    if (!data.id || !data.queueNumber) {
      throw new Error('Invalid response from server.');
    }

    // Store values for navigation
    shouldNavigate = true;
    navigateId = data.id;
    
    // Update state
    setQueueNumber(data.queueNumber);
    toast.success(`Appointment booked successfully! Your queue number is ${data.queueNumber}`);

  } catch (err: any) {
    toast.error(err.message || 'An error occurred.');
  } finally {
    setLoading(false);
    
    // Navigate AFTER state updates are complete
    if (shouldNavigate) {
      navigate(`/queue/single/${navigateId}`);
    }
  }
};

  return (
    <div className="max-w-2xl mx-auto">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-blue-600 mb-4 hover:text-blue-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back
      </button>

      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Book an Appointment</h2>
          <p className="text-gray-600">Fill out the form below to secure your spot in the queue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="patientName" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <User className="h-4 w-4 mr-2 text-blue-600" />
                  Patient Name
                </label>
                <input
                  type="text"
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phoneNumber" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Phone className="h-4 w-4 mr-2 text-blue-600" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4"
                  placeholder="Your contact number"
                  required
                />
              </div>

              <div>
                <label htmlFor="serviceType" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  Service Type
                </label>
                <select
                  id="serviceType"
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4"
                  required
                >
                  <option value="general">General Consultation</option>
                  <option value="specialist">Specialist Consultation</option>
                  <option value="followup">Follow-up Visit</option>
                  <option value="testing">Medical Testing</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="appointmentTime" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Clock className="h-4 w-4 mr-2 text-blue-600" />
                  Appointment Time
                </label>
                <input
                  type="datetime-local"
                  id="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4"
                  required
                />
              </div>

              <div>
                <label htmlFor="notes" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4"
                  rows={4}
                  placeholder="Any specific concerns or information you'd like to share"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium flex items-center justify-center transition-colors"
            >
              {loading ? 'Processing...' : 'Book Appointment'}
              {!loading && <ChevronRight className="h-5 w-5 ml-1" />}
            </button>
          </div>
        </form>

        {queueNumber && (
          <div className="mt-6 bg-green-50 rounded-lg p-4 text-sm text-green-800">
            <p>Your queue number is <strong>{queueNumber}</strong>. {redirectMessage}</p>
          </div>
        )}

        <div className="mt-6 bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
          <p className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Available appointment times: Monday-Friday, 9:00 AM - 5:00 PM
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
