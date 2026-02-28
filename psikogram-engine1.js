/**
 * psikogram-engine.js
 * Berisi semua logika kalkulasi psikogram:
 * - Parser data dari API (x_02, x_05, x_06, x_10)
 * - Skoring CFIT → IQ
 * - Skoring EPPS → ws_ach, ws_dom, dll + konsistensi
 * - Skoring RMIB → out, mech, comp, dll
 * - Konversi skor ke skala 1-10
 * - Data statis: kekuatan_kelemahan, minat
 *
 * Cara pakai:
 *   Offline : <script src="psikogram-engine.js"></script>
 *   Online  : <script src="https://domain.com/js/psikogram-engine.js"></script>
 *
 * Setelah di-load, semua fungsi tersedia sebagai window.PsikogramEngine
 */

(function(global) {
    'use strict';

    // =========================================================
    // KONFIGURASI KEY JSON
    // Sesuaikan dengan cfg._taskId yang digunakan di file tes
    // =========================================================
    const KEY_MAP = {
        // x_05 → key JSON untuk masing-masing subtes
        CFIT1  : 'cfit1',    // skor CFIT skala 1
        CFIT2  : 'cfit2',    // skor CFIT skala 2
        CFIT3  : 'cfit3',    // skor CFIT skala 3
        CFIT4  : 'cfit4',    // skor CFIT skala 4
        TKD3   : 'tkd3',     // skor TKD verbal
        TKD6   : 'tkd6',     // skor TKD numerik

        // x_06 → key JSON untuk EPPS dan RMIB
        EPPS   : 'epps',     // jawaban EPPS (A;B;A;...)
        RMIB1  : 'rmib1',    // RMIB bagian 1
        RMIB2  : 'rmib2',    // RMIB bagian 2
        RMIB3  : 'rmib3',    // RMIB bagian 3
        RMIB4  : 'rmib4',    // RMIB bagian 4
        RMIB5  : 'rmib5',    // RMIB bagian 5
        RMIB6  : 'rmib6',    // RMIB bagian 6
        RMIB7  : 'rmib7',    // RMIB bagian 7
        RMIB8  : 'rmib8',    // RMIB bagian 8
    };

    // =========================================================
    // PARSER DATA
    // =========================================================

    function parseX02(x02) {
        // "nama;...;...;usia;...;jk|bagian2|..."
        // Format ini tetap pipe — kolom identitas tidak berubah
        const parts = (x02 || '').split('|');
        return parts.map(p => p.split(';').map(s => s.trim()));
    }

    /**
     * parseX05 — mendukung dua format:
     *   Format LAMA : "CFIT1|CFIT2|CFIT3|CFIT4|...|tkd3|...|tkd6|..."
     *   Format BARU  : '{"cfit1":"12","cfit2":"8","tkd3":"25","tkd6":"10",...}'
     * Selalu mengembalikan array berindeks sama seperti format lama
     * agar sisa kode tidak perlu diubah.
     */
    function parseX05(x05) {
        const raw = (x05 || '').trim();
        // Deteksi format JSON (dimulai dengan '{')
        if (raw.startsWith('{')) {
            try {
                const obj = JSON.parse(raw);
                // Bangun array berindeks seperti format pipe lama:
                // [0]=CFIT1, [1]=CFIT2, [2]=CFIT3, [3]=CFIT4,
                // [15]=tkd3, [17]=tkd6
                const arr = new Array(20).fill('');
                arr[0]  = obj[KEY_MAP.CFIT1] || '0';
                arr[1]  = obj[KEY_MAP.CFIT2] || '0';
                arr[2]  = obj[KEY_MAP.CFIT3] || '0';
                arr[3]  = obj[KEY_MAP.CFIT4] || '0';
                arr[15] = obj[KEY_MAP.TKD3]  || '0';
                arr[17] = obj[KEY_MAP.TKD6]  || '0';
                return arr;
            } catch(e) {
                console.warn('[PsikogramEngine] parseX05: JSON invalid, fallback ke pipe', e);
            }
        }
        // Format lama — pipe separated
        return raw.split('|').map(v => v.trim());
    }

    /**
     * parseX06 — mendukung dua format:
     *   Format LAMA : "epps_jawaban|kosong|rmib1|rmib2|...|rmib8"
     *   Format BARU  : '{"epps":"A;B;A;...","rmib1":"1;2;3;...","rmib2":...}'
     * Selalu mengembalikan array berindeks sama seperti format lama.
     */
    function parseX06(x06) {
        const raw = (x06 || '').trim();
        // Deteksi format JSON
        if (raw.startsWith('{')) {
            try {
                const obj = JSON.parse(raw);
                // Bangun array berindeks seperti format pipe lama:
                // [0]=epps, [1]=kosong, [2..9]=rmib1..rmib8
                const arr = new Array(10).fill('');
                arr[0] = obj[KEY_MAP.EPPS]  || '';
                arr[2] = obj[KEY_MAP.RMIB1] || '';
                arr[3] = obj[KEY_MAP.RMIB2] || '';
                arr[4] = obj[KEY_MAP.RMIB3] || '';
                arr[5] = obj[KEY_MAP.RMIB4] || '';
                arr[6] = obj[KEY_MAP.RMIB5] || '';
                arr[7] = obj[KEY_MAP.RMIB6] || '';
                arr[8] = obj[KEY_MAP.RMIB7] || '';
                arr[9] = obj[KEY_MAP.RMIB8] || '';
                return arr;
            } catch(e) {
                console.warn('[PsikogramEngine] parseX06: JSON invalid, fallback ke pipe', e);
            }
        }
        // Format lama — pipe separated
        return raw.split('|').map(v => v.trim());
    }

    function parseX10(x10) {
        // Setiap bagian dipisah | lalu masing-masing dipisah ;
        // Kolom ini tetap pipe — diisi manual oleh operator
        const parts = (x10 || '').split('|');
        return parts.map(p => p.split(';').map(s => s.trim()));
    }

    // =========================================================
    // SKORING CFIT → IQ
    // =========================================================

    function getIQ_cfit(skorTotal, usia) {
        const iqTable = {
            49:[183,183,183,183,183], 48:[183,183,183,179,179], 47:[183,183,179,176,176],
            46:[183,179,176,173,173], 45:[179,176,173,169,169], 44:[176,173,169,167,167],
            43:[175,171,168,165,165], 42:[171,168,165,161,161], 41:[167,163,160,157,157],
            40:[165,161,159,155,155], 39:[161,159,155,152,152], 38:[159,155,152,149,149],
            37:[155,152,149,145,145], 36:[152,149,145,142,142], 35:[150,147,144,140,140],
            34:[147,144,140,137,137], 33:[142,139,136,133,133], 32:[140,137,134,131,131],
            31:[137,134,131,128,128], 30:[134,131,128,126,124], 29:[131,128,124,123,121],
            28:[129,126,123,121,119], 27:[126,123,119,117,116], 26:[123,119,116,114,113],
            25:[119,116,113,111,109], 24:[116,113,109,108,106], 23:[113,109,106,104,103],
            22:[109,106,103,101,100], 21:[106,103,100,98,96],   20:[104,101,98,96,94],
            19:[101,98,94,93,91],     18:[98,94,91,89,88],      17:[94,91,88,86,85],
            16:[91,88,85,83,81],      15:[88,85,81,80,78],      14:[85,81,78,76,75],
            13:[81,78,75,73,72],      12:[80,76,73,72,70],      11:[76,73,70,68,67],
            10:[73,70,67,65,63],      9:[70,67,63,62,60],       8:[67,63,60,58,57],
            7:[63,60,57,56,55],       6:[60,57,55,53,52],       5:[57,55,53,51,48],
            4:[55,54,52,50,47],       3:[53,52,48,47,45],       2:[52,51,47,46,43],
            1:[50,50,46,45,40],       0:[48,48,45,43,38]
        };
        const u = parseFloat(usia) || 16;
        let ageIndex;
        if      (u >= 13.0 && u <= 13.4)  ageIndex = 0;
        else if (u >= 13.5 && u <= 13.11) ageIndex = 1;
        else if (u >= 14.0 && u <= 14.11) ageIndex = 2;
        else if (u >= 15.0 && u <= 15.11) ageIndex = 3;
        else if (u >= 16.0)               ageIndex = 4;
        else                               ageIndex = 4;

        const row = iqTable[Math.floor(skorTotal)];
        return row ? row[ageIndex] : 0;
    }

    // =========================================================
    // SKORING EPPS
    // =========================================================

    function skorEPPS(soalEpps) {
        // soalEpps: array 0-indexed, isi 'A' atau 'B'
        const s = soalEpps;
        const cntA = arr => arr.filter(v => v === 'A').length;
        const cntB = arr => arr.filter(v => v === 'B').length;

        // _r arrays (hitung A)
        const ach_r = [s[5],s[10],s[15],s[20],s[25],s[30],s[35],s[40],s[45],s[50],s[55],s[60],s[65],s[70]];
        const def_r = [s[1],s[11],s[16],s[21],s[26],s[31],s[36],s[41],s[46],s[51],s[56],s[61],s[66],s[71]];
        const ord_r = [s[2],s[7],s[17],s[22],s[27],s[32],s[37],s[42],s[47],s[52],s[57],s[62],s[67],s[72]];
        const exh_r = [s[3],s[8],s[13],s[23],s[28],s[33],s[38],s[43],s[48],s[53],s[58],s[63],s[68],s[73]];
        const aut_r = [s[4],s[9],s[14],s[19],s[29],s[34],s[39],s[44],s[49],s[54],s[59],s[64],s[69],s[74]];
        const aff_r = [s[75],s[80],s[85],s[90],s[95],s[105],s[110],s[115],s[120],s[125],s[130],s[135],s[140],s[145]];
        const int_r = [s[76],s[81],s[86],s[91],s[96],s[101],s[111],s[116],s[121],s[126],s[131],s[136],s[141],s[146]];
        const suc_r = [s[77],s[82],s[87],s[92],s[97],s[102],s[107],s[117],s[122],s[127],s[132],s[137],s[142],s[147]];
        const dom_r = [s[78],s[83],s[88],s[93],s[98],s[103],s[108],s[113],s[123],s[128],s[133],s[138],s[143],s[148]];
        const aba_r = [s[79],s[84],s[89],s[94],s[99],s[104],s[109],s[114],s[119],s[129],s[134],s[139],s[144],s[149]];
        const nur_r = [s[150],s[155],s[160],s[165],s[170],s[175],s[180],s[185],s[190],s[195],s[205],s[210],s[215],s[220]];
        const chg_r = [s[151],s[156],s[161],s[166],s[171],s[176],s[181],s[186],s[191],s[196],s[201],s[211],s[216],s[221]];
        const end_r = [s[152],s[157],s[162],s[167],s[172],s[177],s[182],s[187],s[192],s[197],s[202],s[207],s[217],s[222]];
        const het_r = [s[153],s[158],s[163],s[168],s[173],s[178],s[183],s[188],s[193],s[198],s[203],s[208],s[213],s[223]];
        const agg_r = [s[154],s[159],s[164],s[169],s[174],s[179],s[184],s[189],s[194],s[199],s[204],s[209],s[214],s[219]];

        // _c arrays (hitung B)
        const ach_c = [s[1],s[2],s[3],s[4],s[75],s[76],s[77],s[78],s[79],s[150],s[151],s[152],s[153],s[154]];
        const def_c = [s[5],s[7],s[8],s[9],s[80],s[81],s[82],s[83],s[84],s[155],s[156],s[157],s[158],s[159]];
        const ord_c = [s[10],s[11],s[13],s[14],s[85],s[86],s[87],s[88],s[89],s[160],s[161],s[162],s[163],s[164]];
        const exh_c = [s[15],s[16],s[17],s[19],s[90],s[91],s[92],s[93],s[94],s[165],s[166],s[167],s[168],s[169]];
        const aut_c = [s[20],s[21],s[22],s[23],s[95],s[96],s[97],s[98],s[99],s[170],s[171],s[172],s[173],s[174]];
        const aff_c = [s[25],s[26],s[27],s[28],s[29],s[101],s[102],s[103],s[104],s[175],s[176],s[177],s[178],s[179]];
        const int_c = [s[30],s[31],s[32],s[33],s[34],s[105],s[107],s[108],s[109],s[180],s[181],s[182],s[183],s[184]];
        const suc_c = [s[35],s[36],s[37],s[38],s[39],s[110],s[111],s[113],s[114],s[185],s[186],s[187],s[188],s[189]];
        const dom_c = [s[40],s[41],s[42],s[43],s[44],s[115],s[116],s[117],s[119],s[190],s[191],s[192],s[193],s[194]];
        const aba_c = [s[45],s[46],s[47],s[48],s[49],s[120],s[121],s[122],s[123],s[195],s[196],s[197],s[198],s[199]];
        const nur_c = [s[50],s[51],s[52],s[53],s[54],s[125],s[126],s[127],s[128],s[129],s[201],s[202],s[203],s[204]];
        const chg_c = [s[55],s[56],s[57],s[58],s[59],s[130],s[131],s[132],s[133],s[134],s[205],s[207],s[208],s[209]];
        const end_c = [s[60],s[61],s[62],s[63],s[64],s[135],s[136],s[137],s[138],s[139],s[210],s[211],s[213],s[214]];
        const het_c = [s[65],s[66],s[67],s[68],s[69],s[140],s[141],s[142],s[143],s[144],s[215],s[216],s[217],s[219]];
        const agg_c = [s[70],s[71],s[72],s[73],s[74],s[145],s[146],s[147],s[148],s[149],s[220],s[221],s[222],s[223]];

        const ach_s = cntA(ach_r) + cntB(ach_c);
        const def_s = cntA(def_r) + cntB(def_c);
        const ord_s = cntA(ord_r) + cntB(ord_c);
        const exh_s = cntA(exh_r) + cntB(exh_c);
        const out_s = cntA(aut_r) + cntB(aut_c);
        const aff_s = cntA(aff_r) + cntB(aff_c);
        const int_s = cntA(int_r) + cntB(int_c);
        const suc_s = cntA(suc_r) + cntB(suc_c);
        const dom_s = cntA(dom_r) + cntB(dom_c);
        const aba_s = cntA(aba_r) + cntB(aba_c);
        const nur_s = cntA(nur_r) + cntB(nur_c);
        const chg_s = cntA(chg_r) + cntB(chg_c);
        const end_s = cntA(end_r) + cntB(end_c);
        const het_s = cntA(het_r) + cntB(het_c);
        const agg_s = cntA(agg_r) + cntB(agg_c);

        // Konsistensi (15 pasang soal yang diulang)
        const kPairs = [
            [0,150],[6,156],[12,162],[18,168],[24,174],
            [25,100],[31,106],[37,112],[43,118],[49,124],
            [50,200],[56,206],[62,212],[68,218],[74,224]
        ];
        let konsistensi = 0;
        kPairs.forEach(([a,b]) => {
            if (s[a] && s[b] && s[a] === s[b]) konsistensi++;
        });

        // Tabel WS mapping
        const wsMap = {
            ACH_s:{28:20,27:20,26:19,25:18,24:17,23:16,22:16,21:15,20:14,19:13,18:12,17:11,16:10,15:9,14:8,13:7,12:6,11:5,10:5,9:4,8:3,7:2,6:1,5:0,4:0,3:0,2:0,1:0,0:0},
            DEF_s:{22:20,21:19,20:18,19:18,18:18,17:17,16:16,15:15,14:14,13:13,12:11,11:11,10:10,9:9,8:8,7:7,6:6,5:5,4:3,3:3,2:2,1:1,0:0},
            ORD_s:{28:20,27:19,26:19,25:18,24:17,23:17,22:16,21:15,20:15,19:14,18:13,17:13,16:12,15:11,14:10,13:9,12:9,11:8,10:7,9:7,8:6,7:5,6:5,5:4,4:3,3:3,2:2,1:1,0:1},
            EXH_s:{24:20,23:19,22:18,21:18,20:17,19:16,18:15,17:15,16:14,15:13,14:12,13:11,12:10,11:9,10:8,9:7,8:7,7:6,6:5,5:4,4:3,3:3,2:2,1:1,0:0},
            OUT_s:{21:20,20:19,19:18,18:17,17:16,16:15,15:14,14:13,13:12,12:11,11:10,10:9,9:8,8:7,7:6,6:5,5:4,4:3,3:2,2:2,1:1,0:0},
            AFF_s:{26:20,25:19,24:19,23:18,22:17,21:16,20:15,19:14,18:14,17:13,16:12,15:11,14:10,13:9,12:8,11:8,10:7,9:6,8:5,7:4,6:3,5:3,4:2,3:1,2:1,1:0},
            INT_s:{28:20,27:20,26:19,25:18,24:17,23:17,22:16,21:15,20:14,19:14,18:13,17:12,16:11,15:10,14:9,13:8,12:7,11:7,10:6,9:5,8:4,7:4,6:3,5:2,4:1,3:1,2:0,1:0},
            SUC_s:{27:20,26:19,25:19,24:18,23:17,22:17,21:16,20:15,19:15,18:14,17:13,16:13,15:12,14:11,13:10,12:9,11:9,10:8,9:7,8:7,7:6,6:5,5:4,4:4,3:3,2:2,1:1,0:1},
            DOM_s:{25:20,24:20,23:19,22:18,21:17,20:17,19:16,18:15,17:14,16:14,15:13,14:12,13:11,12:10,11:9,10:8,9:8,8:7,7:6,6:5,5:5,4:4,3:3,2:2,1:1,0:0},
            ABA_s:{29:20,28:19,27:18,26:18,25:17,24:16,23:15,22:15,21:14,20:13,19:13,18:12,17:11,16:10,15:9,14:8,13:8,12:7,11:6,10:5,9:5,8:4,7:3,6:2,5:2,4:1,3:0,2:0,1:0},
            NUR_s:{30:20,29:19,28:18,27:18,26:17,25:16,24:16,23:15,22:14,21:14,20:13,19:12,18:12,17:11,16:10,15:9,14:9,13:8,12:7,11:7,10:6,9:5,8:5,7:4,6:3,5:3,4:2,3:1,2:1,1:0},
            CHG_s:{27:20,26:19,25:18,24:18,23:17,22:16,21:16,20:15,19:14,18:13,17:13,16:12,15:11,14:10,13:9,12:9,11:8,10:7,9:6,8:6,7:5,6:4,5:3,4:3,3:2,2:1,1:1,0:0},
            END_s:{30:20,29:19,28:18,27:17,26:17,25:16,24:16,23:15,22:14,21:14,20:13,19:13,18:12,17:12,16:11,15:10,14:9,13:9,12:8,11:7,10:7,9:6,8:6,7:5,6:4,5:4,4:3,3:3,2:2,1:1,0:1},
            HET_s:{26:20,25:19,24:19,23:18,22:18,21:17,20:17,19:16,18:16,17:15,16:15,15:14,14:14,13:13,12:12,11:12,10:11,9:11,8:10,7:9,6:9,5:8,4:8,3:7,2:7,1:6,0:5},
            AGG_s:{27:20,26:19,25:18,24:18,23:17,22:16,21:16,20:15,19:14,18:14,17:13,16:12,15:12,14:11,13:10,12:9,11:9,10:8,9:7,8:7,7:6,6:5,5:5,4:4,3:3,2:3,1:2,0:1}
        };

        function getWS(ss, type) {
            const m = wsMap[type];
            if (!m) return 0;
            const keys = Object.keys(m).map(Number).sort((a,b) => b - a);
            for (const k of keys) {
                if (ss >= k) return m[k];
            }
            return 0;
        }

        return {
            ws_ach: getWS(ach_s, 'ACH_s'),
            ws_def: getWS(def_s, 'DEF_s'),
            ws_ord: getWS(ord_s, 'ORD_s'),
            ws_exh: getWS(exh_s, 'EXH_s'),
            ws_out: getWS(out_s, 'OUT_s'),
            ws_aff: getWS(aff_s, 'AFF_s'),
            ws_int: getWS(int_s, 'INT_s'),
            ws_suc: getWS(suc_s, 'SUC_s'),
            ws_dom: getWS(dom_s, 'DOM_s'),
            ws_aba: getWS(aba_s, 'ABA_s'),
            ws_nur: getWS(nur_s, 'NUR_s'),
            ws_chg: getWS(chg_s, 'CHG_s'),
            ws_end: getWS(end_s, 'END_s'),
            ws_het: getWS(het_s, 'HET_s'),
            ws_agg: getWS(agg_s, 'AGG_s'),
            konsistensi
        };
    }

    // =========================================================
    // SKORING RMIB
    // =========================================================

    function skorRMIB(soalRmib) {
        const v = i => parseInt(soalRmib[i - 1]) || 0;
        return {
            out:     v(1)+v(24)+v(35)+v(46)+v(57)+v(68)+v(79)+v(90),
            mech:    v(2)+v(13)+v(36)+v(47)+v(58)+v(69)+v(80)+v(91),
            comp:    v(3)+v(14)+v(25)+v(48)+v(59)+v(70)+v(81)+v(92),
            acie:    v(4)+v(15)+v(26)+v(37)+v(60)+v(71)+v(82)+v(93),
            pers:    v(5)+v(16)+v(27)+v(38)+v(49)+v(72)+v(83)+v(94),
            aesth:   v(6)+v(17)+v(28)+v(39)+v(50)+v(61)+v(84)+v(95),
            lite:    v(7)+v(18)+v(29)+v(40)+v(51)+v(62)+v(73)+v(96),
            mus:     v(8)+v(19)+v(30)+v(41)+v(52)+v(63)+v(74)+v(85),
            sos_wer: v(9)+v(20)+v(31)+v(42)+v(53)+v(64)+v(75)+v(86),
            cler:    v(10)+v(21)+v(32)+v(43)+v(54)+v(65)+v(76)+v(87),
            prac:    v(11)+v(22)+v(33)+v(44)+v(55)+v(66)+v(77)+v(88),
            med:     v(12)+v(23)+v(34)+v(45)+v(56)+v(67)+v(78)+v(89)
        };
    }

    // =========================================================
    // KONVERSI SKOR KE SKALA 1–10
    // =========================================================

    function getScore(value, type) {
        const criteria = {
            iq:   [[60,1],[69,2],[79,3],[89,4],[99,5],[109,6],[119,7],[129,8],[139,9],[Infinity,10]],
            cfit: [[2,1],[3,2],[4,3],[5,4],[7,5],[8,6],[9,7],[10,8],[11,9],[Infinity,10]],
            tkd3: [[12,1],[16,2],[20,3],[23,4],[27,5],[31,6],[35,7],[38,8],[40,9],[Infinity,10]],
            tkd6: [[2,1],[5,2],[9,3],[12,4],[16,5],[19,6],[23,7],[26,8],[30,9],[Infinity,10]],
            ach:  [[2,1],[4,2],[6,3],[8,4],[10,5],[12,6],[14,7],[16,8],[18,9],[Infinity,10]]
        };
        const crit = criteria[type] || criteria.ach;
        for (const [limit, score] of crit) {
            if (value <= limit) return score;
        }
        return 10;
    }

    // =========================================================
    // FUNGSI UTAMA: hitung semua skor dari raw data API
    // =========================================================

    function hitungPsikogram(data) {
        const x02 = data['x_02'] || '';
        const x05 = data['x_05'] || '';
        const x06 = data['x_06'] || '';
        const x10 = data['x_10'] || '';

        const nama    = parseX02(x02);
        const nilai05 = parseX05(x05);
        const x6arr   = parseX06(x06);
        const hasil10 = parseX10(x10);

        const usia = parseFloat(nama[0] ? nama[0][4] : 16) || 16;

        // CFIT
        const CFIT1 = parseInt(nilai05[0]) || 0;
        const CFIT2 = parseInt(nilai05[1]) || 0;
        const CFIT3 = parseInt(nilai05[2]) || 0;
        const CFIT4 = parseInt(nilai05[3]) || 0;
        const skorCFIT = CFIT1 + CFIT2 + CFIT3 + CFIT4;
        const iqCalc = getIQ_cfit(skorCFIT, usia);

        // Gunakan override dari hasil10[0][3] jika ada
        const IQ = (hasil10[0] && hasil10[0][3] && parseInt(hasil10[0][3]) !== 0)
            ? parseInt(hasil10[0][3]) : iqCalc;

        const tkd3 = parseFloat(nilai05[15]) || 0;
        const tkd6 = parseFloat(nilai05[17]) || 0;

        // EPPS
        const soalEppsStr = x6arr[0] || '';
        const soalEpps = soalEppsStr.split(';').map(v => v.trim());
        const epps = skorEPPS(soalEpps);

        const ACH = epps.ws_ach;
        const DOM = epps.ws_dom;
        const AUT = epps.ws_out;
        const EXH = epps.ws_exh;
        const AFF = epps.ws_aff;
        const DEF = epps.ws_def;
        const ORD = epps.ws_ord;

        // RMIB
        const rmibStr = [x6arr[2],x6arr[3],x6arr[4],x6arr[5],x6arr[6],x6arr[7],x6arr[8],x6arr[9]]
            .filter(Boolean).join('; ');
        const soalRmib = rmibStr.split(';').map(v => v.trim());
        const rmib = skorRMIB(soalRmib);

        // Skor skala 1–10 (14 aspek psikologis)
        let resultScores = [
            getScore(IQ, 'iq'),                        // 0: Kemampuan Umum
            getScore(CFIT2, 'cfit'),                   // 1: Daya Tangkap Visual
            getScore((CFIT1 + CFIT4) / 2, 'cfit'),    // 2: Berpikir Logis
            getScore(CFIT3, 'cfit'),                   // 3: Berpikir Abstrak
            getScore(tkd3, 'tkd3'),                    // 4: Penalaran Verbal
            getScore(tkd6, 'tkd6'),                    // 5: Penalaran Numerik
            getScore(ACH, 'ach'),                      // 6: Hasrat Berprestasi
            getScore((DOM + ACH + AUT) / 3, 'ach'),   // 7: Daya Tahan Stress
            getScore(EXH, 'ach'),                      // 8: Kepercayaan Diri
            getScore(AFF, 'ach'),                      // 9: Relasi Sosial
            getScore(DEF, 'ach'),                      // 10: Kerjasama
            getScore(ORD, 'ach'),                      // 11: Sistematika Kerja
            getScore((DOM + ACH + AUT) / 3, 'ach'),   // 12: Inisiatif
            getScore(AUT, 'ach')                       // 13: Kemandirian
        ];

        // Override dengan hasil10[1] jika ada nilai tidak kosong/0
        for (let i = 0; i <= 13; i++) {
            if (hasil10[1] && hasil10[1][i] && parseInt(hasil10[1][i]) !== 0) {
                resultScores[i] = parseInt(hasil10[1][i]);
            }
        }

        // Minat RMIB: urutkan dari terkecil (3 arah minat utama)
        const totalsRmib = {
            'OUT': rmib.out, 'MECH': rmib.mech, 'COMP': rmib.comp,
            'ACIE': rmib.acie, 'PERS': rmib.pers, 'AESTH': rmib.aesth,
            'LITE': rmib.lite, 'MUS': rmib.mus, 'SOS. WERV': rmib.sos_wer,
            'CLER': rmib.cler, 'PRAC': rmib.prac, 'MED': rmib.med
        };
        const sortedMinat = Object.entries(totalsRmib).sort((a, b) => a[1] - b[1]);
        const minat3 = sortedMinat.slice(0, 3).map(([key], j) => ({
            singkatan: key,
            namaOverride: hasil10[5] && hasil10[5][j] && hasil10[5][j].trim() !== '' ? hasil10[5][j].trim() : null,
            ketOverride:  hasil10[6] && hasil10[6][j] && hasil10[6][j].trim() !== '' ? hasil10[6][j].trim() : null
        }));

        // Kelebihan / Kelemahan / Rekomendasi berdasarkan skor tertinggi & terendah
        const indexed = resultScores.map((v, i) => ({ value: v, index: i }));
        const sorted_desc = [...indexed].sort((a, b) => b.value - a.value);
        const sorted_asc  = [...indexed].sort((a, b) => a.value - b.value);

        const getKelebihan = i => hasil10[2] && hasil10[2][i] && hasil10[2][i].trim() !== ''
            ? hasil10[2][i].trim() : null;
        const getKelemahan = i => hasil10[3] && hasil10[3][i] && hasil10[3][i].trim() !== ''
            ? hasil10[3][i].trim() : null;
        const getReko = i => hasil10[4] && hasil10[4][i] && hasil10[4][i].trim() !== ''
            ? hasil10[4][i].trim() : null;

        return {
            // Identitas
            identitas: {
                nama:    nama[0] ? nama[0][0]  : '',
                jk:      nama[0] ? nama[0][8]  : '',
                usia:    nama[0] ? nama[0][4]  : '',
                tanggal: hasil10[0] ? hasil10[0][1] : '',
                tanggalTTD: hasil10[0] ? hasil10[0][4] : ''
            },
            // Skor
            IQ,
            resultScores,
            konsistensi: epps.konsistensi,
            // Indeks terurut untuk kelebihan & kelemahan
            sorted_desc,
            sorted_asc,
            // Override teks (null = pakai default dari data statis)
            kelebihan:  [getKelebihan(0), getKelebihan(1), getKelebihan(2)],
            kelemahan:  [getKelemahan(0), getKelemahan(1), getKelemahan(2)],
            rekomendasi:[getReko(0),      getReko(1),      getReko(2)],
            minat3
        };
    }

    // =========================================================
    // DATA STATIS
    // =========================================================

    const kekuatanKelemahan = [
        {teks1:"Kemampuan Umum",          teks2:"Mampu menemukan solusi untuk berbagai masalah dengan efektif.",                                           teks3:"Kesulitan menghadapi masalah yang sangat kompleks.",                           teks5:"Disarankan untuk melatih kemampuan pemecahan masalah dengan mengikuti simulasi kasus kompleks dan berpartisipasi dalam diskusi kelompok, sehingga dapat meningkatkan ketahanan dalam menghadapi tantangan yang lebih besar."},
        {teks1:"Daya Tangkap Visual",     teks2:"Cepat mengenali pola dan perbedaan di lingkungan sekitar.",                                              teks3:"Kurang perhatian terhadap detail yang lebih kecil, yang mempengaruhi hasil akhir.", teks5:"Sangat dianjurkan untuk mempraktikkan teknik mindfulness yang dapat membantu meningkatkan fokus terhadap detail kecil, sehingga hasil kerja dapat lebih maksimal dan akurat."},
        {teks1:"Kemampuan Berpikir Logis",teks2:"Mampu membuat keputusan berdasarkan alasan yang jelas dalam situasi tertentu.",                           teks3:"Kesulitan membuat keputusan cepat dalam situasi mendesak.",                    teks5:"Sebaiknya mengikuti pelatihan khusus yang dirancang untuk pengambilan keputusan di bawah tekanan, agar dapat meningkatkan kecepatan dan ketepatan dalam mengambil keputusan ketika situasi mendesak."},
        {teks1:"Kemampuan Berpikir Abstrak",teks2:"Mampu melihat hubungan antara berbagai hal dan memahami konsekuensi dari tindakan.",                   teks3:"Tantangan dalam menerjemahkan ide-ide abstrak ke dalam praktik.",              teks5:"Disarankan untuk melakukan proyek kecil yang akan membantu menerapkan ide-ide abstrak ke dalam praktik nyata, sehingga dapat belajar dari pengalaman dan meningkatkan kemampuan penerapan ide."},
        {teks1:"Penalaran Verbal",         teks2:"Mampu berkomunikasi dengan jelas dan efektif dalam interaksi.",                                          teks3:"Kurang sabar dalam mendengarkan pandangan orang lain, yang menghambat komunikasi.", teks5:"Sangat bermanfaat untuk melatih keterampilan mendengarkan aktif melalui kegiatan role-playing, yang dapat meningkatkan kemampuan untuk menghargai pandangan orang lain dan memperbaiki komunikasi."},
        {teks1:"Penalaran Numerik",        teks2:"Kemampuan memahami proses hitung dan berpikir teratur.",                                                 teks3:"Memerlukan waktu lebih lama untuk memahami konsep matematika yang lebih rumit.", teks5:"Disarankan untuk berlatih secara rutin dengan soal-soal matematika yang lebih kompleks, agar dapat meningkatkan kecepatan dan pemahaman dalam konsep yang rumit."},
        {teks1:"Hasrat Berprestasi",       teks2:"Keinginan untuk mencapai dan meningkatkan prestasi.",                                                    teks3:"Beban ekspektasi tinggi dapat memengaruhi fokus dan kinerja.",                 teks5:"Sangat penting untuk menetapkan tujuan yang realistis dan melakukan evaluasi berkala, agar dapat menjaga motivasi dan fokus pada pencapaian yang lebih terukur."},
        {teks1:"Daya Tahan Stress",        teks2:"Kemampuan mempertahankan kinerja.",                                                                      teks3:"Kewalahan saat menghadapi tekanan yang berkepanjangan.",                       teks5:"Sebaiknya mempraktikkan teknik relaksasi dan manajemen waktu yang efektif, sehingga dapat mengurangi stres dan meningkatkan performa dalam menghadapi tekanan."},
        {teks1:"Kepercayaan Diri",         teks2:"Adanya keyakinan terhadap kemampuan yang dimiliki.",                                                     teks3:"Kurang terbuka terhadap kritik konstruktif, yang menghambat perkembangan.",   teks5:"Disarankan untuk secara rutin meminta umpan balik dari orang lain, sehingga dapat membangun kepercayaan diri yang lebih solid dan meningkatkan kemampuan untuk menerima kritik."},
        {teks1:"Relasi Sosial",            teks2:"Kemampuan membina hubungan dengan orang lain.",                                                          teks3:"Canggung dalam situasi sosial baru, yang menghambat interaksi.",              teks5:"Sangat dianjurkan untuk bergabung dengan kelompok sosial atau komunitas yang diminati, sehingga dapat berlatih keterampilan interaksi dan membangun hubungan yang lebih baik."},
        {teks1:"Kerjasama",               teks2:"Kemampuan bekerjasama individu atau berkelompok.",                                                        teks3:"Kesulitan beradaptasi dengan dinamika kelompok yang berbeda.",                 teks5:"Disarankan untuk terlibat dalam berbagai aktivitas kelompok yang memerlukan kolaborasi, agar dapat meningkatkan kemampuan untuk beradaptasi dengan berbagai dinamika kelompok."},
        {teks1:"Sistematika Kerja",        teks2:"Kemampuan membuat perencanaan & prioritas kerja.",                                                       teks3:"Terlalu fokus pada perencanaan, sehingga mengabaikan implementasi.",          teks5:"Sebaiknya tentukan batas waktu untuk setiap fase implementasi, agar tidak terjebak dalam perencanaan yang berlarut-larut dan dapat segera memulai eksekusi."},
        {teks1:"Inisiatif",               teks2:"Kemampuan mengambil tindakan yang diperlukan.",                                                           teks3:"Pengambilan keputusan yang terburu-buru berisiko tinggi.",                    teks5:"Disarankan untuk selalu mempertimbangkan pro dan kontra secara mendalam sebelum mengambil keputusan, agar dapat mengurangi risiko yang mungkin timbul dari keputusan yang terburu-buru."},
        {teks1:"Kemandirian",             teks2:"Kemampuan mengambil sikap dan bekerja sendiri.",                                                          teks3:"Kesulitan dalam berkolaborasi dengan tim, yang dapat memengaruhi hasil kerja.", teks5:"Sangat penting untuk terlibat dalam proyek kolaboratif yang dapat membantu meningkatkan keterampilan kerja sama dan beradaptasi dalam lingkungan tim."}
    ];

    const minatData = [
        {arah_minat:"OUTDOOR",        singkatan:"OUT",       keterangan_minat:"Minat ini melibatkan berbagai aktivitas yang dilakukan di luar ruangan, seperti kegiatan outbound yang meningkatkan keterampilan tim, travelling untuk menjelajahi tempat-tempat baru, dan eksplorasi pertambangan yang memberikan wawasan tentang sumber daya alam serta teknik penambangan."},
        {arah_minat:"LITERATURE",     singkatan:"LITE",      keterangan_minat:"Bidang ini berfokus pada literatur dan berbagai karya tulis, mencakup profesi seperti ahli perpustakaan yang bertanggung jawab untuk mengelola koleksi buku, serta petugas administrasi yang mendukung organisasi dan penyebaran informasi dalam institusi literasi."},
        {arah_minat:"MECHANICAL",     singkatan:"MECH",      keterangan_minat:"Minat ini terkait dengan ilmu mekanik dan teknik, yang mencakup berbagai disiplin seperti teknik mesin yang merancang dan memproduksi mesin, serta teknik sipil yang merencanakan dan membangun infrastruktur seperti jembatan dan gedung."},
        {arah_minat:"MUSICAL",        singkatan:"MUS",       keterangan_minat:"Minat di bidang musik ini mencakup kemampuan untuk menciptakan, memainkan, atau menginterpretasikan karya musik, yang bisa termasuk profesi seperti komposer yang merangkai melodi serta pemain musik yang tampil di berbagai acara dan pertunjukan."},
        {arah_minat:"COMPUTATIONAL",  singkatan:"COMP",      keterangan_minat:"Bidang ini berfokus pada keterampilan analisis dan perhitungan, mencakup profesi seperti akuntan yang bertanggung jawab untuk pencatatan dan pelaporan keuangan, serta ahli pembukuan yang mengelola catatan transaksi untuk bisnis dan organisasi."},
        {arah_minat:"SOCIAL SERVICE", singkatan:"SOS. WERV", keterangan_minat:"Minat ini berkaitan dengan pelayanan sosial dan komunitas, mencakup peran sebagai sukarelawan yang memberikan bantuan kepada yang membutuhkan, pekerja sosial yang membantu individu dan keluarga dalam kesulitan, serta psikolog yang memberikan dukungan mental dan emosional."},
        {arah_minat:"SCIENTIFIC",     singkatan:"ACIE",      keterangan_minat:"Minat di bidang scientific ini melibatkan penelitian dan eksperimen untuk mengembangkan pengetahuan baru, mencakup profesi seperti peneliti yang melakukan studi ilmiah dan ahli matematika yang menerapkan teori matematika dalam berbagai aplikasi praktis."},
        {arah_minat:"CLERICAL",       singkatan:"CLER",      keterangan_minat:"Bidang ini berfokus pada keterampilan administratif dan organisasi, mencakup peran sebagai sekretaris yang mengelola jadwal dan dokumen, serta notulen yang mendokumentasikan rapat dan kegiatan penting dalam suatu organisasi."},
        {arah_minat:"PERSUASIVE",     singkatan:"PERS",      keterangan_minat:"Minat ini berhubungan dengan kemampuan berkomunikasi dan mempengaruhi orang lain, mencakup profesi seperti ahli komunikasi yang merancang strategi komunikasi efektif, serta marketing yang mempromosikan produk dan layanan kepada konsumen."},
        {arah_minat:"PRACTICAL",      singkatan:"PRAC",      keterangan_minat:"Minat ini berfokus pada keterampilan praktis dan teknis, mencakup peran sebagai montir yang memperbaiki dan merawat kendaraan, serta ahli perbaikan mesin yang menangani berbagai masalah teknis pada peralatan dan alat-alat industri."},
        {arah_minat:"AESTHETIC",      singkatan:"AESTH",     keterangan_minat:"Minat ini mencakup kemampuan kreatif dalam seni dan desain, termasuk profesi seperti pelukis yang menciptakan karya seni visual, seniman patung yang membuat patung dari berbagai bahan, serta arsitek yang merancang bangunan dengan mempertimbangkan fungsi dan estetika."},
        {arah_minat:"MEDICAL",        singkatan:"MED",       keterangan_minat:"Minat ini berkaitan dengan bidang medis dan kesehatan, mencakup profesi seperti dokter yang mendiagnosis dan merawat penyakit, perawat yang memberikan perawatan langsung kepada pasien, serta ahli kesehatan yang berfokus pada pencegahan penyakit dan promosi kesehatan."}
    ];

    const aspekPsikologis = [
        // [section_header, nama_aspek, keterangan]  — section null = tidak ada header baru
        ['KEMAMPUAN',  'Kemampuan Umum',           'Mampu menemukan solusi untuk berbagai masalah dengan efektif.'],
        [null,         'Daya Tangkap Visual',       'Cepat mengenali pola dan perbedaan di lingkungan sekitar.'],
        [null,         'Kemampuan Berpikir Logis',  'Mampu membuat keputusan berdasarkan alasan yang jelas dalam situasi tertentu.'],
        [null,         'Kemampuan Berpikir Abstrak','Mampu melihat hubungan antara berbagai hal dan memahami konsekuensi dari tindakan.'],
        [null,         'Penalaran Verbal',          'Mampu berkomunikasi dengan jelas dan efektif dalam interaksi.'],
        [null,         'Penalaran Numerik',         'Kemampuan memahami proses hitung dan berpikir teratur'],
        ['KEPRIBADIAN','Hasrat Berprestasi',        'Keinginan untuk mencapai dan meningkatkan prestasi'],
        [null,         'Daya Tahan Stress',         'Kemampuan mempertahankan kinerja'],
        [null,         'Kepercayaan Diri',          'Adanya keyakinan terhadap kemampuan yang dimiliki'],
        [null,         'Relasi Sosial',             'Kemampuan membina hubungan dengan orang lain'],
        [null,         'Kerjasama',                 'Kemampuan bekerjasama individu atau berkelompok'],
        ['SIKAP KERJA','Sistematika Kerja',         'Kemampuan membuat perencanaan & prioritas kerja'],
        [null,         'Inisiatif',                 'Kemampuan mengambil tindakan yang diperlukan'],
        [null,         'Kemandirian',               'Kemampuan mengambil sikap dan bekerja sendiri']
    ];

    // =========================================================
    // EXPORT: semua yang dibutuhkan file tampilan
    // =========================================================
    global.PsikogramEngine = {
        // Fungsi utama — panggil ini dari psikogram.html
        hitungPsikogram,
        // Data statis — dipakai untuk render teks default
        kekuatanKelemahan,
        minatData,
        aspekPsikologis
    };

})(window);