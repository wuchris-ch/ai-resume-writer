'use client'

import { motion } from 'framer-motion'
import { Sparkles, Target, Zap, Shield, CheckCircle, ArrowRight, Play } from 'lucide-react'

interface HeroProps {
  onStartClick: () => void
}

export default function Hero({ onStartClick }: HeroProps) {
  const features = [
    { icon: Target, text: 'Job Precision' },
    { icon: Zap, text: 'Auto Tailoring' },
    { icon: Shield, text: 'ATS-Optimized' },
    { icon: CheckCircle, text: 'Full Control' },
  ]

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute top-40 left-10 w-72 h-72 bg-accent/10 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-lavender/10 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-sm text-white/80">Powered by Google Gemini AI</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6"
          >
            <span className="text-white">Tailor Your Resume</span>
            <br />
            <span className="gradient-text">in Seconds with AI</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-white/60 mb-8 max-w-2xl mx-auto"
          >
            Use your own Gemini API key to instantly tailor your resume for any job description. 
            Match keywords, bypass ATS, and land more interviews—all without monthly fees.
          </motion.p>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass-light"
              >
                <feature.icon className="w-4 h-4 text-accent" />
                <span className="text-sm text-white/80">{feature.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={onStartClick}
              className="btn-primary text-lg px-8 py-4 flex items-center gap-3 group"
            >
              <Sparkles className="w-5 h-5" />
              Start Tailoring Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#how-it-works"
              className="btn-secondary text-lg px-8 py-4 flex items-center gap-3"
            >
              <Play className="w-5 h-5" />
              See How It Works
            </a>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 flex flex-col items-center gap-4"
          >
            <p className="text-sm text-white/40">Bring your own API key • No monthly subscription • Full privacy</p>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-2 text-sm text-white/60">Loved by job seekers</span>
            </div>
          </motion.div>
        </div>

        {/* Hero Visual */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 relative max-w-5xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-transparent z-10 pointer-events-none" />
          <div className="relative rounded-2xl overflow-hidden border border-white/10 glass">
            {/* Mock App Preview */}
            <div className="bg-obsidian p-1">
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="w-3 h-3 rounded-full bg-coral/80" />
                <div className="w-3 h-3 rounded-full bg-gold/80" />
                <div className="w-3 h-3 rounded-full bg-accent/80" />
                <div className="ml-4 flex-1 h-6 bg-slate/50 rounded-md" />
              </div>
            </div>
            <div className="p-6 bg-slate/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Side - Job Description */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-accent">
                    <Target className="w-4 h-4" />
                    <span className="text-sm font-semibold">Job Description</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-white/10 rounded w-full" />
                    <div className="h-3 bg-white/10 rounded w-5/6" />
                    <div className="h-3 bg-white/10 rounded w-4/5" />
                    <div className="h-3 bg-accent/30 rounded w-2/3" />
                    <div className="h-3 bg-white/10 rounded w-full" />
                    <div className="h-3 bg-accent/30 rounded w-3/4" />
                  </div>
                </div>
                {/* Right Side - Resume Preview */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-lavender">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-semibold">Tailored Resume</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-white/20 rounded w-1/2" />
                    <div className="h-2 bg-white/5 rounded w-full" />
                    <div className="h-3 bg-white/10 rounded w-full" />
                    <div className="h-3 bg-accent/40 rounded w-5/6" />
                    <div className="h-3 bg-white/10 rounded w-4/5" />
                    <div className="h-3 bg-accent/40 rounded w-full" />
                  </div>
                </div>
              </div>
              {/* Match Score */}
              <div className="mt-6 flex items-center justify-center gap-4 p-4 rounded-xl bg-accent/10 border border-accent/20">
                <div className="w-16 h-16 rounded-full border-4 border-accent flex items-center justify-center">
                  <span className="text-xl font-bold text-accent">94%</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Excellent Match</p>
                  <p className="text-white/60 text-sm">Your resume is optimized for this role</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

