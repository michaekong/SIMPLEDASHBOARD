class AdvancedDashboard {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.gridContainer = this._createGridContainer();
        -74.0060
        // Initialisation des sous-modules
        this.chartManager = new SimpleChartManager(this.gridContainer);
        this.mapManager = new SimpleMapManager(this.gridContainer);
    }

    // Création du conteneur de grille flexible
    _createGridContainer() {
        const gridContainer = document.createElement('div');
        gridContainer.style.display = 'grid';
        gridContainer.style.gap = '20px';
        gridContainer.style.padding = '20px';
        gridContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
        this.container.appendChild(gridContainer);
        return gridContainer;
    }

    // Méthodes déléguées aux gestionnaires
    addChart(type, data, options = {}) {
        return this.chartManager.addChart(type, data, options);
    }

    addMap(title, center, options = {}) {
        return this.mapManager.addMap(title, center, options);
    }
}

class SimpleChartManager {
    constructor(gridContainer) {
        this.gridContainer = gridContainer;
        this.charts = new Map();
        this.colorSchemes = {
            default: ['#001f3d', '#003366', '#0f1d43', '#003b5c', '#003153', '#4b0082'],
            warm: ['#FF6B6B', '#FF8E72', '#FFA07A', '#FFB88C', '#FFC1A1', '#FFD4B8'],
            cool: ['#4B89DC', '#5D9CEC', '#4FC1E9', '#48CFAD', '#37BC9B', '#3BAFDA'],
            pastel: ['#AC92EC', '#4FC1E9', '#A0D468', '#FFCE54', '#ED5565', '#FC6E51'],
            vibrant: ['#FF5733', '#33FF57', '#3357FF', '#FF33A8', '#A833FF', '#33FFFC'],
        };
        this.defaultOptions = {
            colorScheme: 'default',
            responsive: true,
            maintainAspectRatio: true,
        };

        // Chargement dynamique de Chart.js
        this._loadChartJS();
    }

    // Chargement asynchrone de Chart.js
    async _loadChartJS() {
        return new Promise((resolve, reject) => {
            if (window.Chart) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Échec du chargement de Chart.js'));
            document.head.appendChild(script);
        });
    }

    // Création d'un conteneur de graphique
    _createChartContainer(id, title) {
        const chartCard = document.createElement('div');
        chartCard.style.backgroundColor = '#ffffff';
        chartCard.style.borderRadius = '8px';
        chartCard.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        chartCard.style.padding = '16px';
        chartCard.style.height = '400px';
        chartCard.style.display = 'flex';
        chartCard.style.flexDirection = 'column';
        chartCard.style.justifyContent = 'center';
        chartCard.style.alignItems = 'center';

        if (title) {
            const titleElement = document.createElement('h3');
            titleElement.textContent = title;
            titleElement.style.marginBottom = '16px';
            titleElement.style.fontSize = '16px';
            titleElement.style.fontWeight = 'bold';
            chartCard.appendChild(titleElement);
        }

        const canvas = document.createElement('canvas');
        canvas.id = id;
        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '100%';
        chartCard.appendChild(canvas);
        this.gridContainer.appendChild(chartCard);
        return canvas;
    }

    // Obtenir les couleurs spécifiées (et non un schéma de couleurs par défaut)
    _getColorScheme(schemeName, count) {
        const specifiedColors = schemeName || [];  // Si les couleurs sont spécifiées, utiliser ces couleurs
        const colors = [];
        
        for (let i = 0; i < count; i++) {
            colors.push(specifiedColors[i % specifiedColors.length]);  // Utiliser les couleurs spécifiées seulement
        }
        
        return colors;
    }

    // Ajouter un graphique
    async addChart(type, data, options = {}) {
        await this._loadChartJS(); // Assurer le chargement de Chart.js

        const id = `chart-${this.charts.size}`;
        const finalOptions = { ...this.defaultOptions, ...options };
        const canvas = this._createChartContainer(id, options.title);
        
        // Vérifier si des couleurs personnalisées sont spécifiées
        const chartColors = this._getColorScheme(
            finalOptions.colors,  // Utiliser les couleurs définies dans options (si spécifiées)
            data.labels?.length || data.datasets?.[0]?.data?.length || 0
        );

        const chartConfig = {
            type: type,
            data: {
                labels: data.labels || [],
                datasets: data.datasets || [{
                    data: data,
                    backgroundColor: chartColors,
                    borderColor: type === 'line' ? chartColors[0] : chartColors,
                    borderWidth: type === 'line' ? 2 : 1
                }]
            },
            options: {
                responsive: finalOptions.responsive,
                maintainAspectRatio: finalOptions.maintainAspectRatio,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        enabled: true
                    }
                }
            }
        };

        // Configuration des types de graphiques spécifiques
        if (type === 'line' || type === 'bar') {
            chartConfig.options.scales = {
                y: {
                    beginAtZero: true
                }
            };
        }

        // Configuration des graphiques Radar, Pie, Doughnut, etc.
        if (type === 'radar' || type === 'polarArea' || type === 'pie' || type === 'doughnut') {
            chartConfig.options.plugins.legend.position = 'right';
        }

        const chart = new Chart(canvas.getContext('2d'), chartConfig);
        this.charts.set(id, chart);
        return id;
    }

    // Méthode pour ajouter une palette de couleurs personnalisée
    addCustomColorScheme(name, colors) {
        this.colorSchemes[name] = colors;
    }
}


