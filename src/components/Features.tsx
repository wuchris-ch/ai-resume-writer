'use client'

import { motion } from 'framer-motion'
import { 
  Wand2, Target, Clock, Repeat, Key, Brain, 
  FileCheck, Palette, Lock, Sparkles, BarChart3, Edit3
} from 'lucide-react'

const features = [
  {
    icon: Wand2,
    title: 'One-Click Tailoring',
    description: 'Click once and watch your resume transform. Work experiences, summaries, and skills rewrite themselves for the specific role.',
    color: 'from-accent to-accent/50'
  },
  {
    icon: Target,
    title: 'Keyword Optimization',
    description: 'AI identifies critical job description terms and naturally integrates them into your resume, boosting ATS scores.',
    color: 'from-lavender to-lavender/50'
  },
  {
    icon: Clock,
    title: 'Ready in Minutes',
    description: 'Get a professionally tailored resume in under 5 minutes. No more hours spent customizing for each application.',
    color: 'from-coral to-coral/50'
  },
  {
    icon: Brain,
    title: 'Smart Suggestions',
    description: 'Each AI suggestion includes explanations so you understand why edits improve your resume for that specific opportunity.',
    color: 'from-gold to-gold/50'
  },
  {
    icon: Key,
    title: 'Your API Key',
    description: 'Use your own Gemini API key. Pay only for what you use—no monthly subscriptions, no hidden fees.',
    color: 'from-accent to-lavender'
  },
  {
    icon: Lock,
    title: 'Full Privacy',
    description: 'Your resume data stays on your device. We never store your personal information or API keys on our servers.',
    color: 'from-lavender to-accent'
  },
  {
    icon: BarChart3,
    title: 'Match Scoring',
    description: 'Get instant feedback with a job match score. See exactly how well your resume aligns with the position.',
    color: 'from-coral to-gold'
  },
  {
    icon: Edit3,
    title: 'Full Control',
    description: 'Accept, tweak, or ignore each suggestion. You always have the final say over your resume content.',
    color: 'from-gold to-coral'
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light text-sm text-accent mb-4">
            <Sparkles className="w-4 h-4" />
            Powerful Features
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Everything You Need to
            <span className="gradient-text"> Stand Out</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Leverage the power of Google's Gemini AI to create perfectly tailored resumes 
            that get past ATS and impress recruiters.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-[1px] mb-4`}>
                <div className="w-full h-full rounded-xl bg-obsidian flex items-center justify-center group-hover:bg-transparent transition-colors">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-accent transition-colors">
                {feature.title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 p-8 rounded-2xl glass border border-accent/20 text-center"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-accent" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-white">2.21x</p>
                <p className="text-sm text-white/60">Higher interview rate</p>
              </div>
            </div>
            <div className="hidden md:block w-px h-12 bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-lavender/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-lavender" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-white">&lt;5 min</p>
                <p className="text-sm text-white/60">To tailor each resume</p>
              </div>
            </div>
            <div className="hidden md:block w-px h-12 bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                <Lock className="w-6 h-6 text-gold" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-sm text-white/60">Privacy guaranteed</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

