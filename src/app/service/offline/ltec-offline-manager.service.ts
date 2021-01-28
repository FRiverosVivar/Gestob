import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http/ngx';
import { ToastController, LoadingController } from '@ionic/angular';
import { LtecTokenService } from '../token/ltec-token.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
//import { LtecRestService } from '../rest/ltec-rest.service';

const STORAGE_REQ_KEY = 'ltecOffline';
const TOKEN_KEY_LTEC = 'auth-token-ltec';

export enum OfflineStatus {
  Actualizado,
  Pendientes
}

interface StoredRequest {
  url: string,
  type: string,
  data: any,
  time: number,
  tipo: string,
  book: string,
  id: string,
  archives: {
    imagenes: [],
    videos: [],
    audios:  [],
    archivos: [],
  },
}

interface StoredRequestArchive {
  url: string,
  type: string,
  data: any,
  time: number,
  tipo: string,
  folio: string,
  id: string
}

@Injectable({
  providedIn: 'root'
})
export class OfflineManagerService {

  private status: BehaviorSubject<OfflineStatus> = new BehaviorSubject(OfflineStatus.Actualizado);

  objNew: any;

  load: HTMLIonLoadingElement = null;

  url:any;

  constructor(
    private httpAdvance : HTTP,
    private tokenService: LtecTokenService,
    //private restService: LtecRestService,
    private storage: Storage,
    private toastController: ToastController,
    private loading: LoadingController,
    private router: Router
  ) {
    this.url = "https://libro.gestob.cl/api/v1/";
    //this.url = "https://libro.ltec.cl/api/v1/";
    //this.url = "https://fierce-chamber-49863.herokuapp.com/api/v1/"
    this.storage.get(STORAGE_REQ_KEY).then((res) => {
      console.log("OfflineManagerService constructor: ", JSON.stringify(res));
      let storedObj = JSON.parse(res);
      let status =  !!storedObj ? OfflineStatus.Pendientes : OfflineStatus.Actualizado;
      this.status.next(status);
    });
  }

  // guardo request en storage para luego subirla cuando tenga net
  storeRequest(url, type, data, tipo, book): any {
    let action: StoredRequest = {
      url: url,
      type: type,
      data: data,
      time: new Date().getTime(),
      tipo: tipo,
      book: book.id,
      id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
      archives: {
        imagenes: [],
        videos: [],
        audios:  [],
        archivos: [],
      },
    };

    this.objNew = action;

    this.storage.get(STORAGE_REQ_KEY).then((res) => {
      let storedObj = JSON.parse(res);

      if (storedObj) {
        storedObj.push(action);
      }
      else {
        storedObj = [action];
      }

      console.log("storeRequest: ", storedObj);

      this.storage.set(STORAGE_REQ_KEY, JSON.stringify(storedObj)).then((set) => {
        let toast = this.toastController.create({
          message: "Información guardada locamente, se subirá apenas posea conexión a internet",
          duration: 2000,
          position: 'bottom'
        });
        toast.then(toast => toast.present());
        this.updateOfflineStatus(OfflineStatus.Pendientes);
        return new Promise((resolve) => resolve({offline: set, data: "se guardo bien offline"}));
      })
    });
  }

  storeRequestEdit(url, type, data, tipo, oldFolio, book): any {
    let action: StoredRequest = {
      url: url,
      type: type,
      data: data,
      time: new Date().getTime(),
      tipo: tipo,
      book: book.id,
      id: oldFolio.id,
      archives: oldFolio.archivos,
    };

    this.objNew = action;

    this.storage.get(STORAGE_REQ_KEY).then((res) => {
      let storedObj = JSON.parse(res);

      if (storedObj) {
        storedObj.push(action);
      }
      else {
        storedObj = [action];
      }

      console.log("storeRequest: ", storedObj);

      this.storage.set(STORAGE_REQ_KEY, JSON.stringify(storedObj)).then((set) => {
        this.updateOfflineStatus(OfflineStatus.Pendientes);
        return new Promise((resolve) => resolve({offline: set, data: "se guardo bien offline"}));
      })
    });
  }

