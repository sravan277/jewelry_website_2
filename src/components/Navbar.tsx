import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const accountDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setIsAccountOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const navbarClass = `fixed w-full z-50 transition-all duration-300 ${
    scrolled ? 'bg-white shadow-md' : 'bg-transparent'
  }`;

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
    ...(user ? [
      { label: 'Generate', path: '/generate' },
      { label: 'Dashboard', path: '/dashboard' }
    ] : []),
  ];

  return (
    <nav className={navbarClass}>
      <div className="container-custom">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="font-serif text-2xl text-primary-dark hover:text-primary transition-colors"
          >
            Jewelry Designs
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-gray-600 hover:text-primary transition-colors ${
                  location.pathname === item.path ? 'text-primary font-medium' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
            {user ? (
              <div className="relative" ref={accountDropdownRef}>
                <button
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
                >
                  <span className="text-xl">
                    <i className="fas fa-user-circle"></i>
                  </span>
                  <span>{user.email?.split('@')[0]}</span>
                  <span className={`transform transition-transform duration-200 ${isAccountOpen ? 'rotate-180' : ''}`}>
                    <i className="fas fa-chevron-down"></i>
                  </span>
                </button>

                <AnimatePresence>
                  {isAccountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                    >
                      <Link
                        to="/account"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <i className="fas fa-user mr-2"></i>
                        Account
                      </Link>
                      <Link
                        to="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <i className="fas fa-cog mr-2"></i>
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <i className="fas fa-sign-out-alt mr-2"></i>
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/auth" className="btn-primary">
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <div className="w-6 h-6 relative">
              <span
                className={`absolute h-0.5 w-full bg-gray-600 transform transition-all duration-300 ${
                  isOpen ? 'rotate-45 top-3' : 'rotate-0 top-1'
                }`}
              />
              <span
                className={`absolute h-0.5 w-full bg-gray-600 top-3 transition-all duration-300 ${
                  isOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`absolute h-0.5 w-full bg-gray-600 transform transition-all duration-300 ${
                  isOpen ? '-rotate-45 top-3' : 'rotate-0 top-5'
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden bg-white"
            >
              <div className="py-4 space-y-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors ${
                      location.pathname === item.path ? 'text-primary font-medium' : ''
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                {user ? (
                  <Link
                    to="/account"
                    className="block w-full text-left px-4 py-2 text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
                  >
                    Account
                  </Link>
                ) : (
                  <Link
                    to="/auth"
                    className="block px-4 py-2 text-primary hover:bg-primary hover:text-white transition-colors"
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
