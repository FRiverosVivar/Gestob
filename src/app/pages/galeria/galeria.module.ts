import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { GaleriaPage } from './galeria.page';
import { QuillModule } from 'ngx-quill';

const routes: Routes = [
  {
    path: '',
    component: GaleriaPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuillModule.forRoot({
      modules: {
        syntax: false
      }
    }),
    RouterModule.forChild(routes)
  ],
  declarations: [GaleriaPage]
})
export class GaleriaPageModule {}
