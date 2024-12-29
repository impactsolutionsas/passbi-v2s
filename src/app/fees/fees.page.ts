import { Component, OnInit } from '@angular/core';
import { Frais, Session } from '../services/models/session.model';
import { Router } from '@angular/router';
import { LoadingController, Platform } from '@ionic/angular';
import { AuthService } from '../services/auth/auth.service';
import { SessionService } from '../services/session/session.service';
import { v4 as uuidv4 } from 'uuid';
import { Storage } from '@ionic/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from '../services/local/database.service';

@Component({
  selector: 'app-fees',
  templateUrl: './fees.page.html',
  styleUrls: ['./fees.page.scss'],
})
export class FeesPage implements OnInit {

  currentSession: Session | null = null;
  device: any;
  showFrom: boolean = false;
  feesForm!: FormGroup;
  rubrics: any;
  feesList: any
  constructor(
    private sessionService: SessionService,
    private fb: FormBuilder,
    private authService: AuthService,
    private platform: Platform,
    private localDB: DatabaseService,
    private router: Router,
    private loadingController: LoadingController,
    private storage: Storage
  ) {
    this.feesForm = this.fb.group({
      rubricsId: ['', [Validators.required]],
      price: ['', [Validators.required]]
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
          this.rubrics = this.device.Reseau.Rubrics
          console.log("🚀 ~ ControlePage ~ awaitthis.storage.get ~ this.controllers:", this.rubrics)
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
          this.feesList = this.currentSession.fees
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
    if (this.feesForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Veuillez patienter ...',
      });
      await loading.present();
      const fees = this.device.Reseau.Rubrics.filter(
        (item: { id: any }) => item.id === this.feesForm.value.rubricsId
      );
      const data : Frais = {
        offlineId: uuidv4(),
        name: fees[0].name,
        price: this.feesForm.value.price,
        rubricsId: this.feesForm.value.rubricsId
      }
      if (this.currentSession) {
        this.currentSession.fees?.push(data)
        this.currentSession.expense = this.currentSession.expense+data.price
        this.currentSession.solde = this.currentSession.revenue-this.currentSession.expense
        await this.sessionService.localUpdateSession(this.currentSession)
      }

      this.feesForm.reset()
      this.showel(false)
      loading.dismiss()
    }
  }

  async deleteFee(feeId: string) {
    if (this.currentSession && this.currentSession.fees) {
      const loading = await this.loadingController.create({
        message: 'Suppression en cours ...',
      });
      await loading.present();
      const feeToDelete = this.currentSession.fees.find(fee => fee.offlineId === feeId);
      if (feeToDelete) {
        // Retirer la dépense de la liste
        this.currentSession.fees = this.currentSession.fees.filter(fee => fee.offlineId !== feeId);
        this.feesList = this.currentSession.fees
        // Réduire le montant de la dépense du total des dépenses et ajuster le solde
        this.currentSession.expense -= feeToDelete.price;
        this.currentSession.solde = this.currentSession.revenue - this.currentSession.expense;

        // Mettre à jour la session
        await this.sessionService.localUpdateSession(this.currentSession);
        loading.dismiss()
      }
    }
  }
}
