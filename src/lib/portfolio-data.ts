export type StatItem = {
  value: number;
  suffix: string;
  label: { id: string; en: string };
  description: { id: string; en: string };
};

export type ExperienceItem = {
  id: string;
  period: string;
  role: { id: string; en: string };
  company: string;
  location: string;
  description: { id: string; en: string };
  achievements: { id: string[]; en: string[] };
  skills: string[];
  isCurrent?: boolean;
};

export type TestimonialItem = {
  id: string;
  name: string;
  role: { id: string; en: string };
  company: string;
  avatar?: string;
  rating: number;
  content: { id: string; en: string };
  projectRef?: string;
};

export type CaseStudy = {
  projectSlug: string;
  problem: { id: string; en: string };
  solution: { id: string; en: string };
  architecture: string[];
  results: { id: string[]; en: string[] };
};

export const PORTFOLIO_STATS: StatItem[] = [
  {
    value: 15,
    suffix: "+",
    label: { id: "Proyek Selesai", en: "Projects Delivered" },
    description: {
      id: "Aplikasi web modern, sistem photobooth, & website interaktif.",
      en: "Modern web applications, photobooth systems, & interactive sites.",
    },
  },
  {
    value: 99,
    suffix: ".8%",
    label: { id: "Kepuasan Klien", en: "Client Satisfaction" },
    description: {
      id: "Berdasarkan ulasan langsung klien bisnis & photobooth.",
      en: "Based on direct reviews from business & photobooth clients.",
    },
  },
  {
    value: 3,
    suffix: "+",
    label: { id: "Tahun Pengalaman", en: "Years Experience" },
    description: {
      id: "Spesialisasi arsitektur React, Next.js, & Tailwind CSS.",
      en: "Specializing in React, Next.js, & Tailwind CSS architecture.",
    },
  },
  {
    value: 10,
    suffix: "k+",
    label: { id: "Pengguna Terlayani", en: "End Users Served" },
    description: {
      id: "Melalui platform web MemoriBox & event digital photobooth.",
      en: "Via MemoriBox web platform & digital photobooth events.",
    },
  },
];

export const CAREER_EXPERIENCES: ExperienceItem[] = [
  {
    id: "exp-1",
    period: "2024 — Sekarang",
    isCurrent: true,
    role: {
      id: "Lead Front-End Developer & Co-Founder",
      en: "Lead Front-End Developer & Co-Founder",
    },
    company: "MemoriBox.id Photobooth",
    location: "Malang, Indonesia",
    description: {
      id: "Merancang dan membangun ekosistem web platform untuk operasional bisnis photobooth dan antrian digital QR real-time.",
      en: "Designing and building the web platform ecosystem for modern photobooth operations and real-time QR queue management.",
    },
    achievements: {
      id: [
        "Membangun portal pelanggan modern untuk reservasi tanggal sewa dan unduhan hasil cetak foto via QR code.",
        "Mengintegrasikan backend Supabase untuk autentikasi admin, penjadwalan real-time, dan penyimpanan cloud media.",
        "Mencapai skor Lighthouse 98+ untuk performa, aksesibilitas, dan SEO pada perangkat mobile.",
      ],
      en: [
        "Built a modern client portal for package reservations and direct QR-based digital photo downloads.",
        "Integrated Supabase backend for admin auth, real-time event booking, and cloud photo storage.",
        "Achieved 98+ Lighthouse scores across performance, accessibility, and SEO on mobile viewports.",
      ],
    },
    skills: ["Next.js", "React 19", "Tailwind CSS", "Supabase", "TypeScript", "Framer Motion"],
  },
  {
    id: "exp-2",
    period: "2023 — Sekarang",
    isCurrent: true,
    role: {
      id: "Freelance Front-End Engineer",
      en: "Freelance Front-End Engineer",
    },
    company: "Independent / Self-Employed",
    location: "Remote",
    description: {
      id: "Mengembangkan berbagai landing page interaktif, aplikasi web kustom, dan interface responsif presisi tinggi untuk UMKM dan klien personal.",
      en: "Developing interactive landing pages, custom web applications, and pixel-perfect responsive interfaces for SMBs and personal brands.",
    },
    achievements: {
      id: [
        "Menyelesaikan 15+ proyek web dengan zero downtime dan tingkat kepuasan klien 99.8%.",
        "Menerapkan micro-animations yang halus dan optimasi asset untuk loading di bawah 1.5 detik.",
      ],
      en: [
        "Delivered 15+ custom web projects with zero downtime and a 99.8% client satisfaction rate.",
        "Engineered smooth micro-animations and aggressive asset optimizations to achieve sub-1.5s load times.",
      ],
    },
    skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Three.js", "Git"],
  },
  {
    id: "exp-3",
    period: "2022 — 2024",
    isCurrent: false,
    role: {
      id: "Web Developer & UI/UX Specialist",
      en: "Web Developer & UI/UX Specialist",
    },
    company: "SnapHub Tech Project",
    location: "Malang, Indonesia",
    description: {
      id: "Mengembangkan antarmuka aplikasi web pemesanan dan kalkulator paket photobooth dengan dark glassmorphism modern.",
      en: "Built the front-end user experience and dynamic package pricing calculator with a sleek dark glassmorphism aesthetic.",
    },
    achievements: {
      id: [
        "Membuat sistem estimasi harga instan yang meningkatkan konversi pesanan masuk hingga 35%.",
        "Mendesain komponen UI modular yang dapat digunakan kembali untuk berbagai sub-event.",
      ],
      en: [
        "Created an instant package quote estimator that boosted conversion inquiries by 35%.",
        "Crafted modular, reusable UI components for various client activation events.",
      ],
    },
    skills: ["Vite", "React", "Tailwind CSS", "Framer Motion", "JavaScript"],
  },
];

