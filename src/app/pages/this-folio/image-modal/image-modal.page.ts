import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { ModalController, LoadingController, AlertController, ToastController } from '@ionic/angular';
import { LtecRestService } from 'src/app/service/rest/ltec-rest.service';
import { LtecTokenService } from 'src/app/service/token/ltec-token.service';
import { DomSanitizer } from "@angular/platform-browser";
import { LtecDataService } from 'src/app/service/data/ltec-data.service';
import { NetworkService, ConnectionStatus } from 'src/app/service/network/ltec-network.service';
import { OfflineManagerService } from 'src/app/service/offline/ltec-offline-manager.service';
import { Storage } from '@ionic/storage';
import { File } from '@ionic-native/file/ngx';

@Component({
  selector: 'app-image-modal',
  templateUrl: './image-modal.page.html',
  styleUrls: ['./image-modal.page.scss'],
})
export class ImageModalPage implements OnInit {

  img: any;
  view: any;
  folio: any;
  book: any;
  contract: any;
  filename: string = "";
  foto: any;

  user: any;

  @ViewChild('slider', { read: ElementRef , static: true })slider: ElementRef;

  sliderOpts = {
    zoom: {
      maxRatio: 3
    }
  }

  constructor(
    private modal: ModalController,
    private restService: LtecRestService,
    private loading: LoadingController,
    private tokenService: LtecTokenService,
    public domSanitizer: DomSanitizer,
    private dataService: LtecDataService,
    public alert: AlertController,
    public toast: ToastController,
    private networkService: NetworkService,
    private offlineService: OfflineManagerService,
    private storage: Storage,
    private file: File,
  ) {
  }

  ngOnInit() {
    let filename = this.img.substring(this.img.lastIndexOf('/')+1);
    let path =  this.img.substring(0,this.img.lastIndexOf('/')+1);

    //then use the method reasDataURL  btw. var_picture is ur image variable
    this.file.readAsDataURL(path, filename).then(res => this.foto = res  );
  }

  zoom(zoomIn: boolean){
    let zoom = this.slider.nativeElement.swiper.zoom;
    if(zoomIn){
      zoom.in();
    }
    else{
      zoom.out();
    }
  }

  close(){
    this.modal.dismiss(false);
  }

  async subirPhoto(){
    const loading = await this.loading.create({
      message: 'subiendo imagen...',
      spinner: "circles",
      cssClass: 'loading-Custom'
    });
    await loading.present();

    if(this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Online){
      this.restService.uploadPhoto(this.folio,this.filename,this.img,).then((res) => {
        console.log("la data que retorna del uploadPhoto() es",JSON.stringify(res));
        let header = res.headers;
        this.tokenService.setToken(header);
        setTimeout(() => {
          this.restService.archivesFolio(this.contract,this.book,this.folio).then((res) =>{
            console.log("la data que retorna del archivesFolio() es",JSON.stringify(res));
            let header = res.headers;
            let datos = JSON.parse(res.data);
            this.tokenService.setToken(header);
            this.dataService.setArchives(datos);
            this.reloadAllData();
            setTimeout(() => {
              loading.dismiss();
              this.confirm();
              setTimeout(() => {this.modal.dismiss(true)},1000);
            },1000);
          });
        },500);
      },(error) => {
        console.log("Error al subir la foto",error);
        loading.dismiss();
        this.alertNoUpload();
        this.modal.dismiss(false);
      })
    }
    else{
      if(this.folio.online){
        let url = "https://libro.gestob.cl/api/v1/folio_pictures";
        //let url = "https://libro.ltec.cl/api/v1/folio_pictures"
        //let url = "https://fierce-chamber-49863.herokuapp.com/api/v1/folio_pictures"
        this.offlineService.storeRequestArchive(this.folio,this.img,this.filename,'img',url,true);
        this.dataService.setArchivesNoCloud(this.folio)
        setTimeout(() => {
          loading.dismiss();
          //this.confirm();
          setTimeout(() => {this.modal.dismiss(true)},1000);
        })
      }
      else{
        let url = "https://libro.gestob.cl/api/v1/folio_pictures";
        //let url = "https://libro.ltec.cl/api/v1/folio_pictures"
        //let url = "https://fierce-chamber-49863.herokuapp.com/api/v1/folio_pictures"
        this.offlineService.storeRequestArchive(this.folio,this.img,this.filename,'img',url,false);
        this.dataService.setArchivesNoCloud(this.folio)
        setTimeout(() => {
          loading.dismiss();
          //this.confirm();
          setTimeout(() => {this.modal.dismiss(true)},1000);
        })
      }
    }
  }

  async alertNoUpload(){
    const alert = await this.alert.create({
      header: 'Problemas al subir imagen',
      mode: "ios",
      message: 'Al parecer no es posible en este momento subir la imagen, intentelo más tarde',
      buttons: [
        {
          text : 'OK',
          handler: () => {
          }
        }
      ]
    });
    await alert.present();
  }

  async confirm(){
    const toast = await this.toast.create({
      message: 'Imagen subido correctamente',
      duration: 1000,
      cssClass: 'toast-Confirm',
      keyboardClose: true,
    });
    toast.present();
  }

  reloadAllData(){
    this.user = this.dataService.getUser();
    this.restService.loadUserAppData(this.user.id).then((res) => {
      let data = JSON.parse(res.data);
      let header = res.headers;
      this.tokenService.setToken(header);
      this.dataService.setAllData(data);
      this.storage.set("AllDataLtec",data).then((save2) => {
        console.log("Data de Ltec guardada",save2);
      },(error) => {
        console.log("Error al guardar Data de Ltec",error);
      });
    }, (error) => {
      console.log("error loadUserAppData: ", JSON.stringify(error))
    });
  }

}
