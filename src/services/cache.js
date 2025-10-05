/**
 * Servicio de caché para ubicaciones analizadas
 * Usa localStorage para persistir datos entre sesiones
 */

const CACHE_KEY = 'crop_analysis_cache';
const MAX_CACHE_SIZE = 50; // Máximo 50 ubicaciones en caché
const CACHE_EXPIRY_DAYS = 7; // Los datos expiran después de 7 días

/**
 * Obtiene la clave de caché para una ubicación
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {string} Clave de caché
 */
const getCacheKey = (lat, lng) => {
  // Redondear a 4 decimales para agrupar ubicaciones cercanas
  const roundedLat = Math.round(lat * 10000) / 10000;
  const roundedLng = Math.round(lng * 10000) / 10000;
  return `${roundedLat},${roundedLng}`;
};

/**
 * Obtiene el caché completo desde localStorage
 * @returns {Object} Caché de ubicaciones
 */
export const getCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return {};
    
    const cache = JSON.parse(cached);
    
    // Limpiar entradas expiradas
    const now = Date.now();
    const cleanedCache = {};
    
    Object.entries(cache).forEach(([key, value]) => {
      if (now - value.timestamp < CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000) {
        cleanedCache[key] = value;
      }
    });
    
    // Guardar caché limpio si se removieron entradas
    if (Object.keys(cleanedCache).length !== Object.keys(cache).length) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cleanedCache));
    }
    
    return cleanedCache;
  } catch (error) {
    console.error('Error loading cache:', error);
    return {};
  }
};

/**
 * Guarda una ubicación en el caché
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @param {Object} locationInfo - Información de la ubicación
 * @param {Object} cropData - Datos de análisis de cultivos
 */
export const saveToCache = (lat, lng, locationInfo, cropData) => {
  try {
    const cache = getCache();
    const key = getCacheKey(lat, lng);
    
    const cacheEntry = {
      lat,
      lng,
      locationInfo,
      cropData,
      timestamp: Date.now()
    };
    
    cache[key] = cacheEntry;
    
    // Limitar tamaño del caché
    const entries = Object.entries(cache);
    if (entries.length > MAX_CACHE_SIZE) {
      // Ordenar por timestamp y mantener solo los más recientes
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      const limitedCache = {};
      entries.slice(0, MAX_CACHE_SIZE).forEach(([k, v]) => {
        limitedCache[k] = v;
      });
      localStorage.setItem(CACHE_KEY, JSON.stringify(limitedCache));
    } else {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    }
    
    console.log(`Ubicación guardada en caché: ${key}`);
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

/**
 * Busca una ubicación en el caché
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {Object|null} Datos de la ubicación o null si no existe
 */
export const getFromCache = (lat, lng) => {
  try {
    const cache = getCache();
    const key = getCacheKey(lat, lng);
    const entry = cache[key];
    
    if (entry) {
      console.log(`Ubicación encontrada en caché: ${key}`);
      return {
        locationInfo: entry.locationInfo,
        cropData: entry.cropData,
        fromCache: true
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error loading from cache:', error);
    return null;
  }
};

/**
 * Obtiene todas las ubicaciones en caché
 * @returns {Array} Lista de ubicaciones cacheadas
 */
export const getAllCachedLocations = () => {
  try {
    const cache = getCache();
    return Object.values(cache).map(entry => ({
      lat: entry.lat,
      lng: entry.lng,
      locationInfo: entry.locationInfo,
      timestamp: entry.timestamp,
      date: new Date(entry.timestamp).toLocaleDateString('es-ES')
    }));
  } catch (error) {
    console.error('Error getting all cached locations:', error);
    return [];
  }
};

/**
 * Limpia el caché completo
 */
export const clearCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
    console.log('Caché limpiado');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Elimina una ubicación específica del caché
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 */
export const removeFromCache = (lat, lng) => {
  try {
    const cache = getCache();
    const key = getCacheKey(lat, lng);
    delete cache[key];
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    console.log(`Ubicación removida del caché: ${key}`);
  } catch (error) {
    console.error('Error removing from cache:', error);
  }
};
