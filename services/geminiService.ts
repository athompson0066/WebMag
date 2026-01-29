import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WebsiteSlide, ListicleData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper to generate the Listicle/Product Gallery HTML from structured data.
 */
export function generateListicleHtml(title: string, data: ListicleData): string {
  const { sidebarImage, items } = data;
  return `
    <div class="w-full bg-white text-black font-serif overflow-x-hidden selection:bg-black selection:text-white">
      <!-- Full Width Hero Section -->
      <section class="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <div class="absolute inset-0 bg-cover bg-center transition-transform duration-[40s] scale-110 hover:scale-100 ease-linear opacity-50" 
             style="background-image: url('${sidebarImage || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop'}')"></div>
        <div class="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white"></div>
        
        <div class="relative z-10 w-full px-10 md:px-20 text-center flex flex-col items-center">
          <div class="flex flex-col items-center gap-6 mb-8 animate-in fade-in slide-in-from-top-6 duration-1000">
            <div class="px-6 py-2 border border-black/20 backdrop-blur-md rounded-full">
              <span class="text-[8px] font-black uppercase tracking-[0.8em] text-black/60">Digital Curatorial Board // Issue 04</span>
            </div>
          </div>
          <h1 class="text-6xl md:text-[10rem] font-black italic tracking-tighter leading-[0.8] mb-12 uppercase break-words animate-in fade-in zoom-in-95 duration-1000">${title}</h1>
          <div class="h-[1px] w-48 bg-black/30 mb-12"></div>
          <div class="max-w-3xl animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            <p class="text-zinc-800 text-lg md:text-2xl italic leading-relaxed font-light opacity-90">
              An exhaustive archive exploring the intersection of digital infrastructure and cultural evolution. 
              Presenting ${items.length} curated artifacts of significance.
            </p>
          </div>
        </div>
      </section>

      <!-- Full Width Context Section -->
      <section class="w-full px-10 md:px-20 pt-24 md:pt-32 pb-8 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start border-b border-black/5 bg-white">
        <div class="lg:col-span-5 space-y-8">
          <div class="flex items-center gap-4">
             <span class="h-[1px] w-12 bg-black/30"></span>
             <span class="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-500">Foreword</span>
          </div>
          <h2 class="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">Architectural <br/> Context.</h2>
        </div>
        <div class="lg:col-span-7 pt-2 lg:pt-16">
          <p class="text-zinc-800 text-lg md:text-3xl italic leading-relaxed font-light mb-12">
            "In an era of fleeting interactions, we seek the permanent. This collection serves as a definitive roadmap to the spaces and tools that are quietly restructuring our collective reality."
          </p>
          <div class="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">
             <span class="text-black font-black">The Curators</span>
             <span class="opacity-30">/</span>
             <span>Ref. Ed-01</span>
          </div>
        </div>
      </section>
      
      <!-- Full Width 3-Column Grid -->
      <section class="w-full px-10 md:px-20 pt-16 pb-32 bg-white">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
          ${items.map((item, i) => `
            <article class="group flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-700" style="animation-delay: ${i * 100}ms">
              <header class="flex flex-col gap-4">
                <div class="flex items-center justify-between border-b border-black/10 pb-4">
                   <span class="text-[9px] font-mono text-zinc-500 tracking-widest uppercase">ID: 0x${Math.random().toString(16).substr(2, 6)}</span>
                   <span class="text-[9px] font-mono text-black/40 tracking-widest uppercase">Index // ${i + 1}</span>
                </div>
                <div class="flex justify-between items-start gap-4">
                  <h3 class="text-3xl font-bold tracking-tight leading-none transition-all duration-500 group-hover:pl-2 group-hover:text-indigo-600">${item.title}</h3>
                  ${item.price ? `<span class="text-xl font-mono text-black/80 group-hover:text-black transition-colors">${item.price}</span>` : ''}
                </div>
              </header>
              <div class="relative overflow-hidden bg-zinc-100 aspect-[4/5] shadow-[0_0_100px_rgba(0,0,0,0.05)] border border-black/5">
                 ${item.inlineHtml ? `
                   <div class="w-full h-full flex items-center justify-center p-4 bg-zinc-100 overflow-hidden">
                     ${item.inlineHtml}
                   </div>
                 ` : item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title}" class="w-full h-full object-cover transition-all duration-1000 scale-[1.02] group-hover:scale-110" />` : `<div class="w-full h-full flex items-center justify-center italic text-zinc-300 text-[10px] tracking-widest uppercase">Missing Data Stream</div>`}
                 <div class="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-700"></div>
                 <div class="absolute top-6 right-6 p-3 bg-black/10 backdrop-blur-xl border border-white/20 rounded-xs opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                    <span class="text-[8px] font-black text-white uppercase tracking-widest">View Record</span>
                 </div>
              </div>
              <div class="space-y-6">
                <p class="text-black leading-relaxed text-sm italic font-light line-clamp-4 group-hover:text-zinc-600 transition-colors">${item.description}</p>
                ${item.link ? `
                  <div class="pt-2">
                    <a href="${item.link}" target="_blank" class="inline-flex items-center gap-5 group/btn">
                      <div class="flex flex-col">
                        <span class="text-[8px] font-black uppercase tracking-[0.5em] text-black/40 group-hover/btn:text-black transition-colors">${item.price ? 'Purchase' : 'Access Original'}</span>
                        <span class="h-[1px] w-full bg-black/10 group-hover/btn:bg-black transition-all mt-1"></span>
                      </div>
                      <div class="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center text-zinc-600 group-hover/btn:border-black group-hover/btn:text-black transition-all">
                        <span class="text-lg leading-none">→</span>
                      </div>
                    </a>
                  </div>
                ` : ''}
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    </div>
  `;
}

/**
 * Base helper for Crew logic.
 */
async function generateWithScrapingCrew(
  prompt: string, 
  sources: string[], 
  sheetSources: string[], 
  driveSources: string[], 
  webhookUrl: string | undefined, 
  schema: any,
  googleSheetSubmissionUrl?: string
): Promise<any> {
  const sourceContext = sources.length > 0 
    ? `\n\nWEB SOURCES MISSION: Analyze these reference sources deeply: \n${sources.map(url => `- ${url}`).join('\n')}\n`
    : "";

  const sheetContext = sheetSources.length > 0
    ? `\n\nSPREADSHEET DATA MISSION: You are an elite Data Integration Agent. Access and extract structured facts from these sheets: \n${sheetSources.map(url => `- ${url}`).join('\n')}\n`
    : "";

  const driveContext = driveSources.length > 0
    ? `\n\nGOOGLE DRIVE DOCUMENT MISSION: You are a Research Specialist. Reference these shared Google Drive links (PDFs/Docs/etc.) for deep context and factual grounding: \n${driveSources.map(url => `- ${url}`).join('\n')}\n`
    : "";

  const webhookContext = webhookUrl 
    ? `\n\nWEBHOOK INTEGRATION MISSION: The final design MUST include functional interactive components that POST data to this webhook URL: ${webhookUrl}.`
    : "";

  const submissionContext = googleSheetSubmissionUrl
    ? `\n\nLEAD SUBMISSION MISSION: The generated form MUST submit its result to this Google Apps Script / Google Sheets endpoint: ${googleSheetSubmissionUrl}.`
    : "";

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `${prompt}${sourceContext}${sheetContext}${driveContext}${webhookContext}${submissionContext}\nFinal Request: Synthesize all provided information into the required format. Ensure interactive widgets are fully functional with vanilla JS.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  return JSON.parse(response.text.trim());
}

