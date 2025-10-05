import React from 'react';

/**
 * Componente helper para renderizar objetos de manera segura
 * Evita el error "Objects are not valid as a React child"
 */
const SafeRenderer = ({ data, fallback = 'No data available' }) => {
  // Si es null o undefined
  if (data === null || data === undefined) {
    return <span>{fallback}</span>;
  }

  // Si es un string o número, renderizar directamente
  if (typeof data === 'string' || typeof data === 'number') {
    return <span>{data}</span>;
  }

  // Si es un booleano
  if (typeof data === 'boolean') {
    return <span>{data ? 'Sí' : 'No'}</span>;
  }

  // Si es un array
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span>No hay elementos</span>;
    }
    return (
      <ul>
        {data.map((item, index) => (
          <li key={index}>
            <SafeRenderer data={item} fallback="Elemento no disponible" />
          </li>
        ))}
      </ul>
    );
  }

  // Si es un objeto
  if (typeof data === 'object') {
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return <span>Objeto vacío</span>;
    }
    
    return (
      <div className="object-renderer">
        {entries.map(([key, value]) => (
          <div key={key} className="object-item">
            <strong>{key}:</strong> <SafeRenderer data={value} fallback="No disponible" />
          </div>
        ))}
      </div>
    );
  }

  // Fallback para otros tipos
  return <span>{String(data)}</span>;
};

export default SafeRenderer;
