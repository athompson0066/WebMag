
import React, { useState, useRef, useEffect } from 'react';
import { WebsiteSlide, CoverConfig, ListicleItem, ListicleData } from '../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
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
  generateListicleHtml,
  orchestrateMagazineIssue,
  ensureApiKey,
  fetchExternalLinkMetadata
} from '../services/geminiService';
import { getSupabaseStatus, submitAdminCredentials } from '../services/supabaseService';

interface AdminPanelProps {
  slides: WebsiteSlide[];
  coverConfig: CoverConfig;
  onAddSlide: (slide: WebsiteSlide) => void;
  onUpdateSlide: (slide: WebsiteSlide) => void;
  onRemoveSlide: (id: string) => void;
  onUpdateCover: (config: CoverConfig) => void;
  onCurate: (topic: string, count: number, sourceUrl?: string, instructions?: string) => Promise<void>;
  onReorderSlides: (newSlides: WebsiteSlide[]) => void;
  onFullIssueGenerated: (cover: CoverConfig, slides: WebsiteSlide[]) => void;
  onClose: () => void;
}

const GOOGLE_FONTS = [
  { name: 'Inter', family: 'Inter', category: 'sans-serif' },
  { name: 'Playfair Display', family: 'Playfair Display', category: 'serif' },
  { name: 'Montserrat', family: 'Montserrat', category: 'sans-serif' },
  { name: 'Lora', family: 'Lora', category: 'serif' },
  { name: 'Space Grotesk', family: 'Space Grotesk', category: 'sans-serif' },
  { name: 'Cormorant Garamond', family: 'Cormorant Garamond', category: 'serif' },
  { name: 'JetBrains Mono', family: 'JetBrains Mono', category: 'monospace' },
  { name: 'Outfit', family: 'Outfit', category: 'sans-serif' },
  { name: 'Libre Baskerville', family: 'Libre Baskerville', category: 'serif' },
  { name: 'Anton', family: 'Anton', category: 'sans-serif' },
  { name: 'Syne', family: 'Syne', category: 'sans-serif' },
  { name: 'Bebas Neue', family: 'Bebas Neue', category: 'sans-serif' },
  { name: 'Cormorant', family: 'Cormorant', category: 'serif' },
  { name: 'Unbounded', family: 'Unbounded', category: 'sans-serif' },
];

const FONT_WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900];

interface SortableSlideProps {
  slide: WebsiteSlide;
  index: number;
  onEdit: () => void;
  onRemove: () => void | Promise<void>;
}

const SortableSlide: React.FC<SortableSlideProps> = ({ slide, index, onEdit, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group bg-white/5 border border-white/5 p-4 flex justify-between items-center hover:bg-white/10 transition-all rounded-sm"
    >
      <div className="flex items-center gap-4 truncate">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-zinc-700 hover:text-zinc-400 transition-colors"
        >
          <GripVertical size={14} />
        </button>
        <span className="text-[10px] font-black text-zinc-700">{(index + 1).toString().padStart(2, '0')}</span>
        <h4 className="text-[10px] font-bold uppercase tracking-wider truncate text-zinc-300 group-hover:text-white">{slide.title}</h4>
      </div>
      <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity items-center">
        <button
          onClick={() => {
            const url = `${window.location.origin}/?slide=${slide.id}`;
            navigator.clipboard.writeText(url);
            alert(`Link copied to clipboard!\n${url}`);
          }}
          title="Copy direct link to this slide"
          className="text-[8px] text-emerald-500 hover:text-emerald-400 uppercase font-black tracking-widest"
        >
          Link
        </button>
        <button onClick={onEdit} className="text-[8px] text-zinc-500 hover:text-white uppercase font-black tracking-widest">Edit</button>
        <button onClick={onRemove} className="text-[8px] text-red-900 hover:text-red-500 uppercase font-black tracking-widest">Del</button>
      </div>
    </div>
  );
};

