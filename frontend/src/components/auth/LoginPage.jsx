// src/components/auth/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Lottie from 'lottie-react';
import secureLoginAnimation from '../../assets/animations/login.json';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Call your backend API
      const response = await axios.post('http://localhost:8000/api/users/login/', {
        username: formData.username,
        password: formData.password
      });
      
      console.log(response);
      
      // Handle successful login
      localStorage.setItem('authToken', response.data.token);
      
      // If remember me is checked, store in localStorage, otherwise sessionStorage
      if (formData.rememberMe) {
        localStorage.setItem('username', formData.username);
      } else {
        sessionStorage.setItem('username', formData.username);
      }
      console.log(localStorage.getItem('authToken'))
      
      navigate('/dashboard');
      
    } catch (error) {
      // Handle errors from the backend
      if (error.response && error.response.status === 400) {
        setErrors({
          general: 'Invalid username or password'
        });
      } else {
        setErrors({
          general: 'Login failed. Please try again later.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900">
      {/* Animation Section */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-blue-600 dark:bg-blue-800">
        <div className="w-full max-w-md">
          <Lottie 
            animationData={secureLoginAnimation} 
            loop={true} 
            className="w-full h-64 md:h-96"
          />
          <h1 className="text-3xl font-bold text-white text-center mt-6">
            Welcome Back
          </h1>
          <p className="text-blue-100 text-center mt-4">
            Log in to access your simplified legal documents and continue your work where you left off.
          </p>
        </div>
      </div>
      
      {/* Login Form */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
              Log In to Your Account
            </h2>
            
            {errors.general && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                {errors.general}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
                  Usernmae
                </label>
                <input
                  type="text"
                  id="email"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                  }`}
                  placeholder="Enter your username"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold" htmlFor="password">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                    Forgot Password?
                  </Link>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                    errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                  }`}
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>
              
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Remember me
                  </label>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out disabled:opacity-50"
              >
                {isSubmitting ? 'Logging In...' : 'Log In'}
              </button>
            </form>
            
            <div className="text-center mt-6">
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link to="/register" className="text-blue-600 hover:underline dark:text-blue-400">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;