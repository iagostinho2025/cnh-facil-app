const CACHE_NAME = 'cnh-facil-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './modules/quiz.js',
  './data/questoes.json',
  './assets/images/placa_pare.png' 
];
// Nota: Se adicionar mais imagens ou ícones, precisa listar aqui depois.

// 1. Instalação: Cacheia os arquivos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Arquivos em cache com sucesso!');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// 2. Ativação: Limpa caches antigos se houver atualização
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

// 3. Interceptação: Serve o arquivo do cache se estiver offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});