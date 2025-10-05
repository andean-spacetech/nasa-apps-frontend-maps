import React from 'react';

const CropList = ({ cropData, onCropSelect, selectedCropIndex }) => {
  if (!cropData || !cropData.top_recommendations) {
    return (
      <div className="crop-list-container">
        <h3>🌾 Cultivos Recomendados</h3>
        <p>Haz click en el mapa para ver recomendaciones</p>
      </div>
    );
  }

  const { top_recommendations } = cropData;

  return (
    <div className="crop-list-container">
      <h3>🌾 Cultivos Recomendados</h3>
      <div className="crop-list">
        {top_recommendations.map((crop, index) => (
          <div 
            key={index} 
            className={`crop-list-item ${selectedCropIndex === index ? 'selected' : ''}`}
            onClick={() => onCropSelect(index)}
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
  );
};

const getScoreClass = (score) => {
  if (score >= 0.8) return 'excellent';
  if (score >= 0.6) return 'good';
  if (score >= 0.4) return 'moderate';
  return 'low';
};

export default CropList;
