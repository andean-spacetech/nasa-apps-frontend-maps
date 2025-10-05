import React from 'react';
import SafeRenderer from './SafeRenderer';

const ResultsPanel = ({ cropData, loading, error, selectedLocation, locationInfo }) => {
  if (loading) {
    return (
      <div className="results-panel">
        <div className="loading">
          <div className="spinner"></div>
          <p>Analizando ubicación...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="results-panel">
        <div className="error">
          <h3>❌ Error</h3>
          <p>{error}</p>
          <p>Verifica que el servidor esté ejecutándose en http://localhost:8000</p>
        </div>
      </div>
    );
  }

  if (!cropData) {
    return (
      <div className="results-panel">
        <div className="welcome">
          <h3>🌍 Bienvenido</h3>
          <p>Haz click en cualquier lugar del mapa para obtener recomendaciones de cultivos.</p>
          <div className="info-box">
            <h4>📍 Ubicación</h4>
            <p>Selecciona una ubicación en el mapa</p>
          </div>
        </div>
      </div>
    );
  }

  // Extract data from the new structure (simplified format)
  const { 
    analysis_info, 
    analysis_data_summary,
    top_recommendations,
    detailed_recommendations,
    buffer_geojson 
  } = cropData;

  return (
    <div className="results-panel">
      {/* Location Information */}
      <div className="location-info">
        <h3>📍 Ubicación Seleccionada</h3>
        {locationInfo ? (
          <>
            <p><strong>Lugar:</strong> {locationInfo.display_name || 'Ubicación desconocida'}</p>
            <p><strong>Coordenadas:</strong> {selectedLocation?.lat?.toFixed(4)}, {selectedLocation?.lng?.toFixed(4)}</p>
          </>
        ) : analysis_info?.coordinates ? (
          <>
            <p><strong>Latitud:</strong> {analysis_info.coordinates.lat?.toFixed(4) || 'N/A'}°</p>
            <p><strong>Longitud:</strong> {analysis_info.coordinates.lon?.toFixed(4) || 'N/A'}°</p>
          </>
        ) : (
          <p>Coordenadas no disponibles</p>
        )}
        {analysis_info && (
          <div className="analysis-info">
            <p><strong>Fecha de Análisis:</strong> {analysis_info.analysis_date}</p>
            <p><strong>Mes de Análisis:</strong> {analysis_info.analysis_month}</p>
            <p><strong>Cultivos Analizados:</strong> {analysis_info.total_crops_analyzed}</p>
          </div>
        )}
      </div>

      {/* Analysis Data Summary */}
      {analysis_data_summary && (
        <div className="analysis-data">
          <h3>📊 Datos de Análisis (5 años)</h3>
          <div className="data-grid">
            {Object.entries(analysis_data_summary).map(([key, data]) => (
              <div key={key} className="data-item">
                <h4>{getDataLabel(key)}</h4>
                <div className="data-values">
                  <p><strong>Promedio:</strong> {data.mean?.toFixed(2) || 'N/A'}</p>
                  <p><strong>Rango:</strong> {data.range || 'N/A'}</p>
                  <p><strong>Calidad:</strong> 
                    <span className={`quality-badge ${data.quality}`}>{data.quality}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buffer Information */}
      {buffer_geojson && (
        <div className="buffer-info">
          <h3>🗺️ Área de Análisis</h3>
          <div className="buffer-details">
            <div className="buffer-item">
              <span className="label">Radio de Análisis:</span>
              <span className="value">{buffer_geojson.properties?.radius_km || 'N/A'} km</span>
            </div>
            <div className="buffer-item">
              <span className="label">Centro del Área:</span>
              <span className="value">
                {buffer_geojson.properties?.center?.lat?.toFixed(4) || 'N/A'}°, 
                {buffer_geojson.properties?.center?.lon?.toFixed(4) || 'N/A'}°
              </span>
            </div>
            <div className="buffer-item">
              <span className="label">Descripción:</span>
              <span className="value">{buffer_geojson.properties?.description || 'N/A'}</span>
            </div>
            {buffer_geojson.geometry?.coordinates && (
              <div className="buffer-item">
                <span className="label">Puntos del Polígono:</span>
                <span className="value">{buffer_geojson.geometry.coordinates[0]?.length || 'N/A'} puntos</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Recommendations */}
      <div className="recommendations">
        <h3>🌾 Recomendaciones Principales</h3>
        {top_recommendations && top_recommendations.length > 0 ? (
          <div className="crop-list">
            {top_recommendations.map((crop, index) => (
              <div key={index} className="crop-item">
                <div className="crop-header">
                  <h4>{crop.crop_name}</h4>
                  <span className={`score score-${getScoreClass(crop.suitability_score / 100)}`}>
                    {crop.suitability_score.toFixed(1)}%
                  </span>
                </div>
                <div className="crop-details">
                  <div className="crop-info-grid">
                    <div className="info-item">
                      <span className="label">Período de Crecimiento:</span>
                      <span className="value">{crop.growth_period_days} días</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Fecha de Siembra:</span>
                      <span className="value">{crop.planting_date}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Fecha de Cosecha:</span>
                      <span className="value">{crop.harvest_date}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Nivel de Confianza:</span>
                      <span className={`confidence ${crop.confidence_level}`}>{crop.confidence_level}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Potencial de Rendimiento:</span>
                      <span className="value">{crop.yield_potential}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Multiplicador Regional:</span>
                      <span className="value">{crop.regional_multiplier?.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Analysis Log */}
                  {crop.analysis_log && crop.analysis_log.length > 0 && (
                    <div className="analysis-log">
                      <h5>Análisis Detallado:</h5>
                      <ul>
                        {crop.analysis_log.map((log, logIndex) => (
                          <li key={logIndex}>{log}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay recomendaciones disponibles</p>
        )}
      </div>
    </div>
  );
};

const getScoreClass = (score) => {
  if (score >= 0.8) return 'excellent';
  if (score >= 0.6) return 'good';
  if (score >= 0.4) return 'moderate';
  return 'low';
};

const getDataLabel = (key) => {
  const labels = {
    'ndvi': 'NDVI',
    'temperature': 'Temperatura',
    'precipitation': 'Precipitación',
    'soil_moisture': 'Humedad del Suelo'
  };
  return labels[key] || key;
};

const getQualityLabel = (key) => {
  const labels = {
    'ndvi_quality': 'NDVI',
    'temp_quality': 'Temperatura',
    'precip_quality': 'Precipitación',
    'soil_quality': 'Humedad del Suelo',
    'terrain_quality': 'Terreno'
  };
  return labels[key] || key;
};

export default ResultsPanel;