/**
 * The Application Architect Crew
 */
export async function researchAndDesignMiniAppCrew(
  niche: string, 
  instructions: string, 
  imageUrl?: string,
  sources: string[] = [], 
  sheetSources: string[] = [], 
  driveSources: string[] = [],
  webhookUrl?: string
): Promise<any> {
  const specializedPrompt = `
    Act as a unified 'Application Architect Crew'.
    MISSION: Build a fully-featured 'Mini Web App' using a mandatory 2-column layout.
    
    1. LAYOUT ARCHITECTURE (REQUIRED):
       - LEFT COLUMN (EDITORIAL): Display the title ("${niche}"), instructions summary, and FEATURED IMAGE ("${imageUrl || ''}") in a high-end magazine cover style. All text must be black.
       - RIGHT COLUMN (FUNCTIONAL): House the primary interactive application logic on a clean, light background.
    
    NICHE/IDEA: "${niche}"
    INSTRUCTIONS: ${instructions}
  `;

  return generateWithScrapingCrew(
    specializedPrompt,
    sources,
    sheetSources,
    driveSources,
    webhookUrl,
    {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        category: { type: Type.STRING },
        accentColor: { type: Type.STRING },
        content: { type: Type.STRING, description: "Complete HTML/JS/CSS application with 2-column editorial/functional split." }
      },
      required: ["title", "description", "category", "accentColor", "content"]
    }
  );
}

/**
 * The Cinematic Video Story Crew
 */
