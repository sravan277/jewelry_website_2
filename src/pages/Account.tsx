import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Account = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.name);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveProfile = () => {
    // TODO: Implement profile update functionality
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container-custom py-20 min-h-screen bg-gray-50"
    >
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-serif mb-2">My Account</h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-secondary"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Profile Information */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-xl font-medium mb-6">Profile Information</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your display name"
                    />
                  ) : (
                    <p className="text-gray-800">{displayName || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="text-gray-800">{phone || 'Not set'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Address
                  </label>
                  {isEditing ? (
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={3}
                      placeholder="Enter your shipping address"
                    />
                  ) : (
                    <p className="text-gray-800">{address || 'Not set'}</p>
                  )}
                </div>

                {isEditing && (
                  <button
                    onClick={handleSaveProfile}
                    className="btn-primary w-full"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="md:col-span-1 space-y-6">
            {/* Account Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-4">Account Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Member Since</span>
                  <span className="text-gray-800">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Orders</span>
                  <span className="text-gray-800">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Wishlist Items</span>
                  <span className="text-gray-800">0</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/settings')}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center"
                >
                  <i className="fas fa-cog mr-2"></i>
                  Settings
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center"
                >
                  <i className="fas fa-shopping-bag mr-2"></i>
                  My Orders
                </button>
                <button
                  onClick={() => navigate('/wishlist')}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors flex items-center"
                >
                  <i className="fas fa-heart mr-2"></i>
                  Wishlist
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Account;
