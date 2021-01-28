import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PopoverFolioPage } from './popover-folio.page';

const routes: Routes = [
  {
    path: '',
    component: PopoverFolioPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [PopoverFolioPage]
})
export class PopoverFolioPageModule {}