export async function researchAndDesignVideoStoryCrew(
  videoUrl: string, 
  instructions: string,
  imageUrl?: string,
  sources: string[] = [], 
  sheetSources: string[] = [], 
  driveSources: string[] = [],
  webhookUrl?: string
): Promise<any> {
  const specializedPrompt = `
    Act as an elite 'Cinematic Video Story Crew'. 
    MISSION: Design a full-width immersive page using a 2-column layout.
    
    1. LAYOUT ARCHITECTURE:
       - LEFT COLUMN (EDITORIAL): Featured background image ("${imageUrl || ''}"), title, and cinematic brief in black text.
       - RIGHT COLUMN (THEATRE): The embedded video player (${videoUrl}) and interactive metadata.
    
    VIDEO URL: ${videoUrl}
    ADDITIONAL BRIEF: ${instructions}
  `;

  return generateWithScrapingCrew(
    specializedPrompt,
    sources,
    sheetSources,
    driveSources,
    webhookUrl,
    {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        category: { type: Type.STRING },
        accentColor: { type: Type.STRING },
        content: { type: Type.STRING, description: "2-column layout with Editorial/Theatre split." }
      },
      required: ["title", "description", "category", "accentColor", "content"]
    }
  );
}

/**
 * The Lead Generation Expert Crew
 */
export async function researchAndDesignLeadGenCrew(
  topic: string, 
  instructions: string, 
  imageUrl?: string,
  sources: string[] = [], 
  sheetSources: string[] = [], 
  driveSources: string[] = [],
  webhookUrl?: string,
  googleSheetSubmissionUrl?: string
): Promise<any> {
  const specializedPrompt = `
    Act as an elite 'Lead Generation Expert Crew'. 
    MISSION: Build a high-converting lead generation page using a 2-column layout.
    
    1. LAYOUT ARCHITECTURE:
       - LEFT COLUMN (EDITORIAL): Powerful headline for "${topic}", value proposition text, and FEATURED IMAGE ("${imageUrl || ''}"). Text-black.
       - RIGHT COLUMN (CONVERSION): The optimized form and CTA on a light, minimalist background.
    
    TOPIC: "${topic}"
    DIRECTIVES: ${instructions}
  `;

  return generateWithScrapingCrew(
    specializedPrompt,
    sources,
    sheetSources,
    driveSources,
    webhookUrl,
    {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        category: { type: Type.STRING },
        accentColor: { type: Type.STRING },
        content: { type: Type.STRING, description: "2-column layout HTML with Editorial/Conversion split." }
      },
      required: ["title", "description", "category", "accentColor", "content"]
    },
    googleSheetSubmissionUrl
  );
}

export async function researchAndDesignListicleCrew(
  topic: string, 
  instructions: string, 
  imageUrl?: string,
  sources: string[] = [],
  sheetSources: string[] = [],
  driveSources: string[] = [],
  webhookUrl?: string
): Promise<any> {
  const result = await generateWithScrapingCrew(
    `Act as an elite 'Listicle Expert Crew'. Topic: "${topic}". IMAGE: "${imageUrl || ''}". MISSION: Generate 9-12 items. Use a high-end grid or 2-column layout where appropriate.`,
    sources,
    sheetSources,
    driveSources,
    webhookUrl,
    {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        category: { type: Type.STRING },
        accentColor: { type: Type.STRING },
        listicleData: {
          type: Type.OBJECT,
          properties: {
            sidebarImage: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  imageUrl: { type: Type.STRING },
                  link: { type: Type.STRING },
                  price: { type: Type.STRING },
                  inlineHtml: { type: Type.STRING }
                },
                required: ["id", "title", "description"]
              }
            }
          },
          required: ["items"]
        }
      },
      required: ["title", "description", "category", "accentColor", "listicleData"]
    }
  );

  if (imageUrl) result.listicleData.sidebarImage = imageUrl;
  result.content = generateListicleHtml(result.title, result.listicleData);
  return result;
}

export async function researchAndDesignFeature(
  keyword: string, 
  instructions: string, 
  imageUrl?: string,
  sources: string[] = [], 
  sheetSources: string[] = [], 
  driveSources: string[] = [],
  webhookUrl?: string
): Promise<any> {
  return generateWithScrapingCrew(
    `Act as a 'Feature Research Crew'. Topic: "${keyword}". FEATURED IMAGE: "${imageUrl || ''}". Use a premium 2-column Editorial layout.`,
    sources,
    sheetSources,
    driveSources,
    webhookUrl,
    {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        category: { type: Type.STRING },
        accentColor: { type: Type.STRING },
        content: { type: Type.STRING }
      },
      required: ["title", "description", "category", "accentColor", "content"]
    }
  );
}

