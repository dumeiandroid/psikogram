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
      description: 'Anda belajar paling efektif dengan melihat {dan|serta} mengamati',
      characteristics: [
        '{Lebih mudah|Lebih gampang} mengingat apa yang dilihat daripada yang didengar',
        '{Suka|Senang|Gemar} menggunakan diagram, grafik, {dan|serta} gambar saat belajar',
        'Mengingat wajah lebih baik daripada nama',
        '{Lebih suka|Lebih senang|Lebih memilih} membaca instruksi daripada mendengarkan penjelasan',
        '{Sering|Kerap|Acap kali} membuat catatan visual atau mind map'
      ],
      tips: [
        '{Gunakan|Manfaatkan|Pakai} highlighter warna-warni saat membaca',
        '{Buat|Susun|Bikin} diagram, flowchart, atau mind mapping',
        'Tonton video pembelajaran atau tutorial visual',
        '{Gunakan|Manfaatkan|Pakai} flashcard dengan gambar',
        'Visualisasikan konsep dalam bentuk gambar mental'
      ]
    },
    B: {
      name: 'AUDITORY',
      color: '#f39c12',
      icon: '👂',
      description: 'Anda belajar paling efektif dengan mendengar {dan|serta} berbicara',
      characteristics: [
        '{Lebih mudah|Lebih gampang} mengingat apa yang didengar daripada yang dilihat',
        '{Suka|Senang|Gemar} berdiskusi {dan|serta} menjelaskan materi kepada orang lain',
        'Mengingat nama lebih baik daripada wajah',
        '{Lebih suka|Lebih senang|Lebih memilih} mendengarkan penjelasan daripada membaca',
        '{Sering|Kerap|Acap kali} berbicara sendiri saat berpikir atau menghafal'
      ],
      tips: [
        'Rekam penjelasan materi {dan|serta} dengarkan ulang',
        'Diskusikan materi dengan teman atau kelompok belajar',
        'Bacalah materi dengan suara keras',
        '{Gunakan|Manfaatkan|Pakai} musik instrumental saat belajar',
        'Jelaskan kembali materi yang dipelajari kepada orang lain'
      ]
    },
    C: {
      name: 'KINESTETIK',
      color: '#2ecc71',
      icon: '🤸',
      description: 'Anda belajar paling efektif melalui gerakan {dan|serta} pengalaman langsung',
      characteristics: [
        '{Lebih mudah|Lebih gampang} memahami materi melalui praktik langsung',
        '{Suka|Senang|Gemar} bergerak {dan|serta} tidak bisa duduk diam terlalu lama',
        '{Belajar|Latih diri} lebih baik melalui eksperimen {dan|serta} praktik',
        'Mengingat lebih baik melalui aktivitas fisik'
      ],
      tips: [
        'Praktikkan langsung apa yang dipelajari',
        '{Gunakan|Manfaatkan|Pakai} alat peraga atau model fisik',
        '{Buat|Susun|Bikin} eksperimen atau simulasi',
        'Berjalan atau bergerak saat menghafalkan',
        '{Gunakan|Manfaatkan|Pakai} role play untuk memahami konsep',
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
      description: 'Anda memiliki kecenderungan berpikir secara Logis, Analitis, {dan|serta} Terstruktur.',
      characteristics: [
        'Berpikir logis {dan|serta} sistematis',
        '{Suka|Senang|Gemar} hal terstruktur',
        'Pandai matematika/sains',
        'Kemampuan verbal baik',
        'Realistis & praktis',
        '{Suka|Senang|Gemar} detail {dan|serta} fakta'
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
        '{Buat|Susun|Bikin} jadwal terstruktur',
        '{Gunakan|Manfaatkan|Pakai} metode analisis langkah-demi-langkah',
        'Fokus pada fakta konkret',
        '{Latih|Asah|Kembangkan} kreativitas untuk keseimbangan'
      ]
    },
    RIGHT: {
      name: 'OTAK KANAN',
      color: '#e74c3c',
      icon: '🎨',
      description: 'Anda memiliki kecenderungan berpikir secara Kreatif, Intuitif, {dan|serta} Imajinatif.',
      characteristics: [
        'Berpikir kreatif {dan|serta} imajinatif',
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
        '{Gunakan|Manfaatkan|Pakai} mind mapping',
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
        '{Mampu|Sanggup|Bisa} beralih antara logika {dan|serta} kreativitas',
        '{Sangat|Amat} adaptif dalam berbagai situasi',
        'Mempertimbangkan fakta {dan|serta} perasaan',
        'Multitasking teknis {dan|serta} artistik',
        'Melihat masalah dari berbagai sudut pandang'
      ],
      strengths: [
        'Fleksibilitas kognitif',
        'Manajemen proyek kompleks',
        'Komunikasi empatik namun logis',
        'Kemampuan belajar cepat',
        'Harmonisasi visi besar {dan|serta} detail'
      ],
      careers: ['Project Manager', 'Sutradara', 'Wirausahawan', 'Konsultan Strategis', 'Editor Film', 'Psikolog'],
      tips: [
        'Jadilah jembatan antara tim kreatif {dan|serta} teknis',
        'Waspadai keraguan karena terlalu banyak pertimbangan',
        '{Latih|Asah|Kembangkan} pengambilan keputusan cepat',
        '{Gunakan|Manfaatkan|Pakai} kedua sisi otak secara sadar'
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
      description: 'Kecerdasan dalam menggunakan kata-kata {dan|serta} bahasa',
      characteristics: [
        'Pandai berbicara {dan|serta} menulis',
        'Senang membaca {dan|serta} bercerita',
        '{Mudah|Gampang} mengingat kata-kata {dan|serta} informasi verbal',
        'Menikmati permainan kata {dan|serta} teka-teki bahasa'
      ],
      careers: ['Penulis', 'Jurnalis', 'Pengacara', 'Guru Bahasa', 'Penyiar', 'Editor'],
      tips: [
        'Menulis jurnal atau blog',
        'Membaca berbagai jenis buku',
        'Ikut klub debat atau diskusi',
        '{Belajar|Latih diri} bahasa baru'
      ]
    },
    'Matematika Logis': {
      color: '#3498db',
      icon: '🔢',
      description: 'Kecerdasan dalam bernalar {dan|serta} menghitung',
      characteristics: [
        'Berpikir secara logis {dan|serta} analitis',
        'Senang memecahkan masalah matematis',
        '{Mudah|Gampang} memahami pola {dan|serta} hubungan',
        'Tertarik pada sains {dan|serta} teknologi'
      ],
      careers: ['Ilmuwan', 'Programmer', 'Akuntan', 'Insinyur', 'Analis Data', 'Matematikawan'],
      tips: [
        'Bermain puzzle {dan|serta} permainan logika',
        '{Belajar|Latih diri} coding atau pemrograman',
        'Eksperimen sains',
        'Main catur atau strategi game'
      ]
    },
    'Spasial': {
      color: '#9b59b6',
      icon: '🎨',
      description: 'Kecerdasan dalam visualisasi {dan|serta} orientasi ruang',
      characteristics: [
        'Berpikir dalam gambar {dan|serta} visualisasi',
        'Pandai menggambar {dan|serta} mendesain',
        '{Mudah|Gampang} membaca peta {dan|serta} diagram',
        '{Memiliki|Mempunyai} imajinasi visual yang kuat'
      ],
      careers: ['Arsitek', 'Desainer Grafis', 'Fotografer', 'Animator', 'Pilot', 'Seniman'],
      tips: [
        'Menggambar {dan|serta} melukis',
        'Bermain dengan LEGO atau puzzle 3D',
        '{Belajar|Latih diri} desain grafis',
        'Fotografi {dan|serta} videografi'
      ]
    },
    'Musikal': {
      color: '#f1c40f',
      icon: '🎵',
      description: 'Kecerdasan dalam memahami {dan|serta} menciptakan musik',
      characteristics: [
        'Peka terhadap nada {dan|serta} ritme',
        'Senang bernyanyi atau bermain alat musik',
        '{Mudah|Gampang} mengingat melodi',
        'Dapat mengenali pola dalam musik'
      ],
      careers: ['Musisi', 'Penyanyi', 'Komposer', 'DJ', 'Guru Musik', 'Sound Engineer'],
      tips: [
        '{Belajar|Latih diri} alat musik',
        'Bergabung dengan paduan suara atau band',
        'Membuat musik atau komposisi',
        'Menghadiri konser {dan|serta} pertunjukan'
      ]
    },
    'Kinestetik': {
      color: '#e67e22',
      icon: '⚽',
      description: 'Kecerdasan dalam menggunakan tubuh {dan|serta} gerakan',
      characteristics: [
        'Terampil dalam aktivitas fisik',
        '{Belajar|Latih diri} melalui gerakan {dan|serta} sentuhan',
        'Koordinasi tubuh {yang baik|yang mumpuni|yang solid}',
        'Senang olahraga {dan|serta} aktivitas hands-on'
      ],
      careers: ['Atlet', 'Penari', 'Aktor', 'Ahli Bedah', 'Koki', 'Mekanik', 'Pelatih Olahraga'],
      tips: [
        'Berolahraga secara teratur',
        'Ikut kelas tari atau seni bela diri',
        'Kerajinan tangan {dan|serta} DIY projects',
        'Yoga atau aktivitas fisik lainnya'
      ]
    },
    'Interpersonal': {
      color: '#e74c3c',
      icon: '👥',
      description: 'Kecerdasan dalam memahami {dan|serta} berinteraksi dengan orang lain',
      characteristics: [
        '{Mudah|Gampang} bersosialisasi {dan|serta} berkomunikasi',
        'Peka terhadap perasaan orang lain',
        'Pandai bekerja dalam tim',
        '{Memiliki|Mempunyai} empati yang tinggi'
      ],
      careers: ['Psikolog', 'HR Manager', 'Sales', 'Guru', 'Konselor', 'Politisi', 'Customer Service'],
      tips: [
        'Ikut organisasi atau komunitas',
        'Volunteer untuk kegiatan sosial',
        '{Latih|Asah|Kembangkan} kemampuan public speaking',
        '{Belajar|Latih diri} bahasa tubuh {dan|serta} komunikasi'
      ]
    },
    'Intrapersonal': {
      color: '#34495e',
      icon: '🧘',
      description: 'Kecerdasan dalam memahami diri sendiri',
      characteristics: [
        '{Memiliki|Mempunyai} kesadaran diri yang tinggi',
        'Reflektif {dan|serta} introspektif',
        'Mandiri dalam belajar',
        'Memahami emosi {dan|serta} motivasi diri'
      ],
      careers: ['Filosof', 'Penulis', 'Peneliti', 'Entrepreneur', 'Life Coach', 'Terapis'],
      tips: [
        'Menulis jurnal refleksi',
        'Meditasi {dan|serta} mindfulness',
        'Menetapkan tujuan personal',
        'Self-assessment berkala'
      ]
    },
    'Naturalis': {
      color: '#27ae60',
      icon: '🌿',
      description: 'Kecerdasan dalam memahami alam {dan|serta} lingkungan',
      characteristics: [
        'Peka terhadap alam {dan|serta} lingkungan',
        'Senang mengamati flora {dan|serta} fauna',
        'Peduli terhadap konservasi',
        '{Mudah|Gampang} mengenali pola di alam'
      ],
      careers: ['Biolog', 'Botanis', 'Veteriner', 'Petani', 'Konservasionis', 'Geolog'],
      tips: [
        'Berkebun atau merawat tanaman',
        'Hiking {dan|serta} eksplorasi alam',
        'Mengamati satwa liar',
        '{Belajar|Latih diri} tentang ekosistem'
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
    // A = otak kiri, B = otak kanan (sesuai logika transfer)
    arr.forEach(v => {
      if (v === 'A') skorKiri++;
      else if (v === 'B') skorKanan++;
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