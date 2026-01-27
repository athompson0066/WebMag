import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WebsiteSlide, ListicleData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Helper to generate the Listicle HTML from structured data.
 * Redesigned for a professional, high-end editorial aesthetic.
 */
export function generateListicleHtml(title: string, data: ListicleData): string {
  const { sidebarImage, items } = data;
  return `
    <div class="w-full bg-[#050505] text-white font-serif overflow-x-hidden selection:bg-white selection:text-black">
      <!-- High-End Cinematic Hero -->
      <section class="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <!-- Background Layer with Slow Parallax Motion -->
        <div class="absolute inset-0 bg-cover bg-center transition-transform duration-[40s] scale-110 hover:scale-100 ease-linear opacity-60" 
             style="background-image: url('${sidebarImage || 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop'}')"></div>
        
        <!-- Precision Overlays -->
        <div class="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40"></div>
        <div class="absolute inset-0 backdrop-grayscale-[0.2]"></div>

        <!-- Floating Hero Content -->
        <div class="relative z-10 w-full max-w-6xl mx-auto px-10 text-center flex flex-col items-center">
          <div class="flex flex-col items-center gap-6 mb-12 animate-in fade-in slide-in-from-top-6 duration-1000">
            <div class="px-6 py-2 border border-white/20 backdrop-blur-md rounded-full">
              <span class="text-[8px] font-black uppercase tracking-[0.8em] text-white/60">Digital Curatorial Board // Vol. 25</span>
            </div>
          </div>
          
          <h1 class="text-5xl md:text-7xl lg:text-8xl font-black italic tracking-tighter leading-[0.85] mb-12 uppercase break-words animate-in fade-in zoom-in-95 duration-1000">
            ${title}
          </h1>
          
          <div class="h-[2px] w-32 bg-white mb-12"></div>
          
          <div class="max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            <p class="text-zinc-400 text-base md:text-xl italic leading-relaxed font-light opacity-90">
              An exhaustive archive exploring the intersection of digital infrastructure and cultural evolution. 
              Presenting ${items.length} artifacts of significance.
            </p>
          </div>
        </div>

        <!-- Scroll Anchor -->
        <div class="absolute bottom-12 left-10 flex items-center gap-6 opacity-30 hover:opacity-100 transition-opacity">
           <span class="text-[8px] font-black uppercase tracking-[0.6em] vertical-text">Sequence</span>
           <div class="w-[1px] h-20 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </section>

      <!-- The Manifest: Professional Bridge -->
      <section class="w-full max-w-7xl mx-auto px-10 md:px-20 py-32 md:py-48 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start border-b border-white/5">
        <div class="lg:col-span-5 space-y-8">
          <div class="flex items-center gap-4">
             <span class="h-[1px] w-12 bg-white/30"></span>
             <span class="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-500">Foreword</span>
          </div>
          <h2 class="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
            Architectural <br/> Context.
          </h2>
        </div>
        <div class="lg:col-span-7 pt-2 lg:pt-16">
          <p class="text-zinc-500 text-lg md:text-2xl italic leading-relaxed font-light mb-12">
            "In an era of fleeting interactions, we seek the permanent. This collection serves as a definitive roadmap to the spaces and tools that are quietly restructuring our collective reality."
          </p>
          <div class="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">
             <span class="text-white">The Curators</span>
             <span class="opacity-30">/</span>
             <span>Ref. Ed-01</span>
          </div>
        </div>
      </section>
      
      <!-- The Exhibit Grid -->
      <section class="w-full max-w-7xl mx-auto px-10 md:px-20 py-32">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-40">
          ${items.map((item, i) => `
            <article class="group flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-700" style="animation-delay: ${i * 100}ms">
              
              <!-- Card Header: Technical Meta -->
              <header class="flex flex-col gap-4">
                <div class="flex items-center justify-between border-b border-white/10 pb-4">
                   <span class="text-[9px] font-mono text-zinc-500 tracking-widest uppercase">ID: 0x${Math.random().toString(16).substr(2, 6)}</span>
                   <span class="text-[9px] font-mono text-white/40 tracking-widest uppercase">Index // ${i + 1}</span>
                </div>
                <h3 class="text-3xl font-bold tracking-tight leading-none transition-all duration-500 group-hover:pl-2 group-hover:text-white">${item.title}</h3>
              </header>

              <!-- Image: Precision Framing -->
              <div class="relative overflow-hidden bg-zinc-900 aspect-[3/4] shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5">
                 ${item.imageUrl ? `
                    <img src="${item.imageUrl}" 
                         alt="${item.title}"
                         class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-[1.02] group-hover:scale-110" />
                 ` : `
                    <div class="w-full h-full flex items-center justify-center italic text-zinc-800 text-[10px] tracking-widest uppercase">Missing Data Stream</div>
                 `}
                 <div class="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700"></div>
                 
                 <!-- Geometric UI Detail -->
                 <div class="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xs opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                    <span class="text-[8px] font-black text-white uppercase tracking-widest">View Record</span>
                 </div>
              </div>

              <!-- Content: Clean Typography -->
              <div class="space-y-6">
                <p class="text-zinc-500 leading-relaxed text-sm italic font-light line-clamp-4 group-hover:text-zinc-300 transition-colors">
                  ${item.description}
                </p>
                
                ${item.link ? `
                  <div class="pt-2">
                    <a href="${item.link}" target="_blank" 
                       class="inline-flex items-center gap-5 group/btn">
                      <div class="flex flex-col">
                        <span class="text-[8px] font-black uppercase tracking-[0.5em] text-white/40 group-hover/btn:text-white transition-colors">Access Original</span>
                        <span class="h-[1px] w-full bg-white/10 group-hover/btn:bg-white transition-all mt-1"></span>
                      </div>
                      <div class="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-600 group-hover/btn:border-white group-hover/btn:text-white transition-all">
                        <span class="text-lg leading-none">→</span>
                      </div>
                    </a>
                  </div>
                ` : ''}
              </div>
            </article>
          `).join('')}
        </div>
        
        <!-- Deep Footer: Issue Closure -->
        <footer class="mt-64 pt-32 border-t border-white/5 flex flex-col items-center text-center">
          <div class="flex items-center gap-10 mb-16 opacity-20">
             <div class="w-12 h-[1px] bg-white"></div>
             <div class="text-[12px] italic">End Transmission</div>
             <div class="w-12 h-[1px] bg-white"></div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-16 w-full text-[9px] font-black uppercase tracking-[0.5em] text-zinc-800">
             <div class="flex flex-col gap-3">
                <span class="text-zinc-500">Edition</span>
                <span class="text-white/20">Autumn / 2025</span>
             </div>
             <div class="flex flex-col gap-3">
                <span class="text-zinc-500">Frequency</span>
                <span class="text-white/20">Bi-Weekly Publication</span>
             </div>
             <div class="flex flex-col gap-3">
                <span class="text-zinc-500">Curator</span>
                <span class="text-white/20">Digital Studio Core</span>
             </div>
          </div>

          <p class="mt-32 text-[7px] uppercase tracking-[0.8em] text-zinc-900 font-black">Powered by Gemini Intelligent Design // Sequence 01</p>
        </footer>
      </section>
    </div>
  `;
}

