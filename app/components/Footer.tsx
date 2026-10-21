import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#102934] px-5 py-10 text-white/60">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-bold text-white">
          Hunar<span className="text-[#f5b841]">Link</span>
        </p>
        <p className="text-xs">Professional Services, Managed by HunarLink · Gilgit-Baltistan</p>
        <Link href="/support" className="text-xs font-bold text-white">Contact HunarLink</Link>
      </div>
    </footer>
  )
}
