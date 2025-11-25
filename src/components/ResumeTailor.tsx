'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Sparkles, FileText, Target, Wand2, Download, 
  Copy, Check, RefreshCw, Key, ChevronRight, ChevronDown,
  Lightbulb, CheckCircle, XCircle, BarChart3, Eye, Edit3,
  AlertCircle, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ResumeTailorProps {
  apiKey: string
  onBack: () => void
  onApiKeyChange: () => void
}

interface Suggestion {
  id: string
  type: 'summary' | 'experience' | 'skills' | 'education'
  original: string
  suggested: string
  explanation: string
  accepted: boolean | null
  keywords: string[]
}

interface TailoringResult {
  matchScore: number
  matchLevel: 'poor' | 'fair' | 'good' | 'excellent'
  suggestions: Suggestion[]
  keywordsMatched: string[]
  keywordsMissing: string[]
  overallFeedback: string
}

export default function ResumeTailor({ apiKey, onBack, onApiKeyChange }: ResumeTailorProps) {
  const [step, setStep] = useState<'input' | 'processing' | 'results'>('input')
  const [jobDescription, setJobDescription] = useState('')
  const [resume, setResume] = useState('')
  const [result, setResult] = useState<TailoringResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const resumeRef = useRef<HTMLDivElement>(null)

  const handleTailor = async () => {
    if (!jobDescription.trim() || !resume.trim()) {
      toast.error('Please enter both job description and resume')
      return
    }

    setStep('processing')
    setIsProcessing(true)

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' })

      const prompt = `You are an expert resume tailor and career coach. Analyze the following job description and resume, then provide detailed suggestions to tailor the resume for this specific role.

JOB DESCRIPTION:
${jobDescription}

CURRENT RESUME:
${resume}

Please analyze and respond with a JSON object (no markdown, just pure JSON) containing:
{
  "matchScore": <number 0-100>,
  "matchLevel": "<poor|fair|good|excellent>",
  "overallFeedback": "<2-3 sentence summary of the match and key improvements needed>",
  "keywordsMatched": ["<keywords from job that are already in resume>"],
  "keywordsMissing": ["<important keywords from job missing from resume>"],
  "suggestions": [
    {
      "id": "<unique id>",
      "type": "<summary|experience|skills|education>",
      "original": "<exact text from resume to change>",
      "suggested": "<improved version tailored to job>",
      "explanation": "<why this change helps, 1-2 sentences>",
      "keywords": ["<keywords this change adds>"]
    }
  ]
}

Guidelines:
1. Focus on matching job keywords naturally, not stuffing them
2. Highlight relevant achievements and metrics
3. Mirror the job's tone (formal, startup-casual, etc.)
4. Ensure suggestions sound authentic, not AI-generated
5. Provide 4-8 specific, actionable suggestions
6. Include at least one suggestion for each section present in the resume`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Parse JSON from response
      let parsedResult: TailoringResult
      try {
        // Try to extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0])
          // Add accepted: null to all suggestions
          parsedResult.suggestions = parsedResult.suggestions.map(s => ({
            ...s,
            accepted: null
          }))
        } else {
          throw new Error('No JSON found in response')
        }
      } catch (parseError) {
        console.error('Parse error:', parseError)
        toast.error('Failed to parse AI response. Please try again.')
        setStep('input')
        setIsProcessing(false)
        return
      }

      setResult(parsedResult)
      setStep('results')
    } catch (error: any) {
      console.error('Tailoring error:', error)
      if (error.message?.includes('API_KEY')) {
        toast.error('Invalid API key. Please check your Gemini API key.')
        onApiKeyChange()
      } else {
        toast.error('Failed to tailor resume. Please try again.')
      }
      setStep('input')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAcceptSuggestion = (id: string, accept: boolean) => {
    if (!result) return
    setResult({
      ...result,
      suggestions: result.suggestions.map(s =>
        s.id === id ? { ...s, accepted: accept } : s
      )
    })
  }

  const handleAcceptAll = () => {
    if (!result) return
    setResult({
      ...result,
      suggestions: result.suggestions.map(s => ({ ...s, accepted: true }))
    })
    toast.success('All suggestions accepted!')
  }

  const generateTailoredResume = () => {
    if (!result) return resume
    
    let tailored = resume
    result.suggestions
      .filter(s => s.accepted)
      .forEach(s => {
        if (s.original && tailored.includes(s.original)) {
          tailored = tailored.replace(s.original, s.suggested)
        }
      })
    return tailored
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopiedField(null), 2000)
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const exportToPDF = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default
      
      // Create a temporary element with the tailored resume
      const element = document.createElement('div')
      element.innerHTML = `
        <div style="font-family: Georgia, serif; padding: 40px; max-width: 800px; font-size: 11pt; line-height: 1.6; color: #1a1a1a;">
          ${generateTailoredResume().split('\n').map(line => {
            if (line.startsWith('# ')) return `<h1 style="font-size: 18pt; margin-bottom: 4px;">${line.slice(2)}</h1>`
            if (line.startsWith('## ')) return `<h2 style="font-size: 12pt; text-transform: uppercase; border-bottom: 1px solid #333; padding-bottom: 2px; margin-top: 16px;">${line.slice(3)}</h2>`
            if (line.startsWith('### ')) return `<h3 style="font-size: 11pt; font-weight: 600;">${line.slice(4)}</h3>`
            if (line.startsWith('- ')) return `<p style="margin-left: 20px;">• ${line.slice(2)}</p>`
            return `<p>${line}</p>`
          }).join('')}
        </div>
      `
      element.style.position = 'absolute'
      element.style.left = '-9999px'
      element.style.background = 'white'
      document.body.appendChild(element)

      const canvas = await html2canvas(element, { scale: 2 })
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save('tailored-resume.pdf')
      
      document.body.removeChild(element)
      toast.success('Resume exported as PDF!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export PDF')
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-accent'
    if (score >= 60) return 'text-gold'
    if (score >= 40) return 'text-coral'
    return 'text-coral'
  }

  const getMatchLevelColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'bg-accent/20 text-accent border-accent/30'
      case 'good': return 'bg-lavender/20 text-lavender border-lavender/30'
      case 'fair': return 'bg-gold/20 text-gold border-gold/30'
      default: return 'bg-coral/20 text-coral border-coral/30'
    }
  }

  return (
    <div className="min-h-screen pt-4 pb-12 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <button
            onClick={onApiKeyChange}
            className="flex items-center gap-2 text-white/60 hover:text-accent transition-colors"
          >
            <Key className="w-4 h-4" />
            Change API Key
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {/* Step 1: Input */}
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
                  Tailor Your Resume with AI
                </h1>
                <p className="text-white/60">
                  Paste your job description and resume to get AI-powered suggestions
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Job Description */}
                <div className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-accent" />
                    <h2 className="font-semibold text-white">Job Description</h2>
                  </div>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here...

