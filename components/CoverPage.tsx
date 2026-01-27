
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
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const StartButton = () => (
    <button 
      onClick={onStart}
      className="group relative px-10 py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] hover:text-white transition-all duration-500 border border-white overflow-hidden shadow-2xl active:scale-95 self-start"
    >
      <span className="relative z-10">Enter Publication</span>
      <div className="absolute inset-0 h-full w-0 transition-all duration-500 ease-out group-hover:w-full" style={{ backgroundColor: accentColor }}></div>
    </button>
  );

  const VideoBackground = () => {
    const videoId = backgroundVideoUrl ? getYouTubeId(backgroundVideoUrl) : null;
    if (!videoId) return null;
    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden opacity-40">
        <iframe
          className="absolute top-1/2 left-1/2 w-[110vw] h-[110vh] min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0`}
          frameBorder="0"
          allow="autoplay; encrypted-media"
        />
      </div>
    );
  };

  const LayoutBrutalist = () => (
    <div className="flex flex-col items-start justify-center h-full p-24 bg-white text-black overflow-hidden relative">
      <VideoBackground />
      {!backgroundVideoUrl && backgroundImageUrl && (
        <div className="absolute inset-0 bg-cover bg-center opacity-20 filter grayscale" style={{ backgroundImage: `url(${backgroundImageUrl})` }} />
      )}
      <div className="relative z-10 w-full max-w-5xl">
        <h1 className="text-[4rem] md:text-[6.5rem] font-black uppercase leading-[0.8] mb-12 tracking-tighter">
          {title.split(' ').map((word, i) => (
            <span key={i} className="block hover:text-white hover:bg-black px-2 -ml-2 transition-all duration-200">{word}</span>
          ))}
        </h1>
        <p className="text-xl md:text-3xl font-bold bg-black text-white p-8 max-w-2xl border-l-[16px] mb-12" style={{ borderColor: accentColor }}>{subtitle}</p>
        <StartButton />
      </div>
    </div>
  );

  const LayoutMinimal = () => (
    <div className="relative flex flex-col items-start justify-center h-full text-left p-16 md:p-32 bg-zinc-950 overflow-hidden">
      <VideoBackground />
      {!backgroundVideoUrl && backgroundImageUrl && (
        <div className="absolute inset-0 bg-cover bg-center opacity-40 scale-105" style={{ backgroundImage: `url(${backgroundImageUrl})` }} />
      )}
      <div className="max-w-4xl relative z-10">
        <h1 className="text-7xl md:text-[10rem] font-serif font-light mb-12 text-white tracking-tighter leading-[0.85] italic">{title}</h1>
        <p className="text-xl md:text-2xl text-zinc-400 mb-16 italic opacity-80 border-l border-white/10 pl-8">{subtitle}</p>
        <StartButton />
      </div>
    </div>
  );

  const LayoutClassic = () => (
    <div className="h-full flex flex-col p-20 bg-[#0a0a0a] relative overflow-hidden">
      <VideoBackground />
      {!backgroundVideoUrl && backgroundImageUrl && (
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${backgroundImageUrl})` }} />
      )}
      <div className="relative z-10 flex flex-col h-full">
        <div className="text-7xl font-serif italic font-black text-white mb-auto">WebMag.</div>
        <div className="max-w-4xl py-20">
          <h1 className="text-6xl md:text-9xl font-serif font-black text-white leading-[0.85] uppercase tracking-tighter mb-12">{title}</h1>
          <p className="text-2xl text-zinc-400 italic mb-12">{subtitle}</p>
          <StartButton />
        </div>
      </div>
    </div>
  );

  const LayoutGradient = () => (
    <div className="relative h-full flex flex-col items-start justify-center overflow-hidden bg-black p-32">
      <VideoBackground />
      {!backgroundVideoUrl && backgroundImageUrl && (
        <div className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay" style={{ backgroundImage: `url(${backgroundImageUrl})` }} />
      )}
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full filter blur-[140px]" style={{ backgroundColor: accentColor, opacity: 0.25 }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full filter blur-[140px]" style={{ backgroundColor: secondaryColor, opacity: 0.25 }}></div>
      </div>
      <div className="relative z-10 text-left max-w-5xl">
        <h1 className="text-7xl md:text-[11rem] font-serif font-black mb-10 leading-[0.8] tracking-tighter text-white">{title}</h1>
        <p className="text-2xl text-zinc-400 italic mb-16">{subtitle}</p>
        <StartButton />
      </div>
    </div>
  );

  const LayoutGrid = () => (
    <div className="h-full bg-[#080808] flex flex-col p-24 relative overflow-hidden">
      <VideoBackground />
      {!backgroundVideoUrl && backgroundImageUrl && (
        <div className="absolute inset-0 bg-cover bg-center opacity-20 filter grayscale" style={{ backgroundImage: `url(${backgroundImageUrl})` }} />
      )}
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none opacity-10">
        {Array.from({ length: 16 }).map((_, i) => <div key={i} className="border border-white/10"></div>)}
      </div>
      <div className="relative z-10 flex flex-col h-full justify-between">
        <h1 className="text-7xl md:text-[10rem] font-black text-white tracking-tighter uppercase">{title}</h1>
        <div className="max-w-xl">
          <p className="text-zinc-500 uppercase tracking-[0.4em] mb-12 text-[11px] font-black">{subtitle}</p>
          <StartButton />
        </div>
      </div>
    </div>
  );

  const LayoutHero = () => (
    <div className="relative h-full flex items-center justify-start p-32 bg-black overflow-hidden">
      <VideoBackground />
      {!backgroundVideoUrl && backgroundImageUrl && (
        <div className="absolute inset-0 bg-cover bg-center opacity-60 scale-110" style={{ backgroundImage: `url(${backgroundImageUrl})` }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
      <div className="relative z-10 max-w-4xl text-left">
        <h1 className="text-[5rem] md:text-[9rem] font-serif font-black text-white tracking-tighter leading-[0.85] mb-12">{title}</h1>
        <p className="text-2xl text-zinc-300 mb-16 italic border-l border-white/20 pl-10">{subtitle}</p>
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
      <div className="relative w-full lg:w-[70%] h-full overflow-hidden shadow-2xl z-20">
        {renderLayout()}
      </div>
      <div className="w-full lg:w-[30%] h-full z-10 p-14 bg-[#050505] border-l border-white/5 overflow-y-auto no-scrollbar">
        <h4 className="text-4xl font-serif italic text-white mb-8">Index</h4>
        <div className="space-y-4">
          {slides.map((s, i) => (
            <button key={s.id} onClick={() => onStartAtSlide(i)} className="w-full text-left group flex items-start gap-4 p-4 hover:bg-white/5 transition-all">
              <span className="text-[10px] font-black text-zinc-700">{(i+1).toString().padStart(2,'0')}</span>
              <div>
                <h5 className="text-xs font-bold uppercase tracking-widest text-zinc-300 group-hover:text-white">{s.title}</h5>
                <p className="text-[10px] text-zinc-500 line-clamp-1">{s.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoverPage;
