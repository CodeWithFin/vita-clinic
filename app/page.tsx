import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden relative">
      {/* Fixed Background */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1722483173894-74b0de110e54?w=2560&q=80" 
          alt="Background" 
          className="object-center brightness-[1] contrast-[0.95] saturate-[0.8] w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/60"></div>
        <div className="absolute inset-0 bg-stone-950/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 md:px-12 lg:px-24">
        <div className="text-center space-y-8 max-w-4xl">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="relative flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-200">
                <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Z"/>
                <path d="M12 14c.732 0 1.423.132 2.066.372"/>
                <path d="M16.472 14.372a8 8 0 1 1-8.944 0"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-display text-3xl tracking-tight text-white">
                VitaPharm
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-stone-300 font-light">
                Wellness Clinic
              </span>
            </div>
          </div>

          <h1 className="font-serif-custom text-5xl md:text-7xl text-stone-100 font-light leading-tight">
            Your Wellness Journey <span className="italic text-stone-400">Starts Here</span>
          </h1>

          <p className="text-lg md:text-xl text-stone-400 font-light leading-relaxed max-w-2xl mx-auto">
            Experience professional aesthetic treatments and therapeutic services in a serene environment designed for your comfort and healing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <Link 
              href="/login"
              className="uppercase hover:bg-primary-dark hover:border-stone-400 transition-all duration-300 shadow-stone-950/20 text-sm font-medium text-white tracking-[0.15em] bg-primary/80 border-[#647a6a] border rounded-sm pt-4 pr-10 pb-4 pl-10 shadow-xl backdrop-blur-md"
            >
              Staff Login
            </Link>
            <Link 
              href="/book"
              className="uppercase hover:bg-stone-800 hover:border-stone-600 transition-all duration-300 text-sm font-medium text-white tracking-[0.15em] bg-stone-900/80 border-stone-700 border rounded-sm pt-4 pr-10 pb-4 pl-10 shadow-xl backdrop-blur-md"
            >
              Book Appointment
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-12 border-t border-stone-700/30">
            <div className="space-y-2">
              <h3 className="text-3xl font-serif-custom text-stone-200">40+</h3>
              <p className="text-sm uppercase tracking-wider text-stone-500">Premium Services</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-serif-custom text-stone-200">Expert</h3>
              <p className="text-sm uppercase tracking-wider text-stone-500">Practitioners</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-serif-custom text-stone-200">5★</h3>
              <p className="text-sm uppercase tracking-wider text-stone-500">Client Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
