import { Component, OnInit, Inject } from '@angular/core';
import { ModalController, LoadingController, AlertController, ToastController } from '@ionic/angular';
import { LtecRestService } from 'src/app/service/rest/ltec-rest.service';
import { LtecTokenService } from 'src/app/service/token/ltec-token.service';
import { DomSanitizer } from '@angular/platform-browser';
import { LtecDataService } from 'src/app/service/data/ltec-data.service';
import { NetworkService, ConnectionStatus } from 'src/app/service/network/ltec-network.service';
import { OfflineManagerService } from 'src/app/service/offline/ltec-offline-manager.service';
import { Storage } from '@ionic/storage';
import { StreamingMedia, StreamingVideoOptions } from '@ionic-native/streaming-media/ngx';

@Component({
  selector: 'app-video-modal',
  templateUrl: './video-modal.page.html',
  styleUrls: ['./video-modal.page.scss'],
})
export class VideoModalPage implements OnInit {

  path: any;
  folio: any;
  book: any;
  contract: any;
  filename: string = "";
  user: any;

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
    private stream: StreamingMedia,
  ) { }

  ngOnInit() {
  }

  close(){
    this.modal.dismiss(false);
  }

  async subirVideo(){
    const loading = await this.loading.create({
      message: 'Subiendo Video...',
      spinner: "circles",
      cssClass: 'loading-Custom'
    });
    await loading.present();

    if(this.networkService.getCurrentNetworkStatus() ==  ConnectionStatus.Online){
      this.restService.uploadVideo(this.folio,this.filename,this.path).then((res) => {
        console.log("la data que retorna del uploadVideo() es",JSON.stringify(res));
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
        },1000);
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
        //let url = "https://fierce-chamber-49863.herokuapp.com/api/v1/folio_videos"
        this.offlineService.storeRequestArchive(this.folio,this.path,this.filename,'video',url,true);
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
        //let url = "https://fierce-chamber-49863.herokuapp.com/api/v1/folio_videos"
        this.offlineService.storeRequestArchive(this.folio,this.path,this.filename,'video',url,false);
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
      header: 'Problemas al subir video',
      mode: "ios",
      message: 'Al parecer no es posible en este momento subir el video, intentelo más tarde',
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
      message: 'Video subido correctamente',
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

  verVideo() {
    let options: StreamingVideoOptions = {
      successCallback: (res) => console.log('Video played: ' + JSON.stringify(res)),
      errorCallback: (error) => console.log('Error streaming: ' + JSON.stringify(error)),
      orientation: 'landscape',
      shouldAutoClose: true,
      controls: false
    };
    this.stream.playVideo(this.path, options);
    console.log("video: " + this.path.fullPath);
  }


}
