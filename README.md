# ResumeForge AI

A beautiful, privacy-first AI resume tailor that uses your own Gemini API key. No monthly subscriptions—just pay-per-use with full control over your data.

## Features

- **AI-Powered Tailoring**: Uses Google's Gemini AI to intelligently rewrite your resume for specific job descriptions
- **Keyword Optimization**: Automatically identifies and integrates critical job keywords
- **Match Scoring**: Get instant feedback on how well your resume matches the job
- **Smart Suggestions**: Each edit includes explanations so you understand why changes help
- **Privacy First**: Your API key and resume data stay in your browser—nothing stored on servers
- **Full Control**: Accept, reject, or modify each suggestion individually
- **PDF Export**: Export your tailored resume as a professional PDF

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Google Gemini API key (free tier available)

### Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your key (starts with `AIza...`)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Usage

1. **Enter your Gemini API key** - Stored locally in your browser
2. **Paste the job description** - Include the full posting with requirements
3. **Paste your current resume** - Use plain text format
4. **Click "Tailor My Resume"** - AI analyzes and generates suggestions
5. **Review suggestions** - Accept, reject, or modify each one
6. **Export** - Download as PDF or copy to clipboard

## Cost

Using Gemini Pro API:
- ~$0.01-0.05 per resume tailored
- New Google accounts get free credits
- No monthly subscription required

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **AI**: Google Gemini Pro
- **Icons**: Lucide React
- **PDF Export**: html2canvas + jsPDF

## Privacy

Your data never leaves your browser:
- API key stored in browser only
- No server-side processing
- Direct API calls to Google from your browser
- No analytics or tracking

## Deploy to GitHub Pages

### Option 1: Automatic (GitHub Actions)

1. **Create a GitHub repository** and push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repo → Settings → Pages
   - Under "Build and deployment", select **GitHub Actions**

3. **Done!** The workflow will automatically build and deploy on every push to `main`.

Your site will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO/`

### Option 2: Manual Build

```bash
# Build the static site
npm run build

# The output is in the 'out' folder - deploy this anywhere!
```

### Custom Domain (Optional)

If using a custom domain instead of `github.io`:
1. Add a `CNAME` file in `public/` with your domain
2. Remove the `basePath` and `assetPrefix` in `next.config.js`

### Using a Repo Subdirectory

If deploying to `https://username.github.io/repo-name/` (not a custom domain):

Edit `next.config.js`:
```js
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: '/repo-name',
  assetPrefix: '/repo-name/',
}
```

## License

MIT

