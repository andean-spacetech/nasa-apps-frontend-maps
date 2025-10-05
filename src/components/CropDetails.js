import React from 'react';
import SafeRenderer from './SafeRenderer';

const CropDetails = ({ cropData, selectedCropIndex, onCropSelect, locationInfo, loading, error }) => {
  if (loading) {
    return (
      <div className="crop-details-container">
        <div className="loading-container">
          <div className="loader">
            <div className="spinner"></div>
            <h3>🌾 Analizando Cultivos...</h3>
            <p>Obteniendo recomendaciones para esta ubicación</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="crop-details-container">
        <div className="error-container">
          <h3>❌ Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!cropData || !cropData.top_recommendations) {
    return (
      <div className="crop-details-container">
        <div className="welcome">
          <h3>🌍 Bienvenido</h3>
          <p>Haz click en el mapa para obtener recomendaciones de cultivos</p>
        </div>
      </div>
    );
  }

  const selectedCrop = selectedCropIndex !== null ? cropData.top_recommendations[selectedCropIndex] : null;
  const { analysis_info, climate_analysis, data_quality, climate_adaptation_summary } = cropData;

  return (
    <div className="crop-details-container">
            {/* Location Information */}
        <div className="location-info">
        {locationInfo ? (
          <>
                  <h3>{getLocationName(locationInfo)}</h3>

            {/* <p><strong></strong> </p> */}
            {/* <p><strong>Coordenadas:</strong> {locationInfo.lat?.toFixed(4) || 'N/A'}°, {locationInfo.lng?.toFixed(4) || 'N/A'}°</p> */}
          </>
        ) : analysis_info?.coordinates ? (
          <>
            <p><strong>Coordenadas:</strong> {analysis_info.coordinates.lat?.toFixed(4) || 'N/A'}°, {analysis_info.coordinates.lon?.toFixed(4) || 'N/A'}°</p>
          </>
        ) : (
          <p>Ubicación no disponible</p>
        )}
        {analysis_info && (
          <div className="analysis-info">
            <p><strong>Fecha de Análisis:</strong> {analysis_info.analysis_date}</p>
            <p><strong>Cultivos Analizados:</strong> {analysis_info.total_crops_analyzed}</p>
          </div>
        )}
      </div>

      {/* Crop Recommendations - Always show first */}
      {cropData && cropData.top_recommendations && (
        <div className="crop-recommendations">
          <h3>🌾 Cultivos Recomendados</h3>
          <div className="recommendations-list">
            {cropData.top_recommendations.map((crop, index) => (
              <div 
                key={index} 
                className={`recommendation-item ${selectedCropIndex === index ? 'selected' : ''}`}
                onClick={() => onCropSelect && onCropSelect(index)}
              >
                <div className="crop-name">
                  {crop.crop_name}
                </div>
                <div className={`crop-score score-${getScoreClass((crop.suitability_score || 0) / 100)}`}>
                  {crop.suitability_score || 0}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}





      {/* Climate Analysis */}
      {climate_analysis && (
        <div className="climate-analysis">
          <h3>🌡️ Análisis Climático</h3>
          
          {/* Climate Shifts */}
          {climate_analysis.climate_shift_detected && (
            <div className="climate-shift">
              <h4>⚠️ Cambio Climático Detectado</h4>
              <p>{climate_analysis.climate_shift_description}</p>
            </div>
          )}

          {/* Frost Information */}
          {climate_analysis.frost_probability !== undefined && (
            <div className="frost-info">
              <h4>❄️ Información de Heladas</h4>
              <p><strong>Probabilidad de Heladas:</strong> {(climate_analysis.frost_probability * 100).toFixed(1)}%</p>
              {climate_analysis.min_temperature && (
                <p><strong>Temperatura Mínima:</strong> {climate_analysis.min_temperature.toFixed(1)}°C</p>
              )}
            </div>
          )}

          {/* Recent Conditions */}
          {climate_analysis.recent_conditions && (
            <div className="recent-conditions">
              <h4>📊 Condiciones Recientes</h4>
              <div className="conditions-grid">
                {climate_analysis.recent_conditions.temperature_c && (
                  <div className="condition-item">
                    <span className="label">Temperatura:</span>
                    <span className="value">{climate_analysis.recent_conditions.temperature_c.toFixed(1)}°C</span>
                  </div>
                )}
                {climate_analysis.recent_conditions.precipitation_mm && (
                  <div className="condition-item">
                    <span className="label">Precipitación:</span>
                    <span className="value">{climate_analysis.recent_conditions.precipitation_mm.toFixed(1)} mm</span>
                  </div>
                )}
                {climate_analysis.recent_conditions.soil_moisture_pct && (
                  <div className="condition-item">
                    <span className="label">Humedad del Suelo:</span>
                    <span className="value">{(climate_analysis.recent_conditions.soil_moisture_pct * 100).toFixed(1)}%</span>
                  </div>
                )}
                {climate_analysis.recent_conditions.ndvi && (
                  <div className="condition-item">
                    <span className="label">NDVI:</span>
                    <span className="value">{(climate_analysis.recent_conditions.ndvi / 10000).toFixed(3)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Seasonal Context */}
      {analysis_info?.seasonal_context && (
        <div className="seasonal-context">
          <h3>📅 Contexto Estacional</h3>
          <div className="season-info">
            <h4>{analysis_info.seasonal_context.season_es}</h4>
            <p>{analysis_info.seasonal_context.description}</p>
            <div className="season-details">
              <p><strong>Período:</strong> {analysis_info.seasonal_context.months}</p>
              <p><strong>Riesgo de Heladas:</strong> 
                <span className={`frost-risk ${analysis_info.seasonal_context.frost_risk}`}>
                  {analysis_info.seasonal_context.frost_risk}
                </span>
              </p>
            </div>
            {analysis_info.seasonal_context.recommended_activities && (
              <div className="recommended-activities">
                <p><strong>Actividades Recomendadas:</strong></p>
                <ul>
                  {analysis_info.seasonal_context.recommended_activities.map((activity, index) => (
                    <li key={index}>{activity}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Data Quality */}
      {data_quality && (
        <div className="data-quality">
          <h3>📈 Calidad de Datos</h3>
          <div className="quality-indicators">
            {Object.entries(data_quality).map(([key, quality]) => (
              <div key={key} className={`quality-item ${quality}`}>
                <span className="label">{getQualityLabel(key)}:</span>
                <span className="quality-badge">{quality}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Crop Details - Only show when a crop is selected */}
      {selectedCrop && (
        <div className="crop-details">
          <h3>🌾 Recomendaciones Principales</h3>
          <div className="selected-crop">
            <div className="crop-header">
              <h4>{selectedCrop.crop_name}</h4>
              <span className={`score score-${getScoreClass((selectedCrop.suitability_score || 0) / 100)}`}>
                {selectedCrop.suitability_score || 0}%
              </span>
            </div>
            <div className="crop-info">
              <p><strong>Potencial de Rendimiento:</strong> {selectedCrop.yield_potential}</p>
              
              {/* Analysis Log */}
              {selectedCrop.analysis_log && selectedCrop.analysis_log.length > 0 && (
                <div className="analysis-log">
                  <h5>Análisis Detallado:</h5>
                  <ul>
                    {selectedCrop.analysis_log.map((log, logIndex) => (
                      <li key={logIndex}>{log}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Adaptive Factors */}
            {selectedCrop.adaptive_factors && (
              <div className="adaptive-factors">
                <h5>Factores Adaptativos:</h5>
                <div className="factors-grid">
                  <div className="factor-item">
                    <span>NDVI:</span>
                    <span>{selectedCrop.adaptive_factors.ndvi_score?.toFixed(2)}</span>
                  </div>
                  <div className="factor-item">
                    <span>Temperatura:</span>
                    <span>{selectedCrop.adaptive_factors.temperature_score?.toFixed(2)}</span>
                  </div>
                  <div className="factor-item">
                    <span>Humedad:</span>
                    <span>{selectedCrop.adaptive_factors.soil_moisture_score?.toFixed(2)}</span>
                  </div>
                  <div className="factor-item">
                    <span>Pendiente:</span>
                    <span>{selectedCrop.adaptive_factors.slope_score?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Frost Risk Assessment */}
            {selectedCrop.frost_risk_assessment && (
              <div className="frost-assessment">
                <h5>Evaluación de Riesgo de Heladas:</h5>
                <div className="frost-details">
                  <p><strong>Tolerancia:</strong> {selectedCrop.frost_risk_assessment.frost_tolerance}</p>
                  <p><strong>Impacto:</strong> {(selectedCrop.frost_risk_assessment.frost_impact_score * 100).toFixed(1)}%</p>
                  <p><strong>Riesgo Estacional:</strong> {selectedCrop.frost_risk_assessment.seasonal_frost_risk}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Climate Adaptation Summary */}
      {climate_adaptation_summary && (
        <div className="climate-summary">
          <h3>🌱 Resumen de Adaptación Climática</h3>
          <SafeRenderer data={climate_adaptation_summary} fallback="Información climática no disponible" />
        </div>
      )}
    </div>
  );
};

const getScoreClass = (score) => {
  if (score >= 0.8) return 'excellent';
  if (score >= 0.6) return 'good';
  if (score >= 0.4) return 'moderate';
  return 'low';
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

const getLocationName = (locationInfo) => {
  if (!locationInfo) return 'Ubicación desconocida';
  
  // Prioridad: display_name > address components > coordinates
  if (locationInfo.display_name) {
    // Extraer solo el nombre principal (antes de la primera coma)
    return locationInfo.display_name.split(',')[0];
  }
  
  if (locationInfo.address) {
    const address = locationInfo.address;
    // Prioridad: village > town > city > municipality > county > state
    return address.village || 
           address.town || 
           address.city || 
           address.municipality || 
           address.county || 
           address.state || 
           'Ubicación';
  }
  
  // Fallback a coordenadas si no hay nombre
  if (locationInfo.lat && locationInfo.lng) {
    return `${locationInfo.lat.toFixed(4)}, ${locationInfo.lng.toFixed(4)}`;
  }
  
  return 'Ubicación desconocida';
};

export default CropDetails;
