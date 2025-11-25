'use client'

import { motion } from 'framer-motion'
import { Sparkles, Menu, X } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  onStartClick: () => void
}

export default function Header({ onStartClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-lavender flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-midnight" />
            </div>
            <span className="font-display font-bold text-xl text-white">
              Resume<span className="text-accent">Forge</span>
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <motion.a 
              href="#features" 
              className="text-white/70 hover:text-accent transition-colors"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Features
            </motion.a>
            <motion.a 
              href="#how-it-works" 
              className="text-white/70 hover:text-accent transition-colors"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              How it Works
            </motion.a>
            <motion.a 
              href="#testimonials" 
              className="text-white/70 hover:text-accent transition-colors"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Reviews
            </motion.a>
            <motion.a 
              href="#faq" 
              className="text-white/70 hover:text-accent transition-colors"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              FAQ
            </motion.a>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <motion.button
              onClick={onStartClick}
              className="btn-primary flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Sparkles className="w-4 h-4" />
              Start Tailoring
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          className="md:hidden glass border-t border-white/10"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="px-4 py-6 space-y-4">
            <a href="#features" className="block text-white/70 hover:text-accent transition-colors">Features</a>
            <a href="#how-it-works" className="block text-white/70 hover:text-accent transition-colors">How it Works</a>
            <a href="#testimonials" className="block text-white/70 hover:text-accent transition-colors">Reviews</a>
            <a href="#faq" className="block text-white/70 hover:text-accent transition-colors">FAQ</a>
            <button onClick={onStartClick} className="btn-primary w-full flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Start Tailoring
            </button>
          </div>
        </motion.div>
      )}
    </header>
  )
}

