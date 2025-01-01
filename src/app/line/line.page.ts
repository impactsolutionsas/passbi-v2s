import { Component, OnInit } from '@angular/core';
import { Session, Trip } from '../services/models/session.model';
import { Router } from '@angular/router';
import { AlertController, LoadingController, Platform, ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth/auth.service';
import { SessionService } from '../services/session/session.service';
import { Storage } from '@ionic/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from '../services/local/database.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-line',
  templateUrl: './line.page.html',
  styleUrls: ['./line.page.scss'],
})
export class LinePage implements OnInit {
  currentSession: Session | null = null;
  sessionForm!: FormGroup;
  leavingPoint: any;
  destinationPoint: any;
  destination: any;
  device: any;
  itinerarys: any;
  itinerary: any;
  points: any;
  showButton: boolean = false;
  showPoints: boolean = false;


   constructor(
      private fb: FormBuilder,
      private platform: Platform,
      private router: Router,
      private authService: AuthService,
      private alertController: AlertController,
      public toastController: ToastController,
      private sessionService: SessionService,
      private storage: Storage,
      private localDB: DatabaseService,
      private loadingController: LoadingController
    ) {
      this.storage.create();
      this.sessionForm = this.fb.group({
        seller: [''],
        driver: [''],
        itineraryId: [''],
        rising: [''],
      });
    }
    async ngOnInit() {
      try {
        const user = await this.storage.get('loggInUser');
        if (!user) {
          this.router.navigate(['/login']);
          return;
        }
        this.device = user;
        this.itinerarys = this.device.Reseau.Itinerary;

        const session = await this.localDB.verifSession(user.id);
        if (!session) {
          await this.authService.logout();
          return;
        }

        this.currentSession = session;

        // Initialiser le formulaire avec les données de la session actuelle
        this.sessionForm = this.fb.group({
          seller: [this.currentSession?.seller || '', [Validators.required]],
          driver: [this.currentSession?.driver || '', [Validators.required]],
          itineraryId: [this.currentSession?.itineraryId || '', [Validators.required]],
          rising: ['', [Validators.required]],
        });

        if (this.currentSession.itineraryId) {
          this.pointsInput({ target: { value: this.currentSession.itineraryId } });
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation :', error);
      }
    }


  async pointsInput(event: any) {
    let value = event.target.value;
    console.log("🚀 ~ SessionPage ~ pointsInput ~ value:", value)
    if (value === undefined) {
      const toast = await this.toastController.create({
        message: 'Ce champ  ne peut pas être vide.',
        duration: 2000,
        position: 'top',
        icon: 'warning',
        color: 'danger',
      });
      toast.present();
    } else {
      this.itinerary = this.itinerarys.filter(
        (group: { id: number }) => group.id === value
      );
      this.points = this.itinerary[0]?.Coordinate;
      this.leavingPoint = this.points[0]?.name;
      this.destinationPoint = this.points[1]?.name;
      this.showPoints = true;
    }
  }
  async buttonInput(event: any) {
    let value = event.target.value;
    if (value === undefined) {
      const toast = await this.toastController.create({
        message: 'Ce champ  ne peut pas être vide.',
        duration: 2000,
        position: 'top',
        icon: 'warning',
        color: 'danger',
      });
      toast.present();
    } else {
      this.showButton = true;
    }
  }

  async onSubmit() {
    if (this.sessionForm.valid) {
      const { seller, driver, itineraryId, rising } = this.sessionForm.value;

      // Déterminer le terminus basé sur l'entrée utilisateur
      this.destination = rising === this.leavingPoint ? this.destinationPoint : this.leavingPoint;

      // Sélectionner l'itinéraire correspondant
      const itinerarySelected = this.itinerarys.find(
        (group: { id: number }) => group.id === itineraryId
      );

      if (!itinerarySelected) {
        console.error('Itinéraire non trouvé.');
        return;
      }

      const newTrajet: Trip = {
        tripId: uuidv4(),
        number: 1,
        distance: 0,
        itineraryId: itinerarySelected.id,
        duration: '40',
        departureTime: new Date().toLocaleTimeString('fr-FR'),
        arrivalTime: 'En cours',
        rising,
        destination: this.destination,
        revenue: 0,
        ticketsCount: 0,
        isActivated: true,
        tickets: [],
      };

      if (this.currentSession) {
        const loading = await this.loadingController.create({
          message: 'Veuillez patienter...',
        });
        await loading.present();

        // Mise à jour des données de la session actuelle
        this.currentSession.seller = seller;
        this.currentSession.driver = driver;
        this.currentSession.itineraryId = itineraryId;
        this.currentSession.itinerary = itinerarySelected;
        this.currentSession.trips = [newTrajet];
        // Appeler le service pour sauvegarder
        await this.sessionService.updateSession(this.currentSession).finally(async () => {
          await loading.dismiss();
          this.router.navigate(['/tabs/home']);
        })

        console.log('Session mise à jour avec succès');
      }
    }
  }


  close(){
    this.router.navigate(['/tabs/home']);
  }
}
