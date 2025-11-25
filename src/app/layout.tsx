import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'ResumeForge AI | Tailor Your Resume to Land More Interviews',
  description: 'Use AI to instantly tailor your resume to any job description. Match keywords, optimize for ATS, and stand out to recruiters.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1a1a2e',
              color: '#e0e0e0',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#00d4aa',
                secondary: '#1a1a2e',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff6b6b',
                secondary: '#1a1a2e',
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  )
}

