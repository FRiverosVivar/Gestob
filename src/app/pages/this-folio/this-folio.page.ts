import { Component, OnInit } from '@angular/core';
import { LtecDataService } from 'src/app/service/data/ltec-data.service';
import { Router } from '@angular/router';
import { LoadingController, ToastController, AlertController, ModalController, Platform, PopoverController } from '@ionic/angular';
import { LtecRestService } from 'src/app/service/rest/ltec-rest.service';
import { LtecTokenService } from 'src/app/service/token/ltec-token.service';
import { File } from '@ionic-native/file/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { ImageModalPage } from './image-modal/image-modal.page';
import { StreamingMedia, StreamingVideoOptions, StreamingAudioOptions  } from '@ionic-native/streaming-media/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { PopoverFolioPage } from './popover-folio/popover-folio.page';
import { NetworkService, ConnectionStatus } from 'src/app/service/network/ltec-network.service';
import { OfflineManagerService } from 'src/app/service/offline/ltec-offline-manager.service';
import { Storage } from '@ionic/storage';

const STORAGE_REQ_KEY = 'ltecOffline';

@Component({
  selector: 'app-this-folio',
  templateUrl: './this-folio.page.html',
  styleUrls: ['./this-folio.page.scss'],
})
export class ThisFolioPage implements OnInit {

  folio : any;
  book: any;
  contract: any;
  formFolio: any;
  select: string = "folio";
  isFecha: boolean = false;
  archives: any;
  downloadPath: any;
  showFilePath: any;

  selectPriority: any;
  selectCategory: any;
  dateLimit: any;

  user:any;

  archivesOffline: any

  CATEGORIAS_FOLIO = ["Entrega de documentación", "Notificación", "Solicitud", "Instrucción", "Citación", "Creación de libro", "Creación de usuario", "Anulación", "Rectificación", "Multa", "Entrega terreno", "Recepción provisoria", "Recepción definitiva", "Informa", "Respuesta", "Reiteración", "Constancia","Alta de libro","Incidente"]
  PRIORITY_FOLIO = ["Baja", "Media","Alta"];

  constructor(
    private dataService: LtecDataService,
    private router: Router,
    public loading: LoadingController,
    private restService: LtecRestService,
    private tokenService: LtecTokenService,
    public toast: ToastController,
    public alert: AlertController,
    public modal: ModalController,
    private file: File,
    private ft: FileTransfer,
    private fileOpener: FileOpener,
    private streamingMedia: StreamingMedia,
    private platform: Platform,
    public popover: PopoverController,
    public networkService: NetworkService,
    private storage: Storage,
    private offlineService: OfflineManagerService,
  ){
  }

  ngOnInit() {
    this.folio = this.dataService.getFolio();
    this.book = this.dataService.getBook();
    this.contract = this.dataService.getContract();

    this.archives = this.dataService.getArchives();
    if(this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline){
      this.archivesOffline = this.dataService.getArchivesNoCloud();
    }else{
      this.archivesOffline = {
        imagenes : [],
        videos: [],
        audios: [],
        archivos: [],
      }
    }

    this.selectPriority = this.folio.prioridadNumber;
    this.selectCategory = this.folio.categoriaNumber;

    if(this.folio.fecha_limite){
      if(this.folio.fecha_limite != ""){
        this.dateLimit = this.folio.fecha_limite.split("-").reverse().join("-");
        console.log(this.dateLimit);
        this.isFecha = true;
      }
      else{
        this.dateLimit = "";
        this.isFecha = false;
      }
    }

    this.formFolio = {
      'asunto' : this.folio.asunto,
      'categoria' : this.folio.categoriaNumber.toString(),
      'prioridad' : this.folio.prioridadNumber.toString(),
      'fecha_limite': this.folio.fecha_limite,
      'contenido': this.folio.contenido
    }

  }

  prioritySelected(){
    this.formFolio.prioridad = this.selectPriority.toString();
  }

  categorySelected(){
    this.formFolio.categoria  = this.selectCategory.toString();
  }

  dateLimitSelected(){
    this.formFolio.fecha_limite = this.dateLimit;
  }

