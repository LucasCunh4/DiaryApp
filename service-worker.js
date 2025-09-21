// Define o nome e a versão do cache
const CACHE_NAME = 'livros-pwa-cache-v1';

// Lista de arquivos e recursos essenciais para o funcionamento offline
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
    'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Caveat:wght@400..700&display=swap'
];

// Evento de 'install': é disparado quando o Service Worker é instalado pela primeira vez.
self.addEventListener('install', event => {
    // O waitUntil aguarda a promessa ser resolvida para garantir que a instalação não termine antes do cache ser populado.
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto com sucesso.');
                // Adiciona todos os arquivos da nossa lista ao cache.
                return cache.addAll(urlsToCache);
            })
    );
});

// Evento de 'fetch': é disparado para cada requisição que a página faz (ex: buscar CSS, JS, imagens).
self.addEventListener('fetch', event => {
    // O respondWith intercepta a requisição e nos permite fornecer uma resposta personalizada.
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Se a resposta for encontrada no cache, a retorna diretamente.
                if (response) {
                    return response;
                }
                // Se não estiver no cache, faz a requisição à rede como faria normalmente.
                return fetch(event.request);
            })
    );
});

// Evento de 'activate': é disparado quando um novo Service Worker é ativado.
// É um bom lugar para limpar caches antigos que não são mais necessários.
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME]; // Lista de caches que queremos manter.
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Se o nome do cache não estiver na nossa whitelist, ele é excluído.
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Limpando cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
