// Initialize localStorage with sample data if empty
function initializeData() {
    // Check if data already exists
    if (localStorage.getItem('dataInitialized')) {
        return;
    }
    if (!localStorage.getItem('timetables')) {
        const sampleTimetables = [
            {
                id: 1,
                trainId: 'TGV-001',
                departure: '08:00',
                arrival: '10:30',
                stations: ['Paris Gare de Lyon', 'Lyon Part-Dieu'],
                days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
            },
            {
                id: 2,
                trainId: 'TER-045',
                departure: '07:15',
                arrival: '08:45',
                stations: ['Lyon Part-Dieu', 'Grenoble'],
                days: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
            }
        ];
        localStorage.setItem('timetables', JSON.stringify(sampleTimetables));
    }

    if (!localStorage.getItem('stations')) {
        const sampleStations = [
            { id: 1, name: 'Paris Gare de Lyon', city: 'Paris' },
            { id: 2, name: 'Lyon Part-Dieu', city: 'Lyon' },
            { id: 3, name: 'Grenoble', city: 'Grenoble' }
        ];
        localStorage.setItem('stations', JSON.stringify(sampleStations));
    }
}

// Utility functions
function getTimetables() {
    return JSON.parse(localStorage.getItem('timetables')) || [];
}

function getStations() {
    return JSON.parse(localStorage.getItem('stations')) || [];
}

function saveTimetables(timetables) {
    localStorage.setItem('timetables', JSON.stringify(timetables));
}

function generateId(items) {
    return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
}

function validateTime(time) {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
}

// Filter stations in select dropdown
function filterStations(searchId, selectId) {
    const searchInput = document.getElementById(searchId);
    const select = document.getElementById(selectId);
    
    searchInput.addEventListener('input', () => {
        const filter = searchInput.value.toLowerCase();
        const options = select.options;
        
        for (let i = 0; i < options.length; i++) {
            const text = options[i].text.toLowerCase();
            options[i].style.display = text.includes(filter) ? '' : 'none';
        }
    });
}

// Updated form handling with validation
function handleSubmit(e) {
    e.preventDefault();
    
    // Get form values
    const id = document.getElementById('timetableId').value;
    const trainId = document.getElementById('trainId').value.trim();
    const departure = document.getElementById('departure').value.trim();
    const arrival = document.getElementById('arrival').value.trim();
    const origin = document.getElementById('originStation').value;
    const destination = document.getElementById('destinationStation').value;
    const intermediateStations = document.getElementById('intermediateStations').value.trim();

    // Validate required fields
    if (!trainId || !departure || !arrival || !origin || !destination) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    // Validate time format
    if (!validateTime(departure) || !validateTime(arrival)) {
        alert('Veuillez entrer des heures valides au format HH:mm');
        return;
    }

    // Validate different stations
    if (origin === destination) {
        alert('La gare de départ et d\'arrivée doivent être différentes');
        return;
    }

    // Build stations array
    let stations = [origin];
    if (intermediateStations) {
        stations = stations.concat(
            intermediateStations.split(',')
                .map(s => s.trim())
                .filter(s => s !== '')
        );
    }
    stations.push(destination);

    // Get selected days
    const days = Array.from(document.querySelectorAll('input[name="days"]:checked'))
        .map(cb => cb.value);

    if (days.length === 0) {
        alert('Veuillez sélectionner au moins un jour de circulation');
        return;
    }

    // Save timetable
    const timetables = getTimetables();
    let updatedTimetables;

    if (id) {
        updatedTimetables = timetables.map(t => 
            t.id === parseInt(id) ? { 
                ...t, 
                trainId, 
                departure, 
                arrival, 
                stations, 
                days 
            } : t
        );
    } else {
        const newId = generateId(timetables);
        updatedTimetables = [...timetables, { 
            id: newId, 
            trainId, 
            departure, 
            arrival, 
            stations, 
            days 
        }];
    }

    saveTimetables(updatedTimetables);
    closeModal();
    loadTimetables();
    
    // Update departures/arrivals if needed
    if (window.location.pathname.includes('prochains-departs.html')) {
        loadDepartures();
    }
    
    alert('Horaire enregistré avec succès!');
}

