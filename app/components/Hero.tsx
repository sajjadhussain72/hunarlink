"use client";

import Image from 'next/image'
import { ArrowRight, Search, MapPin, Sparkles } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'

export default function Hero() {
  const backgroundImages = useMemo(() => [
    "/nderway.png",
    "/Roofing Renovation in a Sunlit Woodland Setting.png",
    "/Sunlit Roofline.png",
    "/Elderly Painter on .png",
  ], []);

  const [currentImage, setCurrentImage] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => {
        const next = (prev + 1) % backgroundImages.length;
        setLoadedImages(prevLoaded => new Set(prevLoaded).add(next));
        return next;
      });
    }, 5000);

    // Preload all images progressively
    backgroundImages.forEach((_, index) => {
      if (index === 0) return; // First image already loaded
      const timer = setTimeout(() => {
        setLoadedImages(prev => new Set(prev).add(index));
      }, index * 500); // Stagger preloading
      return () => clearTimeout(timer);
    });

    return () => {
      clearInterval(interval);
    };
  }, [backgroundImages]);

  const handleSearch = () => {
    if (searchQuery) {
      window.location.href = `/book-service?service=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
<section className="relative isolate overflow-hidden bg-[#153443] lg:h-[92vh]" suppressHydrationWarning>
  {/* Background image */}
 <div className="absolute inset-0 -z-20 overflow-hidden" aria-hidden="true">
  {backgroundImages.map((image, index) => (
    <div
      key={image}
      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
        currentImage === index ? "opacity-100" : "opacity-0"
      }`}
    >
      {loadedImages.has(index) && (
        <Image
          src={image}
          alt=""
          fill
          priority={false}
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
      )}
    </div>
  ))}
</div>

  {/* Dark overlay */}
  <div
    className="absolute inset-0 -z-0 bg-gradient-to-r from-[#153443]/90 via-[#153443]/75 to-[#153443]/60"
    aria-hidden="true"
  />

  <div className="relative mx-auto max-w-7xl px-5 py-32 lg:px-8">
    {/* Hero content */}
    <div className="max-w-3xl text-white">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-[#f9d27a] backdrop-blur-sm">
        <Sparkles aria-hidden="true" className="size-4" />
        Professional services, managed by HunarLink
      </div>

      <h1 className="max-w-3xl text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
        Trusted professionals for every job.
      </h1>

      <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/90">
        From home repairs to maintenance, HunarLink connects you with verified local professionals and manages your service from request to completion.
      </p>

      {/* Search UI */}
      <div className="mt-10 rounded-2xl bg-white p-2 shadow-2xl md:p-3">
        <div className="flex flex-col gap-2 md:flex-row md:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search for a service (e.g., Electrician, Plumber, Painter)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full rounded-xl border-0 bg-gray-50 py-4 pl-12 pr-4 text-sm text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#2f765b] focus:ring-offset-0"
            />
          </div>
          <div className="relative flex-1 md:w-64">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" aria-hidden="true" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full appearance-none rounded-xl border-0 bg-gray-50 py-4 pl-12 pr-10 text-sm text-gray-900 focus:ring-2 focus:ring-[#2f765b] focus:ring-offset-0"
            >
              <option value="">Select location</option>
              <option value="gilgit">Gilgit City</option>
              <option value="hunza">Hunza</option>
            </select>
          </div>
          <button
            onClick={handleSearch}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2f765b] px-6 py-4 text-sm font-bold text-white transition hover:bg-[#256b4f] focus:ring-2 focus:ring-[#2f765b] focus:ring-offset-2"
          >
            Find a Professional
            <ArrowRight aria-hidden="true" className="size-4" />
          </button>
        </div>
        
        {/* Popular services */}
        <div className="mt-4 flex flex-wrap gap-2 px-2">
          <span className="text-xs text-gray-500">Popular:</span>
          {['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Cleaning'].map((service) => (
            <button
              key={service}
              onClick={() => setSearchQuery(service)}
              className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-200"
            >
              {service}
            </button>
          ))}
        </div>
      </div>

      {/* Trust badges */}
      <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/80">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-white/20">
            <Sparkles className="size-4" aria-hidden="true" />
          </div>
          <span>Verified Professionals</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-white/20">
            <MapPin className="size-4" aria-hidden="true" />
          </div>
          <span>Local Experts</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-white/20">
            <Search className="size-4" aria-hidden="true" />
          </div>
          <span>Managed Service</span>
        </div>
      </div>
    </div>
  </div>
</section>
  )
}
