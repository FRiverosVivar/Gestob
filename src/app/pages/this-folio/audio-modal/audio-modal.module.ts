import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AudioModalPage } from './audio-modal.page';

const routes: Routes = [
  {
    path: '',
    component: AudioModalPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [AudioModalPage]
})
export class AudioModalPageModule {}