// Modal initialization
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Ajouter un horaire';
    document.getElementById('timetableId').value = '';
    document.getElementById('timetableForm').reset();
    
    const originSelect = document.getElementById('originStation');
    const destSelect = document.getElementById('destinationStation');
    
    originSelect.innerHTML = '<option value="">-- Sélectionnez une gare --</option>';
    destSelect.innerHTML = '<option value="">-- Sélectionnez une gare --</option>';
    
    const stations = getStations();
    stations.forEach(station => {
        const option = document.createElement('option');
        option.value = station.name;
        option.textContent = `${station.name} (${station.city})`;
        originSelect.appendChild(option.cloneNode(true));
        destSelect.appendChild(option.cloneNode(true));
    });
    
    filterStations('originSearch', 'originStation');
    filterStations('destinationSearch', 'destinationStation');

    document.querySelectorAll('input[name="days"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.getElementById('timetableModal').classList.remove('hidden');
}

// ===== GESTION AVANCEE DES GARES =====
const StationCategories = {
    GRANDE_LIGNE: 'grande_ligne',
    TER: 'ter',
    TRANSILIEN: 'transilien',
    INTERNATIONAL: 'international'
};

function validateStationData(station) {
    if (!station.name || !station.city || !station.coordinates) {
        throw new Error('Tous les champs obligatoires doivent être remplis');
    }
    if (!/^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(station.coordinates)) {
        throw new Error('Format de coordonnées invalide');
    }
    return true;
}

async function updateStation(id, updates) {
    try {
        validateStationData(updates);
        const stations = getStations().map(s => 
            s.id === id ? { ...s, ...updates } : s
        );
        await saveStations(stations);
        return true;
    } catch (error) {
        console.error("Erreur mise à jour:", error);
        return false;
    }
}

async function deleteStation(id) {
    try {
        const stations = getStations().filter(s => s.id !== id);
        await saveStations(stations);
        return true;
    } catch (error) {
        console.error("Erreur suppression:", error);
        return false;
    }
}

// ===== GESTION COMPLETE DES GARES =====
const STATIONS_KEY = 'sncf_stations';

function getStations() {
    return JSON.parse(localStorage.getItem(STATIONS_KEY)) || [];
}

function saveStations(stations) {
    localStorage.setItem(STATIONS_KEY, JSON.stringify(stations));
    localStorage.setItem('stations_updated', Date.now().toString());
    return true;
}

function generateStationId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function validateStation({name, city, coordinates}) {
    if (!name || !city) {
        throw new Error('Le nom et la ville sont obligatoires');
    }
    if (coordinates && !/^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(coordinates)) {
        throw new Error('Format de coordonnées invalide (ex: 48.8446,2.3737)');
    }
    return true;
}

function addStation(stationData) {
    try {
        validateStation(stationData);
        const stations = getStations();
        const newStation = {
            id: generateStationId(),
            name: stationData.name.trim(),
            city: stationData.city.trim(),
            coordinates: stationData.coordinates?.trim() || '',
            category: stationData.category || 'grande_ligne',
            createdAt: new Date().toISOString()
        };
        stations.push(newStation);
        saveStations(stations);
        return newStation;
    } catch (error) {
        console.error("Erreur création gare:", error);
        throw error;
    }
}

function updateStation(id, updates) {
    try {
        validateStation(updates);
        const stations = getStations().map(station => 
            station.id === id ? { ...station, ...updates } : station
        );
        saveStations(stations);
        return true;
    } catch (error) {
        console.error("Erreur modification gare:", error);
        throw error;
    }
}

function deleteStation(id) {
    const stations = getStations().filter(station => station.id !== id);
    return saveStations(stations);
}

// Fonction pour charger et afficher les gares
function loadStations() {
    const stations = getStations();
    const container = document.getElementById('stationsContainer');
    
    if (!container) {
        console.error('Element stationsContainer non trouvé');
        return;
    }

    container.innerHTML = stations.map(station => `
        <div class="station-card bg-white p-4 rounded-lg shadow mb-4">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-bold">${station.name}</h3>
                    <p class="text-gray-600">${station.city}</p>
                    ${station.coordinates ? `
                    <p class="text-sm text-gray-500 mt-1">
                        <i class="fas fa-map-marker-alt mr-1"></i>${station.coordinates}
                    </p>` : ''}
                </div>
                <div class="flex space-x-2">
                    <button onclick="openEditModal('${station.id}')" 
                            class="text-blue-600 hover:text-blue-800 p-2">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="confirmDelete('${station.id}')" 
                            class="text-red-600 hover:text-red-800 p-2">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    if (stations.length === 0) {
        container.innerHTML = '<p class="text-center py-8 text-gray-500">Aucune gare enregistrée</p>';
    }
}

// Ajoutez à la fin de script.js
window.StationsManager = {
    getStations,
    addStation,
    updateStation,
    deleteStation,
    loadStations,
    setupEventListeners
};
