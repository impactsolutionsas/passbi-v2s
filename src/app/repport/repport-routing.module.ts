import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RepportPage } from './repport.page';

const routes: Routes = [
  {
    path: '',
    component: RepportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RepportPageRoutingModule {}
