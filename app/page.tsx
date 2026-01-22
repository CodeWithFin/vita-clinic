import { 
  Lotus, 
  ChevronDown, 
  Leaf, 
  ArrowDown, 
  Sparkles, 
  Droplets, 
  Flower2, 
  ArrowRight, 
  Quote, 
  Clock, 
  MapPin, 
  MessageCircle, 
  Phone, 
  Map as MapIcon, 
  Instagram, 
  Facebook, 
  Twitter,
  Waves
} from 'lucide-react';

export default function Home() {
  return (
    <>
      {/* Fixed Background Layer */}
      <div className="fixed inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1722483173894-74b0de110e54?w=2560&q=80" alt="Bali Misty Mountains" className="object-center brightness-[1] contrast-[0.95] saturate-[0.8] w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/60"></div>
        <div className="absolute inset-0 bg-stone-950/20"></div>
      </div>

      {/* Navigation (Sticky) */}
      <header className="fixed z-50 flex md:px-12 lg:px-20 xl:px-24 transition-all duration-300 backdrop-blur-[2px] bg-gradient-to-b from-stone-900/90 to-transparent w-full pt-6 pr-6 pb-6 pl-6 top-0 right-0 left-0 items-center justify-between">
        <div className="flex items-center gap-3 select-none cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <Lotus className="h-8 w-8 text-stone-200 transition-transform duration-700 ease-out group-hover:rotate-180" strokeWidth={1.2} />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg tracking-tight text-white group-hover:text-stone-200 transition-colors">
              Asmara
            </span>
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-stone-300 font-light">
              Wellness Spa
            </span>
          </div>
        </div>

        <nav className="hidden lg:flex text-sm font-light text-stone-200 tracking-wide gap-x-10 gap-y-x-10 items-center">
          <div className="group flex cursor-pointer gap-1.5 hover:text-white transition-colors relative gap-x-1.5 gap-y-1.5 items-center">
            <span className="">Services</span>
            <ChevronDown className="lucide lucide-chevron-down h-3.5 w-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-300" />
            
            {/* Dropdown Menu */}
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
                <a href="#" className="px-5 py-2.5 text-xs uppercase tracking-wider text-stone-300 hover:text-white hover:bg-stone-800/50 transition-colors">
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
          <button className="hidden md:block uppercase hover:bg-[#3d4d41] hover:border-stone-400 transition-all duration-300 shadow-stone-950/20 text-xs font-medium text-white tracking-[0.15em] bg-[#4A5D4F]/80 border-[#647a6a] border rounded-sm pt-3 pr-8 pb-3 pl-8 shadow-xl backdrop-blur-md">
            Book Now
          </button>
          <button className="lg:hidden text-white">
            <Leaf className="lucide lucide-leaf w-[28px] h-[28px]" />
          </button>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="relative z-10 w-full flex flex-col">
        {/* Section 1: Hero */}
        <section className="min-h-screen flex flex-col md:px-12 lg:px-20 xl:px-24 pt-32 pr-6 pb-12 pl-6 relative justify-end">
          <div className="flex flex-col md:flex-row md:items-start md:mb-32 w-full mb-16 gap-x-12 gap-y-12 justify-between">
            <div className="max-w-xl">
              <p className="md:text-4xl leading-relaxed text-2xl font-light italic text-stone-100 tracking-wide font-cormorant">An invitation to slow down.
              Restore your body, quiet the mind, and reconnect within.</p>
            </div>

            <div className="flex flex-col gap-6 text-base md:text-lg font-light text-stone-200 md:text-right border-l md:border-l-0 md:border-r border-stone-500/30 pl-6 md:pr-6 md:pl-0">
              <div className="space-y-1">
                <h3 className="font-medium text-white tracking-tight">
                  Jalan Pantai Batu Bolong,
                </h3>
                <p className="opacity-90">Canggu, Bali 80361</p>
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
                Wellness Spa in Bali
              </h2>
            </div>
            <h1 className="md:text-left text-[15vw] leading-[0.75] bg-clip-text md:-ml-4 select-none z-20 text-transparent tracking-tight font-display text-center bg-gradient-to-b from-stone-100 to-stone-500/10 opacity-30 mix-blend-overlay w-full relative">
              ASMARA
            </h1>

            {/* Decorative SVG */}
            <div className="absolute bottom-[-20%] right-[-5%] z-10 w-[60vw] md:w-[35vw] pointer-events-none opacity-40 mix-blend-soft-light">
              <svg viewBox="0 0 400 500" fill="none" className="w-full h-full stroke-stone-200" strokeWidth="0.8">
                <path d="M350 500 C350 500 300 300 100 200" strokeLinecap="round"></path>
                <path d="M180 250 C100 250 50 180 60 120 C100 100 180 150 180 250 Z"></path>
                <path d="M60 120 C120 185 180 250 180 250" strokeDasharray="2 4"></path>
                <path d="M220 300 C150 280 120 220 130 180 C180 180 220 300 220 300 Z"></path>
              </svg>
            </div>
          </div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-50 hidden md:block">
            <ArrowDown className="w-5 h-5 text-white" />
          </div>
        </section>

        {/* Section 2: Philosophy */}
        <section className="relative bg-stone-900 py-24 px-6 md:px-12 lg:px-24 border-t border-stone-800/50">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative group">
              <div className="absolute inset-0 bg-[#4A5D4F] rounded-sm transform translate-x-3 translate-y-3 opacity-20 group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500"></div>
              <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80" alt="Spa Interior" className="relative z-10 w-full h-[600px] object-cover grayscale-[30%] rounded-sm brightness-90 contrast-[1.1]" />
            </div>
            <div className="order-1 lg:order-2 space-y-8">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#8e9f92]">
                Our Philosophy
              </span>
              <h2 className="font-serif-custom text-4xl md:text-5xl lg:text-6xl text-stone-100 font-light leading-tight">
                Ancient healing for
                <span className="italic text-stone-400">modern life.</span>
              </h2>
              <p className="text-lg text-stone-400 font-light leading-relaxed max-w-lg">
                We believe that true wellness lies in the balance between nature
                and nurture. Our treatments are rooted in Balinese traditions,
                using locally sourced ingredients and ancient techniques to
                restore your body's natural rhythm.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-8 font-light text-stone-300">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full border border-stone-700 bg-stone-800/50 text-[#8e9f92]">
                    <Leaf className="w-4 h-4" />
                  </div>
                  <span className="text-sm tracking-wide">Organic Products</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full border border-stone-700 bg-stone-800/50 text-[#8e9f92]">
                    <Waves className="w-4 h-4" />
                  </div>
                  <span className="text-sm tracking-wide">Hydrotherapy</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Services Grid */}
        <section className="relative bg-stone-950 py-32 px-6 md:px-12 lg:px-24">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4">
              <h2 className="font-display text-3xl md:text-4xl text-white tracking-tight">
                Signature Treatments
              </h2>
              <p className="text-stone-400 font-light max-w-md">
                Curated experiences designed to rejuvenate your senses.
              </p>
            </div>
            <a href="#" className="group flex items-center gap-2 text-sm uppercase tracking-widest text-stone-400 hover:text-white transition-colors">
              View Full Menu
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="group relative bg-stone-900 border border-stone-800 p-8 md:p-10 hover:border-stone-600 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                <Sparkles className="w-8 h-8 text-stone-400 font-light" />
              </div>
              <div className="h-full flex flex-col justify-between space-y-8">
                <div className="">
                  <span className="text-xs font-medium text-[#8e9f92] uppercase tracking-wider block mb-3">
                    Massage
                  </span>
                  <h3 className="font-serif-custom text-3xl text-stone-200 group-hover:text-white transition-colors">
                    Balinese Flow
                  </h3>
                  <p className="mt-4 text-stone-500 font-light leading-relaxed group-hover:text-stone-400 transition-colors text-sm">
                    A seamless blend of acupressure, reflexology and aromatherapy
                    to stimulate circulation and soothe tension.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-stone-800 group-hover:border-stone-700 transition-colors">
                  <span className="text-sm text-stone-400">90 Mins</span>
                  <span className="text-lg font-serif-custom italic text-white">
                    5
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative bg-stone-900 border border-stone-800 p-8 md:p-10 hover:border-stone-600 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                <Droplets className="w-8 h-8 text-stone-400 font-light" />
              </div>
              <div className="h-full flex flex-col justify-between space-y-8">
                <div className="">
                  <span className="text-xs font-medium text-[#8e9f92] uppercase tracking-wider block mb-3">
                    Therapy
                  </span>
                  <h3 className="font-serif-custom text-3xl text-stone-200 group-hover:text-white transition-colors">
                    Thermal Clay
                  </h3>
                  <p className="mt-4 text-stone-500 font-light leading-relaxed group-hover:text-stone-400 transition-colors text-sm">
                    Detoxifying volcanic clay wrap followed by a warm herbal bath
                    to draw out impurities and soften skin.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-stone-800 group-hover:border-stone-700 transition-colors">
                  <span className="text-sm text-stone-400">120 Mins</span>
                  <span className="text-lg font-serif-custom italic text-white">
                    40
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative bg-stone-900 border border-stone-800 p-8 md:p-10 hover:border-stone-600 transition-all duration-500 hover:-translate-y-1">
              <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                <Flower2 className="w-8 h-8 text-stone-400 font-light" />
              </div>
              <div className="h-full flex flex-col justify-between space-y-8">
                <div>
                  <span className="text-xs font-medium text-[#8e9f92] uppercase tracking-wider block mb-3">
                    Facial
                  </span>
                  <h3 className="font-serif-custom text-3xl text-stone-200 group-hover:text-white transition-colors">
                    Radiant Glow
                  </h3>
                  <p className="mt-4 text-stone-500 font-light leading-relaxed group-hover:text-stone-400 transition-colors text-sm">
                    Deep cleansing and hydration using organic aloe vera and
                    cucumber essence to restore youthful vitality.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-stone-800 group-hover:border-stone-700 transition-colors">
                  <span className="text-sm text-stone-400">60 Mins</span>
                  <span className="text-lg font-serif-custom italic text-white">
                    5
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="md:px-12 lg:px-24 overflow-hidden bg-stone-900 border-stone-800 border-t pt-24 pr-6 pb-24 pl-6 relative" id="special-offers">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#4A5D4F]/5 to-transparent pointer-events-none"></div>
          <div className="text-center max-w-2xl mx-auto mb-16 relative z-10">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#8e9f92]">
              Limited Time
            </span>
            <h2 className="font-serif-custom text-4xl md:text-5xl text-stone-100 font-light mt-4 mb-6">
              Seasonal Journeys
            </h2>
            <p className="text-stone-400 font-light">
              Exclusive packages curated for the season, offering a holistic
              approach to renewal.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 z-10 relative gap-x-8 gap-y-8">
            {/* Card 1 */}
            <div className="relative group overflow-hidden bg-stone-950 border border-stone-800/50 hover:border-stone-700 transition-all duration-500">
              <div className="aspect-[3/2] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80" alt="Couples Retreat" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-[0.85]" />
              </div>
              <div className="flex flex-col h-full pt-8 pr-8 pb-8 pl-8 relative">
                <div className="text-[0.65rem] uppercase z-10 font-bold text-white tracking-widest bg-[#4A5D4F] pt-1.5 pr-3 pb-1.5 pl-3 absolute top-6 right-6 shadow-lg">
                  -20% Off
                </div>
                <h3 className="text-2xl text-stone-200 font-serif-custom mb-3">
                  Couples Retreat
                </h3>
                <p className="leading-relaxed group-hover:text-stone-300 transition-colors text-sm font-light text-stone-400 mb-8">
                  A shared journey of relaxation including aromatherapy massage
                  and private floral bath.
                </p>
                <div className="hidden flex items-center justify-between mt-auto border-t border-stone-900/50 pt-6">
                  <span className="text-stone-300 font-serif-custom italic text-xl">
                    40
                    <span className="text-xs font-sans text-stone-600 line-through not-italic ml-2">
                      00
                    </span>
                  </span>
                  <button className="text-xs uppercase tracking-widest text-white border-b border-transparent hover:border-white transition-all pb-0.5">
                    Book Experience
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="relative group overflow-hidden bg-stone-950 border border-stone-800/50 hover:border-stone-700 transition-all duration-500">
              <div className="aspect-[3/2] overflow-hidden">
                <img src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80" alt="Morning Awakening" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-[0.85]" />
              </div>
              <div className="flex flex-col h-full pt-8 pr-8 pb-8 pl-8 relative">
                <div className="text-[0.65rem] uppercase z-10 font-bold text-white tracking-widest bg-[#4A5D4F] pt-1.5 pr-3 pb-1.5 pl-3 absolute top-6 right-6 shadow-lg">
                  -20% Off
                </div>
                <h3 className="group-hover:text-white transition-colors text-2xl text-stone-200 font-serif-custom mb-3">
                  Morning Awakening
                </h3>
                <p className="leading-relaxed group-hover:text-stone-300 transition-colors text-sm font-light text-stone-400 mb-8">
                  Start your day with vitality. A 60-minute energizing scrub
                  followed by a fresh organic breakfast.
                </p>
                <div className="hidden flex items-center justify-between mt-auto border-t border-stone-900/50 pt-6">
                  <span className="text-stone-300 font-serif-custom italic text-xl">
                    10
                  </span>
                  <button className="text-xs uppercase tracking-widest text-white border-b border-transparent hover:border-white transition-all pb-0.5">
                    Book Experience
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Atmosphere / Wide Image */}
        <section id="about-spa" className="py-24 px-6 md:px-12 lg:px-24 bg-stone-950 border-t border-stone-900">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#8e9f92]">
                About The Space
              </span>
              <h2 className="font-serif-custom text-4xl md:text-5xl text-stone-100 font-light leading-tight">
                Designed for
                <span className="italic text-stone-500"> stillness.</span>
              </h2>
              <div className="space-y-6 text-stone-400 font-light leading-relaxed">
                <p>
                  Asmara Wellness Spa was born from a desire to create a sanctuary
                  where the noise of the modern world simply falls away.
                </p>
                <p>
                  Our architecture embraces the raw beauty of Bali—using
                  sustainable bamboo, river stone, and reclaimed teak. Every
                  corner is designed to promote air flow and invite natural light.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div>
                  <span className="block text-3xl font-serif-custom text-stone-200 mb-1">
                    12
                  </span>
                  <span className="text-xs uppercase tracking-wider text-stone-600">
                    Private Suites
                  </span>
                </div>
                <div>
                  <span className="block text-3xl font-serif-custom text-stone-200 mb-1">
                    20+
                  </span>
                  <span className="text-xs uppercase tracking-wider text-stone-600">
                    Expert Therapists
                  </span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7 grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=600&q=80" alt="Detail 1" className="w-full h-64 object-cover rounded-sm brightness-75 hover:brightness-90 transition-all duration-500" />
              <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80" alt="Detail 2" className="w-full h-64 object-cover rounded-sm brightness-75 hover:brightness-90 transition-all duration-500 mt-12" />
              <img src="https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80" alt="Detail 3" className="w-full h-64 object-cover rounded-sm brightness-75 hover:brightness-90 transition-all duration-500" />
              <img src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600&q=80" alt="Detail 4" className="w-full h-64 object-cover rounded-sm brightness-75 hover:brightness-90 transition-all duration-500 mt-12" />
            </div>
          </div>
        </section>

        <section className="relative w-full h-[70vh] flex items-center justify-center overflow-hidden">
          <img src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1600&q=80" alt="Relaxation Area" className="absolute inset-0 w-full h-full object-cover brightness-[0.4] grayscale-[20%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/50"></div>

          <div className="relative z-10 text-center px-6 max-w-2xl mx-auto space-y-6">
            <Quote className="w-10 h-10 text-stone-400/50 mx-auto fill-current" />
            <p className="font-serif-custom text-3xl md:text-5xl text-stone-100 italic font-light leading-snug">
              "A sanctuary where time stands still and the world fades away."
            </p>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-stone-400 pt-4">
              Condé Nast Traveler
            </p>
          </div>
        </section>

        {/* Footer */}
        <section id="visit-us" className="bg-stone-900 py-24 px-6 md:px-12 lg:px-24 border-t border-stone-800">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left: Contact Details */}
            <div className="space-y-10">
              <div>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#8e9f92]">
                  Visit Us
                </span>
                <h2 className="font-serif-custom text-4xl md:text-5xl text-stone-100 font-light mt-4 mb-6 leading-tight">
                  Find your way to
                  <span className="italic text-stone-500"> serenity.</span>
                </h2>
                <p className="text-stone-400 font-light leading-relaxed max-w-md">
                  We are located in the heart of Canggu. Please contact us to
                  reserve your treatment or for any assistance.
                </p>
              </div>

              <div className="space-y-8">
                {/* Hours */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-stone-200">
                    <Clock className="w-5 h-5 text-[#8e9f92]" />
                    <span className="font-medium tracking-wide">Opening Hours</span>
                  </div>
                  <div className="pl-8 grid gap-2 text-stone-400 font-light">
                    <div className="flex justify-between max-w-xs border-b border-stone-800/50 pb-2 border-dashed">
                      <span>Mon – Fri</span>
                      <span className="text-stone-300">09:00 – 21:00</span>
                    </div>
                    <div className="flex justify-between max-w-xs pt-1">
                      <span>Sat – Sun</span>
                      <span class="text-stone-300">10:00 – 20:00</span>
                    </div>
                  </div>
                </div>

                {/* Contact Methods */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-stone-200">
                    <MapPin className="w-5 h-5 text-[#8e9f92]" />
                    <span className="font-medium tracking-wide">
                      Location & Contact
                    </span>
                  </div>
                  <div className="pl-8 flex flex-col items-start gap-4">
                    <p className="text-stone-400 font-light">
                      Jalan Pantai Batu Bolong, Canggu, Bali 80361
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <a href="https://wa.me/6281234567890" className="flex items-center gap-2 px-5 py-2.5 border border-stone-700 rounded-sm hover:bg-[#4A5D4F] hover:border-[#4A5D4F] hover:text-white transition-all duration-300 text-stone-300 text-sm tracking-wide group">
                        <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        WhatsApp
                      </a>
                      <a href="tel:+6281234567890" className="flex items-center gap-2 px-5 py-2.5 border border-stone-700 rounded-sm hover:bg-stone-800 hover:text-white transition-all duration-300 text-stone-300 text-sm tracking-wide group">
                        <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Call Us
                      </a>
                    </div>
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div className="bg-stone-950/40 p-6 border-l-2 border-[#4A5D4F] mt-8">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                    Cancellation Policy
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-light">
                    To ensure all guests enjoy their full treatment time, we
                    respectfully request at least 24 hours notice for
                    cancellations. Late cancellations may incur a 50% fee.
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Map */}
            <div className="h-full min-h-[450px] w-full bg-stone-800 relative rounded-sm overflow-hidden border border-stone-800 group">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15775.66779471549!2d115.1228468!3d-8.6511479!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd2387e078c52d3%3A0x6b8d96277f7223e7!2sJalan%20Pantai%20Batu%20Bolong%2C%20Canggu%2C%20Bali!5e0!3m2!1sen!2sid!4v1629812345678" width="100%" height="100%" style={{ border: 0, filter: 'grayscale(1) contrast(1.2) brightness(0.7)' }} allowFullScreen loading="lazy" className="absolute inset-0 w-full h-full transition-all duration-700 group-hover:filter-none"></iframe>
              <div className="absolute bottom-0 left-0 p-6 w-full bg-gradient-to-t from-stone-950 to-transparent pointer-events-none">
                <div className="inline-flex items-center gap-2 bg-stone-900/90 backdrop-blur-md px-4 py-2 rounded-sm border border-stone-700/50 text-stone-300 text-xs tracking-wider">
                  <MapIcon className="w-3 h-3" />
                  Open in Maps
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="bg-stone-950 pt-24 pb-12 px-6 md:px-12 lg:px-24 border-t border-stone-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
            {/* Brand */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Lotus className="h-6 w-6 text-stone-400" strokeWidth={1.2} />
                <span className="font-display text-lg tracking-tight text-stone-200">
                  Asmara
                </span>
              </div>
              <p className="text-stone-500 font-light text-sm leading-relaxed max-w-xs">
                An oasis of tranquility in the heart of Canggu, dedicated to
                holistic wellness and natural healing.
              </p>
            </div>

            {/* Links */}
            <div className="space-y-6">
              <h4 className="text-xs font-medium text-stone-300 uppercase tracking-wider">
                Explore
              </h4>
              <ul className="space-y-3 text-sm text-stone-500 font-light">
                <li>
                  <a href="#" className="hover:text-[#8e9f92] transition-colors">
                    Our Story
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#8e9f92] transition-colors">
                    Treatments
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#8e9f92] transition-colors">
                    Gift Cards
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#8e9f92] transition-colors">
                    Journal
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-6">
              <h4 className="text-xs font-medium text-stone-300 uppercase tracking-wider">
                Visit Us
              </h4>
              <ul className="space-y-3 text-sm text-stone-500 font-light">
                <li>Jalan Pantai Batu Bolong</li>
                <li>Canggu, Bali 80361</li>
                <li className="pt-2">
                  <a href="mailto:hello@asmaraspa.com" className="hover:text-white transition-colors">
                    hello@asmaraspa.com
                  </a>
                </li>
                <li>+62 812 3456 7890</li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-6">
              <h4 className="text-xs font-medium text-stone-300 uppercase tracking-wider">
                Newsletter
              </h4>
              <form className="space-y-4">
                <p className="text-xs text-stone-500 font-light">
                  Subscribe for seasonal offers and wellness tips.
                </p>
                <div className="relative">
                  <input type="email" placeholder="Email Address" className="w-full bg-stone-900 border border-stone-800 text-stone-300 text-sm px-4 py-3 focus:outline-none focus:border-[#4A5D4F] transition-colors placeholder:text-stone-700" />
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-stone-900">
            <p class="text-xs text-stone-600 font-light">
              © 2024 Asmara Wellness. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-stone-600 hover:text-stone-400 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="text-stone-600 hover:text-stone-400 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="text-stone-600 hover:text-stone-400 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </footer>
      </div>

      <a href="https://wa.me/6281234567890" target="_blank" className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[60] flex items-center justify-center w-14 h-14 bg-[#4A5D4F] text-white rounded-full shadow-2xl hover:bg-[#3d4d41] hover:scale-105 transition-all duration-300 group border border-[#647a6a]" aria-label="Chat on WhatsApp">
        <MessageCircle className="w-7 h-7" />
        <div className="absolute right-full mr-4 bg-stone-900/90 backdrop-blur border border-stone-800 text-stone-200 text-[0.65rem] px-3 py-1.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-xl pointer-events-none uppercase tracking-widest font-medium">
          Chat with us
        </div>
      </a>
    </>
  );
}
