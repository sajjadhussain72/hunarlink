import Hero from './components/Hero'
import dynamic from 'next/dynamic'

const Header = dynamic(() => import('./components/Header'), {
  loading: () => <header className="sticky top-0 z-40 h-[72px] border-b border-[#e7eeea]/80 bg-[#fbfcfa]/95 backdrop-blur" />,
  ssr: true,
})

const Services = dynamic(() => import('./components/Services'), {
  loading: () => <div className="h-96 animate-pulse bg-[#fbfcfa]" />,
})

const HowItWorks = dynamic(() => import('./components/HowItWorks'), {
  loading: () => <div className="h-96 animate-pulse bg-[#fbfcfa]" />,
})

const VerifiedProfessionals = dynamic(() => import('./components/VerifiedProfessionals'), {
  loading: () => <div className="h-96 animate-pulse bg-[#fbfcfa]" />,
})

const CompletedProjects = dynamic(() => import('./components/CompletedProjects'), {
  loading: () => <div className="h-96 animate-pulse bg-[#fbfcfa]" />,
})

const TrustSection = dynamic(() => import('./components/TrustSection'), {
  loading: () => <div className="h-64 animate-pulse bg-[#153443]" />,
})

const Locations = dynamic(() => import('./components/Locations'), {
  loading: () => <div className="h-64 animate-pulse bg-[#fbfcfa]" />,
})

const CTA = dynamic(() => import('./components/CTA'), {
  loading: () => <div className="h-64 animate-pulse bg-[#fbfcfa]" />,
})

const Footer = dynamic(() => import('./components/Footer'), {
  loading: () => <div className="h-32 animate-pulse bg-[#153443]" />,
})

export default function Page() {
  return (
    <div className="min-h-screen bg-[#fbfcfa] text-[#153443]" suppressHydrationWarning>
      <Header />
      <main>
        <Hero />
        <Services />
        <HowItWorks />
        <VerifiedProfessionals />
        <CompletedProjects />
        <TrustSection />
        <Locations />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

