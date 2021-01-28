import { Component, OnInit } from '@angular/core';
import { LtecDataService } from 'src/app/service/data/ltec-data.service';
import { Router } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { LtecRestService } from 'src/app/service/rest/ltec-rest.service';
import { LtecTokenService } from 'src/app/service/token/ltec-token.service';
import { NetworkService, ConnectionStatus } from 'src/app/service/network/ltec-network.service';

@Component({
  selector: 'app-geolocation',
  templateUrl: './geolocation.page.html',
  styleUrls: ['./geolocation.page.scss'],
})
export class GeolocationPage implements OnInit {

  formGps: any;
  contract: any;

  load: HTMLIonLoadingElement = null;

  constructor(
    private dataService : LtecDataService,
    private router: Router,
    public loading: LoadingController,
    private gps: Geolocation,
    private restService: LtecRestService,
    private tokenService: LtecTokenService,
    public toast: ToastController,
    public alert: AlertController,
    private networkService: NetworkService,
  ) {
    this.formGps = {
      'lat' : 0,
      'lng' : 0,
      'principal' : false,
      'direccion': "",
      'nombre': ""
    }
  }

  ngOnInit() {
    this.contract = this.dataService.getContract();
    console.log(this.contract);
  }

  back(){
    this.router.navigate(['tabs/tabs/contract'],{});
  }

  async UploadLocation(){
    if(this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Online){
      if(this.formGps.nombre != "" && this.formGps.direccion != ""){
        await this.loading.create({
          message: "Tomando coordenadas...",
          spinner: "dots",
          cssClass: 'loading-Custom',
        }).then((load: HTMLIonLoadingElement) => {
          this.load = load;
          this.load.present();
        });

        this.gps.getCurrentPosition().then((coordenadas) => {
          this.formGps.lat = coordenadas.coords.latitude,
          this.formGps.lng = coordenadas.coords.longitude,
          this.load.message = "Subiendo información ...";
          if(this.formGps.lat != 0 && this.formGps.lng != 0){
            this.restService.sendCoords(this.formGps,this.contract).then((res) => {
              console.log("Coordenadas: ", JSON.stringify(res));
              let header = res.headers;
              //let datos = JSON.parse(res.data);
              this.tokenService.setToken(header);
              this.load.dismiss();
              this.confirm();
              this.resetForm();
            },(error) => {
              console.log("error sendCoords", error);
              this.load.dismiss();
              this.errorCapture('server');
            })
          }
          else{
            this.errorCapture('gps');
          }
        },(error) => {
          console.log("error al tomar coordenadas",error);
          this.errorCapture('gps');
          this.load.dismiss();
        })
      }
      else{
        this.errorCapture('formulario');
      }
    }
    else{
      this.errorCapture('internet')
    }
   

    
  }

  async confirm(){
    const toast = await this.toast.create({
      message: 'Posición enviada correctamente',
      duration: 1000,
      cssClass: 'toast-Confirm',
      keyboardClose: true,
    });
    toast.present();
  }

  resetForm(){
    this.formGps = {
      'lat' : 0,
      'lng' : 0,
      'principal' : false,
      'direccion': "",
      'nombre': ""
    }
  }

  async errorCapture(tipo){
    let mensaje = ""
    if(tipo == "gps"){
      mensaje = "Al parecer no es posible detectar el gps, revise los permisos o si se encuentra encendido";
    }
    else if(tipo == 'internet'){
      mensaje = "Esta funcionalidad no esta disponible para el modo offline";
    }
    else if(tipo == 'formulario'){
      mensaje = "No fue posible enviar la información, ya que el formulario esta incompleto";
    }
    else{
      mensaje = "No fue posible enviar la información, intente más tarde";
    }
    const alert = await this.alert.create({
      header: 'Problemas al subir ubicación',
      mode: "ios",
      message: mensaje,
      buttons: [{text : 'OK'}]
    });
    await alert.present();
  }

  async errorOffGps(){

  }

}

