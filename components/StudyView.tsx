import React, { useState } from 'react';
import { DictionaryEntry } from '../types';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface Props {
  notebook: DictionaryEntry[];
}

const StudyView: React.FC<Props> = ({ notebook }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (notebook.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Add words to your notebook to start studying!</p>
      </div>
    );
  }

  const currentCard = notebook[currentIndex];

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % notebook.length), 200);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1 + notebook.length) % notebook.length), 200);
  };

  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <div className="w-full max-w-md h-96 relative perspective-1000 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`relative w-full h-full text-center transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden rounded-3xl shadow-2xl overflow-hidden bg-white border-4 border-b-8 border-blue-100 flex flex-col">
            <div className="flex-1 relative">
                <img src={currentCard.imageUrl} alt="Hint" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <h2 className="text-4xl font-black text-white drop-shadow-lg">{currentCard.word}</h2>
                </div>
            </div>
            <div className="h-12 bg-blue-50 flex items-center justify-center text-blue-400 font-bold text-sm uppercase tracking-widest">
                Tap to Flip
            </div>
          </div>

          {/* Back */}
          <div className="absolute w-full h-full backface-hidden rounded-3xl shadow-2xl overflow-hidden bg-white border-4 border-b-8 border-green-100 rotate-y-180 flex flex-col p-6 items-center justify-center">
             <h3 className="text-2xl font-bold text-gray-800 mb-2">{currentCard.word}</h3>
             <p className="text-xl text-green-600 font-medium mb-6">{currentCard.definition}</p>
             
             <div className="bg-gray-50 p-4 rounded-xl w-full text-left">
                <p className="text-gray-600 text-sm italic">"{currentCard.examples[0].target}"</p>
                <p className="text-gray-400 text-xs mt-1">{currentCard.examples[0].native}</p>
             </div>
          </div>

        </div>
      </div>

      <div className="flex items-center gap-8 mt-10">
        <button onClick={(e) => { e.stopPropagation(); prevCard(); }} className="p-4 bg-white rounded-full shadow-lg text-gray-600 hover:text-blue-500 transition-colors">
            <ChevronLeft size={32} />
        </button>
        <span className="font-bold text-gray-400 font-mono">{currentIndex + 1} / {notebook.length}</span>
        <button onClick={(e) => { e.stopPropagation(); nextCard(); }} className="p-4 bg-white rounded-full shadow-lg text-gray-600 hover:text-blue-500 transition-colors">
            <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
};

export default StudyView;