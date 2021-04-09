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
  fotosBack: any;
  fotosBack2: any;
  fotosBack3: any;
  fotosContrato: any[];
  fotosLinks: any[];
  proxy='https://cors-anywhere.herokuapp.com/';
  link3='https://i.pinimg.com/originals/67/54/78/675478c7dcc17f90ffa729387685615a.jpg';

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
    this.fotosLinks = [];
    
  }

  ionViewWillEnter(){
    this.fotosLinks = [];
    this.cargarFotos();
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

  refreshPage(event){
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete(); // return
    }, 2000);
  }

  cargarFotos(){
    this.presentLoading();
    this.restService.obtenerFotoContrato(this.contract).then(  
      (res) => {
        console.log("RES.DATA:  ",res.data); 
        if (res.status == 200) {  
          let data = JSON.parse(res.data)

          this.fotosBack=data
          console.log( stringify(this.fotosBack["data"]))

          this.fotosBack2=this.fotosBack["data"]

          this.fotosBack2.forEach((foto) => {
            var link=foto["photo"]
            var nombre=foto["nombre"]
            var fecha=foto["created_at"]
            var periodo = foto['periodo']
            var auxPeriodo
            let photo = {
              link : '',
              nombre: '',
              fecha: '',
              periodo: '',
            }
            var link2=link["url"]
            console.log("LINK: "+link2)
            photo.link=link2
            photo.nombre=nombre
            photo.fecha=this.convertDate(fecha.substring(0,10));
            let mes:string
            let text
            if(periodo != null){

              auxPeriodo = periodo.split('T')[0]
              periodo = auxPeriodo.slice(0,4)
              switch(parseInt(auxPeriodo.slice(5,7))){
                case 1:{
                  mes = "Enero"
                  break;
                }
                case 2:{
                  mes = "Febrero"
                  break;
                }
                case 3:{
                  mes = "Marzo"
                  break;
                }
                case 4:{
                  mes = "Abril"
                  break;
                }
                case 5:{
                  mes = "Mayo"
                  break;
                }
                case 6:{
                  mes = "Junio"
                  break;
                }
                case 7:{
                  mes = "Julio"
                  break;
                }
                case 8:{
                  mes = "Agosto"
                  break;
                }
                case 9:{
                  mes = "Septiembre"
                  break;
                }
                case 10:{
                  mes = "Octubre"
                  break;
                }
                case 11:{
                  mes = "Noviembre"
                  break;
                }
                case 12:{
                  mes = "Diciembre"
                  break;
                }
              }
              text = mes+" "+periodo
            }else{
              text = "-"
            }
            
            this.fotosLinks.push(photo)
            photo.periodo = text
          })
          
          
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

  convertDate(dateString){
    if(dateString){
      var p = dateString.split(/\D/g)
      return [p[2],p[1],p[0] ].join("-")
    }
    else{
      return null;
    }
  }

  async modalAgregarFoto(fotosContrato:any) {
    const modal = await this.modal.create({
      component: AgregarFotoPage,
      componentProps: {
        fotos: fotosContrato,
        contrato: this.contract
      }
    })
    modal.present();
    modal.onDidDismiss().then(() => {
      this.fotosLinks = [];
      this.cargarFotos()
    })
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