export async function researchAndDesignCourseCrew(
  topic: string, 
  instructions: string, 
  imageUrl?: string,
  sources: string[] = [], 
  sheetSources: string[] = [], 
  driveSources: string[] = [],
  webhookUrl?: string
): Promise<any> {
  const specializedPrompt = `
    Act as an elite 'Course Creator Expert Crew'. 
    MISSION: Generate a high-fidelity 2-column course landing page.
    
    1. LAYOUT ARCHITECTURE (MANDATORY):
       - LEFT COLUMN (EDITORIAL): Display course title ("${topic}"), objectives, and FEATURED IMAGE ("${imageUrl || ''}") in a premium magazine style. All text must be black.
       - RIGHT COLUMN (CURRICULUM): Interactive lesson grid, enrollment logic, and syllabus on a clean light background. 
    
    CRITICAL: Use window.trackEnrollment(courseId, action, targetUrl).
    TOPIC: "${topic}"
    DIRECTIVES: ${instructions}
  `;

  return generateWithScrapingCrew(
    specializedPrompt,
    sources,
    sheetSources,
    driveSources,
    webhookUrl,
    {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        subtitle: { type: Type.STRING },
        description: { type: Type.STRING },
        price: { type: Type.STRING },
        category: { type: Type.STRING },
        accentColor: { type: Type.STRING },
        content: { type: Type.STRING, description: "2-column layout with Editorial/Curriculum split." }
      },
      required: ["title", "description", "category", "accentColor", "content"]
    }
  );
}

export async function researchAndDesignChatbotCrew(
  niche: string, 
  instructions: string, 
  imageUrl?: string,
  sources: string[] = [], 
  sheetSources: string[] = [], 
  driveSources: string[] = [],
  webhookUrl?: string
): Promise<any> {
  const specializedPrompt = `
    Act as a 'Chatbot Architect Crew'. 
    MISSION: Build an interactive chatbot using a mandatory 2-column layout.
    
    1. LAYOUT ARCHITECTURE (MANDATORY):
       - LEFT COLUMN (EDITORIAL): Featured brand image ("${imageUrl || ''}"), title ("${niche}"), and mission statement in black text.
       - RIGHT COLUMN (CHAT LAB): Modern, clean chat interface on a light background.
    
    INTERACTION: Use window.sendQuickReply(text) and window.sendMessage(text).
    NICHE: "${niche}".
    ADDITIONAL CONTEXT: ${instructions}
  `;

  return generateWithScrapingCrew(
    specializedPrompt,
    sources,
    sheetSources,
    driveSources,
    webhookUrl,
    {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        category: { type: Type.STRING },
        accentColor: { type: Type.STRING },
        content: { type: Type.STRING, description: "2-column layout with Editorial/Chat split." }
      },
      required: ["title", "description", "category", "accentColor", "content"]
    }
  );
}

export async function researchAndDesignProductGallery(
  topic: string, 
  instructions: string, 
  imageUrl?: string,
  sources: string[] = [], 
  sheetSources: string[] = [], 
  driveSources: string[] = [],
  webhookUrl?: string
): Promise<any> {
  const result = await generateWithScrapingCrew(
    `Act as a 'Product Gallery Crew'. Topic: "${topic}". IMAGE: "${imageUrl || ''}". Use a 2-column split if relevant or a high-end editorial showcase.`,
    sources,
    sheetSources,
    driveSources,
    webhookUrl,
    {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        category: { type: Type.STRING },
        accentColor: { type: Type.STRING },
        listicleData: {
          type: Type.OBJECT,
          properties: {
            sidebarImage: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  imageUrl: { type: Type.STRING },
                  link: { type: Type.STRING },
                  price: { type: Type.STRING }
                },
                required: ["id", "title", "description"]
              }
            }
          },
          required: ["items"]
        }
      },
      required: ["title", "description", "category", "accentColor", "listicleData"]
    }
  );

  result.content = generateListicleHtml(result.title, result.listicleData);
  return result;
}

export async function curateMagazineIssue(
  topic: string, 
  count: number = 10,
  sourceUrl?: string,
  instructions?: string
): Promise<WebsiteSlide[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `MISSION: Find ${count} real websites about "${topic}".`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            url: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            accentColor: { type: Type.STRING },
            type: { type: Type.STRING, description: "Must be 'external'" }
          },
          required: ["id", "url", "title", "description", "category", "accentColor", "type"]
        }
      }
    }
  });

  try {
    const jsonStr = response.text.trim();
    const parsed = JSON.parse(jsonStr);
    return parsed.map((s: any) => ({ ...s, id: Math.random().toString(36).substr(2, 9), type: 'external' }));
  } catch (error) {
    console.error("Failed to parse curation:", error);
    return [];
  }
}

