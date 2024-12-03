import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiImage, FiGrid, FiClock, FiTrash2, FiX, FiDownload, FiZoomIn } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ImageRecord {
  _id: string;
  sketch_image: string;
  generated_image: string;
  timestamp: string;
  email?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageRecord | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchUserImages();
  }, [user]);

  const fetchUserImages = async () => {
    if (!user?.email) {
      setError('Please log in to view your images');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/images/my-images?email=${encodeURIComponent(user.email)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch images');
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        setImages(data);
        setError(null);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading images. Please try again later.';
      setError(errorMessage);
      console.error('Error fetching images:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!user?.email) return;

    try {
      const response = await fetch(`http://localhost:4000/api/images/${imageId}?email=${encodeURIComponent(user.email)}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      // Remove the deleted image from state
      setImages(prevImages => prevImages.filter(img => img._id !== imageId));
      setDeleteConfirm(null);
      setSelectedImage(null);
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Failed to delete image. Please try again.');
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadImage = (base64String: string, type: string) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64String}`;
    link.download = `jewelry-${type}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const stats = [
    { icon: <FiUpload className="w-6 h-6" />, label: 'Total Uploads', value: images.length },
    { icon: <FiImage className="w-6 h-6" />, label: 'Generated Designs', value: images.length },
    { icon: <FiGrid className="w-6 h-6" />, label: 'Categories', value: 4 },
    { icon: <FiClock className="w-6 h-6" />, label: 'Processing Time', value: '~2s' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8 pt-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
          AI Jewelry Design Dashboard
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Transform your jewelry sketches into stunning designs using our advanced AI technology.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                {stat.icon}
              </div>
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/generate')}
          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold 
                   hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg 
                   hover:shadow-purple-500/25"
        >
          Create New Design
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/gallery')}
          className="px-8 py-4 bg-gray-800 rounded-xl font-semibold hover:bg-gray-700 
                   transition-all duration-300 border border-gray-700 hover:border-purple-500/50"
        >
          View Gallery
        </motion.button>
      </div>

      {/* Recent Uploads */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <h2 className="text-2xl font-bold mb-6">Recent Designs</h2>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            <AnimatePresence>
              {images.map((image) => (
                <motion.div
                  key={image._id}
                  variants={cardVariants}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="bg-gray-800/50 backdrop-blur-lg rounded-xl overflow-hidden border border-gray-700/50 
                           hover:border-purple-500/50 transition-all duration-300 group relative"
                >
                  <div className="relative flex h-[250px]">
                    {/* Sketch Image */}
                    <motion.div
                      initial={{ flex: 1 }}
                      whileHover={{ flex: 2 }}
                      transition={{ duration: 0.3 }}
                      className="relative overflow-hidden"
                    >
                      <img
                        src={`data:image/png;base64,${image.sketch_image}`}
                        alt="Original sketch"
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setSelectedImage(image)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent">
                        <div className="absolute bottom-2 left-2">
                          <p className="text-xs text-gray-300">Original Sketch</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Generated Image */}
                    <motion.div
                      initial={{ flex: 1 }}
                      whileHover={{ flex: 2 }}
                      transition={{ duration: 0.3 }}
                      className="relative overflow-hidden"
                    >
                      <img
                        src={`data:image/png;base64,${image.generated_image}`}
                        alt="Generated design"
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setSelectedImage(image)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent">
                        <div className="absolute bottom-2 left-2">
                          <p className="text-xs text-gray-300">Generated Design</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => downloadImage(image.generated_image, 'generated')}
                        className="p-1.5 bg-purple-500/20 rounded-full hover:bg-purple-500/40 transition-all duration-300"
                      >
                        <FiDownload className="w-4 h-4 text-purple-400" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setDeleteConfirm(image._id)}
                        className="p-1.5 bg-red-500/20 rounded-full hover:bg-red-500/40 transition-all duration-300"
                      >
                        <FiTrash2 className="w-4 h-4 text-red-500" />
                      </motion.button>
                    </div>

                    {/* Timestamp */}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                      <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
                        <FiClock className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-300">{formatDate(image.timestamp || '')}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-800 p-6 rounded-xl max-w-sm mx-4 relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setDeleteConfirm(null)}
                className="absolute top-2 right-2 p-2 hover:bg-gray-700 rounded-full"
              >
                <FiX className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold mb-4">Delete Design</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this design? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg flex-1 transition-colors duration-200"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg flex-1 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-gray-800 rounded-xl p-4 max-w-4xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Image Preview</h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Original Sketch</p>
                  <img
                    src={`data:image/png;base64,${selectedImage.sketch_image}`}
                    alt="Original sketch"
                    className="w-full rounded-lg"
                  />
                  <button
                    onClick={() => downloadImage(selectedImage.sketch_image, 'sketch')}
                    className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <FiDownload className="w-4 h-4" />
                    <span>Download Sketch</span>
                  </button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">Generated Design</p>
                  <img
                    src={`data:image/png;base64,${selectedImage.generated_image}`}
                    alt="Generated design"
                    className="w-full rounded-lg"
                  />
                  <button
                    onClick={() => downloadImage(selectedImage.generated_image, 'generated')}
                    className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <FiDownload className="w-4 h-4" />
                    <span>Download Design</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
