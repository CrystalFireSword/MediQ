import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';

const QueueStatus = () => {
  const { id } = useParams(); // ✅ Extract only ID from URL
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<any>(null);
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/appointments/single/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch appointment');
        }

        setAppointment(data); // ✅ Store entire appointment, including queueNumber
      } catch (error) {
        console.error('Error fetching appointment:', error);
      }
    };

    fetchAppointment();
    const interval = setInterval(fetchAppointment, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [id]);

  if (!appointment) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Queue Status</h2>
      
      <div className="space-y-6">
        <div className="flex items-center justify-center p-6 bg-blue-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-blue-600 mb-1">Your Queue Number</p>
            <p className="text-4xl font-bold text-blue-700">
              {appointment.queue_number} {/* ✅ Use queue number from backend */}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Status</span>
            <span className="font-medium capitalize">{appointment.status}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Appointment Time</span>
            <span className="font-medium">
              {new Date(appointment.appointment_time).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Patient Name</span>
            <span className="font-medium">{appointment.patient_name}</span>
          </div>
        </div>

        {appointment.status === 'waiting' && (
          <div className="flex items-center justify-center p-4 bg-yellow-50 rounded-lg">
            <Clock className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-600">
              Please wait for your turn. You will be notified when it's time.
            </p>
          </div>
        )}

        {showRedirectMessage && (
          <div className="mt-6 text-sm text-gray-500 text-center">
            Redirecting to login/signup page in <strong>2 seconds</strong>...
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueStatus;
