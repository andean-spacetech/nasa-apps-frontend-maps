# 🌾 Frontend - Análisis de Idoneidad de Cultivos

Frontend sencillo en React para visualizar recomendaciones de cultivos basadas en análisis climático.

## 🚀 Características

- **Mapa Interactivo**: OpenStreetMap con Leaflet
- **Click para Análisis**: Haz click en cualquier ubicación del mapa
- **Recomendaciones en Español**: Cultivos y temporadas localizados
- **Diseño Responsivo**: Funciona en desktop y móvil
- **Tiempo Real**: Conexión directa con la API de análisis

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

## 📦 Dependencias

- **React**: Framework principal
- **Leaflet**: Mapas interactivos
- **React-Leaflet**: Integración de Leaflet con React
- **Axios**: Cliente HTTP para API

## 🎯 Uso

1. **Iniciar el Backend**: Asegúrate de que la API esté ejecutándose en `http://localhost:8000`
2. **Iniciar el Frontend**: Ejecuta `npm start`
3. **Usar el Mapa**: Haz click en cualquier ubicación del mapa
4. **Ver Resultados**: Las recomendaciones aparecerán en el panel derecho

## 🌍 Ubicaciones de Prueba

- **Lima, Perú**: -12.0464, -77.0428
- **Cusco, Perú**: -13.5319, -71.9675
- **Arequipa, Perú**: -16.4090, -71.5375

## 📱 Diseño Responsivo

- **Desktop**: Mapa a la izquierda, resultados a la derecha
- **Móvil**: Mapa arriba, resultados abajo

## 🔧 Configuración

El frontend se conecta automáticamente a `http://localhost:8000` para la API. Para cambiar la URL, modifica el archivo `src/App.js`:

```javascript
const response = await fetch(`http://localhost:8000/recommend?lat=${lat}&lon=${lng}`);
```

## 🎨 Personalización

Los estilos se encuentran en:
- `src/App.css`: Estilos principales
- `src/index.css`: Estilos base y scrollbar

## 📊 Datos Mostrados

- **Ubicación**: Coordenadas exactas
- **Recomendaciones**: Top 3 cultivos recomendados
- **Idoneidad**: Porcentaje de idoneidad con colores
- **Temporadas**: Mejor época de siembra en español
- **Clima**: Advertencias de cambio climático