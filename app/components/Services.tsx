'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Zap, Wrench, Droplets, Paintbrush, Fan, Broom, Sparkles } from 'lucide-react'
import { useState } from 'react'

const categories = [
  { name: 'Cleaners', icon: Broom, services: [
    { name: 'House Cleaning', slug: 'house-cleaning', image: '/pexels-kindelmedia-8487379.jpg' },
    { name: 'Carpet Cleaning', slug: 'carpet-cleaning', image: '/pexels-kindelmedia-8487379.jpg' },
    { name: 'Junk Removal', slug: 'junk-removal', image: '/pexels-kindelmedia-8487379.jpg' },
    { name: 'Pressure Washing', slug: 'pressure-washing', image: '/pexels-kindelmedia-8487379.jpg' },
  ]},
  { name: 'Handymen', icon: Wrench, services: [
    { name: 'General Repairs', slug: 'general-repairs', image: '/Roofing Renovation in a Sunlit Woodland Setting.png' },
    { name: 'Furniture Assembly', slug: 'furniture-assembly', image: '/Roofing Renovation in a Sunlit Woodland Setting.png' },
    { name: 'Door Installation', slug: 'door-installation', image: '/Roofing Renovation in a Sunlit Woodland Setting.png' },
    { name: 'Window Repair', slug: 'window-repair', image: '/Roofing Renovation in a Sunlit Woodland Setting.png' },
  ]},
  { name: 'Plumbers', icon: Droplets, services: [
    { name: 'Pipe Repair', slug: 'pipe-repair', image: '/pexels-gaion-16215514.jpg' },
    { name: 'Drain Cleaning', slug: 'drain-cleaning', image: '/pexels-gaion-16215514.jpg' },
    { name: 'Water Heater', slug: 'water-heater', image: '/pexels-gaion-16215514.jpg' },
    { name: 'Fixture Installation', slug: 'fixture-installation', image: '/pexels-gaion-16215514.jpg' },
  ]},
  { name: 'Electrical pros', icon: Zap, services: [
    { name: 'Wiring', slug: 'wiring', image: '/pexels-kindelmedia-8487379.jpg' },
    { name: 'Outlet Repair', slug: 'outlet-repair', image: '/pexels-kindelmedia-8487379.jpg' },
    { name: 'Lighting', slug: 'lighting', image: '/pexels-kindelmedia-8487379.jpg' },
    { name: 'Panel Upgrade', slug: 'panel-upgrade', image: '/pexels-kindelmedia-8487379.jpg' },
  ]},
  { name: 'Painters', icon: Paintbrush, services: [
    { name: 'Interior Painting', slug: 'interior-painting', image: '/pexels-sirmudi_photography-2155088036-34507559.jpg' },
    { name: 'Exterior Painting', slug: 'exterior-painting', image: '/pexels-sirmudi_photography-2155088036-34507559.jpg' },
    { name: 'Wallpaper', slug: 'wallpaper', image: '/pexels-sirmudi_photography-2155088036-34507559.jpg' },
    { name: 'Touch-ups', slug: 'touch-ups', image: '/pexels-sirmudi_photography-2155088036-34507559.jpg' },
  ]},
  { name: 'HVAC', icon: Fan, services: [
    { name: 'AC Repair', slug: 'ac-repair', image: '/Sunlit Roofline.png' },
    { name: 'Heating', slug: 'heating', image: '/Sunlit Roofline.png' },
    { name: 'Ventilation', slug: 'ventilation', image: '/Sunlit Roofline.png' },
    { name: 'Maintenance', slug: 'hvac-maintenance', image: '/Sunlit Roofline.png' },
  ]},
]

export default function Services() {
  const [selectedCategory, setSelectedCategory] = useState(categories[0])

  return (
    <section id="services" className="mx-auto max-w-7xl px-5 py-24 lg:px-8" suppressHydrationWarning>
      <div className="text-center" suppressHydrationWarning>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d98d2b]">HunarLink services</p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">Pros for every project in Your Area.</h2>
        <p className="mt-4 max-w-2xl mx-auto text-[#6d7e85]">
          Book a service through HunarLink. Our team coordinates a verified professional for your location and schedule.
        </p>
      </div>

      {/* Horizontal scrollable category list */}
      <div className="mt-12 overflow-x-auto pb-4" suppressHydrationWarning>
        <div className="flex gap-3 min-w-max" suppressHydrationWarning>
          {categories.map((category) => {
            const Icon = category.icon
            const isSelected = selectedCategory.name === category.name
            return (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#2f765b] text-white shadow-lg'
                    : 'bg-white text-[#153443] border border-[#e3ebe6] hover:border-[#2f765b]'
                }`}
              >
                <Icon className="size-4" />
                {category.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Service cards for selected category */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" suppressHydrationWarning>
        {selectedCategory.services.map((service) => (
          <Link
            key={service.slug}
            href={`/book-service?service=${service.slug}`}
            className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
          >
            {/* Service image */}
            <div className="relative h-48 overflow-hidden">
              <Image
                src={service.image}
                alt={service.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Service name overlay */}
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-lg font-bold text-white">{service.name}</h3>
              </div>
            </div>

            {/* Card content */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#2f765b]">Book now</span>
                <ArrowRight className="size-4 text-[#2f765b] transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* View all services link */}
      <div className="mt-12 text-center" suppressHydrationWarning>
        <Link
          href="/book-service"
          className="inline-flex items-center gap-2 rounded-full border-2 border-[#2f765b] px-6 py-3 font-semibold text-[#2f765b] transition-all hover:bg-[#2f765b] hover:text-white"
        >
          <Sparkles className="size-4" />
          View all services
        </Link>
      </div>
    </section>
  )
}
