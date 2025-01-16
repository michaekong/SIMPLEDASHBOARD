
Documentation de la Classe AdvancedDashboard
Description

La classe AdvancedDashboard crée un tableau de bord flexible qui peut contenir des graphiques et des cartes. Elle gère la création d'un conteneur de grille pour les éléments du tableau de bord et initialise les gestionnaires de graphiques et de cartes.
Constructeur
javascript

constructor(containerId)

Paramètres

    containerId (string) : L'ID du conteneur HTML dans lequel le tableau de bord sera inséré.

Méthodes

    _createGridContainer()
        Crée un conteneur de grille flexible pour le tableau de bord.

    addChart(type, data, options = {})
        Ajoute un graphique au tableau de bord.
        Paramètres :
            type (string) : Type de graphique à créer (ex. 'bar', 'line', 'pie', etc.).
            data (object) : Les données à afficher dans le graphique.
            options (object, optionnel) : Options supplémentaires pour configurer le graphique (ex. titre, couleurs).

    addMap(title, center, options = {})
        Ajoute une carte au tableau de bord.
        Paramètres :
            title (string) : Titre de la carte.
            center (array) : Coordonnées pour centrer la carte (ex. [latitude, longitude]).
            options (object, optionnel) : Options supplémentaires pour configurer la carte.

Documentation de la Classe SimpleChartManager
Description

La classe SimpleChartManager gère la création et l'affichage de graphiques à l'aide de Chart.js. Elle gère les styles, les schémas de couleurs et la création dynamique de graphiques.
Constructeur
javascript

constructor(gridContainer)

Paramètres

    gridContainer (HTMLElement) : Le conteneur de grille dans lequel les graphiques seront ajoutés.

Méthodes

    _loadChartJS()
        Charge de manière asynchrone la bibliothèque Chart.js.

    _createChartContainer(id, title)
        Crée un conteneur pour un graphique.
        Paramètres :
            id (string) : L'ID du canvas du graphique.
            title (string, optionnel) : Le titre du graphique.

    _getColorScheme(schemeName, count)
        Obtient un schéma de couleurs spécifique pour les graphiques.
        Paramètres :
            schemeName (array) : Un tableau de couleurs spécifiées.
            count (number) : Le nombre de couleurs nécessaires.

    addChart(type, data, options = {})
        Ajoute un graphique au gestionnaire de graphiques.
        Paramètres :
            type (string) : Le type de graphique à créer.
            data (object) : Les données à afficher dans le graphique.
            options (object, optionnel) : Options supplémentaires pour configurer le graphique.

    addCustomColorScheme(name, colors)
        Ajoute un schéma de couleurs personnalisé.
        Paramètres :
            name (string) : Le nom du schéma de couleurs.
            colors (array) : Un tableau de couleurs.

Documentation de la Classe SimpleMapManager
Description

La classe SimpleMapManager est responsable de la gestion des cartes dans un tableau de bord. Elle permet d'ajouter des cartes, de gérer des couches de dessin, de personnaliser l'apparence des éléments sur la carte, et d'interagir avec des marqueurs et des polygones.
Propriétés

    static mapCounter : Compteur statique pour générer des identifiants uniques pour chaque carte créée.
    gridContainer : Conteneur HTML où les cartes seront ajoutées.
    defaultOptions : Options par défaut pour les cartes (zoom, hauteur, couleur de dessin, cartes de base).
    maps : Map qui stocke les instances de cartes créées.
    currentDrawColor : Couleur actuellement utilisée pour le dessin sur la carte.

Constructeur
javascript

constructor(gridContainer)

Paramètres

    gridContainer (Element) : Le conteneur HTML dans lequel les cartes seront ajoutées.

Méthodes

    loadLeaflet()
        Charge les fichiers CSS et JS nécessaires pour utiliser Leaflet et ses plugins (comme Leaflet.Draw).
        Retourne : Une promesse qui est résolue lorsque Leaflet a été chargé.

    _createSection(title)
        Crée une section dans le conteneur de la grille avec un titre optionnel.
        Paramètres :
            title (string, optionnel) : Titre de la section à créer.
        Retourne : L'élément de section créé.

    _addColorPicker(container)
        Ajoute un sélecteur de couleur dans le conteneur spécifié pour permettre à l'utilisateur de choisir une couleur pour les éléments dessinés sur la carte.
        Paramètres :
            container (Element) : Le conteneur dans lequel le sélecteur de couleur sera ajouté.

    calculateProperties(layer)
        Calcule les propriétés (aire, périmètre, longueur) d'une couche donnée (polygone, rectangle, polyline).
        Paramètres :
            layer (L.Layer) : La couche à évaluer.
        Retourne : Un objet contenant les propriétés calculées.

    addMap(title, center, options = {})
        Ajoute une nouvelle carte au tableau de bord.
        Paramètres :
            title (string) : Titre de la carte.
            center (array) : Coordonnées pour centrer la carte (ex. [latitude, longitude]).
            options (object, optionnel) : Options supplémentaires pour configurer la carte (zoom, hauteur, etc.).

    _getMarkersInsidePolygon(polygon)
        Récupère tous les marqueurs situés à l'intérieur d'un polygone donné.
        Paramètres :
            polygon (L.Polygon) : Le polygone dans lequel vérifier la présence de marqueurs.
        Retourne : Un tableau d'objets contenant les marqueurs trouvés à l'intérieur du polygone.

    addUserMarkers(mapId, userLocations, propertyKeys)
        Ajoute des marqueurs représentant des utilisateurs sur une carte spécifiée.
        Paramètres :
            mapId (string) : L'ID de la carte à laquelle les marqueurs doivent être ajoutés.
            userLocations (array) : Un tableau d'objets contenant les coordonnées et les propriétés des utilisateurs.
            propertyKeys (array) : Un tableau de clés pour extraire les propriétés des utilisateurs à afficher dans les infobulles des marqueurs.

Exemple d'Utilisation
javascript

const mapManager = new SimpleMapManager(document.getElementById('mapContainer'));
mapManager.addMap('Ma Carte', [48.8566, 2.3522]); // Ajoute une carte centrée sur Paris.

Remarques

    Assurez-vous que l'environnement prend en charge Leaflet et que les ressources sont bien chargées avant d'utiliser cette classe.
    Les couleurs des éléments dessinés sur la carte peuvent être personnalisées à l'aide du sélecteur de couleur intégré.
