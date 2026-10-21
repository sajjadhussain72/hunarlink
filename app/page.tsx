import Header from './components/Header'
import Hero from './components/Hero'
import Services from './components/Services'
import HowItWorks from './components/HowItWorks'
import CTA from './components/CTA'
import Footer from './components/Footer'

export default function Page() {
  return (
    <div className="min-h-screen bg-[#fbfcfa] text-[#153443]" suppressHydrationWarning>
      <Header />
      <main>
        <Hero />
        <Services />
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

