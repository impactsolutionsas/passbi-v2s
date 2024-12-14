import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from '../supabase/supabase.service';
import { Device } from '../models/device.model';
import { AlertController, LoadingController } from '@ionic/angular';

const DEVICE_DB = 'DeviceAttribution';
@Injectable({
  providedIn: 'root',
})
export class InitService {
  private db: any;
  private _devices: BehaviorSubject<any> = new BehaviorSubject([]);
  private dbPromise: Promise<IDBDatabase>;
  isLoading = false;

  constructor(
    private supabase: SupabaseService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {
    this.dbPromise = this.initIndexedDB();
    this.db = this.supabase.connect();
    this.handleChange();
  }
  private initIndexedDB(): Promise<IDBDatabase> {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('devicesDB', 1);
      request.onerror = (event) => {
        console.error('IndexedDB Error:', event);
        reject(event);
      };
      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        db.createObjectStore('devices', { keyPath: 'id' });
      };
      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };
    });
  }
  cleanDevicesDB() {
    return this.dbPromise.then((db) => {
      const tx = db.transaction('devices', 'readwrite');
      const store = tx.objectStore('devices');
      store.clear();
    });
  }
  get devices(): Observable<Device[]> {
    return this._devices.asObservable();
  }
  handleChange() {
    this.db
      .channel('devices-all-channel')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: DEVICE_DB },
        (payload: any) => {
          console.log('Change received!', payload);
          if (payload.eventType === 'UPDATE') {
            const updatedDevices: Device = payload.new;
            const index = this._devices.value.findIndex(
              (Devices: { id: string | undefined }) =>
                Devices.id === updatedDevices.id
            );
            if (index !== -1) {
              // Mettre à jour le Devices dans le tableau
              const updatedDevices = [...this._devices.value];
              updatedDevices[index] = updatedDevices;
              this._devices.next(updatedDevices);
            }
          }
          // this.syncDevices()
        }
      )
      .subscribe();
  }

  async storeDevicesLocally(devices: Device): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction('devices', 'readwrite');
    const store = tx.objectStore('devices');
    await store.put(devices);
  }
  async syncDevices(deviceCode: string): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Chargement des données...',
    });
    await loading.present();

    try {
      this.isLoading = true;
      const query = await this.db
        .from(DEVICE_DB)
        .select(
          '*, Reseau(*, ReseauConfig(*), Supervisor(*), Itinerary(*, Rate(*), Coordinate(*)), Rubrics(*), Controller(*)), Companie(*), Vehicule(*), Operator(*)'
        )
        .eq('deviceCode', deviceCode)
        .single();
      this._devices.next(query.data);
      //await this.cleanDevicesDB();
      await this.storeDevicesLocally(query.data);
      return query.data;
    } catch (error) {
      console.error(
        'Vérifiez votre connexion Internet ou le Matricule.',
        error
      );
      this.isLoading = false;
      loading.dismiss();
    } finally {
      this.isLoading = false;
      loading.dismiss();
    }
  }

  async verifDevices(deviceCode: string): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Chargement des données...',
    });
    await loading.present();

    try {
      this.isLoading = true;

      // Ajout d'un timeout de 1 minute
      const queryWithTimeout = this.runQueryWithTimeout(
        () =>
          this.db
            .from(DEVICE_DB)
            .select(
              '*, Reseau(*, ReseauConfig(*), Supervisor(*), Itinerary(*, Rate(*), Coordinate(*)), Rubrics(*), Controller(*)), Companie(*), Vehicule(*), Operator(*)'
            )
            .eq('deviceCode', deviceCode)
            .single(),
        3000 // Timeout en millisecondes (1 minute)
      );

      const query = await queryWithTimeout;
      const data = (query as any).data
      console.log("🚀 ~ InitService ~ verifDevices ~ query:", data)

      if (data) {
        this._devices.next(data);
        await this.storeDevicesLocally(data); // Sauvegarder les données localement
      } else {
        throw new Error('Vérifiez votre connexion Internet ou le Matricule.');

      this.isLoading = false;
      loading.dismiss();
      }

      this.isLoading = false;
      loading.dismiss();
      return data;
    } catch (error: any) {
      console.error(
        'Erreur inattendue lors de la synchronisation des Devices :',
        error
      );
      if (error.message === 'Timeout') {
        this.showError('La synchronisation a pris trop de temps. Vérifiez votre connexion Internet ou le Matricule.');
      } else {
        this.showError('Vérifiez votre connexion Internet ou le Matricule.');
      }
    } finally {
      this.isLoading = false;
      loading.dismiss();
    }
  }

  /**
   * Exécute une requête avec un timeout.
   * @param queryFn Fonction retournant une promesse de requête.
   * @param timeout Durée maximale en millisecondes avant le timeout.
   */
  private async runQueryWithTimeout<T>(
    queryFn: () => Promise<T>,
    timeout: number
  ): Promise<T> {
    return Promise.race([
      queryFn(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeout)
      ),
    ]);
  }

  /**
   * Affiche un message d'erreur à l'utilisateur.
   * @param message Message à afficher.
   */
  private async showError(message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Erreur',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

}
