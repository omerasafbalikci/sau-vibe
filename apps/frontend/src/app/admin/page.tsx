"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle, XCircle, Trash2, Phone, Mail, ExternalLink,
  Dumbbell, Code2, Briefcase, GraduationCap,
  Calendar, Megaphone, LogOut, ShieldCheck,
  Clock, RefreshCw, X, KeyRound, Loader2
} from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

// ─── SVG İkonlar ─────────────────────────────────────────────
const Instagram = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);
const Twitter = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
  </svg>
);
const Linkedin = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24.774 0 23.208 0 22.225 0z"/>
  </svg>
);

// ─── Tipler ──────────────────────────────────────────────────
type EventCategory = "SPORTS" | "PROJECT" | "JOB_POSTING" | "EVENT" | "EDUCATION" | "OTHER";
type EventStatus   = "PENDING" | "APPROVED" | "REJECTED";
type ContactType   = "telefon" | "email" | "instagram" | "twitter" | "linkedin";

interface EventResponse {
  id: number;
  title: string;
  description: string;
  category: EventCategory;
  contactType: ContactType;
  contactValue: string;
  author: string;
  status: EventStatus;
  createdAt: string;
  approvedAt: string | null;
}

// ─── Sabitler ────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const KATEGORI_CONFIG: Record<EventCategory, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  SPORTS:      { label: "Spor",     icon: Dumbbell,      color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  PROJECT:     { label: "Proje",    icon: Code2,         color: "text-violet-700",  bg: "bg-violet-50 border-violet-200" },
  JOB_POSTING: { label: "İş İlanı", icon: Briefcase,     color: "text-blue-700",    bg: "bg-blue-50 border-blue-200" },
  EVENT:       { label: "Etkinlik", icon: Calendar,      color: "text-orange-700",  bg: "bg-orange-50 border-orange-200" },
  EDUCATION:   { label: "Eğitim",   icon: GraduationCap, color: "text-pink-700",    bg: "bg-pink-50 border-pink-200" },
  OTHER:       { label: "Diğer",    icon: Megaphone,     color: "text-slate-700",   bg: "bg-slate-50 border-slate-200" },
};

const CONTACT_CONFIG: Record<ContactType, { icon: React.ElementType; label: string; prefix: string; suffixText: string }> = {
  telefon:   { icon: Phone,     label: "Telefon",   prefix: "tel:",             suffixText: "ile İletişime Geç" },
  email:     { icon: Mail,      label: "E-posta",   prefix: "mailto:",          suffixText: "ile İletişime Geç" },
  instagram: { icon: Instagram, label: "Instagram", prefix: "https://instagram.com/", suffixText: "ile İletişime Geç" },
  twitter:   { icon: Twitter,   label: "Twitter",   prefix: "https://twitter.com/",   suffixText: "ile İletişime Geç" },
  linkedin:  { icon: Linkedin,  label: "LinkedIn",  prefix: "https://linkedin.com/in/", suffixText: "ile İletişime Geç" },
};

const getStoredKey = () => (typeof window !== "undefined" ? localStorage.getItem("admin_session_key") || "" : "");
const adminHeaders = () => ({ "X-Admin-Key": getStoredKey() });

// ─── API Servisleri ──────────────────────────────────────────
const adminGetAll = async (): Promise<EventResponse[]> => {
  const { data } = await axios.get(`${API}/events/admin`, { headers: adminHeaders() });
  return data;
};
const adminApprove = async (id: number): Promise<EventResponse> => {
  const { data } = await axios.put(`${API}/events/admin/${id}/approve`, {}, { headers: adminHeaders() });
  return data;
};
const adminReject = async (id: number): Promise<EventResponse> => {
  const { data } = await axios.put(`${API}/events/admin/${id}/reject`, {}, { headers: adminHeaders() });
  return data;
};
const adminDelete = async (id: number): Promise<void> => {
  await axios.delete(`${API}/events/admin/${id}`, { headers: adminHeaders() });
};

