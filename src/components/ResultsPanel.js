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

  // Extract data from the new structure
  const { 
    analysis_info, 
    climate_analysis, 
    climate_adaptation_summary,
    data_quality,
    top_recommendations,
    detailed_recommendations 
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
            <p><strong>Cultivos Analizados:</strong> {analysis_info.total_crops_analyzed}</p>
          </div>
        )}
      </div>

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

      {/* Top Recommendations */}
      <div className="recommendations">
        <h3>🌾 Recomendaciones Principales</h3>
        {top_recommendations && top_recommendations.length > 0 ? (
          <div className="crop-list">
            {top_recommendations.map((crop, index) => (
              <div key={index} className="crop-item">
                <div className="crop-header">
                  <h4>{crop.crop}</h4>
                  <span className={`score score-${getScoreClass(crop.overall_suitability_score || 0)}`}>
                    {Math.round((crop.overall_suitability_score || 0) * 100)}%
                  </span>
                </div>
                <p className="summary">{crop.recommendation_summary}</p>
                <div className="crop-details">
                  <p><strong>Mejor época:</strong> {crop.best_planting_window}</p>
                  <p><strong>Confianza:</strong> {crop.confidence_level}</p>
                  {crop.climate_shift_detected && (
                    <p className="climate-warning">⚠️ Cambio climático detectado</p>
                  )}
                </div>
                
                {/* Adaptive Factors */}
                {crop.adaptive_factors && (
                  <div className="adaptive-factors">
                    <h5>Factores Adaptativos:</h5>
                    <div className="factors-grid">
                      <div className="factor-item">
                        <span>NDVI:</span>
                        <span>{crop.adaptive_factors.ndvi_score?.toFixed(2)}</span>
                      </div>
                      <div className="factor-item">
                        <span>Temperatura:</span>
                        <span>{crop.adaptive_factors.temperature_score?.toFixed(2)}</span>
                      </div>
                      <div className="factor-item">
                        <span>Humedad:</span>
                        <span>{crop.adaptive_factors.soil_moisture_score?.toFixed(2)}</span>
                      </div>
                      <div className="factor-item">
                        <span>Pendiente:</span>
                        <span>{crop.adaptive_factors.slope_score?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Frost Risk Assessment */}
                {crop.frost_risk_assessment && (
                  <div className="frost-assessment">
                    <h5>Evaluación de Riesgo de Heladas:</h5>
                    <div className="frost-details">
                      <p><strong>Tolerancia:</strong> {crop.frost_risk_assessment.frost_tolerance}</p>
                      <p><strong>Impacto:</strong> {(crop.frost_risk_assessment.frost_impact_score * 100).toFixed(1)}%</p>
                      <p><strong>Riesgo Estacional:</strong> {crop.frost_risk_assessment.seasonal_frost_risk}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No se encontraron recomendaciones para esta ubicación.</p>
        )}
      </div>

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

export default ResultsPanel;
