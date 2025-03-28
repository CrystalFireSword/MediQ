import { React,useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { Clock, Users, Bell, Activity, ChevronRight } from 'lucide-react';
import toast from "react-hot-toast";
import { format } from 'date-fns';

const Home = () => {

  type Appointment = {
    id: string;
    patient_name: string;
    phone_number: string;
    appointment_time: string;
    queue_number: number;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    service_type?: string;
    notes?: string;
  };

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);


  useEffect(() => {
    const fetchAppointments = async () => {
      setIsRefreshing(true);
      setIsLoading(true); // Ensure loading state is set at the beginning
  
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/appointments/list?status=in_progress`
        );
  
        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }
  
        const { appointments, stats } = await response.json();
  
        setAppointments(appointments);
        setFilteredAppointments(appointments); // No need for frontend filtering now
      } catch (error) {
        console.error("Error fetching appointments:", error);
        toast.error("Failed to load appointments");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };
  
    fetchAppointments(); // Call the async function
  }); // Dependency array

  const formatDateTime = (dateTimeStr: string) => {
    try {
      return format(new Date(dateTimeStr), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateTimeStr;
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Hero Section with Gradient Background */}
      <div className="text-center mb-16 py-16 px-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Smart Queue Management System
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Book appointments and track your queue position in real-time
        </p>
        <Link
          to="/book"
          className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl group"
        >
          Book an Appointment
          <ChevronRight className="ml-2 h-5 w-5 transform transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

       {/* Now Serving */}
       {filteredAppointments.filter(app => app.status === 'in_progress').length > 0 && (
        <div className="mb-8 bg-blue-50 rounded-xl p-4 border border-blue-200">
          <h2 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Now Serving
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAppointments
              .filter(app => app.status === 'in_progress')
              .map(app => (
                <div 
                  key={app.id} 
                  className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500 flex justify-between items-center cursor-pointer hover:shadow-lg transition-shadow"
                  
                >
                  <div>
                    <div className="flex items-center">
                      <span className="text-xl font-bold text-blue-600 mr-2">#{app.queue_number}</span>
                      <span className="font-medium">{app.patient_name}</span>
                    </div>
                    <p className="text-sm text-gray-500">{formatDateTime(app.appointment_time)}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Features Section with Enhanced Cards */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-blue-600">
            <div className="bg-blue-100 p-3 rounded-full inline-block mb-6">
              <Clock className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Real-time Tracking</h3>
            <p className="text-gray-600">
              Monitor your position in the queue and get accurate estimated waiting times
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-blue-600">
            <div className="bg-blue-100 p-3 rounded-full inline-block mb-6">
              <Users className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Easy Booking</h3>
            <p className="text-gray-600">
              Book your appointment online and get your queue number instantly
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-blue-600">
            <div className="bg-blue-100 p-3 rounded-full inline-block mb-6">
              <Bell className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Smart Notifications</h3>
            <p className="text-gray-600">
              Receive alerts when your turn is approaching so you never miss your slot
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-blue-600 text-white rounded-xl p-10 mb-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold mb-2">97%</p>
            <p className="text-blue-100">Customer Satisfaction</p>
          </div>
          <div>
            <p className="text-4xl font-bold mb-2">15min</p>
            <p className="text-blue-100">Average Wait Time</p>
          </div>
          <div>
            <p className="text-4xl font-bold mb-2">50k+</p>
            <p className="text-blue-100">Happy Users</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-white p-10 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4">Ready to skip the wait?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Join thousands of satisfied customers who have simplified their appointment scheduling
        </p>
        <Link
          to="/book"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Get Started Now
        </Link>
      </div>
    </div>
  );
};

export default Home;