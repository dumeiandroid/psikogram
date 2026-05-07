/**
 * potensi_engine.js
 * Engine murni: data JSON, fetch API, dan logika scoring
 * TIDAK mengandung HTML atau CSS — semua rendering ada di masing-masing xxview.html
 *
 * Cara pakai di view:
 *   PotensiEngine.load('01').then(result => { ... render sendiri ... });
 *
 * Struktur result yang dikembalikan:
 *   {
 *     dataDiri,     // { nama, usia, pendidikan, tgl_tes }
 *     tesId,        // '01' | '02' | '03'
 *     dominant,     // key dominan (tergantung tes)
 *     config,       // objek config tipe dominan (dari DATA di bawah)
 *     skor,         // objek skor mentah
 *     persentase,   // objek persentase (untuk tes 01 & 02)
 *     sorted,       // array sorted [name, score] (untuk tes 03)
 *   }
 */

const PotensiEngine = (() => {

  // ─────────────────────────────────────────────
  //  DATA 01 — GAYA BELAJAR VAK
  // ─────────────────────────────────────────────
  const LEARNING_STYLES = {
    A: {
      name: 'VISUAL',
      color: '#4a90e2',
      icon: '👁️',
      description: 'Anda belajar paling efektif dengan melihat dan mengamati',
      characteristics: [
        'Lebih mudah mengingat apa yang dilihat daripada yang didengar',
        'Suka menggunakan diagram, grafik, dan gambar saat belajar',
        'Mengingat wajah lebih baik daripada nama',
        'Lebih suka membaca instruksi daripada mendengarkan penjelasan',
        'Sering membuat catatan visual atau mind map'
      ],
      tips: [
        'Gunakan highlighter warna-warni saat membaca',
        'Buat diagram, flowchart, atau mind mapping',
        'Tonton video pembelajaran atau tutorial visual',
        'Gunakan flashcard dengan gambar',
        'Visualisasikan konsep dalam bentuk gambar mental'
      ]
    },
    B: {
      name: 'AUDITORY',
      color: '#f39c12',
      icon: '👂',
      description: 'Anda belajar paling efektif dengan mendengar dan berbicara',
      characteristics: [
        'Lebih mudah mengingat apa yang didengar daripada yang dilihat',
        'Suka berdiskusi dan menjelaskan materi kepada orang lain',
        'Mengingat nama lebih baik daripada wajah',
        'Lebih suka mendengarkan penjelasan daripada membaca',
        'Sering berbicara sendiri saat berpikir atau menghafal'
      ],
      tips: [
        'Rekam penjelasan materi dan dengarkan ulang',
        'Diskusikan materi dengan teman atau kelompok belajar',
        'Bacalah materi dengan suara keras',
        'Gunakan musik instrumental saat belajar',
        'Jelaskan kembali materi yang dipelajari kepada orang lain'
      ]
    },
    C: {
      name: 'KINESTETIK',
      color: '#2ecc71',
      icon: '🤸',
      description: 'Anda belajar paling efektif melalui gerakan dan pengalaman langsung',
      characteristics: [
        'Lebih mudah memahami materi melalui praktik langsung',
        'Suka bergerak dan tidak bisa duduk diam terlalu lama',
        'Belajar lebih baik melalui eksperimen dan praktik',
        'Mengingat lebih baik melalui aktivitas fisik'
      ],
      tips: [
        'Praktikkan langsung apa yang dipelajari',
        'Gunakan alat peraga atau model fisik',
        'Buat eksperimen atau simulasi',
        'Berjalan atau bergerak saat menghafalkan',
        'Gunakan role play untuk memahami konsep',
        'Ambil jeda istirahat untuk bergerak setiap 20-30 menit'
      ]
    }
  };

  // ─────────────────────────────────────────────
  //  DATA 02 — DOMINASI OTAK
  // ─────────────────────────────────────────────
  const BRAIN_TYPES = {
    LEFT: {
      name: 'OTAK KIRI',
      color: '#2980b9',
      icon: '🧠',
      description: 'Anda memiliki kecenderungan berpikir secara Logis, Analitis, dan Terstruktur.',
      characteristics: [
        'Berpikir logis dan sistematis',
        'Suka hal terstruktur',
        'Pandai matematika/sains',
        'Kemampuan verbal baik',
        'Realistis & praktis',
        'Suka detail dan fakta'
      ],
      strengths: [
        'Pemikiran kritis',
        'Analisis data',
        'Perencanaan strategis',
        'Pemecahan masalah matematis',
        'Kemampuan bahasa'
      ],
      careers: ['Akuntan', 'Programmer', 'Analis Data', 'Insinyur', 'Ilmuwan', 'Pengacara', 'Dokter'],
      tips: [
        'Buat jadwal terstruktur',
        'Gunakan metode analisis langkah-demi-langkah',
        'Fokus pada fakta konkret',
        'Latih kreativitas untuk keseimbangan'
      ]
    },
    RIGHT: {
      name: 'OTAK KANAN',
      color: '#e74c3c',
      icon: '🎨',
      description: 'Anda memiliki kecenderungan berpikir secara Kreatif, Intuitif, dan Imajinatif.',
      characteristics: [
        'Berpikir kreatif dan imajinatif',
        'Intuisi yang kuat',
        'Pandai dalam seni/musik',
        'Proses informasi secara visual',
        'Spontan & fleksibel',
        'Melihat gambaran besar'
      ],
      strengths: [
        'Kreativitas tinggi',
        'Pemikiran visual-spasial',
        'Intuisi tajam',
        'Inovasi',
        'Ekspresi emosional'
      ],
      careers: ['Desainer Grafis', 'Seniman', 'Musisi', 'Arsitek', 'Penulis Kreatif', 'Fotografer', 'Marketing Kreatif'],
      tips: [
        'Gunakan mind mapping',
        'Ekspresikan ide melalui visual',
        'Manfaatkan intuisi dalam keputusan',
        'Ciptakan lingkungan kerja inspiratif'
      ]
    },
    BALANCED: {
      name: 'OTAK SEIMBANG',
      color: '#8e44ad',
      icon: '☯️',
      description: 'Anda memiliki profil "Whole Brain Thinking" yang luar biasa seimbang!',
      characteristics: [
        'Mampu beralih antara logika dan kreativitas',
        'Sangat adaptif dalam berbagai situasi',
        'Mempertimbangkan fakta dan perasaan',
        'Multitasking teknis dan artistik',
        'Melihat masalah dari berbagai sudut pandang'
      ],
      strengths: [
        'Fleksibilitas kognitif',
        'Manajemen proyek kompleks',
        'Komunikasi empatik namun logis',
        'Kemampuan belajar cepat',
        'Harmonisasi visi besar dan detail'
      ],
      careers: ['Project Manager', 'Sutradara', 'Wirausahawan', 'Konsultan Strategis', 'Editor Film', 'Psikolog'],
      tips: [
        'Jadilah jembatan antara tim kreatif dan teknis',
        'Waspadai keraguan karena terlalu banyak pertimbangan',
        'Latih pengambilan keputusan cepat',
        'Gunakan kedua sisi otak secara sadar'
      ]
    }
  };

  // ─────────────────────────────────────────────
  //  DATA 03 — KECERDASAN MAJEMUK
  // ─────────────────────────────────────────────
  const INTELLIGENCES = {
    'Linguistik': {
      color: '#1abc9c',
      icon: '📝',
      description: 'Kecerdasan dalam menggunakan kata-kata dan bahasa',
      characteristics: [
        'Pandai berbicara dan menulis',
        'Senang membaca dan bercerita',
        'Mudah mengingat kata-kata dan informasi verbal',
        'Menikmati permainan kata dan teka-teki bahasa'
      ],
      careers: ['Penulis', 'Jurnalis', 'Pengacara', 'Guru Bahasa', 'Penyiar', 'Editor'],
      tips: [
        'Menulis jurnal atau blog',
        'Membaca berbagai jenis buku',
        'Ikut klub debat atau diskusi',
        'Belajar bahasa baru'
      ]
    },
    'Matematika Logis': {
      color: '#3498db',
      icon: '🔢',
      description: 'Kecerdasan dalam bernalar dan menghitung',
      characteristics: [
        'Berpikir secara logis dan analitis',
        'Senang memecahkan masalah matematis',
        'Mudah memahami pola dan hubungan',
        'Tertarik pada sains dan teknologi'
      ],
      careers: ['Ilmuwan', 'Programmer', 'Akuntan', 'Insinyur', 'Analis Data', 'Matematikawan'],
      tips: [
        'Bermain puzzle dan permainan logika',
        'Belajar coding atau pemrograman',
        'Eksperimen sains',
        'Main catur atau strategi game'
      ]
    },
    'Spasial': {
      color: '#9b59b6',
      icon: '🎨',
      description: 'Kecerdasan dalam visualisasi dan orientasi ruang',
      characteristics: [
        'Berpikir dalam gambar dan visualisasi',
        'Pandai menggambar dan mendesain',
        'Mudah membaca peta dan diagram',
        'Memiliki imajinasi visual yang kuat'
      ],
      careers: ['Arsitek', 'Desainer Grafis', 'Fotografer', 'Animator', 'Pilot', 'Seniman'],
      tips: [
        'Menggambar dan melukis',
        'Bermain dengan LEGO atau puzzle 3D',
        'Belajar desain grafis',
        'Fotografi dan videografi'
      ]
    },
    'Musikal': {
      color: '#f1c40f',
      icon: '🎵',
      description: 'Kecerdasan dalam memahami dan menciptakan musik',
      characteristics: [
        'Peka terhadap nada dan ritme',
        'Senang bernyanyi atau bermain alat musik',
        'Mudah mengingat melodi',
        'Dapat mengenali pola dalam musik'
      ],
      careers: ['Musisi', 'Penyanyi', 'Komposer', 'DJ', 'Guru Musik', 'Sound Engineer'],
      tips: [
        'Belajar alat musik',
        'Bergabung dengan paduan suara atau band',
        'Membuat musik atau komposisi',
        'Menghadiri konser dan pertunjukan'
      ]
    },
    'Kinestetik': {
      color: '#e67e22',
      icon: '⚽',
      description: 'Kecerdasan dalam menggunakan tubuh dan gerakan',
      characteristics: [
        'Terampil dalam aktivitas fisik',
        'Belajar melalui gerakan dan sentuhan',
        'Koordinasi tubuh yang baik',
        'Senang olahraga dan aktivitas hands-on'
      ],
      careers: ['Atlet', 'Penari', 'Aktor', 'Ahli Bedah', 'Koki', 'Mekanik', 'Pelatih Olahraga'],
      tips: [
        'Berolahraga secara teratur',
        'Ikut kelas tari atau seni bela diri',
        'Kerajinan tangan dan DIY projects',
        'Yoga atau aktivitas fisik lainnya'
      ]
    },
    'Interpersonal': {
      color: '#e74c3c',
      icon: '👥',
      description: 'Kecerdasan dalam memahami dan berinteraksi dengan orang lain',
      characteristics: [
        'Mudah bersosialisasi dan berkomunikasi',
        'Peka terhadap perasaan orang lain',
        'Pandai bekerja dalam tim',
        'Memiliki empati yang tinggi'
      ],
      careers: ['Psikolog', 'HR Manager', 'Sales', 'Guru', 'Konselor', 'Politisi', 'Customer Service'],
      tips: [
        'Ikut organisasi atau komunitas',
        'Volunteer untuk kegiatan sosial',
        'Latih kemampuan public speaking',
        'Belajar bahasa tubuh dan komunikasi'
      ]
    },
    'Intrapersonal': {
      color: '#34495e',
      icon: '🧘',
      description: 'Kecerdasan dalam memahami diri sendiri',
      characteristics: [
        'Memiliki kesadaran diri yang tinggi',
        'Reflektif dan introspektif',
        'Mandiri dalam belajar',
        'Memahami emosi dan motivasi diri'
      ],
      careers: ['Filosof', 'Penulis', 'Peneliti', 'Entrepreneur', 'Life Coach', 'Terapis'],
      tips: [
        'Menulis jurnal refleksi',
        'Meditasi dan mindfulness',
        'Menetapkan tujuan personal',
        'Self-assessment berkala'
      ]
    },
    'Naturalis': {
      color: '#27ae60',
      icon: '🌿',
      description: 'Kecerdasan dalam memahami alam dan lingkungan',
      characteristics: [
        'Peka terhadap alam dan lingkungan',
        'Senang mengamati flora dan fauna',
        'Peduli terhadap konservasi',
        'Mudah mengenali pola di alam'
      ],
      careers: ['Biolog', 'Botanis', 'Veteriner', 'Petani', 'Konservasionis', 'Geolog'],
      tips: [
        'Berkebun atau merawat tanaman',
        'Hiking dan eksplorasi alam',
        'Mengamati satwa liar',
        'Belajar tentang ekosistem'
      ]
    }
  };

  // Urutan grup kecerdasan majemuk (sesuai urutan soal di jawaban)
  const MI_GROUP_ORDER = [
    'Linguistik', 'Matematika Logis', 'Spasial',
    'Kinestetik', 'Musikal', 'Interpersonal', 'Intrapersonal', 'Naturalis'
  ];

  // ─────────────────────────────────────────────
  //  CONFIG AKSES DATA per tes
  // ─────────────────────────────────────────────
  const TES_CONFIG = {
    '01': {
      label: 'Gaya Belajar VAK',
      jawabanKeys: ['tes-gaya-belajar-vak', 'who_1'],
      errorMsg: 'Peserta ini belum mengerjakan Tes Gaya Belajar VAK.'
    },
    '02': {
      label: 'Dominasi Otak',
      jawabanKeys: ['input-tes-otak-kiri-&-kanan', 'who_2'],
      errorMsg: 'Peserta belum mengerjakan Tes Dominasi Otak.'
    },
    '03': {
      label: 'Kecerdasan Majemuk',
      jawabanKeys: ['input-tes-kecerdasan-majemuk', 'who_3'],
      errorMsg: 'Peserta belum mengerjakan Tes Kecerdasan Majemuk.'
    }
  };

  // ─────────────────────────────────────────────
  //  FETCH API
  // ─────────────────────────────────────────────
  async function fetchData(token) {
    const url = `https://lidan-co-id.pages.dev/api/contacts_filter_dinamis6?table=nilai1_json&x_01_eq=${token}`;
    const response = await fetch(url, { headers: { 'X-Custom-Auth': 'admin' } });
    const res = await response.json();
    if (!res.success || res.count === 0) throw new Error('DATA_NOT_FOUND');
    return res.data[0];
  }

  // ─────────────────────────────────────────────
  //  HELPER: ambil jawaban dari x_07
  // ─────────────────────────────────────────────
  function getJawaban(raw_x07, tesId) {
    const x07 = JSON.parse(raw_x07 || '{}');
    const keys = TES_CONFIG[tesId].jawabanKeys;
    for (const k of keys) {
      if (x07[k] !== undefined && x07[k] !== '') return x07[k];
    }
    return null;
  }

  // ─────────────────────────────────────────────
  //  SCORING PER TES
  // ─────────────────────────────────────────────
  function score01(jawabanStr) {
    const arr = jawabanStr.split(';').filter(v => v.trim() !== '');
    const skor = { A: 0, B: 0, C: 0 };
    arr.forEach(v => { if (skor[v] !== undefined) skor[v]++; });
    const total = arr.length || 15;
    const persentase = {
      A: Math.round((skor.A / total) * 100),
      B: Math.round((skor.B / total) * 100),
      C: Math.round((skor.C / total) * 100)
    };
    const dominant = Object.keys(skor).reduce((a, b) => skor[a] > skor[b] ? a : b);
    return {
      skor,
      persentase,
      dominant,
      config: LEARNING_STYLES[dominant],
      data: LEARNING_STYLES   // semua tipe (untuk chart lengkap)
    };
  }

  function score02(jawabanStr) {
    const arr = jawabanStr.split(';').filter(v => v !== '');
    let skorKiri = 0, skorKanan = 0;
    arr.forEach((v, i) => {
      if (i < 11) { if (v === 'A') skorKiri++; }
      else { if (v === 'A') skorKanan++; }
    });
    const total = skorKiri + skorKanan || 1;
    const persentase = {
      kiri: Math.round((skorKiri / total) * 100),
      kanan: Math.round((skorKanan / total) * 100)
    };
    let dominantKey;
    if (skorKiri === skorKanan) dominantKey = 'BALANCED';
    else dominantKey = skorKiri > skorKanan ? 'LEFT' : 'RIGHT';
    return {
      skor: { kiri: skorKiri, kanan: skorKanan },
      persentase,
      dominant: dominantKey,
      config: BRAIN_TYPES[dominantKey],
      data: BRAIN_TYPES
    };
  }

  function score03(jawabanStr) {
    const arr = jawabanStr.split(';').filter(v => v !== '');
    const scores = {};
    MI_GROUP_ORDER.forEach((name, gi) => {
      scores[name] = arr.slice(gi * 10, gi * 10 + 10).filter(v => v === 'A').length;
    });
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const dominantEntry = sorted[0];
    return {
      skor: scores,
      sorted,                            // [ [name, score], ... ] terurut descending
      dominant: dominantEntry[0],
      config: INTELLIGENCES[dominantEntry[0]],
      data: INTELLIGENCES                // semua tipe
    };
  }

  // ─────────────────────────────────────────────
  //  MAIN: load(tesId) → Promise<result>
  // ─────────────────────────────────────────────
  async function load(tesId) {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) throw new Error('NO_TOKEN');

    const raw = await fetchData(token);
    const dataDiri = JSON.parse(raw.x_02 || '{}');
    const jawabanStr = getJawaban(raw.x_07, tesId);

    if (!jawabanStr) throw new Error('NO_DATA_TES');

    let scoring;
    if (tesId === '01') scoring = score01(jawabanStr);
    else if (tesId === '02') scoring = score02(jawabanStr);
    else if (tesId === '03') scoring = score03(jawabanStr);
    else throw new Error('UNKNOWN_TES');

    return {
      tesId,
      label: TES_CONFIG[tesId].label,
      dataDiri,
      ...scoring
    };
  }

  // ─────────────────────────────────────────────
  //  ERROR MESSAGES (untuk ditampilkan di view)
  // ─────────────────────────────────────────────
  const ERROR_MESSAGES = {
    NO_TOKEN:       '❌ Token tidak ditemukan di URL',
    DATA_NOT_FOUND: '❌ Data tidak ditemukan. Token tidak valid.',
    NO_DATA_TES:    '⚠️ Peserta belum mengerjakan tes ini.',
    NETWORK:        '❌ Gagal terhubung ke server.',
    UNKNOWN_TES:    '❌ ID tes tidak dikenal.'
  };

  function getErrorMessage(errCode) {
    return ERROR_MESSAGES[errCode] || '❌ Terjadi kesalahan tidak dikenal.';
  }

  // ─────────────────────────────────────────────
  //  MAIN: loadAll() → Promise<{ dataDiri, tes: {...} }>
  //  Satu fetch, return semua tes yang tersedia
  // ─────────────────────────────────────────────
  async function loadAll() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (!token) throw new Error('NO_TOKEN');

    const raw = await fetchData(token);
    const dataDiri = JSON.parse(raw.x_02 || '{}');
    const tanggal  = raw.x_05;
    const tes = {};

    ['01', '02', '03'].forEach(tesId => {
      try {
        const jawabanStr = getJawaban(raw.x_07, tesId);
        if (!jawabanStr) return;
        let scoring;
        if (tesId === '01') scoring = score01(jawabanStr);
        else if (tesId === '02') scoring = score02(jawabanStr);
        else if (tesId === '03') scoring = score03(jawabanStr);
        tes[tesId] = { tesId, label: TES_CONFIG[tesId].label, dataDiri, tanggal, ...scoring };
      } catch(e) {
        console.warn(`Scoring tes ${tesId} gagal:`, e);
      }
    });

    return { dataDiri, tanggal, tes };
  }

  // ─────────────────────────────────────────────
  //  PUBLIC API
  // ─────────────────────────────────────────────
  return { load, loadAll, getErrorMessage, LEARNING_STYLES, BRAIN_TYPES, INTELLIGENCES };

})();