const AdminPanel: React.FC<AdminPanelProps> = ({
  slides, coverConfig, onAddSlide, onUpdateSlide, onRemoveSlide,
  onUpdateCover, onCurate, onReorderSlides, onFullIssueGenerated, onClose
}) => {
  const [activeTab, setActiveTab] = useState<'pages' | 'covers' | 'orchestrate'>('orchestrate');
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
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [designProgress, setDesignProgress] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Hardcoded credentials as requested
    if (loginForm.username === 'athompson' && loginForm.password === 'Beachzipper66$') {
      setIsLoggedIn(true);
      setLoginError('');
      // "Submit it to Supabase"
      await submitAdminCredentials(loginForm.username, loginForm.password);
    } else {
      setLoginError('Invalid credentials. Access denied.');
    }
  };

  const [formState, setFormState] = useState<Partial<WebsiteSlide>>({
    url: '', content: '', type: 'external', title: '', subtitle: '', description: '', category: 'General', accentColor: '#ffffff', webhookUrl: '', googleSheetSubmissionUrl: '', price: ''
  });

  const handleInstantOrchestrate = async () => {
    if (!genTopic) return;
    await ensureApiKey();
    setIsDesigning(true);
    try {
      const result = await orchestrateMagazineIssue(genTopic, (msg) => setDesignProgress(msg));
      onFullIssueGenerated(result.cover, result.slides);
      onClose();
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || JSON.stringify(err);
      if (errMsg.includes("API key not valid") || errMsg.includes("Requested entity was not found")) {
        setDesignProgress("API Key Invalid. Re-opening selection...");
        if ((window as any).aistudio) {
          await (window as any).aistudio.openSelectKey();
        }
      } else {
        setDesignProgress("Failed to architect issue. Check console.");
      }
    } finally {
      setIsDesigning(false);
    }
  };

  const lastFetchedUrl = useRef<string>('');

  const handleFetchMetadata = async () => {
    if (!formState.url || isFetchingMetadata || formState.url === lastFetchedUrl.current) return;
    await ensureApiKey();
    setIsFetchingMetadata(true);
    lastFetchedUrl.current = formState.url;
    try {
      const metadata = await fetchExternalLinkMetadata(formState.url);
      setFormState(prev => ({
        ...prev,
        title: metadata.title || prev.title,
        subtitle: metadata.subtitle || prev.subtitle,
        description: metadata.description || prev.description,
        category: metadata.category || prev.category,
        accentColor: metadata.accentColor || prev.accentColor
      }));
    } catch (err) {
      console.error("Metadata fetch failed:", err);
      lastFetchedUrl.current = ''; // Reset on error to allow retry
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  const wrapContentInFrame = (content: string) => {
    if (!content) return '';
    if (content.toLowerCase().includes('<!doctype') || content.toLowerCase().includes('<html')) {
      return content;
    }
    const titleFont = formState.titleFont || 'Playfair Display';
    const bodyFont = formState.bodyFont || 'Inter';
    const activeFontColor = formState.fontColor || '#000000';
    const bodyFontSize = formState.bodyFontSize || 16;

    const getFontWeight = (weight?: string | number) => {
      if (typeof weight === 'number') return weight;
      if (weight && !isNaN(Number(weight))) return Number(weight);
      switch (weight) {
        case 'light': return 300;
        case 'bold': return 800;
        default: return 500;
      }
    };

    const titleWeight = getFontWeight(formState.titleFontWeight);
    const bodyWeight = getFontWeight(formState.bodyFontWeight);
    const titleStyle = formState.titleItalic ? 'italic' : 'normal';
    const bodyStyle = formState.bodyItalic ? 'italic' : 'normal';

    const fontsToLoad = Array.from(new Set([titleFont, bodyFont, 'Playfair Display', 'Inter']));
    const fontLink = `https://fonts.googleapis.com/css2?${fontsToLoad.map(f => `family=${f.replace(/ /g, '+')}:wght@100..900`).join('&')}&display=swap`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="${fontLink}" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
          <script>
            tailwind.config = {
              theme: {
                extend: {
                  fontFamily: {
                    serif: ['"${titleFont}"', 'serif'],
                    sans: ['"${bodyFont}"', 'system-ui', 'sans-serif'],
                  },
                },
              },
            }
          </script>
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              background: #fff; 
              overflow-x: hidden; 
              font-family: "${bodyFont}", sans-serif !important; 
              font-weight: ${bodyWeight} !important; 
              font-style: ${bodyStyle} !important;
              font-size: ${bodyFontSize}px !important;
              color: ${activeFontColor} !important;
            }
            h1, h2, h3, h4, h5, h6, .font-serif { 
              font-family: "${titleFont}", serif !important;
              font-weight: ${titleWeight} !important; 
              font-style: ${titleStyle} !important;
              line-height: 1.1;
            }
            p, div, span, li, a, .font-sans {
              font-family: "${bodyFont}", sans-serif !important;
              font-weight: ${bodyWeight} !important;
              font-style: ${bodyStyle} !important;
              font-size: ${bodyFontSize}px !important;
            }
            /* Ensure headers keep their relative sizes if they use Tailwind text-* classes */
            h1, h2, h3, h4, h5, h6 { font-size: revert !important; }
            
            *::-webkit-scrollbar { display: none; }
            * { -ms-overflow-style: none; scrollbar-width: none; }
            .drop-cap::first-letter {
              float: left;
              font-size: 5rem !important;
              line-height: 1 !important;
              padding-right: 0.75rem !important;
              font-family: "${titleFont}", serif !important;
              color: #136dec !important;
              font-weight: 800 !important;
            }
          </style>
        </head>
        <body>
          <div class="w-full min-h-screen">
            ${content}
          </div>
        </body>
      </html>
    `;
  };

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex((s) => s.id === active.id);
      const newIndex = slides.findIndex((s) => s.id === over.id);
      onReorderSlides(arrayMove(slides, oldIndex, newIndex));
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    await ensureApiKey();
    setIsDesigning(true);
    setDesignProgress("Briefing Design Crew...");
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
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || JSON.stringify(err);
      if (errMsg.includes("API key not valid") || errMsg.includes("Requested entity was not found")) {
        setDesignProgress("API Key Invalid. Re-opening selection...");
        if ((window as any).aistudio) {
          await (window as any).aistudio.openSelectKey();
        }
      }
    } finally {
      setIsDesigning(false);
      setDesignProgress("");
    }
  };

  const openStandaloneCourse = () => {
    if (!formState.content) return;
    const blob = new Blob([wrapContentInFrame(formState.content || '')], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col text-white font-sans overflow-hidden">
      {!isLoggedIn ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-zinc-900 border border-white/10 p-10 rounded-sm shadow-2xl space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-serif italic font-black">Admin Access</h2>
              <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 font-bold">Secure Designer Studio</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black tracking-widest text-zinc-400">Username</label>
                  <input
                    type="text"
                    value={loginForm.username}
                    onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="w-full bg-black border border-white/10 p-4 text-sm outline-none focus:border-white transition-all"
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black tracking-widest text-zinc-400">Password</label>
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full bg-black border border-white/10 p-4 text-sm outline-none focus:border-white transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {loginError && (
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider text-center">{loginError}</p>
              )}

              <div className="flex flex-col gap-4">
                <button
                  type="submit"
                  className="w-full bg-white text-black py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all"
                >
                  Enter Studio
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full border border-white/10 text-zinc-500 py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <>
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
              <div className="w-full h-full bg-white overflow-hidden">
                <iframe
                  srcDoc={wrapContentInFrame(formState.content || '')}
                  className="w-full h-full border-none"
                  title="Full Preview"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </div>
            </div>
          )}

          {/* Progress Loading Overlay */}
          {isDesigning && (
            <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center">
              <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mb-8">
                <div className="h-full bg-indigo-500 animate-[loading_2s_infinite]"></div>
              </div>
              <h3 className="text-2xl font-serif italic mb-4">Architecting Digital Publication...</h3>
              <p className="text-[10px] uppercase tracking-[0.6em] text-white/40 font-black animate-pulse">{designProgress}</p>
            </div>
          )}

          <div className="flex justify-between items-center p-6 border-b border-white/10 bg-zinc-900/50">
            <div className="flex items-center gap-12">
              <div className="flex flex-col">
                <h2 className="text-2xl font-serif font-black italic uppercase tracking-tight">Magazine Studio</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${getSupabaseStatus() ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500'}`}></div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">
                    Supabase: {getSupabaseStatus() ? 'Connected' : 'Disconnected (Check .env.local)'}
                  </span>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setActiveTab('orchestrate')} className={`text-[10px] uppercase tracking-[0.3em] font-bold px-4 py-2 ${activeTab === 'orchestrate' ? 'bg-white text-black' : 'text-zinc-500'}`}>Instant Issue</button>
                <button onClick={() => setActiveTab('pages')} className={`text-[10px] uppercase tracking-[0.3em] font-bold px-4 py-2 ${activeTab === 'pages' ? 'bg-white text-black' : 'text-zinc-500'}`}>Pages</button>
                <button onClick={() => setActiveTab('covers')} className={`text-[10px] uppercase tracking-[0.3em] font-bold px-4 py-2 ${activeTab === 'covers' ? 'bg-white text-black' : 'text-zinc-500'}`}>Cover</button>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-500 hover:text-white uppercase text-xs font-black">Exit</button>
          </div>

          <div className="flex-1 flex overflow-hidden">
            {activeTab === 'orchestrate' ? (
              <div className="w-full flex items-center justify-center p-12 bg-[#050505]">
                <div className="max-w-2xl w-full space-y-12">
                  <header className="text-center space-y-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500">Autonomous Creative Orchestrator</span>
                    <h3 className="text-6xl font-serif italic font-black text-white tracking-tighter">Instant Issue Architect.</h3>
                    <p className="text-zinc-500 font-light italic text-lg">One topic. One click. A complete multi-page immersive digital experience generated by the Architect Crew.</p>
                  </header>

                  <div className="bg-white/5 border border-white/10 p-10 rounded-sm space-y-8 shadow-2xl">
                    <div className="space-y-4">
                      <label className="text-[9px] uppercase font-black tracking-widest text-zinc-400">Target Narrative / Market Topic</label>
                      <input
                        value={genTopic}
                        onChange={e => setGenTopic(e.target.value)}
                        placeholder="e.g. Future of Lunar Colonization, 2025 Brutalist Revival..."
                        className="w-full bg-black border border-white/10 p-5 text-xl font-serif italic outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>

                    <button
                      onClick={handleInstantOrchestrate}
                      disabled={!genTopic || isDesigning}
                      className="w-full group relative bg-white text-black py-6 text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl transition-all hover:bg-zinc-200 disabled:opacity-30 overflow-hidden"
                    >
                      <span className="relative z-10">Architect Publication Issue</span>
                      <div className="absolute inset-0 bg-indigo-100/50 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700"></div>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-8 pt-8">
                    <div className="space-y-3">
                      <span className="text-[8px] font-black uppercase text-zinc-600">01. Research</span>
                      <p className="text-[10px] text-zinc-500 leading-relaxed italic">The Archive Agent deep-searches the web for latest trends and facts.</p>
                    </div>
                    <div className="space-y-3">
                      <span className="text-[8px] font-black uppercase text-zinc-600">02. Design</span>
                      <p className="text-[10px] text-zinc-500 leading-relaxed italic">The Editorial Crew builds layouts for Blog, Gallery, and Video Story.</p>
                    </div>
                    <div className="space-y-3">
                      <span className="text-[8px] font-black uppercase text-zinc-600">03. Synthesis</span>
                      <p className="text-[10px] text-zinc-500 leading-relaxed italic">The Orchestrator ties everything into a cohesive fullscreen slide show.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'pages' ? (
              <>
                <div className="w-1/3 p-8 border-r border-white/10 overflow-y-auto admin-scroll space-y-12">
                  <section className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Page Architect</h3>
                      <button onClick={() => { setEditingId(null); setFormState({ type: 'internal', title: '', subtitle: '', description: '', webhookUrl: '', googleSheetSubmissionUrl: '', listicleData: { items: [] }, price: '' }); setWebhookUrl(''); setGoogleSheetSubmissionUrl(''); setStudioMode('crew'); }} className="px-3 py-1 text-[8px] uppercase font-black bg-white/10 hover:bg-white hover:text-black transition-all">New Designer Page</button>
                    </div>

                    <div className="flex gap-2 p-1 bg-white/5 rounded">
                      <button onClick={() => setFormState({ ...formState, type: 'external' })} className={`flex-1 py-2 text-[8px] uppercase font-black ${formState.type === 'external' ? 'bg-white text-black' : ''}`}>External Link</button>
                      <button onClick={() => setFormState({ ...formState, type: 'internal' })} className={`flex-1 py-2 text-[8px] uppercase font-black ${formState.type === 'internal' ? 'bg-white text-black' : ''}`}>Internal Design</button>
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
                              <div ref={menuScrollRef} className="flex flex-col bg-white/5 p-1 rounded overflow-y-auto max-h-32 no-scrollbar gap-1 border border-white/5">
                                {['layout', 'course', 'blog', 'listicle', 'leadGen', 'videoStory', 'miniApp', 'ad', 'research', 'podcast', 'chatbot', 'videoGallery', 'productGallery'].map(m => (
                                  <button key={m} onClick={() => setCrewMode(m as any)} className={`px-4 py-2 text-[8px] uppercase font-black shrink-0 text-left transition-all ${crewMode === m ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:bg-white/10'}`}>
                                    {m === 'leadGen' ? 'LEAD GEN' : m === 'videoStory' ? 'VIDEO STORY' : m.toUpperCase()}
                                  </button>
                                ))}
                              </div>
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
                                  {formState.listicleData?.sidebarImage ? <img src={formState.listicleData.sidebarImage} className="w-full h-full object-cover" alt="Sidebar" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-700 italic">No Img</div>}
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
                          <textarea value={formState.content} onChange={e => setFormState({ ...formState, content: e.target.value })} placeholder="Direct HTML/Tailwind input..." rows={12} className="w-full bg-black border border-white/10 p-3 text-xs font-mono rounded-sm outline-none focus:border-white/20" />
                        )}
                      </div>
                    )}

                    <div className="space-y-4 border-t border-white/10 pt-8">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[8px] uppercase font-bold text-zinc-500 tracking-[0.2em]">Publication Meta</span>
                      </div>
                      {formState.type === 'external' && (
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={formState.url}
                            onChange={e => setFormState({ ...formState, url: e.target.value })}
                            onBlur={() => {
                              if (formState.url && formState.url.startsWith('http')) {
                                handleFetchMetadata();
                              }
                            }}
                            placeholder="Direct Link"
                            className="flex-1 bg-black border border-white/10 p-3 text-xs"
                          />
                          <button
                            onClick={handleFetchMetadata}
                            disabled={isFetchingMetadata || !formState.url}
                            className="px-4 bg-white text-black text-[8px] font-black uppercase tracking-widest hover:bg-zinc-200 disabled:opacity-50 transition-all"
                          >
                            {isFetchingMetadata ? 'Fetching...' : 'Fetch Info'}
                          </button>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <input required type="text" value={formState.title} onChange={e => setFormState({ ...formState, title: e.target.value })} placeholder="Issue Headline" className="w-full bg-black border border-white/10 p-3 text-sm font-serif" />
                        <input type="text" value={formState.subtitle || ''} onChange={e => setFormState({ ...formState, subtitle: e.target.value })} placeholder="Sub-headline" className="w-full bg-black border border-white/10 p-3 text-sm font-serif" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" value={formState.category || ''} onChange={e => setFormState({ ...formState, category: e.target.value })} placeholder="Category" className="w-full bg-black border border-white/10 p-3 text-xs" />
                        <input type="text" value={formState.price || ''} onChange={e => setFormState({ ...formState, price: e.target.value })} placeholder="Display Price" className="w-full bg-black border border-white/10 p-3 text-xs font-mono" />
                      </div>
                      <textarea value={formState.description || ''} onChange={e => setFormState({ ...formState, description: e.target.value })} placeholder="Abstract / Meta Description (Shows in HUD)" rows={2} className="w-full bg-black border border-white/10 p-3 text-xs" />

                      <div className="space-y-4 border-t border-white/5 pt-4">
                        <label className="text-[8px] uppercase font-bold text-indigo-400 tracking-widest block">Typography Overrides</label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <span className="text-[7px] uppercase text-zinc-500">Title Font</span>
                            <select
                              value={formState.titleFont || 'Playfair Display'}
                              onChange={e => setFormState({ ...formState, titleFont: e.target.value })}
                              className="w-full bg-black border border-white/10 p-2 text-[10px] outline-none focus:border-white"
                            >
                              {GOOGLE_FONTS.map(f => <option key={f.family} value={f.family}>{f.name}</option>)}
                            </select>
                            <div className="flex gap-1">
                              <select
                                value={formState.titleFontWeight || 500}
                                onChange={e => setFormState({ ...formState, titleFontWeight: parseInt(e.target.value) })}
                                className="flex-1 bg-black border border-white/10 p-1 text-[10px] outline-none text-zinc-400"
                              >
                                {FONT_WEIGHTS.map(w => <option key={w} value={w}>{w}</option>)}
                              </select>
                              <button
                                onClick={() => setFormState({ ...formState, titleItalic: !formState.titleItalic })}
                                className={`px-2 py-1 text-[7px] uppercase font-black border border-white/5 ${formState.titleItalic ? 'bg-white text-black' : 'text-zinc-500'}`}
                              >
                                I
                              </button>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <span className="text-[7px] uppercase text-zinc-500">Body Font</span>
                            <select
                              value={formState.bodyFont || 'Inter'}
                              onChange={e => setFormState({ ...formState, bodyFont: e.target.value })}
                              className="w-full bg-black border border-white/10 p-2 text-[10px] outline-none focus:border-white"
                            >
                              {GOOGLE_FONTS.map(f => <option key={f.family} value={f.family}>{f.name}</option>)}
                            </select>
                            <div className="flex gap-1">
                              <select
                                value={formState.bodyFontWeight || 500}
                                onChange={e => setFormState({ ...formState, bodyFontWeight: parseInt(e.target.value) })}
                                className="flex-1 bg-black border border-white/10 p-1 text-[10px] outline-none text-zinc-400"
                              >
                                {FONT_WEIGHTS.map(w => <option key={w} value={w}>{w}</option>)}
                              </select>
                              <button
                                onClick={() => setFormState({ ...formState, bodyItalic: !formState.bodyItalic })}
                                className={`px-2 py-1 text-[7px] uppercase font-black border border-white/5 ${formState.bodyItalic ? 'bg-white text-black' : 'text-zinc-500'}`}
                              >
                                I
                              </button>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-[7px] uppercase text-zinc-500">Body Font Size</span>
                                <span className="text-[7px] font-mono text-zinc-400">{formState.bodyFontSize || 16}px</span>
                              </div>
                              <input
                                type="range"
                                min="8"
                                max="100"
                                value={formState.bodyFontSize || 16}
                                onChange={e => setFormState({ ...formState, bodyFontSize: parseInt(e.target.value) })}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[7px] uppercase text-zinc-500">Custom Font Color</span>
                          <div className="flex gap-2">
                            <input type="color" value={formState.fontColor || '#ffffff'} onChange={e => setFormState({ ...formState, fontColor: e.target.value })} className="w-8 h-8 bg-transparent border-none cursor-pointer" />
                            <input value={formState.fontColor || ''} onChange={e => setFormState({ ...formState, fontColor: e.target.value })} placeholder="Inherit" className="flex-1 bg-black border border-white/10 p-2 text-[10px] outline-none" />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => editingId ? onUpdateSlide(formState as any) : onAddSlide({ ...formState, id: Date.now().toString() } as any)}
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
                      <span className="text-[7px] uppercase font-black text-zinc-600 tracking-widest">Drag to Reorder</span>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar pr-2">
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={slides.map(s => s.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {slides.map((s, i) => (
                            <SortableSlide
                              key={s.id}
                              slide={s}
                              index={i}
                              onEdit={() => handleEdit(s)}
                              onRemove={() => onRemoveSlide(s.id)}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                    </div>
                  </section>
                </div>

                <div className="flex-1 bg-zinc-100 flex flex-col p-8 overflow-hidden relative">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 italic">Curatorial Work-in-Progress</h3>
                    {formState.content && (
                      <button onClick={() => setShowFullPreview(true)} className="text-[8px] uppercase font-black tracking-widest text-zinc-400 hover:text-black border border-zinc-200 px-3 py-1 hover:border-black transition-all">Launch Immersive View</button>
                    )}
                  </div>
                  <div className="w-full h-full border border-black/5 rounded-lg overflow-hidden bg-white shadow-2xl relative">
                    <iframe
                      key={`${formState.id}-${formState.bodyFont}-${formState.bodyFontWeight}-${formState.bodyFontSize}`}
                      className="w-full h-full border-none"
                      srcDoc={wrapContentInFrame(formState.content || '<div class="flex items-center justify-center h-full text-zinc-300 uppercase font-black tracking-widest text-[12px] italic">Syncing Preview...</div>')}
                      title="Design Preview"
                      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    />
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
                      <input value={coverConfig.title} onChange={e => onUpdateCover({ ...coverConfig, title: e.target.value })} className="w-full bg-transparent border-b border-white/10 p-4 text-5xl font-serif font-black italic outline-none focus:border-white transition-all text-white placeholder-zinc-800" placeholder="Brand Name" />
                    </section>
                    <section>
                      <label className="text-[10px] uppercase tracking-[0.4em] font-black text-zinc-600 mb-6 block">External Background Image URL</label>
                      <input value={coverConfig.backgroundImageUrl || ''} onChange={e => onUpdateCover({ ...coverConfig, backgroundImageUrl: e.target.value })} className="w-full bg-transparent border-b border-white/10 p-4 text-xs font-mono outline-none focus:border-white transition-all text-white placeholder-zinc-800" placeholder="https://images.unsplash.com/..." />
                      <p className="text-[8px] text-zinc-500 mt-2 uppercase tracking-widest italic">Tip: Use direct image links (ending in .jpg, .png, etc.) for best results.</p>
                    </section>
                    <section>
                      <label className="text-[10px] uppercase tracking-[0.4em] font-black text-zinc-600 mb-6 block">External Background Video URL (YouTube)</label>
                      <input value={coverConfig.backgroundVideoUrl || ''} onChange={e => onUpdateCover({ ...coverConfig, backgroundVideoUrl: e.target.value })} className="w-full bg-transparent border-b border-white/10 p-4 text-xs font-mono outline-none focus:border-white transition-all text-white placeholder-zinc-800" placeholder="https://www.youtube.com/watch?v=..." />
                    </section>
                    <section>
                      <div className="flex justify-between items-center mb-6">
                        <label className="text-[10px] uppercase tracking-[0.4em] font-black text-zinc-600 block">Title Font Size</label>
                        <span className="text-[10px] font-mono text-zinc-400">{coverConfig.titleFontSize || 120}px</span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="300"
                        value={coverConfig.titleFontSize || 120}
                        onChange={e => onUpdateCover({ ...coverConfig, titleFontSize: parseInt(e.target.value) })}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </section>
                    <section>
                      <label className="text-[10px] uppercase tracking-[0.4em] font-black text-zinc-600 mb-6 block">Subtitle / Meta</label>
                      <textarea value={coverConfig.subtitle} onChange={e => onUpdateCover({ ...coverConfig, subtitle: e.target.value })} className="w-full bg-transparent border-b border-white/10 p-4 text-xl italic font-light text-zinc-400 outline-none focus:border-white transition-all" rows={3} />
                    </section>
                    <section className="pt-8 border-t border-white/10">
                      <label className="text-[10px] uppercase tracking-[0.4em] font-black text-zinc-600 mb-6 block">Cover Typography</label>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <span className="text-[8px] uppercase font-bold text-zinc-500 tracking-widest block">Title Font</span>
                          <select
                            value={coverConfig.titleFont || 'Playfair Display'}
                            onChange={e => onUpdateCover({ ...coverConfig, titleFont: e.target.value })}
                            className="w-full bg-zinc-900 border border-white/10 p-4 text-xs outline-none focus:border-white transition-all text-white"
                          >
                            {GOOGLE_FONTS.map(f => <option key={f.family} value={f.family}>{f.name}</option>)}
                          </select>
                          <div className="flex gap-1">
                            <select
                              value={coverConfig.titleFontWeight || 500}
                              onChange={e => onUpdateCover({ ...coverConfig, titleFontWeight: parseInt(e.target.value) })}
                              className="flex-1 bg-zinc-900 border border-white/10 p-2 text-xs outline-none text-zinc-400"
                            >
                              {FONT_WEIGHTS.map(w => <option key={w} value={w}>{w}</option>)}
                            </select>
                            <button
                              onClick={() => onUpdateCover({ ...coverConfig, titleItalic: !coverConfig.titleItalic })}
                              className={`px-3 py-2 text-[8px] uppercase font-black border border-white/5 ${coverConfig.titleItalic ? 'bg-white text-black' : 'text-zinc-500'}`}
                            >
                              Italic
                            </button>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <span className="text-[8px] uppercase font-bold text-zinc-500 tracking-widest block">Body Font</span>
                          <select
                            value={coverConfig.bodyFont || 'Inter'}
                            onChange={e => onUpdateCover({ ...coverConfig, bodyFont: e.target.value })}
                            className="w-full bg-zinc-900 border border-white/10 p-4 text-xs outline-none focus:border-white transition-all text-white"
                          >
                            {GOOGLE_FONTS.map(f => <option key={f.family} value={f.family}>{f.name}</option>)}
                          </select>
                          <div className="flex gap-1">
                            <select
                              value={coverConfig.bodyFontWeight || 500}
                              onChange={e => onUpdateCover({ ...coverConfig, bodyFontWeight: parseInt(e.target.value) })}
                              className="flex-1 bg-zinc-900 border border-white/10 p-2 text-xs outline-none text-zinc-400"
                            >
                              {FONT_WEIGHTS.map(w => <option key={w} value={w}>{w}</option>)}
                            </select>
                            <button
                              onClick={() => onUpdateCover({ ...coverConfig, bodyItalic: !coverConfig.bodyItalic })}
                              className={`px-3 py-2 text-[8px] uppercase font-black border border-white/5 ${coverConfig.bodyItalic ? 'bg-white text-black' : 'text-zinc-500'}`}
                            >
                              Italic
                            </button>
                          </div>
                          <div className="space-y-2 mt-4">
                            <div className="flex justify-between items-center">
                              <span className="text-[8px] uppercase font-bold text-zinc-500 tracking-widest block">Body Font Size</span>
                              <span className="text-[10px] font-mono text-zinc-400">{coverConfig.bodyFontSize || 18}px</span>
                            </div>
                            <input
                              type="range"
                              min="10"
                              max="100"
                              value={coverConfig.bodyFontSize || 18}
                              onChange={e => onUpdateCover({ ...coverConfig, bodyFontSize: parseInt(e.target.value) })}
                              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 space-y-4">
                        <span className="text-[8px] uppercase font-bold text-zinc-500 tracking-widest block">Global Font Color</span>
                        <div className="flex items-center gap-6">
                          <input type="color" value={coverConfig.fontColor || '#ffffff'} onChange={e => onUpdateCover({ ...coverConfig, fontColor: e.target.value })} className="w-12 h-12 bg-transparent border-none cursor-pointer" />
                          <input value={coverConfig.fontColor || ''} onChange={e => onUpdateCover({ ...coverConfig, fontColor: e.target.value })} placeholder="#FFFFFF" className="bg-black border border-white/10 p-3 text-xs font-mono uppercase text-white outline-none" />
                        </div>
                      </div>
                    </section>

                    <section className="pt-8 border-t border-white/10">
                      <label className="text-[10px] uppercase tracking-[0.4em] font-black text-zinc-600 mb-6 block">Sidebar Typography (Editorial Index)</label>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <span className="text-[8px] uppercase font-bold text-zinc-500 tracking-widest block">Sidebar Title Font</span>
                          <select
                            value={coverConfig.sidebarTitleFont || 'Playfair Display'}
                            onChange={e => onUpdateCover({ ...coverConfig, sidebarTitleFont: e.target.value })}
                            className="w-full bg-zinc-900 border border-white/10 p-4 text-xs outline-none focus:border-white transition-all text-white"
                          >
                            {GOOGLE_FONTS.map(f => <option key={f.family} value={f.family}>{f.name}</option>)}
                          </select>
                          <div className="flex gap-1">
                            <select
                              value={coverConfig.sidebarTitleFontWeight || 500}
                              onChange={e => onUpdateCover({ ...coverConfig, sidebarTitleFontWeight: parseInt(e.target.value) })}
                              className="flex-1 bg-zinc-900 border border-white/10 p-2 text-xs outline-none text-zinc-400"
                            >
                              {FONT_WEIGHTS.map(w => <option key={w} value={w}>{w}</option>)}
                            </select>
                            <button
                              onClick={() => onUpdateCover({ ...coverConfig, sidebarTitleItalic: !coverConfig.sidebarTitleItalic })}
                              className={`px-3 py-2 text-[8px] uppercase font-black border border-white/5 ${coverConfig.sidebarTitleItalic ? 'bg-white text-black' : 'text-zinc-500'}`}
                            >
                              Italic
                            </button>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <span className="text-[8px] uppercase font-bold text-zinc-500 tracking-widest block">Sidebar Body Font</span>
                          <select
                            value={coverConfig.sidebarBodyFont || 'Inter'}
                            onChange={e => onUpdateCover({ ...coverConfig, sidebarBodyFont: e.target.value })}
                            className="w-full bg-zinc-900 border border-white/10 p-4 text-xs outline-none focus:border-white transition-all text-white"
                          >
                            {GOOGLE_FONTS.map(f => <option key={f.family} value={f.family}>{f.name}</option>)}
                          </select>
                          <div className="flex gap-1">
                            <select
                              value={coverConfig.sidebarBodyFontWeight || 500}
                              onChange={e => onUpdateCover({ ...coverConfig, sidebarBodyFontWeight: parseInt(e.target.value) })}
                              className="flex-1 bg-zinc-900 border border-white/10 p-2 text-xs outline-none text-zinc-400"
                            >
                              {FONT_WEIGHTS.map(w => <option key={w} value={w}>{w}</option>)}
                            </select>
                            <button
                              onClick={() => onUpdateCover({ ...coverConfig, sidebarBodyItalic: !coverConfig.sidebarBodyItalic })}
                              className={`px-3 py-2 text-[8px] uppercase font-black border border-white/5 ${coverConfig.sidebarBodyItalic ? 'bg-white text-black' : 'text-zinc-500'}`}
                            >
                              Italic
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 space-y-4">
                        <span className="text-[8px] uppercase font-bold text-zinc-500 tracking-widest block">Sidebar Font Color</span>
                        <div className="flex items-center gap-6">
                          <input type="color" value={coverConfig.sidebarFontColor || '#ffffff'} onChange={e => onUpdateCover({ ...coverConfig, sidebarFontColor: e.target.value })} className="w-12 h-12 bg-transparent border-none cursor-pointer" />
                          <input value={coverConfig.sidebarFontColor || ''} onChange={e => onUpdateCover({ ...coverConfig, sidebarFontColor: e.target.value })} placeholder="#FFFFFF" className="bg-black border border-white/10 p-3 text-xs font-mono uppercase text-white outline-none" />
                        </div>
                      </div>
                    </section>
                  </div>
                  <div className="space-y-8">
                    <div className="p-10 border border-white/10 rounded-sm bg-white/5 space-y-6">
                      <h4 className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">Global Accent</h4>
                      <div className="flex items-center gap-6">
                        <input type="color" value={coverConfig.accentColor} onChange={e => onUpdateCover({ ...coverConfig, accentColor: e.target.value })} className="w-16 h-16 bg-transparent border-none cursor-pointer" />
                        <input value={coverConfig.accentColor} onChange={e => onUpdateCover({ ...coverConfig, accentColor: e.target.value })} className="bg-black border border-white/10 p-4 text-xs font-mono uppercase text-white outline-none" />
                      </div>
                    </div>
                    <div className="p-10 border border-white/10 rounded-sm bg-white/5 space-y-6">
                      <h4 className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">Cover Layout Strategy</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {['minimal', 'brutalist', 'classic', 'gradient', 'grid', 'hero'].map(l => (
                          <button key={l} onClick={() => onUpdateCover({ ...coverConfig, layoutId: l as any })} className={`p-4 border text-[9px] uppercase font-black tracking-widest transition-all ${coverConfig.layoutId === l ? 'bg-white text-black border-white' : 'border-white/10 text-zinc-500 hover:border-white/40'}`}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPanel;
