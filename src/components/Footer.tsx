'use client'

import { Sparkles, Github, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-lavender flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-midnight" />
            </div>
            <span className="font-display font-bold text-xl text-white">
              Resume<span className="text-accent">Forge</span>
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <a href="#features" className="text-white/60 hover:text-accent transition-colors text-sm">Features</a>
            <a href="#how-it-works" className="text-white/60 hover:text-accent transition-colors text-sm">How it Works</a>
            <a href="#faq" className="text-white/60 hover:text-accent transition-colors text-sm">FAQ</a>
            <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-accent transition-colors text-sm">
              Get API Key
            </a>
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a href="https://github.com/wuchris-ch/ai-resume-writer" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-accent transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-white/40 hover:text-accent transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-white/40 hover:text-accent transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()} ResumeForge AI. Built with Gemini.
          </p>
          <p className="text-white/40 text-sm">
            Your data stays on your device. We never store your information.
          </p>
        </div>
      </div>
    </footer>
  )
}

