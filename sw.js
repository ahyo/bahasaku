/* Service worker Bahasaku.
 * - Saat dipasang: menyimpan seluruh aplikasi + semua materi (agar bisa dipakai offline penuh).
 * - Halaman & katalog: ambil dari jaringan dulu (agar pembaruan langsung terlihat), cadangan dari cache.
 * - Aset lain: dari cache dulu, sambil diperbarui di latar belakang.
 * Daftar file & versi diisi otomatis oleh tools/sw-manifest.mjs setelah `npm run build`. */
const VERSION = "facc50a798";
const PRECACHE = ["./","./assets/index-DSyUicjq.js","./assets/index-DcIK934-.js","./assets/index-inwZR0xc.css","./assets/pdf.min-LxgYqSTX.js","./assets/pdf.worker.min-7WEkucD6.js","./assets/pdf.worker.min-rsCePomN.mjs","./assets/web-BRNT66Ls.js","./assets/web-BcPPJDWZ.js","./assets/web-beT2amBz.js","./assets/web-ixEfTh9b.js","./data/ar-1.json","./data/ar-10.json","./data/ar-11.json","./data/ar-12.json","./data/ar-2.json","./data/ar-3.json","./data/ar-4.json","./data/ar-5.json","./data/ar-6.json","./data/ar-7.json","./data/ar-8.json","./data/ar-9.json","./data/ar-dzikir.json","./data/ar-manasik.json","./data/ar-quran.json","./data/ar-tk.json","./data/ar-toafl.json","./data/catalog.json","./data/de-1.json","./data/de-2.json","./data/en-1.json","./data/en-10.json","./data/en-11.json","./data/en-12.json","./data/en-2.json","./data/en-3.json","./data/en-4.json","./data/en-5.json","./data/en-6.json","./data/en-7.json","./data/en-8.json","./data/en-9.json","./data/en-tk.json","./data/en-toefl.json","./data/es-1.json","./data/fr-1.json","./data/hi-1.json","./data/id-1.json","./data/it-1.json","./data/ja-1.json","./data/ja-2.json","./data/ja-3.json","./data/ja-4.json","./data/ja-5.json","./data/ja-6.json","./data/ja-n4.json","./data/ja-n5.json","./data/ja-tk.json","./data/jv-1.json","./data/ko-1.json","./data/ko-2.json","./data/ms-1.json","./data/nl-1.json","./data/pt-1.json","./data/ru-1.json","./data/ru-2.json","./data/ru-3.json","./data/ru-4.json","./data/ru-5.json","./data/ru-6.json","./data/su-1.json","./data/th-1.json","./data/tl-1.json","./data/tr-1.json","./data/vi-1.json","./data/zh-1.json","./data/zh-2.json","./data/zh-3.json","./data/zh-4.json","./data/zh-5.json","./data/zh-6.json","./data/zh-hsk1.json","./data/zh-hsk2.json","./data/zh-hsk3.json","./data/zh-tk.json","./fonts/NotoNaskhArabic-400.woff2","./fonts/NotoNaskhArabic-700.woff2","./fonts/Nunito-400-normal.woff2","./fonts/Nunito-600-normal.woff2","./fonts/Nunito-700-normal.woff2","./fonts/Nunito-800-normal.woff2","./fonts/Nunito-cyrillic-400-normal.woff2","./fonts/Nunito-latin-ext-400-normal.woff2","./icons/apple-touch-icon.png","./icons/icon-192-round.png","./icons/icon-192.png","./icons/icon-512-round.png","./icons/icon-512.png","./icons/maskable-512.png","./index.html","./manifest.webmanifest"];
const CACHE = `bahasaku-${VERSION}`;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('bahasaku-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const fresh = (req) => req.mode === 'navigate' || /\/(index\.html|catalog\.json|manifest\.webmanifest)$/.test(new URL(req.url).pathname);

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // data Al-Qur'an dikelola aplikasi sendiri di cache 'quran-v1' (tidak ikut terhapus saat aplikasi diperbarui)
  if (new URL(req.url).pathname.includes('/quran/')) return;
  const put = (res) => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
    return res;
  };
  if (fresh(req)) {
    e.respondWith(fetch(req).then(put).catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => {
    const net = fetch(req).then(put).catch(() => hit);
    return hit || net;
  }));
});