  ionViewWillEnter(){
    console.log("ionViewWillEnter Folio");
    this.folio = this.dataService.getFolio();
    this.book = this.dataService.getBook();
    this.contract = this.dataService.getContract();
    this.archives = this.dataService.getArchives();
    if(this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline){
      this.archivesOffline = this.dataService.getArchivesNoCloud();
      console.log(this.archivesOffline);
    }else{
      this.archivesOffline = {
        imagenes : [],
        videos: [],
        audios: [],
        archivos: [],
      }
    }
    this.formFolio = {
      'asunto' : this.folio.asunto,
      'categoria' : this.CATEGORIAS_FOLIO[this.folio.categoriaNumber],
      'prioridad' : this.PRIORITY_FOLIO[this.folio.prioridadNumber],
      'fecha_limite': this.folio.fecha_limite,
      'contenido': this.folio.contenido
    }
    if(this.folio.fecha_limite != ""){
      this.isFecha = true;
    }
  }

  segmentChanged(ev: any) {
    console.log('Segment changed', ev.detail.value);
    this.select = ev.detail.value.toString();
  }

  back(){
    this.router.navigate(['tabsFolio/tabsFolio/folio'],{});
  }

  //--------------------------------------Editar Folio-----------------------------
  async editFolio(){
    const loading = await this.loading.create({
      message: 'Guardando folio...',
      spinner: "circles",
      cssClass: 'loading-Custom'
    });
    await loading.present();
    if(this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Online){
      if(this.formFolio.prioridad.length > 1){
        for(let i=0; i<this.PRIORITY_FOLIO.length; i++){
          if(this.PRIORITY_FOLIO[i] == this.formFolio.prioridad){
            this.formFolio.prioridad = i.toString();
          }
        }
      }
      if(this.formFolio.categoria.length > 1){
        for(let j=0; j<this.CATEGORIAS_FOLIO.length; j++){
          if(this.CATEGORIAS_FOLIO[j] == this.formFolio.categoria){
            this.formFolio.categoria = j.toString();
          }
        }
      }
      this.restService.editFolio(this.folio,this.formFolio,this.contract,this.book).then((res) => {
        console.log("la data que retorna del editFolio() es",JSON.stringify(res));
        let header = res.headers;
        let datos = JSON.parse(res.data);
        this.tokenService.setToken(header);
        this.reloadAllData();
        console.log(datos);
        loading.dismiss();
        this.mensajeSuccess('Folio guardado correctamente');
      },(error) => {
        console.log("Error al editar Folio borrador",error);
        this.alertNoEdit();
      })
    }
    else{
      if(!this.folio.online){
        if(this.formFolio.prioridad.length > 1){
          for(let i=0; i<this.PRIORITY_FOLIO.length; i++){
            if(this.PRIORITY_FOLIO[i] == this.formFolio.prioridad){
              this.formFolio.prioridad = i.toString();
            }
          }
        }
        if(this.formFolio.categoria.length > 1){
          for(let j=0; j<this.CATEGORIAS_FOLIO.length; j++){
            if(this.CATEGORIAS_FOLIO[j] == this.formFolio.categoria){
              this.formFolio.categoria = j.toString();
            }
          }
        }
        this.offlineService.setRequest(this.folio, this.formFolio);
        setTimeout(() => {
        loading.dismiss();
        this.mensajeSuccess('Folio editado correctamente, pero guardado localmente');
        },1000);
      }
      else{
        loading.dismiss()
        this.alertNoEditOnline();
      }
      //Guardar puede servir pal futuro a lo vision !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!111
      // //Primero debo verificar si el folio esta offline o online
      // this.storage.get(STORAGE_REQ_KEY).then((res) => {
      //   console.log(JSON.parse(res));
      //   var encontrado = false;
      //   for(let data of JSON.parse(res)){
      //     //Folio esta en cola asi que no genero una consulta patch para editar, sino edito de ahi mismo el folio
      //     if(data.id == this.folio.id){
      //       encontrado = true;
      //     }
      //   }
      //   if(encontrado){
      //     if(this.formFolio.prioridad.length > 1){
      //       for(let i=0; i<this.PRIORITY_FOLIO.length; i++){
      //         if(this.PRIORITY_FOLIO[i] == this.formFolio.prioridad){
      //           this.formFolio.prioridad = i.toString();
      //         }
      //       }
      //     }
      //     if(this.formFolio.categoria.length > 1){
      //       for(let j=0; j<this.CATEGORIAS_FOLIO.length; j++){
      //         if(this.CATEGORIAS_FOLIO[j] == this.formFolio.categoria){
      //           this.formFolio.categoria = j.toString();
      //         }
      //       }
      //     }
      //     console.log(this.formFolio);
      //     this.offlineService.setRequest(this.folio, this.formFolio);
      //     setTimeout(() => {
      //       loading.dismiss();
      //       this.mensajeSuccess('Folio editado correctamente, pero guardado localmente');
      //     },1000);
      //   }
      //   else{
      //     if(this.formFolio.prioridad.length > 1){
      //       for(let i=0; i<this.PRIORITY_FOLIO.length; i++){
      //         if(this.PRIORITY_FOLIO[i] == this.formFolio.prioridad){
      //           this.formFolio.prioridad = i.toString();
      //         }
      //       }
      //     }
      //     if(this.formFolio.categoria.length > 1){
      //       for(let j=0; j<this.CATEGORIAS_FOLIO.length; j++){
      //         if(this.CATEGORIAS_FOLIO[j] == this.formFolio.categoria){
      //           this.formFolio.categoria = j.toString();
      //         }
      //       }
      //     }
      //     this.restService.editFolioOffline(this.folio,this.formFolio,this.contract,this.book);
      //     setTimeout(() => {
      //       loading.dismiss();
      //       this.mensajeSuccess('Folio editado correctamente, pero guardado localmente');
      //     })
      //   }
      // })
    }
  }

