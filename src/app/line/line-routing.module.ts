import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LinePage } from './line.page';

const routes: Routes = [
  {
    path: '',
    component: LinePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LinePageRoutingModule {}
