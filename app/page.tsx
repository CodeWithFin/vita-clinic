import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="bg-stone-900 font-body text-stone-100 antialiased selection:bg-primary selection:text-white w-full min-h-screen overflow-x-hidden relative">
      {/* Fixed Background Layer */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1722483173894-74b0de110e54?w=2560&q=80" 
          alt="Wellness Background" 
          className="object-center brightness-[1] contrast-[0.95] saturate-[0.8] w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/60"></div>
        <div className="absolute inset-0 bg-stone-950/20"></div>
      </div>

      {/* Navigation */}
      <header className="fixed z-50 flex md:px-12 lg:px-20 xl:px-24 transition-all duration-300 backdrop-blur-[2px] bg-gradient-to-b from-stone-900/90 to-transparent w-full pt-6 pr-6 pb-6 pl-6 top-0 right-0 left-0 items-center justify-between">
        <div className="flex items-center gap-3 select-none cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-stone-200 transition-transform duration-700 ease-out group-hover:rotate-180">
              <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Z"/>
              <path d="M12 14c.732 0 1.423.132 2.066.372"/>
              <path d="M16.472 14.372a8 8 0 1 1-8.944 0"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg tracking-tight text-white group-hover:text-stone-200 transition-colors">
              VitaPharm
            </span>
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-stone-300 font-light">
              Wellness Clinic
            </span>
          </div>
        </div>

        <div className="flex gap-6 items-center">
          <Link
            href="/login"
            className="hidden md:block uppercase hover:bg-primary-dark hover:border-stone-400 transition-all duration-300 shadow-stone-950/20 text-xs font-medium text-white tracking-[0.15em] bg-primary/80 border-[#647a6a] border rounded-sm pt-3 pr-8 pb-3 pl-8 shadow-xl backdrop-blur-md"
          >
            Staff Login
          </Link>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="relative z-10 w-full flex flex-col">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col md:px-12 lg:px-20 xl:px-24 pt-32 pr-6 pb-12 pl-6 relative justify-end">
          <div className="flex flex-col md:flex-row md:items-start md:mb-32 w-full mb-16 gap-x-12 gap-y-12 justify-between">
            <div className="max-w-xl">
              <p className="md:text-4xl leading-relaxed text-2xl font-light italic text-stone-100 tracking-wide font-cormorant">
                An invitation to slow down. Restore your body, quiet the mind, and reconnect within.
              </p>
            </div>

            <div className="flex flex-col gap-6 text-base md:text-lg font-light text-stone-200 md:text-right border-l md:border-l-0 md:border-r border-stone-500/30 pl-6 md:pr-6 md:pl-0">
              <div className="space-y-1">
                <h3 className="font-medium text-white tracking-tight">
                  VitaPharm Wellness Center
                </h3>
                <p className="opacity-90">Nairobi, Kenya</p>
              </div>
              <div className="space-y-1">
                <div className="flex flex-col md:flex-row md:justify-end gap-2 md:gap-8">
                  <span className="opacity-70">Mon–Fri:</span>
                  <span className="text-white font-normal">09:00–21:00</span>
                </div>
                <div className="flex flex-col md:flex-row md:justify-end gap-2 md:gap-8">
                  <span className="opacity-70">Sat–Sun:</span>
                  <span className="text-white font-normal">10:00–20:00</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative w-full">
            <div className="mb-2 md:mb-[-1.5%] relative z-10 pl-1 md:pl-4">
              <h2 className="font-serif-custom text-3xl md:text-5xl italic tracking-tight text-white font-light">
                Wellness Clinic in Nairobi
              </h2>
            </div>
            <h1 className="md:text-left text-[15vw] leading-[0.75] bg-clip-text md:-ml-4 select-none z-20 text-transparent tracking-tight font-display text-center bg-gradient-to-b from-stone-100 to-stone-500/10 opacity-30 mix-blend-overlay w-full relative">
              VITAPHARM
            </h1>
          </div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-50 hidden md:block">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
              <path d="M12 5v14"></path>
              <path d="m19 12-7 7-7-7"></path>
            </svg>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="relative bg-stone-900 py-24 px-6 md:px-12 lg:px-24 border-t border-stone-800/50">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative group">
              <div className="absolute inset-0 bg-primary rounded-sm transform translate-x-3 translate-y-3 opacity-20 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500"></div>
              <img 
                src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80" 
                alt="Clinic Interior" 
                className="relative z-10 w-full h-[600px] object-cover grayscale-[30%] rounded-sm brightness-90 contrast-[1.1]"
              />
            </div>
            <div className="order-1 lg:order-2 space-y-8">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#8e9f92]">
                Our Philosophy
              </span>
              <h2 className="font-serif-custom text-4xl md:text-5xl lg:text-6xl text-stone-100 font-light leading-tight">
                Professional care for <span className="italic text-stone-400">modern wellness.</span>
              </h2>
              <p className="text-lg text-stone-400 font-light leading-relaxed max-w-lg">
                We believe that true wellness comes from combining expert aesthetic treatments with holistic care. Our team of professionals is dedicated to helping you look and feel your best.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-8 font-light text-stone-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full border border-stone-700 bg-stone-800/50 text-[#8e9f92]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                    </svg>
                  </div>
                  <span className="text-sm tracking-wide">Expert Care</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full border border-stone-700 bg-stone-800/50 text-[#8e9f92]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </div>
                  <span className="text-sm tracking-wide">Modern Facilities</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="relative bg-stone-950 py-32 px-6 md:px-12 lg:px-24">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4">
              <h2 className="font-display text-3xl md:text-4xl text-white tracking-tight">
                Our Services
              </h2>
              <p className="text-stone-400 font-light max-w-md">
                Comprehensive aesthetic and wellness treatments tailored to your needs.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Service Card 1 */}
            <div className="group relative bg-stone-900 border border-stone-800 p-8 md:p-10 hover:border-stone-600 transition-all duration-500 hover:-translate-y-1">
              <div className="h-full flex flex-col justify-between space-y-8">
                <div>
                  <span className="text-xs font-medium text-[#8e9f92] uppercase tracking-wider block mb-3">
                    Facial Treatments
                  </span>
                  <h3 className="font-serif-custom text-3xl text-stone-200 group-hover:text-white transition-colors">
                    12 Services
                  </h3>
                  <p className="mt-4 text-stone-500 font-light leading-relaxed group-hover:text-stone-400 transition-colors text-sm">
                    From deep cleansing to anti-aging treatments, personalized for your skin type.
                  </p>
                </div>
              </div>
            </div>

            {/* Service Card 2 */}
            <div className="group relative bg-stone-900 border border-stone-800 p-8 md:p-10 hover:border-stone-600 transition-all duration-500 hover:-translate-y-1">
              <div className="h-full flex flex-col justify-between space-y-8">
                <div>
                  <span className="text-xs font-medium text-[#8e9f92] uppercase tracking-wider block mb-3">
                    Massage Therapies
                  </span>
                  <h3 className="font-serif-custom text-3xl text-stone-200 group-hover:text-white transition-colors">
                    4 Services
                  </h3>
                  <p className="mt-4 text-stone-500 font-light leading-relaxed group-hover:text-stone-400 transition-colors text-sm">
                    Therapeutic massage treatments to relax, rejuvenate and restore balance.
                  </p>
                </div>
              </div>
            </div>

            {/* Service Card 3 */}
            <div className="group relative bg-stone-900 border border-stone-800 p-8 md:p-10 hover:border-stone-600 transition-all duration-500 hover:-translate-y-1">
              <div className="h-full flex flex-col justify-between space-y-8">
                <div>
                  <span className="text-xs font-medium text-[#8e9f92] uppercase tracking-wider block mb-3">
                    Advanced Treatments
                  </span>
                  <h3 className="font-serif-custom text-3xl text-stone-200 group-hover:text-white transition-colors">
                    13+ Services
                  </h3>
                  <p className="mt-4 text-stone-500 font-light leading-relaxed group-hover:text-stone-400 transition-colors text-sm">
                    Body treatments and advanced procedures by certified professionals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="relative bg-stone-900 py-24 px-6 md:px-12 lg:px-24 border-t border-stone-800/50">
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <h2 className="font-serif-custom text-4xl md:text-5xl text-stone-100 font-light">
              Ready to begin your <span className="italic text-stone-400">wellness journey?</span>
            </h2>
            <p className="text-lg text-stone-400 font-light">
              Book your appointment today or contact our team for personalized recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link
                href="/login"
                className="uppercase hover:bg-primary-dark transition-all duration-300 text-sm font-medium text-white tracking-[0.15em] bg-primary border border-primary rounded-sm pt-4 pr-10 pb-4 pl-10 shadow-xl"
              >
                Staff Portal
              </Link>
              <a
                href="tel:+254700000000"
                className="uppercase hover:bg-stone-800 transition-all duration-300 text-sm font-medium text-white tracking-[0.15em] bg-stone-900 border border-stone-700 rounded-sm pt-4 pr-10 pb-4 pl-10"
              >
                Contact Us
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-stone-950 pt-24 pb-12 px-6 md:px-12 lg:px-24 border-t border-stone-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-stone-400">
                  <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Z"/>
                  <path d="M12 14c.732 0 1.423.132 2.066.372"/>
                  <path d="M16.472 14.372a8 8 0 1 1-8.944 0"/>
                </svg>
                <span className="font-display text-lg tracking-tight text-stone-200">
                  VitaPharm
                </span>
              </div>
              <p className="text-stone-500 font-light text-sm leading-relaxed max-w-xs">
                Your trusted wellness partner, providing comprehensive aesthetic and therapeutic services.
              </p>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-medium text-stone-300 uppercase tracking-wider">
                Quick Links
              </h4>
              <ul className="space-y-3 text-sm text-stone-500 font-light">
                <li>
                  <Link href="/login" className="hover:text-[#8e9f92] transition-colors">
                    Staff Portal
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-[#8e9f92] transition-colors">
                    Services
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#8e9f92] transition-colors">
                    About Us
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-medium text-stone-300 uppercase tracking-wider">
                Contact
              </h4>
              <ul className="space-y-3 text-sm text-stone-500 font-light">
                <li>Nairobi, Kenya</li>
                <li>
                  <a href="tel:+254700000000" className="hover:text-white transition-colors">
                    +254 700 000 000
                  </a>
                </li>
                <li>
                  <a href="mailto:info@vitapharm.co.ke" className="hover:text-white transition-colors">
                    info@vitapharm.co.ke
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-stone-900">
            <p className="text-xs text-stone-600 font-light">
              © 2026 VitaPharm Wellness. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
