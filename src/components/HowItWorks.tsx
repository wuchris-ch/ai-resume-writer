'use client'

import { motion } from 'framer-motion'
import { Key, FileText, Wand2, Download, Sparkles, ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Key,
    title: 'Add Your API Key',
    description: 'Enter your Google Gemini API key. It stays in your browser—we never store it on our servers.',
    color: 'accent'
  },
  {
    number: '02',
    icon: FileText,
    title: 'Paste Job & Resume',
    description: 'Add the job description you\'re targeting and paste your current resume. The AI analyzes both instantly.',
    color: 'lavender'
  },
  {
    number: '03',
    icon: Wand2,
    title: 'Generate Tailored Resume',
    description: 'Click once and watch the AI rewrite your resume to match the job\'s keywords, responsibilities, and culture.',
    color: 'coral'
  },
  {
    number: '04',
    icon: Download,
    title: 'Review & Export',
    description: 'Review suggestions, accept what you love, make tweaks, and export your ATS-optimized PDF.',
    color: 'gold'
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light text-sm text-lavender mb-4">
            <Sparkles className="w-4 h-4" />
            Simple Process
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Tailor Your Resume in
            <span className="gradient-text"> 4 Easy Steps</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            From job posting to interview-ready resume in under 5 minutes. 
            No learning curve, no complexity—just results.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-accent via-lavender via-coral to-gold opacity-30" />
          
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              <div className="card text-center h-full">
                {/* Step Number */}
                <div className="relative inline-block mb-4">
                  <div className={`w-20 h-20 rounded-2xl bg-${step.color}/10 border border-${step.color}/30 flex items-center justify-center mx-auto`}
                    style={{ 
                      backgroundColor: `var(--${step.color === 'accent' ? 'accent' : step.color === 'lavender' ? 'lavender' : step.color === 'coral' ? 'coral' : 'gold'})10`,
                      borderColor: `var(--${step.color})30`
                    }}
                  >
                    <step.icon className="w-10 h-10" style={{ color: `var(--${step.color})` }} />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate flex items-center justify-center text-sm font-mono font-bold text-white/60 border border-white/10">
                    {step.number}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {/* Arrow Between Steps */}
              {index < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-24 -right-3 z-10">
                  <ArrowRight className="w-6 h-6 text-white/20" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Demo Video Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 relative rounded-2xl overflow-hidden glass border border-white/10"
        >
          <div className="aspect-video bg-slate/50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-accent/30 transition-colors group">
                <svg className="w-10 h-10 text-accent group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-white/60">See ResumeForge in action</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

