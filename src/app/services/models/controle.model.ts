export interface Controle {
  id: string;
  isOnline: boolean;
  offlineId: string;        // ID unique généré localement (ex: avec uuidv4())
  controllerName: string;   // Nom du contrôleur
  checkedTickets: number;   // Nombre de billets vérifiés
  ticketFraude: number;     // Nombre de billets frauduleux détectés
  comment: string;         // Champ de commentaires (peut être "En cours" initialement)
  startTime: string;       // Heure de début du contrôle, format à définir
  endTime: string;         // Heure de fin du contrôle, format à définir
  controllerId: string;    // ID du contrôleur
  trajetId: string;         // ID du trajet concerné par le contrôle
  itineraryId: string;      // ID de l'itinéraire
  sellingId: string;        // ID de la vente
  companieId: string;
  operatorId: string;
  reseauId: string;
  vehiculeId: string;
}
