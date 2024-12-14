interface Itinerary {
  id: number;
  name: string;
  distance: number;
  isActiveted: boolean;
  reseauId: number;
  rates: Rates[];
  coordinates: Coordinates[];
}

interface Rates {
  id: number;
  name: string;
  price: number;
  section: string;
  itineraryId: number;
}

interface Coordinates {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  itineraryId: number;
}
interface Rubrics {
  id: number;
  name: string;
  isActiveted: boolean;
  reseauId: number;
}

interface Controller {
  id: number;
  name: string;
  phone: string;
  password: string;
  gender: string;
  isActiveted: boolean;
  createdAt: string;
  ReseauId: number;
}
interface Reseau {
  id: number;
  type: string;
  name: string;
  isActiveted: boolean;
  createdAt: string;
  updatedAt: string;
  Itinerary: Itinerary[];
  Rubrics: Rubrics[];
  Controller: Controller[];
}

interface Companie {
  id: number;
  categorie: string;
  gestionType: string;
  name: string;
  email: string;
  phone: string;
  manager: string;
  adress: string;
  ninea: string;
  logo: string;
  isActiveted: boolean;
  createdAt: string;
  updatedAt: string;
  ReseauId: number;
}

interface Operator {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  companieId: number;
  isActiveted: boolean;
  createdAt: string;
  updatedAt: string;
  reseauId: number;
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

export interface Device {
  id: string;
  deviceCode: string;
  code: string;
  isActiveted: boolean;
  createdAt: string;
  updatedAt: string;
  operatorId: number;
  CompanieId: number;
  vehiculeId: number;
  reseauId: number;
  reseau: Reseau;
  Companie: Companie;
  operator: Operator;
  vehicule: Vehicule;
}
