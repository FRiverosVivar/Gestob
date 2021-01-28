import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LtecDataService } from 'src/app/service/data/ltec-data.service';
import { LtecRestService } from 'src/app/service/rest/ltec-rest.service';
import { Camera, CameraOptions} from '@ionic-native/camera/ngx';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { AgregarFotoPageModule } from './agregar-foto/agregar-foto.module';
import { AgregarFotoPage } from './agregar-foto/agregar-foto.page';
import { stringify } from '@angular/compiler/src/util';


@Component({
  selector: 'app-galeria',
  templateUrl: './galeria.page.html',
  styleUrls: ['./galeria.page.scss'],
})
export class GaleriaPage implements OnInit {

  books: any;
  contract: any;
  folios: any;
  user: any;
  fotosBack: any[]
  fotosContrato: any[];

  options: CameraOptions = {
    quality: 100,
    destinationType: this.camera.DestinationType.DATA_URL,
    encodingType: this.camera.EncodingType.JPEG,
    mediaType: this.camera.MediaType.PICTURE,
    sourceType: this.camera.PictureSourceType.CAMERA
  };

  constructor(
    private dataService: LtecDataService,
    private restService: LtecRestService,
    private router: Router,
    private modal: ModalController,
    private camera: Camera,
    private loading: LoadingController,
    private alertController: AlertController,
  ) { }

  ngOnInit() {
    this.contract = this.dataService.getContract();
    this.books = this.dataService.getBooks();
    this.user = this.dataService.getUser();
    this.fotosContrato = [];
    
  }

  ionViewWillEnter(){

    this.cargarFotos();

    if(this.fotosBack != null){
      this.fotosBack.forEach((foto) => {
        var link=foto["photo"]
        console.log(link)
        this.toDataURL(link).then((imageData) => {
          let base64Image = '' + imageData;
          console.log(base64Image)
          let photo = {
            base64 : ''
          }
          photo.base64 = base64Image;
          this.fotosContrato.push(photo)    
        })
      })
    }      
  }

  toDataURL = url => fetch(url)
  .then(response => response.blob())
  .then(blob => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  }))

  back(){
    this.router.navigate(['tabs/tabs/contract'],{});
  }

  cargarFotos(){
    this.presentLoading();
    this.restService.obtenerFotoContrato(this.contract).then(  
      (res) => {
        console.log("RES.DATA:  ",res.data); 
        if (res.status == 200) {  
          let data = JSON.parse(res.data)
          this.fotosBack=data
          console.log( stringify( this.fotosBack))
          console.log("FOTOS CARGADAS CORRECTAMENTE")
          this.loading.dismiss()
          
        }else{
          
          this.popupErrorForm("Ha ocurrido un error al cargar las fotos, por favor intentelo nuevamente.")
        }
      }, (error) => {
        
        this.popupErrorForm("Ha ocurrido un error al cargar las fotos, por favor intentelo nuevamente.")
      }
    )
  }

  async modalAgregarFoto(fotosContrato:any) {
    const modal = await this.modal.create({
      component: AgregarFotoPage,
      componentProps: {
        fotos: fotosContrato
      }
    }).then(modal => modal.present());
  }


  async presentLoading(tiempo = 40000) {
    const loading = await this.loading.create({
      translucent: true,
      duration: tiempo
    });
    await loading.present();

    return await loading.onDidDismiss();
  }

  async popupAceptado(text:string){
    const alert = await this.alertController.create({
      cssClass: 'errorFormAlert',
      header: '',
      message: '<ion-icon name="checkmark-outline" class="errorIcon"></ion-icon><br><h1 class="alertBody">'+text+'</h1>',
      buttons: [{
        text: 'Ok'}]
    });
    await alert.present();
  }

  async popupErrorForm(text:string){
    const alert = await this.alertController.create({
      cssClass: 'errorFormAlert',
      header: '',
      message: '<ion-icon name="close-outline" class="errorIcon"></ion-icon><br><h1 class="alertBody">'+text+'</h1>',
      buttons: [
        { text: 'OK',
        }]
    });
    await alert.present();
  }

}


