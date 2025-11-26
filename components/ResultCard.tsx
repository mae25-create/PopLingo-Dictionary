import React, { useState } from 'react';
import { DictionaryEntry, LANGUAGES } from '../types';
import { Volume2, Bookmark, BookmarkCheck, Loader2, Sparkles } from 'lucide-react';
import { fetchAudio } from '../services/geminiService';
import { playPCMAudio } from '../utils/audio';

interface Props {
  entry: DictionaryEntry;
  onSave: (entry: DictionaryEntry) => void;
  isSaved: boolean;
  targetLangCode: string;
}

const ResultCard: React.FC<Props> = ({ entry, onSave, isSaved, targetLangCode }) => {
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);

  const getVoiceName = () => {
    return LANGUAGES.find(l => l.code === targetLangCode)?.voiceName || 'Kore';
  };

  const handlePlayAudio = async (text: string, id: string) => {
    if (loadingAudio) return;
    setLoadingAudio(id);
    try {
      const audioData = await fetchAudio(text, getVoiceName());
      await playPCMAudio(audioData);
    } catch (e) {
      console.error("Audio playback failed", e);
      // Could show a toast here in a real app
    } finally {
      setLoadingAudio(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border-4 border-b-8 border-indigo-100 overflow-hidden animate-fade-in-up">
      {/* Header Image & Word */}
      <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {entry.imageUrl ? (
          <img src={entry.imageUrl} alt={entry.word} className="w-full h-full object-cover" />
        ) : (
          <div className="text-gray-300">No Image Generated</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
          <div className="flex justify-between items-end">
             <div>
                <h2 className="text-4xl font-extrabold text-white tracking-tight">{entry.word}</h2>
                <p className="text-white/90 font-medium text-lg mt-1">{entry.definition}</p>
             </div>
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 handlePlayAudio(entry.word, 'main');
               }}
               className="bg-white/20 backdrop-blur-md p-4 rounded-full text-white hover:bg-white/40 transition-all active:scale-95 flex items-center justify-center shadow-lg"
               aria-label="Listen to word pronunciation"
               disabled={loadingAudio !== null}
             >
                {loadingAudio === 'main' ? <Loader2 className="animate-spin" size={24} /> : <Volume2 size={24} />}
             </button>
          </div>
        </div>
      </div>

      {/* Usage Note */}
      <div className="p-6 bg-yellow-50 border-b border-yellow-100">
        <div className="flex items-start gap-3">
          <Sparkles className="text-yellow-500 shrink-0 mt-1" size={20} />
          <div>
             <h3 className="font-bold text-yellow-800 text-xs uppercase tracking-wide mb-1">The Vibe Check</h3>
             <p className="text-gray-700 leading-relaxed text-sm md:text-base">{entry.usageNote}</p>
          </div>
        </div>
      </div>

      {/* Examples */}
      <div className="p-6 space-y-4">
        <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wide mb-2">Examples in Context</h3>
        {entry.examples.map((ex, idx) => (
          <div key={idx} className="bg-gray-50 rounded-xl p-4 hover:bg-indigo-50 transition-colors group border border-transparent hover:border-indigo-100">
            <div className="flex justify-between items-center gap-4">
               <div className="flex-1">
                  <p className="font-semibold text-indigo-900 text-lg leading-snug">{ex.target}</p>
                  <p className="text-gray-500 text-sm mt-1">{ex.native}</p>
               </div>
               <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayAudio(ex.target, `ex-${idx}`);
                }}
                className={`p-3 rounded-full transition-all active:scale-95 shrink-0 ${
                    loadingAudio === `ex-${idx}` 
                    ? 'bg-indigo-100 text-indigo-400'
                    : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-500 hover:text-white hover:shadow-md'
                }`}
                aria-label="Listen to example sentence"
                disabled={loadingAudio !== null}
               >
                 {loadingAudio === `ex-${idx}` ? (
                   <Loader2 size={20} className="animate-spin" />
                 ) : (
                   <Volume2 size={20} />
                 )}
               </button>
            </div>
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="p-6 pt-0">
        <button
          onClick={() => onSave(entry)}
          disabled={isSaved}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${
            isSaved 
              ? 'bg-green-100 text-green-600 cursor-default' 
              : 'bg-black text-white shadow-lg hover:shadow-xl hover:bg-gray-800'
          }`}
        >
          {isSaved ? (
            <>
              <BookmarkCheck size={24} />
              Saved to Notebook
            </>
          ) : (
            <>
              <Bookmark size={24} />
              Save to Notebook
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ResultCard;