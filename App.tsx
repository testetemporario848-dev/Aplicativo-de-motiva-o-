
import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Briefcase, Smile, DollarSign, Activity, Compass, 
  Sparkles, History, PlusCircle, ChevronRight, ArrowLeft, 
  Share2, Trash2, Download, BookOpen, Shuffle, Plus, Settings,
  Camera, Coffee, Moon, Sun, Book, Shield, Zap, Image as ImageIcon,
  User, MessageCircle, Star, Music, Target, Palette, Twitter, Mail, Copy
} from 'lucide-react';
import { Category, ReflectionResponse, HistoryItem, CustomCategory } from './types';
import { generateReflection, generateRandomReflection } from './services/geminiService';

/**
 * Biblioteca de ícones disponíveis para categorias personalizadas.
 */
const ICON_LIBRARY = {
  Sparkles, Heart, Briefcase, Smile, DollarSign, Activity, Compass, 
  Camera, Coffee, Moon, Sun, Book, Shield, Zap, User, MessageCircle, 
  Star, Music, Target
};

/**
 * Categorias padrão do sistema.
 */
const DEFAULT_CATEGORIES = [
  { id: Category.RELATIONSHIPS, icon: Heart, color: 'bg-rose-100 text-rose-600' },
  { id: Category.CAREER, icon: Briefcase, color: 'bg-blue-100 text-blue-600' },
  { id: Category.EMOTIONAL, icon: Smile, color: 'bg-amber-100 text-amber-600' },
  { id: Category.FINANCE, icon: DollarSign, color: 'bg-emerald-100 text-emerald-600' },
  { id: Category.HEALTH, icon: Activity, color: 'bg-cyan-100 text-cyan-600' },
  { id: Category.SPIRITUALITY, icon: Compass, color: 'bg-violet-100 text-violet-600' },
];

type Theme = 'light' | 'dark' | 'sepia';