/**
 * Crew 1: Targeted Web-Scraping & Directory Crew
 */
export async function curateMagazineIssue(
  topic: string, 
  count: number = 10,
  sourceUrl?: string,
  instructions?: string
): Promise<WebsiteSlide[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are directing an elite 'Targeted Web-Scraping & Directory Crew'. MISSION: Find ${count} real websites about "${topic}".`,
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

/**
 * Crew 11: Listicle Expert Crew
 */
export async function researchAndDesignListicleCrew(
  topic: string, 
  instructions: string, 
  imageUrl?: string,
  buttonText?: string,
  buttonLink?: string
): Promise<{
  title: string, description: string, category: string, accentColor: string, listicleData: ListicleData, content: string
}> {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Act as an elite 'Listicle Expert Crew'. Topic: "${topic}". 
    Instructions: ${instructions}.
    MISSION: Research this topic and provide a structured JSON list of 9-12 high-impact items.
    Each item must have:
    1. Catchy Title
    2. 20-word engaging Description
    3. High-quality Image URL
    4. Relevant External Link.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
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
                    link: { type: Type.STRING }
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
    }
  });

  const result = JSON.parse(response.text.trim());
  if (imageUrl) result.listicleData.sidebarImage = imageUrl;
  
  result.content = generateListicleHtml(result.title, result.listicleData);
  return result;
}

export async function generateStudioLayout(content: string, instructions: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Act as a 'Digital Editorial Design Crew'. Construct a premium magazine HTML layout. RAW CONTENT: ${content}. BRIEF: ${instructions}.`,
  });
  let output = response.text.trim();
  output = output.replace(/^```html\n?/, '').replace(/\n?```$/, '');
  return output.trim();
}

