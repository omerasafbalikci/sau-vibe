package com.backend.sauvibe.guide.initializer;

import com.backend.sauvibe.guide.domain.Building;
import com.backend.sauvibe.guide.domain.BuildingCategory;
import com.backend.sauvibe.guide.repository.BuildingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * @author Ömer Asaf Balıkçı
 */
@Component
@RequiredArgsConstructor
public class BuildingDataInitializer implements CommandLineRunner {

  private final BuildingRepository repository;

  @Override
  public void run(String... args) {
    if (this.repository.count() > 0) return;

    this.repository.saveAll(List.of(
      // ── İDARİ BİNALAR ──────────────────────────────────────
      b(1, "Rektörlük", "Rectorate", BuildingCategory.IDARI,
        "Sakarya Üniversitesi Rektörlük binası. Üniversitenin yönetim ve idari merkez üssüdür.",
        "+90 264 295 70 00", "rektorluk@sakarya.edu.tr", "/images/buildings/1.jpg"),

      b(2, "Rektörlük Daire Başkanlıkları", "Rectorate Department Heads", BuildingCategory.IDARI,
        "Rektörlüğe bağlı daire başkanlıklarının ve idari şubelerin yer aldığı ana idari bina.",
        "+90 264 295 70 00", null, "/images/buildings/2.jpg"),

      b(3, "Uluslararası İlişkiler Koordinatörlüğü", "International Relations (Erasmus - Mevlana)", BuildingCategory.IDARI,
        "Erasmus+, Mevlana ve Farabi gibi değişim programları dahil tüm uluslararası ilişkiler koordinasyon ofisi.",
        "+90 264 295 73 21", "erasmus@sakarya.edu.tr", "/images/buildings/3.jpg"),

      b(4, "Kütüphane", "Library", BuildingCategory.IDARI,
        "SAÜ Ana Kütüphanesi. Zengin kaynak arşivi, çalışma salonları ve grup çalışma odaları ile hizmet vermektedir.",
        "+90 264 295 71 60", "kutuphane@sakarya.edu.tr", "/images/buildings/4.jpg"),

      b(5, "ÖSYM İl Temsilciliği", "ÖSYM Provincial Office", BuildingCategory.IDARI,
        "ÖSYM sınav başvuruları, tercih işlemleri ve resmi evrak takipleri için il temsilciliği.",
        "+90 264 295 70 00", null, "/images/buildings/5.jpg"),

      b(6, "Öğrenci İşleri Dairesi Başkanlığı", "Directorate of Student Affairs", BuildingCategory.IDARI,
        "Kayıt, diploma, transkript, harç ve öğrencilik belgesi işlemlerinin yürütüldüğü merkez birim.",
        "+90 264 295 70 56", "ogrenciisleri@sakarya.edu.tr", "/images/buildings/6.jpg"),

      b(7, "Mediko", "Health Center", BuildingCategory.IDARI,
        "Öğrenci ve personel sağlık merkezi. Temel poliklinik hizmetleri, acil müdahale ve psikolojik danışmanlık.",
        "+90 264 295 72 80", "mediko@sakarya.edu.tr", "/images/buildings/7.jpg"),

      b(8, "Koruma ve Güvenlik Şube Müdürlüğü", "Security Office", BuildingCategory.IDARI,
        "7/24 kampüs güvenliğini sağlayan, giriş-çıkış kontrolleri ve huzuru koordine eden güvenlik müdürlüğü.",
        "+90 264 295 70 10", null, "/images/buildings/8.jpg"),

      b(9, "Teknokent", "Technocity", BuildingCategory.IDARI,
        "SAÜ Teknoloji Geliştirme Bölgesi. Ar-Ge firmaları, yazılım şirketleri ve teknolojik girişimlerin merkezi.",
        "+90 264 295 75 00", "teknokent@sakarya.edu.tr", "/images/buildings/9.jpg"),

      b(10, "Yapı İşleri Dairesi Başkanlığı", "Construction and Technical Works", BuildingCategory.IDARI,
        "Kampüs alt yapı, üst yapı, peyzaj, inşaat ve teknik bakım işlerinin planlandığı idari daire başkanlığı.",
        "+90 264 295 70 00", null, "/images/buildings/10.jpg"),

      b(11, "Teknokent Kuluçka Merkezi", "Technocity Incubation Center", BuildingCategory.IDARI,
        "Girişimci öğrencilerin projelerini hayata geçirebilmeleri için sunulan fikir ve iş geliştirme kuluçka istasyonu.",
        "+90 264 295 75 10", null, "/images/buildings/11.jpg"),

      b(12, "Öğrenci Dekanlığı", "Student Deanery", BuildingCategory.IDARI,
        "Öğrenci toplulukları, kulüp faaliyetleri ve öğrenci odaklı sosyal projelerin koordinasyon merkezi.",
        "+90 264 295 70 00", null, "/images/buildings/12.jpg"),

      b(13, "Kültür ve Kongre Merkezi", "Culture and Congress Center", BuildingCategory.IDARI,
        "Konferans, tiyatro, konser, sempozyum ve büyük akademik etkinliklerin düzenlendiği ana salon kompleksi.",
        "+90 264 295 73 50", "kkm@sakarya.edu.tr", "/images/buildings/13.jpg"),

      // ── FAKÜLTELER ──────────────────────────────────────────
      b(14, "İlahiyat Fakültesi", "Faculty of Theology", BuildingCategory.FAKULTE,
        "Temel İslam Bilimleri, Felsefe ve Din Bilimleri, İslam Tarihi ve Sanatları eğitimi veren fakülte.",
        "+90 264 295 74 00", "ilahiyat@sakarya.edu.tr", "/images/buildings/14.jpg"),

      b(15, "Bilgisayar ve Bilişim Bilimleri Fakültesi", "Faculty of Computer and Information Sciences", BuildingCategory.FAKULTE,
        "Bilgisayar, Yazılım ve Bilişim Sistemleri Mühendisliği bölümlerini barındıran bilişim odağı.",
        "+90 264 295 74 50", "bbf@sakarya.edu.tr", "/images/buildings/15.jpg"),

      b(16, "İletişim Fakültesi", "Faculty of Communication", BuildingCategory.FAKULTE,
        "Gazetecilik, Halkla İlişkiler, Radyo-TV-Sinema alanlarında modern stüdyolarla eğitim veren fakülte.",
        "+90 264 295 74 80", "iletisim@sakarya.edu.tr", "/images/buildings/16.jpg"),

      b(17, "İşletme Fakültesi", "Faculty of Business", BuildingCategory.FAKULTE,
        "İşletme, Uluslararası Ticaret, Sağlık Yönetimi ve İnsan Kaynakları Yönetimi bölümleri.",
        "+90 264 295 75 20", "isletme@sakarya.edu.tr", "/images/buildings/17.jpg"),

      b(18, "Siyasal Bilgiler Fakültesi", "Faculty of Political Sciences", BuildingCategory.FAKULTE,
        "Uluslararası İlişkiler, Siyaset Bilimi ve Kamu Yönetimi, İktisat, Maliye ve Ekonometri bölümleri.",
        "+90 264 295 75 50", "sbf@sakarya.edu.tr", "/images/buildings/18.jpg"),

      b(19, "Hukuk Fakültesi", "Faculty of Law", BuildingCategory.FAKULTE,
        "Kamu Hukuku ve Özel Hukuk anabilim dallarında yetkin hukukçular yetiştiren fakülte.",
        "+90 264 295 75 80", "hukuk@sakarya.edu.tr", "/images/buildings/19.jpg"),

      b(20, "Sağlık Bilimleri Fakültesi", "Faculty of Health Sciences", BuildingCategory.FAKULTE,
        "Hemşirelik, Ebelik ve Sağlık Yönetimi bölümlerinde teorik ve pratik sağlık eğitimi laboratuvarları.",
        "+90 264 295 76 00", "saglik@sakarya.edu.tr", "/images/buildings/20.jpg"),

      b(21, "Sanat Tasarım ve Mimarlık Fakültesi", "Faculty of Art Design and Architecture", BuildingCategory.FAKULTE,
        "Mimarlık, Geleneksel Türk Sanatları, Resim, Seramik ve Grafik Tasarımı atölyelerini barındıran fakülte.",
        "+90 264 295 76 50", "sanat@sakarya.edu.tr", "/images/buildings/21.jpg"),

      b(22, "Devlet Konservatuarı", "Conservatory", BuildingCategory.FAKULTE,
        "Türk Müziği, Temel Bilimler ve Ses Eğitimi bölümlerinde sanatsal ve müzikal akademik eğitim merkezi.",
        "+90 264 295 77 00", "konservatuar@sakarya.edu.tr", "/images/buildings/22.jpg"),

      // ── FEN EDEBİYAT FAKÜLTESİ ─────────────────────────────
      b(23, "Fen Edebiyat Fakültesi Dekanlık", "Faculty of Arts and Sciences Dean's Office", BuildingCategory.FAKULTE,
        "Fen Edebiyat Fakültesi yönetim ve dekanlık idari birimleri.",
        "+90 264 295 79 00", "fef@sakarya.edu.tr", "/images/buildings/23.jpg"),

      b(24, "A Blok - Fizik, Kimya, Biyoloji", "A Block - Physics, Chemistry, Biology", BuildingCategory.FAKULTE,
        "Fen Edebiyat Fakültesi A Bloku. Temel fen bilimleri derslikleri ve gelişmiş araştırma laboratuvarları.",
        "+90 264 295 79 00", null, "/images/buildings/24.jpg"),

      b(25, "B Blok - Coğrafya, Matematik, Sanat Tarihi", "B Block - Geography, Mathematics, History of Art", BuildingCategory.FAKULTE,
        "Fen Edebiyat Fakültesi B Bloku. Coğrafya, Matematik ve Sanat Tarihi bölümlerinin derslik ve ofisleri.",
        "+90 264 295 79 10", null, "/images/buildings/25.jpg"),

      b(26, "C Blok - Tarih, Sosyoloji, Felsefe", "C Block - History, Sociology, Philosophy", BuildingCategory.FAKULTE,
        "Fen Edebiyat Fakültesi C Bloku. Sosyal ve beşeri bilimler bölümlerinin derslikleri.",
        "+90 264 295 79 20", null, "/images/buildings/26.jpg"),

      b(27, "D Blok - Alman Dili, Türk Dili ve Edebiyatı", "D Block - German, Turkish Language and Lit.", BuildingCategory.FAKULTE,
        "Fen Edebiyat Fakültesi D Bloku. Filoloji, mütercim tercümanlık ve edebiyat kürsüleri.",
        "+90 264 295 79 30", null, "/images/buildings/27.jpg"),

      // ── MÜHENDİSLİK FAKÜLTESİ ──────────────────────────────
      b(28, "M1 Blok - Seramik, Gıda, Jeofizik Mühendisliği", "M1 - Ceramics, Food, Geophysics Engineering", BuildingCategory.FAKULTE,
        "Mühendislik Fakültesi M1 Bloku. Laboratuvarlar ve ilgili mühendislik bölümlerinin akademik ofisleri.",
        "+90 264 295 78 10", "muhendislik@sakarya.edu.tr", "/images/buildings/28.jpg"),

      b(29, "M2 Blok - Çevre Mühendisliği", "M2 - Environmental Engineering", BuildingCategory.FAKULTE,
        "Mühendislik Fakültesi M2 Bloku. Çevre analizi laboratuvarları ve derslik alanları.",
        "+90 264 295 78 20", null, "/images/buildings/29.jpg"),

      b(30, "M3 Blok - Derslikler", "M3 - Classrooms", BuildingCategory.FAKULTE,
        "Mühendislik Fakültesi ortak amfi ve teorik derslik bloku.",
        null, null, "/images/buildings/30.jpg"),

      b(31, "M4 Blok - Derslikler", "M4 - Classrooms", BuildingCategory.FAKULTE,
        "Mühendislik Fakültesi ortak derslik, çizim odaları ve sınav salonları bloku.",
        null, null, "/images/buildings/31.jpg"),

      b(32, "M5 Blok - Endüstri Mühendisliği", "M5 - Industrial Engineering", BuildingCategory.FAKULTE,
        "Mühendislik Fakültesi M5 Bloku. Endüstri Mühendisliği akademik kadrosu ve derslikleri.",
        "+90 264 295 78 50", null, "/images/buildings/32.jpg"),

      b(33, "M6 Blok - Elektrik Elektronik Mühendisliği", "M6 - Electrical and Electronics Engineering", BuildingCategory.FAKULTE,
        "Mühendislik Fakültesi M6 Bloku. Devre tasarımları, elektrik makineleri ve telekomünikasyon laboratuvarları.",
        "+90 264 295 78 60", null, "/images/buildings/33.jpg"),

      b(34, "M7 Blok - Makine, Malzeme, Metalurji Mühendisliği", "M7 - Mechanical, Materials, Metallurgical", BuildingCategory.FAKULTE,
        "Mühendislik Fakültesi M7 Bloku. Termodinamik, malzeme test ve mekanik laboratuvar kompleksleri.",
        "+90 264 295 78 70", null, "/images/buildings/34.jpg"),

      b(35, "M8 Blok - İnşaat Mühendisliği", "M8 - Civil Engineering", BuildingCategory.FAKULTE,
        "Mühendislik Fakültesi M8 Bloku. Yapı mekaniği, hidrolik ve zemin mekaniği test laboratuvarları.",
        "+90 264 295 78 80", null, "/images/buildings/35.jpg"),

      // ── TEKNOLOJİ FAKÜLTESİ ────────────────────────────────
      b(36, "T1 Blok - Makine, Metalurji Mühendisliği", "T1 - Mechanical, Metallurgical Engineering", BuildingCategory.FAKULTE,
        "Teknoloji Fakültesi T1 Bloku. Uygulamalı imalat teknikleri ve metalurji derslikleri.",
        "+90 264 295 79 50", null, "/images/buildings/36.jpg"),

      b(37, "T2 Blok - Dekanlık, İnşaat Mühendisliği", "T2 - Dean, Civil Engineering", BuildingCategory.FAKULTE,
        "Teknoloji Fakültesi Dekanlık idari birimleri ve İnşaat Mühendisliği bölümü.",
        "+90 264 295 79 60", "teknoloji@sakarya.edu.tr", "/images/buildings/37.jpg"),

      b(38, "T3 Blok - Laboratuvarlar", "T3 - Laboratories", BuildingCategory.FAKULTE,
        "Teknoloji Fakültesi uygulama, test ve endüstriyel pratik eğitim laboratuvarları kompleksi.",
        null, null, "/images/buildings/38.jpg"),

      b(39, "T4 Blok - Elektrik-Elektronik, Mekatronik Mühendisliği", "T4 - Electrical, Mechatronics Eng.", BuildingCategory.FAKULTE,
        "Teknoloji Fakültesi T4 Bloku. Robotik, otomasyon ve gömülü sistemler uygulama laboratuvarları.",
        null, null, "/images/buildings/39.jpg"),

      // ── SPOR BİLİMLERİ FAKÜLTESİ ───────────────────────────
      b(40, "Spor Bilimleri Fakültesi", "Faculty of Sport Sciences", BuildingCategory.FAKULTE,
        "Antrenörlük, Beden Eğitimi Öğretmenliği ve Spor Yöneticiliği akademik kürsüsü.",
        "+90 264 295 79 80", "sporbilim@sakarya.edu.tr", "/images/buildings/40.jpg"),

      // ── ENSTİTÜLER (41-43) ─────────────────────────────────
      b(41, "Enstitüler Binası (Fen, Sağlık, Sosyal Bilimler)", "Institutes Building", BuildingCategory.ENSTITU,
        "Fen Bilimleri, Sağlık Bilimleri ve Sosyal Bilimler Enstitülerini tek çatı altında toplayan ortak lisansüstü eğitim binası.",
        "+90 264 295 72 00", "fbe@sakarya.edu.tr", "/images/buildings/41.jpg"),

      b(42, "İşletme Enstitüsü", "Institute of Business Administration", BuildingCategory.ENSTITU,
        "Yüksek lisans, doktora, Executive MBA ve işletme odaklı lisansüstü akademik çalışmaların merkezi.",
        "+90 264 295 72 60", "isletmeenstitu@sakarya.edu.tr", "/images/buildings/42.jpg"),

      b(43, "Ortadoğu Enstitüsü", "Middle East Institute", BuildingCategory.ENSTITU,
        "Ortadoğu bölgesinin siyasi, ekonomik ve sosyolojik yapısı üzerine uzmanlaşmış uluslararası araştırma ve lisansüstü eğitim merkezi.",
        "+90 264 295 72 80", "ortadogu@sakarya.edu.tr", "/images/buildings/43.jpg"),

      // ── SOSYAL ALANLAR & DİĞERLERİ ──────────────────────────
      b(44, "Kreş", "Kindergarten", BuildingCategory.SOSYAL,
        "SAÜ personeli ve öğrencilerin çocukları için okul öncesi eğitim ve bakım hizmeti sunan kampüs kreşi.",
        "+90 264 295 73 80", null, "/images/buildings/44.jpg"),

      b(45, "Lojmanlar", "Staff Accommodations", BuildingCategory.SOSYAL,
        "Üniversite personeli ve akademisyenlerin konaklaması için tahsis edilmiş yeşillikler içindeki kampüs lojmanları.",
        null, null, "/images/buildings/45.jpg"),

      b(46, "Kapalı Spor Salonu", "Indoor Sports Facilities", BuildingCategory.SPOR,
        "Çok amaçlı kapalı spor salonu, fitness merkezi, basketbol ve voleybol sahaları.",
        "+90 264 295 73 00", null, "/images/buildings/46.jpg"),

      b(47, "Kampüs Camii", "Campus Mosque", BuildingCategory.SOSYAL,
        "Esentepe kampüsü merkezinde yer alan, Selçuklu ve modern mimarinin izlerini taşıyan kampüs camii.",
        null, null, "/images/buildings/47.jpg"),

      b(48, "Kampüs Çarşı", "Campus Market & Services", BuildingCategory.SOSYAL,
        "Kafeler, restoranlar, banka ATM'leri, kırtasiye, kitapçı ve PTT şubesini barındıran sosyal yaşam alanı.",
        null, null, "/images/buildings/48.jpg"),

      b(49, "Kampüs Kafeteryası", "Campus Cafeteria", BuildingCategory.SOSYAL,
        "Öğrencilerin günlük uygun fiyatlı ve hijyenik yemek ihtiyaçlarını karşılayan ana öğrenci yemekhanesi ve kafeteryası.",
        null, null, "/images/buildings/49.jpg"),

      b(50, "Personel Yemekhanesi", "Staff Dining Hall", BuildingCategory.SOSYAL,
        "Akademik ve idari personele yönelik hizmet veren kafeterya ve tabldot yemek salonu.",
        null, null, "/images/buildings/50.jpg"),

      b(51, "Spor Tesisleri", "Sport Facilities", BuildingCategory.SPOR,
        "Açık stadyum, koşu pisti, tenis kortları, halı sahalar ve açık hava egzersiz alanları kompleksi.",
        null, null, "/images/buildings/51.jpg"),

      b(52, "Otobüs Durakları", "Bus Stops", BuildingCategory.SOSYAL,
        "Şehir içi otobüs ve minibüs hatlarının kampüs içi yolcu indirme-bindirme yaptığı ana duraklar noktası.",
        null, null, "/images/buildings/52.jpg"),

      b(53, "Yurtlar (KYK)", "Dormitories", BuildingCategory.SOSYAL,
        "Kampüs sınırları içinde yer alan, Kredi ve Yurtlar Kurumu'na bağlı kız ve erkek öğrenci yurt blokları.",
        "+90 264 295 80 00", null, "/images/buildings/53.jpg"),

      // ── REKTÖRLÜĞE BAĞLI BÖLÜMLER ──────────────────────────
      b(54, "Atatürk İlkeleri ve İnkılap Tarihi & Türk Dili Bölüm Başkanlıkları", "Departments Affiliated to Rectorate", BuildingCategory.IDARI,
        "Zorunlu ortak derslerin koordinasyonu, müfredat planlaması ve akademik işleyişinin yürütüldüğü merkez.",
        "+90 264 295 70 00", null, "/images/buildings/54.jpg"),

      b(55, "Yabancı Diller Bölüm Başkanlığı", "Department of Foreign Languages", BuildingCategory.IDARI,
        "Yabancı dil hazırlık eğitimleri ve zorunlu yabancı dil derslerinin yürütüldüğü dil eğitimi binası.",
        "+90 264 295 70 00", null, "/images/buildings/55.jpg"),

      // ── ARAŞTIRMA MERKEZLERİ ────────────────────────────────
      b(56, "TÖMER", "Turkish Language Teaching Center", BuildingCategory.ARASTIRMA,
        "Türk Dili Öğretimi Uygulama ve Araştırma Merkezi. Uluslararası öğrencilere Türkçe dil eğitimi verilir.",
        "+90 264 295 74 30", "tomer@sakarya.edu.tr", "/images/buildings/56.jpg"),

      b(57, "SAÜSEM", "Continuing Education Research Center", BuildingCategory.ARASTIRMA,
        "Sürekli Eğitim Uygulama ve Araştırma Merkezi. Kamu ve özel sektöre yönelik sertifika ve eğitim programları.",
        "+90 264 295 74 20", "sausem@sakarya.edu.tr", "/images/buildings/57.jpg"),

      b(58, "İslam Ekonomisi ve Finansı Araştırma ve Uygulama Merkezi", "Research Center for Islamic Economics", BuildingCategory.ARASTIRMA,
        "İslam ekonomisi, faizsiz finansal modeller ve katılım bankacılığı alanında akademik araştırmalar yürütür.",
        null, null, "/images/buildings/58.jpg"),

      b(59, "SARGEM", "Sakarya R&D Application Center", BuildingCategory.ARASTIRMA,
        "Sakarya Üniversitesi Araştırma Geliştirme, Endüstriyel Analiz ve Test Uygulama Laboratuvarları Merkezi.",
        "+90 264 295 74 40", "sargem@sakarya.edu.tr", "/images/buildings/59.jpg"),

      b(60, "BAUM & UZEH (Uzaktan Eğitim Araştırma ve Uygulama Merkezi)", "Computer & Distance Education Centers", BuildingCategory.ARASTIRMA,
        "Bilgisayar Araştırma Merkezi ile Uzaktan Eğitim Altyapı ve Çevrimiçi Öğrenme Yönetim Merkez Birimi.",
        "+90 264 295 74 50", "baum@sakarya.edu.tr", "/images/buildings/60.jpg"),

      b(61, "Diaspora Çalışmaları Uygulama ve Araştırma Merkezi", "Diaspora Studies Research Center", BuildingCategory.ARASTIRMA,
        "Göç, küresel diasporalar ve yurtdışındaki Türk toplulukları üzerine sosyo-politik araştırmalar merkezi.",
        null, null, "/images/buildings/61.jpg"),

      // ── MESLEK YÜKSEKOKULU ─────────────────────────────────
      b(62, "Adapazarı Meslek Yüksekokulu", "Adapazarı Vocational School", BuildingCategory.FAKULTE,
        "Ön lisans düzeyinde teknik, endüstriyel ve idari alanlarda mesleki ve pratik iş gücü eğitimi veren yüksekokul.",
        "+90 264 295 77 50", "myo@sakarya.edu.tr", "/images/buildings/62.jpg")
    ));
  }

  private Building b(int num, String name, String nameEn, BuildingCategory category,
                     String description, String phone, String email, String photoUrl) {
    return Building.builder()
      .number(num).name(name).nameEn(nameEn).category(category)
      .description(description).phone(phone).email(email).photoUrl(photoUrl).build();
  }
}