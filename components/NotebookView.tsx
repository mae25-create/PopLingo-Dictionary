import React, { useState } from 'react';
import { DictionaryEntry, LANGUAGES } from '../types';
import { BookOpen, Sparkles, Loader2, PlayCircle } from 'lucide-react';
import { generateStory, fetchAudio } from '../services/geminiService';
import { playPCMAudio } from '../utils/audio';

interface Props {
  notebook: DictionaryEntry[];
  nativeLang: string;
  targetLang: string;
  onRemove: (id: string) => void;
}

const NotebookView: React.FC<Props> = ({ notebook, nativeLang, targetLang, onRemove }) => {
  const [story, setStory] = useState<string | null>(null);
  const [loadingStory, setLoadingStory] = useState(false);
  const [readingStory, setReadingStory] = useState(false);

  const handleGenerateStory = async () => {
    if (notebook.length === 0) return;
    setLoadingStory(true);
    setStory(null);
    try {
      const generatedStory = await generateStory(notebook, nativeLang, targetLang);
      setStory(generatedStory);
    } catch (e) {
      console.error(e);
      setStory("Failed to generate a story. Try again!");
    } finally {
      setLoadingStory(false);
    }
  };

  const handleReadStory = async () => {
    if (!story || readingStory) return;
    setReadingStory(true);
    try {
        // Just read the first chunk if it's too long, or plain text
        // Removing asterisks for cleaner reading
        const cleanText = story.replace(/\*/g, '');
        // For story, we use target lang voice. Note: Story contains translation which might sound weird with target voice.
        // Ideally we split, but for simplicity, we read the whole thing in target voice or just the target part.
        // Let's assume the story is mostly target lang.
        const voice = LANGUAGES.find(l => l.code === targetLang)?.voiceName || 'Kore';
        const audio = await fetchAudio(cleanText.substring(0, 500), voice); // Limit characters for speed/latency
        await playPCMAudio(audio);
    } catch(e) {
        console.error(e);
    } finally {
        setReadingStory(false);
    }
  }

  if (notebook.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-gray-500">
        <BookOpen size={48} className="mb-4 text-gray-300" />
        <p className="text-lg">Your notebook is empty.</p>
        <p className="text-sm">Search and save words to create stories!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-black text-gray-800">My Collection <span className="text-pink-500">({notebook.length})</span></h2>
        <button 
          onClick={handleGenerateStory}
          disabled={loadingStory}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          {loadingStory ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          Make a Story
        </button>
      </div>

      {story && (
        <div className="bg-white p-6 rounded-2xl border-2 border-purple-100 shadow-xl mb-8 animate-fade-in-up">
          <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-purple-600 uppercase tracking-widest text-xs">AI Generated Story</h3>
              <button 
                onClick={handleReadStory}
                disabled={readingStory}
                className="text-purple-400 hover:text-purple-600"
              >
                  {readingStory ? <Loader2 className="animate-spin" size={20}/> : <PlayCircle size={24}/>}
              </button>
          </div>
          <div className="prose prose-purple max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
            {story}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notebook.map((entry) => (
          <div key={entry.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center">
             <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                <img src={entry.imageUrl} className="w-full h-full object-cover" alt={entry.word}/>
             </div>
             <div className="flex-1">
               <h4 className="font-bold text-lg text-gray-800">{entry.word}</h4>
               <p className="text-sm text-gray-500 line-clamp-1">{entry.definition}</p>
             </div>
             <button 
               onClick={() => onRemove(entry.id)}
               className="text-xs text-red-300 hover:text-red-500 px-2 py-1"
             >
               Remove
             </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotebookView;