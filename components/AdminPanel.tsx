import React, { useState, useRef, useEffect } from 'react';
import { WebsiteSlide, CoverConfig, CoverLayoutType, ListicleItem, ListicleData } from '../types';
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
  const [crewMode, setCrewMode] = useState<'layout' | 'research' | 'podcast' | 'videoGallery' | 'productGallery' | 'chatbot' | 'course' | 'blog' | 'ad' | 'listicle'>('layout');
  const [editingId, setEditingId] = useState<string | null>(null);

  const menuScrollRef = useRef<HTMLDivElement>(null);

  // Specialist States for Crews
  const [blogTopic, setBlogTopic] = useState('');
  const [listicleTopic, setListicleTopic] = useState('');
  const [listicleImageUrl, setListicleImageUrl] = useState('');
  const [adTopic, setAdTopic] = useState('');
  const [adImageUrl, setAdImageUrl] = useState('');
  const [chatbotNiche, setChatbotNiche] = useState('');
  const [courseTopic, setCourseTopic] = useState('');
  const [researchKeyword, setResearchKeyword] = useState('');
  const [podcastTopic, setPodcastTopic] = useState('');
  const [podcastImageUrl, setPodcastImageUrl] = useState('');
  const [podcastMode, setPodcastMode] = useState<'solo' | 'duo'>('duo');

  const [designInstructions, setDesignInstructions] = useState('');
  const [isDesigning, setIsDesigning] = useState(false);
  const [formState, setFormState] = useState<Partial<WebsiteSlide>>({
    url: '', content: '', type: 'external', title: '', description: '', category: 'General', accentColor: '#ffffff'
  });

  // Automatically update the live preview HTML when structured data changes
  useEffect(() => {
    if (studioMode === 'listicle_editor' && formState.listicleData && formState.title) {
      const newHtml = generateListicleHtml(formState.title, formState.listicleData);
      setFormState(prev => ({ ...prev, content: newHtml }));
    }
  }, [formState.listicleData, formState.title, studioMode]);

  const handleEdit = (slide: WebsiteSlide) => {
    setEditingId(slide.id);
    setFormState({ ...slide });
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

  const handleDesignCrewGeneration = async () => {
    setIsDesigning(true);
    try {
      let result;
      switch (crewMode) {
        case 'listicle':
          result = await researchAndDesignListicleCrew(listicleTopic, designInstructions, listicleImageUrl);
          break;
        case 'blog':
          result = await researchAndDesignBlogCrew(blogTopic, designInstructions);
          break;
        case 'ad':
          result = await researchAndDesignAdCrew(adTopic, designInstructions, adImageUrl);
          break;
        case 'course':
          result = await researchAndDesignCourseCrew(courseTopic, designInstructions);
          break;
        case 'chatbot':
          result = await researchAndDesignChatbotCrew(chatbotNiche, designInstructions);
          break;
        case 'research':
          result = await researchAndDesignFeature(researchKeyword, designInstructions);
          break;
        case 'podcast':
          result = await generatePodcast(podcastTopic, podcastMode, designInstructions, podcastImageUrl);
          break;
        case 'videoGallery':
          result = await researchAndDesignVideoGallery(researchKeyword || "Visual Showcase", designInstructions);
          break;
        case 'layout':
          const html = await generateStudioLayout("Raw Editorial Content", designInstructions);
          result = { content: html, title: "Editorial Design", description: "Studio generated layout.", category: "Design", accentColor: "#ffffff" };
          break;
        default:
          throw new Error("Unknown Crew Mode");
      }
      
      if (result) {
        setFormState({ ...formState, type: 'internal', ...result });
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

  const updateListicleItem = (id: string, updates: Partial<ListicleItem>) => {
    if (!formState.listicleData) return;
    const newItems = formState.listicleData.items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    setFormState({ 
      ...formState, 
      listicleData: { ...formState.listicleData, items: newItems } 
    });
  };

  const addListicleItem = () => {
    const newItem: ListicleItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New List Artifact',
      description: 'Engaging meta-description of the artifact.',
      imageUrl: '',
      link: ''
    };
    const currentData = formState.listicleData || { items: [], sidebarImage: '' };
    setFormState({ 
      ...formState, 
      listicleData: { ...currentData, items: [...currentData.items, newItem] } 
    });
  };

  const removeListicleItem = (id: string) => {
    if (!formState.listicleData) return;
    const newItems = formState.listicleData.items.filter(item => item.id !== id);
    setFormState({ 
      ...formState, 
      listicleData: { ...formState.listicleData, items: newItems } 
    });
  };

  const moveListicleItem = (index: number, direction: 'up' | 'down') => {
    if (!formState.listicleData) return;
    const newItems = [...formState.listicleData.items];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newItems.length) return;
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
    setFormState({ 
      ...formState, 
      listicleData: { ...formState.listicleData, items: newItems } 
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col text-white font-sans overflow-hidden">
      {/* Header */}
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
            {/* Control Column */}
            <div className="w-1/3 p-8 border-r border-white/10 overflow-y-auto admin-scroll space-y-12">
              <section className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Page Architect</h3>
                  <button onClick={() => { setEditingId(null); setFormState({type:'external', title:'', description:''}); }} className="px-3 py-1 text-[8px] uppercase font-black bg-white/10 hover:bg-white hover:text-black transition-all">New</button>
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
                        <button onClick={() => setStudioMode('listicle_editor')} className={`flex-1 py-2 text-[8px] uppercase font-black ${studioMode === 'listicle_editor' ? 'bg-indigo-600' : ''}`}>List Editor</button>
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
                            {['layout', 'blog', 'listicle', 'ad', 'research', 'podcast', 'course', 'chatbot', 'videoGallery'].map(m => (
                              <button key={m} onClick={() => setCrewMode(m as any)} className={`px-4 py-2 text-[8px] uppercase font-black shrink-0 transition-all ${crewMode === m ? 'bg-white text-black scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}>
                                {m.toUpperCase()}
                              </button>
                            ))}
                          </div>
                          <button onClick={() => scrollMenu('right')} className="absolute right-0 top-0 bottom-0 z-20 px-2 bg-gradient-to-l from-black via-black/50 to-transparent hover:from-white/20 transition-all flex items-center justify-center opacity-0 group-hover/menu:opacity-100">
                            <span className="text-white text-xs font-black">›</span>
                          </button>
                        </div>

                        <div className="bg-white/5 p-5 border border-white/10 space-y-4 rounded-sm">
                          {crewMode === 'listicle' && (
                            <div className="space-y-3">
                              <label className="text-[8px] uppercase font-bold text-indigo-400 tracking-widest">Viral Feature Logic</label>
                              <input value={listicleTopic} onChange={e => setListicleTopic(e.target.value)} placeholder="Viral Subject / Trend..." className="w-full bg-black border border-white/10 p-3 text-xs outline-none focus:border-indigo-500" />
                              <input value={listicleImageUrl} onChange={e => setListicleImageUrl(e.target.value)} placeholder="Feature Hero Image URL..." className="w-full bg-black border border-white/10 p-3 text-xs outline-none focus:border-indigo-500" />
                            </div>
                          )}
                          <textarea value={designInstructions} onChange={e => setDesignInstructions(e.target.value)} placeholder="Style notes, vibe, tone instructions..." rows={2} className="w-full bg-black border border-white/10 p-3 text-xs outline-none focus:border-white/40" />
                        </div>
                        <button onClick={handleDesignCrewGeneration} disabled={isDesigning} className="group relative w-full bg-white text-black py-5 text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl disabled:opacity-50 overflow-hidden">
                          <span className="relative z-10">{isDesigning ? "Designing..." : "Deploy Design Crew"}</span>
                          {isDesigning && <div className="absolute inset-0 bg-indigo-100 animate-pulse"></div>}
                        </button>
                      </div>
                    ) : studioMode === 'listicle_editor' ? (
                      <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                        {/* Sidebar/Hero Image */}
                        <div className="space-y-3">
                          <label className="text-[8px] uppercase font-bold text-indigo-400 tracking-widest block">Main Listicle Hero Image</label>
                          <div className="flex gap-4 items-start">
                            <div className="w-20 aspect-video bg-zinc-900 overflow-hidden border border-white/10 shrink-0">
                               {formState.listicleData?.sidebarImage ? (
                                 <img src={formState.listicleData.sidebarImage} className="w-full h-full object-cover" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-700 italic">No Img</div>
                               )}
                            </div>
                            <input 
                              value={formState.listicleData?.sidebarImage || ''} 
                              onChange={e => setFormState({ ...formState, listicleData: { ...formState.listicleData!, sidebarImage: e.target.value } })} 
                              placeholder="Hero Image URL" 
                              className="flex-1 bg-black border border-white/10 p-3 text-xs outline-none focus:border-white transition-all"
                            />
                          </div>
                        </div>
                        
                        {/* List Items Grid */}
                        <div className="flex justify-between items-center border-t border-white/10 pt-8">
                          <h4 className="text-[8px] uppercase font-bold text-indigo-400 tracking-widest">List Items ({formState.listicleData?.items.length})</h4>
                          <button onClick={addListicleItem} className="px-3 py-1 bg-white text-black text-[8px] uppercase font-black tracking-widest hover:bg-zinc-200 transition-all">+ Add Item</button>
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

                              <input value={item.title} onChange={e => updateListicleItem(item.id, { title: e.target.value })} placeholder="Item Title" className="w-full bg-transparent border-b border-white/10 p-2 text-xs font-bold outline-none focus:border-white transition-all" />
                              <textarea value={item.description} onChange={e => updateListicleItem(item.id, { description: e.target.value })} placeholder="Item Description" rows={2} className="w-full bg-black/40 border border-white/5 p-3 text-[10px] outline-none rounded-sm" />
                              
                              <div className="space-y-2">
                                <label className="text-[8px] uppercase font-bold text-zinc-600">External Image & Link</label>
                                <div className="flex gap-4 items-center">
                                   <div className="w-14 aspect-square bg-zinc-900 overflow-hidden border border-white/10 shrink-0">
                                      {item.imageUrl ? (
                                        <img src={item.imageUrl} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-800 italic">?</div>
                                      )}
                                   </div>
                                   <div className="flex-1 space-y-2">
                                     <input value={item.imageUrl || ''} onChange={e => updateListicleItem(item.id, { imageUrl: e.target.value })} placeholder="Direct Image URL" className="w-full bg-black/20 border border-white/5 p-2 text-[9px] outline-none focus:border-white/20" />
                                     <input value={item.link || ''} onChange={e => updateListicleItem(item.id, { link: e.target.value })} placeholder="External Destination URL" className="w-full bg-black/20 border border-white/5 p-2 text-[9px] outline-none focus:border-white/20" />
                                   </div>
                                </div>
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

                {/* Final Committal */}
                <div className="space-y-4 border-t border-white/10 pt-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[8px] uppercase font-bold text-zinc-500 tracking-[0.2em]">Metadata Synthesis</span>
                  </div>
                  {formState.type === 'external' && <input type="url" value={formState.url} onChange={e => setFormState({...formState, url: e.target.value})} placeholder="Direct Link Source" className="w-full bg-black border border-white/10 p-3 text-xs" />}
                  <input required type="text" value={formState.title} onChange={e => setFormState({...formState, title: e.target.value})} placeholder="Page Headline" className="w-full bg-black border border-white/10 p-3 text-sm font-serif" />
                  <textarea value={formState.description} onChange={e => setFormState({...formState, description: e.target.value})} placeholder="Meta Hook (Italicized)" rows={2} className="w-full bg-black border border-white/10 p-3 text-xs" />
                  <button onClick={() => editingId ? onUpdateSlide(formState as any) : onAddSlide({...formState, id: Date.now().toString()} as any)} className="w-full bg-indigo-600 text-white py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all rounded-sm shadow-2xl">
                    {editingId ? "Finalize Update" : "Publish to Sequence"}
                  </button>
                </div>
              </section>

              {/* History / Queue */}
              <section className="space-y-6 pt-12">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Publication Lineup</h3>
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

            {/* Live Canvas Column */}
            <div className="flex-1 bg-black flex flex-col p-8 overflow-y-auto no-scrollbar relative">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-800 italic">Studio Live Environment</h3>
                 {formState.listicleData && <span className="text-[8px] uppercase tracking-[0.4em] font-black text-indigo-500">Structured List Mode</span>}
               </div>
               <div className="w-full h-full border border-white/5 rounded-lg overflow-hidden bg-zinc-950 shadow-inner relative">
                  <div className="w-full h-full admin-scroll overflow-y-auto" dangerouslySetInnerHTML={{ __html: formState.content || '<div class="flex items-center justify-center h-full text-zinc-900 uppercase font-black tracking-widest text-[12px] italic">Live Preview Pending...</div>' }} />
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 p-16 space-y-12 overflow-y-auto admin-scroll bg-zinc-950">
            <h3 className="text-sm font-bold uppercase tracking-[0.5em] text-zinc-500 text-center">Publication Aesthetic</h3>
            <div className="grid grid-cols-2 gap-24 max-w-6xl mx-auto">
              <div className="space-y-12">
                <section>
                  <label className="text-[10px] uppercase tracking-[0.4em] font-black text-zinc-600 mb-6 block">Master Title</label>
                  <input value={coverConfig.title} onChange={e => onUpdateCover({...coverConfig, title: e.target.value})} className="w-full bg-transparent border-b border-white/10 p-4 text-5xl font-serif font-black italic outline-none focus:border-white transition-all text-white placeholder-zinc-800" placeholder="Publication Name" />
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
