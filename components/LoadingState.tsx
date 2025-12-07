import React, { useEffect, useState } from 'react';
import { Scan, Sparkles, Search } from 'lucide-react';

export const LoadingState: React.FC = () => {
  const [message, setMessage] = useState("Görsel taranıyor...");

  useEffect(() => {
    const messages = [
      "Dönem özellikleri analiz ediliyor...",
      "İmza ve damgalar kontrol ediliyor...",
      "Müzayede veritabanları karşılaştırılıyor...",
      "Restorasyon arşivlerine bakılıyor...",
      "Değer tahmini oluşturuluyor..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      setMessage(messages[i]);
      i = (i + 1) % messages.length;
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-antique-400 blur-xl opacity-20 rounded-full animate-pulse"></div>
        <div className="relative bg-white p-6 rounded-full shadow-2xl border border-antique-100">
          <Scan className="w-12 h-12 text-antique-700 animate-pulse" />
        </div>
        <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-500 animate-bounce" />
        <Search className="absolute -bottom-2 -left-2 w-6 h-6 text-antique-600 animate-spin-slow" style={{ animationDuration: '3s' }} />
      </div>
      <h3 className="text-2xl font-serif text-antique-900 mb-2">{message}</h3>
      <p className="text-antique-600 font-light">Lütfen bekleyin, bu işlem biraz zaman alabilir.</p>
    </div>
  );
};