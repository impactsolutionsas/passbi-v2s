import { Injectable } from '@angular/core';
import { AlertController, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Router } from '@angular/router';
import { localDeviceService } from './localDevice.service';
import { Session } from '../models/session.model';
import { DatabaseService } from '../local/database.service';
import { RemoteService } from '../firebase/firestore.service';
import { NetworkService } from '../network.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = false;

  constructor(
    private alertController: AlertController,
    private router: Router,
    private localDeviceDB: localDeviceService,
    private localDB: DatabaseService,
    private remoteDB: RemoteService,
    private networkService: NetworkService,
    private loadingController: LoadingController,
    private storage: Storage,) {
      this.storage.create();
     }

  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }
  async storeSession(data: boolean){
    await this.storage.set('isAuthenticated', data);
  }
  async logginUser(data: any) {
    await this.storage.set('loggInUser', data);
  }

  async login(code: string): Promise<void> {
    const loading = await this.loadingController.create({
      message: 'Veuillez patienter...',
    });
    await loading.present();
    try {
      const user = await this.localDeviceDB.verif(code);
      if (user) {
        console.log("🚀 ~ AuthService ~ login ~ user:", user)
        this._isAuthenticated = true;
        this.storeSession(true)
        this.logginUser(user);
        const localSession = await this.localDB.verifOrFetchSession(Number(user.id));
        console.log("🚀 ~ AuthService ~ login ~ session:", localSession)
        if (localSession) {
          loading.dismiss();
          this.redirect(localSession);
        } else {
          const isConnected = await this.networkService.isInternetAvailable();
          console.log("🚀 ~ AuthService ~ login ~ isConnected:", isConnected)
          if(isConnected) {
            const remoteSession = await this.remoteDB.remoteSessions(Number(user.id))
            console.log("🚀 ~ AuthService ~ login ~ remoteSession:", remoteSession)
            if (remoteSession) {
              await this.localDB.storeSessionLocally(remoteSession);
              loading.dismiss();
              this.redirect(remoteSession);
            }else{
              loading.dismiss();
              this.redirect(localSession);
            }
          }else{
            loading.dismiss();
            this.redirect(localSession);
          }
        }

      }else{
      loading.dismiss();
      }
    } catch (error) {
      loading.dismiss();
      await this.showAlert('Erreur de connexion', 'Veuillez vérifier vos informations d\'identification.');
    }
  }

  private redirect(session: any): void {
    console.log("🚀 ~ AuthService ~ redirect ~ session:", session)
    if (session) {
      this.router.navigate(['/tabs']);
    } else {
        this.router.navigate(['/session']);
    }
  }
  private async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({
      header: header,
      message: message,
      buttons: ['OK'],
    });
    await alert.present();
  }
  async logout(): Promise<void> {
    this._isAuthenticated = false;
    await this.storage.remove('isAuthenticated');
    await this.storage.remove('loggInUser');
    this.storeSession(false);
    this.router.navigate(['/login']);
  }
}
