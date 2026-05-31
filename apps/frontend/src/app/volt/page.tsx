"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles, Send, Trash2, Copy, Check,
  GraduationCap, BookOpen, MapPin, Calendar,
  ChevronRight, AlertCircle, Square,
  Plus, MessageSquare, ChevronLeft, Terminal,
  ChevronUp, ChevronDown,
  BarChart2,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  isLoaded: boolean;
}

type AIModel = "general" | "ceng";

const SUGGESTIONS_GENERAL = [
  { icon: BookOpen,      text: "Bilgisayar Mühendisliği bölümü hakkında bilgi ver" },
  { icon: BookOpen,      text: "SAÜ rektörü kimdir?" },
  { icon: GraduationCap, text: "SAÜ'ye nasıl başvurabilirim?" },
  { icon: BarChart2,     text: "SAÜ'de kaç öğrenci vardır?" },
];

const SUGGESTIONS_CENG = [
  { icon: BarChart2,     text: "UMDE programına başvuru yapabilmek için Genel Not Ortalaması (GANO) şartı nedir?" },
  { icon: Briefcase,     text: "Zorunlu yaz stajının süresi toplam kaç iş günüdür?" },
  { icon: Calendar,      text: "UMDE eğitimi sırasında öğrencilerin devamsızlık hakkı yüzde kaçtır?" },
  { icon: BookOpen,      text: "UMDE programı, ders planındaki hangi yarıyıllarda (dönemlerde) yapılabilmektedir?" },
];

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
  const parts = text.split(regex);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={index} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={index} className="italic text-slate-800">{part.slice(1, -1)}</em>;
    return part;
  });
}

function renderContent(text: string) {
  return text.split("\n").map((line, i) => {
    if (line.startsWith("### ")) return <h4 key={i} className="font-bold text-slate-900 mt-3 mb-1 text-sm">{parseInlineMarkdown(line.slice(4))}</h4>;
    if (line.startsWith("## "))  return <h3 key={i} className="font-bold text-slate-900 mt-3 mb-1 text-base">{parseInlineMarkdown(line.slice(3))}</h3>;
    if (line.startsWith("# "))   return <h2 key={i} className="font-bold text-slate-900 mt-4 mb-1 text-lg">{parseInlineMarkdown(line.slice(2))}</h2>;
    const listMatch = line.match(/^(\s*)[*•-]\s+(.*)/);
    if (listMatch) return (
      <div key={i} className="flex items-start gap-2 my-1 pl-1">
        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#003087] shrink-0" />
        <span className="flex-1 text-slate-700">{parseInlineMarkdown(listMatch[2])}</span>
      </div>
    );
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return <p key={i} className="my-1 leading-relaxed text-slate-700">{parseInlineMarkdown(line)}</p>;
  });
}

