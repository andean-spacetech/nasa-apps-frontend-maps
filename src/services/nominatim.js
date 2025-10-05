/**
 * Servicio de geocodificación usando Nominatim (OpenStreetMap)
 * Obtiene nombres de lugares a partir de coordenadas
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/reverse';

/**
 * Obtiene el nombre de un lugar a partir de coordenadas
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @returns {Promise<Object>} Información del lugar
 */
export const getLocationName = async (lat, lng) => {
  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lng.toString(),
      format: 'json',
      addressdetails: '1',
      'accept-language': 'es,en',
      zoom: '18'
    });

    const response = await fetch(`${NOMINATIM_BASE_URL}?${params}`, {
      headers: {
        'User-Agent': 'CropAnalysisApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: {
        display_name: data.display_name,
        address: data.address,
        place_id: data.place_id,
        osm_type: data.osm_type,
        osm_id: data.osm_id,
        lat: parseFloat(data.lat),
        lon: parseFloat(data.lon)
      }
    };
  } catch (error) {
    console.error('Error getting location name:', error);
    return {
      success: false,
      error: error.message,
      data: {
        display_name: `Ubicación (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        address: {},
        lat,
        lon: lng
      }
    };
  }
};

/**
 * Formatea la información de dirección para mostrar
 * @param {Object} address - Objeto de dirección de Nominatim
 * @returns {string} Dirección formateada
 */
export const formatAddress = (address) => {
  if (!address) return 'Dirección no disponible';
  
  const parts = [];
  
  // Prioridad de campos para mostrar
  const fields = [
    'village', 'town', 'city', 'municipality',
    'county', 'state', 'region',
    'country'
  ];
  
  fields.forEach(field => {
    if (address[field]) {
      parts.push(address[field]);
    }
  });
  
  return parts.join(', ') || 'Ubicación desconocida';
};

/**
 * Obtiene un nombre corto del lugar
 * @param {Object} address - Objeto de dirección de Nominatim
 * @returns {string} Nombre corto del lugar
 */
export const getShortLocationName = (address) => {
  if (!address) return 'Ubicación';
  
  // Prioridad: village > town > city > municipality > county > state
  return address.village || 
         address.town || 
         address.city || 
         address.municipality || 
         address.county || 
         address.state || 
         'Ubicación';
};
