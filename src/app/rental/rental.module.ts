import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RentalPageRoutingModule } from './rental-routing.module';

import { RentalPage } from './rental.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RentalPageRoutingModule
  ],
  declarations: [RentalPage]
})
export class RentalPageModule {}
