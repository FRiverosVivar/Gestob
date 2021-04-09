import { Component, OnInit } from '@angular/core';
import { PopoverController, LoadingController, ModalController, AlertController, Platform } from '@ionic/angular';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { ImageModalPage } from '../image-modal/image-modal.page';
import { MediaCapture, MediaFile, CaptureAudioOptions, CaptureVideoOptions } from '@ionic-native/media-capture/ngx';
import { File } from '@ionic-native/file/ngx';
import { VideoModalPage } from '../video-modal/video-modal.page';
import { AudioModalPage } from '../audio-modal/audio-modal.page';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { DocumentModalPage } from '../document-modal/document-modal.page';
import { IOSFilePicker } from '@ionic-native/file-picker/ngx';

@Component({
  selector: 'app-popover-folio',
  templateUrl: './popover-folio.page.html',
  styleUrls: ['./popover-folio.page.scss'],
})
export class PopoverFolioPage implements OnInit {

  folio:any;
  book: any;
  contract: any;
  mensaje: string = "";

  load: HTMLIonLoadingElement = null;

  constructor(
    private popover: PopoverController,
    private camera: Camera,
    public loading: LoadingController,
    public modal: ModalController,
    private mediaCapture: MediaCapture,
    private file: File,
    private fileChooser: FileChooser,
    private filePath: FilePath,
    public alert: AlertController,
    private platform: Platform,
    private filePicker: IOSFilePicker,
  ) { }

  ngOnInit() {
  }

  closePopover(){
    this.popover.dismiss();
  }

  async uploadImage(){
    const options: CameraOptions = {
      destinationType: this.camera.DestinationType.FILE_URI,
      quality: 50,
      saveToPhotoAlbum: true,
      sourceType: this.camera.PictureSourceType.CAMERA,
      encodingType: this.camera.EncodingType.JPEG,
    };

    await this.loading.create({
      message: 'Cargando Camara...',
      spinner: "dots",
      cssClass: 'loading-Custom',
    }).then((load: HTMLIonLoadingElement) => {
      this.load = load;
      this.load.present();
    });
    this.camera.getPicture(options).then((imageData) => {
      this.load.message = "Cargando Foto..."
      setTimeout(() => {this.openModalFoto(imageData)},500);
      this.load.dismiss();
    },(error) => {
      console.log("Error al tomar la foto",error);
      this.load.dismiss();
      this.errorComponent('Camara');
      this.closePopover();
    });
  }

  openModalFoto(imagen){
    this.modal.create({
      component: ImageModalPage,
      componentProps: {
        img : imagen,
        view: false,
        folio: this.folio,
        book: this.book,
        contract: this.contract
      }
    }).then(modal => {
      modal.present();
      modal.onDidDismiss().then((data) => {
        console.log("Modal Photo close",data);
        this.popover.dismiss(data);
      });
    });

  }

  async uploadVideo(){
    let options: CaptureVideoOptions = {
      limit: 1,
      duration: 10
    };
    await this.loading.create({
      message: "Cargando VideoCamara...",
      spinner: "dots",
      cssClass: 'loading-Custom',
    }).then((load: HTMLIonLoadingElement) => {
      this.load = load;
      this.load.present();
    });

    this.mediaCapture.captureVideo(options).then((res: MediaFile[]) => {
      this.load.message = "Procesando Video..."
      console.log("PATH "+res[0].fullPath)
      setTimeout(() => {
        this.openModalVideo(this.platform.is("android") ? res[0].fullPath: 'file://' + res[0].fullPath);
        this.load.dismiss();
      },1000)
    },(error) => {
      console.log("Error al tomar el video",JSON.stringify(error));
      this.load.dismiss();
      this.errorComponent('Video');
      this.closePopover();
    });
  }

  openModalVideo(path){
    console.log("openModalVideo: ", JSON.stringify(path))
    this.modal.create({
      component: VideoModalPage,
      componentProps: {
        path: path,
        folio: this.folio,
        book: this.book,
        contract: this.contract
      }
    }).then(modal => {
      modal.present();
      modal.onDidDismiss().then((data) => {
        console.log("Modal Video close", JSON.stringify(data));
        this.popover.dismiss(data);
      });
    });
  }

  async uploadAudio(){
    let options: CaptureAudioOptions = {
      limit : 1,
    };

    await this.loading.create({
      message: "Cargando Micrófono...",
      spinner: "dots",
      cssClass: 'loading-Custom',
    }).then((load: HTMLIonLoadingElement) => {
      this.load = load;
      this.load.present();
    });

    this.mediaCapture.captureAudio(options).then((res: MediaFile[]) => {
      this.load.message = "Procesando Audio...";
      setTimeout(() => {
        this.openModalAudio(this.platform.is("android") ? res[0].fullPath: 'file://' + res[0].fullPath);
        this.load.dismiss();
      },1000);
    },(error) => {
      console.log("Error al tomar el audio",error);
      this.load.dismiss();
      this.errorComponent('Audio');
      this.closePopover();
    });
  }

