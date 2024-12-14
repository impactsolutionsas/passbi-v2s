import { Injectable } from '@angular/core';
import { Device } from '../models/device.model';
import { InitService } from '../init/init.service';

@Injectable({
  providedIn: 'root'
})
export class localDeviceService {
  private dbPromise: Promise<IDBDatabase>;
  constructor(
    private initService: InitService,
  ) {
    this.dbPromise = this.initIndexedDB();
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
  storeDevicesLocally(devices: Device[]): Promise<void> {
    return this.dbPromise.then((db) => {
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction('devices', 'readwrite');
        const store = tx.objectStore('devices');

        Promise.all(
          devices.map((device) => {
            return new Promise((res, rej) => {
              const request = store.put(device);
              request.onsuccess = res;
              request.onerror = rej;
            });
          })
        )
          .then(() => {
            resolve();
          })
          .catch((err) => {
            reject(err);
          });
      });
    });
  }
  async verif(deviceCode: string): Promise<Device | any> {
    try {
      const user = await this.getUserByCode(deviceCode);
      if (user) {
        return user;
      } else {
        const onlineUser = await this.initService.verifDevices(deviceCode)
        console.log("🚀 ~ AuthService ~ login ~ onlineUser:", onlineUser)
        return onlineUser;
      }
    } catch (error) {
      console.error('Erreur lors de la connexion :', error);
      throw error;
    }
  }
  private getUserByCode(deviceCode: string): Promise<Device | undefined> {
    return this.dbPromise.then((db) => {
      const tx = db.transaction('devices', 'readonly');
      const store = tx.objectStore('devices');
      return new Promise<Device | undefined>((resolve, reject) => {
        const request = store.openCursor();
        request.onsuccess = (event: any) => {
          const cursor = event.target.result;
          if (cursor) {
            const device: Device = cursor.value;
            if (device.deviceCode === deviceCode) {
              resolve(device); // Utilisateur trouvé
              return;
            }
            cursor.continue(); // Passer à l'enregistrement suivant
          } else {
            resolve(undefined); // Aucun utilisateur trouvé
          }
        };
        request.onerror = (event) => {
          console.error(`Erreur IndexedDB lors de la recherche de l'utilisateur :`, event);
          reject(event);
        };
      });
    });
  }
  getDeviceLocally(id: number): Promise<Device | undefined> {
    return this.dbPromise.then(db => {
      const tx = db.transaction('devices', 'readonly');
      const store = tx.objectStore('devices');
      return new Promise<Device | undefined>((resolve, reject) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => {
          console.error(`IndexedDB Error fetching device ${id}:`, event);
          reject(event);
        };
      });
    });
  }

}
