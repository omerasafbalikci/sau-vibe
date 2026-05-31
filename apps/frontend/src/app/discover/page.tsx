"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import {
  Plus, X, Trash2, TrendingUp, Clock, Lock, Unlock,
  Phone, Mail, KeyRound, ChevronDown, ImagePlus, Send,
  AlertCircle, Check, StickyNote, Camera, Upload,
  Link as LinkIcon, LogIn, PlusCircle, SmilePlus, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── SOSYAL MEDYA İKONLARI ───────────────────────────────────
const IGIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);
const TWIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
  </svg>
);
const LIIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24.774 0 23.208 0 22.225 0z"/>
  </svg>
);

// ─── TİPLER ──────────────────────────────────────────────────
// Backend NoteResponse: id, category, roomId, text, contactType, contactValue, reactions, createdAt
type ContactType = "telefon" | "email" | "instagram" | "twitter" | "linkedin";

interface NoteResponse {
  id:           string;
  category:     string;
  roomId:       string;
  text:         string;
  contactType:  string;
  contactValue: string;
  reactions:    Record<string, number>;
  createdAt:    string;
}

// Backend ExperienceResponse: id, imageUrl, description, contactType, contactValue, reactions, createdAt
interface ExperienceResponse {
  id:           string;
  imageUrl:     string;
  description:  string;
  contactType:  string;
  contactValue: string;
  reactions:    Record<string, number>;
  createdAt:    string;
}

// ─── SABİTLER ────────────────────────────────────────────────
const API        = process.env.NEXT_PUBLIC_API_URL;
const CDN_URL    = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
const CDN_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET ?? "sau_vibe";

const NOTE_CATS = [
  { id: "ALL",     label: "Tümü",          emoji: "🗂️", color: "#6366f1" },
  { id: "EGLENCE", label: "Eğlence",        emoji: "😄", color: "#f59e0b" },
  { id: "TAVSIYE", label: "Tavsiye",        emoji: "💡", color: "#10b981" },
  { id: "KAYIP",   label: "Kayıp Eşya",     emoji: "🔍", color: "#ef4444" },
  { id: "ITIRAF",  label: "İtiraf",         emoji: "🤫", color: "#8b5cf6" },
  { id: "CALISMA", label: "Çalışma Ortağı", emoji: "📚", color: "#0ea5e9" },
  { id: "DIGER",   label: "Diğer",          emoji: "💬", color: "#6b7280" },
];
const CAT_MAP = Object.fromEntries(NOTE_CATS.map(c => [c.id, c]));

const POSTIT = [
  { bg: "bg-amber-100",   border: "border-amber-300",   text: "text-amber-900",   pin: "bg-amber-400"   },
  { bg: "bg-sky-100",     border: "border-sky-300",     text: "text-sky-900",     pin: "bg-sky-400"     },
  { bg: "bg-emerald-100", border: "border-emerald-300", text: "text-emerald-900", pin: "bg-emerald-400" },
  { bg: "bg-violet-100",  border: "border-violet-300",  text: "text-violet-900",  pin: "bg-violet-400"  },
  { bg: "bg-rose-100",    border: "border-rose-300",    text: "text-rose-900",    pin: "bg-rose-400"    },
  { bg: "bg-orange-100",  border: "border-orange-300",  text: "text-orange-900",  pin: "bg-orange-400"  },
];

const PICK_EMOJIS = ["🔥","👀","💯","❤️","😂","👏","🙌","📌","😍","🎉","💪","🤣"];

// contactType -> icon + href builder
const CONTACT: Record<string, { icon: React.ElementType; href: (v: string) => string }> = {
  telefon:   { icon: Phone,   href: v => `tel:${v}` },
  email:     { icon: Mail,    href: v => `mailto:${v}` },
  instagram: { icon: IGIcon,  href: v => `https://instagram.com/${v.replace("@","")}` },
  twitter:   { icon: TWIcon,  href: v => `https://twitter.com/${v.replace("@","")}` },
  linkedin:  { icon: LIIcon,  href: v => `https://linkedin.com/in/${v}` },
};
const CONTACT_LABELS: Record<string, string> = {
  telefon: "Telefon", email: "E-posta", instagram: "Instagram", twitter: "Twitter", linkedin: "LinkedIn",
};
const CONTACT_PLACEHOLDERS: Record<string, string> = {
  telefon: "+905xx", email: "ornek@mail.com", instagram: "@kullanici", twitter: "@kullanici", linkedin: "kullanici-adi",
};

