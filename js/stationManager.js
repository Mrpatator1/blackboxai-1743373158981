// Gestionnaire de gares SNCF
const StationManager = (function() {
    // Variables privées
    let stations = [];
    const STORAGE_KEY = 'sncf_stations';

    // Méthodes privées
    function loadFromStorage() {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            stations = JSON.parse(storedData);
        }
    }

    function saveToStorage() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stations));
    }

    function renderStations() {
        const container = document.getElementById('stationsContainer');
        if (!container) return;

        if (stations.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-map-marker-alt text-3xl mb-2"></i>
                    <p>Aucune gare enregistrée</p>
                </div>
            `;
            return;
        }

        container.innerHTML = stations.map(station => `
            <div class="station-card p-4 mb-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-bold text-lg">${station.name}</h3>
                        <p class="text-gray-600">${station.city}</p>
                    </div>
                    <div class="flex space-x-2">
                        <button class="edit-btn" data-id="${station.id}">
                            <i class="fas fa-edit text-blue-500"></i>
                        </button>
                        <button class="delete-btn" data-id="${station.id}">
                            <i class="fas fa-trash text-red-500"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Interface publique
    return {
        init: function() {
            loadFromStorage();
            renderStations();
            this.setupEventListeners();
        },

        setupEventListeners: function() {
            // Événements seront ajoutés ici
        },

        addStation: function(stationData) {
            const newStation = {
                id: Date.now().toString(),
                ...stationData,
                createdAt: new Date().toISOString()
            };
            stations.push(newStation);
            saveToStorage();
            renderStations();
        }
    };
})();

// Exporter pour une utilisation globale
window.StationManager = StationManager;