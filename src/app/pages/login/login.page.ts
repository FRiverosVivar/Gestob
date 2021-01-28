import { Component, OnInit } from '@angular/core';
import { LtecAuthenticationService } from 'src/app/service/authentication/ltec-authentication.service';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { LtecRestService } from 'src/app/service/rest/ltec-rest.service';
import { LtecDataService } from 'src/app/service/data/ltec-data.service';
import { Storage } from '@ionic/storage';
import { LtecTokenService } from 'src/app/service/token/ltec-token.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email: string;
  password: string;

  constructor(
    private authService: LtecAuthenticationService,
    public router: Router,
    public loading: LoadingController,
    private restService : LtecRestService,
    public alert: AlertController,
    private storage: Storage,
    private dataService: LtecDataService,
    private tokenService: LtecTokenService,
  ){
    this.email = "";
    this.password = "";
  }

  ngOnInit() {
  }

  async onSubmitLogin(){
    const loading = await this.loading.create({
      message: 'Iniciando sesión...',
      spinner: "circles",
      cssClass: 'loading-Custom'
    });
    await loading.present();
    this.restService.login(this.email,this.password).then((data) => {
      console.log("la data que retorna del Login() es",JSON.stringify(data));
      let header = data.headers;
      let datos = JSON.parse(data.data);
      this.authService.login(this.email,this.password);
      this.tokenService.setToken(header);
      this.dataService.setUser(datos);
      setTimeout(() => {
        loading.dismiss();
        this.router.navigate(['/tabs/tabs/contract'],{});
      },2000);
    },(error) => {
      console.log("Error",error);
      loading.dismiss();
      this.alertUser();
    }) 
  }
      
  async alertUser(){
    const alert = await this.alert.create({
      header: 'Problema al iniciar sesión',
      mode: "ios",
      message: 'Es posible que los datos ingresados sean incorrectos.',
      buttons: [
        {
          text: 'Esta bien',
          handler: (data) => {
            console.log(data);
          }
        }
      ]
    });
    alert.present();
  } 

}