export const CLIENT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: "testi-1",
    name: "Dimas Prasetyo",
    role: {
      id: "Event Organizer & Creative Lead",
      en: "Event Organizer & Creative Lead",
    },
    company: "Malang Festive Moments",
    rating: 5,
    content: {
      id: "Puja sangat cekatan dalam menerjemahkan kebutuhan web kami. Sistem booking photobooth MemoriBox yang dibuat sangat mulus, responsif di HP, dan tamu-tamu kami sangat senang dengan kemudahan download foto via QR code.",
      en: "Puja was exceptionally fast and accurate in turning our web vision into reality. The MemoriBox booking system is butter smooth on mobile, and our event guests loved the seamless QR photo download experience.",
    },
    projectRef: "MemoriBox.id",
  },
  {
    id: "testi-2",
    name: "Sarah Anggraini",
    role: {
      id: "Brand Manager",
      en: "Brand Manager",
    },
    company: "GlowUp Studio",
    rating: 5,
    content: {
      id: "Desain portofolio dan landing page yang dibangun punya nuansa premium luar biasa. Efek interaktif dan animasi Three.js-nya benar-benar membedakan website kami dari kompetitor lain.",
      en: "The portfolio and landing pages crafted by Puja possess an extraordinary premium polish. The interactive details and micro-animations genuinely set our brand apart from the rest.",
    },
    projectRef: "Custom Web App",
  },
  {
    id: "testi-3",
    name: "Rizky Ramadhan",
    role: {
      id: "Founder & Operations",
      en: "Founder & Operations",
    },
    company: "SnapHub Malang",
    rating: 5,
    content: {
      id: "Komunikasi sangat lancar, kode rapi dan mudah di-maintain. Fitur kalkulator paket dan integrasi Supabase-nya sangat membantu operasional bisnis kami berkembang pesat.",
      en: "Super smooth communication, clean maintainable code, and excellent attention to detail. The pricing calculator and Supabase integration helped our operations scale seamlessly.",
    },
    projectRef: "SnapHub Photobooth",
  },
];

export const CASE_STUDIES: Record<string, CaseStudy> = {
  "memoribox-id": {
    projectSlug: "memoribox-id",
    problem: {
      id: "Bisnis photobooth offline sering mengalami kendala antrian manual, cetak foto yang lambat, dan tamu kesulitan mendapatkan soft file resolusi tinggi secara instan saat acara berlangsung.",
      en: "Offline photobooth services struggled with manual queues, slow photo printing, and guests unable to instantly download their high-res digital copies during fast-paced events.",
    },
    solution: {
      id: "Membangun platform web MemoriBox berbasis Next.js 16 dan Supabase dengan sistem QR download terdesentralisasi, live booking dashboard, dan kompresi media real-time.",
      en: "Engineered the MemoriBox web platform using Next.js 16 and Supabase with decentralized QR downloads, live booking dashboards, and real-time media compression.",
    },
    architecture: [
      "Next.js App Router untuk Server-Side Rendering dan instant dynamic routing.",
      "Supabase Storage & Database dengan Row-Level Security untuk data foto aman.",
      "Tailwind CSS v4 & Framer Motion untuk antarmuka dark glassmorphism modern.",
      "Custom QR Code generator client-side untuk akses galeri tanpa login.",
    ],
    results: {
      id: [
        "Mengurangi waktu antrian tamu hingga 60% dengan sistem QR instan.",
        "Mendukung 10.000+ unduhan foto digital tanpa latency atau server crash.",
        "Peningkatan 40% konversi sewa photobooth melalui sistem reservasi otomatis.",
      ],
      en: [
        "Cut guest queue wait times by 60% with instant QR retrieval.",
        "Handled 10,000+ digital photo downloads with zero latency or server downtime.",
        "Boosted event booking conversions by 40% via automated reservation schedules.",
      ],
    },
  },
  "snaphub-photobooth": {
    projectSlug: "snaphub-photobooth",
    problem: {
      id: "Calon pelanggan kesulitan memvisualisasikan paket photobooth dan estimasi biaya sewa transparan sebelum menghubungi admin via chat.",
      en: "Prospective customers struggled to visualize photobooth packages and calculate transparent rental pricing before reaching out manually.",
    },
    solution: {
      id: "Merancang web aplikasi interaktif dengan kalkulator harga dinamis, galeri layout foto interaktif, dan tombol langsung terhubung ke WhatsApp booking.",
      en: "Architected an interactive web application featuring a dynamic pricing calculator, interactive photo strip layout showcase, and direct WhatsApp booking.",
    },
    architecture: [
      "React 19 & Vite untuk kecepatan load instan (< 1 detik).",
      "Framer Motion untuk micro-interactions pada kalkulator paket.",
      "Tailwind CSS untuk sistem desain modular responsif.",
    ],
    results: {
      id: [
        "Waktu rata-rata pengunjung di website meningkat 2.5x lipat.",
        "Pertanyaan berulang mengenai harga ke tim admin berkurang 50%.",
      ],
      en: [
        "Average user dwell time on site increased by 2.5x.",
        "Repetitive pricing inquiries to customer service dropped by 50%.",
      ],
    },
  },
};
