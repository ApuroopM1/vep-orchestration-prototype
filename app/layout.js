import './globals.css'

export const metadata = {
  title: 'VEP AI+HI Orchestration Simulator | Intuit GPM Prototype',
  description: 'A working prototype demonstrating how Intuit\'s Virtual Expert Platform should orchestrate AI agents and human experts for marketing advisory — built by Appu for the GPM VEP role (Job ID: 19602)',
  openGraph: {
    title: 'VEP AI+HI Orchestration Simulator',
    description: 'How should Intuit\'s Virtual Expert Platform decide when AI should hand off to a human expert? This prototype demonstrates the orchestration layer.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VEP AI+HI Orchestration Simulator',
    description: 'A prototype for Intuit\'s Virtual Expert Platform — AI+HI routing decision engine',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
