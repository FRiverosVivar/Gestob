import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { DocumentModalPage } from './document-modal.page';

const routes: Routes = [
  {
    path: '',
    component: DocumentModalPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [DocumentModalPage]
})
export class DocumentModalPageModule {}