  async sendRequests(){
    let folios = 0;
    let contador = 0

    await this.loading.create({
      message: "Preparando información pendientes...",
      spinner: "dots",
      cssClass: 'loading-Custom',
    }).then((load: HTMLIonLoadingElement) => {
      this.load = load;
      this.load.present();
    });

    //Pegamos un login para que tengamos el token
    this.storage.get(TOKEN_KEY_LTEC).then(res => {
      console.log("Estan las creedenciales del usuario: ", JSON.stringify(res));
      this.login(res.email,res.password).then((data) => {
        console.log("la data que retorna del Login() es: ", JSON.stringify(data));
        let header = data.headers;
        this.tokenService.setToken(header);

        // Una vez que tengamos token nos vamos a revisar la data offline
        this.storage.get(STORAGE_REQ_KEY).then((offLineData) => {
          var storedObj: any = JSON.parse(offLineData);
          folios = storedObj.length;

          //Aqui subo todos los folios pendientes
          for(let data of storedObj){
            if(data.type == "post" && data.tipo == "folio"){
              var header = this.tokenService.getTokenPost();
              var options = {
                method: data.type,
                data: data.data,
                headers: header
              }
              this.httpAdvance.sendRequest(data.url, options).then((res) => {
                console.log("offlineManager httpAdvance.sendRequest ficha: ", JSON.stringify(res.data));
                let response = JSON.parse(res.data);
                console.log(data.archives);
                if(data.archives.imagenes.length > 0 || data.archives.videos.length > 0 || data.archives.audios.length > 0 || data.archives.archivos.legth > 0){
                  this.setIDArchive(response,data);
                  this.tokenService.setToken(res.headers);
                  contador++;
                  this.load.message = "Subiendo información "+contador+" / "+folios;
                  console.log("contador",contador);
                  console.log("folios",folios);
                  //Se subieron todos los folios guardados
                  if(contador == folios){
                    this.load.message = "Información subida correctamente";
                    this.storage.set(STORAGE_REQ_KEY, null).then((res) => {
                      console.log("Se borro el storage de pendientes",res);
                      this.load.dismiss();
                      // se cambia el estado a actualizado para borar el toast
                      this.updateOfflineStatus(OfflineStatus.Actualizado);
                    },(error) => console.log("error al guardar en storage: ", JSON.stringify(error)));
                  }
                }
                else{
                  this.tokenService.setToken(res.headers);
                  contador++;
                  this.load.message = "Subiendo información "+contador+" / "+folios;
                  console.log("contador",contador);
                  console.log("folios",folios);
                  //Se subieron todos los folios guardados
                  if(contador == folios){
                    this.load.message = "Información subida correctamente";
                    this.storage.set(STORAGE_REQ_KEY, null).then((res) => {
                      console.log("Se borro el storage de pendientes",res);
                      setTimeout(() =>{
                        this.load.dismiss();
                        this.router.navigate(['tabs/tabs/contract'],{});
                        // se cambia el estado a actualizado para borar el toast
                        this.updateOfflineStatus(OfflineStatus.Actualizado);
                      },2000);
                    },(error) => console.log("error al guardar en storage: ", JSON.stringify(error)));
                  }
                }
              },
              (error) => {
                this.loading.dismiss();
                console.log(error);
              });
            }
          }
          //Aqui se suben los archivos
          setTimeout(() => {
            this.storage.get(STORAGE_REQ_KEY).then((offLineData) => {
              var storedObj: any = JSON.parse(offLineData);
              console.log(storedObj);
              for(let data of storedObj){
                if(data.tipo == "img" ||  data.tipo == "video" || data.tipo == "audio" || data.tipo == "archivo"){
                  var header = this.tokenService.getTokenUpdateFile();
                  var info = {
                    filename: data.data.filename,
                    folio_id: data.data.folio_id.toString(),
                    id_carpeta_copia: "-1",
                  }
                  console.log("El archivo a subir",data);
                  this.httpAdvance.uploadFile(data.url,info,header,data.data.name,"name").then((res) => {
                    console.log("offlineManager httpAdvance.sendRequest archivo: ", JSON.stringify(res.data));
                    let response = JSON.parse(res.data);
                    console.log(response)
                    this.tokenService.setToken(res.headers);
                    contador++;
                    this.load.message = "Subiendo información "+contador+" / "+folios;
                    //Se subieron todos los folios guardados
                    console.log("contador",contador);
                    console.log("folios",folios);
                    if(contador == folios){
                      this.load.message = "Información subida correctamente";
                      this.storage.set(STORAGE_REQ_KEY, null).then((res) => {
                        this.load.message = "Redireccionando al inicio";
                        console.log("Se borro el storage de pendientes",res);
                        setTimeout(() =>{
                          this.load.dismiss();
                          this.router.navigate(['tabs/tabs/contract'],{});
                          // se cambia el estado a actualizado para borar el toast
                          this.updateOfflineStatus(OfflineStatus.Actualizado);
                        },2000);
                      },(error) => console.log("error al guardar en storage: ", JSON.stringify(error)));
                    }
                  },
                  (error) => {
                    this.loading.dismiss();
                    console.log(error);
                  });
                }
              }
            })
          },2000*folios);
        });
      })
    })
  }