// ─── YARDIMCI ────────────────────────────────────────────────
function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime(), m = Math.floor(d / 60000);
  if (m < 1) return "şimdi";
  if (m < 60) return `${m}dk`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}sa`;
  return `${Math.floor(h / 24)}g`;
}

function getDeviceId() {
  if (typeof window === "undefined") return "ssr";
  let id = localStorage.getItem("sau_device_id");
  if (!id) { id = uuidv4(); localStorage.setItem("sau_device_id", id); }
  return id;
}

async function uploadCDN(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CDN_PRESET);
  const r = await fetch(CDN_URL, { method: "POST", body: fd });
  if (!r.ok) throw new Error("Yükleme başarısız");
  return (await r.json()).secure_url;
}

// ─── API ─────────────────────────────────────────────────────
const apiFetchNotes = (room: string, cat: string, sort: string) =>
  axios.get(`${API}/notes`, { params: { room, category: cat, sort } }).then(r => r.data as NoteResponse[]);

const apiFetchExps = (sort: string) =>
  axios.get(`${API}/experiences`, { params: { sort } }).then(r => r.data as ExperienceResponse[]);

const apiPostNote    = (b: object) => axios.post(`${API}/notes`, b).then(r => r.data);
const apiDelNote     = (id: string, dk: string) => axios.delete(`${API}/notes/${id}`, { params: { deleteKey: dk } });
const apiReactNote   = (id: string, emoji: string) =>
  axios.post(`${API}/notes/${id}/react`, { emoji, deviceId: getDeviceId() });

const apiPostExp     = (b: object) => axios.post(`${API}/experiences`, b).then(r => r.data);
const apiDelExp      = (id: string, dk: string) => axios.delete(`${API}/experiences/${id}`, { params: { deleteKey: dk } });
const apiReactExp    = (id: string, emoji: string) =>
  axios.post(`${API}/experiences/${id}/react`, { emoji, deviceId: getDeviceId() });

const apiCreateRoom  = (roomId: string, roomPassword: string) =>
  axios.post(`${API}/notes/rooms`, { roomId, roomPassword });

// ─── EMOJİ PİCKER — body portal ile render ───────────────────
function EmojiPicker({ btnRef, onPick, onClose }: {
  btnRef: React.RefObject<HTMLButtonElement | null>;
  onPick: (e: string) => void;
  onClose: () => void;
}) {
  const [coords, setCoords] = useState({ top: 0, left: 0, ready: false });

  useEffect(() => {
    if (!btnRef.current) return;
    const r   = btnRef.current.getBoundingClientRect();
    const W   = 220;
    const H   = 104; // 2 rows * 36px + padding 2*16px = 104
    let left  = r.left + r.width / 2 - W / 2;
    // Ekran altında yeterli yer var mı?
    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top;
    let top: number;
    if (spaceBelow >= H + 6) {
      // Yeterli alan var — butonun hemen altı
      top = r.bottom + 4;
    } else {
      // Yeterli alan yok — butonun hemen üstü (picker alt kenarı = buton üst kenarı - 4px)
      top = r.top - 88 - 4;
    }
    // Yatayda taşmasın
    if (left < 8)                      left = 8;
    if (left + W > window.innerWidth)  left = window.innerWidth - W - 8;
    // Dikeyde viewport dışına çıkmasın
    if (top < 8)                       top  = 8;
    setCoords({ top, left, ready: true });
  }, []);

  if (!coords.ready) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9998]"
        onClick={e => { e.stopPropagation(); onClose(); }} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.1 }}
        style={{ position: "fixed", top: coords.top, left: coords.left, zIndex: 9999, width: 220 }}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-2"
        onClick={e => e.stopPropagation()}
      >
        <div className="grid grid-cols-6 gap-0.5">
          {PICK_EMOJIS.map(e => (
            <button key={e}
              onClick={ev => { ev.stopPropagation(); onPick(e); onClose(); }}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-base transition-colors">
              {e}
            </button>
          ))}
        </div>
      </motion.div>
    </>,
    document.body
  );
}

// ─── İLETİŞİM INPUT ──────────────────────────────────────────
// Her tür için validasyon kuralları
const CONTACT_VALIDATION: Record<string, {
  pattern: RegExp;
  hint: string;
  format: (v: string) => string; // değeri temizle/formatla
}> = {
  telefon:   {
    pattern: /^[0-9]{10,11}$/,
    hint: "05xx xxx xx xx (başında 0 ile 10 hane)",
    format: v => v.replace(/[^0-9]/g, "").slice(0, 11),
  },
  email:     {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    hint: "ornek@gmail.com",
    format: v => v.trim(),
  },
  instagram: {
    pattern: /^[a-zA-Z0-9._]{1,30}$/,
    hint: "kullanici_adi (@ işareti olmadan)",
    format: v => v.replace(/^@/, "").replace(/[^a-zA-Z0-9._]/g, ""),
  },
  twitter:   {
    pattern: /^[a-zA-Z0-9_]{1,15}$/,
    hint: "kullanici_adi (@ işareti olmadan)",
    format: v => v.replace(/^@/, "").replace(/[^a-zA-Z0-9_]/g, ""),
  },
  linkedin:  {
    pattern: /^[a-zA-Z0-9\-]{3,100}$/,
    hint: "profil-url-adi",
    format: v => v.replace(/^.*linkedin\.com\/in\//, "").replace(/\//g, ""),
  },
};

function ContactInput({ type, value, onType, onValue }: {
  type: string; value: string;
  onType: (t: string) => void; onValue: (v: string) => void;
}) {
  const v = CONTACT_VALIDATION[type];
  const isValid = !value || v.pattern.test(value);

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        <div className="relative w-32 shrink-0">
          <select value={type} onChange={e => { onType(e.target.value); onValue(""); }}
            className="w-full px-2 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none appearance-none bg-white text-slate-700">
            {Object.keys(CONTACT_LABELS).map(k => (
              <option key={k} value={k}>{CONTACT_LABELS[k]}</option>
            ))}
          </select>
          <ChevronDown size={11} className="absolute right-2 top-3.5 text-slate-400 pointer-events-none" />
        </div>
        <input
          value={value}
          onChange={e => onValue(v.format(e.target.value))}
          placeholder={v.hint}
          required
          className={cn(
            "flex-1 px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors",
            value && !isValid
              ? "border-red-300 bg-red-50 focus:border-red-400"
              : "border-slate-200 focus:border-[#003087]"
          )}
        />
      </div>
      {value && !isValid && (
        <p className="text-[11px] text-red-500 pl-34">
          {type === "telefon" && "Geçerli bir telefon girin (örn: 05321234567)"}
          {type === "email" && "Geçerli bir e-posta girin (örn: ad@gmail.com)"}
          {(type === "instagram" || type === "twitter") && "Sadece harf, rakam, nokta ve alt çizgi kullanın"}
          {type === "linkedin" && "LinkedIn profil URL'nizdeki kullanıcı adını girin"}
        </p>
      )}
    </div>
  );
}

// ─── NOT KARTI ───────────────────────────────────────────────
function NoteCard({ note, colorIdx, refetch }: {
  note: NoteResponse; colorIdx: number; refetch: () => void;
}) {
  const [showDel, setShowDel]       = useState(false);
  const [delKey, setDelKey]         = useState("");
  const [delErr, setDelErr]         = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [expanded, setExpanded]     = useState(false);
  const pickerBtnRef                = useRef<HTMLButtonElement>(null);

  const s      = POSTIT[colorIdx % POSTIT.length];
  const cat    = CAT_MAP[note.category] ?? CAT_MAP.DIGER;
  const ci     = CONTACT[note.contactType] ?? CONTACT.email;
  const CIcon  = ci.icon;
  const cHref  = ci.href(note.contactValue);

  const activeReactions = Object.entries(note.reactions).filter(([, c]) => c > 0);
  const totalR          = activeReactions.reduce((s, [, c]) => s + c, 0);

  const reactMut = useMutation({ mutationFn: (emoji: string) => apiReactNote(note.id, emoji), onSuccess: refetch });
  const delMut   = useMutation({
    mutationFn: () => apiDelNote(note.id, delKey),
    onSuccess: refetch,
    onError: () => setDelErr("Hatalı şifre."),
  });

  return (
    <>
      {/* ── KART — sabit yükseklik, eşit boyut ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={cn(
          "rounded-2xl border-2 flex flex-col group cursor-pointer",
          "shadow-[3px_3px_0_rgba(0,0,0,0.07)] hover:shadow-[5px_5px_0_rgba(0,0,0,0.11)]",
          "transition-all duration-200 hover:-translate-y-0.5",
          s.bg, s.border
        )}
        style={{ height: 360 }}
        onClick={() => setExpanded(true)}
      >
        {/* Raptiye */}
        <div className="flex justify-center pt-2.5">
          <div className={cn("h-3 w-3 rounded-full border-2 border-white/70 shadow-sm", s.pin)} />
        </div>

        {/* İçerik alanı — flex-1, overflow hidden */}
        <div className="flex flex-col gap-1.5 px-4 py-2 flex-1 overflow-hidden">
          {/* Kategori + zaman + sil */}
          <div className="flex items-center justify-between shrink-0">
            <span className={cn("text-[10px] font-black tracking-widest uppercase opacity-60", s.text)}>
              {cat.emoji} {cat.label}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-400">{timeAgo(note.createdAt)}</span>
              <button onClick={e => { e.stopPropagation(); setShowDel(p => !p); }}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 text-slate-300 hover:text-red-500 transition-all">
                <Trash2 size={10} />
              </button>
            </div>
          </div>

          {/* Not metni — 3 satır, taşmaz, ... ile biter */}
          <p className={cn(
            "text-[14px] font-semibold leading-snug flex-1 overflow-hidden",
            "line-clamp-5 break-words",
            s.text
          )}>
            {note.text}
          </p>

          {/* İletişim */}
          <a href={cHref} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className={cn(
              "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-lg w-fit shrink-0",
              "bg-white/50 hover:bg-white/80 border border-white/60 transition-all",
              s.text, "opacity-70 hover:opacity-100"
            )}>
            <CIcon size={10} />
            <span className="truncate max-w-[130px]">{note.contactValue}</span>
            <ExternalLink size={8} className="opacity-50 shrink-0" />
          </a>
        </div>

        {/* Alt bar — reaksiyonlar + emoji butonu */}
        <div className="px-4 pb-3 border-t-2 border-black/5 pt-2 shrink-0"
          onClick={e => e.stopPropagation()}>
          <div className="flex flex-wrap items-center gap-1">
            {totalR === 0
              ? <span className={cn("text-[10px] italic opacity-40", s.text)}>İlk tepkiyi sen ver!</span>
              : activeReactions.map(([emoji, count]) => (
                  <button key={emoji} onClick={() => reactMut.mutate(emoji)}
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/70 border border-white/80 shadow-sm text-xs font-bold hover:scale-110 transition-transform">
                    {emoji}<span className="text-slate-600 text-[9px] ml-0.5">{count}</span>
                  </button>
                ))
            }
            <div className="ml-auto">
              <button ref={pickerBtnRef}
                onClick={e => { e.stopPropagation(); setShowPicker(p => !p); }}
                className="flex items-center px-1.5 py-1 rounded-full bg-white/50 hover:bg-white/80 border border-white/60 transition-all">
                <SmilePlus size={12} className={s.text} />
              </button>
              <AnimatePresence>
                {showPicker && (
                  <EmojiPicker
                    btnRef={pickerBtnRef}
                    onPick={emoji => { reactMut.mutate(emoji); setShowPicker(false); }}
                    onClose={() => setShowPicker(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Silme formu */}
          <AnimatePresence>
            {showDel && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-2 space-y-1.5"
                onClick={e => e.stopPropagation()}>
                <div className="flex gap-2">
                  <input type="password" value={delKey}
                    onChange={e => { setDelKey(e.target.value); setDelErr(""); }}
                    placeholder="Silme şifresi"
                    className="flex-1 px-2.5 py-1.5 rounded-xl border bg-white/80 text-xs outline-none focus:border-red-400" />
                  <button onClick={() => delMut.mutate()} disabled={!delKey || delMut.isPending}
                    className="px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold">
                    Sil
                  </button>
                </div>
                {delErr && <p className="text-[11px] text-red-600 flex items-center gap-1"><AlertCircle size={10} />{delErr}</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── EXPANDED MODAL — tam metin, blur arka plan ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", backgroundColor: "rgba(0,0,0,0.35)" }}
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 16 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className={cn(
                "relative max-w-md w-full rounded-3xl border-2 shadow-2xl overflow-hidden",
                s.bg, s.border
              )}
            >
              {/* Raptiye */}
              <div className="flex justify-center pt-4">
                <div className={cn("h-4 w-4 rounded-full border-2 border-white/70 shadow-md", s.pin)} />
              </div>

              <div className="px-6 pt-3 pb-6">
                {/* Üst: kategori + zaman + kapat */}
                <div className="flex items-center justify-between mb-3">
                  <span className={cn("text-[11px] font-black tracking-widest uppercase opacity-60", s.text)}>
                    {cat.emoji} {cat.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{timeAgo(note.createdAt)}</span>
                    <button onClick={() => setExpanded(false)}
                      className="p-1.5 rounded-xl hover:bg-black/10 transition-colors">
                      <X size={15} className={s.text} />
                    </button>
                  </div>
                </div>

                {/* Tam metin */}
                <p className={cn("text-base font-semibold leading-relaxed mb-4 break-words", s.text)}>
                  {note.text}
                </p>

                {/* İletişim */}
                <a href={cHref} target="_blank" rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-xl",
                    "bg-white/70 border border-white/90 hover:bg-white transition-all",
                    s.text
                  )}>
                  <CIcon size={14} /> {note.contactValue} <ExternalLink size={10} className="opacity-60" />
                </a>

                {/* Reaksiyonlar */}
                {activeReactions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t-2 border-black/5">
                    {activeReactions.map(([emoji, count]) => (
                      <button key={emoji} onClick={() => reactMut.mutate(emoji)}
                        className="flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-white/70 border border-white/90 text-sm font-bold hover:scale-110 transition-transform">
                        {emoji}<span className="text-slate-600 text-xs ml-0.5">{count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


// ─── DENEYİM KARTI ───────────────────────────────────────────────────────────
function ExperienceCard({ exp, refetch }: { exp: ExperienceResponse; refetch: () => void }) {
  const [showDel, setShowDel]       = useState(false);
  const [delKey, setDelKey]         = useState("");
  const [delErr, setDelErr]         = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [expanded, setExpanded]     = useState(false);
  const [imgOk, setImgOk]           = useState(true);
  const pickerBtnRef                = useRef<HTMLButtonElement>(null);

  const ci    = CONTACT[exp.contactType] ?? CONTACT.email;
  const CIcon = ci.icon;
  const cHref = ci.href(exp.contactValue);

  // Sadece 0'dan büyük reaksiyonlar göster
  const activeReactions = Object.entries(exp.reactions).filter(([, c]) => c > 0);
  const totalR          = activeReactions.reduce((s, [, c]) => s + c, 0);

  const reactMut = useMutation({
    mutationFn: (emoji: string) => apiReactExp(exp.id, emoji),
    onSuccess: refetch,
  });
  const delMut = useMutation({
    mutationFn: () => apiDelExp(exp.id, delKey),
    onSuccess: refetch,
    onError: () => setDelErr("Hatalı şifre."),
  });

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col"
        onClick={() => setExpanded(true)}
      >
        {/* Fotoğraf — kare */}
        <div className="relative bg-slate-100 overflow-hidden shrink-0" style={{ aspectRatio: "9/16" }}>
          {imgOk
            ? <img src={exp.imageUrl} alt="Deneyim" onError={() => setImgOk(false)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            : <div className="w-full h-full flex items-center justify-center bg-slate-100">
                <Camera size={32} className="text-slate-300" />
              </div>
          }
          {/* Zaman badge */}
          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            {timeAgo(exp.createdAt)}
          </div>
          {/* Silme butonu */}
          <button
            onClick={e => { e.stopPropagation(); setShowDel(p => !p); }}
            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 bg-black/50 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-red-500/90 transition-all"
          >
            <Trash2 size={11} />
          </button>
          {/* Açıklama + iletişim overlay — hover'da */}
          {exp.description && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 pt-6 pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-xs leading-relaxed line-clamp-2">{exp.description}</p>
            </div>
          )}
        </div>

        {/* Alt bar */}
        <div className="px-3 py-2.5 flex flex-col gap-2">
          {/* İletişim */}
          <a href={cHref} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-[#003087] transition-colors w-fit">
            <CIcon size={11} />
            <span className="truncate max-w-[120px]">{exp.contactValue}</span>
            <ExternalLink size={9} className="opacity-50 shrink-0" />
          </a>

          {/* Reaksiyonlar */}
          <div className="flex flex-wrap items-center gap-1 pt-1.5 border-t border-slate-100"
            onClick={e => e.stopPropagation()}>
            {totalR === 0
              ? <span className="text-[10px] italic text-slate-400">İlk tepkiyi sen ver!</span>
              : activeReactions.map(([emoji, count]) => (
                  <button key={emoji} onClick={() => reactMut.mutate(emoji)}
                    className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-bold hover:scale-110 transition-all">
                    {emoji}<span className="text-slate-600 text-[10px] ml-0.5">{count}</span>
                  </button>
                ))
            }
            <div className="ml-auto">
              <button ref={pickerBtnRef}
                onClick={e => { e.stopPropagation(); setShowPicker(p => !p); }}
                className="flex items-center px-1.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 transition-all">
                <SmilePlus size={12} className="text-slate-500" />
              </button>
              <AnimatePresence>
                {showPicker && (
                  <EmojiPicker
                    btnRef={pickerBtnRef}
                    onPick={emoji => { reactMut.mutate(emoji); setShowPicker(false); }}
                    onClose={() => setShowPicker(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Silme formu */}
          <AnimatePresence>
            {showDel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden border-t border-slate-100 pt-2 space-y-1.5"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex gap-1.5">
                  <input type="password" value={delKey}
                    onChange={e => { setDelKey(e.target.value); setDelErr(""); }}
                    placeholder="Silme şifresi"
                    className="flex-1 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-red-400" />
                  <button onClick={() => delMut.mutate()} disabled={!delKey || delMut.isPending}
                    className="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold">
                    Sil
                  </button>
                </div>
                {delErr && <p className="text-[11px] text-red-500 flex items-center gap-1"><AlertCircle size={10} />{delErr}</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── LIGHTBOX MODAL ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 16 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="relative max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Fotoğraf */}
              <div className="relative bg-black">
                {imgOk
                  ? <img src={exp.imageUrl} alt="Deneyim" className="w-full max-h-[60vh] object-contain" />
                  : <div className="h-64 flex items-center justify-center"><Camera size={48} className="text-slate-400" /></div>
                }
                <button onClick={() => setExpanded(false)}
                  className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors">
                  <X size={16} />
                </button>
                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {timeAgo(exp.createdAt)}
                </div>
              </div>

              {/* İçerik */}
              <div className="p-5 space-y-3">
                {exp.description && (
                  <p className="text-sm text-slate-700 leading-relaxed">{exp.description}</p>
                )}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <a href={cHref} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all">
                    <CIcon size={14} /> {exp.contactValue} <ExternalLink size={10} className="opacity-60" />
                  </a>
                  {/* Reaksiyonlar */}
                  {activeReactions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {activeReactions.map(([emoji, count]) => (
                        <button key={emoji} onClick={() => reactMut.mutate(emoji)}
                          className="flex items-center gap-0.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-sm font-bold hover:scale-110 transition-all">
                          {emoji}<span className="text-slate-600 text-xs ml-0.5">{count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── NOT FORMU ────────────────────────────────────────────────
function NoteForm({ room, onClose, onSuccess }: { room: string; onClose: () => void; onSuccess: () => void }) {
  const [text, setText]     = useState("");
  const [cat, setCat]       = useState("DIGER");
  const [cType, setCType]   = useState("email");
  const [cVal, setCVal]     = useState("");
  const [delKey, setDelKey] = useState("");
  // Eğer kullanıcı bir odadaysa, form o oda için otomatik açılır
  const [isPriv, setIsPriv] = useState(room !== "PUBLIC");
  const [roomId, setRoomId] = useState(room !== "PUBLIC" ? room : "");
  // Oda şifresini localStorage'dan oku (odaya girerken kaydedildi)
  const storedRoomPw = typeof window !== "undefined"
    ? localStorage.getItem(`room_pw_${room}`) ?? ""
    : "";
  const [newRoomPw, setNewRoomPw] = useState(storedRoomPw);
  const [done, setDone]     = useState(false);
  const [err, setErr]       = useState("");

  const mut = useMutation({
    mutationFn: apiPostNote,
    onSuccess: () => { onSuccess(); setDone(true); },
    onError: (e: any) => {
      const status = e?.response?.status;
      if (status === 400) setErr("Lütfen tüm alanları eksiksiz doldurun.");
      else if (status === 403) setErr("Oda şifresi hatalı. Lütfen odadan çıkıp tekrar girin.");
      else if (status === 404) setErr("Oda bulunamadı.");
      else setErr(`Hata: ${e?.response?.data?.message ?? e?.message ?? "Bilinmeyen hata"}`);
    },
  });

  if (done) return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
        <Check size={28} className="text-emerald-600" />
      </div>
      <p className="font-bold text-slate-900">Notun yayınlandı! 🎉</p>
      <p className="text-xs text-amber-600 flex items-center gap-1">
        <KeyRound size={11} /> Silme şifreni not et!
      </p>
      <button onClick={onClose} className="px-6 py-2 bg-[#003087] text-white rounded-xl text-sm font-semibold mt-1">
        Tamam
      </button>
    </div>
  );

  return (
    <form onSubmit={e => {
      e.preventDefault();
      // Manuel validasyon — tarayıcı native mesajı yerine Türkçe kontrol
      if (isPriv && !roomId.trim()) { setErr("Oda adı boş olamaz."); return; }
      if (isPriv && !newRoomPw.trim()) {
        // localStorage'dan şifre gelmediyse kullanıcıya göster
        if (room !== "PUBLIC") {
          setErr("Oturumunuz sona ermiş olabilir. Lütfen odadan çıkıp tekrar girin.");
        } else {
          setErr("Oda şifresi boş olamaz.");
        }
        return;
      }
      mut.mutate({
        text, category: cat, contactType: cType, contactValue: cVal, deleteKey: delKey,
        roomId: isPriv ? roomId : "PUBLIC",
        roomPassword: isPriv ? newRoomPw : null,
      });
    }} className="space-y-3">

      {/* Kategori */}
      <div className="flex gap-1.5 flex-wrap">
        {NOTE_CATS.filter(c => c.id !== "ALL").map(c => (
          <button key={c.id} type="button" onClick={() => setCat(c.id)}
            className={cn("px-2.5 py-1 rounded-full text-xs font-bold border transition-all",
              cat === c.id ? "text-white border-transparent" : "bg-white border-slate-200 text-slate-600")}
            style={cat === c.id ? { backgroundColor: c.color } : {}}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Metin */}
      <textarea value={text} onChange={e => setText(e.target.value)}
        placeholder="Ne düşünüyorsun? 💭" rows={3} maxLength={500} required
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#003087] resize-none" />
      <p className="text-right text-[10px] text-slate-400 -mt-1">{text.length}/500</p>

      <ContactInput type={cType} value={cVal} onType={setCType} onValue={setCVal} />

      {/* Silme şifresi */}
      <div className="space-y-1.5">
        <div className="relative">
          <KeyRound size={13} className="absolute left-3 top-3 text-slate-400" />
          <input type="password" value={delKey} onChange={e => setDelKey(e.target.value)}
            placeholder="Silme şifresi (min 4 karakter)" minLength={4} required
            className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#003087]" />
        </div>
        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
          <KeyRound size={10} className="shrink-0" />
          Bu şifreyi not al! Notunu silmek istediğinde gerekecek.
        </p>
      </div>

      {/* Public/Private toggle */}
      <button type="button" onClick={() => setIsPriv(p => !p)}
        className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all",
          isPriv ? "bg-blue-50 border-blue-300 text-[#003087]" : "bg-slate-50 border-slate-200 text-slate-500")}>
        {isPriv ? <Lock size={12} /> : <Unlock size={12} />}
        {isPriv ? "Özel Oda (aktif)" : "Herkese Açık (Public)"}
      </button>

      <AnimatePresence>
        {isPriv && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            {/* Mevcut odadaysa sadece oda adını göster, şifre gizli */}
            {room !== "PUBLIC" ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200">
                  <Lock size={13} className="text-[#003087] shrink-0" />
                  <span className="text-sm font-semibold text-[#003087]">#{roomId}</span>
                  <span className="text-xs text-blue-400 ml-auto">Not bu odaya eklenecek</span>
                </div>
                {!newRoomPw && (
                  <input
                    type="password"
                    value={newRoomPw}
                    onChange={e => setNewRoomPw(e.target.value)}
                    placeholder="Oda şifresini girin"
                    autoFocus
                    className="w-full px-3 py-2 rounded-xl border border-blue-300 text-sm outline-none focus:border-[#003087]"
                  />
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <input value={roomId} onChange={e => setRoomId(e.target.value)} placeholder="Oda ID"
                  className="px-3 py-2 rounded-xl border border-blue-200 text-sm outline-none focus:border-[#003087]" />
                <input type="password" value={newRoomPw} onChange={e => setNewRoomPw(e.target.value)} placeholder="Oda şifresi"
                  className="px-3 py-2 rounded-xl border border-blue-200 text-sm outline-none focus:border-[#003087]" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {err && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{err}</p>}

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose}
          className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">
          İptal
        </button>
        <button type="submit" disabled={mut.isPending || !text || !cVal || !delKey}
          className="flex-1 py-2.5 bg-[#003087] hover:bg-[#0046c8] disabled:opacity-40 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5">
          {mut.isPending ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Send size={14} />}
          Yayınla
        </button>
      </div>
    </form>
  );
}

// ─── DENEYİM FORMU ───────────────────────────────────────────────────────────
function ExperienceForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [imageUrl, setImageUrl]   = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");
  const [preview, setPreview]     = useState("");
  // Cloudinary yoksa direkt URL modunda aç
  const [mode, setMode]           = useState<"upload" | "url">(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? "upload" : "url"
  );
  const [desc, setDesc]           = useState("");
  const [cType, setCType]         = useState("instagram");
  const [cVal, setCVal]           = useState("");
  const [delKey, setDelKey]       = useState("");
  const [done, setDone]           = useState(false);
  const [err, setErr]             = useState("");
  const fileRef                   = useRef<HTMLInputElement>(null);

  const mut = useMutation({
    mutationFn: apiPostExp,
    onSuccess: () => { onSuccess(); setDone(true); },
    onError: (e: any) => {
      const status = e?.response?.status;
      if (status === 400) setErr("Lütfen tüm alanları eksiksiz doldurun.");
      else setErr("Bir hata oluştu. Tekrar deneyin.");
    },
  });

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) { setUploadErr("Sadece görsel seçin."); return; }
    // Cloudinary yapılandırılmamışsa URL moduna yönlendir
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
      setMode("url");
      setUploadErr("Fotoğraf yükleme şu an aktif değil. Lütfen görsel URL'si girin (örn: Imgur, ImgBB).");
      return;
    }
    setUploadErr(""); setUploading(true);
    setPreview(URL.createObjectURL(file));
    try {
      setImageUrl(await uploadCDN(file));
    } catch {
      setUploadErr("Yükleme başarısız. URL moduna geçerek görsel linki girin.");
      setPreview("");
    }
    finally { setUploading(false); }
  }, []);

  if (done) return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
        <Check size={28} className="text-emerald-600" />
      </div>
      <p className="font-bold text-slate-900">Deneyimin paylaşıldı! 📸</p>
      <p className="text-xs text-amber-600 flex items-center gap-1">
        <KeyRound size={11} /> Silme şifreni not et!
      </p>
      <button onClick={onClose} className="px-6 py-2 bg-[#003087] text-white rounded-xl text-sm font-semibold mt-1">Tamam</button>
    </div>
  );

  return (
    <form onSubmit={e => {
      e.preventDefault();
      if (!imageUrl) { setUploadErr("Fotoğraf ekleyin."); return; }
      if (!cVal.trim()) { setErr("İletişim bilgisi boş olamaz."); return; }
      if (!delKey.trim() || delKey.trim().length < 4) { setErr("Silme şifresi en az 4 karakter olmalı."); return; }
      mut.mutate({ imageUrl, description: desc, contactType: cType, contactValue: cVal, deleteKey: delKey });
    }} className="space-y-3">

      {/* Mod seçimi */}
      <div className="flex gap-1.5 bg-slate-100 rounded-xl p-1">
        {(["upload", "url"] as const).map(m => (
          <button key={m} type="button"
            onClick={() => {
              if (m === "upload" && !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
                setMode("url");
                setUploadErr("Dosya yükleme aktif değil. URL ile ekleyin.");
                return;
              }
              setUploadErr("");
              setMode(m);
            }}
            className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all",
              mode === m ? "bg-white shadow-sm text-slate-900" : "text-slate-500",
              m === "upload" && !process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? "opacity-50" : "")}>
            {m === "upload" ? <><Upload size={12} /> Dosyadan</> : <><LinkIcon size={12} /> URL</>}
          </button>
        ))}
      </div>

      {/* Upload / URL */}
      {mode === "upload" ? (
        <div onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          className={cn("rounded-2xl border-2 border-dashed cursor-pointer transition-all overflow-hidden",
            preview ? "border-transparent" : "border-slate-300 hover:border-[#003087] bg-slate-50 p-8")}>
          {preview ? (
            <div className="aspect-video relative">
              <img src={preview} alt="önizleme" className="w-full h-full object-cover rounded-2xl" />
              {uploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                  <div className="h-8 w-8 rounded-full border-2 border-white border-t-transparent animate-spin" />
                </div>
              )}
              {imageUrl && !uploading && (
                <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check size={10} /> Yüklendi
                </div>
              )}
              <button type="button" onClick={e => { e.stopPropagation(); setPreview(""); setImageUrl(""); }}
                className="absolute top-2 left-2 bg-black/40 text-white p-1 rounded-full hover:bg-black/60">
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Camera size={32} />
              <p className="text-sm font-medium">Fotoğraf seç veya sürükle</p>
              <p className="text-xs">JPG, PNG, WEBP</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <ImagePlus size={14} className="absolute left-3 top-3 text-slate-400" />
            <input
              value={imageUrl}
              onChange={e => {
                setImageUrl(e.target.value);
                setPreview(e.target.value);
                setUploadErr("");
              }}
              placeholder="https://... (Imgur, ImgBB, Google Photos vb.)"
              className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#003087]"
            />
          </div>
          {imageUrl && (
            <p className="text-[11px] text-slate-400 px-1">
              Direkt görsel URL'si olmalı (.jpg, .png, .webp ile bitmeli).
              Imgur için: <span className="font-semibold">i.imgur.com/xxx.jpg</span> formatını kullanın.
            </p>
          )}
          {preview && (
            <div className="rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center" style={{ aspectRatio: "9/16", maxHeight: 300 }}>
              <img
                src={preview}
                alt="önizleme"
                className="w-full h-full object-cover"
                onError={() => {
                  setPreview("");
                  setUploadErr("Görsel yüklenemedi. Direkt görsel URL'si girin (i.imgur.com/xxx.jpg gibi). Imgur gallery linkleri çalışmaz.");
                }}
              />
            </div>
          )}
          {!preview && !imageUrl && (
            <div className="rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 text-slate-400 py-8">
              <LinkIcon size={24} />
              <p className="text-xs font-medium">Görsel URL'si yapıştırın</p>
              <p className="text-[11px] text-slate-300">Imgur, ImgBB, Google Drive vb.</p>
            </div>
          )}
        </div>
      )}

      {uploadErr && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{uploadErr}</p>}

      {/* Açıklama — opsiyonel */}
      <textarea value={desc} onChange={e => setDesc(e.target.value)}
        placeholder="Bir şeyler anlat... (opsiyonel)" rows={2} maxLength={200}
        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#003087] resize-none" />
      <p className="text-right text-[10px] text-slate-400 -mt-1">{desc.length}/200</p>

      {/* İletişim */}
      <ContactInput type={cType} value={cVal} onType={setCType} onValue={setCVal} />

      {/* Silme şifresi */}
      <div className="space-y-1.5">
        <div className="relative">
          <KeyRound size={13} className="absolute left-3 top-3 text-slate-400" />
          <input type="password" value={delKey} onChange={e => { setDelKey(e.target.value); setErr(""); }}
            placeholder="Silme şifresi (min 4 karakter)"
            className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#003087]" />
        </div>
        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
          <KeyRound size={10} className="shrink-0" />
          Bu şifreyi not al! Fotoğrafını silmek istediğinde gerekecek.
        </p>
      </div>

      {err && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{err}</p>}

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose}
          className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50">
          İptal
        </button>
        <button type="submit" disabled={mut.isPending || !imageUrl || !cVal || !delKey || uploading}
          className="flex-1 py-2.5 bg-[#003087] hover:bg-[#0046c8] disabled:opacity-40 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5">
          {mut.isPending ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Camera size={14} />}
          Paylaş
        </button>
      </div>
    </form>
  );
}

// ─── MODAL ───────────────────────────────────────────────────
function Modal({ title, icon: Icon, onClose, children }: {
  title: string; icon: React.ElementType; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <Icon size={17} className="text-[#003087]" />
            <h3 className="font-bold text-slate-900">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </motion.div>
    </motion.div>
  );
}

// ─── ODA GİRİŞ BUTONU ───────────────────────────────────────
function JoinButton({ roomId, pass, onJoin, onClose, setErr }: {
  roomId: string;
  pass: string;
  onJoin: (id: string) => void;
  onClose: () => void;
  setErr: (e: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!roomId.trim()) { setErr("Oda ID boş olamaz."); return; }
    if (!pass.trim()) { setErr("Oda şifresini girin."); return; }
    setLoading(true);
    try {
      await axios.get(`${API}/notes/rooms/${roomId.trim()}/exists`);
      // Şifreyi localStorage'a kaydet — NoteForm'da kullanılacak
      localStorage.setItem(`room_pw_${roomId.trim()}`, pass.trim());
      onJoin(roomId.trim());
      onClose();
    } catch (e: any) {
      if (e?.response?.status === 404) {
        setErr("Bu oda bulunamadı. Oda adını kontrol edin.");
      } else {
        setErr("Bağlantı hatası. Tekrar deneyin.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleJoin} disabled={loading}
      className="w-full py-2.5 bg-[#003087] hover:bg-[#0046c8] disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5">
      {loading
        ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
        : <><LogIn size={14} /> Gir</>
      }
    </button>
  );
}


// ─── ODA PANELİ ──────────────────────────────────────────────
function RoomPanel({ currentRoom, onJoin, onLeave, onClose }: {
  currentRoom: string;
  onJoin: (id: string) => void;
  onLeave: () => void;
  onClose: () => void;
}) {
  const [mode, setMode]     = useState<"join" | "create">("join");
  const [roomId, setRoomId] = useState("");
  const [pass, setPass]     = useState("");
  const [err, setErr]       = useState("");

  const createMut = useMutation({
    mutationFn: () => apiCreateRoom(roomId, pass),
    onSuccess: () => { onJoin(roomId); onClose(); },
    onError: (e: any) => {
      const status = e?.response?.status;
      if (status === 400) setErr("Bu oda adı zaten kullanılıyor. Farklı bir isim deneyin.");
      else setErr("Bir hata oluştu. Tekrar deneyin.");
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 space-y-4"
      style={{ width: 300 }}
    >
      {/* Mevcut oda */}
      {currentRoom !== "PUBLIC" && (
        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2">
            <Lock size={12} className="text-[#003087]" />
            <span className="text-xs font-bold text-[#003087]">#{currentRoom} odasındasın</span>
          </div>
          <button onClick={() => { onLeave(); onClose(); }}
            className="text-xs text-[#003087] hover:text-red-500 font-bold hover:underline">
            ← Çık
          </button>
        </div>
      )}

      {/* Mod */}
      <div className="flex gap-1.5 bg-slate-100 rounded-xl p-1">
        {(["join", "create"] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setErr(""); }}
            className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all",
              mode === m ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}>
            {m === "join" ? <><LogIn size={12} /> Odaya Gir</> : <><PlusCircle size={12} /> Oda Oluştur</>}
          </button>
        ))}
      </div>

      {mode === "join" ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">Davet aldığın odaya girmek için ID ve şifreyi gir.</p>
          <input value={roomId} onChange={e => { setRoomId(e.target.value); setErr(""); }}
            placeholder="Oda ID" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#003087]" />
          <input type="password" value={pass} onChange={e => setPass(e.target.value)}
            placeholder="Oda şifresi" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#003087]" />
          <JoinButton roomId={roomId} pass={pass} onJoin={onJoin} onClose={onClose} setErr={setErr} />
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">Sınıf grubu için gizli oda oluştur.</p>
          <input value={roomId} onChange={e => { setRoomId(e.target.value); setErr(""); }}
            placeholder="Oda adı (örn: cs101)" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#003087]" />
          <input type="password" value={pass} onChange={e => setPass(e.target.value)}
            placeholder="Şifre belirle" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#003087]" />
          <button onClick={() => { if (!roomId) { setErr("Oda adı boş olamaz."); return; } if (!pass) { setErr("Şifre boş olamaz."); return; } createMut.mutate(); }}
            disabled={createMut.isPending}
            className="w-full py-2.5 bg-[#003087] hover:bg-[#0046c8] disabled:opacity-40 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-1.5">
            {createMut.isPending ? <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <PlusCircle size={14} />}
            Oluştur
          </button>
        </div>
      )}

      {err && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{err}</p>}
      <button onClick={onClose} className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">Kapat</button>
    </motion.div>
  );
}

// ─── ANA SAYFA ────────────────────────────────────────────────
export default function KesfetPage() {
  const [tab, setTab]               = useState<"wall" | "exp">("wall");
  const [category, setCategory]     = useState("ALL");
  const [sort, setSort]             = useState<"NEW" | "TREND">("NEW");
  const [room, setRoom]             = useState("PUBLIC");
  const [expSort, setExpSort]               = useState<"NEW" | "TREND">("NEW");
  const [showExpSortDd, setShowExpSortDd]   = useState(false);
  const [showNoteForm, setShowNoteForm]     = useState(false);
  const [showExpForm, setShowExpForm]       = useState(false);
  const [showRoomPanel, setShowRoomPanel]   = useState(false);
  const [showSortDd, setShowSortDd]         = useState(false);

  const { data: notes = [], isLoading: notesLoading, refetch: refetchNotes } = useQuery<NoteResponse[]>({
    queryKey: ["notes", room, category, sort],
    queryFn: () => apiFetchNotes(room, category, sort),
    refetchInterval: 30_000,
  });

  const { data: exps = [], isLoading: expsLoading, refetch: refetchExps } = useQuery<ExperienceResponse[]>({
    queryKey: ["experiences", expSort],
    queryFn: () => apiFetchExps(expSort),
    refetchInterval: 60_000,
  });

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* HERO */}
      <section className="pt-28 pb-0 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #001f5a 0%, #003087 55%, #0046c8 100%)" }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 30% 40%, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="relative max-w-6xl mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">Kampüsü Keşfet</h1>
            <p className="text-white/65 text-base">Sesini duyur, anlarını paylaş, deneyimlerini aktar.</p>
          </div>
          <div className="flex gap-0">
            {[{ id: "wall", label: "Kampüs Duvarı", icon: StickyNote }, { id: "exp", label: "Deneyimler", icon: Camera }]
              .map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id as "wall" | "exp")}
                  className={cn("relative flex items-center gap-2 px-6 py-3.5 text-sm font-bold transition-all rounded-t-xl",
                    tab === id ? "bg-[#f8fafc] text-[#003087]" : "text-white/70 hover:text-white hover:bg-white/10")}>
                  <Icon size={15} />{label}
                  {tab === id && <motion.div layoutId="tab" className="absolute inset-0 rounded-t-xl bg-[#f8fafc]" style={{ zIndex: -1 }} />}
                </button>
              ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">

          {/* KAMPÜS DUVARI */}
          {tab === "wall" && (
            <motion.div key="wall" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">

              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex gap-2 flex-wrap items-center">

                  {/* Sıralama dropdown */}
                  <div className="relative">
                    <button onClick={() => setShowSortDd(p => !p)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-white border-slate-200 text-xs font-semibold text-slate-600 hover:border-slate-300 transition-all">
                      {sort === "NEW" ? <><Clock size={13} /> En Yeni</> : <><TrendingUp size={13} /> Trendler</>}
                      <ChevronDown size={12} className={cn("transition-transform", showSortDd && "rotate-180")} />
                    </button>
                    <AnimatePresence>
                      {showSortDd && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setShowSortDd(false)} />
                          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                            className="absolute top-full mt-1 left-0 z-40 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden w-40">
                            {[{ id: "NEW", label: "En Yeni", icon: Clock }, { id: "TREND", label: "Trendler", icon: TrendingUp }]
                              .map(({ id, label, icon: Icon }) => (
                                <button key={id} onClick={() => { setSort(id as "NEW" | "TREND"); setShowSortDd(false); }}
                                  className={cn("w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold hover:bg-slate-50 transition-colors",
                                    sort === id ? "text-[#003087] bg-blue-50" : "text-slate-600")}>
                                  <Icon size={13} /> {label}
                                  {sort === id && <Check size={12} className="ml-auto text-[#003087]" />}
                                </button>
                              ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Oda dropdown */}
                  <div className="relative">
                    <button onClick={() => setShowRoomPanel(p => !p)}
                      className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all",
                        room !== "PUBLIC" ? "bg-[#003087] text-white border-[#003087]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300")}>
                      {room !== "PUBLIC" ? <><Lock size={13} /> #{room}</> : <><Unlock size={13} /> Public</>}
                      <ChevronDown size={12} className={cn("transition-transform", showRoomPanel && "rotate-180")} />
                    </button>
                    <AnimatePresence>
                      {showRoomPanel && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setShowRoomPanel(false)} />
                          <div className="absolute top-full mt-1 left-0 z-40">
                            <RoomPanel
                              currentRoom={room}
                              onJoin={(id) => { setRoom(id); }}
                              onLeave={() => { setRoom("PUBLIC"); }}
                              onClose={() => setShowRoomPanel(false)}
                            />
                          </div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <button onClick={() => setShowNoteForm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#003087] hover:bg-[#0046c8] text-white rounded-xl text-sm font-bold transition-colors shadow-sm">
                  <Plus size={15} /> Not Bırak
                </button>
              </div>

              {/* Kategori filtreleri */}
              <div className="flex gap-1.5 flex-wrap">
                {NOTE_CATS.map(c => (
                  <button key={c.id} onClick={() => setCategory(c.id)}
                    className={cn("px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                      category === c.id ? "text-white border-transparent shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300")}
                    style={category === c.id ? { backgroundColor: c.color } : {}}>
                    {c.emoji} {c.label}
                  </button>
                ))}
              </div>

              {/* Not grid */}
              {notesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-[360px] bg-amber-100/60 animate-pulse rounded-2xl" />
                  ))}
                </div>
              ) : notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-20 w-20 rounded-3xl bg-amber-100 flex items-center justify-center mb-4">
                    <StickyNote size={32} className="text-amber-400" />
                  </div>
                  <p className="font-semibold text-slate-500 mb-1">Henüz not yok</p>
                  <p className="text-sm text-slate-400">İlk notu sen bırak!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {notes.map((note, i) => (
                      <NoteCard key={note.id} note={note} colorIdx={i} refetch={refetchNotes} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

          {/* DENEYİMLER */}
          {tab === "exp" && (
            <motion.div key="exp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Deneyimler</h2>
                  <p className="text-sm text-slate-500">Kampüs anlarını fotoğrafla paylaş</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Sıralama dropdown */}
                  <div className="relative">
                    <button onClick={() => setShowExpSortDd(p => !p)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-white border-slate-200 text-xs font-semibold text-slate-600 hover:border-slate-300 transition-all">
                      {expSort === "NEW" ? <><Clock size={13} /> En Yeni</> : <><TrendingUp size={13} /> Trendler</>}
                      <ChevronDown size={12} className={cn("transition-transform", showExpSortDd && "rotate-180")} />
                    </button>
                    <AnimatePresence>
                      {showExpSortDd && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setShowExpSortDd(false)} />
                          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                            className="absolute top-full mt-1 left-0 z-40 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden w-40">
                            {[{ id: "NEW", label: "En Yeni", icon: Clock }, { id: "TREND", label: "Trendler", icon: TrendingUp }]
                              .map(({ id, label, icon: Icon }) => (
                                <button key={id} onClick={() => { setExpSort(id as "NEW" | "TREND"); setShowExpSortDd(false); }}
                                  className={cn("w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold hover:bg-slate-50 transition-colors",
                                    expSort === id ? "text-[#003087] bg-blue-50" : "text-slate-600")}>
                                  <Icon size={13} /> {label}
                                  {expSort === id && <Check size={12} className="ml-auto text-[#003087]" />}
                                </button>
                              ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                  <button onClick={() => setShowExpForm(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#003087] to-[#0046c8] text-white rounded-xl text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">
                    <ImagePlus size={15} /> Paylaş
                  </button>
                </div>
              </div>

              {expsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-slate-200 animate-pulse rounded-2xl" style={{ aspectRatio: "9/16" }} />
                  ))}
                </div>
              ) : exps.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
                    <Camera size={32} className="text-slate-300" />
                  </div>
                  <p className="font-semibold text-slate-500 mb-1">Henüz deneyim yok</p>
                  <p className="text-sm text-slate-400">İlk anı sen paylaş!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <AnimatePresence>
                    {exps.map(exp => <ExperienceCard key={exp.id} exp={exp} refetch={refetchExps} />)}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODALLER */}
      <AnimatePresence>
        {showNoteForm && (
          <Modal title="Not Bırak" icon={StickyNote} onClose={() => setShowNoteForm(false)}>
            <NoteForm room={room} onClose={() => setShowNoteForm(false)} onSuccess={refetchNotes} />
          </Modal>
        )}
        {showExpForm && (
          <Modal title="Deneyim Paylaş" icon={Camera} onClose={() => setShowExpForm(false)}>
            <ExperienceForm onClose={() => setShowExpForm(false)} onSuccess={refetchExps} />
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
