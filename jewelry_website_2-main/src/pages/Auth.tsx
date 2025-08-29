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
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [shakeAnimation, setShakeAnimation] = useState(false);

  const loginFields = [
    {
      label: 'Email',
      type: 'email',
      name: 'email',
      required: true,
    },
    {
      label: 'Password',
      type: 'password',
      name: 'password',
      required: true,
    },
  ];

  const registerFields = [
    {
      label: 'Name',
      type: 'text',
      name: 'name',
      required: true,
    },
    ...loginFields,
    {
      label: 'Confirm Password',
      type: 'password',
      name: 'confirmPassword',
      required: true,
    },
  ];

  const handleSubmit = async (data: { [key: string]: string }) => {
    setLoginError('');
    setIsAuthenticating(true);

    try {
      if (isLogin) {
        await login(data.email as string, data.password as string);
        toast.success('Login successful');
        localStorage.setItem('userEmail', data.email);
        navigate('/dashboard');
      } else {
        if (data.password !== data.confirmPassword) {
          setLoginError('Passwords do not match');
          toast.error('Passwords do not match');
          setShakeAnimation(true);
          setTimeout(() => setShakeAnimation(false), 500);
          return;
        }
        await register(data.email as string, data.password as string, data.name as string);
        toast.success('Registration successful');
        localStorage.setItem('userEmail', data.email);
        navigate('/dashboard');
      }
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'An error occurred');
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(errorMessage);
      setShakeAnimation(true);
      
      setTimeout(() => setShakeAnimation(false), 500);
    } finally {
      setIsAuthenticating(false);
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
              onSubmit={handleSubmit}
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
