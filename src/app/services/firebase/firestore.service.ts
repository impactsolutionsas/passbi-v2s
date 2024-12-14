import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Session } from '../models/session.model';

@Injectable({
  providedIn: 'root'
})
export class RemoteService {

  constructor(private firestore: Firestore) {}

  async remoteSessions(deviceId: number): Promise<Session | null> {
    const today = new Date().toLocaleDateString('fr-FR');

    try {
      // Référence à la collection Firestore
      const sessionsCollection = collection(this.firestore, 'sessions');

      // Créer une requête pour Firestore
      const sessionsQuery = query(
        sessionsCollection,
        where('deviceId', '==', deviceId),
        where('sellingDate', '==', today)
      );

      // Exécuter la requête
      const querySnapshot = await getDocs(sessionsQuery);

      // Récupérer le premier document correspondant
      const sessionDoc = querySnapshot.docs[0];
      if (sessionDoc) {
        const data = sessionDoc.data() as Session;

        // Vérifier si la session est activée
        return data;
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions Firebase :', error);
      return null;
    }
  }

  /**
   * Ajoute ou met à jour une session en ligne (upsert).
   * @param newSession La session à ajouter ou mettre à jour.
   * @returns La session ajoutée ou mise à jour.
   */
  async onlineAddSession(newSession: Session): Promise<Session> {
    try {
      console.log('Starting online update');
      // Référence au document basé sur "offlineId"
      const sessionRef = doc(this.firestore, `sessions/${newSession.offlineId}`);

      // Vérifier si le document existe
      const sessionSnapshot = await getDoc(sessionRef);

      if (sessionSnapshot.exists()) {
        // Retourner les données existantes
        const existingSession = sessionSnapshot.data() as Session;
        console.log("🚀 ~ SessionService ~ findOrCreateSession ~ found session:", existingSession);
        return existingSession;
      } else {
        // Créer un nouveau document
        await setDoc(sessionRef, newSession);
        console.log("🚀 ~ SessionService ~ findOrCreateSession ~ created session:", newSession);
        return newSession;
      }
    } catch (error) {
      console.error("Erreur lors de la recherche ou création de la session :", error);
      throw error;
    }
  }
/**
   * Met à jour ou crée une session en ligne.
   * @param session La session à mettre à jour ou créer.
   * @returns La session mise à jour ou créée.
   */
async onlineUpdateSession(session: Session): Promise<Session> {
  try {
    // Référence au document basé sur "offlineId"
    const sessionRef = doc(this.firestore, `sessions/${session.offlineId}`);

    // Récupérer le document actuel
    const existingDoc = await getDoc(sessionRef);

    if (existingDoc.exists()) {
      console.log('Document exists, updating...');
    } else {
      console.log('Document does not exist, creating new...');
    }

    // Ajouter ou mettre à jour la session
    await setDoc(sessionRef, session, { merge: true });

    console.log('Session mise à jour ou créée avec succès :', session);
    return session;
  } catch (error) {
    console.error('Erreur lors de la mise à jour ou création de la session :', error);
    throw error;
  }
}

async rtUpdateSession(session: Session): Promise<Session> {
  try {
    // Référence au document basé sur "offlineId"
    const sessionRef = doc(this.firestore, `selling/${session.offlineId}`);
    let data = {
      seller: session.seller,
      driver: session.driver,
      startTime: session.startTime,
      endTime: session.endTime,
      lastTicket: session.lastTicket,
      ticketCount : session.ticketCount,
      trajetCount : session.trajetCount,
      solde : session.solde,
      expense : session.expense,
      revenue : session.revenue,
      controlsCount : session.controlsCount,
      sellingDate: session.sellingDate,
      isActiveted: session.isActiveted
    }
    // Récupérer le document actuel
    const existingDoc = await getDoc(sessionRef);

    if (existingDoc.exists()) {
      console.log('Selling exists, updating...');
    } else {
      console.log('Selling does not exist, creating new...');
    }
    // Ajouter ou mettre à jour la session
    await setDoc(sessionRef, data, { merge: true });

    console.log('Session mise à jour ou créée avec succès :', session);
    return session;
  } catch (error) {
    console.error('Erreur lors de la mise à jour ou création de la session :', error);
    throw error;
  }
}

}
