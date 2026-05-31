"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Plus, Search, Filter, Phone, Mail, ExternalLink,
  Loader2, Megaphone, Dumbbell, Code2, Briefcase,
  GraduationCap, Calendar, CheckCircle, ChevronDown,
  Trash2, KeyRound, AlertCircle, X, User, Type, AlignLeft
} from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";

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

type EventCategory = "SPORTS" | "PROJECT" | "JOB_POSTING" | "EVENT" | "EDUCATION" | "OTHER";
type ContactType   = "telefon" | "email" | "instagram" | "twitter" | "linkedin";

interface EventResponse {
  id: number;
  title: string;
  description: string;
  category: EventCategory;
  contactType: ContactType;
  contactValue: string;
  author: string;
  createdAt: string;
}

interface EventCreateRequest {
  title: string;
  description: string;
  category: EventCategory;
  contactType: ContactType;
  contactValue: string;
  author: string;
  deletePassword: string;
}

const API = process.env.NEXT_PUBLIC_API_URL;

const KATEGORI_CONFIG: Record<EventCategory, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  SPORTS:      { label: "Spor",     icon: Dumbbell,      color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  PROJECT:     { label: "Proje",    icon: Code2,         color: "text-violet-700",  bg: "bg-violet-50 border-violet-200" },
  JOB_POSTING: { label: "İş İlanı", icon: Briefcase,     color: "text-blue-700",    bg: "bg-blue-50 border-blue-200" },
  EVENT:       { label: "Etkinlik", icon: Calendar,      color: "text-orange-700",  bg: "bg-orange-50 border-orange-200" },
  EDUCATION:   { label: "Eğitim",   icon: GraduationCap, color: "text-pink-700",    bg: "bg-pink-50 border-pink-200" },
  OTHER:       { label: "Diğer",    icon: Megaphone,     color: "text-slate-700",   bg: "bg-slate-50 border-slate-200" },
};

const CONTACT_CONFIG: Record<ContactType, { icon: React.ElementType; label: string; prefix: string; suffixText: string }> = {
  telefon:   { icon: Phone,     label: "Telefon",   prefix: "tel:",                    suffixText: "ile İletişime Geç" },
  email:     { icon: Mail,      label: "E-posta",   prefix: "mailto:",                 suffixText: "ile İletişime Geç" },
  instagram: { icon: Instagram, label: "Instagram", prefix: "https://instagram.com/",  suffixText: "ile İletişime Geç" },
  twitter:   { icon: Twitter,   label: "Twitter",   prefix: "https://twitter.com/",    suffixText: "ile İletişime Geç" },
  linkedin:  { icon: Linkedin,  label: "LinkedIn",  prefix: "https://linkedin.com/in/",suffixText: "ile İletişime Geç" },
};

const fetchEvents = async (category?: EventCategory): Promise<EventResponse[]> => {
  const params = category ? `?category=${category}` : "";
  const { data } = await axios.get(`${API}/events${params}`);
  return data;
};

const createEvent = async (req: EventCreateRequest): Promise<EventResponse> => {
  const { data } = await axios.post(`${API}/events`, req);
  return data;
};

const deleteEventByUser = async ({ id, password }: { id: number; password: string }): Promise<void> => {
  await axios.delete(`${API}/events/${id}?password=${encodeURIComponent(password)}`);
};

