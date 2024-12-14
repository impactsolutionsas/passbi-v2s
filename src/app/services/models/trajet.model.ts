export interface Trajet {
  id?: number;            // ID unique du trajet généré par le serveur
  trajetId: string;      // ID unique du trajet, probablement généré côté serveur
  sellingId: string;    // ID de la vente à laquelle appartient ce trajet
  number: number;        // Numéro du trajet dans la séquence de la vente
  distance: number;      // Distance parcourue pendant le trajet
  itineraryId: number;   // ID de l'itinéraire associé
  duration: string;     // Durée du trajet (ex: "40 minutes", format à définir)
  departureTime: string; // Heure de départ, format à définir
  arrivalTime: string;  // Heure d'arrivée, format à définir (peut être "En cours")
  rising: string;        // Point de départ du trajet
  destination: string;  // Point d'arrivée du trajet
  companieId: number;
  reseauId: number;
  operatorId: number;
  revenue: number;      // Revenu généré par ce trajet spécifique
  ticketsCount: number;  // Nombre de billets vendus pour ce trajet
  isActivated: boolean;
  isOnline: boolean;     // Indique si le trajet a été synchronisé avec le serveur
}