  openModalAudio(path){
    this.modal.create({
      component: AudioModalPage,
      componentProps: {
        path: path,
        folio: this.folio,
        book: this.book,
        contract: this.contract
      }
    }).then(modal =>{
      modal.present();
      modal.onDidDismiss().then((data) => {
        console.log("Modal Audio close",data);
        this.popover.dismiss(data);
      });
    });
  }

  async uploadDocument(){
    await this.loading.create({
      message: "Cargando Documento...",
      spinner: "dots",
      cssClass: 'loading-Custom',
    }).then((load: HTMLIonLoadingElement) => {
      this.load = load;
      this.load.present();
    });

    if(this.platform.is("android")){
      this.fileChooser.open().then((uri) => {
            this.load.message = "Procesando Documento..."
            console.log("URI "+uri)
            this.filePath.resolveNativePath(uri).then((newPath) => {

              newPath = newPath.replace(/ /g,"%20")
              console.log("URI2 "+newPath)
              var fileExtension = newPath.substr(newPath.lastIndexOf('/') + 1);
              var extension = fileExtension.substr(fileExtension.length - 3);
              if(extension == "pdf" || extension == "dwg"){
                setTimeout(() => {
                  this.openModalDocument(newPath,fileExtension);
                  this.load.dismiss();
                },1000)
              }
              else{
                this.load.dismiss();
                this.noTypeDocument();
                this.closePopover();
              }
            }, (error) => {
              this.load.dismiss();
              this.errorComponent('Documento');
              this.closePopover();
              console.log(error);
            })
          },(error) => {
            this.load.dismiss();
            this.errorComponent('Documento');
            this.closePopover();
            console.log(error);
          })
      
    }

    if(this.platform.is("ios")){
      this.filePicker.pickFile().then((uri) => {
        this.load.message = "Procesando Documento..."
        let path = 'file://' + uri;
        let name = uri.split('/').pop();
        let extension = uri.split('.').pop();
        console.log('pickFile: ', path, name, extension);
        if(extension == "pdf" || extension == "dwg"){
            setTimeout(() => {
              this.openModalDocument(path, extension);
              this.load.dismiss();
            },1000)
        } else{
          this.load.dismiss();
          this.noTypeDocument();
          this.closePopover();
        }
      },(error) => {
        this.load.dismiss();
        this.errorComponent('Documento');
        this.closePopover();
        console.log(error);
      });
    }
  }

  openModalDocument(path,fileExtension){
    this.modal.create({
      component: DocumentModalPage,
      componentProps: {
        name: fileExtension,
        path: path,
        folio: this.folio,
        book: this.book,
        contract: this.contract
      }
    }).then(modal => {
      modal.present();
      modal.onDidDismiss().then((data) => {
        console.log("Modal Document close",data);
        this.popover.dismiss(data);
      });
    });
  }

  async noTypeDocument(){
    const alert = await this.alert.create({
      header: 'Documento no aceptado',
      mode: "ios",
      message: 'El formato del documento seleccionado no esta permitido, vuelva a revisar',
      buttons: [{text : 'OK'}]
    });
    await alert.present();
  }


  async errorComponent(type){
    let mensaje: string = "";
    if(type == "Camara"){
      mensaje = "Al parecer no fue posible capturar la foto, revise los permisos y vuelva a intentarlo";
    }
    else if(type == "Video"){
      mensaje ="Al parecer no fue posible capturar el video, revise los permisos y vuelva a intentarlo";
    }
    else if(type == "Base64"){
      mensaje ="Es posible que la extensión archivo multimedia no sea compatible, revise y vuelva a intentarlo";
    }
    else if(type == "Audio"){
      mensaje ="Al parecer no fue posible grabar el audio, revise los permisos y vuelva a intentarlo";
    }
    else{
      mensaje="Al parecer no fue posible seleccionar un archivo, revise los permisos y vuelva a intentarlo";
    }
    const alert = await this.alert.create({
      header: 'Ocurrio un problema',
      mode: "ios",
      message: mensaje,
      buttons: [{text : 'OK',  handler: () => { this.closePopover(); } }]
    });
    await alert.present();

  }

  getBase64StringByFilePath(fileURL): Promise<string> {
    return new Promise((resolve, reject) => {
      let fileName = fileURL.substring(fileURL.lastIndexOf('/') + 1);
      let filePath = fileURL.substring(0, fileURL.lastIndexOf("/") + 1);
      this.file.readAsDataURL(filePath, fileName).then(file64 => {
        resolve(file64);
      }).catch(err => {
        console.log(err);
        reject(err);
      });
    })
  }
}
