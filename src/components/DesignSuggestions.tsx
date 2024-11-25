import React from 'react';
import { motion } from 'framer-motion';
import { FiCopy } from 'react-icons/fi';

interface Suggestion {
  title: string;
  prompt: string;
  image: string;
}

const suggestions: Suggestion[] = [
  {
    title: 'Elegant Ring',
    prompt: 'A delicate white gold ring with a central oval diamond surrounded by small sapphires in a floral pattern',
    image: '/images/suggestions/ring.jpg'
  },
  {
    title: 'Nature-Inspired Necklace',
    prompt: 'An intricate rose gold necklace with leaf motifs and small emeralds scattered like morning dew',
    image: '/images/suggestions/necklace.jpg'
  },
  {
    title: 'Modern Bracelet',
    prompt: 'A contemporary platinum bracelet with geometric patterns and channel-set diamonds',
    image: '/images/suggestions/bracelet.jpg'
  },
  {
    title: 'Vintage Earrings',
    prompt: 'Art deco style drop earrings in yellow gold with pearls and diamond accents',
    image: '/images/suggestions/earrings.jpg'
  }
];

interface Props {
  onSelectPrompt: (prompt: string) => void;
}

const DesignSuggestions: React.FC<Props> = ({ onSelectPrompt }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="heading-md mb-4">Design Suggestions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={suggestion.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative rounded-lg overflow-hidden cursor-pointer"
            onClick={() => onSelectPrompt(suggestion.prompt)}
          >
            <img
              src={suggestion.image}
              alt={suggestion.title}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end transform translate-y-2 group-hover:translate-y-0 transition-transform">
              <h3 className="text-white font-medium mb-1">{suggestion.title}</h3>
              <p className="text-white/80 text-sm line-clamp-2">{suggestion.prompt}</p>
              <button 
                className="mt-2 inline-flex items-center text-sm text-primary-light hover:text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPrompt(suggestion.prompt);
                }}
              >
                <FiCopy className="w-4 h-4 mr-1" />
                Use this prompt
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DesignSuggestions;
