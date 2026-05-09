import React from 'react';
import { BookOpen, Loader2 } from 'lucide-react';

export default function SocialStoryView({ socialStoryData, isGeneratingStory }) {
  return (
    <>
        {!socialStoryData && !isGeneratingStory && (
            <div className="flex flex-col items-center justify-center h-[50vh] opacity-30 text-center no-print">
               <BookOpen className="w-24 h-24 mb-4 text-black" />
               <p className="text-2xl font-bold uppercase tracking-widest">No Story Generated</p>
               <p className="text-lg font-medium">Use the sidebar to auto-generate a personalized social story.</p>
            </div>
        )}

        {isGeneratingStory && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center no-print">
               <Loader2 className="w-20 h-20 mb-4 text-indigo-600 animate-spin" />
               <p className="text-2xl font-bold uppercase tracking-widest text-indigo-900">Crafting Story & Illustrations...</p>
               <p className="text-lg font-medium text-slate-500 animate-pulse">Consulting clinical core and rendering visuals via Imagen.</p>
            </div>
        )}

        {socialStoryData && !isGeneratingStory && (
            <div className="a4-container bg-white shadow-xl rounded-2xl print:shadow-none print:rounded-none flex flex-col p-8 print:p-0 transition-all animate-in zoom-in-95 duration-500">
                <h1 className="text-3xl font-black text-center mb-6 border-b-4 border-slate-800 pb-4" contentEditable suppressContentEditableWarning>{socialStoryData.title}</h1>
                <div className="grid grid-cols-2 gap-6 flex-grow">
                    {socialStoryData.pages.map(page => (
                        <div key={page.id} className="social-story-page border-4 border-slate-800 rounded-2xl p-4 flex flex-col h-full text-center hover:bg-slate-50 transition-colors">
                            <div className="flex-grow flex items-center justify-center bg-slate-50 rounded-xl mb-4 border-2 border-dashed border-slate-300 overflow-hidden relative">
                                {page.status === 'loading' && <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />}
                                {page.status === 'success' && <img src={page.imgUrl} className="object-cover w-full h-full" alt="Story Illustration" />}
                                {page.status === 'error' && <span className="text-slate-400 font-bold uppercase text-xs">Image Generation Failed</span>}
                            </div>
                            <p className="text-xl font-bold text-slate-800 leading-snug" contentEditable suppressContentEditableWarning>{page.text}</p>
                            <span className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Page {page.id + 1}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </>
  );
}
