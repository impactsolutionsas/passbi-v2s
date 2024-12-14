import { Injectable } from '@angular/core';
import { Session } from '../models/session.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
import { switchMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private dbPromise: Promise<IDBDatabase>;
  private currentSessionSubject: BehaviorSubject<Session | null> = new BehaviorSubject<Session | null>(null);
  currentSession$ = this.currentSessionSubject.asObservable();
  private _Session: BehaviorSubject<Session[]> = new BehaviorSubject<Session[]>([]);

  constructor(
    private storage: Storage,) {
      this.storage.create();
      this.dbPromise = this.initIndexedDB();
  }
  private initIndexedDB(): Promise<IDBDatabase> {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('sessionDB', 2);
      request.onerror = (event) => {
        console.error('Erreur IndexedDB:', event);
        reject(event);
      };
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        db.createObjectStore('sessions', { keyPath: 'offlineId' });
      };
      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };
    });
  }
  cleanSessionDB(){
    return this.dbPromise.then((db) => {
      const tx = db.transaction('sessions', 'readwrite');
      const store = tx.objectStore('sessions');
      store.clear();
    });
  }
  get Sessions(): Observable<Session[]> {
    return this._Session.asObservable();
  }
  async storeSessionLocally(session: Session): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');
    await store.put(session);
  }
  async getSessionsLocally(): Promise<Session[]> {
    const db = await this.dbPromise;
    const tx = db.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');
    return new Promise<Session[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => {
        console.error('Erreur IndexedDB lors de la récupération des sessions :', event);
        reject(event);
      };
    });
  }
  async verifSession(deviceId: number): Promise<Session | null> {
    const sessions = await this.getSessionsLocally();
    const today = new Date().toLocaleDateString('fr-FR');
    //const today = '15/12/2024';
    const currentSession = sessions.find(s => s.deviceId === deviceId && s.sellingDate === today);
    if (currentSession) {
      return currentSession
    } else {
      this.cleanSessionDB();
      return null
    }
  }

  async verifOrFetchSession(deviceId: number): Promise<Session | null> {
    const existingSession = await this.verifSession(deviceId);
    if (existingSession) {
      return existingSession;
    }else{
      return null;
    }

  }
  async updateLocalSession(session: Session): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');
    await store.put(session);
  }
}
