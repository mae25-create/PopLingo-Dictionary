import React from 'react';
import { LANGUAGES, Language } from '../types';
import { ArrowRightLeft } from 'lucide-react';

interface Props {
  nativeLang: string;
  targetLang: string;
  setNativeLang: (code: string) => void;
  setTargetLang: (code: string) => void;
}

const LanguageSelector: React.FC<Props> = ({ nativeLang, targetLang, setNativeLang, setTargetLang }) => {
  const handleSwap = () => {
    const temp = nativeLang;
    setNativeLang(targetLang);
    setTargetLang(temp);
  };

  return (
    <div className="flex items-center justify-between bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-6">
      <div className="flex-1">
        <label className="block text-xs text-gray-400 font-bold ml-2 mb-1">I SPEAK</label>
        <select 
          value={nativeLang}
          onChange={(e) => setNativeLang(e.target.value)}
          className="w-full bg-transparent font-bold text-gray-800 text-sm md:text-base focus:outline-none px-2"
        >
          {LANGUAGES.map((lang) => (
            <option key={`native-${lang.code}`} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <button 
        onClick={handleSwap}
        className="mx-2 p-2 bg-pink-100 text-pink-500 rounded-full hover:bg-pink-200 transition-colors"
      >
        <ArrowRightLeft size={16} />
      </button>

      <div className="flex-1 text-right">
        <label className="block text-xs text-gray-400 font-bold mr-2 mb-1">I'M LEARNING</label>
        <select 
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="w-full bg-transparent font-bold text-blue-600 text-sm md:text-base focus:outline-none px-2 text-right dir-rtl"
        >
          {LANGUAGES.map((lang) => (
            <option key={`target-${lang.code}`} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default LanguageSelector;