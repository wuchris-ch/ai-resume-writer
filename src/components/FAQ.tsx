'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Sparkles, HelpCircle } from 'lucide-react'

const faqs = [
  {
    question: 'How do I get a Gemini API key?',
    answer: 'Visit Google AI Studio (aistudio.google.com), sign in with your Google account, and click "Get API Key". You\'ll get free credits to start, and costs are typically pennies per resume tailored.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. Your API key and resume data never leave your browser. We don\'t store anything on our servers. All processing happens client-side, and API calls go directly from your browser to Google.'
  },
  {
    question: 'How much does it cost to tailor a resume?',
    answer: 'Using Gemini Pro, each resume typically costs $0.01-0.05 depending on length. That\'s 100+ resumes for the price of one month of other services. Plus, Google gives new accounts free credits!'
  },
  {
    question: 'Will my resume pass ATS systems?',
    answer: 'Yes! Our AI specifically optimizes for ATS by matching keywords, using standard formatting, and ensuring your achievements align with job requirements. We focus on semantic matching, not just keyword stuffing.'
  },
  {
    question: 'Can I edit the AI suggestions?',
    answer: 'Absolutely. You have full control. Accept, reject, or modify any suggestion. The AI gives recommendations, but you always have the final say on your resume content.'
  },
  {
    question: 'What makes this different from other resume tools?',
    answer: 'Three things: 1) You use your own API key, so no monthly subscriptions. 2) Your data stays private—we never see or store it. 3) We use semantic matching, not just keyword stuffing, for better human reviewer response.'
  },
  {
    question: 'Can I export my tailored resume?',
    answer: 'Yes! Export as a clean PDF ready for submission. The format is ATS-friendly and professionally styled. You can also copy the text if you need to paste it elsewhere.'
  },
  {
    question: 'How long does tailoring take?',
    answer: 'Typically under 2 minutes for the AI to analyze and generate suggestions. Review and final tweaks usually take another 2-3 minutes. Most users complete a fully tailored resume in under 5 minutes.'
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-3xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light text-sm text-coral mb-4">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Frequently Asked
            <span className="gradient-text"> Questions</span>
          </h2>
          <p className="text-lg text-white/60">
            Everything you need to know about ResumeForge AI
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full card text-left hover:border-accent/30"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-white pr-4">{faq.question}</h3>
                  <ChevronDown 
                    className={`w-5 h-5 text-accent flex-shrink-0 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`} 
                  />
                </div>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-white/60 leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-white/60 mb-4">Still have questions?</p>
          <a href="mailto:support@resumeforge.ai" className="text-accent hover:text-accent-hover transition-colors">
            Contact us →
          </a>
        </motion.div>
      </div>
    </section>
  )
}

