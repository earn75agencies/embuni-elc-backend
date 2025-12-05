import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRecaptcha } from '../hooks/useRecaptcha';
import { toast } from 'react-toastify';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  
  // reCAPTCHA for login
  const loginRecaptcha = useRecaptcha('v3', 'login');
  // reCAPTCHA for registration
  const registerRecaptcha = useRecaptcha('v3', 'register');

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    studentId: '',
    course: '',
    yearOfStudy: ''
  });

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

 const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await login(loginData.email, loginData.password);
    toast.success('Login successful!');
    
    // Route based on user role
    if (response.user && (response.user.role === 'admin' || response.user.role === 'moderator')) {
      navigate('/admin/dashboard');
    } else {
      navigate('/portal/dashboard');
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'Login failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleRegister = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!registerData.firstName || !registerData.firstName.trim()) {
      toast.error('First name is required');
      return;
    }
    if (!registerData.lastName || !registerData.lastName.trim()) {
      toast.error('Last name is required');
      return;
    }
    if (!registerData.email || !registerData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!registerData.password || registerData.password.trim() === '') {
      toast.error('Password is required');
      return;
    }
    if (!registerData.confirmPassword || registerData.confirmPassword.trim() === '') {
      toast.error('Please confirm your password');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    setLoading(true);

    try {
      // Execute reCAPTCHA if enabled
      let recaptchaToken = null;
      if (registerRecaptcha.isEnabled) {
        recaptchaToken = await registerRecaptcha.execute();
        if (!recaptchaToken) {
          toast.error('reCAPTCHA verification failed. Please try again.');
          setLoading(false);
          return;
        }
      }

      // Clean up data: remove empty strings and convert yearOfStudy to number if provided
      // IMPORTANT: Keep confirmPassword - backend needs it for validation
      const cleanedData = { ...registerData, recaptchaToken };
      
      // Remove empty strings for optional fields
      if (!cleanedData.phone || cleanedData.phone.trim() === '') delete cleanedData.phone;
      if (!cleanedData.studentId || cleanedData.studentId.trim() === '') delete cleanedData.studentId;
      if (!cleanedData.course || cleanedData.course.trim() === '') delete cleanedData.course;
      if (cleanedData.yearOfStudy) {
        cleanedData.yearOfStudy = parseInt(cleanedData.yearOfStudy);
        if (isNaN(cleanedData.yearOfStudy)) delete cleanedData.yearOfStudy;
      } else {
        delete cleanedData.yearOfStudy;
      }
      
      // Ensure confirmPassword is included and not empty (backend validator requires it)
      if (!cleanedData.confirmPassword || cleanedData.confirmPassword.trim() === '') {
        // If confirmPassword is missing or empty, use password as fallback
        // This should not happen due to frontend validation, but just in case
        cleanedData.confirmPassword = cleanedData.password;
      }
      
      const response = await register(cleanedData);
      toast.success('Registration successful! Welcome to ELP!');
      
      // Members always go to member portal after registration
      navigate('/portal/dashboard');
    } catch (error) {
      if (error.response?.data?.code === 'RECAPTCHA_REQUIRED' || error.response?.data?.code === 'RECAPTCHA_FAILED') {
        toast.error('reCAPTCHA verification required. Please refresh and try again.');
        registerRecaptcha.reset();
      } else {
        // Show detailed validation errors if available
        const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
        const errors = error.response?.data?.errors;
        
        if (errors && typeof errors === 'object') {
          // Display first validation error
          const firstError = Object.values(errors)[0];
          toast.error(firstError || errorMessage);
          // Log all errors for debugging
          console.error('Registration validation errors:', errors);
        } else {
          toast.error(errorMessage);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-heading text-4xl font-bold text-charcoal mb-2">
              {isLogin ? 'Welcome Back!' : 'Join ELP Today'}
            </h1>
            <p className="text-neutral-600">
              {isLogin 
                ? 'Sign in to access your member portal'
                : 'Create your account and start your leadership journey'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="card p-8">
              {/* Toggle Buttons */}
              <div className="flex rounded-lg bg-neutral-100 p-1 mb-8">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                    isLogin ? 'bg-white text-primary shadow-soft' : 'text-neutral-600'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                    !isLogin ? 'bg-white text-primary shadow-soft' : 'text-neutral-600'
                  }`}
                >
                  Register
                </button>
              </div>

              {isLogin ? (
                /* Login Form */
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                      <input
                        type="email"
                        name="email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        required
                        className="input-field pl-11"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                      <input
                        type="password"
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                        className="input-field pl-11"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-neutral-600">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary"
                  >
                    {loading ? <div className="spinner w-5 h-5 mx-auto"></div> : 'Sign In'}
                  </button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-neutral-500">Or continue with</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center px-6 py-3 border-2 border-neutral-300 rounded-lg font-semibold hover:bg-neutral-50 transition-all"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>
                </form>
              ) : (
                /* Register Form */
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-charcoal mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={registerData.firstName}
                        onChange={handleRegisterChange}
                        required
                        className="input-field"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-charcoal mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={registerData.lastName}
                        onChange={handleRegisterChange}
                        required
                        className="input-field"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      required
                      className="input-field"
                      placeholder="your.email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={registerData.phone}
                      onChange={handleRegisterChange}
                      className="input-field"
                      placeholder="+254 712 345 678"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-charcoal mb-2">
                        Student ID
                      </label>
                      <input
                        type="text"
                        name="studentId"
                        value={registerData.studentId}
                        onChange={handleRegisterChange}
                        className="input-field"
                        placeholder="UOE/123/456"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-charcoal mb-2">
                        Year of Study
                      </label>
                      <select
                        name="yearOfStudy"
                        value={registerData.yearOfStudy}
                        onChange={handleRegisterChange}
                        className="input-field"
                      >
                        <option value="">Select Year</option>
                        <option value="1">Year 1</option>
                        <option value="2">Year 2</option>
                        <option value="3">Year 3</option>
                        <option value="4">Year 4</option>
                        <option value="5">Year 5</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Course/Program
                    </label>
                    <input
                      type="text"
                      name="course"
                      value={registerData.course}
                      onChange={handleRegisterChange}
                      className="input-field"
                      placeholder="e.g., Computer Science"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      required
                      className="input-field"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      required
                      className="input-field"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="text-sm text-neutral-600">
                    <label className="flex items-start">
                      <input type="checkbox" required className="mr-2 mt-1" />
                      <span>I agree to the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link></span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary"
                  >
                    {loading ? <div className="spinner w-5 h-5 mx-auto"></div> : 'Create Account'}
                  </button>
                </form>
              )}
            </div>

            {/* Info Section */}
            <div className="space-y-6">
              <div className="card p-8 bg-gradient-primary text-white">
                <h3 className="font-heading text-2xl font-bold mb-4">
                  Why Join ELP?
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <User size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Leadership Development</h4>
                      <p className="text-sm text-white/90">Access workshops and training programs</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <BookOpen size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Exclusive Resources</h4>
                      <p className="text-sm text-white/90">Scholarships, guides, and opportunities</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <User size={18} />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Networking</h4>
                      <p className="text-sm text-white/90">Connect with leaders and mentors</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="card p-6">
                <h4 className="font-heading font-bold text-lg text-charcoal mb-3">
                  Need Help?
                </h4>
                <p className="text-neutral-600 text-sm mb-4">
                  If you have any questions about joining ELP or need assistance, feel free to reach out.
                </p>
                <Link to="/contact" className="btn-outline w-full text-center block">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