  private async updateOfflineStatus(status: OfflineStatus) {
    this.status.next(status);
  }

  public onStatusChange(): Observable<OfflineStatus> {
    return this.status.asObservable();
  }

  public getCurrentOfflineStatus(): OfflineStatus {
    return this.status.getValue();
  }

  public toastUpdate() {
    if(this.getCurrentOfflineStatus() == OfflineStatus.Pendientes){
      let toast = this.toastController.create({
        message: 'Información por sincronizar.',
        position: 'top',
        buttons: [{
          side: 'end',
          icon: 'cloud-upload',
          text: 'subir',
          handler: () => {
            console.log('data pendiente enviando...');
            this.sendRequests();
          }
        }]
      });
      toast.then(toast => toast.present());
    }
    else{
      this.loading.create({
        message: "Conectandose con el servidor...",
        spinner: "dots",
        cssClass: 'loading-Custom',
      }).then((load: HTMLIonLoadingElement) => {
        this.load = load;
        this.load.present();
      });

       //Pegamos un login para que tengamos el token
      this.storage.get(TOKEN_KEY_LTEC).then(res => {
        console.log("Estan las creedenciales del usuario: ", JSON.stringify(res));
        this.login(res.email,res.password).then((data) => {
          console.log("la data que retorna del Login() es: ", JSON.stringify(data));
          this.load.message = "Conectado correctamente";
          let header = data.headers;
          this.tokenService.setToken(header);
          setTimeout(() => {
            this.loading.dismiss();
          },1000);
        },(error) => {
          console.log(error);
          this.load.message = "No fue posible conectar";
          setTimeout(() => {
            this.loading.dismiss();
          },1000);
        });
      });
    }
  }

  getObjectNew(){
    return this.objNew;
  }

  setRequest(oldData, newData) : any {
    this.storage.get(STORAGE_REQ_KEY).then((res) => {
      let storedObj = JSON.parse(res);
      for(let data in storedObj){
        if(storedObj[data].id == oldData.id){
          storedObj[data].data.category = newData.categoria
          storedObj[data].data.content = newData.contenido
          storedObj[data].data.priority = newData.prioridad
          storedObj[data].data.deadline_date = newData.fecha_limite
          storedObj[data].data.subject = newData.asunto
        }
      }
      console.log("Cambiado previo al set",storedObj);
      this.storage.set(STORAGE_REQ_KEY, JSON.stringify(storedObj)).then((set) => {
        console.log(set);
        this.updateOfflineStatus(OfflineStatus.Pendientes);
        return new Promise((resolve) => resolve({offline: set, data: "se guardo bien offline"}));
      });
    });
  }

