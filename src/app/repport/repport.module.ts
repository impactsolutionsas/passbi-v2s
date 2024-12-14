import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RepportPageRoutingModule } from './repport-routing.module';

import { RepportPage } from './repport.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RepportPageRoutingModule
  ],
  declarations: [RepportPage]
})
export class RepportPageModule {}