export async function generateStudioLayout(content: string, instructions: string, imageUrl?: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Act as a 'Digital Editorial Design Crew'. Construct a premium 2-column magazine layout. 
    LEFT: Image ("${imageUrl || ''}") and Title. 
    RIGHT: Content. 
    RAW CONTENT: ${content}. BRIEF: ${instructions}.`,
  });
  let output = response.text.trim();
  output = output.replace(/^```html\n?/, '').replace(/\n?```$/, '');
  return output.trim();
}

export async function researchAndDesignVideoGallery(
  keyword: string, 
  instructions: string, 
  imageUrl?: string,
  sources: string[] = [], 
  sheetSources: string[] = [], 
  driveSources: string[] = [],
  webhookUrl?: string
): Promise<any> {
  return generateWithScrapingCrew(
    `Act as a 'Video Gallery Crew'. Topic: "${keyword}". IMAGE: "${imageUrl || ''}". Mandatory 2-column split.`,
    sources,
    sheetSources,
    driveSources,
    webhookUrl,
    {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        category: { type: Type.STRING },
        accentColor: { type: Type.STRING },
        content: { type: Type.STRING }
      },
      required: ["title", "description", "category", "accentColor", "content"]
    }
  );
}

export async function generatePodcast(
  topic: string, 
  mode: 'solo' | 'duo', 
  instructions: string, 
  imageUrl?: string, 
  sources: string[] = [], 
  sheetSources: string[] = [], 
  driveSources: string[] = [],
  webhookUrl?: string
) {
  const result = await generateWithScrapingCrew(
    `Act as a 'Podcast Crew'. Topic: "${topic}". IMAGE: "${imageUrl || ''}". Mandatory 2-column Editorial layout.`,
    sources,
    sheetSources,
    driveSources,
    webhookUrl,
    {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        category: { type: Type.STRING },
        accentColor: { type: Type.STRING },
        content: { type: Type.STRING }
      },
      required: ["title", "description", "category", "accentColor", "content"]
    }
  );

  const ttsResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text: `Welcome to this special curated podcast on ${topic}. Data provided by your integrated sources.` }] }],
    config: { 
      responseModalities: [Modality.AUDIO], 
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: mode === 'solo' ? 'Kore' : 'Puck' } } } 
    }
  });

  const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
  return { ...result, audioData: base64Audio };
}

export async function researchAndDesignBlogCrew(
  topic: string, 
  instructions: string, 
  imageUrl?: string,
  rawContent: string = "",
  sources: string[] = [], 
  sheetSources: string[] = [], 
  driveSources: string[] = [],
  webhookUrl?: string
): Promise<any> {
  const specializedPrompt = `
    Act as an elite 'Blog Expert Crew'. 
    MISSION: Construct a premium 2-column blog article.
    
    1. RAW CONTENT: Use the following text as the primary article source: "${rawContent}"
    
    2. MANDATORY ARCHITECTURE:
       - LEFT (EDITORIAL): Featured background image ("${imageUrl || ''}"), Title ("${topic}"), and a sophisticated editorial brief in black text.
       - RIGHT (ARTICLE LAB): A beautifully laid out blog post based on the RAW CONTENT. Use bold drop-caps, elegant serif typography (Playfair Display) for headers, and clean sans-serif for the body. Ensure all text is black on white. 
    
    TOPIC: "${topic}". INSTRUCTIONS: ${instructions}.
  `;

  return generateWithScrapingCrew(
    specializedPrompt,
    sources,
    sheetSources,
    driveSources,
    webhookUrl,
    {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        category: { type: Type.STRING },
        accentColor: { type: Type.STRING },
        content: { type: Type.STRING, description: "2-column blog article with Editorial/Article split." }
      },
      required: ["title", "description", "category", "accentColor", "content"]
    }
  );
}

export async function researchAndDesignAdCrew(
  topic: string, 
  instructions: string, 
  imageUrl?: string, 
  sources: string[] = [], 
  sheetSources: string[] = [], 
  driveSources: string[] = [],
  webhookUrl?: string
): Promise<any> {
  return generateWithScrapingCrew(
    `Act as a world-class 'Advertising Agent Crew'. Topic: "${topic}". IMAGE: "${imageUrl || ''}". Premium 2-column split.`,
    sources,
    sheetSources,
    driveSources,
    webhookUrl,
    {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        category: { type: Type.STRING },
        accentColor: { type: Type.STRING },
        content: { type: Type.STRING }
      },
      required: ["title", "description", "category", "accentColor", "content"]
    }
  );
}
