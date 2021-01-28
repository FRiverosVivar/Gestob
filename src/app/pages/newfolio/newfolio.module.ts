import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { QuillModule } from 'ngx-quill';

import { NewfolioPage } from './newfolio.page';

const routes: Routes = [
  {
    path: '',
    component: NewfolioPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QuillModule.forRoot({
      modules: {
        syntax: true
      }
    }),
    RouterModule.forChild(routes)
  ],
  declarations: [NewfolioPage]
})
export class NewfolioPageModule {}
