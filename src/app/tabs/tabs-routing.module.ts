import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
        {
          path: 'home',
          loadChildren: () => import('../home/home.module').then( m => m.HomePageModule)
        },
        {
          path: 'repport',
          loadChildren: () => import('../repport/repport.module').then( m => m.RepportPageModule)
        },
        {
          path: 'fees',
          loadChildren: () => import('../fees/fees.module').then( m => m.FeesPageModule)
        },
        {
          path: 'controle',
          loadChildren: () => import('../controle/controle.module').then( m => m.ControlePageModule)
        },
        {
          path: 'rental',
          loadChildren: () => import('../rental/rental.module').then( m => m.RentalPageModule)
        },
        {
          path: 'activation',
          loadChildren: () => import('../activation/activation.module').then( m => m.ActivationPageModule)
        },
        {
          path: 'line',
          loadChildren: () => import('../line/line.module').then( m => m.LinePageModule)
        },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
