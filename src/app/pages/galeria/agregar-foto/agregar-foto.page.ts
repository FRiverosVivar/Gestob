import { Component, Input, OnInit } from '@angular/core';
import { LtecDataService } from 'src/app/service/data/ltec-data.service';
import { LtecRestService } from 'src/app/service/rest/ltec-rest.service';
import { Camera, CameraOptions} from '@ionic-native/camera/ngx';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { LtecTokenService } from 'src/app/service/token/ltec-token.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-agregar-foto',
  templateUrl: './agregar-foto.page.html',
  styleUrls: ['./agregar-foto.page.scss'],
})
export class AgregarFotoPage implements OnInit {

  contract: any;
  user: any;
  fotosContrato: any[];
  foto: any;

  formDatosFoto: FormGroup;

  @Input() fotos: any;

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
    private camera: Camera,
    private loading: LoadingController,
    private formBuilder: FormBuilder,
    private modal: ModalController,
    private tokenService: LtecTokenService,
    private alertController: AlertController,
  ) { }

  ngOnInit() {
    this.contract = this.dataService.getContract();
    this.user = this.dataService.getUser();
    this.fotosContrato = [];

    this.formDatosFoto = this.formBuilder.group({
      nombre: ['', Validators.required],
      fecha: ['', Validators.required],
    });
  }

  obtenerFotosCamara(){
    this.camera.getPicture(this.options).then((imageData) => {
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      let photo = {
          base64 : ''
        }
      photo.base64 = base64Image;
      this.foto=photo
      this.fotosContrato.unshift({
        data: 'data:image/jpeg;base64,' + imageData
      }); 
    });
  }

  guardarFoto(){
    this.presentLoading();
    this.restService.agregarFotoContrato(this.foto,this.formDatosFoto.value,this.contract).then(  
      (res) => {
        console.log("RES.DATA:  ",res.data); 
        if (res.status == 200) {  
          
          this.popupAceptado("Foto creada exitosamente");
          this.loading.dismiss()
          this.modal.dismiss()
        }else{
          this.loading.dismiss()
          this.popupErrorForm("Ha ocurrido un error, por favor intentelo nuevamente.")
        }
      }, (error) => {
        this.loading.dismiss()
        this.popupErrorForm("Ha ocurrido un error, por favor intentelo nuevamente.")
      }
    )
  }

  back(){
    this.modal.dismiss()
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
