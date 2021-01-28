import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TabsFolioPage } from './tabs-folio.page';

const routes: Routes = [
  {
    path: 'tabsFolio',
    component: TabsFolioPage,
    children: [
      {
        path: 'folio',
        loadChildren: '../folio/folio.module#FolioPageModule'
      },
      {
        path: 'newFolio',
        loadChildren: '../newfolio/newfolio.module#NewfolioPageModule'
      },
    ]
  },
  {
    path: '',
    redirectTo: 'tabsFolio/folio',
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
  declarations: [TabsFolioPage]
})
export class TabsFolioPageModule {}
