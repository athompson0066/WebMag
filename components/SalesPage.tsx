
import React from 'react';

interface SalesPageProps {
  onClose: () => void;
  accentColor: string;
}

const SalesPage: React.FC<SalesPageProps> = ({ onClose, accentColor }) => {
  return (
    <div className="fixed inset-0 z-[110] bg-white text-zinc-900 font-sans selection:bg-black selection:text-white overflow-y-auto admin-scroll">
      <button 
        onClick={onClose}
        className="fixed top-8 right-8 z-[120] w-12 h-12 flex items-center justify-center bg-black text-white rounded-full hover:scale-110 transition-transform shadow-2xl"
      >
        <span className="text-2xl font-light">×</span>
      </button>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Visual Side */}
        <div className="w-full lg:w-1/2 bg-zinc-100 p-12 lg:p-24 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none">
            <div className="text-[40rem] font-black leading-none absolute -top-20 -right-20 rotate-12 select-none">LIST</div>
          </div>
          
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-400 mb-8 block">Partnership Opportunity</span>
            <h2 className="text-6xl lg:text-9xl font-serif font-black italic tracking-tighter leading-none mb-12">
              Your Brand, <br/> Curated.
            </h2>
          </div>

          <div className="relative z-10">
            <div className="h-[3px] w-24 mb-12" style={{ backgroundColor: accentColor }}></div>
            <p className="text-xl lg:text-3xl font-light leading-relaxed text-zinc-600 max-w-md italic">
              Stop being just another tab. Become a destination in our premium digital showcase.
            </p>
          </div>
        </div>

        {/* Content Side */}
        <div className="w-full lg:w-1/2 p-12 lg:p-24 flex flex-col justify-center bg-white border-l border-zinc-100">
          <div className="max-w-md space-y-16">
            <section>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8" style={{ color: accentColor }}>The Value Proposition</h3>
              <div className="space-y-10">
                <div className="flex gap-8">
                  <span className="text-3xl font-serif italic text-zinc-200">01</span>
                  <div>
                    <h4 className="font-bold text-xl mb-3 uppercase tracking-tight">Elite Visibility</h4>
                    <p className="text-zinc-500 text-sm leading-relaxed">Place your brand alongside industry leaders in a high-fidelity, distraction-free environment that demands attention and respect.</p>
                  </div>
                </div>
                <div className="flex gap-8">
                  <span className="text-3xl font-serif italic text-zinc-200">02</span>
                  <div>
                    <h4 className="font-bold text-xl mb-3 uppercase tracking-tight">Seamless Discovery</h4>
                    <p className="text-zinc-500 text-sm leading-relaxed">Our magazine interface bridges the gap between searching and experiencing, turning casual browsers into engaged customers.</p>
                  </div>
                </div>
                <div className="flex gap-8">
                  <span className="text-3xl font-serif italic text-zinc-200">03</span>
                  <div>
                    <h4 className="font-bold text-xl mb-3 uppercase tracking-tight">Editorial Context</h4>
                    <p className="text-zinc-500 text-sm leading-relaxed">Leverage our professional authority. When you're in the issue, you're not just a link—you're a featured artifact in a wider narrative.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-zinc-50 p-12 border border-zinc-100 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: accentColor }}></div>
              <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-4">Secure Your Placement</h3>
              <p className="text-sm text-zinc-500 mb-10 leading-relaxed italic">Our curators review every submission to ensure the highest quality experience for our readers. We look for design excellence and niche authority.</p>
              
              <div className="space-y-4">
                <button className="w-full bg-black text-white py-6 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all shadow-xl active:scale-95">
                  Submit Your Website
                </button>
                <p className="text-center text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Standard Review: 24-48 Hours</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;
