import React, { useState } from 'react';
import MapComponent from './components/MapComponent';
import CropList from './components/CropList';
import CropDetails from './components/CropDetails';
import PopupStack from './components/PopupStack';
import ErrorBoundary from './components/ErrorBoundary';
import { addPopup } from './services/popupStack';
import './App.css';

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [cropData, setCropData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [selectedPopupId, setSelectedPopupId] = useState(null);
  const [selectedCropIndex, setSelectedCropIndex] = useState(null);
  const [analysisDate, setAnalysisDate] = useState(new Date().toISOString().split('T')[0]); // Default to today

  const handleMapClick = async (lat, lng, locationInfo = null) => {
    setLoading(true);
    setError(null);
    setSelectedLocation({ lat, lng });
    setLocationInfo(locationInfo);
    setSelectedPopupId(null);
    setSelectedCropIndex(null); // Reset selected crop when new location is clicked
    
    try {
      const response = await fetch(`http://localhost:8000/recommend?lat=${lat}&lon=${lng}&date=${analysisDate}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Backend response:', data);
      setCropData(data);
      
      // Agregar al stack de popups
      const popupData = {
        lat,
        lng,
        locationInfo,
        cropData: data,
        timestamp: Date.now()
      };
      addPopup(popupData);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.message.includes('CORS') || err.message.includes('blocked')) {
        setError('Error de CORS: El backend no permite conexiones desde el frontend. Ejecuta: ./fix-cors.sh');
      } else if (err.message.includes('Failed to fetch')) {
        setError('Error de conexión: Asegúrate de que el backend esté ejecutándose en http://localhost:8000');
      } else {
        setError(`Error: ${err.message}`);
      }
      setCropData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCropSelect = (cropIndex) => {
    setSelectedCropIndex(cropIndex);
  };

  const handlePopupSelect = (popup) => {
    setSelectedLocation({ lat: popup.lat, lng: popup.lng });
    setLocationInfo(popup.locationInfo);
    setCropData(popup.cropData);
    setSelectedPopupId(popup.id);
    setSelectedCropIndex(null); // Reset crop selection when selecting saved analysis
    setError(null);
    setLoading(false);
  };

  return (
    <div className="App">
      {/* Global Loading Overlay */}
      {loading && (
        <div className="global-loading-overlay">
          <div className="global-loader">
            <div className="spinner"></div>
            <h2>🌾 Analizando Ubicación...</h2>
            <p>Obteniendo datos climáticos y recomendaciones de cultivos</p>
          </div>
        </div>
      )}
      
      <div className="main-content">
        <div className="left-sidebar">
          <div className="sidebar-header">
            <h1>🌾 Análisis de Idoneidad de Cultivos</h1>
            <div className="date-selector">
              <label htmlFor="analysis-date">📅 Fecha de Análisis:</label>
              <input
                id="analysis-date"
                type="date"
                value={analysisDate}
                onChange={(e) => setAnalysisDate(e.target.value)}
                className="date-input"
              />
            </div>
            <p>Haz click en el mapa para obtener recomendaciones de cultivos</p>
          </div>
          
          <ErrorBoundary>
            <PopupStack 
              onPopupSelect={handlePopupSelect}
              selectedPopupId={selectedPopupId}
            />
            {/* <CropList 
              cropData={cropData}
              onCropSelect={handleCropSelect}
              selectedCropIndex={selectedCropIndex}
            /> */}
          </ErrorBoundary>
        </div>
        
        <div className="map-container">
          <MapComponent 
            onMapClick={handleMapClick} 
            selectedLocation={selectedLocation} 
            loading={loading}
            cropData={cropData}
          />
        </div>
        
        <div className="right-sidebar">
          <ErrorBoundary>
            <CropDetails 
              cropData={cropData}
              selectedCropIndex={selectedCropIndex}
              onCropSelect={handleCropSelect}
              loading={loading}
              error={error}
              selectedLocation={selectedLocation}
              locationInfo={locationInfo}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

export default App;