// ─── Admin Event Kartı ────────────────────────────────────────
function AdminEventCard({ event, onApprove, onReject, onDelete, onOpenModal }: {
  event: EventResponse;
  onApprove: (id: number) => void;
  onReject:  (id: number) => void;
  onDelete:  (id: number) => void;
  onOpenModal: (event: EventResponse) => void;
}) {
  const kat = KATEGORI_CONFIG[event.category] || KATEGORI_CONFIG["OTHER"];
  const cont = CONTACT_CONFIG[event.contactType] || { icon: ExternalLink, label: event.contactType || "Bağlantı", prefix: "", suffixText: "ile İletişime Geç" };

  const KatIcon  = kat.icon;
  const ContIcon = cont.icon;

  const currentPrefix = cont.prefix || "";
  const currentVal    = event.contactValue || "";
  const href =
    event.contactType === "telefon" || event.contactType === "email"
      ? `${currentPrefix}${currentVal}`
      : `${currentPrefix}${currentVal.replace("@", "")}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col justify-between h-full gap-4 transition-shadow hover:shadow-md">
        
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold", kat.bg, kat.color)}>
                <KatIcon size={12} /> {kat.label}
              </div>
              <Badge
                variant="outline"
                className={cn("text-[10px] px-2",
                  event.status === "APPROVED" && "border-emerald-300 text-emerald-700 bg-emerald-50",
                  event.status === "PENDING"  && "border-amber-300 text-amber-700 bg-amber-50",
                  event.status === "REJECTED" && "border-red-300 text-red-700 bg-red-50",
                )}
              >
                {event.status === "APPROVED" ? "✓ Onaylı" : event.status === "PENDING" ? "⏳ Bekliyor" : "✗ Reddedildi"}
              </Badge>
            </div>
            <span className="text-[11px] text-slate-400 shrink-0">
              {new Date(event.createdAt).toLocaleDateString("tr-TR")}
            </span>
          </div>

          <div onClick={() => onOpenModal(event)} className="cursor-pointer group">
            <h3 className="font-bold text-slate-900 text-base leading-snug mb-1.5 break-words line-clamp-1 group-hover:text-[#003087] transition-colors">
              {event.title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed break-words line-clamp-3 min-h-[60px]">
              {event.description}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-auto">
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
            <span className="text-xs text-slate-500 font-medium truncate flex-1">👤 {event.author}</span>
            <a
              href={href} target="_blank" rel="noopener noreferrer"
              className={cn("flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border hover:opacity-80 transition-all shrink-0 whitespace-nowrap", kat.bg, kat.color)}
            >
              <ContIcon size={12} /> {cont.label} <ExternalLink size={10} />
            </a>
          </div>

          <div className="flex gap-2">
            {event.status === "PENDING" && (
              <>
                <Button size="sm" onClick={() => onApprove(event.id)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5">
                  <CheckCircle size={13} /> Onayla
                </Button>
                <Button size="sm" variant="outline" onClick={() => onReject(event.id)}
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50 text-xs gap-1.5">
                  <XCircle size={13} /> Reddet
                </Button>
              </>
            )}
            {event.status === "REJECTED" && (
              <Button size="sm" onClick={() => onApprove(event.id)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5">
                <CheckCircle size={13} /> Yeniden Onayla
              </Button>
            )}
            {event.status === "APPROVED" && (
              <Button size="sm" variant="outline" onClick={() => onReject(event.id)}
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 text-xs gap-1.5">
                <XCircle size={13} /> Yayından Kaldır
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => onDelete(event.id)}
              className="border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 text-xs gap-1 shrink-0">
              <Trash2 size={12} /> Sil
            </Button>
          </div>
        </div>

      </Card>
    </motion.div>
  );
}

// ─── Yeni Nesil Premium Giriş Ekranı (Login) ────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [sifre, setSifre] = useState("");
  const [hata, setHata]   = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  const giris = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sifre.trim()) return;

    setYukleniyor(true);
    setHata("");

    try {
      const res = await axios.post("/api/admin/auth", { password: sifre });
      if (res.data.success) {
        localStorage.setItem("admin_session_key", sifre);
        onLogin();
      }
    } catch (err: any) {
      setHata(err.response?.data?.message || "Giriş başarısız. Lütfen şifreyi kontrol edin.");
      setSifre("");
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex flex-col items-center justify-center px-4 overflow-hidden select-none">
      {/* Estetik Işık Hüzmeleri (Glow Effects) */}
      <div className="absolute top-[-10%] left-[-10%] w-[700px] h-[700px] rounded-full bg-blue-600/15 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-500/15 blur-[150px] pointer-events-none" />
      
      {/* Arka Plan Grid Katmanı */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_80%,transparent_100%)] pointer-events-none opacity-60" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[440px] z-10"
      >
        <Card className="p-8 md:p-10 rounded-[32px] border border-slate-800/80 shadow-2xl bg-slate-900/40 backdrop-blur-xl relative">
          {/* Üst İnce Çizgi Detayı */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent rounded-full" />

          <div className="flex flex-col items-center text-center mb-8">
            <motion.div 
              initial={{ rotate: -8, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 120 }}
              className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 ring-4 ring-slate-800/50"
            >
              <ShieldCheck size={26} className="text-white" />
            </motion.div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Yönetim Paneli</h1>
            <p className="text-sm text-slate-400 mt-1.5 font-medium">SAU VIBE korumalı alanına erişim sağlayın.</p>
          </div>

          <form onSubmit={giris} className="flex flex-col gap-5">
            <div className="relative">
              <label className="text-xs font-semibold text-slate-400 mb-2 block tracking-wide uppercase">Giriş Anahtarı</label>
              <div className="relative flex items-center">
                <KeyRound size={16} className="absolute left-4 text-slate-500 pointer-events-none" />
                <input 
                  type="password" 
                  value={sifre}
                  disabled={yukleniyor}
                  onChange={(e) => { setSifre(e.target.value); if(hata) setHata(""); }}
                  placeholder="••••••••••••"
                  className={cn(
                    "w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm outline-none transition-all font-medium text-slate-200 bg-slate-950/60 placeholder-slate-600",
                    hata 
                      ? "border-red-500/50 bg-red-950/10 focus:border-red-500 focus:ring-1 focus:ring-red-500/30" 
                      : "border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  )} 
                />
              </div>
              <AnimatePresence>
                {hata && (
                  <motion.p 
                    initial={{ opacity: 0, y: -4 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }}
                    className="text-xs font-semibold text-red-400 mt-2 flex items-center gap-1.5"
                  >
                    <XCircle size={12} /> {hata}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <Button 
              type="submit" 
              disabled={yukleniyor || !sifre.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl py-6 font-bold tracking-wide shadow-lg shadow-blue-600/10 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {yukleniyor ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" /> Kimlik Doğrulanıyor...
                </>
              ) : (
                <>Güvenli Giriş Yap</>
              )}
            </Button>
          </form>
        </Card>
        <p className="text-center text-xs text-slate-500 mt-6 font-medium tracking-wide">
          Giriş denemeleri güvenlik amacıyla loglanmaktadır.
        </p>
      </motion.div>
    </div>
  );
}

// ─── Admin Dashboard ─────────────────────────────────────────
function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const qc = useQueryClient();
  const [aktifTab, setAktifTab] = useState<"bekleyenler" | "tumu">("bekleyenler");
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, refetch } = useQuery<EventResponse[]>({
    queryKey: ["admin-events"],
    queryFn: adminGetAll,
    refetchInterval: 30 * 1000,
  });

  const approveMut = useMutation({ mutationFn: adminApprove, onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-events"] }); if(selectedEvent) setSelectedEvent(prev => prev ? {...prev, status: "APPROVED"} : null) } });
  const rejectMut  = useMutation({ mutationFn: adminReject,  onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-events"] }); if(selectedEvent) setSelectedEvent(prev => prev ? {...prev, status: "REJECTED"} : null) } });
  const deleteMut  = useMutation({ mutationFn: adminDelete,  onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-events"] }); setSelectedEvent(null); } });

  const bekleyenler   = data?.filter((e) => e.status === "PENDING")  ?? [];
  const onaylilar     = data?.filter((e) => e.status === "APPROVED")  ?? [];
  const reddedilenler = data?.filter((e) => e.status === "REJECTED") ?? [];
  const gosterilenler = aktifTab === "bekleyenler" ? bekleyenler : (data ?? []);

  const katModal = selectedEvent ? (KATEGORI_CONFIG[selectedEvent.category] || KATEGORI_CONFIG["OTHER"]) : null;
  const contModal = selectedEvent ? (CONTACT_CONFIG[selectedEvent.contactType] || { icon: ExternalLink, label: selectedEvent.contactType, prefix: "", suffixText: "ile İletişime Geç" }) : null;
  const KatModalIcon = katModal?.icon;
  const ContModalIcon = contModal?.icon;
  const hrefModal = selectedEvent && contModal ? (
    selectedEvent.contactType === "telefon" || selectedEvent.contactType === "email"
      ? `${contModal.prefix}${selectedEvent.contactValue}`
      : `${contModal.prefix}${selectedEvent.contactValue.replace("@", "")}`
  ) : "";

  // Yenileme buton aksiyonu (Tıklanınca ikon döner ve veriyi tazeleyip biter)
  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 600); // Akıcı bir dönme hissi için hafif bekleme
  };

  const handleLogoutAction = () => {
    localStorage.removeItem("admin_session_key");
    onLogout();
    window.location.reload(); 
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] relative">
      
      {/* Geliştirilmiş ve Uyumlu Admin Header (z-[999] ile en üstte kalır) */}
      <div className="bg-slate-900 border-b border-slate-800 shadow-xl fixed top-0 inset-x-0 z-[999]">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-sm leading-none">SAU VIBE Admin</h1>
              <p className="text-[11px] text-slate-400 mt-1">İlan Yönetim Paneli</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Çalışır hale getirilen ve animasyon eklenen yenileme butonu */}
            <button 
              onClick={handleRefreshClick}
              disabled={isLoading || isRefreshing}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50" 
              title="Verileri Yenile"
            >
              <RefreshCw size={16} className={cn("transition-transform", (isRefreshing || isLoading) && "animate-spin")} />
            </button>
            {/* Kırmızıdan şık füme/koyu gri tona güncellenen uyumlu çıkış butonu */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogoutAction} 
              className="gap-1.5 border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs shadow-sm"
            >
              <LogOut size={13} /> Çıkış Yap
            </Button>
          </div>
        </div>
      </div>

      {/* İçeriğin header arkasına saklanmasını engelleyen boşluklu ana container */}
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Toplam İlan",    value: data?.length ?? 0,    color: "text-slate-900",   bg: "bg-white",      icon: null },
            { label: "Bekleyenler",   value: bekleyenler.length,   color: "text-amber-700",   bg: "bg-amber-50",   icon: Clock },
            { label: "Onaylılar",     value: onaylilar.length,     color: "text-emerald-700", bg: "bg-emerald-50", icon: CheckCircle },
            { label: "Reddedilenler", value: reddedilenler.length, color: "text-red-700",     bg: "bg-red-50",     icon: XCircle },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <Card key={label} className={cn("p-4 rounded-2xl border-0 shadow-sm", bg)}>
              <div className={cn("text-2xl font-bold", color)}>{value}</div>
              <div className="flex items-center gap-1.5 mt-1">
                {Icon && <Icon size={12} className={color} />}
                <span className="text-xs text-slate-500">{label}</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          {(["bekleyenler", "tumu"] as const).map((tab) => (
            <button key={tab} onClick={() => setAktifTab(tab)}
              className={cn("px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                aktifTab === tab ? "bg-[#003087] text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300")}>
              {tab === "bekleyenler" ? `Bekleyenler (${bekleyenler.length})` : `Tümü (${data?.length ?? 0})`}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
          </div>
        ) : gosterilenler.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <CheckCircle size={28} className="text-slate-400" />
            </div>
            <p className="font-semibold text-slate-600">
              {aktifTab === "bekleyenler" ? "Bekleyen ilan yok 🎉" : "Henüz hiç ilan yok"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnimatePresence>
              {gosterilenler.map((event) => (
                <AdminEventCard key={event.id} event={event}
                  onApprove={(id) => approveMut.mutate(id)}
                  onReject={(id)  => rejectMut.mutate(id)}
                  onDelete={(id)  => deleteMut.mutate(id)}
                  onOpenModal={(ev) => setSelectedEvent(ev)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Detay Modalı */}
      <AnimatePresence>
        {selectedEvent && katModal && contModal && KatModalIcon && ContModalIcon && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 md:p-8 overflow-y-auto flex-1 flex flex-col gap-5">
                <div className="flex items-center gap-3 flex-wrap border-b border-slate-50 pb-3">
                  <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold shrink-0", katModal.bg, katModal.color)}>
                    <KatModalIcon size={13} /> {katModal.label}
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("text-[11px] px-2.5 py-0.5 shrink-0",
                      selectedEvent.status === "APPROVED" && "border-emerald-300 text-emerald-700 bg-emerald-50",
                      selectedEvent.status === "PENDING"  && "border-amber-300 text-amber-700 bg-amber-50",
                      selectedEvent.status === "REJECTED" && "border-red-300 text-red-700 bg-red-50",
                    )}
                  >
                    {selectedEvent.status === "APPROVED" ? "✓ Onaylı İlan" : selectedEvent.status === "PENDING" ? "⏳ Onay Bekliyor" : "✗ Reddedilmiş"}
                  </Badge>
                  
                  <div className="flex items-center gap-4 ml-auto shrink-0">
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(selectedEvent.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                    <button 
                      onClick={() => setSelectedEvent(null)}
                      className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div>
                  <h2 className="font-extrabold text-slate-900 text-xl md:text-2xl leading-snug mb-4 break-all md:break-words">
                    {selectedEvent.title}
                  </h2>
                  <div className="bg-slate-50/60 border border-slate-100 p-4 md:p-5 rounded-2xl">
                    <p className="text-sm md:text-base text-slate-700 leading-relaxed break-words whitespace-pre-wrap">
                      {selectedEvent.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-auto">
                  <span className="text-sm text-slate-600 font-semibold flex items-center gap-1.5 min-w-0">
                    <span className="text-base shrink-0">👤</span> 
                    <span className="shrink-0">İlan Sahibi:</span> 
                    <span className="text-slate-900 font-bold truncate" title={selectedEvent.author}>
                      {selectedEvent.author}
                    </span>
                  </span>
                  <a
                    href={hrefModal} target="_blank" rel="noopener noreferrer"
                    className={cn(
                      "flex items-center justify-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl border hover:opacity-90 transition-all shadow-sm shrink-0 whitespace-nowrap", 
                      katModal.bg, 
                      katModal.color
                    )}
                  >
                    <ContModalIcon size={14} /> {contModal.label} {contModal.suffixText} <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex gap-3 flex-wrap sm:flex-nowrap">
                {selectedEvent.status === "PENDING" && (
                  <>
                    <Button size="default" onClick={() => approveMut.mutate(selectedEvent.id)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm gap-1.5 shadow-sm py-5">
                      <CheckCircle size={16} /> İlanı Onayla
                    </Button>
                    <Button size="default" variant="outline" onClick={() => rejectMut.mutate(selectedEvent.id)}
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm gap-1.5 py-5">
                      <XCircle size={16} /> İlanı Reddet
                    </Button>
                  </>
                )}
                {selectedEvent.status === "REJECTED" && (
                  <Button size="default" onClick={() => approveMut.mutate(selectedEvent.id)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm gap-1.5 py-5">
                    <CheckCircle size={16} /> İlanı Yeniden Onayla
                  </Button>
                )}
                {selectedEvent.status === "APPROVED" && (
                  <Button size="default" variant="outline" onClick={() => rejectMut.mutate(selectedEvent.id)}
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 font-semibold text-sm gap-1.5 py-5">
                    <XCircle size={16} /> İlanı Yayından Kaldır
                  </Button>
                )}
                <Button size="default" variant="outline" onClick={() => deleteMut.mutate(selectedEvent.id)}
                  className="border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 font-semibold text-sm gap-1.5 px-4 py-5 shrink-0">
                  <Trash2 size={16} /> Sil
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Ana Export Bileşeni (Hydration Guard) ───────────────────
export default function AdminPage() {
  const [girisYapildi, setGirisYapildi] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasSession = localStorage.getItem("admin_session_key");
    if (hasSession) {
      setGirisYapildi(true);
    }
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-slate-950" />;
  }

  if (!girisYapildi) {
    return <LoginScreen onLogin={() => setGirisYapildi(true)} />;
  }

  return <AdminDashboard onLogout={() => setGirisYapildi(false)} />;
}