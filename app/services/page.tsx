import { Flower2, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';

export default function Services() {
  const categories = [
    {
      title: "Facial Treatments",
      note: "A free product is included with every facial.",
      items: [
        { name: "Timeless Facial", price: "Ksh 6,000" },
        { name: "Hydra Facial", price: "Ksh 10,000" },
        { name: "Royal Facial", price: "Ksh 10,000" },
        { name: "Chemical Peels", description: "TCA, Glycolic, Retinol, or Salicylic", price: "Ksh 10,000" },
        { name: "Glow Fusion Facial", price: "Ksh 12,000" },
        { name: "Oxygen Facial", price: "Ksh 15,000" },
        { name: "Collagen Peptide Facial", price: "Ksh 15,000" },
        { name: "Deep Treatment Facial", price: "Ksh 15,000" },
        { name: "Anti-Aging Facials", price: "Ksh 15,000" },
        { name: "Vitapharm Special", description: "Includes Glowfusion, back and leg massage, and a free product", price: "Ksh 16,000" },
        { name: "Pampering Facial", description: "Includes a back massage", price: "Ksh 18,000" },
      ]
    },
    {
      title: "Massage Therapies",
      items: [
        { name: "Back Massage", price: "Ksh 4,000 – 5,000" },
        { name: "Reflexology", price: "Ksh 5,000" },
        { name: "Soft Tissue Massage", price: "Ksh 5,000" },
        { name: "Deep Tissue Massage", price: "Ksh 8,000" },
      ]
    },
    {
      title: "Body & Advanced Treatments",
      items: [
        { name: "Body Scrub", price: "From Ksh 3,500" },
        { name: "Radio Frequency", price: "Ksh 5,000" },
        { name: "Body Treatments", price: "From Ksh 5,000" },
        { name: "LED Light Therapy", description: "Includes Blue Light (Acne), Red Light (Anti-aging), and Near Infrared (Healing)", price: "Ksh 8,000" },
        { name: "Acne Treatment", description: "For teens and adults", price: "From Ksh 12,000" },
        { name: "Pigmentation Treatment", price: "From Ksh 13,000" },
        { name: "IV Therapy", description: "For antioxidants, hydration, and pigmentation", price: "From Ksh 20,000" },
        { 
            name: "Advanced Skin Procedures", 
            subItems: [
                { name: "Microdermabrasion", price: "Ksh 4,500" },
                { name: "Mesotherapy", price: "From Ksh 15,000" },
                { name: "Microneedling", price: "Ksh 18,500" },
                { name: "PRP Microneedling", price: "Ksh 25,000" },
                { name: "Consultation Required", description: "Dermaplaning, PRP, Microchanneling, Fillers, and Botox", price: "Price on Consultation" },
            ]
        },
      ]
    },
    {
        title: "Waxing",
        items: [
            { name: "Armpits", price: "Ksh 700" },
            { name: "Bikini", price: "Ksh 2,000" },
            { name: "Body Waxing", price: "From Ksh 2,500" },
        ]
    },
    {
        title: "Consultations & Analysis",
        items: [
            { name: "Skin Aesthetician Consultation", price: "Ksh 1,000" },
            { name: "Skin Analysis", price: "Ksh 2,000" },
            { name: "Medical Consultation", description: "With a Skin Doctor or Dermatologist", price: "Ksh 3,500" },
        ]
    }
  ];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 selection:bg-[#4A5D4F] selection:text-white">
        {/* Fixed Background Layer */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <img src="https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=1600&q=80" alt="Background" className="w-full h-full object-cover grayscale" />
        <div className="absolute inset-0 bg-stone-950/80"></div>
      </div>

      <header className="fixed z-50 flex px-6 py-6 w-full items-center justify-between bg-gradient-to-b from-stone-950 via-stone-950/90 to-transparent">
        <Link href="/" className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="uppercase tracking-widest text-xs font-medium">Back to Home</span>
        </Link>
        <div className="flex items-center gap-2">
            <Flower2 className="h-6 w-6 text-stone-400" strokeWidth={1.2} />
            <span className="font-display text-lg tracking-tight text-white">
                Vitapharm
            </span>
        </div>
        <div className="w-[100px]"></div> {/* Spacer for balance */}
      </header>
      
      <div className="relative z-10 pt-32 pb-24 px-6 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto space-y-20">
            <div className="text-center space-y-4">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#8e9f92]">
                    Our Menu
                </span>
                <h1 className="font-serif-custom text-4xl md:text-6xl text-stone-100 font-light">
                    Treatment Services
                </h1>
                <p className="text-stone-400 font-light max-w-lg mx-auto leading-relaxed">
                    Aesthetics by Vitapharm Spa Clinic offers a range of aesthetic, therapeutic, and medical skincare services.
                </p>
            </div>

            <div className="space-y-16">
                {categories.map((category, idx) => (
                    <section key={idx} className="space-y-8">
                        <div className="flex items-end gap-6 border-b border-stone-800 pb-4">
                            <h2 className="font-serif-custom text-3xl text-stone-200">
                                {category.title}
                            </h2>
                            {category.note && (
                                <span className="text-xs text-[#8e9f92] uppercase tracking-wider pb-1.5 hidden md:block">
                                    * {category.note}
                                </span>
                            )}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                            {category.items.map((item, itemIdx) => (
                                <div key={itemIdx} className="group">
                                    <div className="flex justify-between items-baseline mb-2">
                                        <h3 className="text-lg font-light text-stone-300 group-hover:text-white transition-colors">
                                            {item.name}
                                        </h3>
                                        <div className="flex-1 mx-4 border-b border-stone-800 border-dashed opacity-30 group-hover:opacity-50 transition-opacity"></div>
                                        {item.price && (
                                            <span className="text-stone-400 font-serif-custom italic whitespace-nowrap">
                                                {item.price}
                                            </span>
                                        )}
                                    </div>
                                    {item.description && (
                                        <p className="text-sm text-stone-500 font-light leading-relaxed">
                                            {item.description}
                                        </p>
                                    )}
                                    {item.subItems && (
                                        <div className="mt-4 pl-4 border-l border-stone-800 space-y-4">
                                            {item.subItems.map((sub, subIdx) => (
                                                <div key={subIdx}>
                                                     <div className="flex justify-between items-baseline mb-1">
                                                        <h4 className="text-sm font-medium text-stone-400">
                                                            {sub.name}
                                                        </h4>
                                                        {sub.price && (
                                                            <span className="text-xs text-stone-500 font-serif-custom italic whitespace-nowrap ml-2">
                                                                {sub.price}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {sub.description && (
                                                        <p className="text-xs text-stone-600 font-light">
                                                            {sub.description}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
            
             <div className="bg-stone-900/50 border border-stone-800 p-8 text-center space-y-6 rounded-sm">
                <h3 className="font-serif-custom text-2xl text-stone-200">
                    Ready to book your appointment?
                </h3>
                 <p className="text-stone-400 font-light">
                  We require a 24-hour notice for cancellations.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                     <Link href="/book" className="px-8 py-3 bg-[#4A5D4F] text-white uppercase tracking-widest text-xs font-medium hover:bg-[#3d4d41] transition-colors rounded-sm">
                        Book Online
                    </Link>
                    <a href="https://wa.me/254718171253" className="px-8 py-3 border border-stone-700 text-stone-300 uppercase tracking-widest text-xs font-medium hover:border-stone-500 hover:text-white transition-colors rounded-sm">
                        Book via WhatsApp
                    </a>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
