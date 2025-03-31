// js/stationManager.js
class StationManager {
    constructor() {
        this.stations = [];
        this.STORAGE_KEY = 'sncf_stations_v6';
        this.init();
    }

    init() {
        this.loadStations();
        this.setupEventListeners();
        this.updateAllStationSelects();
        this.renderStationsTable();
    }

    loadStations() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) this.stations = JSON.parse(stored);
    }

    saveStations() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.stations));
    }

    setupEventListeners() {
        const form = document.getElementById('stationForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateStation();
            });
        }
    }

    handleCreateStation() {
        const name = document.getElementById('stationName').value.trim();
        const city = document.getElementById('city').value.trim();
        const categories = Array.from(
            document.querySelectorAll('input[name="categories"]:checked')
        ).map(el => el.value);

        if (!name || !city || categories.length === 0) {
            this.showAlert('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }

        const newStation = {
            id: Date.now().toString(),
            name,
            city,
            categories,
            createdAt: new Date().toISOString()
        };

        this.stations.push(newStation);
        this.saveStations();
        this.updateAllStationSelects();
        this.renderStationsTable();
        document.getElementById('stationForm').reset();
        this.showAlert('Gare créée avec succès', 'success');
    }

    updateAllStationSelects() {
        document.querySelectorAll('.station-select').forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '<option value="">-- Sélectionnez une gare --</option>';
            
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

    renderStationsTable() {
        const container = document.getElementById('stationsTableBody');
        if (!container) return;

        container.innerHTML = this.stations.length > 0
            ? this.stations.map(station => this.createStationRow(station)).join('')
            : '<tr><td colspan="4" class="px-6 py-4 text-center text-gray-500">Aucune gare enregistrée</td></tr>';
    }

    // ... (autres méthodes restent inchangées)
}

// Initialisation globale
if (typeof stationManager === 'undefined') {
    const stationManager = new StationManager();
}