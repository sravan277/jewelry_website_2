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

const LoadingScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center"
    >
      <motion.div
        className="w-32 h-32 relative"
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <motion.div
          className="absolute inset-0 border-4 border-t-primary border-r-primary border-b-transparent border-l-transparent rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute inset-2 border-4 border-t-transparent border-r-transparent border-b-primary border-l-primary rounded-full"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
      <motion.h2
        className="mt-8 text-2xl font-serif text-primary"
        animate={{
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        Loading Artistry...
      </motion.h2>
    </motion.div>
  );
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
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 2000); // 2 seconds loading time

    return () => clearTimeout(timer);
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
    <AnimatePresence mode="wait">
      {!isLoaded ? (
        <LoadingScreen />
      ) : (
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
                      Crafting Dreams
                      <br />
                      Into Reality
                    </motion.h1>
                    <motion.p 
                      className="text-2xl max-w-xl leading-relaxed"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7, duration: 0.8 }}
                    >
                      Where tradition meets innovation in creating timeless pieces of jewelry art
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

              {/* Our Story Section */}
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
                    Our Story
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                      Founded with a passion for exquisite craftsmanship and innovative design, our jewelry 
                      design platform brings together talented artisans and discerning clients. We believe 
                      that every piece of jewelry tells a unique story, and we're here to help you create 
                      yours.
                    </p>
                    <p className="text-gray-600 leading-relaxed text-lg">
                      Our mission is to revolutionize the custom jewelry design process by making it more 
                      accessible, collaborative, and enjoyable. Through our platform, we connect visionary 
                      designers with clients who appreciate the art of bespoke jewelry.
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
                    src="/images/jewelry-crafting.jpg"
                    alt="Jewelry Crafting"
                    className="w-full h-full object-cover transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-2xl font-serif">Our Craft</span>
                  </div>
                </motion.div>
              </motion.section>

              {/* What Sets Us Apart */}
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
                  <h2 className="text-4xl font-serif mb-4 text-primary-dark">What Sets Us Apart</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                    Our commitment to excellence and innovation defines every piece we create
                  </p>
                </motion.div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    {
                      title: "Expert Craftsmanship",
                      description: "Our network of skilled artisans brings decades of experience in creating stunning, high-quality jewelry pieces that stand the test of time.",
                      image: "/images/craftsmanship.jpg"
                    },
                    {
                      title: "Custom Design Process",
                      description: "We offer a unique collaborative design experience where your vision comes to life through direct interaction with talented designers.",
                      image: "/images/design-process.jpg"
                    },
                    {
                      title: "Quality Materials",
                      description: "We source only the finest materials, ensuring that each piece meets our rigorous standards for quality and sustainability.",
                      image: "/images/materials.jpg"
                    },
                    {
                      title: "Innovation",
                      description: "Our platform combines traditional craftsmanship with modern technology to create a seamless design and ordering experience.",
                      image: "/images/innovation.jpg"
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      className="bg-white rounded-lg shadow-md overflow-hidden group cursor-pointer"
                      whileHover={{ y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div 
                        className="relative h-48 overflow-hidden"
                        variants={imageHover}
                        initial="rest"
                        whileHover="hover"
                      >
                        <img
                          src={feature.image}
                          alt={feature.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-serif text-2xl border-2 border-white">
                            {feature.title}
                          </span>
                        </div>
                      </motion.div>
                      <div className="p-6">
                        <h3 className="text-xl font-serif mb-3 text-primary">{feature.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Our Process */}
              <motion.section 
                className="bg-white rounded-lg shadow-md p-12"
                variants={fadeInUp}
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
                  <h2 className="text-4xl font-serif mb-4 text-primary-dark">Our Process</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                    From concept to creation, we ensure every step is handled with precision and care
                  </p>
                </motion.div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    {
                      step: 1,
                      title: "Design Submission",
                      description: "Share your vision by uploading your design concept and specifications through our user-friendly platform.",
                      image: "/images/design-submission.jpg"
                    },
                    {
                      step: 2,
                      title: "Designer Matching",
                      description: "We connect you with skilled designers who specialize in your desired style and type of jewelry.",
                      image: "/images/designer-matching.jpg"
                    },
                    {
                      step: 3,
                      title: "Collaboration",
                      description: "Work directly with your chosen designer to refine and perfect your design through our interactive platform.",
                      image: "/images/collaboration.jpg"
                    },
                    {
                      step: 4,
                      title: "Creation",
                      description: "Once the design is finalized, our skilled artisans bring your vision to life using the finest materials and craftsmanship.",
                      image: "/images/creation.jpg"
                    }
                  ].map((process, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      className="relative group"
                      whileHover={{ y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <motion.div 
                        className="relative h-64 rounded-lg overflow-hidden mb-6"
                        variants={imageHover}
                        initial="rest"
                        whileHover="hover"
                      >
                        <img
                          src={process.image}
                          alt={process.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-serif text-2xl border-2 border-white">
                            {process.step}
                          </span>
                        </div>
                      </motion.div>
                      <h3 className="text-xl font-serif mb-3 text-primary">{process.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{process.description}</p>
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
