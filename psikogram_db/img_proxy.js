// functions/api/img_proxy.js
// Proxy sederhana untuk gambar di psikogram.lidan.co.id/gambar/*
// Dipakai supaya browser (dan html2canvas) selalu dapat gambar yang sama,
// dengan header CORS yang konsisten — tanpa bergantung pada proteksi
// edge/bot di server asal yang perilakunya bisa berubah-ubah.

const ALLOWED_FILES = new Set([
    'himpsi_qrcode_karina.jpeg',
    'ttd.png',
    'stempel.png',
    'logo1.png',
    // tambahkan nama file lain di /gambar/ yang perlu diproxy di sini
]);

export async function onRequestGet({ request }) {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get('file');

    if (!file || !ALLOWED_FILES.has(file)) {
        return new Response('File tidak diizinkan', { status: 403 });
    }

    const upstream = await fetch(`https://psikogram.lidan.co.id/gambar/${file}`, {
        // Cloudflare edge cache di level Worker sendiri, terpisah dari cache browser
        cf: { cacheTtl: 14400, cacheEverything: true },
    });

    if (!upstream.ok) {
        return new Response('Gagal mengambil gambar sumber (status ' + upstream.status + ')', {
            status: 502,
        });
    }

    const contentType = upstream.headers.get('content-type') || '';
    // Jaga-jaga: kalau server asal balas HTML (halaman challenge/error) bukan gambar,
    // jangan diteruskan sebagai "berhasil" — supaya gagalnya kelihatan jelas, bukan
    // jadi kotak putih misterius lagi.
    if (!contentType.startsWith('image/')) {
        return new Response('Server sumber tidak mengembalikan gambar (content-type: ' + contentType + ')', {
            status: 502,
        });
    }

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 'public, max-age=14400');

    return new Response(upstream.body, { status: 200, headers });
}
