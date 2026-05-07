/**
 * karakter_engine.js
 * Berisi: semua data konfigurasi, fungsi fetch API, dan logika scoring
 * TIDAK mengandung HTML atau CSS — sepenuhnya di file view masing-masing.
 *
 * Cara pakai di file view:
 *   <script src="karakter_engine.js"></script>
 *   <script>
 *     KarakterEngine.load('06').then(result => { ... render sendiri ... });
 *   </script>
 *
 * Struktur result yang dikembalikan:
 *   {
 *     dataDiri   : { nama, usia, pendidikan, tgl_tes, ... }
 *     dominan    : 'A' | 'B' | 'C' | 'D' | 'EXTROVERT' | 'INTROVERT' | 'AMBIVERT' | ...
 *     config     : { name, color, icon, tagline, desc/description, traits/characteristics, careers, strengths, weaknesses, tips }
 *     skor       : objek skor mentah  { A: n, B: n, ... }
 *     persen     : objek persentase   { A: n, B: n, ... }
 *     total      : total soal
 *     tesId      : '04' | '05' | '06' | '07' | '08'
 *
 *     // Khusus tes 04 (temperamen):
 *     sortedSkor : [ ['A', n], ['B', n], ... ] urut dari tertinggi
 *
 *     // Khusus tes 05 (ekstrovert/introvert):
 *     markerPosition : persentase posisi marker spectrum (0–100)
 *   }
 */