class SimpleMapManager {
    // Déclaration d'une variable statique 'mapCounter' qui sera utilisée pour compter les cartes créées.
static mapCounter = 0;

// Constructeur de la classe, qui initialise plusieurs propriétés de l'instance.
constructor(gridContainer) {
    this.gridContainer = gridContainer; // Conteneur où les cartes seront ajoutées.
    this.defaultOptions = {
        zoom: 13, // Zoom par défaut de la carte.
        mapHeight: '400px', // Hauteur par défaut de la carte.
        drawColor: '#FF0000', // Couleur par défaut pour les éléments dessinés sur la carte (rouge).
        baseMaps: ['OpenStreetMap', 'Satellite'] // Cartes de base possibles pour la carte (OpenStreetMap et Satellite).
    };
    this.maps = new Map(); // Une Map qui va contenir les instances de cartes créées.
    this.currentDrawColor = this.defaultOptions.drawColor; // La couleur actuellement utilisée pour le dessin, initialisée à celle par défaut.
    this.loadLeaflet(); // Appel à la méthode qui charge Leaflet et ses dépendances.
}

// Méthode asynchrone pour charger les fichiers nécessaires pour Leaflet.
async loadLeaflet() {
    if (window.L) return; // Si Leaflet est déjà chargé (c'est-à-dire que la variable `L` existe), ne rien faire.

    // Fonction utilitaire pour charger les ressources (fichiers CSS ou JS) à partir d'une URL donnée.
    const loadResource = (url, type) => {
        return new Promise((resolve, reject) => {
            let element;
            if (type === 'script') {
                // Si le type est 'script', on crée un élément script pour charger un fichier JavaScript.
                element = document.createElement('script');
                element.src = url;
            } else if (type === 'css') {
                // Si le type est 'css', on crée un élément link pour charger un fichier CSS.
                element = document.createElement('link');
                element.rel = 'stylesheet';
                element.href = url;
            }
            // Quand le fichier est chargé avec succès, on résout la promesse.
            element.onload = resolve;
            // En cas d'erreur de chargement, on rejette la promesse.
            element.onerror = reject;
            // Ajouter l'élément au <head> du document pour charger le fichier.
            document.head.appendChild(element);
        });
    };

    try {
        // Charger les ressources nécessaires pour Leaflet et Leaflet.Draw (CSS et JS).
        await loadResource('https://unpkg.com/leaflet@1.7.1/dist/leaflet.css', 'css');
        await loadResource('https://unpkg.com/leaflet@1.7.1/dist/leaflet.js', 'script');
        await loadResource('https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css', 'css');
        await loadResource('https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js', 'script');
    } catch (error) {
        // Si le chargement échoue, afficher un message d'erreur dans la console.
        console.error('Échec du chargement des ressources Leaflet:', error);
    }
}

// Méthode pour créer une section dans le conteneur de la grille avec un titre optionnel.
_createSection(title) {
    const section = document.createElement('div'); // Créer un conteneur pour la section.
    section.style.marginBottom = '20px'; // Ajouter un espacement en bas de la section.
    section.style.padding = '20px'; // Ajouter du padding à l'intérieur de la section.
    section.style.backgroundColor = '#fff'; // Définir la couleur de fond de la section en blanc.
    section.style.borderRadius = '8px'; // Arrondir les coins de la section.
    section.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'; // Ajouter une ombre légère à la section.

    // Si un titre est fourni, créer un élément de titre pour la section.
    if (title) {
        const sectionTitle = document.createElement('h3');
        sectionTitle.textContent = title; // Définir le texte du titre.
        sectionTitle.style.fontSize = '18px'; // Définir la taille de police du titre.
        sectionTitle.style.marginBottom = '10px'; // Ajouter un espacement en bas du titre.
        section.appendChild(sectionTitle); // Ajouter le titre à la section.
    }

    // Ajouter la section créée au conteneur de la grille.
    this.gridContainer.appendChild(section);
    return section; // Retourner l'élément de section créé.
}

// Méthode pour ajouter un sélecteur de couleur dans un conteneur spécifié.
_addColorPicker(container) {
    const colorPickerContainer = document.createElement('div'); // Créer un conteneur pour le sélecteur de couleur.
    colorPickerContainer.style.marginBottom = '10px'; // Ajouter un espacement en bas du conteneur.
    colorPickerContainer.innerHTML = `
        <label for="colorPicker">Couleur des éléments : </label>
        <input type="color" id="colorPicker" value="${this.currentDrawColor}">
    `; // Ajouter un label et un champ de saisie de type couleur avec la couleur actuelle.
    container.appendChild(colorPickerContainer); // Ajouter le conteneur du sélecteur de couleur au conteneur parent.

    const colorPicker = colorPickerContainer.querySelector('#colorPicker'); // Sélectionner l'élément input (sélecteur de couleur).
    colorPicker.addEventListener('input', (e) => {
        // Lorsque l'utilisateur change la couleur, mettre à jour la couleur de dessin actuelle.
        this.currentDrawColor = e.target.value;
    });
}


calculateProperties(layer) {
    let properties = {};
    if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
        const latlngs = layer.getLatLngs()[0];
        properties.area = L.GeometryUtil.geodesicArea(latlngs); // Aire en m²
        properties.perimeter = 0;
        for (let i = 0; i < latlngs.length; i++) {
            const nextIndex = (i + 1) % latlngs.length;
            properties.perimeter += latlngs[i].distanceTo(latlngs[nextIndex]);
        }
    } else if (layer instanceof L.Polyline) {
        const latlngs = layer.getLatLngs();
        properties.length = 0;
        for (let i = 0; i < latlngs.length - 1; i++) {
            properties.length += latlngs[i].distanceTo(latlngs[i + 1]);
        }
    }
    return properties;
}

