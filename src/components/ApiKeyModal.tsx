'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Key, ExternalLink, Shield, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

interface ApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (key: string) => void
  currentKey: string
}

export default function ApiKeyModal({ isOpen, onClose, onSave, currentKey }: ApiKeyModalProps) {
  const [key, setKey] = useState(currentKey)
  const [showKey, setShowKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  const testApiKey = async () => {
    if (!key.trim()) return
    
    setTesting(true)
    setTestResult(null)
    
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(key)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
      await model.generateContent('Say "API key valid" in 3 words or less.')
      setTestResult('success')
    } catch (error) {
      setTestResult('error')
    } finally {
      setTesting(false)
    }
  }

  const handleSave = () => {
    if (key.trim()) {
      onSave(key.trim())
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg glass rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Key className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Enter Gemini API Key</h2>
                    <p className="text-sm text-white/60">Your key stays in your browser</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Info Box */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20">
                <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-white font-medium mb-1">Privacy First</p>
                  <p className="text-white/60">
                    Your API key is stored only in your browser's local storage. 
                    We never send it to our servers.
                  </p>
                </div>
              </div>

              {/* API Key Input */}
              <div>
                <label className="block text-sm text-white/80 mb-2">Gemini API Key</label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={key}
                    onChange={(e) => {
                      setKey(e.target.value)
                      setTestResult(null)
                    }}
                    placeholder="AIza..."
                    className="input-field pr-20"
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Test Result */}
              {testResult && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-2 p-3 rounded-lg ${
                    testResult === 'success' 
                      ? 'bg-accent/10 border border-accent/20' 
                      : 'bg-coral/10 border border-coral/20'
                  }`}
                >
                  {testResult === 'success' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span className="text-sm text-accent">API key is valid!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-coral" />
                      <span className="text-sm text-coral">Invalid API key. Please check and try again.</span>
                    </>
                  )}
                </motion.div>
              )}

              {/* Get API Key Link */}
              <a
                href="https://aistudio.google.com/app/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-accent hover:text-accent-hover transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Get your free Gemini API key from Google AI Studio
              </a>

              {/* How to Get API Key Instructions */}
              <div className="p-4 rounded-xl bg-slate/50 border border-white/5">
                <p className="text-sm text-white font-medium mb-3">How to get your API key:</p>
                <ol className="text-sm text-white/60 space-y-2 list-decimal list-inside">
                  <li>Go to <a href="https://aistudio.google.com/app/api-keys" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">aistudio.google.com/app/api-keys</a> <span className="text-white/40">(or search "google ai studio api key")</span></li>
                  <li>Click <span className="text-white/80">"Create API Key"</span> in the top right</li>
                  <li>Click the dropdown and select <span className="text-white/80">"Create project"</span></li>
                  <li>Name your project anything you want</li>
                  <li>Name your key anything you want</li>
                  <li>Click <span className="text-white/80">"Create API Key"</span> and copy it here!</li>
                </ol>
              </div>

              {/* Pricing Info */}
              <div className="p-4 rounded-xl bg-slate/50 border border-white/5">
                <p className="text-sm text-white/60">
                  <span className="text-white font-medium">Cost:</span> Gemini API typically costs 
                  ~$0.01-0.05 per resume tailored. New accounts get free credits!
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={testApiKey}
                disabled={!key.trim() || testing}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testing ? 'Testing...' : 'Test Key'}
              </button>
              <button
                onClick={handleSave}
                disabled={!key.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save & Continue
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

