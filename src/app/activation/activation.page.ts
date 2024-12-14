import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SessionService } from '../services/session/session.service';
import { Rate, Session, Trip } from '../services/models/session.model';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { AuthService } from '../services/auth/auth.service';
import { SunmiPrinterPlugin } from 'sunmi-printer-capacitor-plugin';
import { DatabaseService } from '../services/local/database.service';

@Component({
  selector: 'app-activation',
  templateUrl: './activation.page.html',
  styleUrls: ['./activation.page.scss'],
})
export class ActivationPage implements OnInit {
  currentSession: Session | null = null;
  activationCode: string = '';
  isCodeValid: boolean = false;
  errorMessage: string = '';
  codeForm!: FormGroup;
  device: any;
  isPaid: boolean = false;
  supervisor: any
  dailyCode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private sessionService: SessionService,
    private router: Router,
    private storage: Storage,
    private localDB: DatabaseService,
    private authService: AuthService
  ) {
    this.codeForm = this.fb.group({
      code: ['', [Validators.required]],
    });
  }

  async ionViewWillEnter() {
    await this.storage.get('loggInUser').then(async (res) => {
      this.device = res;
      this.supervisor = this.device.Reseau.Supervisor
      this.dailyCode = this.device.Reseau.ReseauConfig[0].dailyCode
      console.log("🚀 ~ ActivationPage ~ awaitthis.storage.get ~ this.dailyCode:", this.dailyCode)
      console.log("🚀 ~ ActivationPage ~ awaitthis.storage.get ~ this.supervisor:", this.supervisor[0])
      console.log("🚀 ~ ActivationPage ~ awaitthis.storage.get ~  this.devic:",  this.device)
      if (!res) {
        this.router.navigate(['/login']);
        return;
      }
      const session = await this.localDB.verifSession(res.id);
      if (!session) {
        this.authService.logout();
        return;
      }
      this.currentSession = session;
      this.isPaid = this.currentSession.dayliePaid?.isPaid || false;
      console.log("🚀 ~ ActivationPage ~ awaitthis.storage.get ~ this.isPaid :", this.isPaid )
    });
  }

  ngOnInit() {
    this.sessionService.currentSession$.subscribe((session) => {
      this.currentSession = session;
    });
  }

  // Function to sum tickets by rate for a given trip
  sumTicketsByRate(trip: Trip, rate: Rate): number {
    return (
      trip.tickets
        ?.filter((ticket) => ticket.price === rate.price)
        .reduce((sum, ticket) => sum + ticket.price, 0) || 0
    );
  }
  // Function to sum the total tickets
  sumTickets(tickets: any[]): number {
    return tickets.reduce((somme, ticket) => somme + ticket.price, 0);
  }

  sumRentals(): number {
    return (
      this.currentSession?.rentals?.reduce(
        (sum, rental) => sum + rental.price,
        0
      ) || 0
    );
  }

  sumLocations(): number {
    return this.currentSession?.rentals?.length || 0;
  }

  // Print function
