export const dictionaries = {
  id: {
    nav: {
      about: "Tentang",
      stack: "Skill",
      work: "Karya",
      contact: "Kontak",
      hireMe: "Hubungi Saya",
      openMenu: "Buka menu",
      closeMenu: "Tutup menu",
    },
    hero: {
      viewWork: "Lihat karya",
      downloadCv: "Unduh CV",
    },
    about: {
      title: "Tentang",
      defaultBio:
        "Front-end developer yang fokus membangun produk web yang rapi, cepat, dan menyenangkan digunakan — dari UI presisi piksel hingga animasi yang halus.",
    },
    stack: {
      title: "Skill",
      empty: "Item skill akan muncul di sini setelah ditambahkan lewat panel admin.",
    },
    work: {
      title: "Karya pilihan",
      empty: "Belum ada proyek — tambahkan yang pertama lewat panel admin.",
      featured: "Unggulan",
      sourceCode: "Kode sumber",
      liveDemo: "Demo langsung",
      viewSourceCode: "Lihat kode sumber",
      viewLiveSite: "Lihat situs langsung",
    },
    contact: {
      title: "Mari bekerja sama.",
    },
    footer: {
      rights: "Seluruh hak cipta dilindungi.",
    },
    backToTop: "Kembali ke atas",
    notFound: {
      code: "404",
      title: "Halaman tidak ditemukan",
      description: "Halaman yang kamu cari tidak ada atau sudah dipindahkan.",
      back: "Kembali ke beranda",
    },
    error: {
      eyebrow: "Kesalahan",
      title: "Terjadi kesalahan",
      description: "Terjadi kesalahan tak terduga saat memuat halaman ini. Silakan coba lagi.",
      retry: "Coba lagi",
    },
  },
  en: {
    nav: {
      about: "About",
      stack: "Stack",
      work: "Work",
      contact: "Contact",
      hireMe: "Hire me",
      openMenu: "Open menu",
      closeMenu: "Close menu",
    },
    hero: {
      viewWork: "View my work",
      downloadCv: "Download CV",
    },
    about: {
      title: "About",
      defaultBio:
        "A front-end developer focused on building polished, performant, and delightful web products — from pixel-perfect UI to smooth motion design.",
    },
    stack: {
      title: "Tech stack",
      empty: "Tech stack items will appear here once added from the admin panel.",
    },
    work: {
      title: "Selected work",
      empty: "No projects yet — add your first one from the admin panel.",
      featured: "Featured",
      sourceCode: "Source code",
      liveDemo: "Live demo",
      viewSourceCode: "View source code",
      viewLiveSite: "View live site",
    },
    contact: {
      title: "Let's work together.",
    },
    footer: {
      rights: "All rights reserved.",
    },
    backToTop: "Back to top",
    notFound: {
      code: "404",
      title: "Page not found",
      description: "The page you're looking for doesn't exist or may have been moved.",
      back: "Back to home",
    },
    error: {
      eyebrow: "Error",
      title: "Something went wrong",
      description: "An unexpected error occurred while loading this page. Please try again.",
      retry: "Try again",
    },
  },
} as const;

export type Language = keyof typeof dictionaries;
export type Dictionary = (typeof dictionaries)[Language];

export const LANGUAGES: Language[] = ["id", "en"];
