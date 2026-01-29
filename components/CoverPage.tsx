import React, { useEffect, useState } from 'react';
import { CoverConfig, WebsiteSlide } from '../types';

interface CoverPageProps {
  onStart: () => void;
  onStartAtSlide: (index: number) => void;
  config: CoverConfig;
  slides: WebsiteSlide[];
}

const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const CoverPage: React.FC<CoverPageProps> = ({ onStart, onStartAtSlide, config, slides }) => {
  const { layoutId, title, subtitle, accentColor, secondaryColor, backgroundImageUrl, backgroundVideoUrl } = config;

  const StartButton = () => (
    <button 
      onClick={onStart}
      className="group relative px-12 py-6 bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] hover:text-white transition-all duration-700 border border-white overflow-hidden shadow-2xl active:scale-95 self-start"
    >
      <span className="relative z-10">Read Publication</span>
      <div className="absolute inset-0 h-full w-0 transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) group-hover:w-full" style={{ backgroundColor: accentColor }}></div>
    </button>
  );

  const VideoBackground = () => {
    const videoId = backgroundVideoUrl ? getYouTubeId(backgroundVideoUrl) : null;
    if (!videoId) return null;
    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden opacity-30">
        <iframe
          className="absolute top-1/2 left-1/2 w-[115vw] h-[115vh] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0`}
          frameBorder="0"
          allow="autoplay; encrypted-media"
        />
      </div>
    );
  };

  const LayoutBrutalist = () => (
    <div className="flex flex-col items-start justify-center h-full p-12 md:p-24 bg-white text-black overflow-hidden relative">
      <VideoBackground />
      {!backgroundVideoUrl && backgroundImageUrl && (
        <div className="absolute inset-0 bg-cover bg-center opacity-10 filter grayscale brightness-50" style={{ backgroundImage: `url(${backgroundImageUrl})` }} />
      )}
      <div className="relative z-10 w-full max-w-5xl">
        <div className="mb-10 flex items-center gap-4">
          <span className="h-[2px] w-12 bg-black"></span>
          <span className="text-[10px] font-black uppercase tracking-[0.5em]">Issue 004 // Spring 2025</span>
        </div>
        <h1 className="text-[4.5rem] md:text-[8rem] font-serif font-black uppercase leading-[0.75] mb-12 tracking-tighter italic">
          {title.split(' ').map((word, i) => (
            <span key={i} className="block transition-all duration-200">{word}</span>
          ))}
        </h1>
        <p className="text-xl md:text-2xl font-light italic text-zinc-600 max-w-2xl mb-12 leading-relaxed">{subtitle}</p>
        <StartButton />
      </div>
    </div>
  );

  const LayoutMinimal = () => (
    <div className="relative flex flex-col items-start justify-center h-full text-left p-12 md:p-32 bg-zinc-950 overflow-hidden">
      <VideoBackground />
      {!backgroundVideoUrl && backgroundImageUrl && (
        <div className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 filter saturate-0" style={{ backgroundImage: `url(${backgroundImageUrl})` }} />
      )}
      <div className="max-w-4xl relative z-10">
        <div className="mb-12 text-white/40 font-mono text-[9px] uppercase tracking-[0.8em]">The Digital Monograph</div>
        <h1 className="text-7xl md:text-[11rem] font-serif font-light mb-12 text-white tracking-tighter leading-[0.8] italic">{title}</h1>
        <div className="w-24 h-[1px] bg-white/20 mb-12"></div>
        <p className="text-xl md:text-2xl text-zinc-400 mb-16 italic font-light leading-relaxed max-w-2xl">{subtitle}</p>
        <StartButton />
      </div>
    </div>
  );

  const LayoutClassic = () => (
    <div className="h-full flex flex-col p-12 md:p-24 bg-[#0a0a0a] relative overflow-hidden">
      <VideoBackground />
      {!backgroundVideoUrl && backgroundImageUrl && (
        <div className="absolute inset-0 bg-cover bg-center opacity-30 scale-110 blur-[2px]" style={{ backgroundImage: `url(${backgroundImageUrl})` }} />
      )}
      <div className="relative z-10 flex flex-col h-full">
        <div className="text-6xl font-serif italic font-black text-white mb-auto tracking-tighter">WebMag.</div>
        <div className="max-w-4xl py-20">
          <h1 className="text-6xl md:text-[10rem] font-serif font-black text-white leading-[0.8] uppercase tracking-tighter mb-12 break-words">{title}</h1>
          <p className="text-2xl text-zinc-400 italic mb-12 font-light">{subtitle}</p>
          <StartButton />
        </div>
      </div>
    </div>
  );

  const LayoutGradient = () => (
    <div className="relative h-full flex flex-col items-start justify-center overflow-hidden bg-black p-12 md:p-32">
      <VideoBackground />
      {!backgroundVideoUrl && backgroundImageUrl && (
        <div className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay scale-125 rotate-3" style={{ backgroundImage: `url(${backgroundImageUrl})` }} />
      )}
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-20%] w-[90%] h-[90%] rounded-full filter blur-[160px]" style={{ backgroundColor: accentColor, opacity: 0.2 }}></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[90%] h-[90%] rounded-full filter blur-[160px]" style={{ backgroundColor: secondaryColor, opacity: 0.2 }}></div>
      </div>
      <div className="relative z-10 text-left max-w-5xl">
        <div className="mb-10 px-4 py-1 border border-white/20 inline-block">
          <span className="text-[9px] font-black uppercase tracking-[0.6em] text-white/60">Digital Curatorial Board</span>
        </div>
        <h1 className="text-7xl md:text-[12rem] font-serif font-black mb-10 leading-[0.75] tracking-tighter text-white italic">{title}</h1>
        <p className="text-2xl text-zinc-400 italic mb-16 font-light max-w-2xl">{subtitle}</p>
        <StartButton />
      </div>
    </div>
  );

  const LayoutGrid = () => (
    <div className="h-full bg-[#080808] flex flex-col p-12 md:p-24 relative overflow-hidden">
      <VideoBackground />
      {!backgroundVideoUrl && backgroundImageUrl && (
        <div className="absolute inset-0 bg-cover bg-center opacity-20 filter grayscale" style={{ backgroundImage: `url(${backgroundImageUrl})` }} />
      )}
      <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 pointer-events-none opacity-10">
        {Array.from({ length: 36 }).map((_, i) => <div key={i} className="border border-white/5"></div>)}
      </div>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
           <div className="text-white font-black text-4xl mb-8">W.M.</div>
           <h1 className="text-7xl md:text-[11rem] font-black text-white tracking-tighter uppercase leading-[0.8]">{title}</h1>
        </div>
        <div className="max-w-xl">
          <p className="text-zinc-500 uppercase tracking-[0.6em] mb-12 text-[10px] font-black leading-relaxed">{subtitle}</p>
          <StartButton />
        </div>
      </div>
    </div>
  );

  const LayoutHero = () => (
    <div className="relative h-full flex items-center justify-start p-12 md:p-32 bg-black overflow-hidden">
      <VideoBackground />
      {!backgroundVideoUrl && backgroundImageUrl && (
        <div className="absolute inset-0 bg-cover bg-center opacity-60 scale-105" style={{ backgroundImage: `url(${backgroundImageUrl})` }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
      <div className="relative z-10 max-w-4xl text-left">
        <span className="text-white/40 text-[10px] uppercase tracking-[1em] mb-8 block">Ref. Arch-Digital</span>
        <h1 className="text-[5.5rem] md:text-[10rem] font-serif font-black text-white tracking-tighter leading-[0.75] mb-12 italic">{title}</h1>
        <p className="text-2xl text-zinc-300 mb-16 font-light italic border-l-[3px] border-white/20 pl-12 max-w-2xl leading-relaxed">{subtitle}</p>
        <StartButton />
      </div>
    </div>
  );

  const renderLayout = () => {
    switch (layoutId) {
      case 'minimal': return <LayoutMinimal />;
      case 'brutalist': return <LayoutBrutalist />;
      case 'classic': return <LayoutClassic />;
      case 'gradient': return <LayoutGradient />;
      case 'grid': return <LayoutGrid />;
      case 'hero': return <LayoutHero />;
      default: return <LayoutGradient />;
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col lg:flex-row bg-[#050505] overflow-hidden">
      {/* Magazine Cover Left */}
      <div className="relative w-full lg:w-[65%] h-full overflow-hidden shadow-[30px_0_60px_rgba(0,0,0,0.5)] z-20">
        {renderLayout()}
      </div>

      {/* Editorial Index Right */}
      <div className="w-full lg:w-[35%] h-full z-10 p-12 md:p-20 bg-[#050505] overflow-y-auto no-scrollbar border-l border-white/5">
        <header className="mb-16 border-b border-white/10 pb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600 block mb-4">Table of Contents</span>
          <h4 className="text-5xl font-serif italic text-white tracking-tighter">In This Issue.</h4>
        </header>

        <div className="space-y-12">
          {slides.map((s, i) => (
            <button 
              key={s.id} 
              onClick={() => onStartAtSlide(i)} 
              className="w-full text-left group flex items-start gap-8 transition-all hover:pl-2"
            >
              <span className="text-2xl font-serif italic text-zinc-800 group-hover:text-white transition-colors">
                {(i+1).toString().padStart(2,'0')}
              </span>
              <div className="flex-1 border-b border-white/5 pb-8 group-last:border-none">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 group-hover:text-white transition-colors">{s.category}</h5>
                  <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">{s.type === 'external' ? 'Link' : 'Studio'}</span>
                </div>
                <h6 className="text-2xl font-serif font-bold text-white mb-3 group-hover:italic transition-all">{s.title}</h6>
                <p className="text-[10px] text-zinc-600 leading-relaxed italic line-clamp-2 uppercase tracking-wider font-light">{s.description}</p>
              </div>
            </button>
          ))}
        </div>

        <footer className="mt-20 pt-12 border-t border-white/10 opacity-30">
          <div className="flex justify-between items-center">
             <span className="text-[8px] uppercase tracking-[0.5em] font-black text-white">Digital Archival Board</span>
             <span className="text-[8px] uppercase tracking-[0.5em] font-black text-white">Est. 2025</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CoverPage;