"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowRight, ChevronDown,
  Wind, Droplets, MapPin, Utensils, Flame, Bell, ExternalLink, Calendar,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";

// ─── Tipler ──────────────────────────────────────────────────
interface WeatherData {
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  iconCode: string;
  comment: string;
}

interface MenuItem {
  type: string;
  name: string;
  calories: number;
}

interface MenuData {
  date: string;
  menuType: string;
  totalCalories: number;
  items: MenuItem[];
}

interface AnnouncementData {
  title: string;
  date: string;
  excerpt: string;
  url: string;
}

// ─── Gece yarısına kaç ms kaldığını hesapla ──────────────────
function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

// ─── API Çağrıları ────────────────────────────────────────────
async function fetchWeather(): Promise<WeatherData> {
  const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/weather`);
  return data;
}

async function fetchMenu(): Promise<MenuData> {
  const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/cafeteria/today`);
  return data;
}

async function fetchAnnouncement(): Promise<AnnouncementData> {
  const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/announcements/latest`);
  return data;
}

// ─── Widget Skeleton ─────────────────────────────────────────
function WidgetSkeleton() {
  return (
    <Card className="h-[340px] p-6 rounded-3xl border border-slate-100 bg-white shadow-lg flex flex-col gap-4">
      <Skeleton className="h-8 w-1/2 bg-slate-100 rounded-lg" />
      <Skeleton className="h-24 w-full bg-slate-50 rounded-xl mt-4" />
      <Skeleton className="h-4 w-3/4 bg-slate-100 rounded-md" />
      <Skeleton className="h-4 w-1/2 bg-slate-100 rounded-md" />
      <Skeleton className="h-10 w-full bg-slate-100 rounded-xl mt-auto" />
    </Card>
  );
}

// ─── Hava Durumu Widget ───────────────────────────────────────
function WeatherWidget() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["weather"],
    queryFn: fetchWeather,
    refetchInterval: 15 * 60 * 1000,      
    staleTime:       14 * 60 * 1000,      
    refetchOnWindowFocus: true,
  });

  if (isLoading) return <WidgetSkeleton />;
  if (isError || !data) return null;

  return (
    <Card className="flex flex-col h-[340px] overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg shadow-slate-200/40 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)] hover:border-slate-200 cursor-default">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">
            <MapPin size={14} />
            <span>Esentepe Kampüsü</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>CANLI</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto mb-auto">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100/50">
              <img
                src={`https://openweathermap.org/img/wn/${data.iconCode}@2x.png`}
                alt={data.description}
                className="w-16 h-16 object-contain drop-shadow-md"
              />
            </div>
            <div>
              <div className="text-4xl font-extrabold tracking-tight text-slate-900">
                {Math.round(data.temperature)}°C
              </div>
              <div className="text-sm font-medium text-slate-500 capitalize mt-1">
                {data.description}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3 text-sm font-medium bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-slate-600">
              <Droplets size={16} className="text-blue-500" />
              <span>%{data.humidity}</span>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm font-medium bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-slate-600">
              <Wind size={16} className="text-sky-500" />
              <span>{data.windSpeed} m/s</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50/50 border-t border-blue-100 p-4">
        <p className="text-sm leading-relaxed font-medium text-blue-800">
          {data.comment}
        </p>
      </div>
    </Card>
  );
}