Include the full job posting with:
• Job title and company
• Required qualifications
• Responsibilities
• Preferred skills"
                    className="textarea-field h-96"
                  />
                  <p className="mt-2 text-xs text-white/40">
                    {jobDescription.length} characters
                  </p>
                </div>

                {/* Resume */}
                <div className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-lavender" />
                    <h2 className="font-semibold text-white">Your Resume</h2>
                  </div>
                  <textarea
                    value={resume}
                    onChange={(e) => setResume(e.target.value)}
                    placeholder="Paste your current resume here...

Format as plain text with:
# Your Name
Contact info

## Summary
Your professional summary

## Experience
### Job Title - Company
- Achievement 1
- Achievement 2

## Skills
List your skills"
                    className="textarea-field h-96"
                  />
                  <p className="mt-2 text-xs text-white/40">
                    {resume.length} characters
                  </p>
                </div>
              </div>

              {/* Tailor Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleTailor}
                  disabled={!jobDescription.trim() || !resume.trim()}
                  className="btn-primary text-lg px-8 py-4 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Wand2 className="w-5 h-5" />
                  Tailor My Resume
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Processing */}
          {step === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-accent/30 border-t-accent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-accent animate-pulse" />
                </div>
              </div>
              <h2 className="mt-8 text-2xl font-semibold text-white">Tailoring Your Resume</h2>
              <p className="mt-2 text-white/60">AI is analyzing the job and optimizing your resume...</p>
              <div className="mt-8 flex flex-col items-center gap-2 text-sm text-white/40">
                <p className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Extracting job keywords...
                </p>
                <p className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Matching your experience...
                </p>
                <p className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating suggestions...
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Results */}
          {step === 'results' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Score Card */}
              <div className="card">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Score Circle */}
                  <div className="relative">
                    <svg className="w-32 h-32 score-ring">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-slate"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={`${result.matchScore * 3.51} 351`}
                        strokeLinecap="round"
                        className={getScoreColor(result.matchScore)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-3xl font-bold ${getScoreColor(result.matchScore)}`}>
                        {result.matchScore}%
                      </span>
                      <span className="text-xs text-white/40">Match</span>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="flex-1 text-center md:text-left">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-2 border ${getMatchLevelColor(result.matchLevel)}`}>
                      <BarChart3 className="w-4 h-4" />
                      {result.matchLevel.charAt(0).toUpperCase() + result.matchLevel.slice(1)} Match
                    </div>
                    <p className="text-white/70 leading-relaxed">{result.overallFeedback}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleAcceptAll}
                      className="btn-primary flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept All
                    </button>
                    <button
                      onClick={() => setStep('input')}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Start Over
                    </button>
                  </div>
                </div>
              </div>

              {/* Keywords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold text-white">Keywords Matched</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.keywordsMatched.map((keyword, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm border border-accent/20">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-coral" />
                    <h3 className="font-semibold text-white">Keywords to Add</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.keywordsMissing.map((keyword, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-coral/10 text-coral text-sm border border-coral/20">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-gold" />
                    <h3 className="font-semibold text-white">AI Suggestions</h3>
                  </div>
                  <span className="text-sm text-white/40">
                    {result.suggestions.filter(s => s.accepted).length} / {result.suggestions.length} accepted
                  </span>
                </div>

                <div className="space-y-4">
                  {result.suggestions.map((suggestion) => (
                    <motion.div
                      key={suggestion.id}
                      layout
                      className={`p-4 rounded-xl border transition-colors ${
                        suggestion.accepted === true
                          ? 'bg-accent/5 border-accent/30'
                          : suggestion.accepted === false
                          ? 'bg-coral/5 border-coral/30 opacity-50'
                          : 'bg-slate/50 border-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-white/60 capitalize">
                              {suggestion.type}
                            </span>
                            {suggestion.keywords.map((kw, i) => (
                              <span key={i} className="px-2 py-0.5 rounded text-xs bg-accent/10 text-accent">
                                +{kw}
                              </span>
                            ))}
                          </div>
                          
                          <button
                            onClick={() => setExpandedSuggestion(
                              expandedSuggestion === suggestion.id ? null : suggestion.id
                            )}
                            className="text-left w-full"
                          >
                            <div className="flex items-center gap-2 text-white/60 text-sm">
                              {expandedSuggestion === suggestion.id ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                              <span className="line-clamp-1">{suggestion.original.slice(0, 100)}...</span>
                            </div>
                          </button>

                          <AnimatePresence>
                            {expandedSuggestion === suggestion.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-4 space-y-3">
                                  <div>
                                    <p className="text-xs text-white/40 mb-1">Original:</p>
                                    <p className="text-sm text-white/60 p-3 rounded-lg bg-slate/50">
                                      {suggestion.original}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-accent mb-1">Suggested:</p>
                                    <p className="text-sm text-white p-3 rounded-lg bg-accent/10 border border-accent/20">
                                      {suggestion.suggested}
                                    </p>
                                  </div>
                                  <div className="flex items-start gap-2 p-3 rounded-lg bg-gold/10 border border-gold/20">
                                    <Lightbulb className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-gold/80">{suggestion.explanation}</p>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Accept/Reject Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAcceptSuggestion(suggestion.id, true)}
                            className={`p-2 rounded-lg transition-colors ${
                              suggestion.accepted === true
                                ? 'bg-accent text-midnight'
                                : 'hover:bg-accent/20 text-accent'
                            }`}
                          >
                            <Check className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleAcceptSuggestion(suggestion.id, false)}
                            className={`p-2 rounded-lg transition-colors ${
                              suggestion.accepted === false
                                ? 'bg-coral text-midnight'
                                : 'hover:bg-coral/20 text-coral'
                            }`}
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Tailored Resume Preview */}
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-lavender" />
                    <h3 className="font-semibold text-white">Tailored Resume Preview</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(generateTailoredResume(), 'resume')}
                      className="btn-secondary text-sm flex items-center gap-2"
                    >
                      {copiedField === 'resume' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      Copy
                    </button>
                    <button
                      onClick={exportToPDF}
                      className="btn-primary text-sm flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export PDF
                    </button>
                  </div>
                </div>
                
                <div 
                  ref={resumeRef}
                  className="p-6 rounded-xl bg-white text-slate max-h-96 overflow-y-auto resume-preview"
                >
                  {generateTailoredResume().split('\n').map((line, i) => {
                    if (line.startsWith('# ')) {
                      return <h1 key={i} className="text-lg font-bold text-slate mb-1">{line.slice(2)}</h1>
                    }
                    if (line.startsWith('## ')) {
                      return <h2 key={i} className="text-sm font-semibold uppercase tracking-wide border-b border-slate/30 pb-1 mt-4 mb-2">{line.slice(3)}</h2>
                    }
                    if (line.startsWith('### ')) {
                      return <h3 key={i} className="font-semibold mt-2">{line.slice(4)}</h3>
                    }
                    if (line.startsWith('- ')) {
                      return <p key={i} className="ml-4">• {line.slice(2)}</p>
                    }
                    if (line.trim()) {
                      return <p key={i}>{line}</p>
                    }
                    return <br key={i} />
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

