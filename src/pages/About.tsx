import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring, AnimatePresence, MotionStyle } from 'framer-motion';

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

const About = () => {
  const { scrollYProgress } = useScroll();
  const [isLoaded, setIsLoaded] = useState(false);
  
  const scaleProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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

  return (
    <AnimatePresence>
      {isLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen pt-20 pb-12 bg-gray-50"
        >
          <motion.div style={progressBarStyle} />
          
          <div className="container-custom">
            <div className="max-w-6xl mx-auto">
              {/* Hero Section */}
              <motion.div 
                className="relative h-[80vh] mb-16 rounded-2xl overflow-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <motion.div
                  className="absolute inset-0"
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                >
                  <img
                    src="/images/jewelry-hero.jpg"
                    alt="Luxury Jewelry Crafting"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
                  <div className="text-white p-12">
                    <motion.h1 
                      className="text-6xl font-serif mb-6"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.8 }}
                    >
                      AI-Powered
                      <br />
                      Jewelry Design
                    </motion.h1>
                    <motion.p 
                      className="text-2xl max-w-xl leading-relaxed"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7, duration: 0.8 }}
                    >
                      Transforming your creative vision into stunning jewelry designs using cutting-edge AI technology
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9, duration: 0.8 }}
                    >
                      <button className="mt-8 px-8 py-3 bg-primary text-white rounded-full text-lg hover:bg-primary-dark transition-colors duration-300">
                        Start Your Journey
                      </button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Our Innovation Section */}
              <motion.section 
                className="bg-white rounded-lg shadow-md p-12 mb-16 grid md:grid-cols-2 gap-12 items-center"
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
              >
                <div>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100px" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="h-1 bg-primary mb-6"
                  />
                  <motion.h2 
                    className="text-4xl font-serif mb-6 text-primary-dark"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    Our Innovation
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                      We're revolutionizing jewelry design through advanced artificial intelligence. Our platform 
                      combines state-of-the-art machine learning with traditional jewelry craftsmanship to create 
                      unique, stunning designs that push the boundaries of creativity.
                    </p>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      Using our AI-powered design system, you can transform simple sketches into photorealistic 
                      jewelry renderings, explore countless design variations, and bring your vision to life with 
                      unprecedented speed and precision.
                    </p>
                  </motion.div>
                </div>
                <motion.div 
                  className="relative h-[500px] rounded-lg overflow-hidden group"
                  variants={imageHover}
                  initial="rest"
                  whileHover="hover"
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  <img
                    src="/images/innovation.jpg"
                    alt="AI Jewelry Design"
                    className="w-full h-full object-cover transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-2xl font-serif">AI Innovation</span>
                  </div>
                </motion.div>
              </motion.section>

              {/* The Power of AI Design */}
              <motion.section 
                className="mb-16"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, margin: "-100px" }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center mb-12"
                >
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "100px" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="h-1 bg-primary mb-6 mx-auto"
                  />
                  <h2 className="text-4xl font-serif mb-4 text-primary-dark">The Power of AI Design</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                    Experience the future of jewelry design with our cutting-edge AI technology
                  </p>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    {
                      title: "Instant Generation",
                      description: "Transform sketches into detailed designs in seconds using our advanced AI algorithms",
                      image: "/images/design-process.jpg"
                    },
                    {
                      title: "Endless Possibilities",
                      description: "Explore infinite design variations and customizations with AI-powered creativity",
                      image: "/images/creation.jpg"
                    },
                    {
                      title: "Precision Rendering",
                      description: "Get photorealistic 3D visualizations of your jewelry designs with exact specifications",
                      image: "/images/craftsmanship.jpg"
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      className="bg-white rounded-lg shadow-md overflow-hidden group"
                    >
                      <div className="relative h-64">
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className="p-8">
                        <h3 className="text-2xl font-serif mb-4 text-primary">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default About;
