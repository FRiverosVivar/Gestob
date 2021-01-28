import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { QuillModule } from 'ngx-quill';

import { ThisFolioPage } from './this-folio.page';

const routes: Routes = [
  {
    path: '',
    component: ThisFolioPage
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
  declarations: [ThisFolioPage]
})
export class ThisFolioPageModule {}