addMap(title, center, options = {}) {
    const { zoom, mapHeight } = {
        ...this.defaultOptions,
        ...options
    };

    const section = this._createSection(title);
    const mapContainer = document.createElement('div');
    mapContainer.style.height = mapHeight;
    mapContainer.style.width = '100%';
    mapContainer.setAttribute('id', `map-${SimpleMapManager.mapCounter++}`);
    section.appendChild(mapContainer);

    this._addColorPicker(section); // Ajouter le sélecteur de couleur

    const initMap = () => {
        if (!window.L) {
            setTimeout(initMap, 100);
            return;
        }

        const map = L.map(mapContainer).setView(center, zoom);

        const baseMaps = {
            "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }),
            "Satellite": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
                maxZoom: 17,
                attribution: '© OpenTopoMap contributors'
            }),
            "CartoDB Dark": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
                attribution: '© CartoDB contributors'
            })
        };

        baseMaps["OpenStreetMap"].addTo(map);
        L.control.layers(baseMaps).addTo(map);

        const drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);

        const drawControl = new L.Control.Draw({
            position: 'topright',
            draw: {
                polyline: { shapeOptions: { color: this.currentDrawColor } },
                polygon: { shapeOptions: { color: this.currentDrawColor } },
                rectangle: { shapeOptions: { color: this.currentDrawColor } },
                marker: {
                    icon: L.icon({
                        iconUrl: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="${this.currentDrawColor}" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"/>
                            </svg>
                        `),
                        iconSize: [24, 24],
                        iconAnchor: [12, 24]
                    })
                }
            },
            edit: {
                featureGroup: drawnItems
            }
        });
        map.addControl(drawControl);

        map.on(L.Draw.Event.CREATED, (event) => {
            const layer = event.layer;
            const layerType = event.layerType;
        
            const tooltipStyle = `
                background-color: ${this.currentDrawColor};
                color: #fff;
                padding: 5px;
                border-radius: 5px;
            `;
        
            if (layerType === 'marker') {
                // Créer une icône dynamique avec la couleur sélectionnée
                const customIcon = L.icon({
                    iconUrl: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="${this.currentDrawColor}" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                        </svg>
                    `),
                    iconSize: [24, 24],
                    iconAnchor: [12, 24]
                });
        
                layer.setIcon(customIcon); // Appliquer l'icône avec la couleur sélectionnée
        
                layer.bindTooltip(
                    `<div style="${tooltipStyle}"><strong>Point</strong><br>Latitude: ${layer.getLatLng().lat.toFixed(6)}<br>Longitude: ${layer.getLatLng().lng.toFixed(6)}</div>`,
                    { permanent: false }
                );
            } else {
                layer.setStyle({ color: this.currentDrawColor });
                const properties = this.calculateProperties(layer);
        
                if (layerType === 'polygon' || layerType === 'rectangle') {
const markersInside = this._getMarkersInsidePolygon(layer);

// Construire une liste d'informations sur les marqueurs
let markersDetails = '';
markersInside.forEach((marker, index) => {
    markersDetails += `<br><strong>Marqueur ${index + 1}</strong><br>`;
    Object.entries(marker.properties).forEach(([key, value]) => {
        markersDetails += `${key}: ${value}<br>`;
    });
});

// Contenu de l'infobulle
const tooltipContent = `
    <div style="${tooltipStyle}">
        <strong>Objet</strong><br>
        Aire: ${(properties.area / 1000000).toFixed(2)} km²<br>
        Périmètre: ${properties.perimeter.toFixed(2)} m<br>
        Marqueurs à l'intérieur: ${markersInside.length}
        ${markersDetails ? `<br>Détails des marqueurs: ${markersDetails}` : ''}
    </div>
`;

// Lier l'infobulle au polygone ou au rectangle
layer.bindTooltip(tooltipContent, { permanent: false });
} else if (layerType === 'polyline') {
                    layer.bindTooltip(
                        `<div style="${tooltipStyle}"><strong>Ligne</strong><br>Longueur: ${properties.length.toFixed(2)} m</div>`,
                        { permanent: false }
                    );
                }
            }
        
            drawnItems.addLayer(layer);
        });

        this.maps.set(mapContainer.id, { instance: map, markers: drawnItems });
    };

    initMap();
}

    _// Fonction pour obtenir tous les marqueurs à l'intérieur d'un polygone
