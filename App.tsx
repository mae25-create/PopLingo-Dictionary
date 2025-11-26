import React, { useState, useEffect } from 'react';
import { Search, Book, GraduationCap, X } from 'lucide-react';
import { DictionaryEntry, ViewState } from './types';
import LanguageSelector from './components/LanguageSelector';
import ResultCard from './components/ResultCard';
import NotebookView from './components/NotebookView';
import StudyView from './components/StudyView';
import { fetchDefinition, fetchImage, fetchAudio } from './services/geminiService';
import { playPCMAudio } from './utils/audio';

const App: React.FC = () => {
  // State
  const [nativeLang, setNativeLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [searchInput, setSearchInput] = useState('');
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DictionaryEntry | null>(null);
  
  // Notebook persistence
  const [notebook, setNotebook] = useState<DictionaryEntry[]>(() => {
    const saved = localStorage.getItem('poplingo-notebook');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('poplingo-notebook', JSON.stringify(notebook));
  }, [notebook]);

  // Handlers
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchInput.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      // 1. Fetch Definition (Text)
      const defData = await fetchDefinition(searchInput, nativeLang, targetLang);
      
      const newEntry: DictionaryEntry = {
        id: Date.now().toString(),
        word: defData.word || searchInput,
        definition: defData.definition || '',
        examples: defData.examples || [],
        usageNote: defData.usageNote || '',
        nativeLanguage: nativeLang,
        targetLanguage: targetLang,
        imageUrl: '', // Will fill below
        timestamp: Date.now(),
      };

      // 2. Fetch Image in parallel with audio pre-fetch attempt (optional optimization)
      const imageUrl = await fetchImage(newEntry.word);
      newEntry.imageUrl = imageUrl;
      
      setResult(newEntry);
      
      // 3. Auto-play audio on success? Let's just ready it.
      // We can pre-fetch main audio here if we wanted to be super fast.

    } catch (error) {
      console.error(error);
      alert("Oops! AI got confused. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveToNotebook = (entry: DictionaryEntry) => {
    if (!notebook.find(n => n.word === entry.word && n.targetLanguage === entry.targetLanguage)) {
      setNotebook([entry, ...notebook]);
    }
  };

  const removeFromNotebook = (id: string) => {
    setNotebook(notebook.filter(n => n.id !== id));
  };

  return (
    <div className="min-h-screen pb-20 max-w-lg mx-auto bg-gray-50 shadow-2xl overflow-hidden relative">
      
      {/* Top Bar */}
      <header className="bg-white p-6 pb-4 sticky top-0 z-20 border-b border-gray-100">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-4 tracking-tighter">
          PopLingo
        </h1>
        
        {currentView === 'home' && (
           <LanguageSelector 
             nativeLang={nativeLang}
             setNativeLang={setNativeLang}
             targetLang={targetLang}
             setTargetLang={setTargetLang}
           />
        )}
      </header>

      {/* Main Content Area */}
      <main className="p-4">
        
        {/* Search View */}
        {currentView === 'home' && (
          <>
            <form onSubmit={handleSearch} className="relative mb-8">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Type a word, phrase, or sentence..."
                className="w-full bg-white p-5 pr-14 rounded-3xl shadow-lg border-2 border-transparent focus:border-indigo-400 focus:outline-none text-lg font-medium placeholder-gray-300 transition-all"
              />
              <button 
                type="submit"
                disabled={loading}
                className="absolute right-3 top-3 bg-black text-white p-3 rounded-full hover:scale-105 transition-transform disabled:opacity-50"
              >
                {loading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                    <Search size={20} />
                )}
              </button>
            </form>

            {loading && (
                <div className="text-center py-20 animate-pulse">
                    <div className="text-6xl mb-4">🎨</div>
                    <p className="text-gray-400 font-bold">Painting meaning...</p>
                </div>
            )}

            {!loading && result && (
              <ResultCard 
                entry={result} 
                onSave={saveToNotebook}
                isSaved={!!notebook.find(n => n.word === result.word)}
                targetLangCode={targetLang}
              />
            )}
            
            {!loading && !result && (
                <div className="text-center mt-20 opacity-50">
                    <p className="text-sm font-bold text-gray-400">START TYPING TO LEARN</p>
                </div>
            )}
          </>
        )}

        {/* Notebook View */}
        {currentView === 'notebook' && (
          <NotebookView 
            notebook={notebook} 
            nativeLang={nativeLang} 
            targetLang={targetLang}
            onRemove={removeFromNotebook}
          />
        )}

        {/* Study View */}
        {currentView === 'study' && (
           <StudyView notebook={notebook} />
        )}

      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-100 flex justify-around p-4 z-30 pb-safe">
        <NavButton 
          active={currentView === 'home'} 
          onClick={() => setCurrentView('home')} 
          icon={<Search size={24} />} 
          label="Search" 
        />
        <NavButton 
          active={currentView === 'notebook'} 
          onClick={() => setCurrentView('notebook')} 
          icon={<Book size={24} />} 
          label="Notebook" 
        />
        <NavButton 
          active={currentView === 'study'} 
          onClick={() => setCurrentView('study')} 
          icon={<GraduationCap size={24} />} 
          label="Study" 
        />
      </nav>

    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-indigo-600' : 'text-gray-300 hover:text-gray-500'}`}
  >
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

export default App;