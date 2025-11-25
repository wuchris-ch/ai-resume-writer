'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, FileText, Target, Zap, Shield, CheckCircle, 
  ArrowRight, ChevronDown, Star, Users, Building2, 
  Wand2, Settings, Key, Eye, Download, RefreshCw,
  Lightbulb, MessageSquare, BarChart3, Briefcase
} from 'lucide-react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import HowItWorks from '@/components/HowItWorks'
import Testimonials from '@/components/Testimonials'
import FAQ from '@/components/FAQ'
import Footer from '@/components/Footer'
import ResumeTailor from '@/components/ResumeTailor'
import ApiKeyModal from '@/components/ApiKeyModal'

export default function Home() {
  const [showApp, setShowApp] = useState(false)
  const [showApiModal, setShowApiModal] = useState(false)
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    const storedKey = typeof window !== 'undefined' ? localStorage.getItem('resumeTailor_apiKey') : null
    if (storedKey) {
      setApiKey(storedKey)
    }
  }, [])

  const handleStartTailoring = () => {
    if (!apiKey) {
      setShowApiModal(true)
    } else {
      setShowApp(true)
    }
  }

  const handleApiKeySave = (key: string) => {
    setApiKey(key)
    localStorage.setItem('resumeTailor_apiKey', key)
    setShowApiModal(false)
    setShowApp(true)
  }

  return (
    <main className="min-h-screen bg-midnight relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-animated pointer-events-none" />
      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-50" />
      <div className="fixed inset-0 noise-overlay pointer-events-none" />
      
      <AnimatePresence mode="wait">
        {!showApp ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Header onStartClick={handleStartTailoring} />
            <Hero onStartClick={handleStartTailoring} />
            <Features />
            <HowItWorks />
            <Testimonials />
            <FAQ />
            <Footer />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <ResumeTailor 
              apiKey={apiKey} 
              onBack={() => setShowApp(false)}
              onApiKeyChange={() => setShowApiModal(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ApiKeyModal 
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        onSave={handleApiKeySave}
        currentKey={apiKey}
      />
    </main>
  )
}
