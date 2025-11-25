import { NextResponse } from 'next/server'
import { load } from 'cheerio'

const SELECTORS = [
  '[data-job-description]',
  '[data-testid="jobDescriptionText"]',
  '[data-automation="jobDescriptionText"]',
  '[data-ui="job-description"]',
  '.jobsearch-JobComponent-description',
  '.job-description',
  '.description__text',
  'article',
  'main',
]

const cleanText = (text: string) =>
  text
    .replace(/\u00a0/g, ' ')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return NextResponse.json({ error: 'Only http/https URLs are allowed' }, { status: 400 })
    }

    const response = await fetch(parsed.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch page (${response.status})` },
        { status: response.status },
      )
    }

    const html = await response.text()
    const $ = load(html)

    $('script, style, noscript, iframe').remove()

    let description = ''

    for (const selector of SELECTORS) {
      const text = cleanText($(selector).text())
      if (text.length > description.length) {
        description = text
      }
    }

    if (!description) {
      const metaDescription =
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="description"]').attr('content')
      description = cleanText(metaDescription || $('body').text())
    }

    if (!description) {
      return NextResponse.json({ error: 'Could not extract job description' }, { status: 422 })
    }

    return NextResponse.json({ description })
  } catch (error) {
    console.error('Job scrape error', error)
    return NextResponse.json({ error: 'Failed to scrape job post' }, { status: 500 })
  }
}
