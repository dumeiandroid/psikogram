/**
 * ASMARA ENGINE
 * Engine data + logika untuk 8 tes asmara/hubungan
 * File: 09, 12, 13, 14, 15, 16, 17, 18
 *
 * Cara pakai di view:
 *   AsmaraEngine.load('09').then(result => { // render sendiri })
 *
 * result berisi: { dataDiri, tanggal, dominant, config, scores, total, persen, level, raw }
 */

const AsmaraEngine = (() => {

  // ─── API CONFIG ───────────────────────────────────────────────────────────
  const API_BASE = 'https://lidan-co-id.pages.dev/api/contacts_filter_dinamis6';
  const AUTH_KEY = 'admin';

  // ─── DATA CONFIG PER TES ──────────────────────────────────────────────────

  const CONFIG = {

    // ══════════════════════════════════════════════════════════════════════
    '09': {
      tesNama: 'Pola Asuh Orangtua',
      jawabanKey: ['input-tes-pola-asuh', 'who_9'],
      tipe: 'pilihan-tertinggi',   // hitung jumlah per opsi, ambil terbesar
      opsi: ['A', 'B', 'C'],
      totalSoal: 10,
      types: {
        A: {
          name: 'OTORITER (Authoritarian)',
          color: '#c0392b',
          icon: '👮',
          description: 'Pola asuh dengan aturan yang ketat dan kepatuhan tinggi. Orangtua sangat menuntut tetapi kurang responsif terhadap kebutuhan anak.',
          characteristics: [
            'Aturan yang sangat ketat dan tidak fleksibel',
            'Hukuman sebagai metode disiplin utama',
            'Komunikasi satu arah (orangtua ke anak)',
            'Ekspektasi yang tinggi tanpa penjelasan',
            'Sedikit kehangatan atau dukungan emosional',
            'Anak harus patuh tanpa pertanyaan'
          ],
          impact: [
            '✅ Anak cenderung disiplin dan patuh aturan',
            '✅ Mampu mengikuti instruksi dengan baik',
            '❌ Kurang percaya diri dan takut mengambil keputusan',
            '❌ Cenderung memberontak atau sangat submisif',
            '❌ Kesulitan mengekspresikan emosi',
            '❌ Hubungan dengan orangtua kurang hangat'
          ],
          advice: [
            'Dengarkan pendapat dan perasaan anak',
            'Jelaskan alasan di balik aturan',
            'Berikan pujian, bukan hanya kritik',
            'Tunjukkan kasih sayang dan kehangatan',
            'Beri ruang untuk anak membuat keputusan kecil'
          ]
        },
        B: {
          name: 'DEMOKRATIS (Authoritative)',
          color: '#27ae60',
          icon: '🤝',
          description: 'Pola asuh yang seimbang dengan batasan yang jelas namun penuh kehangatan. Ini dianggap sebagai gaya pengasuhan yang paling ideal.',
          characteristics: [
            'Aturan yang jelas dengan penjelasan',
            'Komunikasi dua arah yang terbuka',
            'Disiplin dengan konsekuensi logis',
            'Ekspektasi tinggi dengan dukungan',
            'Kehangatan dan responsif terhadap kebutuhan anak',
            'Mendorong kemandirian dengan bimbingan'
          ],
          impact: [
            '✅ Anak percaya diri dan mandiri',
            '✅ Kemampuan sosial yang baik',
            '✅ Prestasi akademik tinggi',
            '✅ Regulasi emosi yang sehat',
            '✅ Mampu mengambil keputusan',
            '✅ Hubungan keluarga yang hangat'
          ],
          advice: [
            'Pertahankan pola asuh ini!',
            'Konsisten dengan aturan yang ditetapkan',
            'Terus buka komunikasi dengan anak',
            'Sesuaikan batasan seiring usia anak',
            'Jadi role model yang baik'
          ]
        },
        C: {
          name: 'PERMISIF (Permissive)',
          color: '#f39c12',
          icon: '🎈',
          description: 'Pola asuh dengan sedikit batasan dan aturan. Orangtua sangat responsif tetapi kurang menuntut, memberikan kebebasan tinggi pada anak.',
          characteristics: [
            'Aturan yang sangat sedikit atau tidak ada',
            'Orangtua lebih seperti teman',
            'Tidak konsisten dalam disiplin',
            'Menghindari konfrontasi',
            'Sangat hangat dan menerima',
            'Anak membuat keputusan sendiri sejak dini'
          ],
          impact: [
            '✅ Anak kreatif dan ekspresif',
            '✅ Percaya diri dalam mengekspresikan diri',
            '❌ Kesulitan mengikuti aturan',
            '❌ Kurang disiplin diri',
            '❌ Impulsif dan sulit menunda gratifikasi',
            '❌ Masalah dalam hubungan sosial'
          ],
          advice: [
            'Tetapkan batasan yang jelas',
            'Konsisten dengan konsekuensi',
            'Ajarkan tanggung jawab',
            'Beri struktur dan rutinitas',
            'Seimbangkan kebebasan dengan guidance'
          ]
        }
      }
    },

    // ══════════════════════════════════════════════════════════════════════
    '12': {
      tesNama: 'Tipe Cinta',
      jawabanKey: ['input-tes-tipe-cinta', 'who_12'],
      tipe: 'pilihan-tertinggi',
      opsi: ['A', 'B', 'C', 'D'],
      totalSoal: 10,
      types: {
        A: {
          name: 'ROMANTIS',
          color: '#ff4757',
          icon: '💕',
          description: 'Anda menghargai hubungan yang penuh perasaan, kenangan indah, dan kedekatan emosional yang mendalam.',
          characteristics: [
            'Mengutamakan kualitas waktu bersama',
            'Menghargai gesture romantis dan kejutan',
            'Senang berbagi perasaan dan pikiran intim',
            'Mengingat tanggal-tanggal penting',
            'Ekspresif dalam menunjukkan cinta',
            'Menghargai komunikasi yang dalam'
          ],
          strengths: [
            'Koneksi emosional yang kuat',
            'Ekspresi cinta yang jelas',
            'Perhatian pada detail hubungan',
            'Komitmen emosional tinggi'
          ],
          ideal_partner: [
            'Orang yang ekspresif dan komunikatif',
            'Yang menghargai waktu berkualitas',
            'Yang romantis dan perhatian',
            'Yang tidak takut berbagi perasaan'
          ],
          tips: [
            'Berikan perhatian kecil secara konsisten',
            'Luangkan waktu berkualitas tanpa distraksi',
            'Komunikasi terbuka tentang perasaan',
            'Ciptakan momen-momen spesial bersama',
            'Ingat dan rayakan moment penting'
          ]
        },
        B: {
          name: 'DOMESTIK',
          color: '#2ed573',
          icon: '🏡',
          description: 'Anda menunjukkan cinta melalui tindakan praktis, pelayanan, dan menciptakan kenyamanan di rumah.',
          characteristics: [
            'Cinta melalui tindakan, bukan kata',
            'Menciptakan kenyamanan rumah',
            'Memasak dan merawat pasangan',
            'Melayani kebutuhan praktis pasangan',
            'Menghargai rutinitas dan stabilitas',
            'Membangun kehidupan bersama'
          ],
          strengths: [
            'Dapat diandalkan',
            'Praktis dan supportif',
            'Komitmen jangka panjang',
            'Menciptakan stabilitas'
          ],
          ideal_partner: [
            'Yang menghargai tindakan lebih dari kata',
            'Yang menghargai rumah dan keluarga',
            'Yang praktis dan ground-to-earth',
            'Yang menghargai pelayanan dan bantuan'
          ],
          tips: [
            'Bantu pasangan dalam tugas sehari-hari',
            'Ciptakan rumah yang nyaman',
            'Masak makanan kesukaan pasangan',
            'Tunjukkan cinta lewat tindakan konsisten',
            'Dukung kebutuhan praktis pasangan'
          ]
        },
        C: {
          name: 'PETUALANG',
          color: '#ffa502',
          icon: '✈️',
          description: 'Anda menunjukkan cinta melalui pengalaman baru, petualangan, dan kejutan yang menyenangkan.',
          characteristics: [
            'Cinta melalui pengalaman bersama',
            'Menyukai tantangan dan hal baru',
            'Spontan dan penuh kejutan',
            'Mencari kegembiraan dalam hubungan',
            'Benci rutinitas yang membosankan',
            'Petualangan sebagai bonding'
          ],
          strengths: [
            'Hubungan yang dinamis',
            'Selalu ada hal baru',
            'Spontanitas',
            'Kegembiraan dan antusiasme'
          ],
          ideal_partner: [
            'Yang suka petualangan',
            'Yang terbuka pada hal baru',
            'Yang fleksibel dan spontan',
            'Yang tidak suka rutinitas membosankan'
          ],
          tips: [
            'Rencanakan kejutan dan aktivitas baru',
            'Coba hal-hal baru bersama',
            'Jelajahi tempat-tempat baru',
            'Hindari rutinitas yang monoton',
            'Ciptakan kenangan petualangan bersama'
          ]
        },
        D: {
          name: 'ELEGAN',
          color: '#5352ed',
          icon: '👑',
          description: 'Anda menghargai kualitas, kemewahan, dan menunjukkan cinta melalui pemberian dan perhatian yang berkelas.',
          characteristics: [
            'Menghargai kualitas di atas kuantitas',
            'Cinta ditunjukkan lewat pemberian',
            'Menghargai kemewahan dan estetika',
            'Perhatian pada detail dan penampilan',
            'Menjaga martabat dalam hubungan',
            'Menghargai gesture yang berkelas'
          ],
          strengths: [
            'Standar tinggi',
            'Apresiasi kualitas',
            'Perhatian detail',
            'Kemewahan dalam cinta'
          ],
          ideal_partner: [
            'Yang menghargai kualitas',
            'Yang memiliki selera baik',
            'Yang sophisticated',
            'Yang menghargai pemberian berkualitas'
          ],
          tips: [
            'Berikan hadiah berkualitas, bukan mahal',
            'Perhatikan detail dalam gesture',
            'Ciptakan momen yang berkesan',
            'Jaga penampilan dan presentasi',
            'Tunjukkan apresiasi dengan cara berkelas'
          ]
        }
      }
    },

    // ══════════════════════════════════════════════════════════════════════
    '13': {
      tesNama: 'Jenis Cinta (Lee\'s Love Styles)',
      jawabanKey: ['input-tes-jenis-cinta', 'who_13'],
      tipe: 'skala-per-tipe',       // A-E → nilai 1-5, 7 soal/tipe
      opsiNilai: { A: 1, B: 2, C: 3, D: 4, E: 5 },
      typesList: ['Eros', 'Ludus', 'Storge', 'Pragma', 'Mania', 'Agape'],
      soalPerTipe: 7,
      maxPerTipe: 35,
      types: {
        Eros: {
          name: 'Eros (Cinta Romantis)',
          color: '#d63031',
          icon: '❤️‍🔥',
          description: 'Anda adalah tipe pecinta yang sangat romantis dan penuh gairah. Ketertarikan fisik dan kimia emosional sangat penting bagi Anda dalam menjalin hubungan.',
          characteristics: [
            'Sangat mementingkan chemistry dan ketertarikan fisik',
            'Mudah jatuh cinta dan merasakan perasaan yang intens',
            'Menghargai momen-momen romantis dan keintiman',
            'Cenderung idealis dalam memandang cinta'
          ],
          advice: [
            'Jangan hanya fokus pada aspek fisik, kembangkan juga koneksi emosional yang mendalam',
            'Berikan waktu untuk mengenal pasangan secara menyeluruh',
            'Kelola ekspektasi agar tetap realistis',
            'Jaga keseimbangan antara passion dan komitmen jangka panjang'
          ]
        },
        Ludus: {
          name: 'Ludus (Cinta Permainan)',
          color: '#e17055',
          icon: '🎭',
          description: 'Anda memandang cinta sebagai permainan yang menyenangkan dan petualangan. Anda menikmati kebebasan dan tidak terburu-buru untuk terikat dalam komitmen serius.',
          characteristics: [
            'Menganggap cinta sebagai sesuatu yang menyenangkan dan bebas',
            'Tidak suka terikat komitmen yang terlalu serius',
            'Menikmati proses mengenal banyak orang',
            'Cenderung menghindari drama dan konflik emosional'
          ],
          advice: [
            'Jujur dengan pasangan tentang ekspektasi Anda dalam hubungan',
            'Hormati perasaan orang lain, jangan sampai menyakiti',
            'Pertimbangkan bahwa komitmen bisa membawa kebahagiaan yang lebih mendalam',
            'Evaluasi apakah gaya cinta Anda sudah sesuai dengan tahap hidup Anda saat ini'
          ]
        },
        Storge: {
          name: 'Storge (Cinta Persahabatan)',
          color: '#00b894',
          icon: '🤗',
          description: 'Cinta Anda tumbuh dari fondasi persahabatan yang kuat. Anda membangun hubungan secara bertahap berdasarkan kepercayaan, kesamaan, dan kenyamanan bersama.',
          characteristics: [
            'Hubungan dimulai dari persahabatan yang mendalam',
            'Mengutamakan kenyamanan dan kepercayaan',
            'Cinta berkembang secara perlahan dan alami',
            'Menghargai kebersamaan dan kebiasaan bersama'
          ],
          advice: [
            'Jangan takut untuk menunjukkan sisi romantis Anda sesekali',
            'Komunikasikan perasaan cinta secara verbal, jangan hanya lewat tindakan',
            'Ciptakan momen-momen istimewa untuk menjaga api cinta tetap menyala',
            'Hargai fondasi persahabatan yang sudah Anda bangun'
          ]
        },
        Pragma: {
          name: 'Pragma (Cinta Praktis)',
          color: '#6c5ce7',
          icon: '📋',
          description: 'Anda adalah tipe yang praktis dan logis dalam memilih pasangan. Anda mempertimbangkan berbagai faktor seperti kecocokan nilai, tujuan hidup, dan kompatibilitas jangka panjang.',
          characteristics: [
            'Memilih pasangan berdasarkan kriteria yang jelas',
            'Mengutamakan kecocokan nilai, latar belakang, dan tujuan',
            'Berpikir jangka panjang dalam hubungan',
            'Realistis dan rasional dalam memandang cinta'
          ],
          advice: [
            'Jangan terlalu kaku dengan checklist, beri ruang untuk spontanitas',
            'Dengarkan juga kata hati, bukan hanya logika',
            'Ingat bahwa hubungan butuh usaha, bukan hanya kecocokan di atas kertas',
            'Belajar untuk lebih fleksibel dan menerima perbedaan'
          ]
        },
        Mania: {
          name: 'Mania (Cinta Obsesif)',
          color: '#e74c3c',
          icon: '😰',
          description: 'Anda mengalami cinta dengan intensitas yang sangat tinggi, seringkali diwarnai dengan perasaan cemburu, posesif, dan ketergantungan emosional yang kuat pada pasangan.',
          characteristics: [
            'Merasakan cinta dengan sangat intens dan mendalam',
            'Cenderung cemburu dan membutuhkan banyak perhatian',
            'Sering merasa insecure dalam hubungan',
            'Kebahagiaan sangat bergantung pada pasangan'
          ],
          advice: [
            'Kembangkan kepercayaan diri dan kemandirian emosional',
            'Belajar mengelola rasa cemburu dengan berkomunikasi secara sehat',
            'Jangan jadikan pasangan sebagai satu-satunya sumber kebahagiaan',
            'Pertimbangkan konseling jika perasaan posesif mengganggu hubungan',
            'Bangun hobi dan relasi sosial di luar hubungan romantis'
          ]
        },
        Agape: {
          name: 'Agape (Cinta Tanpa Pamrih)',
          color: '#fdcb6e',
          icon: '🕊️',
          description: 'Anda adalah pecinta sejati yang memberikan cinta tanpa syarat. Kebahagiaan pasangan adalah prioritas utama Anda, bahkan jika harus berkorban untuk mereka.',
          characteristics: [
            'Sangat peduli dan penuh kasih sayang',
            'Rela berkorban demi kebahagiaan pasangan',
            'Mencintai tanpa mengharapkan balasan',
            'Sangat setia dan komit dalam hubungan'
          ],
          advice: [
            'Jangan lupakan kebutuhan dan kebahagiaan diri sendiri',
            'Pastikan pengorbanan Anda dihargai dan tidak disalahgunakan',
            'Tetapkan batasan yang sehat dalam hubungan',
            'Cinta yang sehat adalah timbal balik, bukan satu arah',
            'Ingat bahwa mencintai diri sendiri juga penting'
          ]
        }
      }
    },

    // ══════════════════════════════════════════════════════════════════════
    '14': {
      tesNama: 'Kecanduan Hubungan',
      jawabanKey: ['input-tes-kecanduan-hubungan', 'who_14'],
      tipe: 'total-level',
      opsiNilai: { A: 3, B: 2, C: 1 },
      totalSoal: 10,
      maxSkor: 30,
      levels: [
        { key: 'high',  minScore: 25, maxScore: 30 },
        { key: 'mid',   minScore: 18, maxScore: 24 },
        { key: 'low',   minScore: 0,  maxScore: 17 }
      ],
      types: {
        high: {
          title: 'Terikat / Kecanduan Hubungan ⚠️',
          color: '#d63031',
          typeClass: 'type-A',
          description: 'Kamu mulai terikat dalam satu hubungan, berhati-hatilah. Coba kembalikan fokus dari tujuan hubungan tersebut. Jangan terlalu bergantung pada hubungan tersebut karena hubungan yang terlalu mengikat dan menjadi candu akan merugikan kedua belah pihak.',
          characteristics: [
            'Merasa sangat bergantung pada pasangan',
            'Sulit membayangkan hidup tanpa hubungan ini',
            'Hubungan menjadi pusat dari segalanya',
            'Cenderung mengabaikan kebutuhan pribadi demi hubungan',
            'Takut berlebihan akan kehilangan pasangan'
          ],
          advice: [
            'Kembalikan fokus pada tujuan hubungan yang sehat',
            'Kembangkan kemandirian emosional di luar hubungan',
            'Pertahankan hobi dan tujuan pribadi',
            'Jaga hubungan dengan keluarga dan teman-teman',
            'Tetapkan batasan yang sehat agar hubungan tidak merugikan'
          ]
        },
        mid: {
          title: 'Hubungan Ideal & Seimbang 💚',
          color: '#27ae60',
          typeClass: 'type-B',
          description: 'Kamu merasa membutuhkan sebuah hubungan, tapi tidak mau memaksakan sebuah hubungan. Cukup ideal dalam membina sebuah hubungan yang baik karena hubungan yang ideal adalah hubungan yang saling membangun tanpa harus ada pengekangan.',
          characteristics: [
            'Membutuhkan hubungan tapi tidak memaksakan',
            'Saling membangun tanpa pengekangan',
            'Memiliki kemandirian dalam hubungan',
            'Komunikasi yang terbuka dan sehat',
            'Menghargai ruang pribadi masing-masing'
          ],
          advice: [
            'Pertahankan keseimbangan yang sudah baik ini',
            'Terus komunikasikan kebutuhan dengan pasangan',
            'Dukung pertumbuhan pribadi masing-masing',
            'Jaga kualitas hubungan dengan quality time rutin',
            'Rayakan pencapaian bersama maupun individual'
          ]
        },
        low: {
          title: 'Hubungan Sebatas Pelengkap ⭐',
          color: '#f39c12',
          typeClass: 'type-C',
          description: 'Kamu menganggap hubungan hanya sebatas pelengkap, status, dan tidak terlalu penting dalam menjalaninya. Kamu bisa terlepas dari hubungannya dan cenderung tidak serius dalam menjalani hubungan tersebut.',
          characteristics: [
            'Hubungan dianggap hanya sebagai pelengkap',
            'Tidak terlalu mementingkan status hubungan',
            'Cenderung tidak serius dalam menjalani hubungan',
            'Mudah terlepas dari hubungan',
            'Kurang investasi emosional dalam hubungan'
          ],
          advice: [
            'Evaluasi kembali tujuan dan makna hubungan bagimu',
            'Komunikasikan ekspektasi dengan pasangan secara jujur',
            'Pertimbangkan apakah kamu siap berkomitmen',
            'Jangan membiarkan pasangan tanpa kejelasan',
            'Belajar untuk lebih terbuka secara emosional'
          ]
        }
      }
    },

    // ══════════════════════════════════════════════════════════════════════
    '15': {
      tesNama: 'Apakah Saya Benar-benar Mengenal Pasangan Saya?',
      jawabanKey: ['input-tes-mengenal-pasangan', 'who_15'],
      tipe: 'total-level',
      opsiNilai: { A: 1, B: 0 },
      totalSoal: 22,
      maxSkor: 22,
      levels: [
        { key: 'excellent',   minScore: 16, maxScore: 22 },
        { key: 'good',        minScore: 9,  maxScore: 15 },
        { key: 'needsWork',   minScore: 0,  maxScore: 8  }
      ],
      types: {
        excellent: {
          title: 'Hubungan Sangat Kuat! 💑',
          color: '#00b894',
          colorClass: 'excellent',
          description: 'Kamu memiliki kekuatan dalam hubungan dengan pasangan kamu. Bisa dikatakan, kamu cukup dekat dengan pasangan dan mengenalnya cukup baik. Selamat! Hubungan kamu berpotensi terus stabil dan membahagiakan.',
          characteristics: [
            'Memiliki pemahaman mendalam tentang kehidupan inner pasangan',
            'Mengetahui mimpi, harapan, dan ketakutan pasangan',
            'Sadar akan stres, kekhawatiran, dan kebahagiaan pasangan',
            'Memahami nilai-nilai hidup dan prioritas pasangan',
            'Mengenal sejarah hidup dan pengalaman penting pasangan',
            'Tahu tentang teman, keluarga, dan relasi sosial pasangan'
          ],
          strengths: [
            'Komunikasi yang sangat baik dan terbuka',
            'Empati dan pemahaman emosional yang tinggi',
            'Fondasi kepercayaan yang kuat',
            'Kemampuan untuk saling mendukung dengan efektif'
          ],
          weaknesses: null,
          advice: [
            'Pertahankan kebiasaan komunikasi yang sudah sangat baik ini',
            'Terus update pengetahuan Anda karena orang terus berkembang',
            'Jangan pernah berhenti untuk bertanya dan mendengarkan',
            'Gunakan pemahaman ini untuk terus memperkuat hubungan',
            'Rayakan keberhasilan Anda dalam membangun intimacy yang mendalam',
            'Jadilah role model bagi pasangan lain',
            'Tetap curious tentang perubahan dan perkembangan pasangan'
          ]
        },
        good: {
          title: 'Hubungan Cukup Baik ⭐',
          color: '#fdcb6e',
          colorClass: 'good',
          description: 'Saat ini adalah waktu yang sangat penting bagi kamu. Ada banyak kekuatan yang bisa kamu bangun untuk memperkokoh hubungan. Namun, ada juga beberapa hal yang harus lebih diperhatikan. Jika kamu ingin lebih berbahagia dan stabil dalam menjalin hubungan, berusahalah untuk terus membangun kedekatan dengan pasangan.',
          characteristics: [
            'Memahami aspek-aspek dasar tentang pasangan',
            'Mengetahui beberapa hal penting tentang kehidupan pasangan',
            'Komunikasi sudah berjalan namun belum optimal',
            'Ada area-area yang masih belum tergali dengan baik',
            'Pemahaman lebih ke permukaan daripada mendalam'
          ],
          strengths: [
            'Sudah memiliki fondasi yang solid untuk berkembang',
            'Ada kemauan untuk mengenal pasangan lebih baik',
            'Komunikasi dasar sudah terjalin'
          ],
          weaknesses: [
            'Kurang pengetahuan tentang kehidupan inner pasangan',
            'Belum memahami sepenuhnya mimpi dan ketakutan pasangan',
            'Perlu lebih banyak percakapan yang bermakna',
            'Mungkin terlalu fokus pada rutinitas sehari-hari'
          ],
          advice: [
            'Luangkan lebih banyak waktu untuk quality conversation',
            'Tanyakan pertanyaan yang lebih dalam tentang perasaan dan pemikiran',
            'Dengarkan dengan aktif tanpa menginterupsi',
            'Bicarakan tentang masa lalu, impian masa depan, dan ketakutan',
            'Buat ritual untuk check-in emosional secara rutin',
            'Kurangi distraksi (HP, TV) saat mengobrol',
            'Tunjukkan ketertarikan genuine terhadap dunia pasangan',
            'Catat hal-hal penting yang dibagikan pasangan'
          ]
        },
        needsWork: {
          title: 'Perlu Lebih Banyak Perhatian ⚠️',
          color: '#d63031',
          colorClass: 'needs-work',
          description: 'Hubungan kamu sedang dalam masalah. Hanya satu cara untuk membuat hubungan kamu stabil dan membahagiakan — berusahalah memperbaikinya. Kenali pasangan dengan lebih baik. Semakin kamu mengenal pasangan, semakin mudah bagi kamu untuk membangun hubungan yang membahagiakan.',
          characteristics: [
            'Kurangnya komunikasi yang mendalam',
            'Tidak tahu banyak tentang kehidupan inner pasangan',
            'Fokus lebih ke hal-hal permukaan atau eksternal',
            'Jarang berbicara tentang perasaan dan pikiran pribadi',
            'Mungkin ada emotional distance dalam hubungan'
          ],
          strengths: null,
          weaknesses: [
            'Komunikasi yang sangat terbatas atau superficial',
            'Tidak memahami kebutuhan emosional pasangan',
            'Kurangnya empati dan pemahaman mendalam',
            'Mungkin hidup parallel lives tanpa truly connect',
            'Risiko tinggi untuk growing apart'
          ],
          advice: [
            'PRIORITASKAN quality time berdua tanpa distraksi',
            'Mulai dengan percakapan ringan, lalu dalami secara bertahap',
            'Tanyakan "Bagaimana perasaanmu?" dan benar-benar dengarkan',
            'Buat jadwal date night mingguan untuk reconnect',
            'Matikan gadget dan benar-benar hadir saat bersama',
            'Bicarakan tentang hari masing-masing dengan detail',
            'Tanyakan tentang mimpi, harapan, dan ketakutan',
            'Pertimbangkan konseling pasangan jika diperlukan',
            'Baca buku tentang komunikasi dalam hubungan bersama',
            'Mulai habit untuk sharing highs and lows setiap hari',
            'Jangan anggap sepele pentingnya emotional intimacy',
            'Ingat: hubungan butuh investasi waktu dan energi'
          ]
        }
      }
    },

    // ══════════════════════════════════════════════════════════════════════
    '16': {
      tesNama: 'Apakah Saya Termasuk Orang yang Setia?',
      jawabanKey: ['input-tes-kesetiaan', 'who_16'],
      tipe: 'pointmap-level',
      totalSoal: 10,
      minSkor: 10,
      maxSkor: 30,
      pointMap: {
        1: { a: 3, b: 2, c: 1 }, 2: { a: 3, b: 2, c: 1 }, 3: { a: 1, b: 1, c: 1 },
        4: { a: 2, b: 3, c: 1 }, 5: { a: 1, b: 3, c: 2 }, 6: { a: 2, b: 3, c: 1 },
        7: { a: 2, b: 1, c: 3 }, 8: { a: 1, b: 1, c: 1 }, 9: { a: 1, b: 3, c: 2 },
        10: { a: 2, b: 1, c: 3 }
      },
      levels: [
        { key: 'adventurous', minScore: 21, maxScore: 30 },
        { key: 'loyal',       minScore: 11, maxScore: 20 },
        { key: 'rigid',       minScore: 0,  maxScore: 10 }
      ],
      types: {
        adventurous: {
          title: 'Petualang Cinta - Rentan Perselingkuhan ⚠️',
          color: '#e74c3c',
          colorClass: 'adventurous',
          description: 'Kamu termasuk gampang terjerumus dalam lubang perselingkuhan. Jangan-jangan tanpa menyadarinya, kamu merupakan tipe petualang cinta? Saat dilanda kebosanan, mencari sosok lain yang bisa memberi perhatian dan tidak pernah menyia-nyiakan kesempatan yang datang. Ada seseorang yang menarik tak segan untuk berkenalan dan berhubungan lebih lanjut. Hati-hati, meski awalnya hanya teman dekat, bukan tidak mungkin hubungan kamu akan semakin jauh dan dalam. Akan bijaksana bila kamu mulai menjaga jarak saat berhubungan dengan lawan jenis. Pikirkanlah pentingnya keutuhan kamu dengan pasangan.',
          characteristics: [
            'Mudah bosan dalam rutinitas hubungan',
            'Terbuka terhadap perhatian dari lawan jenis',
            'Cenderung mencari validasi dari luar hubungan',
            'Kurang puas dengan monotoni dalam hubungan',
            'Mungkin menikmati flirtasi atau perhatian dari orang lain',
            'Kesulitan menolak godaan ketika merasa tidak dihargai'
          ],
          risks: [
            'Rentan terhadap emotional affair atau physical affair',
            'Dapat merusak kepercayaan dalam hubungan jangka panjang',
            'Risiko kehilangan pasangan yang baik karena keputusan impulsif',
            'Potensi menyakiti banyak orang (pasangan, keluarga, dll)',
            'Dampak psikologis jangka panjang dari rasa bersalah'
          ],
          strengths: null,
          weaknesses: null,
          advice: [
            'SEGERA identifikasi trigger yang membuat Anda rentan selingkuh',
            'Komunikasikan kebutuhan Anda dengan pasangan SEBELUM mencari di luar',
            'Tetapkan boundaries yang jelas dengan lawan jenis',
            'Jangan menempatkan diri dalam situasi yang berisiko',
            'Hindari hubungan one-on-one yang intens dengan lawan jenis',
            'Jika merasa bosan, investasikan energi untuk memperbaiki hubungan',
            'Pertimbangkan konseling pasangan jika ada masalah serius',
            'Ingat konsekuensi jangka panjang dari keputusan jangka pendek',
            'Kembangkan hobby dan interest yang sehat',
            'Jaga komunikasi terbuka dengan pasangan tentang kebutuhan emosional',
            'Jika tidak bahagia, honest conversation atau ending relationship lebih baik dari selingkuh'
          ]
        },
        loyal: {
          title: 'Setia & Menyenangkan - Zona Aman 💙',
          color: '#3498db',
          colorClass: 'loyal',
          description: 'Selamat! Selain tidak mudah terbujuk rayu lawan jenis, kamu juga tipe orang yang sangat menyenangkan. Menolak tanpa harus menyakiti. Menjaga hubungan keluarga tanpa harus renggang dengan teman. Berbagai perangkap tampaknya tidak berhasil menjerat kamu. Kamu punya komitmen kuat dalam mempertahankan keutuhan rumah tangga.',
          characteristics: [
            'Memiliki komitmen yang kuat terhadap hubungan',
            'Mampu membedakan antara persahabatan dan romansa',
            'Tidak mudah terpengaruh rayuan dari lawan jenis',
            'Tetap menyenangkan tanpa menyalahi boundaries',
            'Menghargai pasangan sambil tetap bersosialisasi normal',
            'Tahu kapan harus menjauh dari situasi yang tidak tepat'
          ],
          risks: null,
          strengths: [
            'Balance antara kesetiaan dan kehidupan sosial',
            'Kepercayaan diri dalam hubungan',
            'Komunikasi yang baik dengan pasangan',
            'Boundaries yang jelas namun tidak berlebihan',
            'Mampu mempertahankan hubungan jangka panjang'
          ],
          weaknesses: null,
          advice: [
            'Pertahankan balance yang sudah baik ini',
            'Terus komunikasikan boundaries dengan pasangan',
            'Jangan pernah complacent - hubungan tetap butuh effort',
            'Keep dating your partner - jaga spark tetap hidup',
            'Appreciate pasangan Anda secara regular',
            'Tetap waspada terhadap situasi yang bisa jadi slippery slope',
            'Jadilah role model bagi teman-teman yang sedang berjuang',
            'Terus invest dalam kualitas hubungan Anda'
          ]
        },
        rigid: {
          title: 'Sangat Setia - Hitam Putih (Terlalu Kaku) 💚',
          color: '#2ecc71',
          colorClass: 'rigid',
          description: 'Kamu memang tidak gampang tertarik pada lawan jenis. Risiko perselingkuhan kamu juga sangat kecil. Hanya, hati-hati dengan jalinan relasi, baik dengan teman, rekan kerja, atau atasan bisa terganggu. Kamu dianggap sebagai orang yang tidak menyenangkan. Basa-basi sangat jauh dari kehidupan kamu. Kamu juga menganggap segala sesuatu dengan hitam putih. Jangan heran, jika banyak teman kamu akan beringsut, teman-teman kantor juga akan ogah mendekati kamu. Bagi mereka, kamu termasuk sosok yang tidak asyik diajak berteman.',
          characteristics: [
            'Prinsip kesetiaan yang sangat kuat dan tidak tergoyahkan',
            'Cenderung berpikir hitam-putih tanpa grey area',
            'Sangat hati-hati bahkan dalam interaksi biasa dengan lawan jenis',
            'Mungkin menghindari situasi sosial untuk menghindari kesalahpahaman',
            'Standar moral yang sangat tinggi untuk diri sendiri dan orang lain',
            'Kesulitan untuk bersikap casual dalam pergaulan'
          ],
          risks: null,
          strengths: [
            'Tidak akan pernah mengkhianati pasangan',
            'Dapat dipercaya sepenuhnya',
            'Konsisten dengan nilai-nilai',
            'Role model untuk kesetiaan'
          ],
          weaknesses: [
            'Mungkin dianggap terlalu serius atau tidak fun',
            'Kesulitan dalam networking atau pergaulan professional',
            'Bisa membuat teman merasa tidak nyaman',
            'Mungkin terlalu judgmental terhadap orang lain',
            'Kurang fleksibel dalam situasi sosial normal'
          ],
          advice: [
            'Kesetiaan Anda luar biasa - pertahankan itu!',
            'Namun, belajarlah untuk lebih relax dalam situasi sosial yang innocent',
            'Tidak semua interaksi dengan lawan jenis = ancaman',
            'Percayai diri sendiri dan pasangan untuk navigate social situations',
            'Jangan sampai kekakuan Anda membuat Anda isolated',
            'Ada perbedaan antara friendly dan flirty - learn the nuance',
            'Networking profesional itu penting - don\'t sabotage karir Anda',
            'Pertimbangkan bahwa sedikit fleksibilitas tidak akan merusak kesetiaan',
            'Communicate dengan pasangan tentang comfort level masing-masing',
            'Remember: being fun and loyal bukan mutually exclusive'
          ]
        }
      }
    },

    // ══════════════════════════════════════════════════════════════════════
    '17': {
      tesNama: 'Apakah Kamu Sahabat yang Baik?',
      jawabanKey: ['input-tes-sahabat', 'who_17'],
      tipe: 'pointmap-level',
      totalSoal: 10,
      maxSkor: 30,
      pointMap: {
        1: { a: 2, b: 3, c: 1 },
        2: { a: 3, b: 2, c: 1 },
        3: { a: 2, b: 3, c: 2 },
        4: { a: 1, b: 1, c: 2 },
        5: { a: 2, b: 2, c: 1 },
        6: { a: 2, b: 2, c: 3 },
        7: { a: 2, b: 1, c: 2 },
        8: { a: 2, b: 3, c: 3 },
        9: { a: 1, b: 2, c: 3 },
        10: { a: 2, b: 2, c: 3 }
      },
      dimensionLabels: [
        'Kepercayaan', 'Dukungan', 'Komunikasi', 'Empati', 'Loyalitas',
        'Kejujuran', 'Ketersediaan', 'Pengertian', 'Kebersamaan', 'Penghargaan'
      ],
      levels: [
        { key: 'sahabat', minScore: 24, maxScore: 30 },
        { key: 'dekat',   minScore: 19, maxScore: 23 },
        { key: 'biasa',   minScore: 0,  maxScore: 18 }
      ],
      types: {
        sahabat: {
          title: 'SAHABAT YANG BAIK 🌟',
          color: '#6c5ce7',
          icon: '🌟',
          description: 'Kamu adalah seorang sahabat yang baik. Kamu memiliki sikap saling membangun, pengertian, dan kebaikan. Sahabat kamu adalah orang yang beruntung karena bisa mengenal kamu. Dalam hubungannya, kamu menjadi magnet yang membuat persahabatan tampak menjadi ideal dan saling membutuhkan. Selamat!',
          characteristics: [
            'Memiliki sikap saling membangun yang luar biasa',
            'Penuh pengertian dan kebaikan kepada sahabat',
            'Menjadi magnet positif dalam persahabatan',
            'Membuat persahabatan terasa ideal dan saling membutuhkan',
            'Loyal dan setia dalam segala kondisi',
            'Menghargai dan mendukung pencapaian sahabat'
          ],
          suggestions: [
            'Pertahankan kualitas persahabatan yang sudah sangat baik ini',
            'Jadilah inspirasi bagi orang lain tentang cara menjadi sahabat yang baik',
            'Terus jaga keseimbangan antara memberi dan menerima',
            'Jangan lupa untuk tetap menjaga diri sendiri sambil mendukung orang lain'
          ]
        },
        dekat: {
          title: 'TEMAN DEKAT 💙',
          color: '#00cec9',
          icon: '💙',
          description: 'Kamu termasuk kategori teman dekat, lebih dari sekadar teman biasa. Adanya kepercayaan di dalam hubungan membuat persahabatan kamu menjadi lebih baik.',
          characteristics: [
            'Lebih dari sekadar teman biasa',
            'Ada kepercayaan yang mulai terbangun dengan baik',
            'Komunikasi yang cukup terbuka',
            'Cukup hadir untuk sahabat di saat dibutuhkan',
            'Menghargai hubungan persahabatan yang ada',
            'Masih ada ruang untuk berkembang lebih jauh'
          ],
          suggestions: [
            'Tingkatkan keterbukaan dan kepercayaan dalam persahabatan',
            'Lebih proaktif hadir saat sahabat membutuhkan',
            'Latih empati dengan lebih sering mendengarkan secara aktif',
            'Tunjukkan apresiasi lebih sering kepada sahabat',
            'Berani mengambil inisiatif untuk memperdalam hubungan'
          ]
        },
        biasa: {
          title: 'TEMAN BIASA ⭐',
          color: '#fab1a0',
          icon: '🤝',
          description: 'Kamu termasuk teman yang baik, tapi belum bisa dikatakan sebagai sahabat. Ada beberapa hal yang menjadikan kedekatan kamu dan seorang temanmu dikatakan masih memiliki batasan tertentu. Perhatian, keterbukaan, dan kepercayaan yang kamu miliki masih dalam kadar yang biasa saja.',
          characteristics: [
            'Memiliki niat baik dalam berteman',
            'Kadang hadir untuk teman, tapi tidak selalu konsisten',
            'Komunikasi cenderung terbatas pada hal-hal permukaan',
            'Empati perlu dikembangkan lebih dalam',
            'Loyalitas bergantung pada situasi',
            'Masih perlu membangun kepercayaan yang lebih kuat'
          ],
          suggestions: [
            'Pelajari cara menjadi pendengar yang lebih baik dan aktif',
            'Tunjukkan lebih banyak inisiatif dalam menjalin komunikasi',
            'Latih empati dengan mencoba memahami perspektif orang lain',
            'Jadilah lebih konsisten dalam menjaga janji dan komitmen',
            'Berani membuka diri dan berbagi dengan lebih jujur',
            'Tingkatkan ketersediaan emosional untuk teman-teman',
            'Pelajari cara memberikan dukungan yang bermakna',
            'Fokus pada kualitas interaksi, bukan hanya kuantitas',
            'Bangun kepercayaan dengan konsisten dan jujur',
            'Investasikan waktu untuk memahami teman lebih dalam'
          ]
        }
      }
    },

    // ══════════════════════════════════════════════════════════════════════
    '18': {
      tesNama: 'Apakah Pasangan Kamu Siap Menjadi Pendamping Hidup?',
      jawabanKey: ['input-tes-siap-pendamping', 'who_18'],
      tipe: 'total-level',
      opsiNilai: { A: 1, B: 2, C: 3 },
      totalSoal: 12,
      minSkor: 12,
      maxSkor: 36,
      levels: [
        { key: 'ideal',  minScore: 29, maxScore: 36 },
        { key: 'cukup',  minScore: 20, maxScore: 28 },
        { key: 'kurang', minScore: 0,  maxScore: 19 }
      ],
      types: {
        ideal: {
          title: 'Pasangan Ideal 💑',
          color: '#27ae60',
          icon: '💚',
          description: 'Kalian adalah pasangan yang cukup ideal, kalian memiliki kemandirian, saling percaya dan orientasi yang baik dalam menjalin sebuah hubungan. Jika diteruskan dan dikenalkan lebih jauh lagi, bisa jadi kamu dan pendampingmu menjadi pasangan yang baik.',
          warning: null,
          indicators: [
            { icon: '✅', text: 'Saling percaya dan menghormati', type: 'positive' },
            { icon: '✅', text: 'Memiliki kemandirian yang baik', type: 'positive' },
            { icon: '✅', text: 'Orientasi hubungan yang jelas', type: 'positive' },
            { icon: '✅', text: 'Komunikasi terbuka dan jujur', type: 'positive' },
            { icon: '✅', text: 'Saling mendukung pertumbuhan pribadi', type: 'positive' },
            { icon: '✅', text: 'Mampu menyelesaikan konflik dengan sehat', type: 'positive' }
          ],
          suggestions: [
            'Pertahankan komunikasi terbuka yang sudah terbangun dengan baik',
            'Terus kembangkan hubungan dengan mengeksplorasi minat dan hobi baru bersama',
            'Diskusikan rencana masa depan secara konkret, termasuk aspek finansial dan tempat tinggal',
            'Libatkan keluarga dari kedua belah pihak untuk membangun hubungan yang lebih luas',
            'Hadapi tantangan hidup bersama untuk memperkuat ikatan dan kepercayaan',
            'Pertimbangkan untuk mengikuti kursus pra-nikah atau konseling hubungan untuk persiapan yang lebih matang'
          ]
        },
        cukup: {
          title: 'Cukup Baik ⭐',
          color: '#f39c12',
          icon: '⭐',
          description: 'Kamu dan pasanganmu adalah pasangan yang cukup baik. Kalian memiliki beberapa fondasi yang baik namun masih ada ruang untuk berkembang lebih jauh lagi dalam hubungan.',
          warning: 'Terus tingkatkan kepercayaan, kejujuran, dan kedekatan secara pribadi agar hubungan semakin kuat.',
          indicators: [
            { icon: '✅', text: 'Ada fondasi kepercayaan yang mulai terbentuk', type: 'positive' },
            { icon: '✅', text: 'Komunikasi cukup berjalan dengan baik', type: 'positive' },
            { icon: '⚠️', text: 'Kedekatan personal masih perlu ditingkatkan', type: 'negative' },
            { icon: '⚠️', text: 'Kejujuran perlu lebih dikembangkan', type: 'negative' },
            { icon: '✅', text: 'Ada niat baik untuk membangun hubungan', type: 'positive' },
            { icon: '✅', text: 'Masih ada kesempatan untuk berkembang', type: 'positive' }
          ],
          suggestions: [
            'Luangkan lebih banyak waktu quality time untuk saling mengenal lebih dalam',
            'Tingkatkan komunikasi tentang nilai-nilai hidup dan tujuan masa depan',
            'Bangun kepercayaan dengan konsisten menepati janji dan berkata jujur',
            'Kenali keluarga dan teman dekat pasangan untuk memahami latar belakangnya',
            'Hadapi konflik kecil bersama untuk memperkuat hubungan',
            'Pertimbangkan konseling hubungan untuk panduan yang lebih terarah'
          ]
        },
        kurang: {
          title: 'Kurang Kedekatan ⚠️',
          color: '#e74c3c',
          icon: '⚠️',
          description: 'Kamu dan pasanganmu masih kurang memiliki kedekatan. Ada beberapa hal yang wajib dimiliki pasangan yang tidak kalian miliki — kurang adanya kepercayaan, kejujuran, dan kedekatan secara pribadi. Hal inilah yang akan menjadi penghambat dalam hubungan kalian nantinya.',
          warning: 'Kejujuran adalah fondasi dari hubungan yang sehat. Perbaiki fondasi ini sebelum melangkah lebih jauh.',
          indicators: [
            { icon: '❌', text: 'Kepercayaan masih sangat perlu dibangun', type: 'negative' },
            { icon: '❌', text: 'Kejujuran perlu ditingkatkan', type: 'negative' },
            { icon: '❌', text: 'Kedekatan secara pribadi masih kurang', type: 'negative' },
            { icon: '❌', text: 'Komunikasi belum cukup terbuka', type: 'negative' },
            { icon: '✅', text: 'Ada niat baik untuk membangun hubungan', type: 'positive' },
            { icon: '✅', text: 'Masih ada kesempatan untuk memperbaiki', type: 'positive' }
          ],
          suggestions: [
            'Prioritaskan membangun komunikasi yang lebih terbuka dan jujur setiap hari',
            'Identifikasi area di mana kepercayaan kurang dan buat komitmen konkret untuk membangunnya',
            'Luangkan waktu untuk percakapan mendalam tanpa distraksi',
            'Diskusikan nilai-nilai hidup masing-masing secara terbuka',
            'Selesaikan konflik secara konstruktif, jangan dihindari',
            'Pertimbangkan konseling hubungan untuk mendapatkan panduan profesional',
            'Evaluasi apakah kalian berdua benar-benar kompatibel dalam jangka panjang'
          ]
        }
      }
    }

  }; // end CONFIG

  // ─── HELPERS ──────────────────────────────────────────────────────────────

  function getJawaban(x07obj, keys) {
    for (const key of keys) {
      if (x07obj[key] !== undefined && x07obj[key] !== '') return x07obj[key];
    }
    return '';
  }

  function hitungPilihanTertinggi(jawabanArr, opsi) {
    const scores = {};
    opsi.forEach(o => scores[o] = 0);
    jawabanArr.forEach(v => { if (scores[v] !== undefined) scores[v]++; });
    let dominant = opsi[0];
    opsi.forEach(o => { if (scores[o] > scores[dominant]) dominant = o; });
    return { scores, dominant };
  }

  function hitungTotalLevel(jawabanArr, nilaiMap) {
    let total = 0;
    jawabanArr.forEach(v => { total += nilaiMap[v] || 0; });
    return total;
  }

  function hitungPointMap(jawabanArr, pointMap, totalSoal) {
    let total = 0;
    const skorList = [];
    for (let i = 1; i <= totalSoal; i++) {
      const jwb = (jawabanArr[i - 1] || '').toLowerCase();
      const point = (pointMap[i] && pointMap[i][jwb]) ? pointMap[i][jwb] : 0;
      total += point;
      skorList.push(point);
    }
    return { total, skorList };
  }

  function hitungSkalaPerTipe(jawabanArr, nilaiMap, typesList, soalPerTipe) {
    const scores = {};
    typesList.forEach((type, idx) => {
      let total = 0;
      for (let i = 0; i < soalPerTipe; i++) {
        const jawaban = jawabanArr[idx * soalPerTipe + i] || '';
        total += nilaiMap[jawaban] || 0;
      }
      scores[type] = total;
    });
    const dominant = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    return { scores, dominant };
  }

  function getLevel(total, levels) {
    for (const lv of levels) {
      if (total >= lv.minScore && total <= lv.maxScore) return lv.key;
    }
    return levels[levels.length - 1].key;
  }

  // ─── FETCH DATA ───────────────────────────────────────────────────────────

  async function fetchData(token) {
    const url = `${API_BASE}?table=nilai1_json&x_01_eq=${token}`;
    const res = await fetch(url, { headers: { 'X-Custom-Auth': AUTH_KEY } });
    const json = await res.json();
    if (!json.success || json.count === 0) throw new Error('Data tidak ditemukan');
    return json.data[0];
  }

  // ─── PROCESS PER TES ──────────────────────────────────────────────────────

  function process(tesId, rawData) {
    const cfg = CONFIG[tesId];
    if (!cfg) throw new Error(`Tes ID ${tesId} tidak dikenal`);

    const dataDiri = JSON.parse(rawData.x_02 || '{}');
    const tanggal  = dataDiri.tgl_tes || rawData.x_05 || '-';
    const x07      = JSON.parse(rawData.x_07 || '{}');
    const rawJawaban = getJawaban(x07, cfg.jawabanKey);

    if (!rawJawaban) {
      throw new Error(`Peserta belum mengerjakan ${cfg.tesNama}`);
    }

    const jawabanArr = rawJawaban.split(';').filter(v => v !== '');
    let result = { dataDiri, tanggal, config: cfg, raw: rawData };

    if (cfg.tipe === 'pilihan-tertinggi') {
      const { scores, dominant } = hitungPilihanTertinggi(jawabanArr, cfg.opsi);
      const persen = {};
      cfg.opsi.forEach(o => persen[o] = Math.round((scores[o] / cfg.totalSoal) * 100));
      result = { ...result, scores, dominant, persen, typeInfo: cfg.types[dominant] };

    } else if (cfg.tipe === 'skala-per-tipe') {
      const { scores, dominant } = hitungSkalaPerTipe(jawabanArr, cfg.opsiNilai, cfg.typesList, cfg.soalPerTipe);
      result = { ...result, scores, dominant, typeInfo: cfg.types[dominant] };

    } else if (cfg.tipe === 'total-level') {
      const total = hitungTotalLevel(jawabanArr, cfg.opsiNilai);
      const levelKey = getLevel(total, cfg.levels);
      result = { ...result, total, level: levelKey, typeInfo: cfg.types[levelKey] };

    } else if (cfg.tipe === 'pointmap-level') {
      const { total, skorList } = hitungPointMap(jawabanArr, cfg.pointMap, cfg.totalSoal);
      const levelKey = getLevel(total, cfg.levels);
      result = { ...result, total, skorList, level: levelKey, typeInfo: cfg.types[levelKey] };
    }

    return result;
  }

  // ─── PUBLIC API ───────────────────────────────────────────────────────────

  return {

    /**
     * Load data dari API + proses untuk tes tertentu
     * @param {string} tesId - '09', '12', '13', '14', '15', '16', '17', '18'
     * @returns {Promise<object>} result object siap pakai di view
     */
    load(tesId) {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      if (!token) return Promise.reject(new Error('Token tidak ditemukan di URL'));

      return fetchData(token).then(rawData => process(tesId, rawData));
    },

    /**
     * Akses raw config jika perlu
     */
    getConfig(tesId) {
      return CONFIG[tesId] || null;
    }

  };

})();