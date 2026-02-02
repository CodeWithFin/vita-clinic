'use client';

import { useState } from 'react';
import {
  Flower2,
  ChevronDown,
  Leaf,
  X,
} from 'lucide-react';
import Link from 'next/link';

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed z-50 flex md:px-12 lg:px-20 xl:px-24 transition-all duration-300 backdrop-blur-[2px] bg-gradient-to-b from-stone-900/90 to-transparent w-full pt-6 pr-6 pb-6 pl-6 top-0 right-0 left-0 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 select-none cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <Flower2 className="h-8 w-8 text-stone-200 transition-transform duration-700 ease-out group-hover:rotate-180" strokeWidth={1.2} />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg tracking-tight text-white group-hover:text-stone-200 transition-colors">
              Vitapharm
            </span>
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-stone-300 font-light">
              Wellness Spa
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex text-sm font-light text-stone-200 tracking-wide gap-x-10 gap-y-x-10 items-center">
          <div className="group flex cursor-pointer gap-1.5 hover:text-white transition-colors relative gap-x-1.5 gap-y-1.5 items-center">
            <span className="">Services</span>
            <ChevronDown className="lucide lucide-chevron-down h-3.5 w-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-300" />

            <div className="absolute top-full left-0 pt-6 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0 z-50 ease-out pointer-events-none group-hover:pointer-events-auto">
              <div className="bg-stone-900/95 backdrop-blur-md border border-stone-800 shadow-2xl rounded-sm py-2 flex flex-col">
                <a href="#" className="px-5 py-2.5 text-xs uppercase tracking-wider text-stone-400 hover:text-white hover:bg-stone-800/50 transition-colors flex items-center justify-between group/item">
                  Massage
                  <ChevronDown className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 text-stone-200 w-3 h-3 -rotate-90" />
                </a>
                <a href="#" className="px-5 py-2.5 text-xs uppercase tracking-wider text-stone-400 hover:text-white hover:bg-stone-800/50 transition-colors flex items-center justify-between group/item">
                  Therapies
                  <ChevronDown className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 text-stone-200 w-3 h-3 -rotate-90" />
                </a>
                <a href="#" className="px-5 py-2.5 text-xs uppercase tracking-wider text-stone-400 hover:text-white hover:bg-stone-800/50 transition-colors flex items-center justify-between group/item">
                  Facials
                  <ChevronDown className="opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-300 text-stone-200 w-3 h-3 -rotate-90" />
                </a>
                <div className="h-px bg-stone-800 my-1 mx-4"></div>
                <a href="/services" className="px-5 py-2.5 text-xs uppercase tracking-wider text-stone-300 hover:text-white hover:bg-stone-800/50 transition-colors">
                  View Full Menu
                </a>
              </div>
            </div>
          </div>
          <a href="#special-offers" className="hover:text-white transition-colors">
            Special Offers
          </a>
          <a href="#about-spa" className="hover:text-white transition-colors">
            About Spa
          </a>
          <a href="#visit-us" className="hover:text-white transition-colors">Contact Us</a>
        </nav>

        <div className="flex gap-6 gap-x-6 gap-y-6 items-center">
          <Link href="/book" className="hidden md:block uppercase hover:bg-[#3d4d41] hover:border-stone-400 transition-all duration-300 shadow-stone-950/20 text-xs font-medium text-white tracking-[0.15em] bg-[#4A5D4F]/80 border-[#647a6a] border rounded-sm pt-3 pr-8 pb-3 pl-8 shadow-xl backdrop-blur-md">
            Book Now
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 text-white hover:text-stone-200 transition-colors"
            aria-label="Open menu"
          >
            <Leaf className="w-7 h-7" strokeWidth={1.2} />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-[60] lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm"
          aria-label="Close menu"
        />
        <div
          className={`absolute top-0 right-0 h-full w-full max-w-sm bg-stone-900 border-l border-stone-800 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-6 border-b border-stone-800">
            <span className="font-display text-lg tracking-tight text-white">Menu</span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-stone-400 hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" strokeWidth={1.5} />
            </button>
          </div>
          <nav className="flex flex-col p-6 gap-1">
            <a
              href="/services"
              className="py-3 px-2 text-stone-200 hover:text-white transition-colors text-sm tracking-wide"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </a>
            <a
              href="#special-offers"
              className="py-3 px-2 text-stone-200 hover:text-white transition-colors text-sm tracking-wide"
              onClick={() => setMobileMenuOpen(false)}
            >
              Special Offers
            </a>
            <a
              href="#about-spa"
              className="py-3 px-2 text-stone-200 hover:text-white transition-colors text-sm tracking-wide"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Spa
            </a>
            <a
              href="#visit-us"
              className="py-3 px-2 text-stone-200 hover:text-white transition-colors text-sm tracking-wide"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact Us
            </a>
          </nav>
          <div className="mt-auto p-6 border-t border-stone-800">
            <Link
              href="/book"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center uppercase hover:bg-[#3d4d41] hover:border-stone-400 transition-all duration-300 text-xs font-medium text-white tracking-[0.15em] bg-[#4A5D4F]/80 border-[#647a6a] border rounded-sm py-4 shadow-xl backdrop-blur-md"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