function DeleteDialog({ event, onClose }: { event: EventResponse; onClose: () => void }) {
  const qc = useQueryClient();
  const [password, setPassword] = useState("");
  const [hata, setHata]         = useState("");
  const [success, setSuccess]   = useState(false);

  const mut = useMutation({
    mutationFn: deleteEventByUser,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["events"] }); setSuccess(true); },
    onError: (err: unknown) => {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const msg = err.response?.data?.message;
        if (status === 400 || status === 403 || msg === "Incorrect password") {
          setHata("Hatalı şifre. İlanı oluştururken girdiğiniz şifreyi deneyin.");
        } else if (status === 404) {
          setHata("İlan bulunamadı.");
        } else {
          setHata("Bir hata oluştu. Lütfen tekrar deneyin.");
        }
      } else {
        setHata("Sistemsel bir hata oluştu.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) { setHata("Şifre boş olamaz."); return; }
    mut.mutate({ id: event.id, password });
  };

  if (success) return (
    <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
      <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
        <CheckCircle size={28} className="text-emerald-600" />
      </div>
      <h3 className="font-bold text-slate-900">İlan Silindi</h3>
      <p className="text-sm text-slate-500">İlanınız başarıyla kaldırıldı.</p>
      <Button onClick={onClose} className="bg-[#003087] hover:bg-[#0046c8] text-white px-8 rounded-xl">Tamam</Button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
        <p className="text-sm font-semibold text-red-800 mb-1 truncate">{event.title}</p>
        <p className="text-xs text-red-600">Bu ilanı silmek üzeresiniz. Bu işlem geri alınamaz.</p>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
          <KeyRound size={12} /> İlan Şifresi *
        </label>
        <input
          type="password" value={password}
          onChange={e => { setPassword(e.target.value); setHata(""); }}
          placeholder="İlanı oluştururken girdiğiniz şifre"
          className={cn("w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors",
            hata ? "border-red-300 bg-red-50" : "border-slate-200 focus:border-[#003087]")}
        />
        {hata && <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-600"><AlertCircle size={12} />{hata}</div>}
      </div>
      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">Vazgeç</Button>
        <Button type="submit" disabled={mut.isPending}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2 rounded-xl">
          {mut.isPending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          Doğrula ve Sil
        </Button>
      </div>
    </form>
  );
}

function EventCard({ event, onOpenModal }: { event: EventResponse; onOpenModal: (event: EventResponse) => void }) {
  const [deleteAcik, setDeleteAcik] = useState(false);
  const kat  = KATEGORI_CONFIG[event.category] || KATEGORI_CONFIG.OTHER;
  const cont = CONTACT_CONFIG[event.contactType] || { icon: ExternalLink, label: event.contactType, prefix: "" };
  const KatIcon  = kat.icon;
  const ContIcon = cont.icon;
  const href = event.contactType === "telefon" || event.contactType === "email"
    ? `${cont.prefix}${event.contactValue}`
    : `${cont.prefix}${event.contactValue.replace("@", "")}`;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="h-full">
        <Card className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm flex flex-col justify-between h-full gap-4 transition-shadow hover:shadow-md">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold", kat.bg, kat.color)}>
                <KatIcon size={12} /> {kat.label}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-slate-400">{new Date(event.createdAt).toLocaleDateString("tr-TR")}</span>
                <button onClick={e => { e.stopPropagation(); setDeleteAcik(true); }}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all" title="İlanı sil">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <div onClick={() => onOpenModal(event)} className="cursor-pointer group">
              <h3 className="font-bold text-slate-900 text-base leading-snug mb-1.5 break-words line-clamp-1 group-hover:text-[#003087] transition-colors">
                {event.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed break-words line-clamp-3 min-h-[60px]">{event.description}</p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2 mt-auto">
            <span className="text-xs text-slate-500 font-medium truncate flex-1">👤 {event.author}</span>
            <a href={href} target="_blank" rel="noopener noreferrer"
              className={cn("flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-80 shrink-0 whitespace-nowrap", kat.bg, kat.color)}>
              <ContIcon size={12} /> {cont.label} <ExternalLink size={10} />
            </a>
          </div>
        </Card>
      </motion.div>
      <Dialog open={deleteAcik} onOpenChange={setDeleteAcik}>
        <DialogContent className="max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 p-6">
          <DialogHeader className="mb-2">
            <DialogTitle className="flex items-center gap-2 text-red-600 font-bold text-lg"><Trash2 size={18} /> İlanı Sil</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">Şifrenizi doğrulayarak ilanınızı kaldırabilirsiniz.</DialogDescription>
          </DialogHeader>
          <DeleteDialog event={event} onClose={() => setDeleteAcik(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

function EventForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState<EventCreateRequest>({
    title: "", description: "", category: "OTHER",
    contactType: "email", contactValue: "", author: "", deletePassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EventCreateRequest, string>>>({});

  const mut = useMutation({
    mutationFn: createEvent,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["events"] }); onSuccess(); },
    onError: () => setErrors(prev => ({ ...prev, title: "Bir hata oluştu. Tekrar deneyin." })),
  });

  const handleTypeChange = (newType: ContactType) => {
    setErrors(prev => ({ ...prev, contactValue: undefined }));
    setForm(prev => ({ ...prev, contactType: newType, contactValue: "" }));
  };

  const handleContactValueChange = (val: string, type: ContactType) => {
    setErrors(prev => ({ ...prev, contactValue: undefined }));
    if (type === "telefon") {
      setForm(prev => ({ ...prev, contactValue: val.replace(/\D/g, "") }));
    } else {
      setForm(prev => ({ ...prev, contactValue: val }));
    }
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof EventCreateRequest, string>> = {};
    if (!form.title.trim())           errs.title = "Başlık boş olamaz.";
    if (!form.description.trim())     errs.description = "Açıklama boş olamaz.";
    if (!form.author.trim())          errs.author = "Adınızı girmeniz zorunludur.";
    if (!form.deletePassword.trim())  errs.deletePassword = "Silme şifresi boş olamaz.";
    if (form.deletePassword.trim().length < 4) errs.deletePassword = "Şifre en az 4 karakter olmalıdır.";

    let cv = form.contactValue.trim();
    const isSocial = form.contactType !== "email" && form.contactType !== "telefon";
    if (isSocial && cv && !cv.startsWith("@")) cv = "@" + cv;

    if (!cv || cv === "@") {
      errs.contactValue = "İletişim bilgisi boş olamaz.";
    } else if (form.contactType === "email") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cv))
        errs.contactValue = "Geçerli bir e-posta adresi girin. (örn: ad@ornek.com)";
    } else if (form.contactType === "telefon") {
      if (cv.length < 10 || cv.length > 11)
        errs.contactValue = "Geçerli bir telefon numarası girin. (örn: 5321234567)";
    } else if (cv.length < 3) {
      errs.contactValue = "Geçerli bir kullanıcı adı girin. (örn: @omerasaf)";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    let cv = form.contactValue.trim();
    const isSocial = form.contactType !== "email" && form.contactType !== "telefon";
    if (isSocial && !cv.startsWith("@")) cv = "@" + cv;
    mut.mutate({ ...form, contactValue: cv });
  };

  const isSocial = form.contactType !== "email" && form.contactType !== "telefon";
  const inputLabel = isSocial
    ? `${CONTACT_CONFIG[form.contactType]?.label} Kullanıcı Adınız *`
    : `${CONTACT_CONFIG[form.contactType]?.label} Bilgisi *`;
  const inputPlaceholder = form.contactType === "telefon" ? "5xxxxxxxxx"
    : form.contactType === "email" ? "adiniz@ornek.com"
    : "Kullanıcı adınızı girin (örn: omerasaf)";

  const Field = ({ id, error }: { id: keyof EventCreateRequest; error?: string }) =>
    error ? <div className="flex items-center gap-1.5 mt-1.5 text-xs text-red-600"><AlertCircle size={12} />{error}</div> : null;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 pt-2">
      {/* BAŞLIK */}
      <div>
        <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <Type size={13} className="text-slate-400" /> Başlık *
        </label>
        <input value={form.title}
          onChange={e => { setForm({ ...form, title: e.target.value }); setErrors(p => ({ ...p, title: undefined })); }}
          placeholder="İlanınızın başlığını yazın" maxLength={100}
          className={cn("w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all",
            errors.title ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50/50 focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-[#003087]/5")} />
        <Field id="title" error={errors.title} />
      </div>

      {/* AÇIKLAMA */}
      <div>
        <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
          <AlignLeft size={13} className="text-slate-400" /> Açıklama *
        </label>
        <textarea value={form.description}
          onChange={e => { setForm({ ...form, description: e.target.value }); setErrors(p => ({ ...p, description: undefined })); }}
          placeholder="İlan detaylarını, kampüs içi lokasyon veya şartları açıkça belirtin..."
          rows={4} maxLength={1000}
          className={cn("w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all resize-none",
            errors.description ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50/50 focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-[#003087]/5")} />
        <div className="flex items-center justify-between mt-1">
          <Field id="description" error={errors.description} />
          <span className="text-[11px] font-medium text-slate-400 ml-auto">{form.description.length}/1000 karakter</span>
        </div>
      </div>

      {/* KATEGORİ & İLETİŞİM TİPİ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 mb-1.5 block">Kategori *</label>
          <div className="relative">
            <select value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value as EventCategory })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm outline-none focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-[#003087]/5 transition-all appearance-none cursor-pointer font-medium text-slate-800">
              {Object.entries(KATEGORI_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 mb-1.5 block">İletişim Kanalı *</label>
          <div className="relative">
            <select value={form.contactType}
              onChange={e => handleTypeChange(e.target.value as ContactType)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-sm outline-none focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-[#003087]/5 transition-all appearance-none cursor-pointer font-medium text-slate-800">
              {Object.entries(CONTACT_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* İLETİŞİM BİLGİSİ */}
      <div>
        <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
          {form.contactType === "email" ? <Mail size={13} /> : form.contactType === "telefon" ? <Phone size={13} /> : "🌐"}
          {inputLabel}
        </label>
        <input
          type={form.contactType === "email" ? "email" : "text"}
          value={form.contactValue}
          onChange={e => handleContactValueChange(e.target.value, form.contactType)}
          placeholder={inputPlaceholder}
          className={cn("w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all font-medium",
            errors.contactValue ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50/50 focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-[#003087]/5")} />
        <Field id="contactValue" error={errors.contactValue} />
      </div>

      {/* AD & ŞİFRE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
        <div>
          <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <User size={13} className="text-slate-400" /> Adınız *
          </label>
          <input value={form.author}
            onChange={e => { setForm({ ...form, author: e.target.value }); setErrors(p => ({ ...p, author: undefined })); }}
            placeholder="Ad Soyad" maxLength={60}
            className={cn("w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all",
              errors.author ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50/50 focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-[#003087]/5")} />
          <Field id="author" error={errors.author} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <KeyRound size={13} className="text-slate-400" /> İlan Şifresi * <span className="text-slate-400 font-normal">(min. 4)</span>
          </label>
          <input type="password" value={form.deletePassword}
            onChange={e => { setForm({ ...form, deletePassword: e.target.value }); setErrors(p => ({ ...p, deletePassword: undefined })); }}
            placeholder="Kaldırmak için şifre" maxLength={20}
            className={cn("w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all",
              errors.deletePassword ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50/50 focus:border-[#003087] focus:bg-white focus:ring-4 focus:ring-[#003087]/5")} />
          <Field id="deletePassword" error={errors.deletePassword} />
        </div>
      </div>

      <p className="text-[11px] font-medium text-amber-600 bg-amber-50/50 px-3 py-2 rounded-xl flex items-center gap-1.5 border border-amber-100">
        <AlertCircle size={13} className="shrink-0" /> Bu şifreyi kaydetmeyi unutmayın! İlanı silerken zorunludur.
      </p>

      <div className="flex gap-3 pt-2 border-t border-slate-100">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl py-5 font-semibold text-slate-600 hover:bg-slate-50">
          Vazgeç
        </Button>
        <Button type="submit" disabled={mut.isPending}
          className="flex-1 bg-[#003087] hover:bg-[#0046c8] text-white font-semibold py-5 rounded-xl gap-2 shadow-md shadow-[#003087]/10">
          {mut.isPending ? <Loader2 size={16} className="animate-spin" /> : <Megaphone size={16} />}
          İlanı Gönder
        </Button>
      </div>
    </form>
  );
}

export default function EventPage() {
  const [aktifKategori, setAktifKategori] = useState<EventCategory | undefined>();
  const [arama, setArama]                 = useState("");
  const [formAcik, setFormAcik]           = useState(false);
  const [isSuccess, setIsSuccess]         = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);

  const { data, isLoading } = useQuery<EventResponse[]>({
    queryKey: ["events", aktifKategori],
    queryFn: () => fetchEvents(aktifKategori),
    refetchInterval: 60 * 1000,
  });

  const filtreliEvents = (data ?? []).filter(e =>
    arama === "" || e.title.toLowerCase().includes(arama.toLowerCase()) || e.description.toLowerCase().includes(arama.toLowerCase())
  );

  const handleDialogChange = (open: boolean) => {
    setFormAcik(open);
    if (!open) setTimeout(() => setIsSuccess(false), 300);
  };

  const katModal  = selectedEvent ? (KATEGORI_CONFIG[selectedEvent.category] || KATEGORI_CONFIG.OTHER) : null;
  const contModal = selectedEvent ? (CONTACT_CONFIG[selectedEvent.contactType] || { icon: ExternalLink, label: selectedEvent.contactType, prefix: "", suffixText: "ile İletişime Geç" }) : null;
  const KatModalIcon  = katModal?.icon;
  const ContModalIcon = contModal?.icon;
  const hrefModal = selectedEvent && contModal
    ? (selectedEvent.contactType === "telefon" || selectedEvent.contactType === "email"
        ? `${contModal.prefix}${selectedEvent.contactValue}`
        : `${contModal.prefix}${selectedEvent.contactValue.replace("@", "")}`)
    : "";

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <section className="pt-32 pb-16 px-4 text-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #001f5a 0%, #003087 60%, #0046c8 100%)" }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "50px 50px" }} />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white/90 text-sm mb-6 backdrop-blur-sm">
            <Megaphone size={14} /> Kampüs İlan Panosu
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Etkinlik & İlan</h1>
          <p className="text-white/75 text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Takım arkadaşı mı arıyorsun? Proje ortağı mı? Kampüs ilanlarını buradan paylaş veya keşfet.
          </p>
          <Button onClick={() => setFormAcik(true)} size="lg"
            className="bg-[#f4a522] hover:bg-[#f4a522]/90 text-[#001f5a] font-bold gap-2 rounded-xl shadow-lg px-8">
            <Plus size={18} /> İlan Ver
          </Button>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input value={arama} onChange={e => setArama(e.target.value)} placeholder="İlanlarda ara..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-[#003087] transition-colors" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setAktifKategori(undefined)}
              className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all",
                !aktifKategori ? "bg-[#003087] text-white border-[#003087]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300")}>
              <Filter size={12} /> Tümü
            </button>
            {Object.entries(KATEGORI_CONFIG).map(([k, v]) => {
              const Icon = v.icon;
              const isActive = aktifKategori === k;
              return (
                <button key={k} onClick={() => setAktifKategori(isActive ? undefined : k as EventCategory)}
                  className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all",
                    isActive ? "bg-[#003087] text-white border-[#003087]" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300")}>
                  <Icon size={12} /> {v.label}
                </button>
              );
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}
          </div>
        ) : filtreliEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-4">
              <Megaphone size={32} className="text-slate-400" />
            </div>
            <h3 className="font-bold text-slate-700 text-lg mb-2">{arama ? "Sonuç bulunamadı" : "Henüz ilan yok"}</h3>
            <p className="text-slate-400 text-sm mb-6">{arama ? "Farklı bir arama deneyin." : "İlk ilanı sen ver!"}</p>
            {!arama && (
              <Button onClick={() => setFormAcik(true)} className="bg-[#003087] hover:bg-[#0046c8] text-white gap-2">
                <Plus size={16} /> İlan Ver
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence>
              {filtreliEvents.map(event => <EventCard key={event.id} event={event} onOpenModal={ev => setSelectedEvent(ev)} />)}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* İlan Verme Modali */}
      <Dialog open={formAcik} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-100 p-6 md:p-8 overflow-hidden">
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                <DialogHeader className="pb-2 border-b border-slate-100 mb-4">
                  <DialogTitle className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
                    <Megaphone size={22} className="text-[#003087]" /> Yeni İlan Oluştur
                  </DialogTitle>
                  <DialogDescription className="text-xs font-medium text-slate-500 mt-1">
                    Kampüsteki diğer öğrencilere ulaşmak için bilgileri eksiksiz doldurun. İlanınız admin onayından sonra listelenecektir.
                  </DialogDescription>
                </DialogHeader>
                <EventForm onClose={() => handleDialogChange(false)} onSuccess={() => setIsSuccess(true)} />
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", duration: 0.4 }}
                className="flex flex-col items-center justify-center py-10 text-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle size={32} className="text-emerald-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-xl">İlanınız Sıraya Alındı!</h3>
                <p className="text-slate-500 text-sm max-w-xs leading-relaxed">Admin onayından sonra panoda listelenecektir.</p>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 max-w-xs flex gap-2 items-start text-left">
                  <KeyRound size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div><span className="font-bold">Silme şifrenizi unutmayın!</span> İlanı kaldırmak için gerekecektir.</div>
                </div>
                <Button onClick={() => handleDialogChange(false)} className="mt-2 bg-[#003087] hover:bg-[#0046c8] text-white px-8 rounded-xl font-semibold">
                  Tamam
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Detay Modali */}
      <AnimatePresence>
        {selectedEvent && katModal && contModal && KatModalIcon && ContModalIcon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }} transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 max-h-[90vh] flex flex-col">
              <div className="p-6 md:p-8 overflow-y-auto flex-1 flex flex-col gap-5">
                <div className="flex items-center gap-3 flex-wrap border-b border-slate-50 pb-3">
                  <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold shrink-0", katModal.bg, katModal.color)}>
                    <KatModalIcon size={13} /> {katModal.label}
                  </div>
                  <div className="flex items-center gap-4 ml-auto shrink-0">
                    <span className="text-xs text-slate-400 font-medium">{new Date(selectedEvent.createdAt).toLocaleDateString("tr-TR")}</span>
                    <button onClick={() => setSelectedEvent(null)} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                </div>
                <div>
                  <h2 className="font-extrabold text-slate-900 text-xl md:text-2xl leading-snug mb-4 break-all md:break-words">{selectedEvent.title}</h2>
                  <div className="bg-slate-50/60 border border-slate-100 p-4 md:p-5 rounded-2xl">
                    <p className="text-sm md:text-base text-slate-700 leading-relaxed break-words whitespace-pre-wrap">{selectedEvent.description}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-auto">
                  <span className="text-sm text-slate-600 font-semibold flex items-center gap-1.5 min-w-0">
                    👤 <span className="shrink-0">İlan Sahibi:</span>
                    <span className="text-slate-900 font-bold truncate" title={selectedEvent.author}>{selectedEvent.author}</span>
                  </span>
                  <a href={hrefModal} target="_blank" rel="noopener noreferrer"
                    className={cn("flex items-center justify-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl border hover:opacity-90 transition-all shadow-sm shrink-0 whitespace-nowrap", katModal.bg, katModal.color)}>
                    <ContModalIcon size={14} /> {contModal.label} {contModal.suffixText} <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
