import { Component, OnInit } from '@angular/core';
import { Rentals, Session } from '../services/models/session.model';
import { Router } from '@angular/router';
import { LoadingController, Platform } from '@ionic/angular';
import { AuthService } from '../services/auth/auth.service';
import { SessionService } from '../services/session/session.service';
import { v4 as uuidv4 } from 'uuid';
import { Storage } from '@ionic/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from '../services/local/database.service';

@Component({
  selector: 'app-rental',
  templateUrl: './rental.page.html',
  styleUrls: ['./rental.page.scss'],
})
export class RentalPage implements OnInit {

  currentSession: Session | null = null;
  device: any;
  showFrom: boolean = false;
  rentalForm!: FormGroup;
  trips: any;
  lastTrip: any;
  rentalsList: any
  constructor(
    private sessionService: SessionService,
    private fb: FormBuilder,
    private authService: AuthService,
    private platform: Platform,
    private router: Router,
    private localDB: DatabaseService,
    private loadingController: LoadingController,

    private storage: Storage) {
      this.rentalForm = this.fb.group({
        companieName: ['', [Validators.required]],
        companiePhone: [0, [Validators.required]],
        price: [0, [Validators.required]],
        destination: ['', [Validators.required]],
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
            this.rentalsList = this.currentSession.rentals
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

    async add() {
      const loading = await this.loadingController.create({
        message: 'Veuillez patienter...',
      });
      await loading.present();
      if (this.rentalForm.valid) {
        const isEditing = this.rentalForm.get('offlineId')?.value;
        if (isEditing) {
          // Mode édition : trouver et mettre à jour la location existante
          if (this.currentSession?.rentals) {
            const rentalToEdit = this.currentSession?.rentals.find(rental => rental.offlineId === isEditing);
          if (rentalToEdit) {
            rentalToEdit.companieName = this.rentalForm.value.companieName;
            rentalToEdit.companiePhone = this.rentalForm.value.companiePhone;
            rentalToEdit.price = this.rentalForm.value.price;
            rentalToEdit.destination = this.rentalForm.value.destination;
            await this.sessionService.localUpdateSession(this.currentSession!);
          }
          }
        } else {
          // Mode ajout
          var time = new Date();
          time.setMinutes(time.getMinutes() + 40);
          let validUntil = time.toLocaleTimeString();
          const data: Rentals = {
            offlineId: uuidv4(),
            companieName: this.rentalForm.value.companieName,
            companiePhone: this.rentalForm.value.companiePhone,
            price: this.rentalForm.value.price,
            startTime: new Date().toLocaleTimeString(),
            endTime: validUntil,
            destination: this.rentalForm.value.destination,
            isActivated: true
          };
          if (this.currentSession) {
            this.currentSession.rentals?.push(data);
            this.currentSession.revenue += data.price;
            this.currentSession.solde = this.currentSession.revenue - this.currentSession.expense;
            await this.sessionService.updateSession(this.currentSession);
          }
        }

        this.rentalForm.reset();
        this.showFrom = false;
        loading.dismiss();

      }
    }

    async deleteRental(rentalId: string) {
      if (this.currentSession) {
        const loading = await this.loadingController.create({
          message: 'Suppression en cours ...',
        });
        await loading.present();
        const index = this.currentSession.rentals?.findIndex(rental => rental.offlineId === rentalId);
        if (index !== -1 && index !== undefined) {
          const rentalToDelete = this.currentSession.rentals![index];
          this.currentSession.revenue -= rentalToDelete.price;
          this.currentSession.solde = this.currentSession.revenue - this.currentSession.expense;
          this.currentSession.rentals?.splice(index, 1); // Supprimer l'élément
          await this.sessionService.updateSession(this.currentSession);
          loading.dismiss()
        }
      }
    }

    async editRental(rentalId: string) {
     if (this.currentSession?.rentals) {
      const rentalToEdit = this.currentSession?.rentals.find(rental => rental.offlineId === rentalId);
      if (rentalToEdit) {
        this.rentalForm.patchValue({
          companieName: rentalToEdit.companieName,
          companiePhone: rentalToEdit.companiePhone,
          price: rentalToEdit.price,
          destination: rentalToEdit.destination
        });
        this.showFrom = true;
        this.rentalForm.addControl('offlineId', this.fb.control(rentalToEdit.offlineId));
      }
     }
    }

}
