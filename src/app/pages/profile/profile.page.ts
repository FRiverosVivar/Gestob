import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { LtecAuthenticationService } from 'src/app/service/authentication/ltec-authentication.service';
import { Router } from '@angular/router';
import { LtecDataService } from 'src/app/service/data/ltec-data.service';
import { LoadingController, Platform } from '@ionic/angular';
import { LtecRestService } from 'src/app/service/rest/ltec-rest.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnDestroy, AfterViewInit  {
  backButtonSubscription;
  user: any;

  constructor(
    private authService : LtecAuthenticationService,
    private router: Router,
    private dataService: LtecDataService,
    public loading: LoadingController,
    private platform: Platform,
    private restService: LtecRestService,
  ){ 
  }

  ngOnInit() {
    this.user = this.dataService.getUser();
    console.log(this.user);
  }

  ngAfterViewInit() {
    this.backButtonSubscription = this.platform.backButton.subscribe(() => {
      console.log("Aprete la flecha para atras en tabs del profile");
      navigator['app'].exitApp();
    });
  }
  
  ngOnDestroy() {
    this.backButtonSubscription.unsubscribe();
  }

  ionViewWillEnter(){
    this.user = this.dataService.getUser();
    console.log(this.user);
  }


  async logout(){
    const loading = await this.loading.create({
      message: 'Cerrando sesión...',
      spinner: "circles",
      cssClass: 'loading-Custom'
    });
    await loading.present();
    setTimeout(() => {
      this.restService.logout().then((data) => {
        console.log("Retornar del logout",JSON.stringify(data));
        this.authService.logout();
        this.backButtonSubscription.unsubscribe();
        this.dataService.deleteUser();
        loading.dismiss();
        this.router.navigate['login'];
      })
    },1000);
  }

}
