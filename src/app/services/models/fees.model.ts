export interface Fees {
  id: string;
  isOnline: boolean; // ID unique du frais (ex: avec uuidv4())
  offlineId: string;      // ID unique généré localement (ex: avec uuidv4())
  rubricsId: string;     // ID de la rubrique à laquelle ce frais est associé
  name: string;          // Nom du frais (probablement dérivé de la rubrique)
  price: number;         // Montant du frais
  sellingId: string;     // ID de la vente à laquelle ce frais est associé
  companieId: string;
  operatorId: string;
  reseauId: string;
}
