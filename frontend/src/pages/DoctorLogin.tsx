import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Lock, Mail, EyeOff, Eye, Shield, ArrowRight } from 'lucide-react';

const DoctorLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);
    
  //   try {
  //     // In a real app, you would use Supabase auth or another auth provider
  //     const { data, error } = await supabase.auth.signInWithPassword({
  //       email: formData.email,
  //       password: formData.password
  //     });
      
  //     if (error) throw error;
      
  //     toast.success('Login successful');
      
  //     // Store the session token if remember me is checked
  //     if (formData.rememberMe) {
  //       localStorage.setItem('doctorSession', JSON.stringify(data.session));
  //     } else {
  //       sessionStorage.setItem('doctorSession', JSON.stringify(data.session));
  //     }
      
  //     // Redirect to the doctor dashboard
  //     navigate('/doctor/dashboard');
  //   } catch (error) {
  //     console.error('Login error:', error);
  //     toast.error('Invalid email or password');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // const { data, error } = await supabase.auth.signInWithPassword({
      //   email: formData.email,
      //   password: formData.password
      // });
      
      // if (error) throw error;
      
      // toast.success('Login successful');
      
      // if (formData.rememberMe) {
      //   localStorage.setItem('doctorSession', JSON.stringify(data.session));
      // } else {
      //   sessionStorage.setItem('doctorSession', JSON.stringify(data.session));
      // }
      
      // Redirect to "/doctor" instead of "/doctor/dashboard"
      navigate('/doctor');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100 mb-4">
            <Shield className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Doctor Portal</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your patient queue and appointments
          </p>
        </div>
        
        {/* Login Card */}
        <div className="bg-white py-8 px-6 shadow rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="doctor@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <Lock className={`h-5 w-5 text-blue-500 group-hover:text-blue-400 ${loading ? 'animate-pulse' : ''}`} />
                </span>
                <div className="flex items-center">
                  {loading ? 'Signing in...' : 'Sign in'}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </div>
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Need help?</span>
              </div>
            </div>
            
            <div className="mt-4 text-center text-sm">
              <p className="text-gray-600">
                Contact your administrator or call support at
                <a href="tel:+11234567890" className="ml-1 font-medium text-blue-600 hover:text-blue-500">
                  (123) 456-7890
                </a>
              </p>
            </div>
          </div>
        </div>
        
        {/* Security Notice */}
        <div className="text-center text-xs text-gray-500">
          <p className="flex items-center justify-center">
            <Shield className="h-3 w-3 mr-1 text-blue-500" />
            Secure login protected with end-to-end encryption
          </p>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;