  login(email,password){
    var data : any;
    var header : any;
    header = {
      'Content-Type' : 'application/json'
    };
    data = {
      'email': email.toLowerCase(),
      'password': password,
    }
    this.httpAdvance.setDataSerializer('json');
    console.log("se intenta logear un cliente con: " + JSON.stringify(data));
    return this.httpAdvance.post(this.url + "auth/sign_in", data , header);
  }

  storeRequestArchive(folio,imagen,nombre,tipo,url,online): any{
    var data = {
      filename: nombre,
      folio_id: folio.id.toString(),
      name: imagen,
      id_carpeta_copia: "-1",
    }
    let action: StoredRequestArchive = {
      url: url,
      type: 'post',
      data: data,
      time: new Date().getTime(),
      tipo: tipo,
      folio: folio.id,
      id: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
    };
    this.storage.get(STORAGE_REQ_KEY).then((res) => {
      let storedObj = JSON.parse(res);

      if (storedObj) {
        storedObj.push(action);
      }
      else {
        storedObj = [action];
      }

      console.log("storeRequest: ", storedObj);

      let mensaje = "";
      if(action.tipo == "video"){
        mensaje = "Video guardado localmente"
      }
      else if(action.tipo == "audio"){
        mensaje = "Audio guardado localmente"
      }
      else if(action.tipo == "archivo"){
        mensaje = "Archivo guardado localmente"
      }
      else{
        mensaje = "Foto guardado localmente"
      }
      this.storage.set(STORAGE_REQ_KEY, JSON.stringify(storedObj)).then((set) => {
        let toast = this.toastController.create({
          message: mensaje,
          duration: 2000,
          position: 'bottom'
        });
        toast.then(toast => toast.present());
        this.updateOfflineStatus(OfflineStatus.Pendientes);
        if(!online){
          this.updateFolioOffline(folio,action);
        }
        return new Promise((resolve) => resolve({offline: set, data: "se guardo bien offline"}));
      })
    });
  }

  updateFolioOffline(folio,action){
    this.storage.get(STORAGE_REQ_KEY).then((res) => {
      let storedObj = JSON.parse(res);
      for(let data in storedObj){
        if(storedObj[data].type == "post" && storedObj[data].id == folio.id){
          if(action.tipo == "img"){
            storedObj[data].archives.imagenes.push({filename: action.data.filename});
          }
          else if(action.tipo == "video"){
            storedObj[data].archives.videos.push({filename: action.data.filename});
          }
          else if(action.tipo == "audio"){
            storedObj[data].archives.audios.push({filename: action.data.filename});
          }
          else{
            storedObj[data].archives.archivos.push({filename: action.data.filename});
          }
        }
      }
      this.storage.set(STORAGE_REQ_KEY, JSON.stringify(storedObj)).then((set) => {
        console.log(set);
        this.updateOfflineStatus(OfflineStatus.Pendientes);
        return new Promise((resolve) => resolve({offline: set, data: "se guardo bien offline"}));
      });
    })
  }

  setIDArchive(folioServer,folioLocal){
    this.storage.get(STORAGE_REQ_KEY).then((res) => {
      let storedObj = JSON.parse(res);
      for(let data in storedObj){
        if( storedObj[data].tipo == "img" ||  storedObj[data].tipo == "video" ||  storedObj[data].tipo == "audio" ||  storedObj[data].tipo == "archivo"){
          if(storedObj[data].folio == folioLocal.id){
            storedObj[data].data.folio_id = folioServer.data.id;
          }
        }
      }
      this.storage.set(STORAGE_REQ_KEY, JSON.stringify(storedObj)).then((set) => {
        console.log(set);
        this.updateOfflineStatus(OfflineStatus.Pendientes);
        return new Promise((resolve) => resolve({offline: set, data: "se guardo bien offline"}));
      });
    });
  }
}
