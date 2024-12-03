import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { FiUpload, FiImage, FiDownload, FiZoomIn, FiStar, FiClock } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../context/AuthContext';

const Generate: React.FC = () => {
  const { user, token } = useAuth();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [selection, setSelection] = useState('gold'); 

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouseX.set(x);
    mouseY.set(y);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    maxSize: 5000000 // 5MB
  });

  

  const handleGenerate = async () => {
    try {
      setError(null);
      setIsGenerating(true);

      if (!image) {
        throw new Error('Please upload an image first');
      }

      if (!user?.email) {
        throw new Error('Please log in to generate designs');
      }

      console.log('Selected model:', selection);
      
      // Send image to backend
      const serverUrl =
        selection === 'gold'
          ? 'http://localhost:4000/api/upload'
          : selection === 'silver'
          ? 'http://localhost:4000/api/upload/silver'
          : 'http://localhost:4000/api/upload/gold-gemstone';
      
      console.log('Sending request to:', serverUrl);

      const formData = new FormData();
      formData.append('file', image);
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        throw new Error('User email not found. Please try logging in again.');
      }
      formData.append('email', userEmail);

      const response = await fetch(serverUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        // Try to parse error message if available
        try {
          const errorData = await response.json();
          const errorMessage = errorData.error || '';
          
          // Check for specific errors
          if (errorMessage.toLowerCase().includes('high demand') || 
              errorMessage.toLowerCase().includes('rate limit') || 
              errorMessage.toLowerCase().includes('resource_exhausted')) {
            throw new Error('Our service is experiencing high demand. Please try again in about an hour, or try a different model type.');
          } else if (errorMessage.includes('missing 2 required positional arguments')) {
            throw new Error('There was an error with your user information. Please try logging out and back in.');
          } else if (errorMessage.toLowerCase().includes('no model') || 
                     errorMessage.toLowerCase().includes('model not available')) {
            throw new Error('The selected model is currently unavailable. Please try a different model type or contact support if the issue persists.');
          }
          
          throw new Error(errorMessage || 'Failed to generate design');
        } catch (jsonError) {
          if (jsonError instanceof Error) {
            throw jsonError; // Re-throw our custom error messages
          }
          throw new Error(`Failed to generate design: ${response.statusText}`);
        }
      }

      // Check content type to ensure we received an image
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('image/')) {
        throw new Error('Server did not return an image');
      }

      // Convert response to blob and create URL
      const blob = await response.blob();
      const generatedImageUrl = URL.createObjectURL(blob);
      setGeneratedImage(generatedImageUrl);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (generatedImage) {
      try {
        const response = await fetch(generatedImage);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated-jewelry-design.png';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (err) {
        console.error('Download error:', err);
        setError('Error downloading the image');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pt-20 pb-12 overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-blue-300/20 to-purple-300/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-12"
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-serif font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-transparent bg-clip-text mb-4"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              Transform Your Jewelry Sketches
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-600 max-w-2xl mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Watch your creative visions come to life with our AI-powered design generator
            </motion.p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg"
            >
              {error}
            </motion.div>
          )}
          <div className="mt-6 bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Select Model Type</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <label
                      className={`relative flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all ${
                        selection === 'gold' 
                          ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg ring-2 ring-purple-600' 
                          : 'bg-white hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="selection"
                        value="gold"
                        checked={selection === 'gold'}
                        onChange={() => setSelection('gold')}
                        className="absolute opacity-0"
                      />
                      <span className="text-lg font-medium mb-2">Gold</span>
                      <span className={`text-sm ${selection === 'gold' ? 'text-white/80' : 'text-gray-500'}`}>
                        Classic gold jewelry
                      </span>
                    </label>
                    <label
                      className={`relative flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all ${
                        selection === 'silver' 
                          ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg ring-2 ring-purple-600' 
                          : 'bg-white hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="selection"
                        value="silver"
                        checked={selection === 'silver'}
                        onChange={() => setSelection('silver')}
                        className="absolute opacity-0"
                      />
                      <span className="text-lg font-medium mb-2">Silver</span>
                      <span className={`text-sm ${selection === 'silver' ? 'text-white/80' : 'text-gray-500'}`}>
                        Modern silver designs
                      </span>
                    </label>
                    <label
                      className={`relative flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all ${
                        selection === 'gold-gemstone' 
                          ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg ring-2 ring-purple-600' 
                          : 'bg-white hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="selection"
                        value="gold-gemstone"
                        checked={selection === 'gold-gemstone'}
                        onChange={() => setSelection('gold-gemstone')}
                        className="absolute opacity-0"
                      />
                      <span className="text-lg font-medium mb-2">Gold Gemstone</span>
                      <span className={`text-sm ${selection === 'gold-gemstone' ? 'text-white/80' : 'text-gray-500'}`}>
                        Gold with precious gems
                      </span>
                    </label>
                  </div>
                </div>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Input Section */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-8"
            >
              <motion.div 
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                onMouseMove={handleMouseMove}
              >
                
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5" 
                  style={{
                    background: `radial-gradient(circle at ${mouseX}px ${mouseY}px, rgba(139, 92, 246, 0.1), rgba(219, 39, 119, 0.05), rgba(59, 130, 246, 0.05))`
                  }}
                />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text mb-6">
                  Upload Your Sketch
                </h2>
                
                
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all relative overflow-hidden ${
                    isDragActive
                      ? 'border-purple-400 bg-purple-50 scale-[0.99]'
                      : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                >
                  
                  
                  

                  <input {...getInputProps()} />
                  <motion.div
                    initial={false}
                    animate={isDragActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                    className="flex flex-col items-center relative z-10"
                  >
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                      <FiUpload className="h-8 w-8 text-white" />
                    </div>
                    {imagePreview ? (
                      <motion.p 
                        className="text-purple-600 font-medium"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                      >
                        Image uploaded! Drop another to replace
                      </motion.p>
                    ) : (
                      <div>
                        <p className="text-lg font-medium text-purple-600 mb-2">Drop your sketch here</p>
                        <p className="text-gray-500">or click to select a file</p>
                      </div>
                    )}
                  </motion.div>
                  {isDragActive && (
                    <motion.div 
                      className="absolute inset-0 bg-purple-500/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </div>
                {imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <div className="relative group">
                      <img
                        src={imagePreview}
                        alt="Uploaded sketch"
                        className="rounded-xl w-full object-cover shadow-lg cursor-pointer transition-transform group-hover:scale-[1.02]"
                        onClick={() => setShowLightbox(true)}
                      />
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center"
                        whileHover={{ scale: 1.05 }}
                      >
                        <FiZoomIn className="w-8 h-8 text-white" />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
                

                <div className="mt-6 space-y-6">
                  <div>
                    <label className="block text-lg font-medium text-gray-700 mb-2">
                      Description Prompt
                    </label>
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none h-32 bg-white/50 backdrop-blur-sm"
                      placeholder="Describe your dream jewelry design..."
                    />
                  </div>
                  <motion.button
                    onClick={handleGenerate}
                    disabled={!image || isGenerating}
                    className={`w-full py-4 px-6 rounded-xl font-medium transition-all relative overflow-hidden ${
                      !image || isGenerating
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/25'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isGenerating ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Creating your masterpiece...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-3">
                        <FiStar className="w-5 h-5" />
                        <span>Generate Design</span>
                      </div>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>

            {/* Output Section */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="space-y-8"
            >
              <motion.div 
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-6">
                  Generated Design
                </h2>
                {generatedImage ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="relative group">
                      <img
                        src={generatedImage}
                        alt="Generated design"
                        className="rounded-xl w-full object-cover shadow-lg cursor-pointer transition-transform group-hover:scale-[1.02]"
                        onClick={() => setShowLightbox(true)}
                      />
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center"
                        whileHover={{ scale: 1.05 }}
                      >
                        <FiZoomIn className="w-8 h-8 text-white" />
                      </motion.div>
                    </div>
                    <motion.button
                      onClick={handleDownload}
                      className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all flex items-center justify-center space-x-3"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FiDownload className="w-5 h-5" />
                      <span>Download Design</span>
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="h-[400px] flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50"
                    animate={{ 
                      scale: [1, 1.02, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <FiClock className="w-12 h-12 text-gray-400" />
                    <p className="text-gray-500 text-lg">Your masterpiece will appear here</p>
                  </motion.div>
                )}
              </motion.div>

              {/* <DesignSuggestions onSelectPrompt={setPrompt} /> */}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {showLightbox && (generatedImage || imagePreview) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 p-4 sm:p-8 flex items-center justify-center backdrop-blur-xl"
            onClick={() => setShowLightbox(false)}
          >
            <motion.img
              initial={{ scale: 0.9, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.9, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
              src={generatedImage || imagePreview || ''}
              alt="Enlarged view"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Generate;
