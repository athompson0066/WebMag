
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, WebsiteSlide, CoverConfig } from './types';
import { curateMagazineIssue } from './services/geminiService';
import { 
  fetchSlidesFromSupabase, 
  saveSlideToSupabase, 
  removeSlideFromSupabase, 
  saveMultipleSlidesToSupabase 
} from './services/supabaseService';
import CoverPage from './components/CoverPage';
import Slide from './components/Slide';
import AdminPanel from './components/AdminPanel';
import SalesPage from './components/SalesPage';

const DEFAULT_COVER: CoverConfig = {
  layoutId: 'gradient',
  title: 'Infinite Digital Horizon',
  subtitle: 'Curating the most influential corners of the web into a seamless sensory experience.',
  accentColor: '#6366f1',
  secondaryColor: '#3b82f6'
};

const INITIAL_SLIDES: WebsiteSlide[] = [
  {
    id: '1',
    type: 'external',
    url: 'https://www.wikipedia.org',
    title: 'The Sum of All Knowledge',
    description: 'Exploring the vast repository of human collaboration. Wikipedia serves as the backbone of open information in the digital age.',
    category: 'Information',
    accentColor: '#FFFFFF'
  },
  {
    id: '2',
    type: 'external',
    url: 'https://news.ycombinator.com',
    title: 'Technological Frontier',
    description: 'The pulse of the tech industry. Where builders, thinkers, and disruptors share the future of software and society.',
    category: 'Technology',
    accentColor: '#FF6600'
  },
  {
    id: '3',
    type: 'internal',
    title: 'Design as Infrastructure',
    description: 'A masterclass in modern web aesthetics and functional elegance. How design shapes the global financial operating system.',
    category: 'Design',
    accentColor: '#635BFF',
    content: `
      <div class="min-h-full bg-zinc-950 text-white px-8 md:px-24 py-24 font-serif">
        <div class="max-w-2xl">
          <h1 class="text-8xl font-black italic tracking-tighter mb-10">Editorial <br/> Structure.</h1>
          <p class="text-2xl text-zinc-400 mb-12 leading-relaxed">This page was designed directly in the Magazine Studio. No iframes, just pure code.</p>
          <div class="h-1 w-24 bg-indigo-500 mb-12"></div>
          <div class="grid grid-cols-2 gap-8 text-sm text-zinc-500 uppercase tracking-widest font-black">
            <div>
              <p class="mb-4 text-white">Direct Interaction</p>
              <p>Fully responsive elements using Tailwind utility classes.</p>
            </div>
            <div>
              <p class="mb-4 text-white">Integrated Layout</p>
              <p>Seamless transitions between curated sites and original content.</p>
            </div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: '4',
    type: 'external',
    url: 'https://css-tricks.com',
    title: 'The Art of the Web',
    description: 'Crafting pixel-perfect experiences. An essential guide for those who treat the browser as their canvas.',
    category: 'Development',
    accentColor: '#FF7F50'
  }
];

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.COVER);
  const [slides, setSlides] = useState<WebsiteSlide[]>(INITIAL_SLIDES);
  const [coverConfig, setCoverConfig] = useState<CoverConfig>(DEFAULT_COVER);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showHud, setShowHud] = useState(true);
  const [showSequenceDropdown, setShowSequenceDropdown] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSequenceDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function init() {
      const supabaseSlides = await fetchSlidesFromSupabase();
      if (supabaseSlides && supabaseSlides.length > 0) {
        setSlides(supabaseSlides);
      }
    }
    init();
  }, []);

  const handleStart = () => {
    setAppState(AppState.READING);
    setCurrentIndex(0);
  };

  const scrollToIndex = useCallback((index: number) => {
    if (!scrollContainerRef.current) return;
    const width = scrollContainerRef.current.clientWidth;
    scrollContainerRef.current.scrollTo({
      left: index * width,
      behavior: 'smooth'
    });
  }, []);

  const handleStartAtSlide = (index: number) => {
    if (appState === AppState.READING) {
      scrollToIndex(index);
    } else {
      setCurrentIndex(index);
      setAppState(AppState.READING);
    }
    setShowSequenceDropdown(false);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPos = container.scrollLeft;
    const width = container.clientWidth;
    if (width === 0) return;
    const newIndex = Math.round(scrollPos / width);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  useEffect(() => {
    if (appState === AppState.READING && scrollContainerRef.current) {
      const width = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollLeft = currentIndex * width;
    }
  }, [appState]);

  const goToNext = () => {
    if (currentIndex < slides.length) { 
      scrollToIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      scrollToIndex(currentIndex - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (appState !== AppState.READING) return;
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'h' || e.key === 'H') setShowHud(prev => !prev);
      if (e.key === 'Escape') {
        setShowSequenceDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState, currentIndex, slides.length]);

  const onCurate = async (topic: string, count: number, sourceUrl?: string, instructions?: string) => {
    const newSlides = await curateMagazineIssue(topic, count, sourceUrl, instructions);
    if (newSlides && newSlides.length > 0) {
      const updatedSlides = [...slides, ...newSlides];
      setSlides(updatedSlides);
      await saveMultipleSlidesToSupabase(updatedSlides);
    }
  };

  const handleReorderSlides = async (newSlides: WebsiteSlide[]) => {
    setSlides(newSlides);
    await saveMultipleSlidesToSupabase(newSlides);
  };

  const addManualSlide = async (slide: WebsiteSlide) => {
    const updated = [...slides, slide];
    setSlides(updated);
    await saveSlideToSupabase(slide);
  };

  const updateManualSlide = async (updatedSlide: WebsiteSlide) => {
    const updated = slides.map(s => s.id === updatedSlide.id ? updatedSlide : s);
    setSlides(updated);
    await saveSlideToSupabase(updatedSlide);
  };

  const removeSlide = async (id: string) => {
    const updated = slides.filter(s => s.id !== id);
    setSlides(updated);
    await removeSlideFromSupabase(id);
  };

  const isAtEnd = currentIndex === slides.length;
  const isAtStart = currentIndex === 0;

  return (
    <div className="w-screen h-screen overflow-hidden bg-black font-sans selection:bg-white selection:text-black">
      {/* Universal Header */}
      {appState !== AppState.COVER && (
        <>
          <div className="fixed top-0 left-0 w-full px-6 py-3 z-50 flex justify-between items-center bg-zinc-900/90 backdrop-blur-md border-b border-white/10 shadow-2xl transition-all duration-500">
            <div className="flex items-center gap-6">
              <div className="flex gap-1.5 px-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-[0_0_8px_rgba(255,95,87,0.4)]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-[0_0_8px_rgba(254,188,46,0.4)]"></div>
                <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-[0_0_8px_rgba(40,200,64,0.4)]"></div>
              </div>

              <div className="hidden sm:block text-[10px] font-black uppercase tracking-[0.4em] text-white border-l border-white/10 pl-6 ml-2 whitespace-nowrap">
                {coverConfig.title}
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setAppState(AppState.COVER)}
                  className="group flex items-center gap-2 text-[10px] tracking-[0.3em] font-bold text-white uppercase px-4 py-2 border border-white/10 hover:bg-white hover:text-black transition-all bg-black/20"
                >
                  <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
                  Cover
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
               <button 
                  onClick={() => setAppState(AppState.SALES)}
                  className="hidden md:flex items-center gap-2 text-[9px] tracking-[0.3em] font-black text-amber-400 uppercase px-5 py-2.5 border border-amber-400/30 hover:bg-amber-400 hover:text-black transition-all bg-amber-400/5 mr-2"
                >
                  List Your Business
                </button>

               <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setShowSequenceDropdown(!showSequenceDropdown)}
                    className={`flex items-center gap-3 text-[10px] tracking-[0.2em] font-bold text-white uppercase px-4 py-2 border transition-all ${showSequenceDropdown ? 'bg-white text-black border-white' : 'bg-black/20 border-white/10 hover:border-white/30'}`}
                  >
                    <span>Menu</span>
                    <span className={`text-[8px] transition-transform duration-300 ${showSequenceDropdown ? 'rotate-180' : ''}`}>▼</span>
                  </button>

                  {showSequenceDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-72 md:w-80 bg-zinc-950 border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.9)] z-[60] overflow-hidden flex flex-col max-h-[80vh]">
                      <div className="p-5 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                        <span className="text-[9px] tracking-[0.4em] uppercase text-zinc-500 font-black">Issue Navigation</span>
                      </div>
                      <div className="overflow-y-auto admin-scroll p-2 flex-1">
                        {slides.map((slide, i) => (
                          <button
                            key={slide.id}
                            onClick={() => handleStartAtSlide(i)}
                            className={`w-full text-left p-4 flex gap-4 hover:bg-white/[0.05] transition-colors group ${currentIndex === i ? 'bg-white/[0.03]' : ''}`}
                          >
                            <span className={`text-[10px] font-black mt-1 transition-colors ${currentIndex === i ? 'text-white' : 'text-zinc-700 group-hover:text-zinc-400'}`}>
                              {(i + 1).toString().padStart(2, '0')}
                            </span>
                            <div className="min-w-0">
                              <h4 className={`text-[11px] font-bold uppercase tracking-wider truncate mb-1 ${currentIndex === i ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                                {slide.title}
                              </h4>
                              <p className="text-[9px] text-zinc-600 uppercase tracking-widest">{slide.category}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

               <button 
                 onClick={() => setShowHud(!showHud)}
                 className={`text-[10px] tracking-[0.3em] font-bold uppercase px-4 py-2 border border-white/10 transition-all bg-black/20 ${showHud ? 'text-zinc-400 hover:text-white' : 'text-white bg-white/10 border-white/40'}`}
               >
                 {showHud ? 'Hide Info' : 'Show Info'}
               </button>
               <button 
                 onClick={() => setAppState(AppState.ADMIN)}
                 className="text-[10px] tracking-[0.3em] font-bold text-white uppercase px-4 py-2 border border-white/10 hover:border-white transition-all bg-black/20 hover:bg-white/10"
               >
                 Admin
               </button>
            </div>
          </div>
        </>
      )}

      {/* Navigation Controls (Floating) */}
      {appState === AppState.READING && (
        <>
          <button 
            onClick={goToPrev}
            disabled={isAtStart}
            className={`fixed left-6 top-1/2 -translate-y-1/2 z-[55] w-14 h-14 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/50 hover:text-white hover:border-white/40 transition-all ${isAtStart ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            title="Previous Page"
          >
            <span className="text-2xl font-light">‹</span>
          </button>
          <button 
            onClick={goToNext}
            disabled={isAtEnd}
            className={`fixed right-6 top-1/2 -translate-y-1/2 z-[55] w-14 h-14 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white/50 hover:text-white hover:border-white/40 transition-all ${isAtEnd ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            title="Next Page"
          >
            <span className="text-2xl font-light">›</span>
          </button>
        </>
      )}

      {/* View State Rendering */}
      {appState === AppState.ADMIN && (
        <AdminPanel 
          slides={slides} 
          coverConfig={coverConfig}
          onAddSlide={addManualSlide} 
          onUpdateSlide={updateManualSlide}
          onRemoveSlide={removeSlide}
          onUpdateCover={setCoverConfig}
          onCurate={onCurate}
          onReorderSlides={handleReorderSlides}
          onClose={() => setAppState(AppState.READING)}
        />
      )}

      {appState === AppState.SALES && (
        <SalesPage 
          onClose={() => setAppState(AppState.READING)}
          accentColor={coverConfig.accentColor}
        />
      )}

      {appState === AppState.COVER ? (
        <CoverPage 
          onStart={handleStart} 
          onStartAtSlide={handleStartAtSlide}
          config={coverConfig}
          slides={slides}
        />
      ) : (
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={`w-full h-full flex overflow-x-scroll snap-x snap-mandatory no-scrollbar scroll-smooth transition-opacity duration-700 ${appState === AppState.SALES ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}
        >
          {slides.map((slide, index) => (
            <Slide 
              key={`${slide.id}-${index}`} 
              slide={slide} 
              isActive={Math.abs(currentIndex - index) <= 1} 
              showHud={showHud}
              onHideHud={() => setShowHud(false)}
            />
          ))}

          <div className="w-screen h-screen flex-shrink-0 snap-start flex flex-col items-center justify-center bg-zinc-950 text-white p-12 text-center pt-24">
            <div className="max-w-md animate-slide-up">
              <div className="w-16 h-16 rounded-full border border-white/20 mb-10 flex items-center justify-center text-xs font-serif italic mx-auto">Fin</div>
              <h2 className="text-5xl font-serif font-black mb-6 tracking-tighter">Issue Complete.</h2>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => setAppState(AppState.ADMIN)}
                  className="bg-white text-black px-12 py-6 font-black tracking-[0.3em] uppercase text-[10px] hover:bg-zinc-200 transition-colors shadow-2xl"
                >
                  Open Designer Studio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {appState === AppState.READING && (
        <div className="fixed bottom-0 left-0 w-full h-1 bg-white/5 z-50">
          <div 
            className="h-full bg-white/40 transition-all duration-300 ease-out"
            style={{ width: `${((currentIndex + 1) / (slides.length + 1)) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default App;
