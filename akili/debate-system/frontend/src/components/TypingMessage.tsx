import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TypingMessageProps {
  content: string;
  speed?: number;
  onComplete?: () => void;
}

export const TypingMessage: React.FC<TypingMessageProps> = ({
  content,
  speed = 30,
  onComplete
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, content, speed, onComplete]);

  return (
    <div className="relative">
      <span>{displayedText}</span>
      {currentIndex < content.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-0.5 h-4 bg-white ml-0.5"
        />
      )}
    </div>
  );
};