const KarakterEngine = (() => {

  /* ===================================================
     API
  =================================================== */
  const API_BASE = 'https://lidan-co-id.pages.dev/api/contacts_filter_dinamis6';
  const API_HEADERS = { 'X-Custom-Auth': 'admin' };

  /* ===================================================
     DATA — TES 04: TEMPERAMEN
     Key jawaban : 'input-tes-temperamen' atau 'who_4'
     Opsi        : A B C D
     Total soal  : 26
  =================================================== */
  const TEMPERAMENTS = {
    A: {
      name: 'SANGUINIS',
      color: '#f1c40f',
      icon: '😄',
      tagline: 'Si Periang yang Populer',
      description: 'Ekstrovert, antusias, dan sosial. Suka menjadi pusat perhatian dan membuat orang lain senang.',
      characteristics: [
        'Ceria, optimis, dan penuh semangat',
        'Mudah bergaul dan populer',
        'Suka berbicara dan menghibur',
        'Spontan dan kreatif',
        'Tidak suka rutinitas yang membosankan',
        'Emosional dan ekspresif'
      ],
      strengths: [
        'Komunikator yang baik',
        'Memotivasi orang lain',
        'Mudah beradaptasi',
        'Antusiasme tinggi',
        'Kreatif dan inovatif'
      ],
      weaknesses: [
        'Kurang disiplin',
        'Mudah terdistraksi',
        'Tidak detail-oriented',
        'Terlalu banyak bicara',
        'Sulit menepati janji'
      ],
      careers: ['Sales & Marketing', 'Public Relations', 'Event Organizer', 'Entertainer', 'Presenter', 'Teacher'],
      tips: [
        'Buat to-do list untuk tetap fokus',
        'Latih kedisiplinan dan manajemen waktu',
        'Dengarkan lebih banyak, bicara seperlunya',
        'Selesaikan satu tugas sebelum mulai yang baru',
        'Catat janji dan komitmen penting'
      ]
    },
    B: {
      name: 'KOLERIS',
      color: '#e67e22',
      icon: '💪',
      tagline: 'Si Pemimpin yang Kuat',
      description: 'Ekstrovert, tegas, dan berorientasi pada tujuan. Suka memimpin dan mengambil keputusan.',
      characteristics: [
        'Tegas dan percaya diri',
        'Berorientasi pada hasil',
        'Suka tantangan dan kompetisi',
        'Pengambil keputusan yang cepat',
        'Produktif dan efisien',
        'Tidak sabaran dengan ketidakefisienan'
      ],
      strengths: [
        'Kepemimpinan alami',
        'Berani mengambil risiko',
        'Orientasi tujuan yang kuat',
        'Tegas dalam keputusan',
        'Produktivitas tinggi'
      ],
      weaknesses: [
        'Terlalu bossy',
        'Kurang sensitif',
        'Tidak sabaran',
        'Sulit menerima kritik',
        'Workaholic'
      ],
      careers: ['CEO/Manager', 'Entrepreneur', 'Politisi', 'Direktur', 'Pilot', 'Lawyer'],
      tips: [
        'Latih empati dan mendengarkan',
        'Beri apresiasi pada tim',
        'Kontrol kemarahan dan ketidaksabaran',
        'Delegasikan tugas, jangan micromanage',
        'Work-life balance sangat penting'
      ]
    },
    C: {
      name: 'MELANKOLIS',
      color: '#9b59b6',
      icon: '🤔',
      tagline: 'Si Pemikir yang Perfeksionis',
      description: 'Introvert, analitis, dan detail-oriented. Suka kesempurnaan dan kedalaman.',
      characteristics: [
        'Perfeksionis dan teliti',
        'Berpikir mendalam dan analitis',
        'Sensitif dan idealis',
        'Loyal dan setia',
        'Suka keteraturan dan struktur',
        'Cenderung pesimistis'
      ],
      strengths: [
        'Perhatian pada detail',
        'Analisis mendalam',
        'Standar tinggi',
        'Kreatif dan artistik',
        'Dapat diandalkan'
      ],
      weaknesses: [
        'Terlalu kritis',
        'Overthinking',
        'Perfeksionisme berlebihan',
        'Sulit puas',
        'Mudah depresi'
      ],
      careers: ['Scientist', 'Analyst', 'Artist', 'Writer', 'Programmer', 'Accountant'],
      tips: [
        'Terima bahwa kesempurnaan tidak selalu mungkin',
        'Jangan overthink, ambil action',
        'Fokus pada progress, bukan perfection',
        'Belajar menerima kritik konstruktif',
        'Kelola ekspektasi terhadap diri sendiri'
      ]
    },
    D: {
      name: 'PHLEGMATIS',
      color: '#3498db',
      icon: '😌',
      tagline: 'Si Pendamai yang Tenang',
      description: 'Introvert, tenang, dan damai. Suka harmoni dan menghindari konflik.',
      characteristics: [
        'Tenang dan sabar',
        'Pendamai dan diplomatik',
        'Pendengar yang baik',
        'Stabil dan konsisten',
        'Tidak suka konflik',
        'Santai dan easy-going'
      ],
      strengths: [
        'Kemampuan diplomasi',
        'Sabar dan tenang',
        'Pendengar yang baik',
        'Konsisten dan stabil',
        'Mudah bergaul'
      ],
      weaknesses: [
        'Kurang inisiatif',
        'Terlalu pasif',
        'Sulit membuat keputusan',
        'Menghindari konfrontasi',
        'Kurang ambisi'
      ],
      careers: ['Counselor', 'Mediator', 'HR', 'Customer Service', 'Nurse', 'Social Worker'],
      tips: [
        'Berani ambil inisiatif',
        'Jangan menghindari konflik yang perlu',
        'Tetapkan tujuan yang jelas',
        'Latih kemampuan decision making',
        'Keluar dari zona nyaman sesekali'
      ]
    }
  };

  /* ===================================================
     DATA — TES 05: EKSTROVERT vs INTROVERT
     Key jawaban : 'input-tes-extrovert-vs-introvert' atau 'who_5'
     Opsi        : A (Ekstrovert) | B (Introvert)
     Total soal  : 17
     Logika      : AMBIVERT jika |A - B| <= 3
  =================================================== */
  const PERSONALITY_TYPES = {
    EXTROVERT: {
      name: 'EKSTROVERT',
      color: '#e74c3c',
      icon: '🎉',
      tagline: 'Energi dari Dunia Luar',
      description: 'Anda mendapatkan energi dari interaksi sosial dan lingkungan eksternal. Anda cenderung outgoing, ekspresif, dan menikmati keramaian.',
      characteristics: [
        'Mendapat energi dari bersosialisasi',
        'Senang menjadi pusat perhatian',
        'Berbicara untuk berpikir (think out loud)',
        'Memiliki banyak teman dan kenalan',
        'Berani mengambil risiko sosial',
        'Merasa kesepian saat sendirian terlalu lama',
        'Suka bekerja dalam tim',
        'Ekspresif dan antusias'
      ],
      strengths: [
        'Komunikasi yang baik',
        'Networking luas',
        'Mudah beradaptasi sosial',
        'Antusiasme menular',
        'Kolaborasi tim'
      ],
      weaknesses: [],
      careers: ['Sales & Marketing', 'Event Manager', 'Public Relations', 'Teacher', 'Politician', 'Entertainer', 'HR Manager'],
      tips: [
        'Luangkan waktu untuk me-time sesekali',
        'Dengarkan lebih banyak, jangan mendominasi percakapan',
        'Belajar menikmati kesendirian',
        'Fokus pada kualitas hubungan, bukan kuantitas',
        'Latih kemampuan refleksi diri'
      ]
    },
    INTROVERT: {
      name: 'INTROVERT',
      color: '#34495e',
      icon: '📚',
      tagline: 'Energi dari Dunia Dalam',
      description: 'Anda mendapatkan energi dari waktu sendiri dan refleksi internal. Anda cenderung thoughtful, fokus, dan lebih nyaman dengan interaksi mendalam.',
      characteristics: [
        'Mendapat energi dari waktu sendirian',
        'Lebih suka percakapan mendalam daripada small talk',
        'Berpikir sebelum berbicara',
        'Memiliki lingkaran pertemanan kecil tapi dekat',
        'Butuh waktu untuk "recharge" setelah bersosialisasi',
        'Lebih suka mengamati daripada menjadi pusat perhatian',
        'Suka bekerja mandiri',
        'Reflektif dan thoughtful'
      ],
      strengths: [
        'Mendengarkan dengan baik',
        'Pemikiran mendalam',
        'Fokus dan konsentrasi tinggi',
        'Kemandirian',
        'Hubungan yang bermakna'
      ],
      weaknesses: [],
      careers: ['Writer', 'Programmer', 'Researcher', 'Accountant', 'Designer', 'Analyst', 'Librarian'],
      tips: [
        'Dorong diri untuk bersosialisasi secara teratur',
        'Jangan takut untuk speak up saat dibutuhkan',
        'Manfaatkan kekuatan mendengarkan Anda',
        'Cari teman yang menghargai kedalaman',
        'Keluar dari comfort zone dalam dosis kecil'
      ]
    },
    AMBIVERT: {
      name: 'AMBIVERT',
      color: '#9b59b6',
      icon: '⚖️',
      tagline: 'Seimbang di Antara Dua Dunia',
      description: 'Anda berada di tengah-tengah spektrum. Anda fleksibel dan dapat menyesuaikan diri baik dalam situasi sosial maupun saat sendirian.',
      characteristics: [
        'Fleksibel antara sosial dan solitude',
        'Bisa menikmati pesta maupun waktu sendiri',
        'Tidak terlalu ekstrem dalam preferensi',
        'Adaptif terhadap situasi',
        'Seimbang dalam ekspresi',
        'Networking yang strategis'
      ],
      strengths: [
        'Adaptabilitas tinggi',
        'Balanced perspective',
        'Fleksibilitas sosial',
        'Empati seimbang',
        'Versatilitas'
      ],
      weaknesses: [],
      careers: ['Project Manager', 'Consultant', 'Entrepreneur', 'Trainer', 'Negotiator'],
      tips: [
        'Manfaatkan fleksibilitas Anda',
        'Kenali kapan Anda butuh energi dari mana',
        'Jangan memaksakan diri ke salah satu ekstrem',
        'Gunakan kemampuan adaptasi sebagai kekuatan'
      ]
    }
  };

  /* ===================================================
     DATA — TES 06: SENSING vs INTUITIF
     Key jawaban : 'input-tes-sensori-vs-intuitif' atau 'who_6'
     Opsi        : A (Sensing) | B (Intuitif)
     Total soal  : dinamis (jumlah jawaban)
     Logika      : mayoritas
  =================================================== */
  const SENSING_TYPES = {
    A: {
      name: 'SENSING (S)',
      color: '#2980b9',
      icon: '🔍',
      tagline: 'Si Praktis yang Berorientasi Fakta',
      description: 'Sensing (S) artinya Anda cenderung memproses data dengan cara bersandar pada fakta yang nyata dan melihat data apa adanya. Anda adalah tipe yang percaya ketika melihat sesuatu hal atau kejadian secara langsung (melihat adalah percaya). Anda lebih nyaman dengan pengalaman langsung, menyentuh, dan berinteraksi dengan objek secara nyata sebelum mengambil kesimpulan.',
      characteristics: [
        'Fokus pada masa kini',
        'Menyukai detail & spesifik',
        'Praktis & Pragmatis',
        'Belajar dari pengalaman',
        'Menyukai prosedur jelas'
      ],
      strengths: [],
      weaknesses: [],
      careers: ['Akuntan', 'Teknisi', 'Tenaga Medis', 'Polisi/Militer', 'Manajemen Operasional'],
      tips: []
    },
    B: {
      name: 'INTUITIF (N)',
      color: '#8e44ad',
      icon: '✨',
      tagline: 'Si Imajinatif yang Berorientasi Kemungkinan',
      description: 'Intuitive (N) artinya Anda cenderung memproses data dengan melihat pola, impresi, serta berbagai kemungkinan yang bisa terjadi di masa depan. Bagi Anda, fakta hanyalah titik awal; perasaan (feeling), kesan, dan "vibe" menjadi bahan pertimbangan yang lebih dominan dalam mengambil keputusan. Anda lebih percaya pada intuisi atau "feel" yang Anda rasakan.',
      characteristics: [
        'Fokus pada masa depan',
        'Melihat gambaran besar',
        'Imajinatif & Teoritis',
        'Menyukai inovasi',
        'Berpikir abstrak'
      ],
      strengths: [],
      weaknesses: [],
      careers: ['Penulis/Seniman', 'Psikolog', 'Strategis Bisnis', 'Peneliti', 'Desainer Konseptual'],
      tips: []
    }
  };

  /* ===================================================
     DATA — TES 07: THINKING vs FEELING
     Key jawaban : 'input-tes-thinking-vs-feeling' atau 'who_7'
     Opsi        : A (Thinking) | B (Feeling)
     Total soal  : 20
     Logika      : mayoritas (A >= B → Thinking)
  =================================================== */
  const DECISION_TYPES = {
    THINKING: {
      name: 'THINKING (PEMIKIR)',
      color: '#2980b9',
      icon: '🧠',
      tagline: 'Keputusan Berdasarkan Logika',
      description: 'Anda membuat keputusan berdasarkan analisis objektif, logika, dan kebenaran. Anda mengutamakan konsistensi dan keadilan dalam pengambilan keputusan.',
      characteristics: [
        'Mengutamakan logika dan rasionalitas',
        'Objektif dalam menilai situasi',
        'Fokus pada kebenaran dan fakta',
        'Menganalisis pro dan kontra',
        'Tegas dan direct dalam komunikasi',
        'Menjaga jarak emosional saat memutuskan',
        'Menghargai kompetensi dan keahlian',
        'Konsisten dengan prinsip'
      ],
      strengths: [
        'Analisis objektif',
        'Keputusan yang fair',
        'Critical thinking',
        'Ketegasan',
        'Konsistensi logika'
      ],
      weaknesses: [
        'Kurang sensitif terhadap perasaan',
        'Terkesan dingin atau keras',
        'Terlalu kritis',
        'Sulit berempati',
        'Mengabaikan aspek emosional'
      ],
      careers: ['Engineer', 'Programmer', 'Analyst', 'Lawyer', 'Scientist', 'Financial Planner', 'Manager', 'Auditor'],
      tips: [
        'Pertimbangkan dampak emosional keputusan Anda',
        'Latih empati dan kepekaan terhadap perasaan orang lain',
        'Berikan apresiasi, bukan hanya kritik',
        'Komunikasi dengan lebih lembut saat diperlukan',
        'Ingat bahwa perasaan juga valid dalam keputusan'
      ]
    },
    FEELING: {
      name: 'FEELING (PERASA)',
      color: '#e91e63',
      icon: '❤️',
      tagline: 'Keputusan Berdasarkan Nilai & Empati',
      description: 'Anda membuat keputusan berdasarkan nilai-nilai personal, empati, dan dampak terhadap orang lain. Anda mengutamakan harmoni dan kesejahteraan dalam pengambilan keputusan.',
      characteristics: [
        'Mengutamakan nilai dan empati',
        'Mempertimbangkan dampak terhadap orang lain',
        'Fokus pada harmoni dan kesejahteraan',
        'Subjektif berdasarkan nilai personal',
        'Diplomatik dalam komunikasi',
        'Terhubung emosional dengan situasi',
        'Menghargai hubungan dan perasaan',
        'Fleksibel sesuai konteks personal'
      ],
      strengths: [
        'Empati tinggi',
        'Membangun hubungan',
        'Kepekaan emosional',
        'Diplomasi',
        'Menciptakan harmoni'
      ],
      weaknesses: [
        'Terlalu subjektif',
        'Sulit bersikap tegas',
        'Mudah terpengaruh emosi',
        'Menghindari konflik penting',
        'Keputusan kurang objektif'
      ],
      careers: ['Counselor', 'HR Professional', 'Teacher', 'Social Worker', 'Nurse', 'Customer Service', 'Mediator', 'Psychologist'],
      tips: [
        'Jangan takut membuat keputusan sulit',
        'Latih objektivitas dalam analisis',
        'Tidak semua konflik perlu dihindari',
        'Seimbangkan empati dengan logika',
        'Belajar mengatakan "tidak" saat perlu'
      ]
    }
  };

  /* ===================================================
     DATA — TES 08: JUDGING (PENILAI) vs PERCEIVING (PENGAMAT)
     Key jawaban : 'input-tes-pengamat-vs-penilai' atau 'who_8'
     Opsi        : A (Judging) | B (Perceiving)
     Total soal  : 10
     Logika      : mayoritas (A > B → Judging)
  =================================================== */
  const LIFESTYLE_TYPES = {
    JUDGING: {
      name: 'JUDGING (PENILAI)',
      color: '#27ae60',
      icon: '📋',
      tagline: 'Terencana & Terorganisir',
      description: 'Anda menyukai struktur, perencanaan, dan keputusan yang cepat. Anda merasa nyaman dengan jadwal dan rutinitas yang jelas.',
      characteristics: [
        'Suka membuat rencana dan jadwal',
        'Terorganisir dan tertib',
        'Menyelesaikan tugas lebih awal',
        'Membuat keputusan dengan cepat',
        'Suka closure dan penyelesaian',
        'Rutinitas yang konsisten',
        'Disiplin dan tepat waktu',
        'Goal-oriented'
      ],
      strengths: [
        'Manajemen waktu baik',
        'Produktivitas tinggi',
        'Keandalan',
        'Kedisiplinan',
        'Pencapaian target'
      ],
      weaknesses: [
        'Kaku terhadap perubahan',
        'Stres jika rencana berubah',
        'Terlalu perfeksionis',
        'Kurang spontan',
        'Sulit beradaptasi'
      ],
      careers: ['Project Manager', 'Administrator', 'Accountant', 'Executive', 'Operations Manager', 'Event Planner', 'Quality Assurance'],
      tips: [
        'Belajar untuk lebih fleksibel',
        'Terima bahwa tidak semua harus sempurna',
        'Beri ruang untuk spontanitas',
        'Jangan terlalu keras pada diri sendiri',
        'Nikmati prosesnya, bukan hanya hasil'
      ]
    },
    PERCEIVING: {
      name: 'PERCEIVING (PENGAMAT)',
      color: '#e67e22',
      icon: '🎈',
      tagline: 'Fleksibel & Spontan',
      description: 'Anda menyukai fleksibilitas, spontanitas, dan pilihan yang terbuka. Anda merasa nyaman dengan ketidakpastian dan perubahan.',
      characteristics: [
        'Fleksibel dan adaptif',
        'Spontan dan improvisasi',
        'Suka menjaga pilihan tetap terbuka',
        'Bekerja dengan deadline',
        'Santai terhadap jadwal',
        'Eksplorasi berbagai kemungkinan',
        'Multitasking',
        'Process-oriented'
      ],
      strengths: [
        'Adaptabilitas tinggi',
        'Kreativitas',
        'Keterbukaan pikiran',
        'Fleksibilitas',
        'Handle perubahan dengan baik'
      ],
      weaknesses: [
        'Prokrastinasi',
        'Kurang terorganisir',
        'Sering terlambat',
        'Sulit menyelesaikan',
        'Impulsif'
      ],
      careers: ['Creative Director', 'Entrepreneur', 'Journalist', 'Artist', 'Researcher', 'Consultant', 'Freelancer'],
      tips: [
        'Tetapkan deadline pribadi',
        'Gunakan to-do list sederhana',
        'Belajar prioritisasi',
        'Hindari prokrastinasi berlebihan',
        'Selesaikan satu hal sebelum mulai yang baru'
      ]
    }
  };

  /* ===================================================
     KONFIGURASI PER TES
     Mendefinisikan: key jawaban, total soal, cara scoring
  =================================================== */
  const TES_CONFIG = {
    '04': {
      label: 'Temperamen',
      keys: ['input-tes-temperamen', 'who_4'],
      total: 26,
      opsi: ['A', 'B', 'C', 'D'],
      score(jawabanArr) {
        const skor = { A: 0, B: 0, C: 0, D: 0 };
        jawabanArr.forEach(v => { if (skor[v] !== undefined) skor[v]++; });
        const dominan = Object.keys(skor).reduce((a, b) => skor[a] > skor[b] ? a : b);
        const total = this.total;
        const persen = {};
        Object.keys(skor).forEach(k => { persen[k] = Math.round((skor[k] / total) * 100); });
        const sortedSkor = Object.entries(skor).sort((a, b) => b[1] - a[1]);
        return { skor, persen, dominan, total, sortedSkor, config: TEMPERAMENTS[dominan] };
      }
    },
    '05': {
      label: 'Ekstrovert vs Introvert',
      keys: ['input-tes-extrovert-vs-introvert', 'who_5'],
      total: 17,
      opsi: ['A', 'B'],
      score(jawabanArr) {
        const skor = { A: 0, B: 0 };
        jawabanArr.forEach(v => { if (skor[v] !== undefined) skor[v]++; });
        const total = this.total;
        const persen = {
          A: Math.round((skor.A / total) * 100),
          B: Math.round((skor.B / total) * 100)
        };
        const selisih = Math.abs(skor.A - skor.B);
        let dominan;
        if (selisih <= 3) dominan = 'AMBIVERT';
        else if (skor.A > skor.B) dominan = 'EXTROVERT';
        else dominan = 'INTROVERT';
        const markerPosition = Math.round((skor.A / total) * 100);
        return { skor, persen, dominan, total, markerPosition, config: PERSONALITY_TYPES[dominan] };
      }
    },
    '06': {
      label: 'Sensing vs Intuitif',
      keys: ['input-tes-sensori-vs-intuitif', 'who_6'],
      total: null, // dinamis
      opsi: ['A', 'B'],
      score(jawabanArr) {
        const skor = { A: 0, B: 0 };
        jawabanArr.forEach(v => { if (skor[v] !== undefined) skor[v]++; });
        const total = skor.A + skor.B;
        const persen = {
          A: Math.round((skor.A / total) * 100),
          B: Math.round((skor.B / total) * 100)
        };
        const dominan = skor.A >= skor.B ? 'A' : 'B';
        return { skor, persen, dominan, total, config: SENSING_TYPES[dominan] };
      }
    },
    '07': {
      label: 'Thinking vs Feeling',
      keys: ['input-tes-thinking-vs-feeling', 'who_7'],
      total: 20,
      opsi: ['A', 'B'],
      score(jawabanArr) {
        const skor = { A: 0, B: 0 };
        jawabanArr.forEach(v => { if (skor[v] !== undefined) skor[v]++; });
        const total = this.total;
        const persen = {
          A: Math.round((skor.A / total) * 100),
          B: Math.round((skor.B / total) * 100)
        };
        const dominan = skor.A >= skor.B ? 'THINKING' : 'FEELING';
        const markerPosition = Math.round((skor.A / total) * 100);
        return { skor, persen, dominan, total, markerPosition, config: DECISION_TYPES[dominan] };
      }
    },
    '08': {
      label: 'Judging vs Perceiving',
      keys: ['input-tes-pengamat-vs-penilai', 'who_8'],
      total: 10,
      opsi: ['A', 'B'],
      score(jawabanArr) {
        const skor = { A: 0, B: 0 };
        jawabanArr.forEach(v => { if (skor[v] !== undefined) skor[v]++; });
        const total = this.total;
        const persen = {
          A: Math.round((skor.A / total) * 100),
          B: Math.round((skor.B / total) * 100)
        };
        const dominan = skor.A > skor.B ? 'JUDGING' : 'PERCEIVING';
        const markerPosition = Math.round((skor.A / total) * 100);
        return { skor, persen, dominan, total, markerPosition, config: LIFESTYLE_TYPES[dominan] };
      }
    }
  };

  /* ===================================================
     FUNGSI INTERNAL: ambil rawJawaban dari data API
  =================================================== */
  function _getRawJawaban(x07, keys) {
    for (const key of keys) {
      if (x07[key] !== undefined) return x07[key];
    }
    return '';
  }

  /* ===================================================
     FUNGSI UTAMA: load(tesId)
     Mengembalikan Promise<result> atau Promise<{error: string}>
  =================================================== */
  async function load(tesId) {
    const cfg = TES_CONFIG[tesId];
    if (!cfg) return Promise.reject({ error: `TES ID "${tesId}" tidak dikenal.` });

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) return Promise.reject({ error: 'Token tidak ditemukan di URL.' });

    let rawData;
    try {
      const res = await fetch(
        `${API_BASE}?table=nilai1_json&x_01_eq=${encodeURIComponent(token)}`,
        { headers: API_HEADERS }
      );
      const json = await res.json();
      if (!json.success || !json.data || json.data.length === 0) {
        return Promise.reject({ error: 'Data tidak ditemukan. Token tidak valid atau sudah kadaluarsa.' });
      }
      rawData = json.data[0];
    } catch (e) {
      return Promise.reject({ error: 'Terjadi kesalahan koneksi ke server.' });
    }

    const dataDiri = JSON.parse(rawData.x_02 || '{}');
    const x07 = JSON.parse(rawData.x_07 || '{}');
    const rawJawaban = _getRawJawaban(x07, cfg.keys);

    if (!rawJawaban) {
      return Promise.reject({
        error: `Peserta belum mengerjakan Tes ${cfg.label}.`,
        dataDiri
      });
    }

    const jawabanArr = rawJawaban.split(';').filter(v => v !== '');
    const hasil = cfg.score(jawabanArr);

    return {
      tesId,
      dataDiri,
      ...hasil
    };
  }

  /* ===================================================
     EKSPOR DATA (opsional — bisa diakses dari view jika perlu)
  =================================================== */
  return {
    load,
    // Data mentah tersedia jika view butuh referensi silang
    data: {
      TEMPERAMENTS,
      PERSONALITY_TYPES,
      SENSING_TYPES,
      DECISION_TYPES,
      LIFESTYLE_TYPES
    }
  };

})();
