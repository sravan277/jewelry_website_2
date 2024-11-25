import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container-custom py-20 min-h-screen"
    >
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-serif mb-6">Settings</h1>
        
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-medium mb-4">Preferences</h2>
            {/* Add settings options here */}
            <p className="text-gray-600">Settings page under construction</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
