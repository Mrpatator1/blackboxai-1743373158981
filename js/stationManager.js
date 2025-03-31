// js/stationManager.js
class StationManager {
    constructor() {
        this.stations = [];
        this.STORAGE_KEY = 'sncf_stations_sync_v2';
        this.init();
    }

    init() {
        this.loadStations();
        this.setupEventListeners();
        this.setupSync();
    }

    loadStations() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) this.stations = JSON.parse(stored);
    }

    saveStations() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.stations));
        this.triggerSync();
    }

    setupSync() {
        // Synchronisation entre onglets
        window.addEventListener('storage', (e) => {
            if (e.key === this.STORAGE_KEY) {
                this.loadStations();
                this.updateUI();
            }
        });

        // Synchronisation dans le même onglet
        window.addEventListener('stationsUpdated', () => {
            this.updateUI();
        });
    }

    triggerSync() {
        // Pour les autres onglets
        localStorage.setItem(this.STORAGE_KEY + '_sync', Date.now());
        
        // Pour le même onglet
        window.dispatchEvent(new Event('stationsUpdated'));
    }

    updateUI() {
        this.updateStationSelects();
        if (document.getElementById('stationsTableBody')) {
            this.renderStations();
        }
    }

    updateStationSelects() {
        document.querySelectorAll('.station-select').forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="">-- Sélectionner --</option>';
            
            this.stations.forEach(station => {
                const option = document.createElement('option');
                option.value = station.id;
                option.textContent = `${station.name} (${station.city})`;
                select.appendChild(option);
            });

            if (currentValue && this.stations.some(s => s.id === currentValue)) {
                select.value = currentValue;
            }
        });
    }

    // ... (autres méthodes existantes)
}

// Initialisation globale
window.stationManager = new StationManager();