  async alertNoEdit(){
    const alert = await this.alert.create({
      header: 'Problemas al guardar el folio',
      mode: "ios",
      message: 'Al parecer ocurrio un problema al guardar, vuelva a intentar más tarde',
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

  async alertNoEditOnline(){
    const alert = await this.alert.create({
      header: 'Problemas al guardar el folio',
      mode: "ios",
      message: 'No es posible editar un folio que se encuentre guardado en el servidor. Conectese a Internet para editar',
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

  async mensajeSuccess(mensaje){
    const toast = await this.toast.create({
      message: mensaje,
      duration: 1000
    });
    toast.present();
  }

  showPhoto(foto){
    if(this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Online){
      this.modal.create({
        component: ImageModalPage,
        componentProps: {
          img : foto,
          view: true,
        }
      }).then(modal => modal.present());
    }
    else{
      this.alertNoRed('foto');
    }
  }

  async showVideo(video){
    if(this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Online){
      const loading = await this.loading.create({
        message: 'Cargando video...',
        spinner: "circles",
        cssClass: 'loading-Custom',
        //enableBackdropDismiss: true,
      });
      await loading.present();
      console.log(video);
      let options: StreamingVideoOptions = {
        successCallback: () => { console.log('Video played'); loading.dismiss(); },
        errorCallback: (e) => { console.log('Error streaming',e); loading.dismiss();this.alertNoPlay('video'); },
        orientation: 'landscape',
        shouldAutoClose: true,
        controls: true
      }
      this.streamingMedia.playVideo(video.name.url, options);
    }
    else{
      this.alertNoRed('video');
    }
  }

  async showAudio(audio){
    console.log("show audio: ", JSON.stringify(audio));
    if(this.networkService.getCurrentNetworkStatus()== ConnectionStatus.Online){
      const loading = await this.loading.create({
        message: 'Cargando audio...',
        spinner: "circles",
        cssClass: 'loading-Custom',
        //enableBackdropDismiss: true,
      });
      await loading.present();
      let options: StreamingAudioOptions = {
        successCallback: () => { console.log('Audio played');loading.dismiss(); },
        errorCallback: (e) => { console.log('Error streaming',e); loading.dismiss();this.alertNoPlay('audio');},
        bgColor: "#222428",
        bgImage: "www/assets/imgs/voice.png",
        bgImageScale: "fit", // other valid values: "stretch", "aspectStretch"
        initFullscreen: false, // true is default. iOS only.
        keepAwake: false, // prevents device from sleeping. true is default. Android only.
      }
      this.streamingMedia.playAudio(audio.name.url, options);
    }
    else{
      this.alertNoRed('audio');
    }
  }

  async showDocument(document){
    console.log("showDocument: ", JSON.stringify(document));
    if(this.networkService.getCurrentNetworkStatus()== ConnectionStatus.Online){
      var filename = document.name.url.substring(document.name.url.lastIndexOf('/') + 1);
      let downloadUrl = document.name.url;
      let path = this.file.dataDirectory;
      console.log("dataDirectory: ", path);
      const transfer = this.ft.create();

      const loading = await this.loading.create({
        message: 'Cargando documento...',
        spinner: "circles",
        cssClass: 'loading-Custom'
      });
      await loading.present();

      transfer.download(downloadUrl, path + filename).then((entry) =>{
        console.log("transfer.download: ", JSON.stringify(entry))
        let url = entry.toURL();
        if(this.platform.is('ios')){
          console.log("transfer.ios: ")
          this.fileOpener.open(url, 'application/pdf');
          loading.dismiss();
        }
        else{
          console.log("transfer.android: ")
          this.fileOpener.open(url, 'application/pdf');
          loading.dismiss();
        }
      },(error) =>{
        loading.dismiss();
        console.log("transfer.download error: ", error);
        this.alertNoPlay('document');
      });
    }
    else{
      this.alertNoRed('Documento');
    }
  }

  async alertNoPlay(tipo){
    let mensaje: string = "";
    if(tipo == "audio"){
      mensaje = "No es posible reproducir el audio, intente más tarde";
    }
    else if(tipo == "video"){
      mensaje ="No es posible reproducir el video, intente más tarde";
    }
    else{
      mensaje="No es posible abrir el archivo, intente más tarde";
    }
    const alert = await this.alert.create({
      header: 'Ocurrio un problema',
      mode: "ios",
      message: mensaje,
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

  async openPopoverFolio(ev: Event){
    //if(this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Online){
      const popover = await this.popover.create({
        component: PopoverFolioPage,
        componentProps: {
          folio : this.folio,
          book: this.book,
          contract: this.contract
        },
        event: ev,
        mode: 'ios',
      });
      popover.present();

      popover.onDidDismiss().then((data) => {
        console.log("Popover close",data);
        this.folio = this.dataService.getFolio();
        this.book = this.dataService.getBook();
        this.contract = this.dataService.getContract();
        this.archives = this.dataService.getArchives();
        if(this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Offline){
          this.dataService.setArchivesNoCloud(this.folio)
          setTimeout(() => this.archivesOffline = this.dataService.getArchivesNoCloud(),500);
        }else{
          this.archivesOffline = {
            imagenes : [],
            videos: [],
            audios: [],
            archivos: [],
          }
        }
      })
    // }
    // else{
    //   const alert = await this.alert.create({
    //     header: 'Alerta',
    //     mode: "ios",
    //     message: 'Esta funcionalidad no esta disponible en modo offline actualmente',
    //     buttons: [
    //       {
    //         text : 'OK',
    //         handler: () => {
    //         }
    //       }
    //     ]
    //   });
    //   await alert.present();
    // }
  }

  async alertNoRed(tipo){
    let mensaje : string = "";
    if(tipo == 'foto'){
      mensaje = 'Por no tener conexión a internet, no es posible mostrar la foto del folio';
    }
    else if(tipo == 'video'){
      mensaje = 'Por no tener conexión a internet, no es posible ver el video del folio';
    }
    else if(tipo == 'audio'){
      mensaje = 'Por no tener conexión a internet, no es posible escuchar el audio del folio';
    }
    else if(tipo == 'documento'){
      mensaje = 'Por no tener conexión a internet, no es posible ver el documento del folio';
    }
    const alert = await this.alert.create({
      header: 'No se puede acceder',
      mode: "ios",
      message: mensaje,
      buttons: [{text : 'OK'}]
    });
    await alert.present();
  }

    //Aqui recargamos el arbol por cada accion del usuario
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
