import { DayliePaid } from "./dayliPay.model";

export interface Session {
  id?: number; // ID unique pour la vente
  offlineId: string; // ID unique généré localement pour le mode hors ligne
  type: 'Vente';
  itineraryId: number; // ID de l'itinéraire
  seller: string; // ID ou nom du vendeur
  revenue: number;
  expense: number;
  solde: number;
  ticketCount: number;
  trajetCount: number;
  controlsCount: number;
  driver: string; // ID ou nom du chauffeur
  deviceId: number;
  startTime: string; // Heure de début, format à définir (ex: "HH:mm")
  endTime: string; // Heure de début, format
  sellingDate: string; // Date de la vente, format à définir (ex: "YYYY-MM-DD")
  vehiculeId: number;
  companieId: number;
  operatorId: number;
  reseauId: number;
  isActiveted: boolean;
  isOnline: boolean;
  itinerary: Itinerary
  dayliePaid?: DayliePaid
  trips?: Trip[]
  lastTicket: lastTicket
  controles?: Controles[],
  fees?: Frais[],
  rentals?: Rentals[],
  vehicule?: Vehicule
}
interface Vehicule {
  id: number;
  matricule: string;
  type: string;
  isActiveted: boolean;
  createdAt: string;
  updatedAt: string;
  operatorId: number;
  CompanieId: number;
  reseauId: number;
}
export interface Controles {
  offlineId: string;
  controllerName: string;
  checkedTickets: number;
  ticketFraude: number;
  comment: string;
  startTime: string;
  endTime: string;
  controllerId: string;
  trajetId: string;
}
export interface Frais {
  offlineId: string;
  rubricsId: string;
  name: string;
  price: number;
}
export interface Rentals {
  offlineId: string;
  companieName: string;
  companiePhone: string;
  price: number;
  destination: string;
  startTime: string;
  endTime: string;
  isActivated: boolean;
}
export interface lastTicket {
  code: string;
  price: number;
  name: string;
  time: string;
  zone: string;
}
export interface Trip {
  tripId: string;
  number: number;
  distance: number;
  itineraryId: number;
  duration: string;
  departureTime: string;
  arrivalTime: string;
  rising: string;
  destination: string;
  revenue: number;
  ticketsCount: number;
  isActivated: boolean;
  tickets?: Tickets[];
}

export interface Tickets {
  code: string;
  price: number;
  name: string;
  validUntil: string;
  startTime: string;
  endTime: string;
  status: string;
  zone: string;
  rateId: number;
  tripId: string;
  ticketId: string;
  isActivated: boolean;
}


export interface Rate {
  id: number;
  name: string;
  price: number;
  section: string;
  itineraryId: number;
}

export interface Coordinate {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  itineraryId: number;
}

export interface Itinerary {
  id: number;
  name: string;
  distance: number;
  reseauId: number;
  isActivated: boolean;
  Rate: Rate[];
  Coordinate: Coordinate[];
}
