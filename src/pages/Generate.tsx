import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Camera, Upload, Wand2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';
import { toast } from 'react-toastify';

const Generate: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const styles = [
    'Modern Minimalist',
    'Vintage Elegant',
    'Art Deco',
    'Contemporary',
    'Bohemian',
    'Gothic',
  ];

  const inspirationPrompts = [
    'A delicate rose gold necklace with intertwined leaves',
    'An art deco inspired emerald ring with geometric patterns',
    'A minimalist silver bracelet with hidden gemstones',
    'A vintage-style sapphire pendant with filigree details',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('prompt', prompt);
      formData.append('style', selectedStyle);

      const response = await axios.post('http://localhost:4000/api/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        responseType: 'blob'
      });

      const imageUrl = URL.createObjectURL(response.data);
      setGeneratedImage(imageUrl);
      toast.success('Image generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-900 text-white p-8 pt-24"
    >
      {/* Decorative Elements */}
      <motion.div
        className="fixed top-20 right-20 w-32 h-32 opacity-20"
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <img src="/decorative/sparkle.svg" alt="" className="w-full h-full" />
      </motion.div>

      <motion.div
        className="fixed bottom-20 left-20 w-40 h-40 opacity-10"
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <img src="/decorative/jewelry-pattern.svg" alt="" className="w-full h-full" />
      </motion.div>

      <div className="max-w-6xl mx-auto">
        <motion.h1 
          className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          Transform Your Jewelry Designs
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <motion.div 
            className="lg:col-span-1 space-y-6"
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            {/* Tab Switcher */}
            <div className="bg-gray-800 p-1 rounded-lg flex mb-6">
              <motion.button
                className={`flex-1 py-2 rounded-md flex items-center justify-center space-x-2 ${
                  activeTab === 'text' ? 'bg-purple-600' : 'hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('text')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Wand2 size={18} />
                <span>Text to Image</span>
              </motion.button>
              <motion.button
                className={`flex-1 py-2 rounded-md flex items-center justify-center space-x-2 ${
                  activeTab === 'image' ? 'bg-purple-600' : 'hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab('image')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Upload size={18} />
                <span>Image to Image</span>
              </motion.button>
            </div>

            {/* Input Section */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium mb-2">
                  {activeTab === 'text' ? 'Describe your design' : 'Upload reference image'}
                </label>
                {activeTab === 'text' ? (
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full h-32 bg-gray-800 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    placeholder="Describe your jewelry design in detail..."
                  />
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      accept="image/*"
                    />
                    <motion.label
                      htmlFor="image-upload"
                      className="block w-full aspect-square bg-gray-800 rounded-lg cursor-pointer overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {uploadedImage ? (
                        <img
                          src={uploadedImage}
                          alt="Uploaded"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                          <Upload size={32} />
                          <p className="mt-2">Click to upload image</p>
                        </div>
                      )}
                    </motion.label>
                  </div>
                )}
              </motion.div>

              {/* Style Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium mb-2">Choose style</label>
                <div className="grid grid-cols-2 gap-2">
                  {styles.map((style) => (
                    <motion.button
                      key={style}
                      onClick={() => setSelectedStyle(style)}
                      className={`p-2 rounded-lg text-sm ${
                        selectedStyle === style
                          ? 'bg-purple-600'
                          : 'bg-gray-800 hover:bg-gray-700'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {style}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Generate Button */}
              <motion.button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isGenerating ? (
                  <LoadingSpinner size={20} className="border-white" />
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Generate</span>
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            className="lg:col-span-2 space-y-8"
            initial={{ x: 100 }}
            animate={{ x: 0 }}
            transition={{ type: "spring", stiffness: 100 }}
          >
            {/* Generated Image Display */}
            <div className="aspect-square w-full bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center relative group">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center space-y-4"
                  >
                    <LoadingSpinner size={48} className="border-gray-400" />
                    <p className="text-gray-400">Creating your masterpiece...</p>
                  </motion.div>
                ) : generatedImage ? (
                  <motion.img
                    key="generated"
                    src={generatedImage}
                    alt="Generated design"
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 100 }}
                  />
                ) : (
                  <motion.div
                    key="placeholder"
                    className="text-gray-400 flex flex-col items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Camera size={48} />
                    <p className="mt-4">Your design will appear here</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hover Overlay */}
              {generatedImage && (
                <motion.div 
                  className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center space-x-4 transition-opacity"
                >
                  <motion.button
                    className="bg-white text-black px-4 py-2 rounded-lg font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Download
                  </motion.button>
                  <motion.button
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Share
                  </motion.button>
                </motion.div>
              )}
            </div>

            {/* Inspiration Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-medium mb-4">Need inspiration?</h3>
              <div className="grid grid-cols-2 gap-4">
                {inspirationPrompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setPrompt(prompt)}
                    className="p-4 bg-gray-800 rounded-lg text-left hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <p className="text-sm text-gray-300">{prompt}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Generate;
