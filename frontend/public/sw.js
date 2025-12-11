// Service Worker para o Sistema Lanchonete PWA
const CACHE_NAME = 'lanchonete-v1';

// Arquivos para cache inicial
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Cache aberto');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.log('[SW] Erro ao fazer cache:', error);
            })
    );
    // Força ativação imediata
    self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Service Worker ativado');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Remove caches antigos
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    // Toma controle de todas as páginas imediatamente
    self.clients.claim();
});

// Interceptação de requisições - Network First com fallback para cache
self.addEventListener('fetch', (event) => {
    // Ignora requisições não-GET
    if (event.request.method !== 'GET') return;

    // Ignora requisições para API (sempre busca da rede)
    if (event.request.url.includes('/api/')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Se a resposta for válida, copia para o cache
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Se a rede falhar, tenta buscar do cache
                return caches.match(event.request);
            })
    );
});
