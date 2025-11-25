'use client'

import { useEffect, useRef, useState, DragEvent, ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, Sparkles, FileText, Target, Wand2, Download, 
  Copy, Check, RefreshCw, Key, ChevronRight, ChevronDown,
  Lightbulb, CheckCircle, XCircle, BarChart3, Eye, Edit3,
  AlertCircle, Loader2, Link2, Save, History as HistoryIcon,
  RotateCcw, FileType, Mail, ClipboardCheck
} from 'lucide-react'
import toast from 'react-hot-toast'
import { diffLines, Change as DiffChange } from 'diff'

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

interface JobHistoryEntry {
  id: string
  snippet: string
  description: string
  url?: string
  savedAt: number
}

interface ProfilePreset {
  id: string
  name: string
  resume: string
  jobDescription: string
}

interface HistoryEntry {
  id: string
  label: string
  timestamp: number
  content: string
}

const STORAGE_KEYS = {
  resume: 'resumeTailor_resume',
  job: 'resumeTailor_job',
  recentJobs: 'resumeTailor_recent_jobs',
  presets: 'resumeTailor_presets',
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
  const jobFileInputRef = useRef<HTMLInputElement>(null)
  const resumeFileInputRef = useRef<HTMLInputElement>(null)
  const [jobDragActive, setJobDragActive] = useState(false)
  const [resumeDragActive, setResumeDragActive] = useState(false)
  const [jobUrl, setJobUrl] = useState('')
  const [scraping, setScraping] = useState(false)
  const [recentJobs, setRecentJobs] = useState<JobHistoryEntry[]>([])
  const [presets, setPresets] = useState<ProfilePreset[]>([])
  const [presetName, setPresetName] = useState('')
  const [customTailored, setCustomTailored] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [originalResume, setOriginalResume] = useState('')
  const [showDiff, setShowDiff] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [coverLetterStatus, setCoverLetterStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [previewEditing, setPreviewEditing] = useState(false)
  const [previewDraft, setPreviewDraft] = useState('')

  const createId = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const storedResume = localStorage.getItem(STORAGE_KEYS.resume)
    const storedJob = localStorage.getItem(STORAGE_KEYS.job)
    const storedRecentJobs = localStorage.getItem(STORAGE_KEYS.recentJobs)
    const storedPresets = localStorage.getItem(STORAGE_KEYS.presets)

    if (storedResume) setResume(storedResume)
    if (storedJob) setJobDescription(storedJob)
    if (storedRecentJobs) {
      try {
        setRecentJobs(JSON.parse(storedRecentJobs))
      } catch {
        /* noop */
      }
    }
    if (storedPresets) {
      try {
        setPresets(JSON.parse(storedPresets))
      } catch {
        /* noop */
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.resume, resume)
  }, [resume])

  useEffect(() => {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEYS.job, jobDescription)
  }, [jobDescription])

  const fileTooLarge = (file: File) => file.size > 8 * 1024 * 1024

  const extractTextFromPdf = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer()
    const pdfjs = await import('pdfjs-dist')
    const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs')

    ;(pdfjs as any).GlobalWorkerOptions.workerSrc = (worker as any).default
    const pdf = await (pdfjs as any).getDocument({ data: arrayBuffer }).promise

    let text = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const strings = (content.items as any[])
        .map((item) => ('str' in item ? (item as any).str : ''))
        .join(' ')
      text += strings + '\n'
    }
    return text.trim()
  }

  const extractTextFromDocx = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer()
    const mammoth = await import('mammoth/mammoth.browser')
    const { value } = await mammoth.extractRawText({ arrayBuffer })
    return value.trim()
  }

  const extractTextFromFile = async (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase()

    if (fileTooLarge(file)) {
      throw new Error('File is too large. Please use a file under 8MB.')
    }

    if (file.type === 'text/plain' || extension === 'txt' || extension === 'md') {
      return (await file.text()).trim()
    }

    if (extension === 'pdf') {
      return extractTextFromPdf(file)
    }

    if (extension === 'docx') {
      return extractTextFromDocx(file)
    }

    throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT.')
  }

  const handleFileUpload = async (file: File, target: 'job' | 'resume') => {
    const loadingId = toast.loading('Extracting text...')
    try {
      const text = await extractTextFromFile(file)
      if (!text) {
        throw new Error('No text found in file')
      }

      if (target === 'job') {
        setJobDescription(text)
      } else {
        setResume(text)
      }
      toast.success('Text imported successfully', { id: loadingId })
    } catch (error: any) {
      toast.error(error?.message || 'Failed to import file', { id: loadingId })
    }
  }

  const handleDrop = async (event: DragEvent<HTMLDivElement>, target: 'job' | 'resume') => {
    event.preventDefault()
    const file = event.dataTransfer.files?.[0]
    if (target === 'job') {
      setJobDragActive(false)
    } else {
      setResumeDragActive(false)
    }
    if (!file) return
    await handleFileUpload(file, target)
  }

  const handleFileInputChange = async (event: ChangeEvent<HTMLInputElement>, target: 'job' | 'resume') => {
    const file = event.target.files?.[0]
    if (file) {
      await handleFileUpload(file, target)
    }
    // allow re-uploading the same file
    event.target.value = ''
  }

  const handleScrapeJob = async () => {
    if (!jobUrl.trim()) {
      toast.error('Paste a job post URL to scrape')
      return
    }

    setScraping(true)
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jobUrl }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to fetch job posting')
      }

      setJobDescription(data.description)
      saveJobToHistory(data.description, jobUrl)
      toast.success('Job post imported')
    } catch (error: any) {
      console.error('Scrape error:', error)
      toast.error(error?.message || 'Failed to scrape job post')
    } finally {
      setScraping(false)
    }
  }

  const persistRecentJobs = (entries: JobHistoryEntry[]) => {
    setRecentJobs(entries)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.recentJobs, JSON.stringify(entries))
    }
  }

  const persistPresets = (entries: ProfilePreset[]) => {
    setPresets(entries)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.presets, JSON.stringify(entries))
    }
  }

  const saveJobToHistory = (description: string, url?: string) => {
    if (!description.trim()) return
    const snippet = description.replace(/\s+/g, ' ').slice(0, 160)
    const entry: JobHistoryEntry = {
      id: createId(),
      snippet,
      description,
      url,
      savedAt: Date.now(),
    }

    persistRecentJobs(
      [entry, ...recentJobs.filter((j) => j.description !== description)].slice(0, 8),
    )
  }

  const handleUseRecentJob = (id: string) => {
    const found = recentJobs.find((job) => job.id === id)
    if (!found) return
    setJobDescription(found.description)
    setJobUrl(found.url || '')
    toast.success('Loaded saved job description')
  }

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error('Name your preset (e.g., "PM roles")')
      return
    }
    if (!resume.trim()) {
      toast.error('Add your resume before saving a preset')
      return
    }
    const preset: ProfilePreset = {
      id: createId(),
      name: presetName.trim(),
      resume,
      jobDescription,
    }
    const nextPresets = [preset, ...presets.filter((p) => p.name !== preset.name)].slice(0, 8)
    persistPresets(nextPresets)
    toast.success('Preset saved')
  }

  const handleLoadPreset = (id: string) => {
    const found = presets.find((p) => p.id === id)
    if (!found) return
    setResume(found.resume)
    setJobDescription(found.jobDescription)
    toast.success(`Loaded preset "${found.name}"`)
  }

  const handleDeletePreset = (id: string) => {
    const next = presets.filter((p) => p.id !== id)
    persistPresets(next)
    toast.success('Preset removed')
  }

  const captureHistory = (label: string, content: string) => {
    if (!content) return
    const entry: HistoryEntry = {
      id: createId(),
      label,
      timestamp: Date.now(),
      content,
    }
    setHistory((prev) => [...prev.slice(-9), entry])
  }

  const undoLastChange = () => {
    if (history.length < 2) return
    const next = history.slice(0, -1)
    const latest = next[next.length - 1]
    setHistory(next)
    setCustomTailored(latest?.content ?? null)
    toast.success('Reverted to previous version')
  }

  const restoreHistory = (id: string) => {
    const found = history.find((entry) => entry.id === id)
    if (!found) return
    setCustomTailored(found.content)
    toast.success(`Restored: ${found.label}`)
  }

  const handleTailor = async () => {
    if (!jobDescription.trim() || !resume.trim()) {
      toast.error('Please enter both job description and resume')
      return
    }

    setOriginalResume(resume)
    setCustomTailored(null)
    setCoverLetter('')
    setCoverLetterStatus('idle')
    setHistory([
      {
        id: createId(),
        label: 'Original resume',
        timestamp: Date.now(),
        content: resume,
      },
    ])
    saveJobToHistory(jobDescription, jobUrl || undefined)

    setStep('processing')
    setIsProcessing(true)

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

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
      captureHistory('AI suggestions ready', resume)
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

  const applySuggestions = (baseText: string, currentResult: TailoringResult | null) => {
    if (!currentResult) return baseText

    let tailored = baseText
    currentResult.suggestions
      .filter((s) => s.accepted)
      .forEach((s) => {
        if (s.original && tailored.includes(s.original)) {
          tailored = tailored.replace(s.original, s.suggested)
        }
      })
    return tailored
  }

  const generateTailoredResume = (
    overrideResult?: TailoringResult | null,
    overrideResume?: string,
    includeCustom = true,
  ) => {
    const applied = applySuggestions(overrideResume ?? resume, overrideResult ?? result)
    if (includeCustom && customTailored !== null) return customTailored
    return applied
  }

  const handleAcceptSuggestion = (id: string, accept: boolean) => {
    if (!result) return
    let updatedCustom = customTailored
    const updated: TailoringResult = {
      ...result,
      suggestions: result.suggestions.map((s) =>
        s.id === id ? { ...s, accepted: accept } : s,
      ),
    }

    const target = updated.suggestions.find((s) => s.id === id)
    if (
      accept &&
      updatedCustom !== null &&
      target?.original &&
      updatedCustom.includes(target.original)
    ) {
      const withChange = updatedCustom.replace(target.original, target.suggested)
      updatedCustom = withChange
      setCustomTailored(withChange)
    }

    setResult(updated)
    captureHistory(
      accept ? 'Accepted suggestion' : 'Rejected suggestion',
      updatedCustom ?? generateTailoredResume(updated),
    )
  }

  const handleAcceptAll = () => {
    if (!result) return
    let updatedCustom = customTailored
    const updated: TailoringResult = {
      ...result,
      suggestions: result.suggestions.map((s) => ({ ...s, accepted: true })),
    }
    setResult(updated)
    if (updatedCustom !== null) {
      let customText = updatedCustom
      updated.suggestions.forEach((s) => {
        if (s.original && customText.includes(s.original)) {
          customText = customText.replace(s.original, s.suggested)
        }
      })
      updatedCustom = customText
      setCustomTailored(customText)
    }
    const tailored = updatedCustom ?? generateTailoredResume(updated)
    captureHistory('Accepted all suggestions', tailored)
    if (customTailored === null && tailored) {
      setCustomTailored(tailored)
    }
    toast.success('All suggestions accepted!')
  }

  const handleSuggestionEdit = (id: string, text: string) => {
    if (!result) return
    setResult({
      ...result,
      suggestions: result.suggestions.map((s) =>
        s.id === id ? { ...s, suggested: text } : s,
      ),
    })
  }

  useEffect(() => {
    if (previewEditing) {
      setPreviewDraft(generateTailoredResume())
    }
  }, [previewEditing, result, customTailored, resume])

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

  const exportToDocx = async () => {
    try {
      const { Document, Packer, Paragraph, TextRun } = await import('docx')
      const lines = generateTailoredResume().split('\n')
      const paragraphs = lines.map((line) => {
        if (line.startsWith('# ')) {
          return new Paragraph({ children: [new TextRun({ text: line.slice(2), bold: true, size: 32 })] })
        }
        if (line.startsWith('## ')) {
          return new Paragraph({ children: [new TextRun({ text: line.slice(3), bold: true, size: 28 })] })
        }
        if (line.startsWith('### ')) {
          return new Paragraph({ children: [new TextRun({ text: line.slice(4), bold: true })] })
        }
        if (line.startsWith('- ')) {
          return new Paragraph({ children: [new TextRun({ text: `• ${line.slice(2)}` })] })
        }
        return new Paragraph({ children: [new TextRun(line || ' ')] })
      })

      const doc = new Document({
        sections: [{ properties: {}, children: paragraphs }],
      })

      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'tailored-resume.docx'
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Exported DOCX')
    } catch (error) {
      console.error('DOCX export error:', error)
      toast.error('Failed to export DOCX')
    }
  }

  const downloadPlainText = (text?: string, filename = 'tailored-resume.txt') => {
    try {
      const blob = new Blob([text ?? generateTailoredResume()], {
        type: 'text/plain;charset=utf-8',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Downloaded plain text')
    } catch (error) {
      console.error('Plain text export error', error)
      toast.error('Could not download text file')
    }
  }

  const copyToGoogleDocs = async () => {
    await copyToClipboard(generateTailoredResume(), 'google-docs')
    window.open('https://docs.new', '_blank', 'noopener,noreferrer')
  }

  const handleGenerateCoverLetter = async () => {
    if (!jobDescription.trim() || !resume.trim()) {
      toast.error('Add both the job description and your resume first')
      return
    }
    if (!apiKey) {
      toast.error('Add your Gemini API key to generate a cover letter')
      onApiKeyChange()
      return
    }

    setCoverLetterStatus('loading')
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai')
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
      const tailoredResume = generateTailoredResume()

      const prompt = `You are writing a concise, authentic cover letter or application email.
Use the job description and the tailored resume to create a letter in 200-280 words.
Keep the tone professional but warm, and include 3-4 bullet highlights if relevant.

JOB DESCRIPTION:
${jobDescription}

TAILORED RESUME:
${tailoredResume}

Return the final cover letter text ready to copy-paste.`

      const result = await model.generateContent(prompt)
      const text = result.response.text().trim()
      setCoverLetter(text)
      setCoverLetterStatus('ready')
      toast.success('Cover letter drafted')
    } catch (error) {
      console.error('Cover letter error:', error)
      setCoverLetterStatus('error')
      toast.error('Could not generate cover letter')
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

  const renderDiff = () => {
    const parts: DiffChange[] = diffLines(originalResume || resume, generateTailoredResume())
    return parts.map((part, index) => (
      <span
        key={index}
        className={`block whitespace-pre-wrap ${
          part.added ? 'text-accent' : part.removed ? 'text-coral line-through' : 'text-white/70'
        }`}
      >
        {part.value}
      </span>
    ))
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
                <div
                  className={`card transition-colors ${
                    jobDragActive ? 'border-accent/60 bg-accent/5' : ''
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setJobDragActive(true)
                  }}
                  onDragLeave={() => setJobDragActive(false)}
                  onDrop={(e) => handleDrop(e, 'job')}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-5 h-5 text-accent" />
                    <h2 className="font-semibold text-white">Job Description</h2>
                  </div>
                  <div className="mb-4">
                    <label className="text-xs text-white/60">Job post URL</label>
                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                      <input
                        value={jobUrl}
                        onChange={(e) => setJobUrl(e.target.value)}
                        placeholder="https://jobs.lever.co/company/role"
                        className="input-field w-full"
                      />
                      <button
                        onClick={handleScrapeJob}
                        disabled={scraping}
                        className="btn-secondary text-xs px-3 py-2 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                        {scraping ? 'Scraping...' : 'Scrape URL'}
                      </button>
                    </div>
                    <p className="text-xs text-white/40 mt-1">
                      Pull the job description directly from the posting and clean the formatting.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button
                      onClick={() => jobFileInputRef.current?.click()}
                      className="btn-secondary text-xs px-3 py-2"
                    >
                      Upload PDF/DOCX/TXT
                    </button>
                    <button
                      onClick={() => saveJobToHistory(jobDescription, jobUrl || undefined)}
                      className="btn-secondary text-xs px-3 py-2"
                    >
                      <Save className="w-4 h-4" />
                      Save this job
                    </button>
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      or drag a file here
                    </span>
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
                  <input
                    ref={jobFileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.md,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(e) => handleFileInputChange(e, 'job')}
                  />
                  {recentJobs.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 text-xs text-white/50 mb-2">
                        <HistoryIcon className="w-3 h-3" />
                        Recent job descriptions
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentJobs.map((job) => (
                          <button
                            key={job.id}
                            onClick={() => handleUseRecentJob(job.id)}
                            className="px-3 py-2 rounded-lg border border-white/10 bg-slate/60 text-left text-xs text-white/70 hover:border-accent/40 hover:text-white transition-colors"
                          >
                            <span className="block">{job.snippet}</span>
                            {job.url && (
                              <span className="flex items-center gap-1 text-[10px] text-white/40 mt-1">
                                <Link2 className="w-3 h-3" />
                                From URL
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Resume */}
                <div
                  className={`card transition-colors ${
                    resumeDragActive ? 'border-accent/60 bg-accent/5' : ''
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setResumeDragActive(true)
                  }}
                  onDragLeave={() => setResumeDragActive(false)}
                  onDrop={(e) => handleDrop(e, 'resume')}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-lavender" />
                    <h2 className="font-semibold text-white">Your Resume</h2>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button
                      onClick={() => resumeFileInputRef.current?.click()}
                      className="btn-secondary text-xs px-3 py-2"
                    >
                      Upload PDF/DOCX/TXT
                    </button>
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      or drag a file here
                    </span>
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
                    {resume.length} characters • Auto-saved locally
                  </p>
                  <input
                    ref={resumeFileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.md,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(e) => handleFileInputChange(e, 'resume')}
                  />
                </div>
              </div>

              <div className="card">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-white">Profile presets</h3>
                    <p className="text-xs text-white/50">
                      Save different resume/job combos for roles you target often.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <input
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      placeholder="e.g., Product Manager, Data Analyst"
                      className="input-field w-full sm:w-64"
                    />
                    <button
                      onClick={handleSavePreset}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save preset
                    </button>
                  </div>
                </div>
                {presets.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {presets.map((preset) => (
                      <div
                        key={preset.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate/60 border border-white/10"
                      >
                        <button
                          onClick={() => handleLoadPreset(preset.id)}
                          className="text-sm text-white hover:text-accent transition-colors"
                        >
                          {preset.name}
                        </button>
                        <button
                          onClick={() => handleDeletePreset(preset.id)}
                          className="text-white/40 hover:text-coral"
                          aria-label={`Delete preset ${preset.name}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-white/40">
                    No presets yet—name one and save to recall it later.
                  </p>
                )}
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

              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <HistoryIcon className="w-5 h-5 text-lavender" />
                    <h3 className="font-semibold text-white">Versions & Diff</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setShowDiff(!showDiff)}
                      className="btn-secondary text-xs flex items-center gap-2"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      {showDiff ? 'Hide diff' : 'Show diff'}
                    </button>
                    <button
                      onClick={undoLastChange}
                      disabled={history.length < 2}
                      className="btn-secondary text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Undo last
                    </button>
                  </div>
                </div>
                {showDiff && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-slate/60 border border-white/5 max-h-64 overflow-y-auto">
                      <p className="text-xs text-white/50 mb-1">Original</p>
                      <div className="text-sm text-white/70 whitespace-pre-wrap">
                        {originalResume || resume}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate/60 border border-white/5 max-h-64 overflow-y-auto">
                      <p className="text-xs text-white/50 mb-1">Current</p>
                      <div className="text-sm">{renderDiff()}</div>
                    </div>
                  </div>
                )}
                <div className="mt-3">
                  <p className="text-xs text-white/50 mb-2">Version history</p>
                  {history.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {history.map((entry) => (
                        <button
                          key={entry.id}
                          onClick={() => restoreHistory(entry.id)}
                          className="px-3 py-2 rounded-lg bg-slate/60 border border-white/10 text-left"
                        >
                          <span className="block text-sm text-white">{entry.label}</span>
                          <span className="text-[10px] text-white/40">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-white/40">
                      Accept suggestions or edit the preview to start a version trail.
                    </p>
                  )}
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
                                  <div>
                                    <p className="text-xs text-white/50 mb-1">Inline edit</p>
                                    <textarea
                                      value={suggestion.suggested}
                                      onChange={(e) => handleSuggestionEdit(suggestion.id, e.target.value)}
                                      className="w-full bg-midnight/60 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-accent outline-none min-h-[120px]"
                                    />
                                    <p className="text-[11px] text-white/40 mt-1">
                                      Tweak the AI text—your edits apply when you accept.
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
                  <div className="flex flex-wrap items-center gap-2">
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
                      onClick={() => {
                        setPreviewEditing((prev) => !prev)
                        if (!previewEditing) {
                          setPreviewDraft(generateTailoredResume())
                        }
                      }}
                      className="btn-secondary text-sm flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      {previewEditing ? 'Cancel edit' : 'Inline edit'}
                    </button>
                    <button
                      onClick={() => {
                        setCustomTailored(null)
                        setPreviewEditing(false)
                        captureHistory('Reset to AI version', generateTailoredResume(result, resume, false))
                      }}
                      className="btn-secondary text-sm flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reset
                    </button>
                    <button
                      onClick={exportToPDF}
                      className="btn-primary text-sm flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export PDF
                    </button>
                    <button
                      onClick={exportToDocx}
                      className="btn-secondary text-sm flex items-center gap-2"
                    >
                      <FileType className="w-4 h-4" />
                      DOCX
                    </button>
                    <button
                      onClick={() => downloadPlainText()}
                      className="btn-secondary text-sm flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Plain text
                    </button>
                    <button
                      onClick={copyToGoogleDocs}
                      className="btn-secondary text-sm flex items-center gap-2"
                    >
                      <ClipboardCheck className="w-4 h-4" />
                      Copy to Docs
                    </button>
                  </div>
                </div>
                {previewEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={previewDraft}
                      onChange={(e) => setPreviewDraft(e.target.value)}
                      className="w-full min-h-[280px] bg-slate/60 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-accent outline-none"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setCustomTailored(previewDraft)
                          captureHistory('Manual edit', previewDraft)
                          setPreviewEditing(false)
                        }}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Save edits
                      </button>
                      <button
                        onClick={() => setPreviewEditing(false)}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
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
                )}
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold text-white">Cover letter / email</h3>
                  </div>
                  <button
                    onClick={handleGenerateCoverLetter}
                    disabled={coverLetterStatus === 'loading'}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {coverLetterStatus === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        Generate
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm text-white/60">
                  Draft a matching cover letter or application email using the same job + resume context.
                </p>
                {coverLetterStatus === 'ready' && coverLetter && (
                  <>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button
                        onClick={() => copyToClipboard(coverLetter, 'cover-letter')}
                        className="btn-secondary text-sm flex items-center gap-2"
                      >
                        {copiedField === 'cover-letter' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        Copy
                      </button>
                      <button
                        onClick={() => downloadPlainText(coverLetter, 'cover-letter.txt')}
                        className="btn-secondary text-sm flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Export TXT
                      </button>
                    </div>
                    <div className="mt-3 p-4 rounded-lg bg-slate/60 border border-white/10 text-white/80 whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {coverLetter}
                    </div>
                  </>
                )}
                {coverLetterStatus === 'loading' && (
                  <p className="text-sm text-white/50 mt-3">Personalizing your cover letter...</p>
                )}
                {coverLetterStatus === 'error' && (
                  <p className="text-sm text-coral mt-3">Something went wrong—try again after checking your API key.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
