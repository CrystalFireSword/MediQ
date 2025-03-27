import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-800">MediQueue</span>
          </Link>
          <div className="flex space-x-4">
            <Link to="/book" className="text-gray-600 hover:text-blue-600">Book Appointment</Link>
            <Link to="/doctorlogin" className="text-gray-600 hover:text-blue-600">Doctor Login</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;