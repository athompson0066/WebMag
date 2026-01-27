
import React, { useState, useEffect, useRef } from 'react';
import { WebsiteSlide } from '../types';

interface SlideProps {
  slide: WebsiteSlide;
  isActive: boolean;
  showHud: boolean;
  onHideHud: () => void;
}

// Helper functions for raw PCM decoding as per guidelines
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const Slide: React.FC<SlideProps> = ({ slide, isActive, showHud, onHideHud }) => {
  const [isLoading, setIsLoading] = useState(slide.type === 'external');
  const [isPlayingPodcast, setIsPlayingPodcast] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (slide.type === 'internal') {
      setIsLoading(false);
    }
  }, [slide.type]);

  // Expose global playback function for internal studio designs (podcasts)
  useEffect(() => {
    if (isActive && slide.audioData) {
      const playAudio = async () => {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }

        // Resume context if it was suspended (common browser behavior)
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        if (isPlayingPodcast) {
          sourceNodeRef.current?.stop();
          setIsPlayingPodcast(false);
          return;
        }

        try {
          const rawBytes = decodeBase64(slide.audioData!);
          const audioBuffer = await decodeAudioData(rawBytes, audioContextRef.current, 24000, 1);
          
          const source = audioContextRef.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContextRef.current.destination);
          
          source.onended = () => {
            setIsPlayingPodcast(false);
          };
          
          source.start();
          sourceNodeRef.current = source;
          setIsPlayingPodcast(true);
        } catch (err) {
          console.error("Playback failed:", err);
          setIsPlayingPodcast(false);
        }
      };

      // Ensure the function is attached to window so it can be called from onclick in dangerouslySetInnerHTML
      (window as any).playMagazineAudio = playAudio;
    }

    return () => {
      // Don't stop audio immediately on metadata change if we want it to persist,
      // but usually for a slide show, we clean up when the component unmounts or becomes inactive.
      if (!isActive) {
        if (sourceNodeRef.current) {
          try {
            sourceNodeRef.current.stop();
          } catch(e) {}
        }
        setIsPlayingPodcast(false);
        delete (window as any).playMagazineAudio;
      }
    };
  }, [isActive, slide.audioData, isPlayingPodcast]);

  return (
    <div className="relative w-screen h-screen flex-shrink-0 snap-start bg-zinc-900 overflow-hidden">
      {/* Loading Placeholder */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
          <div className="flex flex-col items-center">
            <div className="w-16 h-1 bg-zinc-800 mb-4 overflow-hidden">
              <div className="h-full bg-white animate-[loading_1.5s_ease-in-out_infinite]"></div>
            </div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-zinc-500">Curating {slide.title}</p>
          </div>
        </div>
      )}

      {/* 
          Iframe / Internal Content Wrapper 
          We make the inner container slightly wider than the viewport to hide the scrollbar track 
          while preserving the ability to scroll through the content.
      */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pt-[64px]">
        {isActive && (
          <div className="w-full h-full overflow-y-auto no-scrollbar">
            {slide.type === 'internal' ? (
              <div 
                className={`w-full min-h-full transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                dangerouslySetInnerHTML={{ __html: slide.content || '' }} 
              />
            ) : (
              <div className="w-full h-full overflow-hidden">
                <iframe
                  src={slide.url}
                  title={slide.title}
                  style={{ width: 'calc(100% + 20px)', height: '100%', border: 'none' }}
                  className={`transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={() => setIsLoading(false)}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Magazine HUD / Overlay */}
      {showHud && (
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 z-30 pointer-events-none">
          <div className="max-w-xl bg-black/40 backdrop-blur-xl p-8 border-l-[6px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform translate-y-0 opacity-100 transition-all duration-1000 ease-out pointer-events-auto group relative">
            {/* Close Button */}
            <button 
              onClick={onHideHud}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all rounded-full"
              title="Hide all descriptions"
            >
              <span className="text-xl font-light leading-none">×</span>
            </button>

            <div className="flex items-center gap-3 mb-3 pr-8">
               <div className="w-2 h-2 rounded-full" style={{ backgroundColor: slide.accentColor || '#fff' }}></div>
               <span className="text-[10px] font-black tracking-[0.3em] text-white/50 uppercase">
                {slide.category} {slide.type === 'external' && slide.url ? `// ${new URL(slide.url).hostname}` : '// Internal Design'}
              </span>
            </div>
            <h3 className="text-3xl md:text-4xl font-serif font-black text-white mb-4 leading-none tracking-tighter">
              {slide.title}
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed font-light italic mb-6">
              {slide.description}
            </p>
            <div className="flex items-center gap-6">
              {slide.type === 'external' ? (
                <a 
                  href={slide.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group/link flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-black text-white"
                >
                  <span className="border-b border-white/20 group-hover/link:border-white transition-all">Launch Original</span>
                  <span className="transform group-hover/link:translate-x-1 transition-transform">→</span>
                </a>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="text-[8px] uppercase tracking-[0.4em] font-black text-white/30">Editorial Studio Design</div>
                  {slide.audioData && isPlayingPodcast && (
                    <div className="flex gap-1 items-end h-3">
                       <div className="w-1 bg-white/40 animate-pulse h-full"></div>
                       <div className="w-1 bg-white/40 animate-pulse h-2/3 delay-75"></div>
                       <div className="w-1 bg-white/40 animate-pulse h-1/2 delay-150"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Slide;
