import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Armchair, Gem, Watch, AlertTriangle, History as HistoryIcon, ArrowLeft } from 'lucide-react';
import { analyzeImage } from './services/geminiService';
import { saveToHistory, getHistory, clearHistory, deleteHistoryItem } from './services/historyService';
import { LoadingState } from './components/LoadingState';
import { ResultDisplay } from './components/ResultDisplay';
import { HistoryView } from './components/HistoryView';
import { AppState, AntiqueAnalysis, HistoryItem } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [showHistory, setShowHistory] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AntiqueAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load history on mount
    setHistoryItems(getHistory());
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError("Dosya boyutu çok yüksek. Lütfen 5MB altı bir görsel yükleyin.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImage(base64);
      startAnalysis(base64);
    };
    reader.readAsDataURL(file);
  };

  const startAnalysis = async (base64: string) => {
    setAppState(AppState.ANALYZING);
    setShowHistory(false);
    setError(null);
    try {
      const result = await analyzeImage(base64);
      setAnalysis(result);
      
      // Save to history
      saveToHistory(result, base64);
      setHistoryItems(getHistory()); // Reload history
      
      setAppState(AppState.SUCCESS);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setShowHistory(false);
    setImage(null);
    setAnalysis(null);
    setError(null);
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
    // If we are viewing history, we essentially reset the active analysis view unless we select one
    if (!showHistory) {
       // entering history mode
       // Keep appState as is in background or reset? 
       // Let's keep it simple: History view overrides main content area
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setAnalysis(item);
    setImage(item.imageUrl);
    setShowHistory(false);
    setAppState(AppState.SUCCESS);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHistoryDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deleteHistoryItem(id);
    setHistoryItems(updated);
  };

  const handleClearHistory = () => {
    if (window.confirm("Tüm geçmişi silmek istediğinize emin misiniz?")) {
      clearHistory();
      setHistoryItems([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f7f2] font-sans selection:bg-antique-300 selection:text-antique-900">
      
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-antique-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="w-10 h-10 bg-antique-900 rounded-lg flex items-center justify-center text-antique-50 shadow-lg">
              <span className="font-serif font-bold text-2xl">A</span>
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold text-antique-900 tracking-tight">Antika AI</h1>
              <p className="text-[10px] uppercase tracking-widest text-antique-600 font-medium">Değerleme & Restorasyon</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleHistory}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                showHistory 
                  ? 'bg-antique-900 text-white shadow-md' 
                  : 'text-antique-700 hover:bg-antique-100 hover:text-antique-900'
              }`}
            >
              {showHistory ? <ArrowLeft className="w-4 h-4" /> : <HistoryIcon className="w-4 h-4" />}
              <span className="hidden sm:inline">{showHistory ? 'Ana Sayfaya Dön' : 'Geçmiş'}</span>
            </button>
            <div className="hidden md:flex gap-6 text-sm font-medium text-antique-700">
              <span className="hover:text-antique-900 cursor-pointer transition-colors">Nasıl Çalışır?</span>
              <span className="hover:text-antique-900 cursor-pointer transition-colors">Hakkımızda</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        
        {/* HISTORY VIEW */}
        {showHistory ? (
          <HistoryView 
            items={historyItems} 
            onSelect={handleHistorySelect}
            onDelete={handleHistoryDelete}
            onClearAll={handleClearHistory}
          />
        ) : (
          <>
            {/* IDLE STATE: Hero & Upload */}
            {appState === AppState.IDLE && (
              <div className="flex flex-col items-center text-center animate-in fade-in duration-500">
                <div className="mb-8 inline-flex items-center justify-center p-2 bg-white rounded-full shadow-sm border border-antique-100">
                  <span className="px-3 py-1 bg-antique-100 text-antique-800 text-xs rounded-full font-semibold uppercase tracking-wider">
                    Beta Sürümü
                  </span>
                  <span className="ml-2 text-sm text-antique-600 mr-2">
                    Gemini 2.5 Vision Teknolojisi ile Güçlendirildi
                  </span>
                </div>

                <h2 className="text-5xl md:text-7xl font-serif font-bold text-antique-900 mb-6 tracking-tight leading-[1.1]">
                  Mirasınızın <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-antique-600 to-antique-900">
                    Gerçek Değerini
                  </span> Keşfedin.
                </h2>
                
                <p className="text-lg md:text-xl text-antique-700 max-w-2xl mb-12 font-light">
                  Evinizdeki eski objelerin fotoğrafını çekin. Yapay zeka uzmanımız dönemini, kökenini ve tahmini değerini saniyeler içinde analiz etsin.
                </p>

                <div className="w-full max-w-2xl bg-white p-2 rounded-3xl shadow-2xl border border-antique-100 transform hover:scale-[1.01] transition-transform duration-300">
                  <div 
                    className="border-2 border-dashed border-antique-200 rounded-2xl h-64 flex flex-col items-center justify-center bg-antique-50/50 hover:bg-antique-50 transition-colors cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Camera className="w-8 h-8 text-antique-600" />
                    </div>
                    <h3 className="text-xl font-serif font-semibold text-antique-900 mb-2">Fotoğraf Yükle veya Çek</h3>
                    <p className="text-antique-500 text-sm">JPG, PNG (Maks 5MB)</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                </div>

                {/* Feature Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 w-full max-w-5xl">
                  <div className="flex flex-col items-center p-6 rounded-2xl bg-white shadow-sm border border-antique-100">
                    <div className="w-12 h-12 bg-antique-50 rounded-xl flex items-center justify-center mb-4 text-antique-700">
                      <Armchair className="w-6 h-6" />
                    </div>
                    <h4 className="font-serif font-bold text-lg mb-2">Dönem Tespiti</h4>
                    <p className="text-sm text-antique-600">Mobilya, dekorasyon veya sanat eserinin hangi döneme ait olduğunu öğrenin.</p>
                  </div>
                  <div className="flex flex-col items-center p-6 rounded-2xl bg-white shadow-sm border border-antique-100">
                    <div className="w-12 h-12 bg-antique-50 rounded-xl flex items-center justify-center mb-4 text-antique-700">
                      <Gem className="w-6 h-6" />
                    </div>
                    <h4 className="font-serif font-bold text-lg mb-2">Değer Aralığı</h4>
                    <p className="text-sm text-antique-600">Global müzayede verilerine dayalı tahmini pazar değerini keşfedin.</p>
                  </div>
                  <div className="flex flex-col items-center p-6 rounded-2xl bg-white shadow-sm border border-antique-100">
                    <div className="w-12 h-12 bg-antique-50 rounded-xl flex items-center justify-center mb-4 text-antique-700">
                      <Watch className="w-6 h-6" />
                    </div>
                    <h4 className="font-serif font-bold text-lg mb-2">Bakım Rehberi</h4>
                    <p className="text-sm text-antique-600">Eserin değerini korumak için özel temizlik ve saklama önerileri alın.</p>
                  </div>
                </div>
              </div>
            )}

            {/* LOADING STATE */}
            {appState === AppState.ANALYZING && <LoadingState />}

            {/* RESULT STATE */}
            {appState === AppState.SUCCESS && analysis && image && (
              <ResultDisplay analysis={analysis} imageUrl={image} onReset={handleReset} />
            )}

            {/* ERROR STATE */}
            {appState === AppState.ERROR && (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-red-900 mb-2">Bir Sorun Oluştu</h3>
                <p className="text-red-700 max-w-md mb-8">{error}</p>
                <button 
                  onClick={handleReset}
                  className="px-8 py-3 bg-antique-900 text-white rounded-lg hover:bg-antique-800 transition-colors font-medium shadow-lg"
                >
                  Tekrar Dene
                </button>
              </div>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-antique-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-antique-600 text-sm">© 2024 Antika AI. Tüm hakları saklıdır.</p>
          <div className="flex gap-4">
            <a href="#" className="text-antique-400 hover:text-antique-700 transition-colors">Gizlilik</a>
            <a href="#" className="text-antique-400 hover:text-antique-700 transition-colors">Kullanım Koşulları</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;