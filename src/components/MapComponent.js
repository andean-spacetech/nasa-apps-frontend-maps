import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getLocationName, getShortLocationName, formatAddress } from '../services/nominatim';

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapComponent = ({ onMapClick, selectedLocation, loading, cropData }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const tempCircleRef = useRef(null);
  const bufferRef = useRef(null);
  const [locationName, setLocationName] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    // Crear el mapa centrado en Perú
    const map = L.map(mapRef.current).setView([-12.0464, -77.0428], 6);
    mapInstanceRef.current = map;

    // Agregar capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Manejar clicks en el mapa
    const handleMapClick = async (e) => {
      const { lat, lng } = e.latlng;
      
      // Limpiar marcadores y círculos anteriores
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      if (tempCircleRef.current) {
        mapInstanceRef.current.removeLayer(tempCircleRef.current);
        tempCircleRef.current = null;
      }
      
      // Agregar círculo temporal para mostrar dónde se hizo click
      const tempCircle = L.circle([lat, lng], {
        radius: 1000, // 1km de radio
        color: '#2c5530',
        fillColor: '#2c5530',
        fillOpacity: 0.2,
        weight: 2
      }).addTo(mapInstanceRef.current);
      tempCircleRef.current = tempCircle;
      
      setLoadingLocation(true);
      setLocationName(null); // Limpiar nombre anterior
      
      // Obtener nombre del lugar
      let locationInfo = null;
      try {
        const locationResult = await getLocationName(lat, lng);
        if (locationResult.success) {
          setLocationName(locationResult.data);
          locationInfo = locationResult.data;
        }
      } catch (error) {
        console.error('Error getting location name:', error);
      } finally {
        setLoadingLocation(false);
      }
      
      onMapClick(lat, lng, locationInfo);
    };

    map.on('click', handleMapClick);

    // Limpiar al desmontar
    return () => {
      map.off('click', handleMapClick);
      map.remove();
    };
  }, [onMapClick]);

  // Actualizar marcador cuando cambie la ubicación seleccionada y los datos estén cargados
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;

    // Solo mostrar marcador si no está cargando y hay datos de cultivos
    if (loading || !cropData) {
      // Remover marcador si está cargando o no hay datos
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      // No remover el círculo temporal aquí, se mantiene hasta que aparezca el marcador
      return;
    }

    // Remover marcador anterior
    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
    }

    // Remover círculo temporal si existe
    if (tempCircleRef.current) {
      mapInstanceRef.current.removeLayer(tempCircleRef.current);
      tempCircleRef.current = null;
    }

    // Agregar nuevo marcador solo cuando los datos estén listos
    const marker = L.marker([selectedLocation.lat, selectedLocation.lng])
      .addTo(mapInstanceRef.current);
    
    markerRef.current = marker;

    // Centrar el mapa en la nueva ubicación
    mapInstanceRef.current.setView([selectedLocation.lat, selectedLocation.lng], 10);
    
    // Limpiar overlay de ubicación cuando se selecciona desde popup stack
    setLocationName(null);
    setLoadingLocation(false);
  }, [selectedLocation, loading, cropData]);

  // Efecto para mostrar el buffer GeoJSON
  useEffect(() => {
    if (!mapInstanceRef.current || !cropData?.buffer_geojson) return;

    // Remover buffer anterior si existe
    if (bufferRef.current) {
      mapInstanceRef.current.removeLayer(bufferRef.current);
    }

    // Crear y agregar el buffer GeoJSON
    const bufferLayer = L.geoJSON(cropData.buffer_geojson, {
      style: {
        color: '#2c5530',
        weight: 2,
        opacity: 0.8,
        fillColor: '#2c5530',
        fillOpacity: 0.1
      }
    });

    // Agregar popup al buffer
    bufferLayer.bindPopup(`
      <div style="text-align: center;">
        <h4>🗺️ Área de Análisis</h4>
        <p><strong>Radio:</strong> ${cropData.buffer_geojson.properties?.radius_km || 'N/A'} km</p>
        <p><strong>Centro:</strong> ${cropData.buffer_geojson.properties?.center?.lat?.toFixed(4) || 'N/A'}°, ${cropData.buffer_geojson.properties?.center?.lon?.toFixed(4) || 'N/A'}°</p>
        <p><em>${cropData.buffer_geojson.properties?.description || 'Buffer de análisis'}</em></p>
      </div>
    `);

    bufferLayer.addTo(mapInstanceRef.current);
    bufferRef.current = bufferLayer;

    // Limpiar buffer cuando se cambie de ubicación
    return () => {
      if (bufferRef.current) {
        mapInstanceRef.current.removeLayer(bufferRef.current);
        bufferRef.current = null;
      }
    };
  }, [cropData?.buffer_geojson]);

  return (
    <div className="map-component">
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
      
      {/* Información de ubicación */}
      {(loadingLocation || loading) && (
        <div className="location-loading">
          <div className="spinner"></div>
          <span>
            {loading ? 'Analizando ubicación...' : 'Obteniendo nombre del lugar...'}
          </span>
        </div>
      )}
      
      {locationName && !loadingLocation && !loading && (
        <div className="location-info-overlay">
          <div className="location-name">
            {getShortLocationName(locationName.address)}
          </div>
          <div className="location-address">
            {formatAddress(locationName.address)}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
