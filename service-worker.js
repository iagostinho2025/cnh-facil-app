const CACHE_NAME = 'cnh-facil-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './modules/quiz.js',
  './data/questoes.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  
  // Imagens obrigatórias (Placas)
  './assets/images/placa_pare.png',
  './assets/images/placa_r2.png',
  './assets/images/placa_r3.png',
  './assets/images/placa_r6a.png',
  './assets/images/placa_r6b.png',
  './assets/images/placa_r6c.png',
  './assets/images/placa_r19.png',
  './assets/images/placa_r24a.png',
  './assets/images/placa_r28.png',
  './assets/images/placa_r33.png',
  './assets/images/placa_r4a.png',
  './assets/images/placa_a18.png',
  './assets/images/placa_a32b.png',
  './assets/images/placa_a24.png',
  './assets/images/placa_a14.png',
  './assets/images/placa_a33a.png',
  './assets/images/placa_a1b.png',
  './assets/images/placa_a42a.png',
  './assets/images/placa_a8.png',
  './assets/images/placa_a30a.png',
  './assets/images/placa_r10.png',
  './assets/images/placa_r5a.png',
  './assets/images/placa_r32.png',
  './assets/images/placa_r34.png',
  './assets/images/placa_r14.png',
  './assets/images/placa_r20.png',
  './assets/images/placa_r29.png',
  './assets/images/placa_r7.png',
  './assets/images/placa_r25d.png',
  './assets/images/placa_r25b.png',
  './assets/images/placa_a22.png',
  './assets/images/placa_a28.png',
  './assets/images/placa_a3b.png',
  './assets/images/placa_a36.png',
  './assets/images/placa_a34.png',
  './assets/images/placa_a6.png',
  './assets/images/placa_a21a.png'
];

// Instalação: Baixa os arquivos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Ativação: Limpa caches antigos se mudar a versão
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});

// Interceptação: Serve o arquivo do cache se estiver offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});