function MessageBubble({ msg }: { msg: Message }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";
  const copy = () => { navigator.clipboard.writeText(msg.content); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
      className={cn("flex gap-3 group", isUser ? "flex-row-reverse" : "flex-row")}>
      {!isUser && (
        <div className="shrink-0 mt-1 h-8 w-8 rounded-xl bg-gradient-to-br from-[#003087] to-[#0046c8] flex items-center justify-center shadow-sm">
          <Sparkles size={14} className="text-[#f4a522]" />
        </div>
      )}
      <div className={cn("flex flex-col gap-1 max-w-[82%]", isUser && "items-end")}>
        <div className={cn("px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm",
          isUser ? "bg-[#003087] text-white rounded-tr-sm" : "bg-white border border-slate-100 text-slate-800 rounded-tl-sm")}>
          {isUser ? <p>{msg.content}</p> : (
            <div>
              <div className="prose prose-sm max-w-none">{renderContent(msg.content)}</div>
              {msg.isStreaming && <span className="inline-block w-2 h-4 bg-[#003087] rounded-sm ml-0.5 animate-pulse align-middle" />}
            </div>
          )}
        </div>
        {!msg.isStreaming && (
          <div className={cn("flex items-center gap-2 px-1", isUser && "flex-row-reverse")}>
            <span className="text-[10px] text-slate-400">{msg.timestamp.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</span>
            {!isUser && (
              <button onClick={copy} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600">
                {copied ? <Check size={12} /> : <Copy size={12} />}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function VoltPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId]           = useState<string>(() => uuidv4());
  const [input, setInput]                 = useState("");
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [selectedModel, setSelectedModel] = useState<AIModel>("general");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef        = useRef<HTMLTextAreaElement>(null);
  const abortRef           = useRef<AbortController | null>(null);
  const dropdownRef        = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find(c => c.id === activeId);
  const messages   = activeConv?.messages ?? [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setModelDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadSessionDetails = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agent/sessions/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        const loaded: Message[] = data.map((m: any) => ({
          id: uuidv4(), role: m.role || (m.type === "human" ? "user" : "assistant"),
          content: m.content || m.text || "", timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
        }));
        setConversations(prev => prev.map(c => c.id === id ? { ...c, messages: loaded, isLoaded: true } : c));
      }
    } catch (err) { console.error("Geçmiş mesajlar çekilemedi", err); }
  }, []);

  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/agent/sessions`);
        if (!res.ok) return;
        let data = await res.json();
        if (typeof data === "string") data = JSON.parse(data);
        if (Array.isArray(data)) {
          const list: Conversation[] = data.map((item: any, i: number) => ({
            id: typeof item === "string" ? item : (item?.id || item?.sessionId || `fallback-${i}`),
            title: typeof item === "object" && item.title ? item.title : `Sohbet ${i + 1}`,
            messages: [], createdAt: new Date(), isLoaded: false,
          }));
          if (list.length > 0) setConversations(list);
        }
      } catch (err) { console.error("Session listesi çekilemedi", err); }
    }
    loadSessions();
  }, []);

  useEffect(() => {
    if (messages.length > 0 && scrollContainerRef.current) {
      const c = scrollContainerRef.current;
      c.scrollTo({ top: c.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [input]);

  const newChat = useCallback(() => { setActiveId(uuidv4()); setError(null); setInput(""); }, []);

  const selectConv = (id: string) => {
    setActiveId(id); setError(null);
    const conv = conversations.find(c => c.id === id);
    if (conv && !conv.isLoaded) loadSessionDetails(id);
  };

  const deleteConv = async (id: string) => {
    try { await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agent/sessions/${id}`, { method: "DELETE" }); } catch (_) {}
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeId === id) setActiveId(uuidv4());
  };

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError(null); setInput(""); setLoading(true);

    const userMsg: Message = { id: uuidv4(), role: "user", content: trimmed, timestamp: new Date() };
    const assistantId = uuidv4();
    const assistantMsg: Message = { id: assistantId, role: "assistant", content: "", timestamp: new Date(), isStreaming: true };

    setConversations(prev => {
      const exists = prev.find(c => c.id === activeId);
      if (exists) return prev.map(c => c.id === activeId
        ? { ...c, messages: [...c.messages, userMsg, assistantMsg], title: c.messages.length === 0 ? trimmed.slice(0, 40) : c.title }
        : c);
      return [{ id: activeId, title: trimmed.slice(0, 40), messages: [userMsg, assistantMsg], createdAt: new Date(), isLoaded: true }, ...prev];
    });

    const controller = new AbortController();
    abortRef.current = controller;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const endpoint = selectedModel === "general" ? "/agent/chat" : "/agent/ceng/chat";

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: activeId, soru: trimmed }), signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!response.body) throw new Error("Body yok");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "", currentEvent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("event:")) { currentEvent = line.slice(6).trim(); }
          else if (line.startsWith("data:")) {
            let dataStr = line.slice(5);
            if (dataStr.startsWith(" ")) dataStr = dataStr.slice(1);
            if (currentEvent === "error") throw new Error(dataStr);
            if (currentEvent === "done" || dataStr === "[DONE]") {
              setConversations(prev => prev.map(c => c.id === activeId
                ? { ...c, messages: c.messages.map(m => m.id === assistantId ? { ...m, isStreaming: false } : m) } : c));
            } else {
              setConversations(prev => prev.map(c => c.id === activeId
                ? { ...c, messages: c.messages.map(m => m.id === assistantId ? { ...m, content: m.content + dataStr } : m) } : c));
            }
          } else if (line.trim() === "") { currentEvent = ""; }
        }
      }

      setConversations(prev => prev.map(c => c.id === activeId
        ? { ...c, messages: c.messages.map(m => m.id === assistantId ? { ...m, isStreaming: false } : m) } : c));

    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setConversations(prev => prev.map(c => c.id === activeId
          ? { ...c, messages: c.messages.map(m => m.id === assistantId ? { ...m, isStreaming: false, content: m.content || "Yanıt durduruldu." } : m) } : c));
      } else {
        setConversations(prev => prev.map(c => c.id === activeId
          ? { ...c, messages: c.messages.filter(m => m.id !== assistantId) } : c));
        setError(err instanceof Error ? err.message : "VOLT API bağlantı hatası.");
      }
    } finally { setLoading(false); abortRef.current = null; }
  }, [loading, activeId, conversations, selectedModel]);

  const stopStreaming = () => abortRef.current?.abort();
  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };
  const isEmpty = messages.length === 0;
  const currentSuggestions = selectedModel === "ceng" ? SUGGESTIONS_CENG : SUGGESTIONS_GENERAL;

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-[#f8fafc] pt-16">

      {/* Sol Panel */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="shrink-0 h-full bg-white border-r border-slate-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sohbet Geçmişi</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <ChevronLeft size={16} />
              </button>
            </div>
            <div className="p-3">
              <button onClick={newChat} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#003087] hover:bg-[#0046c8] text-white text-sm font-medium transition-colors">
                <Plus size={16} /> Yeni Sohbet
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
              {conversations.length === 0
                ? <p className="text-xs text-slate-400 text-center mt-8 px-4 leading-relaxed">Henüz sohbet yok. Bir şeyler sorarak başlayın!</p>
                : conversations.map(conv => (
                    <div key={conv.id} onClick={() => selectConv(conv.id)}
                      className={cn("group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all",
                        activeId === conv.id ? "bg-[#003087]/10 border border-[#003087]/20" : "hover:bg-slate-50")}>
                      <MessageSquare size={14} className={cn("shrink-0", activeId === conv.id ? "text-[#003087]" : "text-slate-400")} />
                      <span className={cn("flex-1 text-xs truncate", activeId === conv.id ? "text-[#003087] font-medium" : "text-slate-600")}>
                        {conv.title}
                      </span>
                      <button onClick={e => { e.stopPropagation(); deleteConv(conv.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-slate-300 hover:text-red-400 transition-all">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
              }
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Sağ: Chat */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <div className="shrink-0 bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <div className="flex items-center gap-3">
              {!sidebarOpen && (
                <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors mr-1">
                  <MessageSquare size={18} />
                </button>
              )}
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#003087] to-[#0046c8] flex items-center justify-center shadow-md">
                <Sparkles size={18} className="text-[#f4a522]" />
              </div>
              <div>
                <h1 className="font-bold text-slate-900 text-lg leading-none tracking-wide">VOLT</h1>
                <p className="text-xs text-slate-500 mt-0.5">SAU Vibe Yapay Zeka Asistanı</p>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 ml-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Çevrimiçi
              </div>
            </div>
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={newChat}
                className="text-slate-500 hover:text-[#003087] hover:bg-blue-50 gap-1.5 text-xs shrink-0">
                <Plus size={13} /> Yeni Sohbet
              </Button>
            )}
          </div>
        </div>

        {/* Mesaj Alanı */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <AnimatePresence mode="wait">
              {isEmpty && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                  className="flex flex-col items-center justify-center min-h-[55vh] text-center">
                  <div className="flex flex-col items-center justify-center min-h-[220px] w-full max-w-xl mx-auto mb-10">
                    <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-[#003087] to-[#0046c8] flex items-center justify-center shadow-2xl mb-6 shrink-0">
                      <Sparkles size={40} className="text-[#f4a522]" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
                      {selectedModel === "general" ? "Merhaba, ben VOLT! ⚡" : "VOLT CENG Core 💻"}
                    </h2>
                    <p className="text-slate-500 leading-relaxed text-sm sm:text-base max-w-xl text-center px-2">
                      {selectedModel === "general"
                        ? "Sakarya Üniversitesi hakkında aklına takılan her şeyi sorabilirsin. Bölümler, kampüs, başvurular — hepsi burada."
                        : "Bilgisayar Mühendisliği tüm doküman, yönetmelik ve kılavuzlarına hakim zeka çekirdeği. Sadece dersler ve kuralları sorabilirsin."}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                    {currentSuggestions.map(({ icon: Icon, text }) => (
                      <button key={text} onClick={() => sendMessage(text)}
                        className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-200 hover:border-[#003087] hover:shadow-md text-left text-sm text-slate-700 font-medium transition-all group">
                        <div className="h-9 w-9 rounded-xl bg-slate-100 group-hover:bg-[#003087]/10 flex items-center justify-center shrink-0 transition-colors">
                          <Icon size={17} className="text-[#003087]" />
                        </div>
                        <span className="leading-snug flex-1">{text}</span>
                        <ChevronRight size={14} className="text-slate-300 group-hover:text-[#003087] transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!isEmpty && (
              <div className="flex flex-col gap-6">
                {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
              </div>
            )}

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
                  <AlertCircle size={16} className="shrink-0" />{error}
                </motion.div>
              )}
            </AnimatePresence>
            <div className="h-4" />
          </div>
        </div>

        {/* Input */}
        <div className="shrink-0 bg-white border-t border-slate-200 px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className={cn("flex items-end gap-2 bg-slate-50 border rounded-2xl p-2.5 transition-all duration-200 relative",
              loading ? "border-[#003087] bg-white shadow-sm" : "border-slate-200 focus-within:border-[#003087] focus-within:bg-white focus-within:shadow-sm")}>

              <div className="relative shrink-0" ref={dropdownRef}>
                <button type="button" onClick={() => setModelDropdownOpen(!modelDropdownOpen)} disabled={loading}
                  className="flex items-center justify-between w-[114px] px-2.5 h-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50">
                  <div className="flex items-center gap-1.5 truncate">
                    {selectedModel === "general"
                      ? <><Sparkles size={13} className="text-[#f4a522] shrink-0" /><span className="truncate">Genel</span></>
                      : <><Terminal size={13} className="text-[#003087] shrink-0" /><span className="truncate">CENG Core</span></>
                    }
                  </div>
                  {modelDropdownOpen
                    ? <ChevronDown size={12} className="text-slate-400 shrink-0 ml-1" />
                    : <ChevronUp size={12} className="text-slate-400 shrink-0 ml-1" />}
                </button>
                <AnimatePresence>
                  {modelDropdownOpen && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: -4, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }} transition={{ duration: 0.15 }}
                      className="absolute bottom-full left-0 z-50 mb-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 flex flex-col gap-0.5">
                      <button type="button" onClick={() => { setSelectedModel("general"); setModelDropdownOpen(false); }}
                        className={cn("w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-medium transition-colors",
                          selectedModel === "general" ? "bg-[#003087]/10 text-[#003087]" : "text-slate-600 hover:bg-slate-50")}>
                        <Sparkles size={13} className="text-[#f4a522]" />
                        <span className="flex-1">Genel Asistan</span>
                        {selectedModel === "general" && <div className="h-1.5 w-1.5 rounded-full bg-[#003087]" />}
                      </button>
                      <button type="button" onClick={() => { setSelectedModel("ceng"); setModelDropdownOpen(false); }}
                        className={cn("w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-medium transition-colors",
                          selectedModel === "ceng" ? "bg-[#003087]/10 text-[#003087]" : "text-slate-600 hover:bg-slate-50")}>
                        <Terminal size={13} className="text-[#003087]" />
                        <span className="flex-1">CENG Core</span>
                        {selectedModel === "ceng" && <div className="h-1.5 w-1.5 rounded-full bg-[#003087]" />}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <textarea ref={textareaRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                placeholder={selectedModel === "general" ? "SAÜ hakkında bir şey sor…" : "CENG kılavuzları ve kuralları hakkında sor…"}
                rows={1} disabled={loading}
                className="flex-1 bg-transparent resize-none outline-none text-sm text-slate-900 placeholder:text-slate-400 py-1.5 max-h-40 leading-relaxed disabled:opacity-60 ml-1" />

              {loading
                ? <Button onClick={stopStreaming} size="icon" variant="outline"
                    className="h-9 w-9 shrink-0 rounded-xl border-red-200 hover:bg-red-50 hover:border-red-300 transition-all">
                    <Square size={13} className="text-red-500 fill-red-500" />
                  </Button>
                : <Button onClick={() => sendMessage(input)} disabled={!input.trim()} size="icon"
                    className="h-9 w-9 shrink-0 rounded-xl bg-[#003087] hover:bg-[#0046c8] disabled:opacity-40 transition-all">
                    <Send size={15} className="text-white" />
                  </Button>
              }
            </div>
            <p className="text-center text-[11px] text-slate-400 mt-2">
              VOLT yanıltıcı bilgi üretebilir. Önemli konuları resmi SAÜ kaynaklarından doğrulayın.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
