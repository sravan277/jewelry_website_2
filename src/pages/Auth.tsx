import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const loginFields = [
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      required: true,
    },
    {
      name: 'password',
      type: 'password',
      label: 'Password',
      required: true,
    },
  ];

  const registerFields = [
    {
      name: 'name',
      type: 'text',
      label: 'Full Name',
      required: true,
    },
    ...loginFields,
  ];

  const handleLogin = async (data: { [key: string]: string }) => {
    try {
      await login(data.email, data.password);
      toast.success('Login successful!');
      navigate('/generate');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message.includes('password')) {
        toast.error('Invalid password. Please try again.');
      } else {
        toast.error(error.message || 'Login failed. Please try again.');
      }
    }
  };

  const handleRegister = async (data: { [key: string]: string }) => {
    try {
      await register(data.name, data.email, data.password);
      toast.success('Registration successful!');
      navigate('/generate');
    } catch (error: any) {
      console.error('Register error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 flex flex-col bg-gray-50">
      <Toaster position="top-right" />
      <div className="container-custom">
        <div className="max-w-md mx-auto text-center mb-8">
          <h1 className="text-4xl font-serif mb-4">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600">
            {isLogin
              ? 'Sign in to access your jewelry designs'
              : 'Join us to start creating your unique jewelry designs'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? 'login' : 'register'}
            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <AuthForm
              title={isLogin ? 'Sign In' : 'Sign Up'}
              fields={isLogin ? loginFields : registerFields}
              submitText={isLogin ? 'Sign In' : 'Create Account'}
              onSubmit={isLogin ? handleLogin : handleRegister}
            />
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:text-primary-dark transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