const App: React.FC = () => {
  // --- Estados da Aplicação ---
  const [view, setView] = useState<'home' | 'input' | 'result' | 'history' | 'journal' | 'manage_cats'>('home');
  const [theme, setTheme] = useState<Theme>('light');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState<string>('Sparkles');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReflectionResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeHistoryItem, setActiveHistoryItem] = useState<HistoryItem | null>(null);
  const [journalNote, setJournalNote] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Efeitos de Inicialização ---
  useEffect(() => {
    const savedHistory = localStorage.getItem('reflexo_history');
    const savedCustomCats = localStorage.getItem('reflexo_custom_cats');
    const savedTheme = localStorage.getItem('reflexo_theme') as Theme;
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedCustomCats) setCustomCategories(JSON.parse(savedCustomCats));
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // --- Lógica de Persistência ---
  const saveToHistory = (res: ReflectionResponse, cat: string, ctx: string, note?: string) => {
    const newItem: HistoryItem = {
      ...res,
      id: Date.now().toString(),
      category: cat,
      context: ctx,
      timestamp: Date.now(),
      journalEntry: note
    };
    const updatedHistory = [newItem, ...history].slice(0, 50);
    setHistory(updatedHistory);
    localStorage.setItem('reflexo_history', JSON.stringify(updatedHistory));
    return newItem.id;
  };

  const updateJournalForHistoryItem = (id: string, note: string) => {
    const updated = history.map(item => item.id === id ? { ...item, journalEntry: note } : item);
    setHistory(updated);
    localStorage.setItem('reflexo_history', JSON.stringify(updated));
  };

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('reflexo_theme', newTheme);
  };

  const addCustomCategory = () => {
    if (!newCatName.trim()) return;
    const newCat = { 
      id: Date.now().toString(), 
      name: newCatName.trim(),
      icon: newCatIcon 
    };
    const updated = [...customCategories, newCat];
    setCustomCategories(updated);
    localStorage.setItem('reflexo_custom_cats', JSON.stringify(updated));
    setNewCatName('');
    setNewCatIcon('Sparkles');
  };

  const removeCustomCategory = (id: string) => {
    const updated = customCategories.filter(c => c.id !== id);
    setCustomCategories(updated);
    localStorage.setItem('reflexo_custom_cats', JSON.stringify(updated));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCatIcon(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Handlers de IA ---
  const handleRandomReflection = async () => {
    setLoading(true);
    setView('result');
    try {
      const res = await generateRandomReflection();
      setResult(res);
      const id = saveToHistory(res, "Aleatório", "Conselho rápido do dia");
      setActiveHistoryItem({ ...res, id, category: "Aleatório", context: "Conselho rápido do dia", timestamp: Date.now() });
    } catch (e) {
      console.error(e);
      alert("Erro ao buscar conselho.");
      setView('home');
    } finally {
      setLoading(false);
    }
  };

  const handleStartReflection = async () => {
    if (!selectedCategory || !context.trim()) return;
    setLoading(true);
    setView('result');
    try {
      const reflection = await generateReflection(selectedCategory, context);
      setResult(reflection);
      const id = saveToHistory(reflection, selectedCategory, context);
      setActiveHistoryItem({ ...reflection, id, category: selectedCategory, context, timestamp: Date.now() });
    } catch (error) {
      console.error(error);
      alert("Erro ao processar reflexão. Verifique sua conexão.");
      setView('input');
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setContext('');
    setSelectedCategory(null);
    setResult(null);
    setActiveHistoryItem(null);
    setJournalNote('');
    setView('home');
  };

  const renderIcon = (icon: string, className: string = "size-6") => {
    if (icon.startsWith('data:image')) {
      return <img src={icon} alt="Icon" className={`${className} object-cover rounded-md`} />;
    }
    const IconComponent = (ICON_LIBRARY as any)[icon] || Sparkles;
    return <IconComponent className={className} />;
  };

  // --- Compartilhamento ---
  const getShareText = () => {
    if (!result) return '';
    return `🧘‍♂️ *Reflexo do Dia*\n\n"${result.reflection}"\n\n💡 *Conselho:* ${result.advice}\n\n✨ *Afirmação:* ${result.affirmation}\n\n📜 "${result.quote?.text}" — ${result.quote?.author}`;
  };

  const handleNativeShare = async () => {
    const text = getShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Reflexo - Mentor de Vida AI',
          text: text,
        });
      } catch (err) {
        console.error('Erro ao compartilhar:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`"${result?.reflection}"\n\n#ReflexoAI #MentalHealth`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent('Uma reflexão para você');
    const body = encodeURIComponent(getShareText());
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleCopyLink = () => {
    const text = getShareText();
    navigator.clipboard.writeText(text);
    alert("Copiado para a área de transferência!");
  };

  // --- Tematização ---
  const themeClasses = {
    light: {
      bg: 'bg-slate-50',
      text: 'text-slate-800',
      textMuted: 'text-slate-500',
      card: 'bg-white/70 border-white/30',
      input: 'bg-white ring-slate-200',
      header: 'bg-slate-50/80',
      nav: 'bg-white/90 border-slate-100'
    },
    dark: {
      bg: 'bg-slate-950',
      text: 'text-slate-100',
      textMuted: 'text-slate-400',
      card: 'bg-slate-900/70 border-slate-800/50',
      input: 'bg-slate-900 ring-slate-800 text-slate-100',
      header: 'bg-slate-950/80',
      nav: 'bg-slate-900/90 border-slate-800'
    },
    sepia: {
      bg: 'bg-[#f4ecd8]',
      text: 'text-[#5b4636]',
      textMuted: 'text-[#8c7462]',
      card: 'bg-[#faf6e9]/70 border-[#e8dfc4]/50',
      input: 'bg-[#faf6e9] ring-[#e8dfc4] text-[#5b4636]',
      header: 'bg-[#f4ecd8]/80',
      nav: 'bg-[#faf6e9]/90 border-[#e8dfc4]'
    }
  }[theme];

  return (
    <div className={`max-w-md mx-auto min-h-screen ${themeClasses.bg} shadow-2xl relative overflow-hidden flex flex-col pb-24 transition-colors duration-300`}>
      {/* Elementos Decorativos adaptados ao tema */}
      <div className={`absolute top-[-100px] left-[-100px] w-64 h-64 ${theme === 'dark' ? 'bg-indigo-900' : theme === 'sepia' ? 'bg-amber-200' : 'bg-indigo-200'} rounded-full blur-3xl opacity-20`}></div>
      <div className={`absolute bottom-[-100px] right-[-100px] w-64 h-64 ${theme === 'dark' ? 'bg-slate-800' : theme === 'sepia' ? 'bg-[#e8dfc4]' : 'bg-slate-200'} rounded-full blur-3xl opacity-20`}></div>
      
      {/* Header Fixo */}
      <header className={`p-6 flex justify-between items-center z-10 sticky top-0 ${themeClasses.header} backdrop-blur-md`}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={resetFlow}>
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
            <Sparkles size={20} />
          </div>
          <h1 className={`text-xl font-bold ${themeClasses.text} font-serif`}>Reflexo</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRandomReflection} className={`p-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} hover:bg-indigo-50/10 rounded-full transition-colors`} title="Conselho Aleatório">
            <Shuffle size={20} />
          </button>
          <button onClick={() => setView('manage_cats')} className={`p-2 ${themeClasses.textMuted} hover:bg-slate-500/10 rounded-full transition-colors`} title="Configurações">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 px-6 z-10 overflow-y-auto">
        {view === 'home' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className={`text-3xl font-serif font-bold ${themeClasses.text} mt-4 mb-2`}>Qual sua intenção hoje?</h2>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              {DEFAULT_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setView('input'); }}
                  className={`flex flex-col items-center justify-center p-5 glass rounded-3xl hover:shadow-lg transition-all border-none group ${themeClasses.card}`}
                >
                  <div className={`${cat.color} p-3 rounded-2xl mb-2 group-hover:scale-110 transition-transform shadow-sm`}>
                    <cat.icon size={24} />
                  </div>
                  <span className={`text-xs font-semibold ${themeClasses.text} text-center`}>{cat.id}</span>
                </button>
              ))}
              
              {customCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.name); setView('input'); }}
                  className={`flex flex-col items-center justify-center p-5 glass rounded-3xl hover:shadow-lg transition-all border-none group ${themeClasses.card}`}
                >
                  <div className="bg-slate-100 text-slate-500 p-3 rounded-2xl mb-2 group-hover:scale-110 transition-transform overflow-hidden shadow-sm">
                    {renderIcon(cat.icon, "size-8")}
                  </div>
                  <span className={`text-xs font-semibold ${themeClasses.text} text-center truncate w-full px-2`}>{cat.name}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={() => setView('manage_cats')}
              className={`w-full mt-4 flex items-center justify-center gap-2 py-4 border-2 border-dashed ${theme === 'dark' ? 'border-slate-800 text-slate-500' : theme === 'sepia' ? 'border-[#e8dfc4] text-[#8c7462]' : 'border-indigo-200 text-indigo-400'} rounded-2xl font-bold hover:scale-[1.01] transition-all`}
            >
              <Plus size={18} /> Configurações & Categorias
            </button>
          </div>
        )}

        {view === 'manage_cats' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
             <button onClick={() => setView('home')} className={`flex items-center gap-1 ${themeClasses.textMuted} mb-6`}>
              <ArrowLeft size={18} /> Voltar
            </button>

            <div className={`p-6 rounded-[2rem] border ${themeClasses.card} shadow-sm mb-6`}>
              <h3 className={`text-sm font-bold ${themeClasses.textMuted} uppercase tracking-widest mb-4 flex items-center gap-2`}>
                <Palette size={16} /> Tema Visual
              </h3>
              <div className="flex gap-3">
                {(['light', 'dark', 'sepia'] as Theme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => changeTheme(t)}
                    className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                      theme === t ? 'border-indigo-600 bg-indigo-50/10' : 'border-transparent bg-slate-500/5'
                    }`}
                  >
                    <div className={`size-8 rounded-full shadow-inner ${
                      t === 'light' ? 'bg-slate-100' : t === 'dark' ? 'bg-slate-900' : 'bg-[#f4ecd8]'
                    }`}></div>
                    <span className={`text-[10px] font-bold uppercase ${themeClasses.text}`}>
                      {t === 'light' ? 'Claro' : t === 'dark' ? 'Escuro' : 'Sépia'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <h2 className={`text-2xl font-serif font-bold ${themeClasses.text} mb-6`}>Gerenciar Categorias</h2>
            
            <div className={`p-6 rounded-[2rem] border ${themeClasses.card} shadow-sm mb-8`}>
              <h3 className={`text-sm font-bold ${themeClasses.textMuted} uppercase tracking-widest mb-4`}>Nova Categoria</h3>
              <div className="flex gap-2 mb-6">
                <input 
                  type="text" 
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ex: Paternidade, Amizade..."
                  className={`flex-1 p-4 rounded-2xl border-none ring-1 ${themeClasses.input} focus:ring-2 focus:ring-indigo-300 transition-all`}
                />
              </div>

              <div className="mb-6">
                <h4 className={`text-xs font-bold ${themeClasses.textMuted} mb-3`}>Escolha um Ícone</h4>
                <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                  {Object.keys(ICON_LIBRARY).map(iconName => (
                    <button 
                      key={iconName}
                      onClick={() => setNewCatIcon(iconName)}
                      className={`p-2 rounded-xl flex items-center justify-center transition-all ${newCatIcon === iconName ? 'bg-indigo-600 text-white' : 'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20'}`}
                    >
                      {renderIcon(iconName, "size-5")}
                    </button>
                  ))}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2 rounded-xl flex items-center justify-center border-2 border-dashed ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'} text-slate-400 hover:bg-slate-500/5 transition-all ${newCatIcon.startsWith('data:image') ? 'border-indigo-600 bg-indigo-50/10' : ''}`}
                  >
                    <ImageIcon size={20} />
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>
              </div>

              <button 
                onClick={addCustomCategory}
                disabled={!newCatName.trim()}
                className="w-full p-4 bg-indigo-600 text-white rounded-2xl shadow-lg hover:bg-indigo-700 font-bold disabled:bg-slate-500 transition-all"
              >
                Criar Categoria
              </button>
            </div>
            
            <div className="space-y-3 pb-10">
              <h3 className={`text-sm font-bold ${themeClasses.textMuted} uppercase tracking-widest mb-2 px-2`}>Categorias Criadas</h3>
              {customCategories.map(cat => (
                <div key={cat.id} className={`flex justify-between items-center p-4 border rounded-2xl shadow-sm animate-in fade-in slide-in-from-left-2 ${themeClasses.card}`}>
                  <div className="flex items-center gap-3">
                    <div className="size-10 bg-slate-500/10 rounded-xl flex items-center justify-center text-slate-400 overflow-hidden">
                      {renderIcon(cat.icon, "size-6")}
                    </div>
                    <span className={`font-medium ${themeClasses.text}`}>{cat.name}</span>
                  </div>
                  <button onClick={() => removeCustomCategory(cat.id)} className="p-2 text-rose-300 hover:text-rose-500 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'input' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <button onClick={() => setView('home')} className={`flex items-center gap-1 ${themeClasses.textMuted} mb-6`}>
              <ArrowLeft size={18} /> Voltar
            </button>
            <h2 className={`text-2xl font-serif font-bold ${themeClasses.text} mb-4`}>
              {selectedCategory}
            </h2>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Descreva o que está acontecendo ou como se sente..."
              className={`w-full h-48 p-5 glass rounded-3xl border-none focus:ring-2 focus:ring-indigo-300 resize-none leading-relaxed shadow-inner transition-all ${themeClasses.input}`}
            ></textarea>
            <button
              onClick={handleStartReflection}
              disabled={!context.trim()}
              className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-3xl font-bold shadow-lg hover:bg-indigo-700 disabled:bg-slate-500 transition-all flex items-center justify-center gap-2"
            >
              Receber Reflexão <ChevronRight size={20} />
            </button>
          </div>
        )}

        {view === 'result' && (
          <div className="animate-in fade-in zoom-in-95 duration-700 pb-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6 shadow-sm"></div>
                <h3 className={`text-xl font-serif font-bold ${themeClasses.text}`}>Sintonizando com a sabedoria...</h3>
              </div>
            ) : result && (
              <div className="space-y-6">
                <div className={`rounded-[2.2rem] p-8 shadow-sm border ${themeClasses.card} transition-colors`}>
                  <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">Sua Reflexão</h4>
                  <p className={`italic text-lg font-serif mb-6 leading-relaxed ${themeClasses.text}`}>"{result.reflection}"</p>
                  <p className={`p-4 rounded-2xl mb-6 text-sm leading-relaxed border ${theme === 'dark' ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-50/50 text-slate-600 border-slate-100'}`}>{result.advice}</p>
                  <p className="text-indigo-500 font-bold mb-6 text-center text-sm bg-indigo-500/10 py-2 rounded-xl">✨ {result.affirmation}</p>
                  <div className="text-center pt-4 border-t border-slate-500/10">
                    <p className={`text-xs ${themeClasses.textMuted} italic`}>"{result.quote?.text}"</p>
                    <p className={`text-[10px] font-bold mt-1 uppercase tracking-tighter ${themeClasses.textMuted}`}>— {result.quote?.author}</p>
                  </div>
                </div>

                {/* Seção de Compartilhamento */}
                <div className={`p-5 rounded-[2rem] border ${themeClasses.card} shadow-sm`}>
                  <h4 className={`text-[10px] font-bold ${themeClasses.textMuted} uppercase tracking-widest mb-4 flex items-center gap-2`}>
                    <Share2 size={14} /> Compartilhar Insight
                  </h4>
                  <div className="grid grid-cols-4 gap-2">
                    <button onClick={handleWhatsAppShare} className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-green-500/10 transition-colors group">
                      <div className="p-2.5 bg-green-500 text-white rounded-xl shadow-md group-active:scale-90 transition-transform"><MessageCircle size={18}/></div>
                      <span className="text-[9px] font-bold opacity-60">WhatsApp</span>
                    </button>
                    <button onClick={handleTwitterShare} className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-sky-500/10 transition-colors group">
                      <div className="p-2.5 bg-sky-500 text-white rounded-xl shadow-md group-active:scale-90 transition-transform"><Twitter size={18}/></div>
                      <span className="text-[9px] font-bold opacity-60">Twitter</span>
                    </button>
                    <button onClick={handleEmailShare} className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-slate-500/10 transition-colors group">
                      <div className="p-2.5 bg-slate-500 text-white rounded-xl shadow-md group-active:scale-90 transition-transform"><Mail size={18}/></div>
                      <span className="text-[9px] font-bold opacity-60">E-mail</span>
                    </button>
                    <button onClick={handleCopyLink} className="flex flex-col items-center gap-1.5 p-2 rounded-2xl hover:bg-indigo-500/10 transition-colors group">
                      <div className="p-2.5 bg-indigo-500 text-white rounded-xl shadow-md group-active:scale-90 transition-transform"><Copy size={18}/></div>
                      <span className="text-[9px] font-bold opacity-60">Copiar</span>
                    </button>
                  </div>
                  <button onClick={handleNativeShare} className={`w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed ${themeClasses.textMuted} text-[10px] font-bold uppercase tracking-wider`}>
                    <Share2 size={12}/> Outros Apps
                  </button>
                </div>

                <div className={`p-6 rounded-[2rem] border shadow-inner ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-indigo-50/50 border-indigo-100'}`}>
                  <h4 className="text-xs font-bold text-indigo-500 mb-3 flex items-center gap-2"><BookOpen size={16}/> Diário de Reflexão</h4>
                  <textarea 
                    value={journalNote}
                    onChange={(e) => {
                      setJournalNote(e.target.value);
                      if (activeHistoryItem) updateJournalForHistoryItem(activeHistoryItem.id, e.target.value);
                    }}
                    placeholder="Como você se sente após essa reflexão? Escreva aqui..."
                    className={`w-full h-32 p-4 bg-transparent border-none text-sm focus:ring-1 focus:ring-indigo-300 resize-none transition-all ${themeClasses.text}`}
                  ></textarea>
                </div>

                <div className="flex gap-4">
                  <button onClick={resetFlow} className={`flex-1 py-4 rounded-2xl font-bold shadow-sm border transition-all ${themeClasses.card} ${themeClasses.text}`}>Novo Ciclo</button>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'history' && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500 pb-10">
            <h2 className={`text-2xl font-serif font-bold ${themeClasses.text} mb-6`}>Sua Jornada</h2>
            <div className="space-y-4">
              {history.map(item => (
                <div key={item.id} onClick={() => { setActiveHistoryItem(item); setJournalNote(item.journalEntry || ''); setView('result'); setResult(item); }} className={`p-4 border rounded-2xl shadow-sm cursor-pointer group hover:border-indigo-200 transition-all hover:shadow-md ${themeClasses.card}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-indigo-500 uppercase px-2 py-0.5 bg-indigo-500/10 rounded-md">{item.category}</span>
                    <span className={`text-[10px] ${themeClasses.textMuted} font-medium`}>{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className={`text-xs line-clamp-2 italic font-serif ${themeClasses.text}`}>"{item.reflection}"</p>
                </div>
              ))}
              {history.length === 0 && <p className={`text-center py-20 ${themeClasses.textMuted} italic`}>Sua jornada começa com a primeira reflexão.</p>}
            </div>
          </div>
        )}

        {view === 'journal' && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
            <h2 className={`text-2xl font-serif font-bold ${themeClasses.text} mb-6`}>Seu Diário</h2>
            <div className="space-y-4">
              {history.filter(h => h.journalEntry).map(item => (
                <div key={item.id} className={`p-6 border shadow-sm rounded-[2rem] ${themeClasses.card}`}>
                   <div className="flex items-center justify-between mb-4">
                      <span className={`text-xs ${themeClasses.textMuted} font-bold`}>{new Date(item.timestamp).toLocaleDateString()}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-500/10 text-slate-500 rounded-full font-bold uppercase">{item.category}</span>
                   </div>
                   <p className={`text-sm italic mb-4 leading-relaxed font-serif ${themeClasses.text}`}>"{item.journalEntry}"</p>
                </div>
              ))}
              {history.filter(h => h.journalEntry).length === 0 && <p className={`text-center py-20 ${themeClasses.textMuted} italic`}>Suas anotações aparecerão aqui.</p>}
            </div>
          </div>
        )}
      </main>

      {/* Barra de Navegação Inferior */}
      <nav className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md backdrop-blur-md border-t px-8 py-4 flex justify-around items-center z-50 transition-colors ${themeClasses.nav}`}>
        <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 transition-all ${view === 'home' ? 'text-indigo-500 scale-110' : 'text-slate-500'}`}>
          <Compass size={24} />
          <span className="text-[9px] font-bold uppercase tracking-wider">Início</span>
        </button>
        <button onClick={() => setView('journal')} className={`flex flex-col items-center gap-1 transition-all ${view === 'journal' ? 'text-indigo-500 scale-110' : 'text-slate-500'}`}>
          <BookOpen size={24} />
          <span className="text-[9px] font-bold uppercase tracking-wider">Diário</span>
        </button>
        <button onClick={() => setView('history')} className={`flex flex-col items-center gap-1 transition-all ${view === 'history' ? 'text-indigo-500 scale-110' : 'text-slate-500'}`}>
          <History size={24} />
          <span className="text-[9px] font-bold uppercase tracking-wider">Passado</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
