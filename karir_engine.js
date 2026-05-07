/**
 * karir_engine.js
 * Engine data-only untuk tes karir (20–27).
 * Berisi: konfigurasi data, fungsi fetch API, dan logika scoring.
 * HTML & CSS sepenuhnya di file view masing-masing.
 *
 * Cara pakai di xxview.html:
 *   <script src="karir_engine.js"></script>
 *   <script>
 *     KarirEngine.load('21').then(result => { /* render pakai result *\/ });
 *   </script>
 *
 * result yang dikembalikan:
 *   { dataDiri, tanggal, result, skor, ... }  ← berbeda tiap tes, lihat detail bawah
 */

const KarirEngine = (() => {

  // ─── API ─────────────────────────────────────────────────────────────────
  const API_BASE = 'https://lidan-co-id.pages.dev/api/contacts_filter_dinamis6';
  const API_HEADERS = { 'X-Custom-Auth': 'admin' };

  // ─── DATA TES 20 — RIASEC Minat Karier ───────────────────────────────────
  const RIASEC_CATEGORIES = [
    {
      id: 'R', name: 'Realistic', color: '#e74c3c',
      desc: 'Menyukai pekerjaan praktis, hands-on, dan teknis. Lebih suka bekerja dengan alat, mesin, atau objek fisik daripada berinteraksi dengan orang.',
      careers: ['Teknisi', 'Mekanik', 'Insinyur', 'Arsitek', 'Pilot', 'Petani', 'Atlet']
    },
    {
      id: 'I', name: 'Investigative', color: '#3498db',
      desc: 'Analitis, ingin tahu, dan intelektual. Menyukai riset, sains, dan memecahkan masalah kompleks melalui pemikiran kritis.',
      careers: ['Ilmuwan', 'Peneliti', 'Dokter', 'Analis Data', 'Programmer', 'Ahli Kimia', 'Psikolog']
    },
    {
      id: 'A', name: 'Artistic', color: '#9b59b6',
      desc: 'Kreatif, ekspresif, dan intuitif. Menyukai pekerjaan yang tidak terstruktur, orisinal, dan memungkinkan ekspresi diri.',
      careers: ['Desainer', 'Musisi', 'Penulis', 'Seniman', 'Fotografer', 'Aktor', 'Animator']
    },
    {
      id: 'S', name: 'Social', color: '#2ecc71',
      desc: 'Ramah, membantu, dan empatik. Senang mengajar, merawat, dan bekerja sama dengan orang lain untuk membantu mereka berkembang.',
      careers: ['Guru', 'Perawat', 'Konselor', 'Pekerja Sosial', 'HR Manager', 'Psikolog Klinis', 'Terapis']
    },
    {
      id: 'E', name: 'Enterprising', color: '#f1c40f',
      desc: 'Ambisius, persuasif, dan berjiwa pemimpin. Tertarik pada bisnis, politik, dan mempengaruhi atau memimpin orang lain.',
      careers: ['Pengusaha', 'Manajer', 'Sales Executive', 'Lawyer', 'Politisi', 'Marketing Director', 'CEO']
    },
    {
      id: 'C', name: 'Conventional', color: '#95a5a6',
      desc: 'Teratur, teliti, dan menyukai data. Senang dengan rutinitas, administrasi, detail, dan aturan yang jelas.',
      careers: ['Akuntan', 'Admin', 'Auditor', 'Kasir', 'Data Entry', 'Sekretaris', 'Analis Keuangan']
    }
  ];

  // Saran pengembangan karier (generik, dipakai di 20view)
  const RIASEC_SUGGESTIONS = [
    'Eksplorasi karier yang sesuai dengan kode RIASEC Anda - cari informasi lebih detail tentang profesi-profesi tersebut',
    'Kembangkan skill yang relevan dengan tipe dominan Anda melalui kursus, pelatihan, atau proyek pribadi',
    'Cari mentor atau role model yang bekerja di bidang yang sesuai dengan profil minat Anda',
    'Ikuti magang atau volunteer di organisasi yang terkait dengan minat karier Anda untuk pengalaman praktis',
    'Gabungkan ketiga tipe teratas Anda untuk menemukan niche karier yang unik dan cocok untuk Anda',
    'Pertimbangkan untuk mengambil tes minat karier yang lebih komprehensif dengan konselor karier profesional',
    'Networking dengan profesional di bidang yang Anda minati melalui LinkedIn atau acara industri',
    'Terus evaluasi dan update profil karier Anda seiring dengan perkembangan minat dan pengalaman'
  ];

  // ─── DATA TES 21 — Jiwa Kepemimpinan ─────────────────────────────────────
  // Scoring: jumlah semua nilai jawaban (numerik). Skor rendah = pemimpin kuat.
  const KEPEMIMPINAN_LEVELS = [
    {
      maxSkor: 9,
      title: 'Pemimpin yang Kuat', color: '#27ae60', icon: '⭐',
      description: 'Luar biasa! Anda memiliki jiwa kepemimpinan yang sangat kuat. Anda adalah komunikator yang tegas, dapat diandalkan, dan mampu memberikan dampak positif bagi lingkungan sekitar. Orang-orang mempercayai dan mengikuti arahan Anda.',
      characteristics: [
        'Komunikasi yang jelas, tegas, dan efektif dalam menyampaikan visi',
        'Kemampuan pengambilan keputusan yang cepat dan tepat',
        'Karisma natural yang membuat orang lain tertarik mengikuti',
        'Integritas tinggi dan konsisten antara perkataan dan tindakan',
        'Kemampuan memotivasi dan menginspirasi tim',
        'Berani mengambil tanggung jawab dan risiko yang terukur',
        'Visioner dengan kemampuan melihat gambaran besar',
        'Empati dan kepedulian terhadap anggota tim'
      ],
      suggestions: [
        'Terus kembangkan skill kepemimpinan dengan membaca buku, mengikuti training, dan belajar dari pemimpin hebat lainnya',
        'Jadilah mentor bagi orang lain - bagikan pengetahuan dan pengalaman kepemimpinan Anda',
        'Ambil tanggung jawab kepemimpinan yang lebih besar dalam organisasi Anda',
        'Jaga kerendahan hati - pemimpin hebat tetap humble dan terus belajar',
        'Kembangkan emotional intelligence untuk memahami dan memimpin dengan lebih baik',
        'Bangun networking dengan pemimpin lain untuk saling belajar dan berkembang',
        'Fokus pada pemberdayaan tim, bukan hanya mengambil kendali semua hal',
        'Evaluasi diri secara berkala untuk terus meningkatkan efektivitas kepemimpinan'
      ]
    },
    {
      maxSkor: 20,
      title: 'Pemimpin yang Baik', color: '#2980b9', icon: '👍',
      description: 'Bagus! Anda memiliki kualitas kepemimpinan yang baik. Anda mampu mendengarkan orang lain dan memimpin mereka menuju satu tujuan bersama. Dengan sedikit pengembangan, Anda bisa menjadi pemimpin yang sangat efektif.',
      characteristics: [
        'Kemampuan komunikasi yang baik, meskipun kadang perlu lebih tegas',
        'Mampu mendengarkan dan mempertimbangkan input dari tim',
        'Cukup percaya diri dalam mengambil keputusan',
        'Memiliki visi yang jelas meski kadang perlu lebih detail',
        'Dapat membangun hubungan baik dengan anggota tim',
        'Berani mengambil inisiatif dalam situasi tertentu',
        'Cukup konsisten dalam tindakan dan keputusan'
      ],
      suggestions: [
        'Tingkatkan ketegasan dalam komunikasi - jelas, langsung, namun tetap respektful',
        'Latih kemampuan public speaking dan presentasi untuk meningkatkan pengaruh',
        'Kembangkan decision-making skills dengan mempelajari framework pengambilan keputusan',
        'Perluas wawasan dengan membaca buku tentang leadership dan management',
        'Cari mentor yang bisa membimbing pengembangan kepemimpinan Anda',
        'Ambil project atau posisi yang menantang untuk mengasah kemampuan memimpin',
        'Praktikkan delegasi yang efektif - percaya pada kemampuan tim Anda',
        'Kembangkan strategic thinking untuk melihat long-term impact dari keputusan',
        'Ikut training kepemimpinan untuk memperdalam skill tertentu',
        'Minta feedback dari tim untuk mengetahui area yang perlu ditingkatkan'
      ]
    },
    {
      maxSkor: 31,
      title: 'Potensi Kepemimpinan (Perlu Belajar)', color: '#f1c40f', icon: '📚',
      description: 'Anda memiliki potensi kepemimpinan yang bisa dikembangkan. Saat ini kemampuan kepemimpinan Anda belum cukup kuat untuk memimpin kelompok besar, namun dengan pembelajaran dan latihan yang tepat, Anda bisa berkembang menjadi pemimpin yang baik.',
      characteristics: [
        'Ada keinginan untuk memimpin namun masih kurang percaya diri',
        'Komunikasi cenderung pasif atau kurang jelas',
        'Ragu dalam mengambil keputusan penting',
        'Memiliki ide bagus tapi kesulitan mengeksekusi',
        'Kurang berani mengambil inisiatif atau tanggung jawab besar',
        'Masih perlu belajar cara mempengaruhi dan memotivasi orang lain',
        'Kadang kesulitan dalam conflict resolution'
      ],
      suggestions: [
        'Mulai dari yang kecil - pimpin project kecil atau team kecil untuk membangun kepercayaan diri',
        'Ikuti training atau workshop tentang leadership fundamentals',
        'Pelajari komunikasi efektif - bagaimana menyampaikan ide dengan jelas dan persuasif',
        'Baca buku-buku kepemimpinan klasik seperti "The 7 Habits", "Leaders Eat Last", dll',
        'Amati dan pelajari dari pemimpin yang Anda kagumi - apa yang mereka lakukan berbeda?',
        'Latih public speaking dengan bergabung di komunitas seperti Toastmasters',
        'Kembangkan growth mindset - percaya bahwa kepemimpinan bisa dipelajari',
        'Praktikkan assertiveness - belajar menyatakan pendapat dengan sopan tapi tegas',
        'Cari mentor yang bisa membimbing perjalanan pengembangan kepemimpinan Anda',
        'Keluar dari comfort zone - ambil kesempatan untuk memimpin meski terasa menakutkan',
        'Fokus pada self-improvement berkelanjutan dalam aspek komunikasi dan decision-making'
      ]
    },
    {
      maxSkor: Infinity,
      title: 'Perlu Peningkatan Signifikan', color: '#e74c3c', icon: '🚀',
      description: 'Kepemimpinan bukanlah bakat alami Anda saat ini. Anda cenderung pasif, kurang percaya diri, atau merasa cemas dalam situasi kepemimpinan. Namun jangan khawatir - kepemimpinan adalah skill yang bisa dipelajari! Dengan komitmen dan usaha yang tepat, Anda bisa berkembang.',
      characteristics: [
        'Sangat pasif dalam kelompok atau organisasi',
        'Kesulitan berkomunikasi dengan jelas dan tegas',
        'Kurang percaya diri dalam mengambil keputusan',
        'Cenderung menghindari tanggung jawab kepemimpinan',
        'Merasa cemas atau tidak nyaman saat harus memimpin',
        'Lebih suka mengikuti daripada memimpin',
        'Kesulitan dalam mempengaruhi atau memotivasi orang lain'
      ],
      suggestions: [
        'Mulai dengan membangun kepercayaan diri - kenali kekuatan dan nilai diri Anda',
        'Ikuti konseling atau coaching untuk memahami hambatan kepemimpinan yang Anda alami',
        'Bergabung dengan komunitas atau organisasi untuk melatih interaksi sosial',
        'Mulai dengan memimpin diri sendiri - bangun disiplin dan kebiasaan positif',
        'Pelajari dasar-dasar komunikasi efektif dan assertiveness',
        'Tantang diri sendiri dengan situasi sosial yang lebih kompleks secara bertahap',
        'Identifikasi dan atasi ketakutan spesifik yang menghalangi kemampuan memimpin',
        'Dapatkan support dari orang-orang di sekitar Anda untuk membangun kepercayaan diri',
        'Ingat bahwa setiap pemimpin hebat pernah memulai dari bawah',
        'Fokus pada progress, bukan kesempurnaan - setiap langkah kecil adalah kemajuan'
      ]
    }
  ];

  // ─── DATA TES 22 — Gaya Kepemimpinan ─────────────────────────────────────
  // Scoring: jawaban tersimpan per style (demo/oto/lais/pat), skor = panjang array
  const GAYA_KEPEMIMPINAN_STYLES = [
    {
      id: 'demo', name: 'Demokratis', color: '#2ecc71', icon: '🤝',
      desc: 'Anda adalah pemimpin yang menghargai potensi setiap individu dan mengutamakan koordinasi serta bimbingan tim. Keputusan dibuat bersama-sama dengan melibatkan masukan dari anggota tim.',
      characteristics: [
        'Mendengarkan dan menghargai pendapat semua anggota tim',
        'Mendorong partisipasi aktif dalam pengambilan keputusan',
        'Membangun konsensus sebelum mengambil keputusan penting',
        'Memberikan kebebasan berpendapat tanpa takut dikritik',
        'Fokus pada pengembangan potensi setiap individu'
      ],
      strengths: [
        'Meningkatkan motivasi dan kepuasan tim',
        'Keputusan lebih berkualitas karena berbagai perspektif',
        'Membangun rasa memiliki dan tanggung jawab bersama',
        'Mengembangkan kemampuan problem-solving tim',
        'Menciptakan lingkungan kerja yang positif dan inklusif'
      ],
      weaknesses: [
        'Proses pengambilan keputusan bisa lambat',
        'Kesulitan saat harus membuat keputusan cepat',
        'Bisa terjadi konflik jika pendapat sangat beragam',
        'Membutuhkan tim yang mature dan bertanggung jawab',
        'Risiko kehilangan kontrol jika tidak dikelola baik'
      ]
    },
    {
      id: 'oto', name: 'Otokratis', color: '#e74c3c', icon: '👊',
      desc: 'Keputusan mutlak ada di tangan Anda. Anda fokus pada kepatuhan dan aturan yang Anda rancang sendiri. Kontrol penuh terhadap proses kerja adalah prioritas Anda.',
      characteristics: [
        'Membuat keputusan sendiri tanpa banyak konsultasi',
        'Mengharapkan kepatuhan penuh terhadap instruksi',
        'Kontrol ketat terhadap semua aspek pekerjaan',
        'Komunikasi satu arah dari atasan ke bawahan',
        'Standar tinggi dengan pengawasan ketat'
      ],
      strengths: [
        'Pengambilan keputusan sangat cepat dan efisien',
        'Efektif dalam situasi krisis atau emergency',
        'Kontrol penuh memastikan konsistensi output',
        'Jelas dan tidak ambigu dalam ekspektasi',
        'Cocok untuk tim yang kurang berpengalaman'
      ],
      weaknesses: [
        'Mengurangi kreativitas dan inisiatif tim',
        'Demotivasi karena kurangnya keterlibatan',
        'Ketergantungan tinggi pada satu pemimpin',
        'Bisa menciptakan lingkungan yang stressful',
        'Potensi turnover karyawan yang tinggi'
      ]
    },
    {
      id: 'lais', name: 'Laissez Faire', color: '#95a5a6', icon: '🎯',
      desc: 'Anda memberikan kebebasan penuh kepada anggota tim untuk mengatur pekerjaan mereka sendiri. Sebagai pemimpin, Anda lebih banyak berperan sebagai fasilitator daripada pengatur.',
      characteristics: [
        'Memberikan otonomi penuh kepada tim',
        'Intervensi minimal dalam pekerjaan sehari-hari',
        'Menyediakan resources yang dibutuhkan tim',
        'Percaya penuh pada kemampuan anggota tim',
        'Fokus pada hasil, bukan pada proses'
      ],
      strengths: [
        'Mendorong kreativitas dan inovasi maksimal',
        'Cocok untuk tim expert dan self-motivated',
        'Mengembangkan kemandirian anggota tim',
        'Fleksibilitas tinggi dalam cara kerja',
        'Mengurangi micromanagement yang kontraproduktif'
      ],
      weaknesses: [
        'Bisa menyebabkan kebingungan tanpa arahan jelas',
        'Risiko inkonsistensi dalam output',
        'Tidak cocok untuk tim yang butuh bimbingan',
        'Potensi konflik antar anggota tanpa mediasi',
        'Bisa dianggap kurang peduli atau tidak terlibat'
      ]
    },
    {
      id: 'pat', name: 'Paternalistis', color: '#e67e22', icon: '🛡️',
      desc: 'Anda cenderung melindungi anggota tim dan menganggap mereka perlu bimbingan penuh, layaknya hubungan orang tua dengan anak. Anda memberikan arahan yang jelas dan peduli terhadap kesejahteraan tim.',
      characteristics: [
        'Memberikan perlindungan dan perhatian personal',
        'Membuat keputusan "untuk kebaikan" anggota tim',
        'Hubungan yang lebih personal dengan tim',
        'Mengharapkan loyalitas sebagai balasan',
        'Memberikan arahan detail dan bimbingan konstan'
      ],
      strengths: [
        'Menciptakan rasa aman dan kekeluargaan',
        'Loyalitas tim yang tinggi',
        'Peduli pada kesejahteraan holistik tim',
        'Hubungan interpersonal yang kuat',
        'Cocok untuk budaya kolektif'
      ],
      weaknesses: [
        'Menghambat kemandirian dan pertumbuhan tim',
        'Dependensi berlebihan pada pemimpin',
        'Bisa dianggap condescending atau meremehkan',
        'Keputusan tidak selalu objektif',
        'Sulit memisahkan hubungan personal dan profesional'
      ]
    }
  ];

  // ─── DATA TES 23 — Motivasi Kepemimpinan ─────────────────────────────────
  // Scoring: A=1, B=2, C=3, D=4, E=5. Max = 70.
  // Range: 56-70 kuat, 28-55 moderat, 14-27 rendah
  const MOTIVASI_LEVELS = [
    {
      minSkor: 56,
      title: 'Motivasi Kepemimpinan Sangat Kuat', color: '#27ae60', icon: '🔥',
      description: 'Luar biasa! Anda menunjukkan motivasi yang kuat untuk menjadi pemimpin, adanya sikap ideal yang diperlukan untuk memimpin dan mengorganisasikan sesuatu. Anda berbakat menjadi pemimpin yang baik.',
      factors: [
        { icon: '⭐', text: 'Drive dan ambisi yang tinggi untuk memimpin' },
        { icon: '🎯', text: 'Kepercayaan diri dalam mengambil tanggung jawab' },
        { icon: '💪', text: 'Inisiatif kuat untuk mengorganisir dan mengarahkan' },
        { icon: '🚀', text: 'Antusiasme tinggi dalam posisi kepemimpinan' },
        { icon: '👥', text: 'Keinginan natural untuk mempengaruhi orang lain' },
        { icon: '🏆', text: 'Orientasi pencapaian yang sangat tinggi' }
      ],
      suggestions: [
        'Manfaatkan motivasi tinggi Anda dengan mengambil posisi kepemimpinan yang menantang',
        'Kembangkan skill kepemimpinan melalui training formal dan mentoring',
        'Cari peluang untuk memimpin project atau tim yang lebih besar dan kompleks',
        'Bangun network dengan pemimpin lain untuk saling belajar dan berkembang',
        'Jaga keseimbangan antara ambisi dan empati terhadap tim',
        'Tetap humble - motivasi tinggi harus diimbangi dengan kesediaan terus belajar',
        'Pertimbangkan untuk menjadi mentor bagi calon pemimpin lainnya',
        'Investasi dalam pengembangan emotional intelligence untuk menjadi pemimpin yang lebih efektif'
      ]
    },
    {
      minSkor: 28,
      title: 'Motivasi Kepemimpinan Moderat', color: '#f1c40f', icon: '⚖️',
      description: 'Anda menunjukkan keragu-raguan untuk menjadi pemimpin. Bersikaplah tegas, mandiri, dan lebih bertanggungjawab. Di satu sisi Anda tertarik untuk memimpin, namun di sisi lain masih ada keraguan dan ketidakpastian.',
      factors: [
        { icon: '🤔', text: 'Minat kepemimpinan ada namun tidak konsisten' },
        { icon: '⚡', text: 'Kepercayaan diri yang masih fluktuatif' },
        { icon: '📊', text: 'Keberanian mengambil risiko masih terbatas' },
        { icon: '👤', text: 'Preferensi kadang lebih nyaman sebagai follower' },
        { icon: '🎭', text: 'Ambivalensi antara ingin memimpin dan nyaman di posisi saat ini' },
        { icon: '💭', text: 'Perlu validasi eksternal untuk mengambil peran kepemimpinan' }
      ],
      suggestions: [
        'Identifikasi sumber keragu-raguan Anda - apakah dari kurang percaya diri atau pengalaman buruk',
        'Mulai dengan memimpin project kecil untuk membangun kepercayaan diri secara bertahap',
        'Cari mentor yang bisa memberikan guidance dan dukungan dalam perjalanan kepemimpinan',
        'Ikuti training assertiveness dan decision-making untuk meningkatkan ketegasan',
        'Praktikkan mengambil keputusan sendiri dalam situasi low-risk terlebih dahulu',
        'Kembangkan growth mindset - percaya bahwa kepemimpinan bisa dipelajari dan ditingkatkan',
        'Keluar dari comfort zone secara bertahap - ambil tanggung jawab yang sedikit lebih besar',
        'Jangan terlalu keras pada diri sendiri - setiap pemimpin besar pernah meragukan diri mereka'
      ]
    },
    {
      minSkor: 0,
      title: 'Motivasi Kepemimpinan Rendah', color: '#e67e22', icon: '🌱',
      description: 'Saat ini Anda menunjukkan motivasi yang rendah untuk menjadi pemimpin. Perlu mengembangkan karakteristik dan belajar menjadi pemimpin, jangan hanya puas menjadi bawahan dengan tugas yang biasa saja.',
      factors: [
        { icon: '😰', text: 'Kurang nyaman dalam posisi kepemimpinan' },
        { icon: '🚫', text: 'Menghindari tanggung jawab kepemimpinan' },
        { icon: '👥', text: 'Lebih prefer bekerja sebagai kontributor individual' },
        { icon: '😟', text: 'Kurang percaya diri untuk memimpin orang lain' },
        { icon: '📉', text: 'Motivasi rendah untuk mengambil inisiatif memimpin' },
        { icon: '🎯', text: 'Belum melihat value atau manfaat dari peran kepemimpinan' }
      ],
      suggestions: [
        'Pahami bahwa kepemimpinan bukan tentang kekuasaan, tapi tentang service dan impact positif',
        'Mulai dari memimpin diri sendiri - discipline, goal-setting, self-management',
        'Cari role model pemimpin yang Anda kagumi dan pelajari apa yang membuat mereka menarik',
        'Ikuti workshop atau seminar tentang leadership untuk mendapat exposure dan inspirasi',
        'Mulai dari volunteer untuk koordinasi kegiatan kecil dalam tim atau komunitas',
        'Bangun kepercayaan diri dengan mengidentifikasi dan mengembangkan kekuatan personal Anda',
        'Baca buku atau biografi pemimpin inspiratif untuk mendapat perspektif baru',
        'Ingat kata bijak: Jika ingin sukses dua kali lipat, lipatgandakanlah kegagalan!'
      ]
    }
  ];

  // ─── DATA TES 24 — Manajemen Waktu ───────────────────────────────────────
  // Scoring: A=3, B=2, C=1, D=0. Max = 30.
  // Range: 28-30 tidak jujur, 26-27 unggul, 21-25 sangat baik, 11-20 cukup baik, 0-10 perlu belajar
  const MANWAK_LEVELS = [
    {
      minSkor: 28,
      title: 'Hasil Tidak Valid - Kemungkinan Tidak Jujur', color: '#c0392b', icon: '⚠️',
      description: 'Hasil jawaban yang diisikan bukanlah diri yang sebenarnya. Skor terlalu sempurna dan tidak realistis. Untuk mendapatkan hasil yang bermakna, cobalah lebih jujur dalam menilai kebiasaan manajemen waktu Anda.',
      warning: 'Manajemen waktu yang sempurna sangat jarang terjadi. Setiap orang pasti memiliki area yang perlu diperbaiki. Kejujuran dalam self-assessment adalah langkah pertama untuk perbaikan yang nyata.',
      aspects: [
        { icon: '🎭', text: 'Kemungkinan memberikan jawaban yang diinginkan daripada kenyataan' },
        { icon: '📊', text: 'Skor tidak mencerminkan kondisi aktual' },
        { icon: '🔍', text: 'Perlu introspeksi yang lebih mendalam dan jujur' },
        { icon: '💭', text: 'Mungkin ada kecenderungan perfeksionisme dalam self-image' }
      ],
      suggestions: [
        'Ulangi tes dengan menjawab berdasarkan kebiasaan aktual Anda, bukan idealisme',
        'Ingat bahwa tidak ada yang sempurna - semua orang punya area untuk berkembang',
        'Mintalah feedback dari orang terdekat tentang bagaimana Anda benar-benar mengelola waktu',
        'Gunakan tes ini sebagai refleksi diri yang jujur, bukan untuk terlihat baik',
        'Catat kegiatan Anda selama seminggu untuk melihat pola penggunaan waktu yang sebenarnya'
      ]
    },
    {
      minSkor: 26,
      title: 'Unggul & Luar Biasa Prima', color: '#8e44ad', icon: '🌟',
      description: 'Kamu benar-benar unggul, luar biasa prima! Kamu adalah pengelola waktu yang sangat luar biasa. Kemampuan Anda dalam memprioritaskan, merencanakan, dan melaksanakan tugas patut diacungi jempol.',
      warning: null,
      aspects: [
        { icon: '🎯', text: 'Prioritas sangat jelas dan terstruktur' },
        { icon: '📅', text: 'Perencanaan sistematis dan detail' },
        { icon: '⚡', text: 'Eksekusi cepat dan efisien' },
        { icon: '🔄', text: 'Disiplin tinggi dalam follow-through' },
        { icon: '💼', text: 'Balance yang baik antara berbagai aspek kehidupan' },
        { icon: '🎓', text: 'Continuous improvement mindset' }
      ],
      suggestions: [
        'Pertahankan sistem dan kebiasaan baik yang sudah Anda bangun',
        'Jadilah mentor bagi orang lain - bagikan strategi manajemen waktu Anda',
        'Terus evaluasi dan optimize sistem Anda seiring perubahan prioritas',
        'Jangan lupa untuk tetap fleksibel - tidak semua hal bisa direncanakan',
        'Pastikan efisiensi tidak mengorbankan wellbeing dan relationships'
      ]
    },
    {
      minSkor: 21,
      title: 'Manajemen Waktu Sangat Baik', color: '#27ae60', icon: '✅',
      description: 'Sangat baik! Kamu dapat membuat skala prioritas dan kebijaksanaan dalam mengelola waktu dengan baik. Anda memiliki sistem yang efektif untuk mengorganisir tugas dan tanggung jawab.',
      warning: null,
      aspects: [
        { icon: '✓', text: 'Prioritas yang jelas dalam pekerjaan' },
        { icon: '📋', text: 'Perencanaan yang terstruktur' },
        { icon: '⏱️', text: 'Cukup disiplin dengan jadwal' },
        { icon: '🎯', text: 'Fokus yang baik pada tugas penting' },
        { icon: '📊', text: 'Mampu tracking progress dengan baik' },
        { icon: '🔧', text: 'Ada ruang untuk improvement' }
      ],
      suggestions: [
        'Identifikasi time-wasters terbesar Anda dan cari cara untuk mengeliminasinya',
        'Gunakan teknik time-blocking untuk mengalokasikan waktu untuk deep work',
        'Praktikkan "eat the frog" - kerjakan tugas tersulit di pagi hari',
        'Terapkan aturan 2-menit: jika tugas bisa diselesaikan dalam 2 menit, lakukan sekarang',
        'Review dan adjust sistem manajemen waktu Anda setiap bulan'
      ]
    },
    {
      minSkor: 11,
      title: 'Cukup Baik - Perlu Ditingkatkan', color: '#2980b9', icon: '📈',
      description: 'Kamu sudah bertindak baik, tetapi masih perlu ditingkatkan. Ada beberapa hal yang perlu diperbaiki, cobalah mulai melakukan introspeksi diri.',
      warning: null,
      aspects: [
        { icon: '~', text: 'Prioritas kadang masih kurang jelas' },
        { icon: '📱', text: 'Distraksi masih sering mengganggu' },
        { icon: '⏰', text: 'Deadline kadang terlewat' },
        { icon: '🔀', text: 'Multitasking yang belum efektif' },
        { icon: '📝', text: 'Perencanaan belum konsisten' },
        { icon: '💪', text: 'Ada motivasi untuk improve' }
      ],
      suggestions: [
        'Mulai gunakan to-do list atau task management app untuk tracking tugas',
        'Praktikkan Eisenhower Matrix untuk kategorisasi urgent vs important',
        'Set timer untuk focused work session (teknik Pomodoro - 25 menit fokus, 5 menit break)',
        'Identifikasi peak productivity hours Anda dan schedule tugas penting di waktu tersebut',
        'Kurangi multitasking - fokus pada satu tugas sampai selesai',
        'Buat morning routine yang konsisten untuk memulai hari dengan produktif',
        'Matikan notifikasi yang tidak penting saat bekerja'
      ]
    },
    {
      minSkor: 0,
      title: 'Perlu Belajar Mengelola Waktu', color: '#e67e22', icon: '⏳',
      description: 'Berpikirlah untuk mulai mengelola waktu dengan baik agar setiap waktu tidak terbuang percuma dan bisa memanfaatkan waktu dengan lebih baik lagi.',
      warning: null,
      aspects: [
        { icon: '❌', text: 'Prioritas tidak jelas' },
        { icon: '😰', text: 'Sering terburu-buru last minute' },
        { icon: '🎲', text: 'Banyak waktu terbuang untuk hal tidak produktif' },
        { icon: '😵', text: 'Overwhelmed dengan banyak tugas' },
        { icon: '⏰', text: 'Deadline sering terlewat' },
        { icon: '🔄', text: 'Pola kerja yang tidak terstruktur' }
      ],
      suggestions: [
        'Mulai dengan langkah paling dasar: tulis semua tugas dan buat daftar prioritas sederhana',
        'Gunakan kalender atau planner untuk merencanakan aktivitas harian',
        'Tetapkan satu tujuan utama per hari yang harus diselesaikan',
        'Eliminasi aktivitas yang menghabiskan waktu tanpa hasil (scrolling media sosial berlebihan, dll)',
        'Bangun satu kebiasaan produktif dulu sebelum menambah yang lain',
        'Cari tahu dan atasi penyebab utama penundaan atau prokrastinasi Anda',
        'Reward diri sendiri ketika berhasil menyelesaikan tugas tepat waktu'
      ]
    }
  ];

  // ─── DATA TES 25 — Analisis Stres Kerja ───────────────────────────────────
  // Scoring: Y di q1-q9 dan T di q10-q12 masing-masing bernilai 1
  const STRES_LEVELS = [
    {
      minSkor: 4,
      title: 'Waspada: Stres Negatif Terdeteksi', color: '#e74c3c', icon: '🚨',
      description: 'Hasil tes menunjukkan bahwa Anda sedang mengalami stres negatif yang cukup signifikan. Kondisi ini tidak boleh diabaikan karena dapat berdampak pada kesehatan fisik dan mental Anda dalam jangka panjang. Anda perlu segera mengambil langkah-langkah untuk mengelola dan mengurangi stres.',
      warning: 'Stres yang berkelanjutan dapat menyebabkan burnout, masalah kesehatan fisik (hipertensi, gangguan pencernaan, insomnia), dan masalah mental (anxiety, depresi). Jika gejala berlanjut atau memburuk, sangat disarankan untuk berkonsultasi dengan profesional kesehatan mental.',
      indicators: [
        { icon: '😰', text: 'Mengalami gejala stres yang mengganggu', type: 'negative' },
        { icon: '😴', text: 'Kemungkinan gangguan tidur atau kelelahan kronis', type: 'negative' },
        { icon: '😤', text: 'Mudah marah atau frustrasi', type: 'negative' },
        { icon: '🎯', text: 'Kesulitan fokus dan konsentrasi', type: 'negative' },
        { icon: '💔', text: 'Motivasi dan semangat kerja menurun', type: 'negative' },
        { icon: '🏥', text: 'Berisiko mengalami dampak kesehatan', type: 'negative' }
      ],
      suggestions: [
        'PRIORITAS UTAMA: Temukan sumber stres utama Anda dan buat rencana konkret untuk mengatasinya',
        'Praktikkan teknik relaksasi setiap hari: deep breathing, meditasi, atau progressive muscle relaxation',
        'Atur boundaries yang jelas antara pekerjaan dan kehidupan pribadi - hindari membawa pekerjaan pulang',
        'Lakukan aktivitas fisik minimal 30 menit sehari - olahraga efektif mengurangi hormon stres',
        'Prioritaskan tidur yang cukup dan berkualitas (7-9 jam per malam)',
        'Kurangi konsumsi kafein dan hindari self-medication dengan alkohol',
        'Berbicara dengan orang yang dipercaya tentang apa yang Anda rasakan',
        'Jika workload berlebihan, bicarakan dengan atasan tentang prioritas atau delegasi',
        'Ambil cuti atau leave jika diperlukan untuk recharge',
        'Lakukan aktivitas yang Anda nikmati di luar pekerjaan untuk restore energy',
        'Pertimbangkan konseling profesional atau Employee Assistance Program (EAP) jika tersedia',
        'Evaluasi apakah pekerjaan saat ini sustainable untuk jangka panjang',
        'Jangan ragu mencari bantuan profesional - kesehatan mental sama pentingnya dengan kesehatan fisik'
      ]
    },
    {
      minSkor: 0,
      title: 'Kondisi Aman - Stres Terkendali', color: '#2ecc71', icon: '✅',
      description: 'Selamat! Anda masih berada dalam kondisi yang aman dalam mengelola stres di tempat kerja. Anda memiliki coping mechanism yang cukup baik dan mampu menjaga keseimbangan antara tuntutan pekerjaan dengan wellbeing pribadi. Pertahankan kondisi ini dengan terus merawat kesehatan mental Anda.',
      warning: null,
      indicators: [
        { icon: '😊', text: 'Kondisi psikologis yang stabil', type: 'positive' },
        { icon: '⚖️', text: 'Balance yang baik antara kerja dan kehidupan pribadi', type: 'positive' },
        { icon: '💪', text: 'Coping mechanism yang efektif', type: 'positive' },
        { icon: '🎯', text: 'Mampu fokus dan produktif', type: 'positive' },
        { icon: '😴', text: 'Kualitas tidur yang cukup baik', type: 'positive' },
        { icon: '🌟', text: 'Motivasi dan semangat kerja terjaga', type: 'positive' }
      ],
      suggestions: [
        'Pertahankan kebiasaan-kebiasaan positif yang sudah membantu Anda mengelola stres',
        'Jaga keseimbangan antara pekerjaan dan kehidupan pribadi - jangan biarkan satu mengorbankan yang lain',
        'Lakukan check-in rutin terhadap kondisi mental Anda - jangan tunggu sampai overwhelmed',
        'Kembangkan resilience dengan belajar tentang stress management dan mindfulness',
        'Bangun support system yang kuat dengan kolega, teman, dan keluarga',
        'Lakukan aktivitas yang menyenangkan dan recharge energi Anda secara rutin',
        'Waspadai tanda-tanda stres yang mulai meningkat dan tangani sejak dini',
        'Investasikan waktu untuk self-care dan kesehatan mental secara proaktif',
        'Bagikan strategi stress management Anda dengan rekan kerja yang membutuhkan',
        'Tetap terhubung dengan aktivitas di luar pekerjaan yang memberikan makna dan kebahagiaan'
      ]
    }
  ];

  // ─── DATA TES 27 — Keberanian Diri ───────────────────────────────────────
  // Scoring: dihitung dari jawaban A-E per nomor (mapping kunci)
  // Struktur x_03: { q1: "A", q2: "B", ... q26: "C" }
  // Kunci jawaban dan nilai per nomor (perlu disesuaikan dengan soal asli)
  // PLACEHOLDER — sesuaikan kunci_jawaban dan scoring_map setelah soal tersedia
  const KEBERANIAN_CONFIG = {
    jumlahSoal: 26,
    // kunci_jawaban: { q1: 'A', q2: 'B', ... } — isi sesuai soal
    // Untuk sementara: engine mengembalikan raw jawaban ke view untuk diproses
    levels: [
      {
        minSkor: 21,
        title: 'Keberanian Luar Biasa', color: '#27ae60', icon: '🦁',
        description: 'Anda memiliki tingkat keberanian yang sangat tinggi! Anda tidak mudah menyerah menghadapi tantangan dan berani mengambil risiko yang terukur. Anda adalah tipe orang yang bisa diandalkan dalam situasi sulit.',
        traits: [
          'Berani mengambil keputusan di bawah tekanan',
          'Tidak mudah dipengaruhi oleh rasa takut',
          'Mampu keluar dari zona nyaman dengan percaya diri',
          'Gigih dan pantang menyerah menghadapi rintangan'
        ],
        suggestions: [
          'Manfaatkan keberanian Anda untuk mengambil tantangan yang lebih besar',
          'Jadilah inspirasi dan motivasi bagi orang-orang di sekitar Anda',
          'Pastikan keberanian diimbangi dengan pertimbangan yang matang',
          'Gunakan keberanian untuk membantu orang lain mengatasi ketakutan mereka',
          'Terus kembangkan diri dengan mengeksplorasi bidang-bidang baru'
        ]
      },
      {
        minSkor: 14,
        title: 'Cukup Berani', color: '#2980b9', icon: '💪',
        description: 'Anda memiliki keberanian yang cukup baik dalam menghadapi berbagai situasi. Terkadang rasa takut masih mempengaruhi keputusan Anda, namun secara umum Anda mampu melewati tantangan dengan baik.',
        traits: [
          'Berani dalam situasi yang sudah familiar',
          'Masih perlu dorongan dalam situasi yang benar-benar baru',
          'Memiliki kemampuan yang baik dalam mengelola kecemasan',
          'Bisa mengambil risiko namun dengan pertimbangan yang lebih lama'
        ],
        suggestions: [
          'Latih keberanian dengan mengambil tantangan kecil setiap harinya',
          'Kenali pola ketakutan Anda dan hadapi satu per satu',
          'Cari komunitas atau mentor yang bisa mendukung perkembangan Anda',
          'Buat jurnal keberanian untuk mencatat momen ketika Anda berhasil mengatasi rasa takut',
          'Visualisasikan keberhasilan sebelum menghadapi situasi yang menantang'
        ]
      },
      {
        minSkor: 0,
        title: 'Perlu Mengembangkan Keberanian', color: '#e67e22', icon: '🌱',
        description: 'Saat ini rasa takut cukup mempengaruhi langkah Anda. Ini bukan sesuatu yang permanen - keberanian adalah skill yang bisa dipelajari dan dikembangkan dengan latihan yang tepat dan konsisten.',
        traits: [
          'Cenderung menghindari situasi yang tidak nyaman',
          'Rasa takut sering menghalangi pengambilan keputusan',
          'Memerlukan dukungan ekstra untuk mengambil langkah baru',
          'Zona nyaman terasa sangat aman namun membatasi pertumbuhan'
        ],
        suggestions: [
          'Mulai dari langkah yang sangat kecil - lakukan satu hal yang sedikit tidak nyaman setiap hari',
          'Pahami bahwa rasa takut adalah normal dan bisa dikelola',
          'Bicara dengan konselor atau psikolog untuk memahami akar ketakutan Anda',
          'Baca buku tentang growth mindset dan keberanian',
          'Bergabung dengan komunitas yang supportif dan memotivasi',
          'Rayakan setiap keberhasilan kecil dalam menghadapi ketakutan',
          'Ingat bahwa setiap orang punya ketakutan - yang membedakan adalah cara menghadapinya'
        ]
      }
    ]
  };

  // ─── LOGIKA SCORING ───────────────────────────────────────────────────────

  function score20(rawData) {
    // Jawaban tersimpan di x_07 dengan key 'who_20', format: "A;B;A;B;..."
    // 108 item = 6 kategori × 18 soal, urutan: R, I, A, S, E, C
    // Skor = jumlah jawaban 'B' (Ya/Tertarik) per blok 18 soal
    const x07 = JSON.parse(rawData.x_07 || '{}');
    const raw = x07['who_20'] || '';
    const arr = raw.split(';').filter(v => v !== '');

    const ORDER = ['R', 'I', 'A', 'S', 'E', 'C'];
    const scoresObj = {};
    ORDER.forEach((id, i) => {
      const blok = arr.slice(i * 18, (i + 1) * 18);
      scoresObj[id] = blok.filter(v => v === 'B').length;
    });

    let combined = RIASEC_CATEGORIES.map(c => ({ ...c, score: scoresObj[c.id] || 0 }));
    combined.sort((a, b) => b.score - a.score);
    const top3 = combined.slice(0, 3);
    return {
      categories: combined,
      top3,
      careerCode: top3.map(c => c.id).join(''),
      suggestions: RIASEC_SUGGESTIONS
    };
  }

  function score21(rawData) {
    const x07 = JSON.parse(rawData.x_07 || '{}');
    const arr = (x07['who_21'] || '').split(';').filter(v => v !== '');
    // Penilaian: A=0, B=1, C=2, D=3 — skor rendah = jiwa pemimpin kuat
    const nilaiMap = { A: 0, B: 1, C: 2, D: 3 };
    let totalSkor = 0;
    arr.forEach(v => totalSkor += nilaiMap[v.trim()] !== undefined ? nilaiMap[v.trim()] : 0);
    const result = KEPEMIMPINAN_LEVELS.find(l => totalSkor <= l.maxSkor);
    return { skor: totalSkor, maxSkor: 42, result };
  }

  function score22(rawData) {
    const x07 = JSON.parse(rawData.x_07 || '{}');
    const arr = (x07['who_22'] || '').split(';').filter(v => v !== '');
    // 28 soal, tiap 7 soal = 1 style, urutan: pat, oto, lais, demo
    const styleOrder = ['pat', 'oto', 'lais', 'demo'];
    let combined = GAYA_KEPEMIMPINAN_STYLES.map(s => {
      const i = styleOrder.indexOf(s.id);
      const blok = arr.slice(i * 7, (i + 1) * 7);
      const score = blok.filter(v => v === 'A').length;
      return { ...s, score };
    });
    combined.sort((a, b) => b.score - a.score);
    return { styles: combined, dominan: combined[0] };
  }

  function score23(rawData) {
    const x07 = JSON.parse(rawData.x_07 || '{}');
    const arr = (x07['who_23'] || '').split(';').filter(v => v !== '');
    // Format jawaban: A=1 (Sangat Tidak Setuju) s/d E=5 (Sangat Setuju)
    // 14 soal × 5 = 70 max
    const nilaiMap = { A:1, B:2, C:3, D:4, E:5 };
    let total = 0;
    arr.forEach(v => total += nilaiMap[v.trim()] || 0);
    const result = MOTIVASI_LEVELS.find(l => total >= l.minSkor);
    const percentage = (total / 70 * 100).toFixed(1);
    return { skor: total, maxSkor: 70, percentage, result };
  }

  function score24(rawData) {
    const x07 = JSON.parse(rawData.x_07 || '{}');
    const arr = (x07['who_24'] || '').split(';').filter(v => v !== '');
    // Format jawaban: A=3, B=2, C=1, D=0 (10 soal × 3 = 30 max)
    const nilaiMap = { A:3, B:2, C:1, D:0 };
    let total = 0;
    arr.forEach(v => total += nilaiMap[v.trim()] !== undefined ? nilaiMap[v.trim()] : 0);
    const sorted = [...MANWAK_LEVELS].sort((a, b) => b.minSkor - a.minSkor);
    const result = sorted.find(l => total >= l.minSkor);
    return { skor: total, maxSkor: 30, result };
  }

  function score25(rawData) {
    const x07 = JSON.parse(rawData.x_07 || '{}');
    const arr = (x07['who_25'] || '').split(';').filter(v => v !== '');
    // Format: A=Ya(stres), B=Tidak — q1-9: A bernilai 1, q10-12: B bernilai 1
    let skor = 0;
    arr.forEach((val, i) => {
      const no = i + 1;
      const v  = val.trim();
      if (no <= 9  && v === 'A') skor++;
      if (no >= 10 && v === 'B') skor++;
    });
    const result = STRES_LEVELS.find(l => skor >= l.minSkor);
    return { skor, maxSkor: 12, result };
  }

  function score27(rawData) {
    const x07 = JSON.parse(rawData.x_07 || '{}');
    const arr = (x07['who_27'] || '').split(';').filter(v => v !== '');
    const nilaiMap = { A: 4, B: 3, C: 2, D: 1, E: 0 };
    let total = 0;
    arr.forEach(v => total += nilaiMap[v] || 0);
    const maxSkor = KEBERANIAN_CONFIG.jumlahSoal * 4;
    const sorted = [...KEBERANIAN_CONFIG.levels].sort((a, b) => b.minSkor - a.minSkor);
    const result = sorted.find(l => total >= l.minSkor);
    const percentage = (total / maxSkor * 100).toFixed(1);
    return { skor: total, maxSkor, percentage, result };
  }

  // ─── FUNGSI FETCH UTAMA ───────────────────────────────────────────────────

  // Ambil token dari URL
  function getToken() {
    return new URLSearchParams(window.location.search).get('token');
  }

  // Fetch raw data dari API (satu kali, pakai struktur asli)
  async function fetchRaw(token) {
    const response = await fetch(
      `${API_BASE}?table=nilai1_json&x_01_eq=${encodeURIComponent(token)}`,
      { headers: API_HEADERS }
    );
    const res = await response.json();
    if (!res.success || !res.data || res.data.length === 0) {
      return Promise.reject({ message: 'Data tidak ditemukan. Pastikan Anda telah mengisi form dengan benar.' });
    }
    return res.data[0]; // satu token = satu baris data berisi semua tes di x_07
  }

  // Scoring berdasarkan tesId dari satu rawData
  function scoreById(tesId, rawData) {
    switch (tesId) {
      case '20': return score20(rawData);
      case '21': return score21(rawData);
      case '22': return score22(rawData);
      case '23': return score23(rawData);
      case '24': return score24(rawData);
      case '25': return score25(rawData);
      case '27': return score27(rawData);
      default: return null;
    }
  }

  // load() — untuk file view satuan (20view, 21view, dst.)
  // Tetap kompatibel seperti sebelumnya
  async function load(tesId) {
    const token = getToken();
    if (!token) return Promise.reject({ message: 'Token tidak ditemukan. Silakan kembali dan isi form terlebih dahulu.' });

    let rawData;
    try {
      rawData = await fetchRaw(token);
    } catch (e) {
      return Promise.reject(e);
    }

    const dataDiri = JSON.parse(rawData.x_02 || '{}');
    const tanggal  = rawData.x_05;
    const scored   = scoreById(tesId, rawData);

    if (!scored) return Promise.reject({ message: `Tes ID "${tesId}" tidak dikenal.` });
    return { dataDiri, tanggal, ...scored };
  }

  // loadAll() — untuk gabungan_karir.html
  // Satu fetch, return semua tes sekaligus
  // Returns: { dataDiri, tanggal, tes: { '20': result, '21': result, ... } }
  async function loadAll() {
    const token = getToken();
    if (!token) return Promise.reject({ message: 'Token tidak ditemukan. Silakan kembali dan isi form terlebih dahulu.' });

    let rawData;
    try {
      rawData = await fetchRaw(token);
    } catch (e) {
      return Promise.reject(e);
    }

    const dataDiri = JSON.parse(rawData.x_02 || '{}');
    const tanggal  = rawData.x_05;
    const x07      = JSON.parse(rawData.x_07 || '{}');

    // Hanya render tes yang datanya ada di x_07
    const tesIds   = ['20','21','22','23','24','25','27'];
    const keyMap   = { '20':'who_20','21':'who_21','22':'who_22','23':'who_23','24':'who_24','25':'who_25','27':'who_27' };
    const tes      = {};

    tesIds.forEach(id => {
      const key = keyMap[id];
      if (x07[key] && x07[key] !== '') {
        try {
          const scored = scoreById(id, rawData);
          if (scored) tes[id] = { dataDiri, tanggal, ...scored };
        } catch(e) {
          console.warn(`Scoring tes ${id} gagal:`, e);
        }
      }
    });

    return { dataDiri, tanggal, tes };
  }

  // ─── EXPOSE ───────────────────────────────────────────────────────────────
  return {
    load,
    loadAll,
    DATA: {
      RIASEC_CATEGORIES,
      RIASEC_SUGGESTIONS,
      KEPEMIMPINAN_LEVELS,
      GAYA_KEPEMIMPINAN_STYLES,
      MOTIVASI_LEVELS,
      MANWAK_LEVELS,
      STRES_LEVELS,
      KEBERANIAN_CONFIG
    }
  };

})();