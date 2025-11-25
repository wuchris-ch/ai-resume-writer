'use client'

import { motion } from 'framer-motion'
import { Star, Quote, Sparkles } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer',
    company: 'Now at Google',
    avatar: 'SC',
    content: 'I was skeptical about AI resume tools, but this one is different. Using my own API key means I\'m not paying $40/month. Landed interviews at 3 FAANG companies!',
    rating: 5,
    color: 'accent'
  },
  {
    name: 'Marcus Johnson',
    role: 'Product Manager',
    company: 'Now at Stripe',
    avatar: 'MJ',
    content: 'The keyword matching is insanely good. It doesn\'t just stuff keywords—it actually rewrites my bullets to sound natural while hitting all the right notes.',
    rating: 5,
    color: 'lavender'
  },
  {
    name: 'Emily Rodriguez',
    role: 'Data Scientist',
    company: 'Now at Netflix',
    avatar: 'ER',
    content: 'Went from 5% response rate to 30% after using this tool. The explanations for each suggestion helped me understand what recruiters actually look for.',
    rating: 5,
    color: 'coral'
  },
  {
    name: 'David Park',
    role: 'UX Designer',
    company: 'Now at Apple',
    avatar: 'DP',
    content: 'Love that my data stays local. As a designer, I appreciate the clean interface too. Tailored 20+ resumes last month for about $2 in API costs.',
    rating: 5,
    color: 'gold'
  },
]

const companies = [
  'Google', 'Apple', 'Microsoft', 'Amazon', 'Meta', 
  'Netflix', 'Stripe', 'Airbnb', 'Uber', 'Salesforce'
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light text-sm text-gold mb-4">
            <Sparkles className="w-4 h-4" />
            Success Stories
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Job Seekers Love
            <span className="gradient-text"> ResumeForge</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Join thousands who've landed their dream jobs using AI-powered resume tailoring.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-white/10" />
              
              <div className="flex items-start gap-4 mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-midnight font-bold"
                  style={{ backgroundColor: `var(--${testimonial.color})` }}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-white">{testimonial.name}</h4>
                  <p className="text-sm text-white/60">{testimonial.role}</p>
                  <p className="text-sm text-accent">{testimonial.company}</p>
                </div>
              </div>
              
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>
              
              <p className="text-white/70 leading-relaxed">"{testimonial.content}"</p>
            </motion.div>
          ))}
        </div>

        {/* Company Logos */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center"
        >
          <p className="text-sm text-white/40 mb-6">Our users have landed jobs at top companies</p>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {companies.map((company, index) => (
              <div
                key={index}
                className="text-white/30 font-display font-bold text-lg hover:text-white/50 transition-colors"
              >
                {company}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

