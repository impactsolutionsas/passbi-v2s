import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LinePageRoutingModule } from './line-routing.module';

import { LinePage } from './line.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    LinePageRoutingModule
  ],
  declarations: [LinePage]
})
export class LinePageModule {}
