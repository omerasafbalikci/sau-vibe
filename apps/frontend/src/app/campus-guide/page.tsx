"use client";

import React, { useState, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone, Mail, X, Building2, GraduationCap,
  ShieldAlert, Dumbbell, Coffee, Info, MapPin,
  Compass, Globe, ExternalLink, Leaf, FlaskConical, Users
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// TİPLER & API YAPILANDIRMASI
// ─────────────────────────────────────────────────────────────
export type BuildingCategory =
  | "IDARI" | "FAKULTE" | "ENSTITU"
  | "SPOR"  | "SOSYAL"  | "YURT" | "ARASTIRMA";

interface BuildingData {
  number:      number;
  name:        string;
  nameEn:      string;
  category:    BuildingCategory;
  description: string;
  phone:       string | null;
  email:       string | null;
  photoUrl:    string | null;
}

interface PinData {
  id:         string;
  buildingNo: number;
  x:          number;
  y:          number;
  category:   BuildingCategory;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ─────────────────────────────────────────────────────────────
// KATEGORİ KONFİGÜRASYONU
// ─────────────────────────────────────────────────────────────
const CAT_CONFIG: Record<BuildingCategory, {
  label: string;
  color: string;
  bg:    string;
  pin:   string;
  icon:  React.ElementType;
}> = {
  IDARI:     { label: "İdari Birim",      color: "text-blue-600",     bg: "bg-blue-50 border-blue-100",      pin: "#2563eb", icon: Info          },
  FAKULTE:   { label: "Fakülte / Blok",   color: "text-indigo-600",   bg: "bg-indigo-50 border-indigo-100",  pin: "#4f46e5", icon: GraduationCap },
  ENSTITU:   { label: "Enstitü",          color: "text-purple-600",   bg: "bg-purple-50 border-purple-100",  pin: "#7c3aed", icon: Building2     },
  SPOR:      { label: "Spor Tesisi",      color: "text-emerald-600",  bg: "bg-emerald-50 border-emerald-100",pin: "#059669", icon: Dumbbell      },
  SOSYAL:    { label: "Sosyal Alan",      color: "text-amber-600",   bg: "bg-amber-50 border-amber-100",    pin: "#d97706", icon: Coffee        },
  YURT:      { label: "Öğrenci Yurdu",    color: "text-rose-600",     bg: "bg-rose-50 border-rose-100",      pin: "#e11d48", icon: MapPin        },
  ARASTIRMA: { label: "Araştırma & Ar-Ge",color: "text-cyan-600",     bg: "bg-cyan-50 border-cyan-100",      pin: "#0891b2", icon: Compass       },
};

const PINS: PinData[] = [
  { id: "p1",  buildingNo: 1,  x: 40.81, y: 26.79, category: "IDARI" },
  { id: "p2",  buildingNo: 2,  x: 38.24, y: 28.2,  category: "IDARI" },
  { id: "p3",  buildingNo: 3,  x: 43.43, y: 35.57, category: "IDARI" },
  { id: "p4",  buildingNo: 4,  x: 41.93, y: 39.37, category: "IDARI" },
  { id: "p5",  buildingNo: 5,  x: 38.4,  y: 48.37, category: "IDARI" },
  { id: "p6",  buildingNo: 6,  x: 26.75, y: 51.74, category: "IDARI" },
  { id: "p7",  buildingNo: 7,  x: 25.09, y: 59.33, category: "IDARI" },
  { id: "p8",  buildingNo: 8,  x: 5.91,  y: 64.75, category: "IDARI" },
  { id: "p9",  buildingNo: 9,  x: 11.47, y: 28.42, category: "IDARI" },
  { id: "p10", buildingNo: 10, x: 22.69, y: 24.3,  category: "IDARI" },
  { id: "p11", buildingNo: 11, x: 22.37, y: 13.34, category: "IDARI" },
  { id: "p12", buildingNo: 12, x: 49.31, y: 29.07, category: "IDARI" },
  { id: "p13", buildingNo: 13, x: 56.63, y: 34.16, category: "IDARI" },
  { id: "p14", buildingNo: 14, x: 83.08, y: 52.17, category: "FAKULTE" },
  { id: "p15", buildingNo: 15, x: 75.65, y: 41.54, category: "FAKULTE" },
  { id: "p16", buildingNo: 16, x: 47.27, y: 39.05, category: "FAKULTE" },
  { id: "p17", buildingNo: 17, x: 27.39, y: 30.04, category: "FAKULTE" },
  { id: "p18", buildingNo: 18, x: 24.19, y: 31.34, category: "FAKULTE" },
  { id: "p19", buildingNo: 19, x: 20.61, y: 29.93, category: "FAKULTE" },
  { id: "p20", buildingNo: 20, x: 25.79, y: 16.81, category: "FAKULTE" },
  { id: "p21", buildingNo: 21, x: 29,    y: 18.87, category: "FAKULTE" },
  { id: "p22", buildingNo: 22, x: 42.41, y: 6.72,  category: "FAKULTE" },
  { id: "p23", buildingNo: 23, x: 62.61, y: 73.64, category: "FAKULTE" },
  { id: "p24", buildingNo: 24, x: 66.3,  y: 73.32, category: "FAKULTE" },
  { id: "p25", buildingNo: 25, x: 59.19, y: 73.64, category: "FAKULTE" },
  { id: "p26", buildingNo: 26, x: 29.74, y: 66.16, category: "FAKULTE" },
  { id: "p27", buildingNo: 27, x: 21.62, y: 60.2,  category: "FAKULTE" },
  { id: "p28", buildingNo: 28, x: 52.19, y: 47.4,  category: "FAKULTE" },
  { id: "p29", buildingNo: 29, x: 48.5,  y: 44.47, category: "FAKULTE" },
  { id: "p30", buildingNo: 30, x: 49.84, y: 40.35, category: "FAKULTE" },
  { id: "p31", buildingNo: 31, x: 51.6,  y: 37.85, category: "FAKULTE" },
  { id: "p32", buildingNo: 32, x: 54.81, y: 30.37, category: "FAKULTE" },
  { id: "p33", buildingNo: 33, x: 58.93, y: 33.3,  category: "FAKULTE" },
  { id: "p34", buildingNo: 34, x: 69.56, y: 35.68, category: "FAKULTE" },
  { id: "p35", buildingNo: 35, x: 65.77, y: 45.88, category: "FAKULTE" },
  { id: "p36", buildingNo: 36, x: 43.05, y: 20.39, category: "FAKULTE" },
  { id: "p37", buildingNo: 37, x: 39.85, y: 13.88, category: "FAKULTE" },
  { id: "p38", buildingNo: 38, x: 44.87, y: 17.25, category: "FAKULTE" },
  { id: "p39", buildingNo: 39, x: 34.45, y: 14.32, category: "FAKULTE" },
  { id: "p40", buildingNo: 40, x: 13.87, y: 63.12, category: "FAKULTE" },
  { id: "p41", buildingNo: 41, x: 32.68, y: 54.56, category: "ENSTITU" },
  { id: "p42", buildingNo: 42, x: 30.6,  y: 34.16, category: "ENSTITU" },
  { id: "p43", buildingNo: 43, x: 27.93, y: 2.06,  category: "ENSTITU" },
  { id: "p44", buildingNo: 44, x: 6.18,  y: 59.22, category: "SOSYAL" },
  { id: "p45", buildingNo: 45, x: 4.52,  y: 89.59, category: "SOSYAL" }, 
  { id: "p46", buildingNo: 46, x: 17.51, y: 70.82, category: "SPOR" },
  { id: "p47", buildingNo: 47, x: 34.29, y: 70.82, category: "SOSYAL" },
  { id: "p48", buildingNo: 48, x: 44.01, y: 68,    category: "SOSYAL" },
  { id: "p49", buildingNo: 49, x: 52.73, y: 64.21, category: "SOSYAL" },
  { id: "p50", buildingNo: 50, x: 66.57, y: 61.28, category: "SOSYAL" },
  { id: "p51", buildingNo: 51, x: 63.25, y: 50.22, category: "SPOR" },
  { id: "p52", buildingNo: 52, x: 57.7,  y: 20.93, category: "SOSYAL" },
  { id: "p53", buildingNo: 53, x: 31.13, y: 12.47, category: "SOSYAL" },
  { id: "p54", buildingNo: 54, x: 31.62, y: 63.56, category: "IDARI" },
  { id: "p55", buildingNo: 55, x: 31.13, y: 57.38, category: "IDARI" },
  { id: "p56", buildingNo: 56, x: 35.57, y: 59,    category: "ARASTIRMA" },
  { id: "p57", buildingNo: 57, x: 43.64, y: 52.49, category: "ARASTIRMA" },
  { id: "p58", buildingNo: 58, x: 56.95, y: 61.06, category: "ARASTIRMA" },
  { id: "p59", buildingNo: 59, x: 79.34, y: 66.59, category: "ARASTIRMA" },
  { id: "p60", buildingNo: 60, x: 47.81, y: 24.3,  category: "ARASTIRMA" },
  { id: "p61", buildingNo: 61, x: 30.01, y: 3.36,  category: "ARASTIRMA" },
  { id: "p62", buildingNo: 62, x: 45.03, y: 38.83, category: "FAKULTE" },
  { id: "p63", buildingNo: 45, x: 88.72, y: 88.29, category: "SOSYAL" },
];

// ─────────────────────────────────────────────────────────────
// PREMIUM DİZAYN BİNA DETAY PANELİ
// ─────────────────────────────────────────────────────────────
function BuildingPanel({
  buildingNo,
  onClose,
}: {
  buildingNo: number;
  onClose: () => void;
}) {
  const { data, isLoading, error } = useQuery<BuildingData>({
    queryKey: ["building", buildingNo],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/campus/buildings/${buildingNo}`);
      if (!response.ok) {
        throw new Error("Bina verileri sunucudan yüklenemedi.");
      }
      return response.json();
    },
    enabled: !!buildingNo,
    staleTime: 15 * 60 * 1000,
  });

  const cat = data ? CAT_CONFIG[data.category] : null;

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0, scale: 0.95 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: "100%", opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute top-4 right-4 bottom-4 w-[380px] z-40 rounded-[32px] shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col bg-white border border-slate-100 backdrop-blur-sm"
    >
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-slate-400 bg-slate-50/50">
          <span className="h-10 w-10 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">Yükleniyor...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-center bg-slate-50/50">
          <div className="h-14 w-14 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 shadow-inner">
            <ShieldAlert size={26} />
          </div>
          <p className="font-extrabold text-slate-800 text-base mt-2">Bağlantı Hatası</p>
          <p className="text-sm text-slate-500 leading-relaxed">
            Bina bilgileri şu anda backend servisinden alınamıyor.
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2.5 bg-slate-800 text-white font-semibold text-xs rounded-xl hover:bg-slate-700 transition-all shadow-md"
          >
            Kapat
          </button>
        </div>
      ) : data && cat ? (
        <>
          <div className="relative h-60 w-full bg-slate-900 shrink-0">
            {data.photoUrl && (
              <img
                key={`img-${data.photoUrl}`}
                src={data.photoUrl}
                alt={data.name}
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            )}

            <div className="absolute inset-0 mix-blend-multiply opacity-50 bg-slate-950/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />

            <button
              onClick={onClose}
              className="absolute top-5 right-5 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-all shadow-sm group z-10"
            >
              <X size={16} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <div className="absolute bottom-5 left-6 right-6 z-10 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-white text-slate-950 text-[11px] font-black px-3 py-1 rounded-md shadow-sm tracking-wide">
                  NO: {data.number}
                </span>
                <span className="text-[11px] font-semibold px-3 py-1 rounded-md backdrop-blur-md bg-transparent border border-white/40 text-white tracking-wide">
                  {cat.label}
                </span>
              </div>
              
              <h2 className={`font-black text-white tracking-tight drop-shadow-md line-clamp-3 ${
                data.name.length > 40 ? "text-lg leading-snug" : 
                data.name.length > 25 ? "text-xl leading-tight" : 
                "text-2xl leading-snug"
              }`}>
                {data.name}
              </h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white p-6 custom-scrollbar flex flex-col gap-7">
            
            {data.nameEn && (
              <div className="flex items-center gap-2 text-slate-400 -mt-2">
                <Globe size={14} className="shrink-0" />
                <p className="text-sm font-medium italic leading-none">{data.nameEn}</p>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 flex items-center gap-1.5">
                <Info size={14} /> BİNA HAKKINDA
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed font-normal bg-white p-4 rounded-[18px] border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]">
                {data.description || "Bu bina için henüz bir açıklama girilmemiş."}
              </p>
            </div>

            {(data.phone || data.email) && (
              <div className="space-y-3 pb-4">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  İLETİŞİM & ERİŞİM
                </h4>
                
                <div className="flex flex-col gap-2.5">
                  {data.phone && (
                    <a
                      href={`tel:${data.phone}`}
                      className="flex items-center justify-between p-3.5 rounded-[16px] bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-indigo-200 transition-all shadow-sm hover:shadow-md group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="text-indigo-500 bg-indigo-50 p-2 rounded-lg group-hover:scale-110 transition-transform">
                          <Phone size={16} strokeWidth={2.5} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 tracking-wide">{data.phone}</span>
                      </div>
                      <ExternalLink size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                    </a>
                  )}

                  {data.email && (
                    <a
                      href={`mailto:${data.email}`}
                      className="flex items-center justify-between p-3.5 rounded-[16px] bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-emerald-200 transition-all shadow-sm hover:shadow-md group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="text-emerald-500 bg-emerald-50 p-2 rounded-lg group-hover:scale-110 transition-transform">
                          <Mail size={16} strokeWidth={2.5} />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 truncate max-w-[190px]">
                          {data.email}
                        </span>
                      </div>
                      <ExternalLink size={14} className="text-slate-300 group-hover:text-emerald-400 transition-colors" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// ANA COMPONENT
// ─────────────────────────────────────────────────────────────
export default function KesfetPage() {
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  const handleMapClick = useCallback(() => {
    setSelectedPinId(null);
  }, []);

  const selectedPin = PINS.find(p => p.id === selectedPinId);

  return (
    <div className="w-full bg-white mt-16 select-none">
      
      {/* HARİTA ALANI */}
      <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-slate-950">
        <div
          ref={imgRef}
          onClick={handleMapClick}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-inner"
          style={{
            width: "100vw",
            height: "calc(100vw * (1497 / 3038))",
            minHeight: "100%",
            minWidth: "calc((100vh - 64px) * (3038 / 1497))",
          }}
        >
          <img
            src="/images/kampusharitasi.png"
            alt="SAÜ Kampüs Haritası"
            className="absolute inset-0 w-full h-full select-none cursor-default"
            draggable={false}
          />

          {PINS.map((pin) => {
            const isSelected = selectedPinId === pin.id;
            const config = CAT_CONFIG[pin.category];
            
            return (
              <button
                key={pin.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPinId(isSelected ? null : pin.id);
                }}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full cursor-pointer flex items-center justify-center border-none outline-none focus:outline-none focus:ring-0 transition-all duration-300 ${
                  isSelected 
                    ? "bg-white/95 scale-125 shadow-lg shadow-black/25" 
                    : "bg-transparent hover:bg-white/10"
                }`}
                title={`Bina No: ${pin.buildingNo}`}
              >
                {isSelected && config && (
                  <config.icon size={18} style={{ color: config.pin }} className="animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        <div className="absolute top-4 left-4 z-30 pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl shadow-xl border border-slate-200/40 flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-[#003087] flex items-center justify-center text-white shadow-sm">
              <Compass size={13} />
            </div>
            <div>
              <h1 className="text-xs font-black text-slate-800 tracking-tight">Kampüs Haritası</h1>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selectedPin && (
            <BuildingPanel 
              key={selectedPin.id}
              buildingNo={selectedPin.buildingNo} 
              onClose={() => setSelectedPinId(null)} 
            />
          )}
        </AnimatePresence>
      </div>

      {/* YENİLENEN ALT BİLGİ ALANI */}
      <div className="w-full bg-slate-50 flex flex-col items-center justify-center py-24 px-6 border-t border-slate-200/60 relative overflow-hidden">
        
        {/* Dekoratif Arkaplan Şekli */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#003087]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl w-full flex flex-col items-center space-y-10 z-10">
          
          <div className="text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-[#003087] rounded-full text-xs font-bold border border-slate-200 shadow-sm tracking-wide uppercase">
              <MapPin size={14} className="text-[#003087]" /> Esentepe Kampüsü
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 drop-shadow-sm">
              Sakarya Üniversitesi
            </h2>
            
            {/* DÜZ, TEK PARÇA KIRMIZI ÇİZGİ BURADA */}
            <div className="w-16 h-1.5 bg-rose-500 rounded-full mx-auto shadow-sm" />
          </div>

          <div className="bg-white p-8 md:p-10 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 text-center">
            <p className="text-base md:text-lg text-slate-600 leading-relaxed font-normal">
              1970 yılında bir mühendislik ve mimarlık yüksekokulu olarak temelleri atılan Sakarya Üniversitesi (SAÜ), bugün Türkiye'nin en köklü ve yenilikçi yükseköğretim kurumlarından biridir. Sapanca Gölü manzaralı eşsiz doğasıyla bütünleşen Esentepe Kampüsü, modern altyapısı ve öğrenci odaklı yaklaşımıyla hem ulusal hem de uluslararası alanda öne çıkmaktadır.
            </p>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed font-normal mt-4">
              Türkiye'de ISO-2002 Kalite Belgesi'ni alan ilk devlet üniversitesi olma unvanını taşıyan SAÜ; ileri teknoloji araştırma laboratuvarları, 7/24 hizmet veren zengin kütüphanesi, geniş spor kompleksleri ve canlı sosyal alanlarıyla öğrencilerine sadece bir eğitim değil, tam donanımlı bir yaşam ve gelişim merkezi sunar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3 hover:-translate-y-1 transition-transform duration-300">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <Leaf size={24} />
              </div>
              <h3 className="font-bold text-slate-900">Yeşil Kampüs</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Doğayla iç içe, Sapanca gölü manzaralı temiz ve sürdürülebilir bir yaşam alanı.
              </p>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3 hover:-translate-y-1 transition-transform duration-300">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <FlaskConical size={24} />
              </div>
              <h3 className="font-bold text-slate-900">Yenilikçi Altyapı</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Modern laboratuvarlar, teknokent ve gelişmiş Ar-Ge merkezleriyle güçlü pratik eğitim.
              </p>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center text-center gap-3 hover:-translate-y-1 transition-transform duration-300">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                <Users size={24} />
              </div>
              <h3 className="font-bold text-slate-900">Öğrenci Odaklı</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Zengin sosyal tesisler, öğrenci kulüpleri, kafeler ve geniş yurt imkanları.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}