// ─── Menü Widget ─────────────────────────────────────────────
function MenuWidget() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["menu", new Date().toDateString()], 
    queryFn: fetchMenu,
    refetchInterval: msUntilMidnight(),   
    staleTime: msUntilMidnight(),         
    refetchOnWindowFocus: false,          
    refetchOnReconnect: false,
  });

  if (isLoading) return <WidgetSkeleton />;
  if (isError || !data) return null;

  return (
    <Card className="flex flex-col h-[340px] overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg shadow-slate-200/40 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)] hover:border-slate-200 cursor-default">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="font-bold flex items-center gap-2 text-lg text-slate-900">
            <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
              <Utensils size={16} />
            </div>
            Günün Menüsü
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">{data.date}</p>
        </div>
        <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700 flex items-center gap-1 py-1">
          <Flame size={12} className="text-orange-500" /> {data.totalCalories} kcal
        </Badge>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        {data.items.length === 1 && data.items[0].type === "Bilgi" ? (
          <div className="h-full flex items-center justify-center text-center italic text-sm text-slate-500">
            {data.items[0].name}
          </div>
        ) : (
          <ul className="space-y-2.5">
            {data.items.map((item, index) => (
              <li key={index} className="flex justify-between items-center text-sm bg-white p-3 rounded-xl border border-slate-100 hover:border-orange-200 hover:shadow-sm transition-all group">
                <div className="flex-1 pr-2">
                  <span className="block text-[10px] uppercase tracking-wider text-slate-400 mb-0.5 font-semibold">{item.type}</span>
                  <span className="font-semibold text-slate-700 leading-tight group-hover:text-slate-900 transition-colors">{item.name}</span>
                </div>
                {item.calories > 0 && (
                  <span className="text-xs font-semibold text-slate-500 whitespace-nowrap bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                    {item.calories} kcal
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

// ─── Duyuru Widget ────────────────────────────────────────────
function AnnouncementWidget() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["announcement"],
    queryFn: fetchAnnouncement,
    refetchInterval: 30 * 60 * 1000,     
    staleTime:       29 * 60 * 1000,     
    refetchOnWindowFocus: true,
  });

  if (isLoading) return <WidgetSkeleton />;
  if (isError || !data) return null;

  return (
    <Card className="flex flex-col h-[340px] overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg shadow-slate-200/40 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.12)] hover:border-slate-200 relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform duration-700 group-hover:scale-125 group-hover:bg-indigo-100/60" />
      <div className="p-6 flex-1 flex flex-col z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
            <Bell size={18} />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Önemli Duyuru</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3 font-medium">
          <Calendar size={13} />
          <span>{data.date}</span>
        </div>
        <h4 className="font-bold text-slate-800 text-base mb-2 leading-snug line-clamp-2">{data.title}</h4>
        <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-6 flex-1">{data.excerpt}</p>
        <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-auto shadow-md shadow-indigo-200 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-indigo-300">
          <a href={data.url} target="_blank" rel="noopener noreferrer">
            Devamını Oku <ExternalLink size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </a>
        </Button>
      </div>
    </Card>
  );
}

// ─── Ana Hero + Dashboard ─────────────────────────────────────
export function Hero() {
  return (
    <>
      <section
        className="relative flex flex-col items-center justify-center overflow-hidden min-h-[100svh] w-full pt-20 pb-12"
        style={{ background: "linear-gradient(135deg, #001f5a 0%, #003087 50%, #0046c8 100%)" }}
      >
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(244,165,34,0.1)" }} />

        <div className="relative container mx-auto px-4 text-center text-white z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="mb-6 text-sm px-4 py-1.5 font-medium tracking-wide"
              style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}>
              🎓 Kampüsün Dijital Asistanı ve Nabzı
            </Badge>
          </motion.div>

          <motion.h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
            Kampüsün
            <span className="block mt-2" style={{ color: "#f4a522" }}>Vibe&apos;ını Yakala!</span>
          </motion.h1>

          <motion.p className="text-base md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-light"
            style={{ color: "rgba(255,255,255,0.85)" }}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            Sakarya Üniversitesi&apos;ne dair her şey burada. En güncel bilgiler,
            akademik kılavuzlar ve aklındaki tüm soruları kelime kelime yanıtlamaya
            hazır yapay zeka asistanınla kampüs hayatı artık çok daha akıcı.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            <Button asChild size="lg" className="font-semibold px-8 gap-2 shadow-lg rounded-xl"
              style={{ background: "#f4a522", color: "#001f5a" }}>
              <Link href="/discover">Keşfetmeye Başla <ArrowRight size={18} /></Link>
            </Button>
            
            {/* 3D Kampüs Turu Yerine Eklenen Etkinlik Butonu */}
            <Button asChild size="lg" variant="outline" className="px-8 gap-2 hover:bg-white/10 rounded-xl"
              style={{ borderColor: "rgba(255,255,255,0.4)", color: "white", background: "transparent" }}>
              <Link href="/event"><Calendar size={18} /> Etkinlikler</Link>
            </Button>
            
            <Button asChild size="lg"
              className="relative overflow-hidden group px-8 gap-2 transition-all duration-500 rounded-xl border-0 shadow-md bg-gradient-to-r from-[#f4a522] via-[#ffc766] to-[#f4a522] bg-[length:200%_auto] text-[#001f5a] hover:bg-right hover:shadow-[0_0_20px_rgba(244,165,34,0.5)] hover:-translate-y-0.5">
              <Link href="/volt">
                <Sparkles size={18} className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                <span className="font-semibold tracking-wide">VOLT</span>
              </Link>
            </Button>
          </motion.div>

          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            {[
              { value: "40.000+", label: "Öğrenci" },
              { value: "100+",    label: "Lisans Programı" },
              { value: "1.600+",  label: "Akademisyen" },
              { value: "150+",    label: "Uluslararası Ortak" },
            ].map(({ value, label }) => (
              <div key={label} className="rounded-2xl p-5 transition-transform hover:-translate-y-1"
                style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="text-2xl md:text-3xl font-bold" style={{ color: "#f4a522" }}>{value}</div>
                <div className="text-xs md:text-sm mt-1.5 font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>{label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50"
          animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <ChevronDown size={28} />
        </motion.div>
      </section>

      <section className="bg-[#f8fafc] py-24 border-t border-slate-200/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Kampüs Nabzı</h2>
          </motion.div>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, delay: 0.1 }}>
            <WeatherWidget />
            <MenuWidget />
            <AnnouncementWidget />
          </motion.div>
        </div>
      </section>
    </>
  );
}