// Necessário só para rodar o banco local no navegador (Expo Web).
// No Android/iOS o expo-sqlite funciona sem este arquivo.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// expo-sqlite no Web usa WebAssembly
config.resolver.assetExts.push('wasm');

// SharedArrayBuffer exige estes cabeçalhos no servidor de desenvolvimento
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    middleware(req, res, next);
  };
};

module.exports = config;