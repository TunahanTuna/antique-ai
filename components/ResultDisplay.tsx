import React, { useEffect, useState } from 'react';
import { AntiqueAnalysis } from '../types';
import { 
  History, 
  MapPin, 
  Brush, 
  DollarSign, 
  AlertCircle, 
  Hammer,
  CheckCircle2,
  BookOpen,
  List,
  Search,
  ExternalLink
} from 'lucide-react';

interface ResultDisplayProps {
  analysis: AntiqueAnalysis;
  imageUrl: string;
  onReset: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ analysis, imageUrl, onReset }) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Use requestAnimationFrame for smoother performance
      window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto animate-in slide-in-from-bottom-10 duration-700 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
        
        {/* Left Column: Image & Quick Stats */}
        <div className="lg:col-span-5 space-y-6 relative">
          {/* Parallax Wrapper for Image */}
          <div 
            className="relative group overflow-hidden rounded-2xl shadow-2xl border-4 border-white transition-transform duration-100 ease-out will-change-transform"
            style={{ transform: `translateY(${scrollY * 0.05}px)` }}
          >
            <img 
              src={imageUrl} 
              alt="Analyzed Item" 
              className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20 text-white">
              <span className="inline-block px-3 py-1 bg-antique-600/90 rounded-full text-xs font-medium tracking-wider mb-2 shadow-lg backdrop-blur-sm">
                {analysis.style.toUpperCase()}
              </span>
              <h2 className="text-2xl font-serif font-bold leading-tight">{analysis.title}</h2>
            </div>
          </div>

          <div 
            className="bg-white p-6 rounded-xl shadow-sm border border-antique-100 space-y-4 transition-transform duration-100 ease-out will-change-transform"
            style={{ transform: `translateY(${scrollY * 0.08}px)` }}
          >
            <h3 className="text-lg font-serif font-semibold text-antique-900 border-b border-antique-100 pb-2">Hızlı Bakış</h3>
            
            <div className="flex items-center gap-3 text-antique-800">
              <History className="w-5 h-5 text-antique-500" />
              <div>
                <p className="text-xs text-antique-500 uppercase tracking-wide">Dönem</p>
                <p className="font-medium">{analysis.estimatedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-antique-800">
              <MapPin className="w-5 h-5 text-antique-500" />
              <div>
                <p className="text-xs text-antique-500 uppercase tracking-wide">Köken</p>
                <p className="font-medium">{analysis.origin}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-antique-800">
              <CheckCircle2 className={`w-5 h-5 ${analysis.isAuthentic ? 'text-green-600' : 'text-orange-500'}`} />
              <div>
                <p className="text-xs text-antique-500 uppercase tracking-wide">Orijinallik Durumu</p>
                <p className="font-medium">{analysis.isAuthentic ? 'Orijinal Görünüyor' : 'Reprodüksiyon Olabilir'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Analysis */}
        <div className="lg:col-span-7 space-y-6 relative z-10">
          
          {/* Value Card - Inverse Parallax for background blob */}
          <div className="bg-antique-900 text-antique-50 p-8 rounded-2xl shadow-xl relative overflow-hidden transform transition-transform hover:scale-[1.01] duration-300">
            <div 
              className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-antique-700 rounded-full opacity-20 blur-3xl transition-transform duration-100 ease-out will-change-transform"
              style={{ transform: `translateY(${scrollY * -0.15}px)` }}
            ></div>
             <div 
              className="absolute bottom-0 left-0 -ml-4 -mb-4 w-32 h-32 bg-antique-600 rounded-full opacity-10 blur-2xl transition-transform duration-100 ease-out will-change-transform"
              style={{ transform: `translateY(${scrollY * -0.05}px)` }}
            ></div>

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-antique-300 text-sm font-medium uppercase tracking-widest mb-1">Tahmini Değer Aralığı</p>
                <div className="text-4xl lg:text-5xl font-serif font-bold text-white flex items-baseline gap-2">
                  <span>{analysis.estimatedValue.min.toLocaleString()}</span>
                  <span className="text-2xl text-antique-400">-</span>
                  <span>{analysis.estimatedValue.max.toLocaleString()}</span>
                  <span className="text-xl font-sans font-light text-antique-300">{analysis.estimatedValue.currency}</span>
                </div>
              </div>
              <div className="hidden sm:flex h-16 w-16 bg-antique-800 rounded-full items-center justify-center border border-antique-700 shadow-inner">
                <DollarSign className="w-8 h-8 text-antique-200" />
              </div>
            </div>
            <p className="text-xs text-antique-400 mt-4">*Bu bir yapay zeka tahminidir. Kesin değerleme için lütfen profesyonel bir ekspere danışın.</p>
          </div>

          {/* Description */}
          <div 
            className="bg-white p-8 rounded-2xl shadow-sm border border-antique-100 transition-all duration-100 ease-out will-change-transform"
            style={{ transform: `translateY(${scrollY * -0.02}px)` }}
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-antique-600" />
              <h3 className="text-xl font-serif font-bold text-antique-900">Eser Hakkında</h3>
            </div>
            <p className="text-antique-800 leading-relaxed text-lg mb-6">
              {analysis.description}
            </p>

             {/* Historical Depth Module */}
            <div className="bg-antique-50/60 p-6 rounded-xl border border-antique-200">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-antique-700" />
                <h3 className="text-lg font-serif font-bold text-antique-900">Tarihsel Derinlik & Analiz</h3>
              </div>
              
              <p className="text-antique-800 leading-relaxed text-sm mb-6">
                {analysis.detailedHistory || analysis.historicalContext}
              </p>

              <div className="mb-6">
                <h4 className="font-serif font-semibold text-antique-900 text-sm mb-3 flex items-center gap-2">
                  <List className="w-4 h-4" />
                  Karakteristik Özellikler
                </h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.keyFeatures?.map((feature, idx) => (
                    <span key={idx} className="bg-white px-3 py-1.5 rounded-lg border border-antique-200 text-xs text-antique-700 shadow-sm">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-5 border-t border-antique-200/50">
                <h4 className="font-serif font-semibold text-antique-900 text-sm mb-3 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Detaylı Araştırma İçin Kaynaklar
                </h4>
                <div className="flex flex-wrap gap-3">
                  {analysis.searchQueries?.map((query, idx) => (
                    <a 
                      key={idx}
                      href={`https://www.google.com/search?q=${encodeURIComponent(query)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-antique-100 text-antique-800 text-xs font-medium rounded-lg border border-antique-300 transition-colors group"
                    >
                      {query} <ExternalLink className="w-3 h-3 text-antique-400 group-hover:text-antique-600" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Restoration - Slight parallax */}
          <div 
            className="bg-stone-50 p-8 rounded-2xl border border-stone-200 transition-all duration-100 ease-out will-change-transform"
             style={{ transform: `translateY(${scrollY * -0.04}px)` }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Hammer className="w-6 h-6 text-stone-600" />
              <h3 className="text-xl font-serif font-bold text-stone-800">Bakım ve Restorasyon Önerileri</h3>
            </div>
            <ul className="space-y-4">
              {analysis.restorationTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="min-w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-xs font-bold text-stone-600 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-stone-700">{tip}</p>
                </li>
              ))}
            </ul>
          </div>

          <button 
            onClick={onReset}
            className="w-full py-4 bg-antique-200 hover:bg-antique-300 text-antique-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform transition-all"
          >
            <Brush className="w-5 h-5" />
            Yeni Bir Eser İncele
          </button>

        </div>
      </div>
    </div>
  );
};