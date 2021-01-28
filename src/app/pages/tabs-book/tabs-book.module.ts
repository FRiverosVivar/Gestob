import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TabsBookPage } from './tabs-book.page';

const routes: Routes = [
  {
    path: 'tabsBook',
    component: TabsBookPage,
    children: [
      {
        path: 'book',
        loadChildren: '../book/book.module#BookPageModule'
      },
      {
        path: 'information',
        loadChildren: '../information/information.module#InformationPageModule'
      },
      {
        path: 'user',
        loadChildren: '../user/user.module#UserPageModule'
      },
      {
        path: 'geolocation',
        loadChildren: '../geolocation/geolocation.module#GeolocationPageModule'
      },
      {
        path: 'galeria',
        loadChildren: '../galeria/galeria.module#GaleriaPageModule'
      }
    ]
  },
  {
    path: '',
    redirectTo: 'tabsBook/book',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TabsBookPage]
})
export class TabsBookPageModule {}
