import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadChildren: './pages/login/login.module#LoginPageModule' },
  { path: 'tabs', loadChildren: './pages/tabs/tabs.module#TabsPageModule' },
  { path: 'tabsBook', loadChildren: './pages/tabs-book/tabs-book.module#TabsBookPageModule' },
  { path: 'tabsFolio', loadChildren: './pages/tabs-folio/tabs-folio.module#TabsFolioPageModule' },
  { path: 'thisFolio', loadChildren: './pages/this-folio/this-folio.module#ThisFolioPageModule' },
  { path: 'geolocation', loadChildren: './pages/geolocation/geolocation.module#GeolocationPageModule' },
  { path: 'galeria', loadChildren: './pages/galeria/galeria.module#GaleriaPageModule' },


];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
