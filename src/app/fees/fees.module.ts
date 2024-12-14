import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FeesPageRoutingModule } from './fees-routing.module';

import { FeesPage } from './fees.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    FeesPageRoutingModule
  ],
  declarations: [FeesPage]
})
export class FeesPageModule {}
