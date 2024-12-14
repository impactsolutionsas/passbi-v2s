export interface Rental {
  id: string;
  isOnline: boolean;
  offlineId: string;      // ID unique généré localement (ex: avec uuidv4())
  companieName: string;   // Nom de la compagnie de location
  companiePhone: string;  // Numéro de téléphone de la compagnie
  price: number;          // Prix de la location
  destination: string;     // Destination de la location
  sellingId: string;      // ID de la vente à laquelle cette location est associée
  startTime: string;       // Heure de début de la location, format à définir
  endTime: string;         // Heure de fin de la location, format à définir
  companieId: string;     // ID de la compagnie
  operatorId: string;     // ID de l'opérateur
  reseauId: string;       // ID du réseau
  isActivated: boolean;   // Indique si la location est active
}
