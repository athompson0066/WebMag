import React, { useState, useRef, useEffect } from 'react';
import { WebsiteSlide, CoverConfig, ListicleItem, ListicleData } from '../types';
import { 
  generateStudioLayout, 
  researchAndDesignFeature, 
  generatePodcast, 
  researchAndDesignVideoGallery,
  researchAndDesignProductGallery,
  researchAndDesignChatbotCrew,
  researchAndDesignCourseCrew,
  researchAndDesignBlogCrew,
  researchAndDesignAdCrew,
  researchAndDesignListicleCrew,
  researchAndDesignMiniAppCrew,
  researchAndDesignLeadGenCrew,
  researchAndDesignVideoStoryCrew,
  generateListicleHtml
} from '../services/geminiService';

interface AdminPanelProps {
  slides: WebsiteSlide[];
  coverConfig: CoverConfig;
  onAddSlide: (slide: WebsiteSlide) => void;
  onUpdateSlide: (slide: WebsiteSlide) => void;
  onRemoveSlide: (id: string) => void;
  onUpdateCover: (config: CoverConfig) => void;
  onCurate: (topic: string, count: number, sourceUrl?: string, instructions?: string) => Promise<void>;
  onReorderSlides: (newSlides: WebsiteSlide[]) => void;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  slides, coverConfig, onAddSlide, onUpdateSlide, onRemoveSlide, 
  onUpdateCover, onCurate, onReorderSlides, onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'pages' | 'covers'>('pages');
  const [studioMode, setStudioMode] = useState<'manual' | 'crew' | 'listicle_editor'>('crew');
  const [crewMode, setCrewMode] = useState<'layout' | 'research' | 'podcast' | 'videoGallery' | 'videoStory' | 'productGallery' | 'chatbot' | 'course' | 'blog' | 'ad' | 'listicle' | 'miniApp' | 'leadGen'>('layout');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);

  const menuScrollRef = useRef<HTMLDivElement>(null);

  // Common UI State for Generations
  const [genTopic, setGenTopic] = useState('');
  const [genImageUrl, setGenImageUrl] = useState('');
  const [genBrief, setGenBrief] = useState('');
  const [genRawContent, setGenRawContent] = useState('');
  
  // Specific States
  const [videoStoryUrl, setVideoStoryUrl] = useState('');
  const [podcastMode, setPodcastMode] = useState<'solo' | 'duo'>('duo');

  // Intelligence Sources
  const [scrapingUrls, setScrapingUrls] = useState<string[]>(['']);
  const [sheetUrls, setSheetUrls] = useState<string[]>(['']);
  const [driveUrls, setDriveUrls] = useState<string[]>(['']);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [googleSheetSubmissionUrl, setGoogleSheetSubmissionUrl] = useState('');

  const [isDesigning, setIsDesigning] = useState(false);
  const [formState, setFormState] = useState<Partial<WebsiteSlide>>({
    url: '', content: '', type: 'external', title: '', subtitle: '', description: '', category: 'General', accentColor: '#ffffff', webhookUrl: '', googleSheetSubmissionUrl: '', price: ''
  });

  const addListicleItem = () => {
    const newItem: ListicleItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Gallery Artifact',
      description: 'Artifact description...',
      imageUrl: '',
      link: '',
      price: ''
    };
    const currentData = formState.listicleData || { items: [] };
    setFormState({
      ...formState,
      listicleData: {
        ...currentData,
        items: [...currentData.items, newItem]
      }
    });
  };

  const removeListicleItem = (id: string) => {
    if (!formState.listicleData) return;
    setFormState({
      ...formState,
      listicleData: {
        ...formState.listicleData,
        items: formState.listicleData.items.filter(item => item.id !== id)
      }
    });
  };

  const updateListicleItem = (id: string, updates: Partial<ListicleItem>) => {
    if (!formState.listicleData) return;
    setFormState({
      ...formState,
      listicleData: {
        ...formState.listicleData,
        items: formState.listicleData.items.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      }
    });
  };

  const moveListicleItem = (index: number, direction: 'up' | 'down') => {
    if (!formState.listicleData) return;
    const items = [...formState.listicleData.items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    
    [items[index], items[targetIndex]] = [items[targetIndex], items[index]];
    
    setFormState({
      ...formState,
      listicleData: {
        ...formState.listicleData,
        items
      }
    });
  };

  useEffect(() => {
    if (studioMode === 'listicle_editor' && formState.listicleData && formState.title) {
      const newHtml = generateListicleHtml(formState.title, formState.listicleData);
      setFormState(prev => ({ ...prev, content: newHtml }));
    }
  }, [formState.listicleData, formState.title, studioMode]);

  const handleEdit = (slide: WebsiteSlide) => {
    setEditingId(slide.id);
    setFormState({ ...slide });
    setWebhookUrl(slide.webhookUrl || '');
    setGoogleSheetSubmissionUrl(slide.googleSheetSubmissionUrl || '');
    if (slide.type === 'internal') {
      if (slide.listicleData) {
        setStudioMode('listicle_editor');
      } else {
        setStudioMode('manual');
      }
    } else {
      setStudioMode('manual');
    }
  };

  const scrollMenu = (direction: 'left' | 'right') => {
    if (menuScrollRef.current) {
      const scrollAmount = 200;
      menuScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const addSource = (type: 'scrape' | 'sheet' | 'drive') => {
    if (type === 'scrape') setScrapingUrls([...scrapingUrls, '']);
    else if (type === 'sheet') setSheetUrls([...sheetUrls, '']);
    else setDriveUrls([...driveUrls, '']);
  };

  const updateSource = (type: 'scrape' | 'sheet' | 'drive', idx: number, val: string) => {
    let next: string[];
    if (type === 'scrape') {
        next = [...scrapingUrls];
        next[idx] = val;
        setScrapingUrls(next);
    } else if (type === 'sheet') {
        next = [...sheetUrls];
        next[idx] = val;
        setSheetUrls(next);
    } else {
        next = [...driveUrls];
        next[idx] = val;
        setDriveUrls(next);
    }
  };

  const removeSource = (type: 'scrape' | 'sheet' | 'drive', idx: number) => {
    let next: string[];
    if (type === 'scrape') {
        next = scrapingUrls.filter((_, i) => i !== idx);
        setScrapingUrls(next.length > 0 ? next : ['']);
    } else if (type === 'sheet') {
        next = sheetUrls.filter((_, i) => i !== idx);
        setSheetUrls(next.length > 0 ? next : ['']);
    } else {
        next = driveUrls.filter((_, i) => i !== idx);
        setDriveUrls(next.length > 0 ? next : ['']);
    }
  };

  const handleDesignCrewGeneration = async () => {
    setIsDesigning(true);
    const validScrapeSources = scrapingUrls.filter(u => u.trim().length > 0);
    const validSheetSources = sheetUrls.filter(u => u.trim().length > 0);
    const validDriveSources = driveUrls.filter(u => u.trim().length > 0);
    const currentWebhook = webhookUrl.trim();
    const currentSheetSubmit = googleSheetSubmissionUrl.trim();
    
    try {
      let result;
      switch (crewMode) {
        case 'videoStory':
          result = await researchAndDesignVideoStoryCrew(videoStoryUrl, genBrief, genImageUrl, validScrapeSources, validSheetSources, validDriveSources, currentWebhook);
          break;
        case 'leadGen':
          result = await researchAndDesignLeadGenCrew(genTopic, genBrief, genImageUrl, validScrapeSources, validSheetSources, validDriveSources, currentWebhook, currentSheetSubmit);
          break;
        case 'miniApp':
          result = await researchAndDesignMiniAppCrew(genTopic, genBrief, genImageUrl, validScrapeSources, validSheetSources, validDriveSources, currentWebhook);
          break;
        case 'listicle':
          result = await researchAndDesignListicleCrew(genTopic, genBrief, genImageUrl, validScrapeSources, validSheetSources, validDriveSources, currentWebhook);
          break;
        case 'productGallery':
          result = await researchAndDesignProductGallery(genTopic, genBrief, genImageUrl, validScrapeSources, validSheetSources, validDriveSources, currentWebhook);
          break;
        case 'blog':
          result = await researchAndDesignBlogCrew(genTopic, genBrief, genImageUrl, genRawContent, validScrapeSources, validSheetSources, validDriveSources, currentWebhook);
          break;
        case 'ad':
          result = await researchAndDesignAdCrew(genTopic, genBrief, genImageUrl, validScrapeSources, validSheetSources, validDriveSources, currentWebhook);
          break;
        case 'course':
          result = await researchAndDesignCourseCrew(genTopic, genBrief, genImageUrl, validScrapeSources, validSheetSources, validDriveSources, currentWebhook);
          break;
        case 'chatbot':
          result = await researchAndDesignChatbotCrew(genTopic, genBrief, genImageUrl, validScrapeSources, validSheetSources, validDriveSources, currentWebhook);
          break;
        case 'research':
          result = await researchAndDesignFeature(genTopic, genBrief, genImageUrl, validScrapeSources, validSheetSources, validDriveSources, currentWebhook);
          break;
        case 'podcast':
          result = await generatePodcast(genTopic, podcastMode, genBrief, genImageUrl, validScrapeSources, validSheetSources, validDriveSources, currentWebhook);
          break;
        case 'videoGallery':
          result = await researchAndDesignVideoGallery(genTopic, genBrief, genImageUrl, validScrapeSources, validSheetSources, validDriveSources, currentWebhook);
          break;
        case 'layout':
          const html = await generateStudioLayout("Omnichannel data sync complete.", genBrief, genImageUrl);
          result = { content: html, title: genTopic || "Intelligence Synthesis", description: genBrief || "Multi-layered curation result.", category: "Analysis", accentColor: "#ffffff" };
          break;
        default:
          throw new Error("Unknown Crew Mode");
      }
      
      if (result) {
        setFormState({ ...formState, type: 'internal', ...result, webhookUrl: currentWebhook, googleSheetSubmissionUrl: currentSheetSubmit });
        if (result.listicleData) {
          setStudioMode('listicle_editor');
        } else {
          setStudioMode('manual');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDesigning(false);
    }
  };

  const openStandaloneCourse = () => {
    if (!formState.content) return;
    const blob = new Blob([`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${formState.title || 'Course View'}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { margin: 0; background: #fff; color: #000; font-family: sans-serif; overflow-x: hidden; }
          *::-webkit-scrollbar { display: none; }
          * { -ms-overflow-style: none; scrollbar-width: none; }
        </style>
      </head>
      <body>
        ${formState.content}
        <script>
          window.trackEnrollment = function(id, action, event) {
             console.log("Standalone Tracking Triggered:", id, action);
             const btn = event?.currentTarget;
             if (btn && action === 'enroll') {
                btn.innerHTML = '✓ ENROLLED SUCCESSFULLY';
                btn.classList.add('bg-emerald-600', 'text-white');
                btn.classList.remove('bg-indigo-600', 'bg-black');
             }
          };
          window.sendQuickReply = function(text) {
            console.log("Standalone Quick Reply:", text);
          };
          window.sendMessage = function(text) {
            console.log("Standalone Message Sent:", text);
          };
        </script>
      </body>
      </html>
    `], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col text-white font-sans overflow-hidden">
      {/* Full View Preview Overlay */}
      {showFullPreview && (
        <div className="fixed inset-0 z-[200] bg-black animate-in fade-in duration-300">
          <div className="absolute top-8 right-8 z-[210] flex gap-4">
            <button 
              onClick={openStandaloneCourse}
              className="px-6 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl hover:bg-indigo-500 transition-all flex items-center gap-2 group"
            >
              <span>Launch Standalone Experience</span>
              <span className="text-xs transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
            </button>
            <button 
              onClick={() => setShowFullPreview(false)}
              className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl hover:scale-105 transition-all"
            >
              Exit Full View
            </button>
          </div>
          <div className="w-full h-full bg-white overflow-y-auto no-scrollbar">
             <div className="w-full min-h-full" dangerouslySetInnerHTML={{ __html: formState.content || '' }} />
             <script dangerouslySetInnerHTML={{ __html: `
                window.trackEnrollment = function(id, action) {
                  console.log("Preview Tracking:", id, action);
                  if (action === 'enroll') alert("Enrollment Successful (Simulation)");
                };
                window.sendQuickReply = function(text) {
                  console.log("Preview Quick Reply:", text);
                };
                window.sendMessage = function(text) {
                  console.log("Preview Message Sent:", text);
                };
             ` }} />
          </div>
        </div>
      )}

      <div className="flex justify-between items-center p-6 border-b border-white/10 bg-zinc-900/50">
        <div className="flex items-center gap-12">
          <h2 className="text-2xl font-serif font-black italic uppercase tracking-tight">Magazine Studio</h2>
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('pages')} className={`text-[10px] uppercase tracking-[0.3em] font-bold px-4 py-2 ${activeTab === 'pages' ? 'bg-white text-black' : 'text-zinc-500'}`}>Pages</button>
            <button onClick={() => setActiveTab('covers')} className={`text-[10px] uppercase tracking-[0.3em] font-bold px-4 py-2 ${activeTab === 'covers' ? 'bg-white text-black' : 'text-zinc-500'}`}>Cover</button>
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-white uppercase text-xs font-black">Exit</button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'pages' ? (
          <>
            <div className="w-1/3 p-8 border-r border-white/10 overflow-y-auto admin-scroll space-y-12">
              <section className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Page Architect</h3>
                  <button onClick={() => { setEditingId(null); setFormState({type:'internal', title:'', subtitle: '', description:'', webhookUrl: '', googleSheetSubmissionUrl: '', listicleData: { items: [] }, price: ''}); setWebhookUrl(''); setGoogleSheetSubmissionUrl(''); setStudioMode('crew'); }} className="px-3 py-1 text-[8px] uppercase font-black bg-white/10 hover:bg-white hover:text-black transition-all">New Designer Page</button>
                </div>

                <div className="flex gap-2 p-1 bg-white/5 rounded">
                  <button onClick={() => setFormState({...formState, type: 'external'})} className={`flex-1 py-2 text-[8px] uppercase font-black ${formState.type === 'external' ? 'bg-white text-black' : ''}`}>External Link</button>
                  <button onClick={() => setFormState({...formState, type: 'internal'})} className={`flex-1 py-2 text-[8px] uppercase font-black ${formState.type === 'internal' ? 'bg-white text-black' : ''}`}>Internal Design</button>
                </div>

                {formState.type === 'internal' && (
                  <div className="space-y-4">
                    <div className="flex gap-2 p-1 bg-white/5 rounded">
                      <button onClick={() => setStudioMode('crew')} className={`flex-1 py-2 text-[8px] uppercase font-black ${studioMode === 'crew' ? 'bg-indigo-600' : ''}`}>AI Agents</button>
                      {formState.listicleData && (
                        <button onClick={() => setStudioMode('listicle_editor')} className={`flex-1 py-2 text-[8px] uppercase font-black ${studioMode === 'listicle_editor' ? 'bg-indigo-600' : ''}`}>Gallery Editor</button>
                      )}
                      <button onClick={() => setStudioMode('manual')} className={`flex-1 py-2 text-[8px] uppercase font-black ${studioMode === 'manual' ? 'bg-zinc-700' : ''}`}>Code</button>
                    </div>

                    {studioMode === 'crew' ? (
                      <div className="space-y-4 animate-in fade-in duration-500">
                        <div className="relative group/menu">
                          <button onClick={() => scrollMenu('left')} className="absolute left-0 top-0 bottom-0 z-20 px-2 bg-gradient-to-r from-black via-black/50 to-transparent hover:from-white/20 transition-all flex items-center justify-center opacity-0 group-hover/menu:opacity-100">
                            <span className="text-white text-xs font-black">‹</span>
                          </button>
                          <div ref={menuScrollRef} className="flex bg-white/5 p-1 rounded overflow-x-auto no-scrollbar gap-2 scroll-smooth border border-white/5">
                            {['layout', 'course', 'blog', 'listicle', 'leadGen', 'videoStory', 'miniApp', 'ad', 'research', 'podcast', 'chatbot', 'videoGallery', 'productGallery'].map(m => (
                              <button key={m} onClick={() => setCrewMode(m as any)} className={`px-4 py-2 text-[8px] uppercase font-black shrink-0 transition-all ${crewMode === m ? 'bg-white text-black scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}>
                                {m === 'leadGen' ? 'LEAD GEN' : m === 'videoStory' ? 'VIDEO STORY' : m.toUpperCase()}
                              </button>
                            ))}
                          </div>
                          <button onClick={() => scrollMenu('right')} className="absolute right-0 top-0 bottom-0 z-20 px-2 bg-gradient-to-l from-black via-black/50 to-transparent hover:from-white/20 transition-all flex items-center justify-center opacity-0 group-hover/menu:opacity-100">
                            <span className="text-white text-xs font-black">›</span>
                          </button>
                        </div>

                        <div className="bg-zinc-900/50 p-5 border border-indigo-500/20 rounded-sm space-y-6">
                           <div className="space-y-4">
                              <label className="text-[8px] uppercase font-bold text-indigo-400 tracking-widest block">Data Streams for Intelligence</label>
                              <div className="space-y-2 max-h-32 overflow-y-auto no-scrollbar">
                                 {scrapingUrls.map((url, i) => (
                                   <div key={i} className="flex gap-2">
                                     <input value={url} onChange={e => updateSource('scrape', i, e.target.value)} placeholder="Web URL for context..." className="flex-1 bg-black border border-white/5 p-2 text-[9px] outline-none focus:border-indigo-500/40" />
                                     {scrapingUrls.length > 1 && <button onClick={() => removeSource('scrape', i)} className="text-[10px] text-zinc-700 hover:text-red-500">×</button>}
                                   </div>
                                 ))}
                                 <button onClick={() => addSource('scrape')} className="text-[7px] uppercase font-black text-indigo-500/60 hover:text-indigo-400">+ Add Knowledge Source</button>
                              </div>
                           </div>

                           <div className="space-y-4 border-t border-white/5 pt-4">
                              <label className="text-[8px] uppercase font-bold text-emerald-400 tracking-widest block">Active Webhook Sync</label>
                              <input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://..." className="w-full bg-black border border-white/5 p-2 text-[9px] outline-none focus:border-emerald-500/40" />
                           </div>
                        </div>

                        <div className="bg-white/5 p-5 border border-white/10 space-y-6 rounded-sm">
                          <div className="space-y-4">
                            <h4 className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">Global Page Config</h4>
                            <div className="space-y-3">
                              <input value={genTopic} onChange={e => setGenTopic(e.target.value)} placeholder="Title / Topic..." className="w-full bg-black border border-white/10 p-3 text-xs outline-none focus:border-white/40" />
                              <input value={genImageUrl} onChange={e => setGenImageUrl(e.target.value)} placeholder="Featured Image URL..." className="w-full bg-black border border-white/10 p-3 text-xs outline-none focus:border-white/40" />
                              <textarea value={genBrief} onChange={e => setGenBrief(e.target.value)} placeholder="Creative Brief / Description..." rows={3} className="w-full bg-black border border-white/10 p-3 text-xs outline-none focus:border-white/40" />
                            </div>
                          </div>

                          {crewMode === 'videoStory' && (
                             <div className="space-y-3 border-t border-white/5 pt-4">
                               <label className="text-[8px] uppercase font-bold text-sky-400 tracking-widest block">Video Source</label>
                               <input value={videoStoryUrl} onChange={e => setVideoStoryUrl(e.target.value)} placeholder="YouTube Video URL..." className="w-full bg-black border border-white/10 p-3 text-xs outline-none focus:border-sky-500" />
                             </div>
                          )}

                          {crewMode === 'blog' && (
                             <div className="space-y-3 border-t border-white/5 pt-4">
                               <label className="text-[8px] uppercase font-bold text-emerald-400 tracking-widest block">Article Raw Content</label>
                               <textarea value={genRawContent} onChange={e => setGenRawContent(e.target.value)} placeholder="Paste full article text or research notes here..." rows={8} className="w-full bg-black border border-white/10 p-3 text-xs outline-none focus:border-emerald-500 transition-all font-serif" />
                             </div>
                          )}

                          {crewMode === 'podcast' && (
                             <div className="space-y-3 border-t border-white/5 pt-4">
                               <label className="text-[8px] uppercase font-bold text-orange-400 tracking-widest block">Podcast Mode</label>
                               <div className="flex gap-2 p-1 bg-white/5 rounded">
                                  <button onClick={() => setPodcastMode('solo')} className={`flex-1 py-2 text-[8px] uppercase font-black ${podcastMode === 'solo' ? 'bg-white text-black' : ''}`}>Solo Talk</button>
                                  <button onClick={() => setPodcastMode('duo')} className={`flex-1 py-2 text-[8px] uppercase font-black ${podcastMode === 'duo' ? 'bg-white text-black' : ''}`}>Dialogue</button>
                               </div>
                             </div>
                          )}
                        </div>

                        <button onClick={handleDesignCrewGeneration} disabled={isDesigning} className="group relative w-full bg-white text-black py-5 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl disabled:opacity-50 overflow-hidden">
                          <span className="relative z-10">{isDesigning ? "Designing your issue..." : "Collaborate with Intelligent Crew"}</span>
                          {isDesigning && <div className="absolute inset-0 bg-indigo-100 animate-pulse"></div>}
                        </button>
                      </div>
                    ) : studioMode === 'listicle_editor' ? (
                      <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="space-y-3">
                          <label className="text-[8px] uppercase font-bold text-indigo-400 tracking-widest block">Gallery Hero Visual</label>
                          <div className="flex gap-4 items-start">
                            <div className="w-20 aspect-video bg-zinc-900 overflow-hidden border border-white/10 shrink-0">
                               {formState.listicleData?.sidebarImage ? <img src={formState.listicleData.sidebarImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-700 italic">No Img</div>}
                            </div>
                            <input value={formState.listicleData?.sidebarImage || ''} onChange={e => setFormState({ ...formState, listicleData: { ...formState.listicleData!, sidebarImage: e.target.value } })} placeholder="Hero Image URL" className="flex-1 bg-black border border-white/10 p-3 text-xs outline-none focus:border-white transition-all" />
                          </div>
                        </div>
                        <div className="flex justify-between items-center border-t border-white/10 pt-8">
                          <h4 className="text-[8px] uppercase font-bold text-indigo-400 tracking-widest">Gallery Items ({formState.listicleData?.items.length})</h4>
                          <button onClick={addListicleItem} className="px-3 py-1 bg-white text-black text-[8px] uppercase font-black tracking-widest hover:bg-zinc-200 transition-all">+ Add Product</button>
                        </div>
                        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-3 admin-scroll">
                          {formState.listicleData?.items.map((item, idx) => (
                            <div key={item.id} className="bg-white/5 p-5 border border-white/5 space-y-4 rounded-sm group relative">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <span className="text-xl font-black italic text-zinc-700">{(idx + 1).toString().padStart(2, '0')}</span>
                                  <div className="flex flex-col gap-1">
                                    <button onClick={() => moveListicleItem(idx, 'up')} disabled={idx === 0} className="text-[8px] text-zinc-600 hover:text-white disabled:opacity-0">▲</button>
                                    <button onClick={() => moveListicleItem(idx, 'down')} disabled={idx === formState.listicleData!.items.length - 1} className="text-[8px] text-zinc-600 hover:text-white disabled:opacity-0">▼</button>
                                  </div>
                                </div>
                                <button onClick={() => removeListicleItem(item.id)} className="text-[8px] text-zinc-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all uppercase font-black">Remove</button>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <input value={item.title} onChange={e => updateListicleItem(item.id, { title: e.target.value })} placeholder="Product Title" className="w-full bg-transparent border-b border-white/10 p-2 text-xs font-bold outline-none focus:border-white transition-all" />
                                <input value={item.price || ''} onChange={e => updateListicleItem(item.id, { price: e.target.value })} placeholder="Price (e.g. $99.00)" className="w-full bg-transparent border-b border-white/10 p-2 text-xs font-mono outline-none focus:border-white transition-all" />
                              </div>
                              <textarea value={item.description} onChange={e => updateListicleItem(item.id, { description: e.target.value })} placeholder="Product Description" rows={2} className="w-full bg-black/40 border border-white/5 p-3 text-[10px] outline-none rounded-sm" />
                              <div className="grid grid-cols-2 gap-3">
                                <input value={item.imageUrl || ''} onChange={e => updateListicleItem(item.id, { imageUrl: e.target.value })} placeholder="Image URL" className="w-full bg-black border border-white/10 p-2 text-[9px] outline-none focus:border-indigo-500" />
                                <input value={item.link || ''} onChange={e => updateListicleItem(item.id, { link: e.target.value })} placeholder="Buy Link" className="w-full bg-black border border-white/10 p-2 text-[9px] outline-none focus:border-indigo-500" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <textarea value={formState.content} onChange={e => setFormState({...formState, content: e.target.value})} placeholder="Direct HTML/Tailwind input..." rows={12} className="w-full bg-black border border-white/10 p-3 text-xs font-mono rounded-sm outline-none focus:border-white/20" />
                    )}
                  </div>
                )}

                <div className="space-y-4 border-t border-white/10 pt-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[8px] uppercase font-bold text-zinc-500 tracking-[0.2em]">Publication Meta</span>
                  </div>
                  {formState.type === 'external' && <input type="url" value={formState.url} onChange={e => setFormState({...formState, url: e.target.value})} placeholder="Direct Link" className="w-full bg-black border border-white/10 p-3 text-xs" />}
                  <div className="grid grid-cols-2 gap-2">
                    <input required type="text" value={formState.title} onChange={e => setFormState({...formState, title: e.target.value})} placeholder="Issue Headline" className="w-full bg-black border border-white/10 p-3 text-sm font-serif" />
                    <input type="text" value={formState.subtitle || ''} onChange={e => setFormState({...formState, subtitle: e.target.value})} placeholder="Sub-headline" className="w-full bg-black border border-white/10 p-3 text-sm font-serif" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={formState.category || ''} onChange={e => setFormState({...formState, category: e.target.value})} placeholder="Category" className="w-full bg-black border border-white/10 p-3 text-xs" />
                    <input type="text" value={formState.price || ''} onChange={e => setFormState({...formState, price: e.target.value})} placeholder="Display Price" className="w-full bg-black border border-white/10 p-3 text-xs font-mono" />
                  </div>
                  <textarea value={formState.description || ''} onChange={e => setFormState({...formState, description: e.target.value})} placeholder="Abstract / Meta Description (Shows in HUD)" rows={2} className="w-full bg-black border border-white/10 p-3 text-xs" />
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => editingId ? onUpdateSlide(formState as any) : onAddSlide({...formState, id: Date.now().toString()} as any)} 
                      className="w-full bg-indigo-600 text-white py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all rounded-sm shadow-2xl"
                    >
                      {editingId ? "Finalize & Save Update" : "Publish to Magazine"}
                    </button>
                    {formState.content && (
                       <button 
                         onClick={() => setShowFullPreview(true)}
                         className="w-full border border-white/20 text-white py-3 text-[8px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all rounded-sm"
                       >
                         Launch Immersive Preview
                       </button>
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-6 pt-12">
                <div className="flex justify-between items-center border-t border-white/10 pt-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Publication Map</h3>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar pr-2">
                  {slides.map((s, i) => (
                    <div key={s.id} className="group bg-white/5 border border-white/5 p-4 flex justify-between items-center hover:bg-white/10 transition-all rounded-sm">
                      <div className="flex items-center gap-4 truncate">
                        <span className="text-[10px] font-black text-zinc-700">{(i+1).toString().padStart(2,'0')}</span>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider truncate text-zinc-300 group-hover:text-white">{s.title}</h4>
                      </div>
                      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(s)} className="text-[8px] text-zinc-500 hover:text-white uppercase font-black tracking-widest">Edit</button>
                        <button onClick={() => onRemoveSlide(s.id)} className="text-[8px] text-red-900 hover:text-red-500 uppercase font-black tracking-widest">Del</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="flex-1 bg-zinc-100 flex flex-col p-8 overflow-y-auto no-scrollbar relative">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 italic">Curatorial Work-in-Progress</h3>
                 {formState.content && (
                   <button onClick={() => setShowFullPreview(true)} className="text-[8px] uppercase font-black tracking-widest text-zinc-400 hover:text-black border border-zinc-200 px-3 py-1 hover:border-black transition-all">Launch Immersive View</button>
                 )}
               </div>
               <div className="w-full h-full border border-black/5 rounded-lg overflow-hidden bg-white shadow-2xl relative">
                  <div className="w-full h-full admin-scroll overflow-y-auto" dangerouslySetInnerHTML={{ __html: formState.content || '<div class="flex items-center justify-center h-full text-zinc-300 uppercase font-black tracking-widest text-[12px] italic">Syncing Preview...</div>' }} />
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 p-16 space-y-12 overflow-y-auto admin-scroll bg-zinc-950">
            <h3 className="text-sm font-bold uppercase tracking-[0.5em] text-zinc-500 text-center">Master Aesthetic</h3>
            <div className="grid grid-cols-2 gap-24 max-w-6xl mx-auto">
              <div className="space-y-12">
                <section>
                  <label className="text-[10px] uppercase tracking-[0.4em] font-black text-zinc-600 mb-6 block">Publication Title</label>
                  <input value={coverConfig.title} onChange={e => onUpdateCover({...coverConfig, title: e.target.value})} className="w-full bg-transparent border-b border-white/10 p-4 text-5xl font-serif font-black italic outline-none focus:border-white transition-all text-white placeholder-zinc-800" placeholder="Brand Name" />
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