_getMarkersInsidePolygon(polygon) {
    let markersInside = []; // Liste pour stocker les marqueurs situés à l'intérieur du polygone
    
    // Itération sur toutes les cartes dans la collection `this.maps`
    this.maps.forEach((mapInfo) => {
        const markers = mapInfo.markers; // Récupère tous les marqueurs associés à cette carte
        
        // Parcours de chaque layer (marqueur) dans la carte
        markers.eachLayer((layer) => {
            if (!layer.options.id) {
                // Si le marqueur n'a pas d'ID (c'est probablement un marqueur dessiné ou un autre type de layer), l'ignorer
                return;
            }
            
            // Vérifier si le layer est un marqueur et si sa position est à l'intérieur des limites du polygone
            if (layer instanceof L.Marker && polygon.getBounds().contains(layer.getLatLng())) {
                // Si le marqueur a une propriété `editor`, cela signifie qu'il a été dessiné via Leaflet Draw
                if (layer.editor) {
                    // Ignorer les marqueurs dessinés via Leaflet Draw
                    return;
                }
                
                // Si ce n'est pas un marqueur dessiné, ajouter ses propriétés à la liste
                const markerProperties = layer.options || { name: "Propriété manquante" };
                markersInside.push({
                    position: layer.getLatLng(), // Ajoute la position du marqueur
                    properties: markerProperties, // Ajoute ses propriétés
                });
            }
        });
    });

    // Retourne la liste des marqueurs à l'intérieur du polygone
    return markersInside;
}

    
    addUserMarkers(mapId, userLocations, propertyKeys) {
        const mapInfo = this.maps.get(mapId);
        if (!mapInfo) {
            console.error(`Aucune carte trouvée avec l'ID "${mapId}".`);
            return;
        }
    
        const { instance: map, markers } = mapInfo;
    
        userLocations.forEach(user => {
            if (!user.latitude || !user.longitude) {
                console.error("Coordonnées invalides pour un utilisateur :", user);
                return;
            }
    
            // Créer un objet contenant les propriétés nécessaires
            const t=false
            const markerOptions = {};
            propertyKeys.forEach(key => {
                if (user[key] !== undefined) {

                    markerOptions[key] = user[key];
                }
            });
    
            // Créer le marqueur avec les propriétés
            const marker = L.marker([user.latitude, user.longitude], { ...markerOptions });
    
            // Création de l'infobulle
            let infoContent = `<div><strong>Informations</strong><br>`;
            propertyKeys.forEach(key => {
                if (user[key] !== undefined) {
                    infoContent += `${key}: ${user[key]}<br>`;
                }
            });
            infoContent += `</div>`;
    
            marker.bindTooltip(infoContent, { permanent: false });
            markers.addLayer(marker);
        });
    
        map.fitBounds(markers.getBounds(), { padding: [20, 20] });
    }
    
}


