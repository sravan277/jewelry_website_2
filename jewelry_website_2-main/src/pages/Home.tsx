import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring, AnimatePresence, MotionStyle } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaStar, FaRobot, FaMagic, FaPalette, FaGem } from 'react-icons/fa';
import LoadingScreen from '../components/LoadingScreen';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const imageHover = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.3, ease: "easeInOut" }
  }
};

const Home = () => {
  const { scrollYProgress } = useScroll();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();
  
  const scaleProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    // Preload the hero image
    const heroImage = new Image();
    heroImage.src = '/images/home-hero.jpg';
    heroImage.onload = () => setIsLoaded(true);
    heroImage.onerror = (error) => {
      console.error('Error loading hero image:', error);
      setIsLoaded(true); // Still show the page even if image fails to load
    };
  }, []);

  const handleStartDesign = () => {
    setIsRedirecting(true);
    setTimeout(() => {
      navigate('/generate');
    }, 2000); // Show loading screen for 2 seconds before redirecting
  };

  const progressBarStyle: MotionStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'var(--color-primary)',
    transformOrigin: '0%',
    scaleX: scaleProgress
  };

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Fashion Designer",
      text: "The attention to detail and craftsmanship is unparalleled. My custom design was brought to life exactly as I envisioned.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Art Collector",
      text: "An exceptional experience from start to finish. The collaborative design process was both enjoyable and professional.",
      rating: 5
    },
    {
      name: "Emma Davis",
      role: "Interior Designer",
      text: "Their ability to transform concepts into stunning pieces of jewelry is remarkable. Truly a premium service.",
      rating: 5
    }
  ];
  
  return (
<AnimatePresence mode="wait">
      {isRedirecting && <LoadingScreen key="loading" />} {/* Add key="loading" */}
      {isLoaded && (
        <motion.div
          key="content" // Add key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-gray-50"
        >
          <motion.div style={progressBarStyle} />
          
          {/* Hero Section */}
          <motion.section 
            className="relative h-screen flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <img
                src="/images/home-hero.jpg"
                alt="Luxury Jewelry"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
            </motion.div>
            
            <div className="relative text-center text-white px-4 max-w-4xl">
              <motion.h1 
                className="text-7xl font-serif mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Bespoke Jewelry Design
              </motion.h1>
              <motion.p 
                className="text-2xl mb-12 leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                Transform your vision into exquisite pieces of art using our cutting-edge AI technology. 
                Experience the perfect blend of artificial intelligence and expert craftsmanship
                to create jewelry that's uniquely yours.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8 }}
              >
                <button 
                  onClick={handleStartDesign}
                  className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-full text-lg hover:bg-primary-dark transition-colors duration-300 group"
                >
                  Start Your Design
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </motion.div>
            </div>
          </motion.section>

          {/* Featured Collections */}
          <motion.section 
            className="py-24 px-4 bg-gray-50"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="container mx-auto max-w-6xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100px" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                  className="h-1 bg-primary mb-6 mx-auto"
                />
                <h2 className="text-4xl font-serif mb-4 text-primary-dark">Featured Collections</h2>
                <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                  Discover our latest masterpieces, where timeless elegance meets contemporary design.
                  Each piece tells a unique story of craftsmanship and creativity.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: "The Diamond Collection",
                    image: "/images/featured-1.jpg",
                    description: "Exquisite diamond pieces that capture light and imagination"
                  },
                  {
                    title: "Vintage Inspirations",
                    image: "/images/featured-2.jpg",
                    description: "Classic designs reimagined for the modern era"
                  },
                  {
                    title: "Contemporary Luxe",
                    image: "/images/featured-3.jpg",
                    description: "Bold, modern pieces that make a statement"
                  }
                ].map((collection, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="group cursor-pointer"
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div 
                      className="relative h-96 rounded-lg overflow-hidden mb-6"
                      variants={imageHover}
                      initial="rest"
                      whileHover="hover"
                    >
                      <img
                        src={collection.image}
                        alt={collection.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white text-2xl font-serif">View Collection</span>
                      </div>
                    </motion.div>
                    <h3 className="text-2xl font-serif mb-3 text-primary">{collection.title}</h3>
                    <p className="text-gray-600">{collection.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* AI-Powered Design Process */}
          <motion.section 
            className="py-24 bg-gradient-to-b from-gray-50 to-white"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="container mx-auto max-w-6xl px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100px" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                  className="h-1 bg-primary mb-6 mx-auto"
                />
                <h2 className="text-4xl font-serif mb-4 text-primary-dark">AI-Powered Design Innovation</h2>
                <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                  Experience the future of jewelry design with our state-of-the-art AI technology
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                <motion.div
                  variants={fadeInUp}
                  className="space-y-8"
                >
                  <div className="relative rounded-lg overflow-hidden grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <div className="h-48 bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="relative h-full">
                          <img
                            src="/images/x.jpg"
                            alt="Jewelry Sketch Input"
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <p className="text-white text-sm px-4 text-center">Hand-drawn jewelry sketch</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-center font-medium text-gray-700">1. Sketch Input</p>
                      <p className="text-xs text-center text-gray-500">Upload your jewelry sketch or concept</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-48 bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="relative h-full">
                          <img
                            src="/images/y.jpg"
                            alt="AI Design Processing"
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <p className="text-white text-sm px-4 text-center">AI-powered transformation</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-center font-medium text-gray-700">2. AI Enhancement</p>
                      <p className="text-xs text-center text-gray-500">Advanced AI processing and refinement</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-48 bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                        <div className="relative h-full">
                          <img
                            src="/images/z.jpg"
                            alt="Final Jewelry Design"
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <p className="text-white text-sm px-4 text-center">Professional design render</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-center font-medium text-gray-700">3. Final Design</p>
                      <p className="text-xs text-center text-gray-500">Photorealistic 3D visualization</p>
                    </div>
                  </div>
                </motion.div>
                <motion.div
                  variants={fadeInUp}
                  className="space-y-6"
                >
                  <h3 className="text-3xl font-serif text-primary-dark mb-4">How It Works</h3>
                  <div className="space-y-8">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                        <FaRobot className="text-2xl text-primary" />
                      </div>
                      <div>
                        <h4 className="text-xl font-serif text-primary-dark mb-2">AI Image Generation</h4>
                        <p className="text-gray-600">Upload inspiration images or describe your dream jewelry. Our AI analyzes your input to generate unique design concepts.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                        <FaMagic className="text-2xl text-primary" />
                      </div>
                      <div>
                        <h4 className="text-xl font-serif text-primary-dark mb-2">Intelligent Customization</h4>
                        <p className="text-gray-600">Fine-tune designs with AI-powered tools that understand jewelry aesthetics and manufacturing constraints.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                        <FaPalette className="text-2xl text-primary" />
                      </div>
                      <div>
                        <h4 className="text-xl font-serif text-primary-dark mb-2">Real-time Visualization</h4>
                        <p className="text-gray-600">See instant 3D renders of your design from multiple angles, with realistic materials and lighting.</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                variants={fadeInUp}
                className="text-center"
              >
                <Link 
                  to="/generate"
                  className="inline-flex items-center px-8 py-4 bg-primary text-white rounded-full text-lg hover:bg-primary-dark transition-colors duration-300 group"
                >
                  Try AI Design Now
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </motion.div>
            </div>
          </motion.section>

          {/* AI Design Benefits */}
          <motion.section 
            className="py-24 bg-gray-50"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="container mx-auto max-w-6xl px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl font-serif mb-4 text-primary-dark">Why Choose AI-Powered Design</h2>
                <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                  Experience the perfect blend of technological innovation and traditional craftsmanship
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    title: "Unlimited Possibilities",
                    description: "Generate countless unique designs based on your preferences and inspiration",
                    icon: "🎨"
                  },
                  {
                    title: "Rapid Iteration",
                    description: "Instantly visualize design variations and make real-time adjustments",
                    icon: "⚡"
                  },
                  {
                    title: "Perfect Match",
                    description: "AI ensures your design aligns perfectly with your style and requirements",
                    icon: "✨"
                  }
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="text-4xl mb-4">{benefit.icon}</div>
                    <h3 className="text-xl font-serif mb-3 text-primary">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.section 
            className="py-24 relative overflow-hidden"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="absolute inset-0">
              <img
                src="/images/testimonial-bg.jpg"
                alt="Background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/70" />
            </div>
            
            <div className="container mx-auto max-w-6xl px-4 relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100px" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                  className="h-1 bg-primary mb-6 mx-auto"
                />
                <h2 className="text-4xl font-serif mb-4 text-white">Client Testimonials</h2>
                <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                  Hear from our satisfied clients about their custom jewelry experience
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="bg-white/10 backdrop-blur-md p-8 rounded-lg text-white"
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400 mr-1" />
                      ))}
                    </div>
                    <p className="text-lg mb-6 italic">"{testimonial.text}"</p>
                    <div>
                      {/* <p className="font-serif text-xl mb-1">{testimonial.name}</p> */}
                      <p className="text-gray-300">{testimonial.role}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* Call to Action */}
          <motion.section 
            className="py-24 bg-primary text-white text-center"
            variants={fadeInUp}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <div className="container mx-auto max-w-4xl px-4">
              <motion.h2 
                className="text-4xl font-serif mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Ready to Create Your Dream Piece?
              </motion.h2>
              <motion.p 
                className="text-xl mb-12 text-white/90"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Start your journey towards owning a unique piece of jewelry that tells your story.
                Our expert designers are ready to bring your vision to life with unparalleled craftsmanship and attention to detail.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <Link 
                  to="/contact"
                  className="inline-flex items-center px-8 py-4 bg-white text-primary rounded-full text-lg hover:bg-gray-100 transition-colors duration-300 group"
                >
                  Schedule a Consultation
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </motion.div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Home;
