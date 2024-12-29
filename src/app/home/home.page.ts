import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, ActionSheetController, Platform, LoadingController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { SessionService } from '../services/session/session.service';
import { Router } from '@angular/router';
import { lastTicket, Rate, Session, Tickets, Trip } from '../services/models/session.model';
import { AuthService } from '../services/auth/auth.service';
import { Ticket } from '../services/models/ticket.model';
import { v4 as uuidv4 } from 'uuid';
import { SunmiPrinterPlugin } from 'sunmi-printer-capacitor-plugin';
import { DatabaseService } from '../services/local/database.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  presentingElement: any = null;
  currentSession: Session | null = null;
  lastTrip: any = null;
  itinerary: any;
  zone: any = 'Section 1';
  tickets: Ticket[] = [];
  currentTripId: any;
  currentRateId: any;
  ticketCountByTrip: number = 0;
  ticketCountByRate: { [rateId: string]: number } = {}; // Nouveau
  ticketCountBySession: number = 0;
  tripCountBySession: any = 1;
  device: any
  today: any;
  rates: any
  rateSize: any;
  currentTripTickets: any;
  constructor(
    private sessionService: SessionService,
    private localDB: DatabaseService,
    private alertController: AlertController,
    private authService: AuthService,
    private platform: Platform,
    private router: Router,
    private storage: Storage,
    private toastController: ToastController,
    private actionSheetCtrl: ActionSheetController,
    private loadingController: LoadingController,
  ) {
    this.storage.create();
    this.today = new Date().toLocaleDateString('fr-FR')
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
      }

      // Récupérer la session actuelle
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
      // Récupérer le dernier trajet après avoir récupéré la session
      if (this.currentSession) {
        const trips = this.currentSession.trips;
        if (trips && trips.length > 0) {
          this.lastTrip = trips.find((trip) => trip.isActivated);
          this.loadCurrentTripTickets();
        } else {
          this.lastTrip = null;
        }
        console.log(
          '🚀 ~ HomePage ~ this.tripService.getLastTrip ~ lastTrip:',
          this.lastTrip
        );
      }
      this.itinerary = this.currentSession.itinerary;
      console.log(
        '🚀 ~ HomePage ~ ionViewWillEnter ~ this.itinerary:',
        this.itinerary
      );
      this.tripCountBySession = this.currentSession.trips?.length
      this.getFilteredRates()
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



  async loadCurrentTripTickets() {
    const ticks= this.lastTrip.tickets
    if (ticks.length > 0)  {
      this.currentTripTickets = ticks
    }else{
      this.currentTripTickets = []
    }
    console.log("🚀 ~ HomePage ~ loadCurrentTripTickets ~ this.currentTripTickets:", this.currentTripTickets)
  }

  async addTicket(data: any) {
    console.log("🚀 ~ HomePage ~ addTicket ~ data:", data)
    if (this.currentSession) {
      let lastTripFinded = this.lastTrip
      var time = new Date();
      time.setMinutes(time.getMinutes() + 45);
      let validUntil = time.toLocaleTimeString();
      let numTicket = lastTripFinded.tickets.length + 1;
      const newTicket: Tickets = {
        code: 'R' + lastTripFinded.number + 'T' + numTicket,
        price: data.price,
        name: data.name,
        validUntil: '45',
        startTime: new Date().toLocaleTimeString(),
        endTime: validUntil,
        status: 'Valide',
        zone: this.zone,
        rateId: data.id,
        tripId: lastTripFinded.tripId,
        ticketId: uuidv4(),
        isActivated: true,
      };
      console.log("🚀 ~ HomePage ~ addTicket ~ newTicket:", newTicket)
      const lastTick: lastTicket = {
        code: 'R' + lastTripFinded.number + 'T' + numTicket,
        price: data.price,
        name: data.name,
        time: new Date().toLocaleTimeString(),
        zone: this.zone,
      };
      lastTripFinded.tickets.push(newTicket);
      lastTripFinded.ticketsCount = lastTripFinded.tickets.length
      lastTripFinded.revenue = lastTripFinded.revenue+data.price
      this.currentSession.ticketCount = this.currentSession.ticketCount+1
      this.currentSession.revenue = this.currentSession.revenue+data.price
      this.currentSession.solde = this.currentSession.revenue-this.currentSession.expense
      this.currentSession.lastTicket = lastTick
      this.tripCountBySession = this.currentSession.trips?.length
      await this.sessionService.localUpdateSession(this.currentSession)
      this.print(newTicket)
    }

  }

  async addNewTrip(rising: string) {
    if (!this.currentSession) {
      console.error(
        "Session courante manquante, impossible d'ajouter un nouveau trip."
      );
      return;
    }
    let newRising;
    let newDestination;
    try {
      if (this.lastTrip) {
        this.lastTrip.isActivated = false; // Désactiver le dernier trip
        this.lastTrip.arrivalTime = new Date().toLocaleTimeString('fr-FR');
      }
      if (rising == this.lastTrip.rising) {
        newRising = this.lastTrip.destination;
        newDestination = this.lastTrip.rising;
      } else {
        newDestination = this.lastTrip.destination;
        newRising = this.lastTrip.rising;
      }
      // Créer un nouvel objet trip
      const newTrip: Trip = {
        tripId: uuidv4(),
        number: (this.lastTrip ? this.lastTrip.number : 0) + 1,
        distance: this.itinerary.distance,
        itineraryId: this.itinerary.id,
        duration: '40',
        departureTime: new Date().toLocaleTimeString('fr-FR'),
        arrivalTime: 'En cours',
        rising: newRising,
        destination: newDestination,
        revenue: 0,
        ticketsCount: 0,
        isActivated: true,
        tickets: [],
      };

      this.currentSession.trips?.push(newTrip);
      this.currentSession.trajetCount = this.currentSession.trips?.length || 1 + 1 ;
      await this.sessionService.localUpdateSession(this.currentSession);
      this.tripCountBySession = this.currentSession.trips?.length
      this.lastTrip = newTrip;
    } catch (error) {
      console.error("Erreur lors de l'ajout du nouveau trip:", error);
    }
  }

  async sync(){
    if (!this.currentSession) {
      console.error(
        "Session courante manquante, impossible d'ajouter un nouveau trip."
      );
      return;
    }else{
      const loading = await this.loadingController.create({
        message: 'Synchronisation encours ...',
      });
      await loading.present();
      const toast = await this.toastController.create({
        message: 'Erreur de synchronisation',
        duration: 1500,
        position: 'bottom',
      });
      this.sessionService.updateSession(this.currentSession)
      .catch(async er => toast.present())
      .then(() => loading.dismiss());
    }

  }

  async newTrip(rising: string) {
    const alert = await this.alertController.create({
      header: 'Attention',
      message: 'Voulez-vous vraiement faire une nouvelle rotation ? ',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            this.addNewTrip(rising);
          },
        },
      ],
    });

    await alert.present();
  }
  getFilteredRates() {
    if (this.zone === 'Section 1') {
      this.rates = this.itinerary?.Rate;
    } else if (this.zone === 'Section 2') {
      this.rates =  this.itinerary.Rate.filter(
        (item: { section: string }) => item.section === 'Section 1'
      );
    }
    return [];
  }
  getImageSize(): any {
    this.rateSize =  this.zone === 'Section 2' ? '300px' : '120px';
  }
  async switchZone() {
    const alert = await this.alertController.create({
      header: 'Attention',
      message: 'Voulez-vous vraiement changer de zone ? ',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
        },
        {
          text: 'OK',
          role: 'confirm',
          handler: () => {
            if (this.zone === 'Section 1') {
              this.zone = 'Section 2';
            } else {
              this.zone = 'Section 1';
            }
            this.getFilteredRates()
            this.getImageSize()
          },
        },
      ],
    });

    await alert.present();
  }

  async print(data:any) {
    try {
      await SunmiPrinterPlugin.printerInit();
      const textToPrint = `
------ AFTU ${this.device.Reseau.name} ------
Bus: ${this.device.Vehicule.matricule} - ${this.currentSession?.itinerary.name} N°: ${data.code}
${this.lastTrip.rising} -> ${this.lastTrip.destination}
${this.today} à ${data.startTime}
Tarif: ${data.price} - ${data.zone}
--------- by PassBi -----------\n
`;
      await SunmiPrinterPlugin.printText({ text: textToPrint });
      await SunmiPrinterPlugin.lineWrap({lines:1});
      await SunmiPrinterPlugin.cutPaper();
    } catch (error) {
    }
  }

  async menuList() {
    const actionSheet = await this.actionSheetCtrl.create({
      cssClass: 'custom-action-sheet', // Ajouter une classe CSS pour le style
      mode: 'ios', // Utiliser le mode iOS pour un aspect plus moderne
      buttons: [
        {
          text: 'CONTRÔLES', // Texte plus court
          handler: () => {
            this.router.navigate(['/tabs/controle']);
          },
        },
        {
          text: 'LOCATIONS', // Texte plus court
          handler: () => {
            this.router.navigate(['/tabs/rental']);
          },
        },
        {
          text: 'DÉPENSES', // Texte plus court
          handler: () => {
            this.router.navigate(['/tabs/fees']);
          },
        },
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'cancel-button', // Ajouter une classe CSS pour le bouton Annuler
        },
      ],
    });

    await actionSheet.present();
  }
}
