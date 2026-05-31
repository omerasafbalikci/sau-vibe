"use client";

import {
  Phone, Mail, ExternalLink, MapPin, Heart,
  GraduationCap, BookOpen, Users, Shield,
  Accessibility, ChevronRight, Globe,
  FileText, HelpCircle, Award
} from "lucide-react";

const HIZMETLER = [
  { icon: GraduationCap, baslik: "Akademik Destek", aciklama: "Sınav süreleri uzatma, büyük puntolu sınav kağıdı, alternatif sınav formatları ve ders materyallerinin erişilebilir formata dönüştürülmesi.", renk: "bg-blue-50 text-blue-600 border-blue-100" },
  { icon: Users, baslik: "Psikolojik Danışmanlık", aciklama: "Üniversiteye uyum, stres yönetimi, kariyer danışmanlığı ve kişisel gelişim konularında uzman psikolog desteği.", renk: "bg-violet-50 text-violet-600 border-violet-100" },
  { icon: MapPin, baslik: "Fiziksel Erişilebilirlik", aciklama: "Rampa, asansör, engelli tuvaleti ve özel park yerleri dahil kampüs genelinde erişilebilir altyapı hizmetleri.", renk: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { icon: BookOpen, baslik: "Materyal Uyarlama", aciklama: "Ders notları, sunumlar ve sınav materyallerinin Braille, sesli kayıt veya dijital erişilebilir formata dönüştürülmesi.", renk: "bg-amber-50 text-amber-600 border-amber-100" },
  { icon: Shield, baslik: "Barınma Desteği", aciklama: "Engel durumuna uygun yurt odası tahsisi ve yurt içi erişilebilirlik düzenlemeleri konusunda destek.", renk: "bg-rose-50 text-rose-600 border-rose-100" },
  { icon: Heart, baslik: "Sosyal Uyum", aciklama: "Sosyal etkinliklere katılım, kulüp desteği ve kampüs yaşamına tam entegrasyon için rehberlik hizmetleri.", renk: "bg-sky-50 text-sky-600 border-sky-100" },
];

const BASVURU_ADIMLARI = [
  { no: "01", baslik: "İletişime Geç", aciklama: "engelsiz@sakarya.edu.tr adresine e-posta gönderin veya 0264 295 52 53'i arayın." },
  { no: "02", baslik: "Belge Teslimi", aciklama: "Sağlık kurulu raporu ve öğrenci belgesi ile birlikte birimi ziyaret edin." },
  { no: "03", baslik: "Değerlendirme", aciklama: "Uzman ekip ihtiyaç analizi yaparak size uygun desteği belirler." },
  { no: "04", baslik: "Destek Başlangıcı", aciklama: "Onaylanan destek planı hayata geçirilir ve düzenli takip yapılır." },
];



const LINKLER = [
  { label: "Engelsiz SAÜ Resmi Sitesi", href: "https://engelsiz.sakarya.edu.tr", icon: Globe },
  { label: "@engelsizsau Instagram", href: "https://instagram.com/engelsizsau", icon: ExternalLink },
  { label: "Sıkça Sorulan Sorular", href: "https://engelsiz.sakarya.edu.tr/tr/icerik/23685/127531/sikca-sorulan-sorular", icon: HelpCircle },
  { label: "Yönerge ve Mevzuat", href: "https://engelsiz.sakarya.edu.tr/tr/icerik/23678/124752/mevzuat", icon: FileText },
];

export default function ErisilebilirlikPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">

      {/* HERO */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4"
        style={{ background: "linear-gradient(135deg, #001f5a 0%, #003087 55%, #0046c8 100%)" }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 30% 40%, white 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-white/90 text-sm mb-6 backdrop-blur-sm">
            <Accessibility size={14} />
            Engelsiz Yaşam ve Destek Koordinatörlüğü
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-5 leading-tight">
            Kampüste<br />
            <span className="text-[#f4a522]">Herkes İçin Alan Var</span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Sakarya Üniversitesi, her öğrencinin eşit fırsatlarla öğrenip gelişebileceği engelsiz bir kampüs ortamı oluşturmayı misyon edinmiştir.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="https://engelsiz.sakarya.edu.tr" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-[#f4a522] hover:bg-[#f4a522]/90 text-[#001f5a] font-bold rounded-xl transition-all shadow-lg text-sm">
              Resmi Birim Sitesi <ExternalLink size={14} />
            </a>
            <a href="tel:02642955253"
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-all text-sm">
              <Phone size={14} /> 0264 295 52 53
            </a>
          </div>
        </div>
      </section>

      {/* İLETİŞİM KARTI */}
      <section className="max-w-5xl mx-auto px-4 mt-8 mb-16">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Phone size={18} className="text-[#003087]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Telefon</p>
              <a href="tel:02642955253" className="text-sm font-bold text-slate-800 hover:text-[#003087] transition-colors">0264 295 52 53</a>
              <p className="text-xs text-slate-400 mt-0.5">Faks: 0264 295 52 46</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Mail size={18} className="text-[#003087]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">E-posta</p>
              <a href="mailto:engelsiz@sakarya.edu.tr" className="text-sm font-bold text-slate-800 hover:text-[#003087] transition-colors break-all">
                engelsiz@sakarya.edu.tr
              </a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <MapPin size={18} className="text-[#003087]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Adres</p>
              <p className="text-sm font-bold text-slate-800 leading-snug">
                Esentepe Kampüsü<br />
                <span className="font-normal text-slate-500">Rektörlük İdari Bina Kot-1</span><br />
                54187 Serdivan / SAKARYA
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HİZMETLER */}
      <section className="max-w-5xl mx-auto px-4 mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Sunulan Hizmetler</h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">
            Engelsiz Yaşam ve Destek Koordinatörlüğü, öğrencilerin ihtiyaçlarına göre kapsamlı destek hizmetleri sunmaktadır.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HIZMETLER.map((h) => {
            const Icon = h.icon;
            return (
              <div key={h.baslik} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all duration-300">
                <div className={`h-11 w-11 rounded-xl border flex items-center justify-center mb-4 ${h.renk}`}>
                  <Icon size={18} />
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-sm">{h.baslik}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{h.aciklama}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* BAŞVURU SÜRECİ */}
      <section className="max-w-5xl mx-auto px-4 mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Başvuru Süreci</h2>
          <p className="text-slate-500 max-w-xl mx-auto text-sm">Destek almak için izlemeniz gereken adımlar</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BASVURU_ADIMLARI.map((adim, i) => (
            <div key={adim.no} className="relative bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-md transition-all">
              {i < BASVURU_ADIMLARI.length - 1 && (
                <div className="hidden lg:block absolute top-8 right-0 translate-x-1/2 z-10">
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              )}
              <span className="text-3xl font-black text-[#003087]/10 leading-none block mb-3">{adim.no}</span>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5">{adim.baslik}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{adim.aciklama}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="https://engelsiz.sakarya.edu.tr/tr/23686/iletisim" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#003087] hover:bg-[#0046c8] text-white font-bold rounded-xl transition-all shadow-sm text-sm">
              Birimi Ziyaret Et <ExternalLink size={14} />
            </a>
            <a href="mailto:engelsiz@sakarya.edu.tr"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:border-[#003087] hover:bg-blue-50 text-slate-700 font-bold rounded-xl transition-all text-sm">
              <Mail size={14} /> E-posta Gönder
            </a>
          </div>
        </div>
      </section>

      {/* ÖDÜLLER + LİNKLER */}
      <section className="max-w-5xl mx-auto px-4 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                <Award size={16} className="text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-900">Ödüller & Başarılar</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              Sakarya Üniversitesi, engelsiz kampüs çalışmaları kapsamında Yükseköğretim Kurulu tarafından düzenlenen
              Engelsiz Üniversite değerlendirmelerinde çeşitli bayrak ve program nişanı ödülleri almıştır.
            </p>
            <a href="https://engelsiz.sakarya.edu.tr/tr/icerik/28434/155235/engelsiz-universite-odulleri"
              target="_blank" rel="noopener noreferrer"
              className="mt-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-sm transition-all w-fit">
              <Award size={14} /> Tüm Ödülleri Gör <ExternalLink size={12} />
            </a>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Globe size={16} className="text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-900">Faydalı Bağlantılar</h3>
            </div>
            {LINKLER.map((link) => {
              const Icon = link.icon;
              return (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 hover:border-[#003087] hover:bg-blue-50/50 transition-all group">
                  <Icon size={15} className="text-slate-400 group-hover:text-[#003087] transition-colors shrink-0" />
                  <span className="text-sm text-slate-700 group-hover:text-[#003087] font-medium transition-colors flex-1">{link.label}</span>
                  <ChevronRight size={14} className="text-slate-300 group-hover:text-[#003087] transition-colors shrink-0" />
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* BEYAN */}
      <section className="max-w-5xl mx-auto px-4 mb-20">
        <div className="rounded-3xl p-8 text-center"
          style={{ background: "linear-gradient(135deg, #001f5a 0%, #003087 55%, #0046c8 100%)" }}>
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/10 mb-4">
            <Accessibility size={24} className="text-white" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-3">Erişilebilirlik Beyanı</h2>
          <p className="text-white/70 text-sm max-w-2xl mx-auto leading-relaxed mb-6">
            SAU Vibe platformu, tüm öğrencilerin bilgiye eşit erişimini desteklemeyi amaçlamaktadır.
            Platformda yaşadığınız erişilebilirlik sorunlarını bildirmek veya destek talep etmek için
            Engelsiz Yaşam ve Destek Koordinatörlüğü ile iletişime geçebilirsiniz.
          </p>
          <a href="mailto:engelsiz@sakarya.edu.tr"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#f4a522] hover:bg-[#f4a522]/90 text-[#001f5a] font-bold rounded-xl transition-all text-sm">
            <Mail size={14} /> Bildirim Gönder
          </a>
        </div>
      </section>

    </div>
  );
}
