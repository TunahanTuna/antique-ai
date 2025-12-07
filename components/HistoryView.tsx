import React from 'react';
import { HistoryItem } from '../types';
import { Clock, ArrowRight, Trash2, Calendar, DollarSign } from 'lucide-react';

interface HistoryViewProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ items, onSelect, onDelete, onClearAll }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-antique-100 rounded-full flex items-center justify-center mb-6">
          <Clock className="w-8 h-8 text-antique-400" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-antique-900 mb-2">Henüz Geçmiş Yok</h3>
        <p className="text-antique-600 max-w-md">
          Yaptığınız analizler burada saklanır. İlk eserinizi analiz ederek başlayın.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto animate-in slide-in-from-bottom-5 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-antique-900">Analiz Geçmişi</h2>
          <p className="text-antique-600 text-sm mt-1">Son incelediğiniz eserler ({items.length})</p>
        </div>
        <button 
          onClick={onClearAll}
          className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Geçmişi Temizle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelect(item)}
            className="group bg-white rounded-xl border border-antique-100 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full"
          >
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden bg-antique-100">
              <img 
                src={item.imageUrl} 
                alt={item.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 right-2">
                 <button 
                  onClick={(e) => onDelete(item.id, e)}
                  className="p-2 bg-white/90 rounded-full text-red-500 hover:text-red-700 hover:bg-white shadow-sm transition-colors opacity-0 group-hover:opacity-100"
                  title="Kaydı Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <span className="text-xs text-white/90 font-medium bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
                  {new Date(item.timestamp).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex-1 flex flex-col">
              <div className="mb-4 flex-1">
                <h3 className="font-serif font-bold text-lg text-antique-900 line-clamp-2 mb-2 group-hover:text-antique-700 transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-antique-600 mb-1">
                  <Calendar className="w-3 h-3" />
                  <span>{item.estimatedDate}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-antique-600">
                  <DollarSign className="w-3 h-3" />
                  <span>{item.estimatedValue.min.toLocaleString()} - {item.estimatedValue.max.toLocaleString()} {item.estimatedValue.currency}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-antique-100 flex items-center justify-between mt-auto">
                <span className="text-xs font-semibold text-antique-500 uppercase tracking-wider">Detayları Gör</span>
                <div className="w-8 h-8 rounded-full bg-antique-50 flex items-center justify-center group-hover:bg-antique-900 group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};