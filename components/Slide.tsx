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

  // Expose global playback and interaction functions for internal studio designs
  useEffect(() => {
    if (isActive) {
      // Audio Playback logic
      const playAudio = async () => {
        if (!slide.audioData) return;
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }

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

      // Safety Fallbacks for AI-generated interaction functions
      const trackEnrollment = (lessonId: string, action: string, targetUrl?: string) => {
        console.log(`%c[Course Interaction] %c${action.toUpperCase()}%c: ${lessonId}`, "color: #6366f1; font-weight: bold", "color: #10b981; font-weight: bold", "color: #000");
        
        const performTracking = async () => {
          if (slide.webhookUrl) {
            try {
              await fetch(slide.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId, action, slideId: slide.id, timestamp: new Date().toISOString() })
              });
            } catch (err) {
              console.error("Webhook ping failed:", err);
            }
          }
          
          // If a target URL is provided and it's an enrollment action, navigate
          if (targetUrl && (action.toLowerCase().includes('enroll') || action.toLowerCase().includes('start'))) {
            window.open(targetUrl, '_blank');
          }
        };

        performTracking();
      };

      // Chatbot interaction fallbacks
      const sendQuickReply = (text: string) => {
        console.log(`%c[Chatbot] %cQuick Reply%c: ${text}`, "color: #10b981; font-weight: bold", "color: #f59e0b; font-weight: bold", "color: #000");
        if (slide.webhookUrl) {
          fetch(slide.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'quick_reply', message: text, slideId: slide.id })
          }).catch(console.error);
        }
      };

      const sendMessage = (text: string) => {
        console.log(`%c[Chatbot] %cMessage Sent%c: ${text}`, "color: #10b981; font-weight: bold", "color: #3b82f6; font-weight: bold", "color: #000");
        if (slide.webhookUrl) {
          fetch(slide.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'chat_message', message: text, slideId: slide.id })
          }).catch(console.error);
        }
      };

      // Attach to window
      (window as any).playMagazineAudio = playAudio;
      (window as any).trackEnrollment = trackEnrollment;
      (window as any).sendQuickReply = sendQuickReply;
      (window as any).sendMessage = sendMessage;
    }

    return () => {
      if (!isActive) {
        if (sourceNodeRef.current) {
          try {
            sourceNodeRef.current.stop();
          } catch(e) {}
        }
        setIsPlayingPodcast(false);
        delete (window as any).playMagazineAudio;
        delete (window as any).trackEnrollment;
        delete (window as any).sendQuickReply;
        delete (window as any).sendMessage;
      }
    };
  }, [isActive, slide.audioData, isPlayingPodcast, slide.webhookUrl, slide.id]);

  return (
    <div className="relative w-screen h-screen flex-shrink-0 snap-start bg-[#f8f8f8] overflow-hidden slide-enter">
      {/* Loading Placeholder */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#050505] z-20">
          <div className="flex flex-col items-center">
            <div className="w-24 h-[1px] bg-white/10 mb-6 overflow-hidden">
              <div className="h-full bg-white animate-[loading_2s_cubic-bezier(0.16,1,0.3,1)_infinite]"></div>
            </div>
            <p className="text-[9px] tracking-[0.6em] uppercase text-white/30 font-black">Decrypting {slide.title}</p>
          </div>
        </div>
      )}

      {/* Iframe / Internal Content Wrapper */}
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
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-30 pointer-events-none">
          <div className="max-w-2xl bg-white/95 backdrop-blur-2xl p-8 md:p-12 border-l-[8px] border-black shadow-[0_30px_100px_rgba(0,0,0,0.15)] transform translate-y-0 opacity-100 transition-all duration-700 ease-out pointer-events-auto relative animate-in fade-in slide-in-from-bottom-12">
            
            <button 
              onClick={onHideHud}
              className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-black/20 hover:text-black hover:bg-black/5 transition-all rounded-full"
              title="Hide all descriptions"
            >
              <span className="text-2xl font-light">×</span>
            </button>

            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-4">
                 <div className="w-3 h-[2px]" style={{ backgroundColor: slide.accentColor || '#000' }}></div>
                 <span className="text-[10px] font-black tracking-[0.4em] text-black/40 uppercase">
                  {slide.category} {slide.type === 'external' && slide.url ? `// ARCHIVE` : `// STUDIO EDITORIAL`}
                </span>
               </div>
               {slide.price && (
                 <span className="text-[10px] font-mono text-black/60 bg-black/5 px-3 py-1 rounded tracking-widest">{slide.price}</span>
               )}
            </div>

            <h3 className="text-4xl md:text-5xl font-serif font-black text-black mb-6 leading-[0.9] tracking-tighter italic">
              {slide.title}
            </h3>

            {slide.subtitle && (
               <p className="text-sm text-black/80 font-bold uppercase tracking-[0.2em] mb-4 leading-tight">
                 {slide.subtitle}
               </p>
            )}

            <p className="text-base md:text-lg text-black/70 leading-relaxed font-light italic mb-10 max-w-xl">
              {slide.description}
            </p>

            <div className="flex items-center gap-10">
              {slide.type === 'external' ? (
                <a 
                  href={slide.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group/link flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] font-black text-black"
                >
                  <span className="border-b border-black/20 group-hover/link:border-black transition-all">Launch Observation</span>
                  <span className="transform group-hover/link:translate-x-2 transition-transform">→</span>
                </a>
              ) : (
                <div className="flex items-center gap-6">
                  <div className="text-[9px] uppercase tracking-[0.5em] font-black text-black/20">Ref. Ed-Digital-01</div>
                  {slide.audioData && isPlayingPodcast && (
                    <div className="flex gap-1.5 items-end h-4">
                       <div className="w-1 bg-black/40 animate-pulse h-full"></div>
                       <div className="w-1 bg-black/40 animate-pulse h-3/4 delay-75"></div>
                       <div className="w-1 bg-black/40 animate-pulse h-1/2 delay-150"></div>
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