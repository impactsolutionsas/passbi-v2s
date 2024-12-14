export interface Ticket {
  id?: number;
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
  sellingId: string;
  companieId: number;
  operatorId: number;
  reseauId: number;
  offlineId: string;
  isActivated: boolean;
  isOnline: boolean;
}
