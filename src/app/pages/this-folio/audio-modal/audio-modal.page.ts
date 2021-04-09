import { Component, OnInit, Inject } from '@angular/core';
import { ModalController, LoadingController, AlertController, ToastController, Platform } from '@ionic/angular';
import { LtecRestService } from 'src/app/service/rest/ltec-rest.service';
import { LtecTokenService } from 'src/app/service/token/ltec-token.service';
import { DomSanitizer } from "@angular/platform-browser";
import { LtecDataService } from 'src/app/service/data/ltec-data.service';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { NetworkService, ConnectionStatus } from 'src/app/service/network/ltec-network.service';
import { OfflineManagerService } from 'src/app/service/offline/ltec-offline-manager.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-audio-modal',
  templateUrl: './audio-modal.page.html',
  styleUrls: ['./audio-modal.page.scss'],
})
export class AudioModalPage implements OnInit {

  view: any;
  folio: any;
  book: any;
  contract: any;
  filename: string = "";
  path: any;
  grabacion: any;

  user:any

  curr_playing_file: MediaObject;

  is_playing: boolean = false;
  is_in_play: boolean = false;
  is_ready: boolean = false;
  message: any;

  duration: any = -1;
  position: any = 0;

  get_duration_interval: any;
  get_position_interval: any;

  constructor(
    private modal: ModalController,
    private restService: LtecRestService,
    private loading: LoadingController,
    private tokenService: LtecTokenService,
    public domSanitizer: DomSanitizer,
    private dataService: LtecDataService,
    public alert: AlertController,
    public toast: ToastController,
    private media: Media,
    private networkService: NetworkService,
    private offlineService: OfflineManagerService,
    private storage: Storage,
    private platform: Platform
  ) { }

  ngOnInit() {
    this.user = this.dataService.getUser();
  }

  close(){
    this.modal.dismiss(false);
  }

  playRecording() {
    this.curr_playing_file = this.media.create(this.path);
    this.curr_playing_file.play();
    this.is_playing = true;

    this.curr_playing_file.onSuccess.subscribe(() => {
      console.log('Audio is successful')
      this.is_playing = false;
    });


  }

  pausePlayRecording() {
    this.curr_playing_file.pause();
  }

  async subirAudio(){
    const loading = await this.loading.create({
      message: 'Subiendo Audio...',
      spinner: "circles",
      cssClass: 'loading-Custom'
    });
    await loading.present();
    if(this.networkService.getCurrentNetworkStatus() ==  ConnectionStatus.Online){
      let text:string
      if(this.platform.is('ios'))
        text = 'file://'
      else
        text = ''
      this.restService.uploadAudio(this.folio,this.filename,text+this.path).then((res) => {
        console.log("la data que retorna del uploadAudio() es",JSON.stringify(res));
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
              setTimeout(() => this.modal.dismiss(true),1000);
            },1000);
          });
        },500);
      },(error) => {
        console.log("Error al subir la audio: ", JSON.stringify(error));
        loading.dismiss();
        this.alertNoUpload();
        this.modal.dismiss(false);
      })
    }
    else{
      if(this.folio.online){
        let url = "https://libro.gestob.cl/api/v1/folio_audios";
        //let url = "https://libro.ltec.cl/api/v1/folio_audios"
        //let url = "https://fierce-chamber-49863.herokuapp.com/api/v1/folio_audios"
        this.offlineService.storeRequestArchive(this.folio,this.path,this.filename,'audio',url,true);
        this.dataService.setArchivesNoCloud(this.folio)
        setTimeout(() => {
          loading.dismiss();
          //this.confirm();
          setTimeout(() => {this.modal.dismiss(true)},1000);
        })
      }
      else{
        let url = "https://libro.gestob.cl/api/v1/folio_audios";
        //let url = "https://libro.ltec.cl/api/v1/folio_audios"
        //let url = "https://fierce-chamber-49863.herokuapp.com/api/v1/folio_audios"
        this.offlineService.storeRequestArchive(this.folio,this.path,this.filename,'audio',url,false);
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
      header: 'Problemas al subir audio',
      mode: "ios",
      message: 'Al parecer no es posible en este momento subir el audio, intentelo más tarde',
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
      message: 'Audio subido correctamente',
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