export async function researchAndDesignFeature(keyword: string, instructions: string): Promise<{
  title: string, description: string, category: string, accentColor: string, content: string
}> {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Act as a 'Feature Research Crew'. Topic: "${keyword}". Instructions: ${instructions}.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
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
    }
  });
  return JSON.parse(response.text.trim());
}

export async function researchAndDesignVideoGallery(keyword: string, instructions: string): Promise<{
  title: string, description: string, category: string, accentColor: string, content: string
}> {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Act as a 'Video Gallery Crew'. Topic: "${keyword}".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
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
    }
  });
  return JSON.parse(response.text.trim());
}

export async function researchAndDesignProductGallery(topic: string, instructions: string): Promise<{
  title: string, description: string, category: string, accentColor: string, content: string
}> {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Act as a 'Product Gallery Crew'.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
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
    }
  });
  return JSON.parse(response.text.trim());
}

export async function researchAndDesignChatbotCrew(niche: string, instructions: string, imageUrl?: string): Promise<{
  title: string, description: string, category: string, accentColor: string, content: string
}> {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Act as a 'Chatbot Architect Crew'.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
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
    }
  });
  return JSON.parse(response.text.trim());
}

export async function researchAndDesignBlogCrew(
  topic: string, 
  instructions: string, 
  imageUrl?: string,
  buttonText?: string,
  buttonLink?: string
): Promise<{
  title: string, description: string, category: string, accentColor: string, content: string
}> {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Act as an elite 'Blog Expert Crew'.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
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
    }
  });
  return JSON.parse(response.text.trim());
}

export async function researchAndDesignAdCrew(
  topic: string,
  instructions: string,
  imageUrl?: string,
  buttonText?: string,
  buttonLink?: string
): Promise<{
  title: string, description: string, category: string, accentColor: string, content: string
}> {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Act as a world-class 'Advertising Agent Crew'.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
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
    }
  });
  return JSON.parse(response.text.trim());
}

export async function generatePodcast(topic: string, mode: 'solo' | 'duo', instructions: string, imageUrl?: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Act as an elite 'Podcast Specialist Crew'.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
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
    }
  });

  const parsed = JSON.parse(response.text.trim());
  
  const ttsResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text: `Welcome to this special podcast episode on ${topic}.` }] }],
    config: { 
      responseModalities: [Modality.AUDIO], 
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: mode === 'solo' ? 'Kore' : 'Puck' } } } 
    }
  });

  const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
  return { ...parsed, audioData: base64Audio };
}

export async function researchAndDesignCourseCrew(topic: string, instructions: string, customImageUrl?: string): Promise<{
  title: string, description: string, category: string, accentColor: string, content: string
}> {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Act as a 'Course Creator Crew'.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
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
    }
  });
  return JSON.parse(response.text.trim());
}