import { Component, OnInit } from '@angular/core';
import { Controles, Session } from '../services/models/session.model';
import { Router } from '@angular/router';
import { LoadingController, Platform } from '@ionic/angular';
import { AuthService } from '../services/auth/auth.service';
import { SessionService } from '../services/session/session.service';
import { v4 as uuidv4 } from 'uuid';
import { Storage } from '@ionic/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from '../services/local/database.service';

@Component({
  selector: 'app-controle',
  templateUrl: './controle.page.html',
  styleUrls: ['./controle.page.scss'],
})
export class ControlePage implements OnInit {

  currentSession: Session | null = null;
  device: any;
  showFrom: boolean = false;
  controlForm!: FormGroup;
  trips: any;
  lastTrip: any;
  controllers: any;
  controlsList: any
  constructor(
    private sessionService: SessionService,
    private fb: FormBuilder,
    private authService: AuthService,
    private platform: Platform,
    private router: Router,
    private localDB: DatabaseService,
    private loadingController: LoadingController,
    private storage: Storage
  ) {
    this.storage.create();
    this.controlForm = this.fb.group({
      controllerId: ['', [Validators.required]],
      checkedTickets: [0, [Validators.required]],
      ticketFraude: [0, [Validators.required]],
      comment: [''],
    });
  }

  async ionViewWillEnter() {
    await this.platform.ready();
    try {
      await this.storage.get('loggInUser').then(async (res) => {
        console.log('🚀 ~ HomePage ~ this.storage.get ~ res:', res);
        this.device = res

        console.log("🚀 ~ HomePage ~ awaitthis.storage.get ~ this.device:", this.device)
        if (!res) {
          // Rediriger vers la page de connexion si aucun utilisateur n'est connecté
          this.router.navigate(['/login']);
          return;
        }else{
          this.controllers = this.device.Reseau.Controller
          console.log("🚀 ~ ControlePage ~ awaitthis.storage.get ~ this.controllers:", this.controllers)
        }
        const session = await this.localDB.verifSession(res.id);
        if (!session) {
          console.warn('Session indéfinie. Déconnexion en cours...');
          this.authService.logout();
          return; // Arrêter l'exécution si l'utilisateur est déconnecté
        }
        this.currentSession = session;
        console.log(
          '🚀 ~ HomePage ~ this.storage.get ~ this.currentSession :',
          this.currentSession
        );
        if (this.currentSession) {
          const trips = this.currentSession.trips;
          this.controlsList = this.currentSession.controles
          if (trips && trips.length > 0) {
            this.lastTrip = trips.find((trip) => trip.isActivated);
          }else{
            this.lastTrip = null;
          }
          console.log("🚀 ~ ControlePage ~ awaitthis.storage.get ~ this.lastTrip:", this.lastTrip)
        }
      })
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des informations utilisateur :',
        error
      );
    }
  }

  ngOnInit() {
    this.sessionService.currentSession$.subscribe((session) => {
      this.currentSession = session;
    });
  }

  showel(el: boolean){
    this.showFrom = el;
  }

  close(){
    this.router.navigate(['/tabs/repport']);
  }
  async add(){
    if (this.controlForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Veuillez patienter ...',
      });
      await loading.present();
      const controler = this.device.Reseau.Controller.filter(
        (item: { id: any }) => item.id === this.controlForm.value.controllerId
      );
      var time = new Date();
      time.setMinutes(time.getMinutes() + 15);
      let validUntil = time.toLocaleTimeString();
      const data : Controles = {
        offlineId: uuidv4(),
        controllerName: controler[0].name,
        checkedTickets: this.controlForm.value.checkedTickets,
        ticketFraude: this.controlForm.value.ticketFraude,
        comment: this.controlForm.value.comment,
        startTime: new Date().toLocaleTimeString(),
        endTime: validUntil,
        controllerId: this.controlForm.value.controllerId,
        trajetId: this.lastTrip?.tripId
      }
      if (this.currentSession) {
        this.currentSession.controles?.push(data)
        this.currentSession.controlsCount = this.currentSession.controles?.length || 1 + 1 ;
        await this.sessionService.localUpdateSession(this.currentSession)
      }

      this.controlForm.reset()
      this.showel(false)
      loading.dismiss()
    }
  }

  async deleteControle(controleId: string) {
    if (this.currentSession && this.currentSession.controles) {
      const loading = await this.loadingController.create({
        message: 'Suppression en cours ...',
      });
      await loading.present();
      const controleToDelete = this.currentSession.controles.find(controle => controle.offlineId === controleId);
      if (controleToDelete) {
        // Retirer la dépense de la liste
        this.currentSession.controles = this.currentSession.controles.filter(controle => controle.offlineId !== controleId);
        this.controlsList = this.currentSession.controles
        this.currentSession.controlsCount = this.currentSession.controles?.length || 1 - 1 ;
        // Mettre à jour la session
        await this.sessionService.localUpdateSession(this.currentSession);
        loading.dismiss()
      }
    }
  }

}
