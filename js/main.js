// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier que le gestionnaire de gares est chargé
    if (typeof StationManager !== 'undefined') {
        StationManager.init();
    } else {
