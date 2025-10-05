import React, { useState, useEffect } from 'react';
import { 
  getPopupStack, 
  removePopup, 
  clearPopupStack, 
  reorderPopup,
  getStackStats 
} from '../services/popupStack';

const PopupStack = ({ onPopupSelect, selectedPopupId }) => {
  const [popups, setPopups] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadPopups();
    
    // Listener para actualizar cuando se agreguen nuevos popups
    const handleStorageChange = (e) => {
      if (e.key === 'crop_analysis_popup_stack') {
        loadPopups();
      }
    };
    
    // Listener para evento personalizado de cambios en popup stack
    const handlePopupStackChange = () => {
      loadPopups();
    };
    
    // Escuchar cambios en localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Escuchar evento personalizado
    window.addEventListener('popupStackChanged', handlePopupStackChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('popupStackChanged', handlePopupStackChange);
    };
  }, []);

  const loadPopups = () => {
    const popupStack = getPopupStack();
    setPopups(popupStack);
    setStats(getStackStats());
  };

  const handlePopupClick = (popup) => {
    onPopupSelect(popup);
  };

  const handleRemovePopup = (popupId, e) => {
    e.stopPropagation();
    const updatedStack = removePopup(popupId);
    setPopups(updatedStack);
    setStats(getStackStats());
  };

  const handleClearAll = () => {
    if (window.confirm('¿Estás seguro de que quieres limpiar todos los análisis guardados?')) {
      const emptyStack = clearPopupStack();
      setPopups(emptyStack);
      setStats(getStackStats());
    }
  };

  const handleMoveToTop = (popupId, e) => {
    e.stopPropagation();
    const updatedStack = reorderPopup(popupId, 0);
    setPopups(updatedStack);
  };

  const formatLocationName = (popup) => {
    if (popup.locationInfo?.display_name) {
      // Extraer solo el nombre principal (antes de la primera coma)
      return popup.locationInfo.display_name.split(',')[0];
    }
    // Si no hay nombre de Nominatim, usar coordenadas como fallback
    return `${popup.lat?.toFixed(4)}, ${popup.lng?.toFixed(4)}`;
  };

  const formatShortLocationName = (popup) => {
    if (popup.locationInfo?.address) {
      const address = popup.locationInfo.address;
      // Prioridad: village > town > city > municipality > county > state
      return address.village || 
             address.town || 
             address.city || 
             address.municipality || 
             address.county || 
             address.state || 
             'Ubicación';
    }
    if (popup.locationInfo?.display_name) {
      return popup.locationInfo.display_name.split(',')[0];
    }
    return `${popup.lat?.toFixed(4)}, ${popup.lng?.toFixed(4)}`;
  };

  const formatTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  if (popups.length === 0) {
    return (
      <div className="popup-stack empty-state">
        <h3>📍 Análisis Guardados</h3>
        <p>No hay análisis guardados</p>
      </div>
    );
  }

  return (
    <div className="popup-stack">
      <div className="popup-stack-header">
        <h3>📍 Análisis Guardados</h3>
        <div className="header-info">
          <span className="count">{popups.length}</span>
        </div>
      </div>
      
      <div className="popup-stack-content">
        <div className="popup-stack-actions">
          <div className="stats">
            <span>Hoy: {stats.today}</span>
            <span>Esta semana: {stats.thisWeek}</span>
          </div>
          <button 
            className="clear-all-btn"
            onClick={handleClearAll}
            title="Limpiar todos los análisis"
          >
            🗑️ Limpiar Todo
          </button>
        </div>
        
        <div className="popup-list">
          {popups.map((popup, index) => (
            <div
              key={popup.id}
              className={`popup-item ${selectedPopupId === popup.id ? 'selected' : ''}`}
              onClick={() => handlePopupClick(popup)}
            >
              <div className="popup-main-info">
                <div className="popup-location">
                  {formatShortLocationName(popup)}
                </div>
                <div className="popup-meta">
                  <span className="popup-time">
                    {formatTimeAgo(popup.timestamp)}
                  </span>
                  <span className="popup-coords">
                    {popup.lat?.toFixed(4)}, {popup.lng?.toFixed(4)}
                  </span>
                </div>
              </div>
              
              <div className="popup-actions">
                <button
                  className="move-top-btn"
                  onClick={(e) => handleMoveToTop(popup.id, e)}
                  title="Mover al inicio"
                >
                  ⬆️
                </button>
                <button
                  className="remove-btn"
                  onClick={(e) => handleRemovePopup(popup.id, e)}
                  title="Eliminar análisis"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopupStack;
