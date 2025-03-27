import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { 
  Users, Clock, CheckCircle, XCircle, AlertCircle, Activity,
  Search, Filter, RefreshCw, UserPlus, Calendar, ChevronDown, 
  Phone, MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

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

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
    averageWaitTime: 0
  });

  useEffect(() => {
    fetchAppointments();

    const subscription = supabase
      .channel('appointments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments'
      }, fetchAppointments)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Filter appointments based on search term and status filter
    let filtered = [...appointments];
    
    if (searchTerm) {
      filtered = filtered.filter(
        app => app.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               app.phone_number.includes(searchTerm) ||
               app.queue_number.toString().includes(searchTerm)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    setFilteredAppointments(filtered);
  }, [appointments, searchTerm, statusFilter]);

  // Update the fetchAppointments function in DoctorDashboard.tsx
const fetchAppointments = async () => {
  setIsRefreshing(true);
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/appointments/list?status=${statusFilter}&search=${searchTerm}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch appointments');
    }

    const { appointments, stats } = await response.json();

    setAppointments(appointments);
    setFilteredAppointments(appointments); // No need for frontend filtering now
    setStats(stats);
    
  } catch (error) {
    console.error('Error fetching appointments:', error);
    toast.error('Failed to load appointments');
  } finally {
    setIsLoading(false);
    setIsRefreshing(false);
  }
};

// Remove the useEffect for filtering since it's now handled by the backend
// Keep only the realtime subscription useEffect

// Update the realtime subscription to refetch data
useEffect(() => {
  fetchAppointments();

  const subscription = supabase
    .channel('appointments')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'appointments'
    }, fetchAppointments)
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [statusFilter, searchTerm]); // Add dependencies to refetch when filters change

const updateStatus = async (id: string, status: string) => {
  try {
    // First validate the status
    if (!['pending', 'waiting', 'in_progress', 'completed', 'cancelled'].includes(status)) {
      throw new Error('Invalid status value');
    }

    // Use the backend API endpoint
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/appointments/${id}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      }
    );

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Unexpected response: ${text.substring(0, 100)}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update status');
    }

    toast.success(`Status updated to ${status.replace('_', ' ')}`);
    fetchAppointments(); // Refresh the data
    
  } catch (error) {
    console.error('Status update error:', error);
    toast.error(error.message || 'Failed to update status');
  }
};
  
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <Activity className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDateTime = (dateTimeStr: string) => {
    try {
      return format(new Date(dateTimeStr), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateTimeStr;
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };
 
  const sendSMS = (phoneNumber: string) => {
    toast.success(`SMS notification would be sent to ${phoneNumber}`);
    // In a real app, this would integrate with an SMS API
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor's Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your patient queue and appointments
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>
          <button
            onClick={fetchAppointments}
            className="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-yellow-100">
              <Users className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Pending</p>
              <p className="text-xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">In Progress</p>
              <p className="text-xl font-semibold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Completed</p>
              <p className="text-xl font-semibold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Cancelled</p>
              <p className="text-xl font-semibold text-gray-900">{stats.cancelled}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-purple-100">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Total Today</p>
              <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-4 border-l-4 border-indigo-500">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-indigo-100">
              <Clock className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Avg. Wait</p>
              <p className="text-xl font-semibold text-gray-900">{stats.averageWaitTime} min</p>
            </div>
          </div>
        </div>
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
                  onClick={() => handleAppointmentClick(app)}
                >
                  <div>
                    <div className="flex items-center">
                      <span className="text-xl font-bold text-blue-600 mr-2">#{app.queue_number}</span>
                      <span className="font-medium">{app.patient_name}</span>
                    </div>
                    <p className="text-sm text-gray-500">{formatDateTime(app.appointment_time)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        updateStatus(app.id, 'completed');
                      }}
                      className="p-2 bg-green-100 text-green-800 rounded-full hover:bg-green-200"
                      title="Mark as completed"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Appointments</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div className="text-sm text-gray-500">
          Showing {filteredAppointments.length} of {appointments.length} appointments
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-xl shadow overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Queue #
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appointment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' ? (
                      <div>
                        <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p>No appointments match your filters</p>
                        <button 
                          onClick={() => {
                            setSearchTerm('');
                            setStatusFilter('all');
                          }}
                          className="mt-2 text-blue-600 hover:text-blue-800"
                        >
                          Clear filters
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p>No appointments scheduled for today</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => (
                  <tr 
                    key={appointment.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAppointmentClick(appointment)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-blue-600">
                      #{appointment.queue_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{appointment.patient_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {appointment.phone_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(appointment.appointment_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {getStatusIcon(appointment.status)}
                        <span className="ml-1 capitalize">{appointment.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        {appointment.status === 'pending' && (
                          <button
                            onClick={() => updateStatus(appointment.id, 'in_progress')}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1 rounded"
                            title="Start"
                          >
                            <Activity className="h-5 w-5" />
                          </button>
                        )}
                        {appointment.status === 'in_progress' && (
                          <button
                            onClick={() => updateStatus(appointment.id, 'completed')}
                            className="text-green-600 hover:text-green-900 bg-green-50 p-1 rounded"
                            title="Complete"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        )}
                        {(appointment.status === 'pending' || appointment.status === 'in_progress') && (
                          <button
                            onClick={() => updateStatus(appointment.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900 bg-red-50 p-1 rounded"
                            title="Cancel"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => sendSMS(appointment.phone_number)}
                          className="text-purple-600 hover:text-purple-900 bg-purple-50 p-1 rounded"
                          title="Send notification"
                        >
                          <MessageSquare className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Appointment Details Modal */}
      {showDetailsModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  Appointment Details
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-500">Queue Number</div>
                  <div className="text-xl font-bold text-blue-600">#{selectedAppointment.queue_number}</div>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-500">Status</div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAppointment.status)}`}>
                    {getStatusIcon(selectedAppointment.status)}
                    <span className="ml-1 capitalize">{selectedAppointment.status.replace('_', ' ')}</span>
                  </span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-500">Patient</div>
                  <div className="text-gray-900 font-semibold">{selectedAppointment.patient_name}</div>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-500">Phone</div>
                  <div className="text-gray-900">{selectedAppointment.phone_number}</div>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-500">Appointment Time</div>
                  <div className="text-gray-900">{formatDateTime(selectedAppointment.appointment_time)}</div>
                </div>
                
                {selectedAppointment.service_type && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <div className="text-sm font-medium text-gray-500">Service Type</div>
                    <div className="text-gray-900 capitalize">{selectedAppointment.service_type.replace('_', ' ')}</div>
                  </div>
                )}
                
                {selectedAppointment.notes && (
                  <div className="pb-3 border-b border-gray-200">
                    <div className="text-sm font-medium text-gray-500 mb-1">Notes</div>
                    <div className="text-gray-900 whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded">
                      {selectedAppointment.notes}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-between gap-3">
                {selectedAppointment.status === 'pending' && (
                  <button
                    onClick={() => {
                      updateStatus(selectedAppointment.id, 'in_progress');
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Activity className="h-4 w-4" />
                    Start Appointment
                  </button>
                )}
                
                {selectedAppointment.status === 'in_progress' && (
                  <button
                    onClick={() => {
                      updateStatus(selectedAppointment.id, 'completed');
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Complete
                  </button>
                )}
                
                {(selectedAppointment.status === 'pending' || selectedAppointment.status === 'in_progress') && (
                  <button
                    onClick={() => {
                      updateStatus(selectedAppointment.id, 'cancelled');
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel
                  </button>
                )}
                
                <button
                  onClick={() => sendSMS(selectedAppointment.phone_number)}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;