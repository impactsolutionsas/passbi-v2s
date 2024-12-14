import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  isConnected: boolean = false;

  constructor() {
    this.monitorNetwork();
  }

  /**
   * Vérifie si une connexion Internet fonctionnelle est disponible en effectuant un ping HTTP.
   * @returns {Promise<boolean>} - Retourne true si Internet est disponible, false sinon.
   */
  async isInternetAvailable(): Promise<boolean> {
    try {
      const response = await fetch('https://www.google.com', { method: 'HEAD', mode: 'no-cors' });
      return response ? true : false; // Si la requête réussit, Internet est disponible
    } catch {
      return false; // En cas d'erreur, Internet est considéré comme indisponible
    }
  }


  /**
   * Surveille l'état du réseau en temps réel.
   */
  private monitorNetwork() {
    Network.addListener('networkStatusChange', async (status) => {
      console.log('Network status changed:', status);
      this.isConnected = status.connected;

      // Effectuez une vérification active si nécessaire
      if (this.isConnected) {
        const internetAvailable = await this.isInternetAvailable();
        console.log('Internet functional:', internetAvailable);
        this.isConnected = internetAvailable;
      }
    });
  }
}