async print(data: any) {
  try {
    await SunmiPrinterPlugin.printerInit();

    // Header Information
    let textToPrint = `
------ AFTU ${this.device?.Reseau.name} ------
-------------------------------
OPERATEUR: ${this.device?.Operator.name}
BUS: ${this.device?.Vehicule.matricule}
RECEVEUR(SE): ${this.currentSession?.seller}
CHAUFFEUR: ${this.currentSession?.driver}
-------------------------------
LIGNE: ${this.currentSession?.itinerary.name}
DATE: ${this.currentSession?.sellingDate}
DE: ${this.currentSession?.startTime} A  ${new Date().toLocaleTimeString('fr-FR')}
-------------------------------`;

    // Ticket Information (grouped by rate)
    textToPrint += '----- TICKETS -----------------\n';
    if (this.currentSession?.trips && this.currentSession.trips.length > 0) {
      const ticketSummary: { [price: number]: { count: number; totalRevenue: number } } = {};

      // Loop through trips and tickets
      let totalTicketCount = 0;
      let totalTicketRevenue = 0;

      this.currentSession.trips.forEach((trip) => {
        if (trip.tickets) {
          trip.tickets.forEach((ticket) => {
            const price = ticket.price;
            // Group tickets by price
            if (!ticketSummary[price]) {
              ticketSummary[price] = { count: 0, totalRevenue: 0 };
            }
            ticketSummary[price].count += 1;
            ticketSummary[price].totalRevenue += ticket.price;
            totalTicketCount += 1; // Increment total ticket count
            totalTicketRevenue += ticket.price; // Add to total revenue
          });
        }
      });

      // Display the grouped tickets summary
      for (const price in ticketSummary) {
        const summary = ticketSummary[price];
        textToPrint += `TICKETS ${price} CFA | ${summary.count} | ${summary.totalRevenue} CFA\n`;
      }

      // Display total tickets and revenue
      textToPrint += `\nTOTAL TICKETS: ${totalTicketCount}\n`;
      textToPrint += `TOTAL VENTES: ${totalTicketRevenue} CFA\n`;
    } else {
      textToPrint += 'Aucun ticket\n';
    }

    // Number of trips
    textToPrint += '\n---- ROTATIONS -----------------';
    textToPrint += `TOTAL: ${this.currentSession?.trajetCount || 0}`;

    // Expense Information
    textToPrint += '\n----- DEPENSES ------------------\n';
    if (this.currentSession?.fees && this.currentSession.fees.length > 0) {
      this.currentSession.fees.forEach((fee) => {
        textToPrint += `${fee.name} | ${fee.price} CFA\n`;
      });
    } else {
      textToPrint += 'Aucune dépense\n';
    }

    // Rentals Information
    textToPrint += '-------- LOCATION --------------\n';
    if (this.currentSession?.rentals && this.currentSession.rentals.length > 0) {
      this.currentSession.rentals.forEach((rental) => {
        if (rental.isActivated) {
          textToPrint += `${rental.companieName} | ${rental.companiePhone} | ${rental.price} CFA\n`;
        }
      });
      // Total Rentals
      textToPrint += `TOTAL LOCATIONS: ${this.currentSession.rentals.length}\n`;
    } else {
      textToPrint += '\nAucune location\n';
    }

    // Control Information
    textToPrint += '---- CONTROLES --------------\n';
    if (this.currentSession?.controles && this.currentSession.controles.length > 0) {
      textToPrint += `TOTAL: ${this.currentSession.controles.length}\n`;

      // Print names of controllers
      this.currentSession.controles.forEach((control) => {
        textToPrint += `Contrôleur(se): ${control.controllerName}\n`;
      });
    } else {
      textToPrint += 'Aucun contrôle\n';
    }

    let netToPay = 0;
    // Total Revenue and Final Calculation
    if (this.currentSession) {
      netToPay = this.currentSession.revenue - this.currentSession.expense;
    }
    textToPrint += '----- TOTAL -----------------\n';
    textToPrint += `TOTAL RECETTES: ${this.currentSession?.revenue} CFA\n`;
    textToPrint += `TOTAL DEPENSES: ${this.currentSession?.expense} CFA\n`;
    textToPrint += `NET A VERSER: ${netToPay} CFA\n`;

    textToPrint += '-------------------------------\n';
    textToPrint += '          A conserver          \n';
    textToPrint += '-------------------------------\n';

    // Printing text using SunmiPrinterPlugin
    await SunmiPrinterPlugin.printText({ text: textToPrint });
    await SunmiPrinterPlugin.lineWrap({ lines: 1 });
    await SunmiPrinterPlugin.cutPaper();
  } catch (error) {
    console.error("Erreur lors de l'impression: ", error);
  }
}


  // Submission of the form
  async onSubmit() {
    if (this.codeForm.valid) {
      const code = this.codeForm.value.code;
      if (this.currentSession) {
        if (code === 890911) {
          if (this.currentSession.dayliePaid) {
            this.currentSession.dayliePaid.isPaid = true;
            this.isPaid = true;
            await this.sessionService.updateSession(this.currentSession);
          }
        } else if(this.supervisor[0].password == code){
          if (this.dailyCode && this.currentSession.dayliePaid) {
            this.currentSession.dayliePaid.isPaid = true;
            this.currentSession.dayliePaid.paidMethode = 'CASH'
            this.currentSession.dayliePaid.paidName = this.currentSession.seller;
            this.currentSession.dayliePaid.paidMethode = 'CASH'
            this.currentSession.dayliePaid.paidBy = this.supervisor[0].name;
            this.currentSession.dayliePaid.paidTime = new Date().toLocaleTimeString('fr-FR')
            this.isPaid = true;
            await this.sessionService.updateSession(this.currentSession);
          }
        }
        else {
          this.errorMessage = 'Le code est invalide ou expiré.';
        }
      }
    }
  }

  async end(){
    if (this.currentSession) {
      await this.print(this.currentSession).finally(async () => {
        if (this.currentSession) {
          this.currentSession.endTime = new Date().toLocaleTimeString('fr-FR')
          this.currentSession.isActiveted = false;
          await this.sessionService.updateSession(this.currentSession);
          this.authService.logout();
        }
      })
    }
  }
  async endFake(){
    if (this.currentSession) {
      this.currentSession.endTime = new Date().toLocaleTimeString('fr-FR')
      this.currentSession.isActiveted = false;
      await this.sessionService.updateSession(this.currentSession);
      this.authService.logout();
    }
  }
}
