import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { LtecTokenService } from '../token/ltec-token.service';
import { OfflineManagerService } from '../offline/ltec-offline-manager.service';
import { NetworkService, ConnectionStatus } from '../network/ltec-network.service';


@Injectable({
  providedIn: 'root'
})
export class LtecRestService {

  private url: string;

  constructor(
    private httpAdvance : HTTP,
    private token: LtecTokenService,
    private offlineManager: OfflineManagerService,
    private networkService: NetworkService,
  ){
    this.url = "https://libro.gestob.cl/api/v1/";
    //this.url = "https://libro.ltec.cl/api/v1/";
    //this.url = "https://ltec.herokuapp.com/api/v1/";
    //this.url = "https://fierce-chamber-49863.herokuapp.com/api/v1/"
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

  contracts(user){
    var data = {
      user_id: user.id
    };
    var header = this.token.getTokenPost();
    return this.httpAdvance.post(this.url+'list_by_user',data,header);
  }

  books(contract){
    var data = {};
    var header = this.token.getTokenGet();
    return this.httpAdvance.get(this.url+'contracts/'+contract.contratoId+'/books',data,header);
  }

  users(contract){
    var data = {};
    var header = this.token.getTokenPost();
    return this.httpAdvance.post(this.url+'lista_usuarios/'+contract.contratoId,data,header);
  }

  folios(contract,book){
    var data = {};
    var header = this.token.getTokenGet();
    return this.httpAdvance.get(this.url+'contracts/'+contract.contratoId+'/books/'+book.id+'/folios',data,header);
  }

  user_info(contract,user){
    var data = {
      contract_id: contract.contratoId,
      user_id: user.id,
    }
    var header = this.token.getTokenPost();
    return this.httpAdvance.post(this.url+'worker_by_user_contract',data,header);
  }

  newFolio(folio, contract, book): any{
    const url = this.url+'contracts/'+contract.contratoId+'/books/'+book.id+'/folios';
    var data = {
      category: folio.categoria,
      subject: folio.asunto,
      priority: folio.prioridad,
      deadline_date: folio.fecha_limite,
      content: folio.contenido,
    }
    var header = this.token.getTokenPost();
    return this.httpAdvance.post(url, data, header);
  }

  newFolioOffline(folio,contract,book): any{
    const url = this.url+'contracts/'+contract.contratoId+'/books/'+book.id+'/folios';
    var data = {
      category: folio.categoria,
      subject: folio.asunto,
      priority: folio.prioridad,
      deadline_date: folio.fecha_limite,
      content: folio.contenido,
    }
    return this.offlineManager.storeRequest(url, "post", data, 'folio', book);
  }

  editFolio(oldFolio,newFolio,contract,book){
    var data = {
      category: newFolio.categoria,
      subject: newFolio.asunto,
      priority: newFolio.prioridad,
      deadline_date: newFolio.fecha_limite,
      content: newFolio.contenido,
    }
    var header = this.token.getTokenPost();
    return this.httpAdvance.patch(this.url+'contracts/'+contract.contratoId+'/books/'+book.id+'/folios/'+oldFolio.id,data,header);
  }

  editFolioOffline(oldFolio,newFolio,contract,book){
    const url = this.url+'contracts/'+contract.contratoId+'/books/'+book.id+'/folios/';
    var data = {
      category: newFolio.categoria,
      subject: newFolio.asunto,
      priority: newFolio.prioridad,
      deadline_date: newFolio.fecha_limite,
      content: newFolio.contenido,
    }
    return this.offlineManager.storeRequestEdit(url,"patch",data,'folio',oldFolio,book);
  }

  archivesFolio(contract,book,folio){
    var data = {};
    var header = this.token.getTokenGet();
    return this.httpAdvance.get(this.url+'contracts/'+contract.contratoId+'/books/'+book.id+'/folios/'+folio.id+'/lista_archivos',data,header);
  }

  uploadPhoto(folio,filename,img){
    var data = {
      filename: filename,
      folio_id: folio.id.toString(),
      id_carpeta_copia: "-1",
    }
    var header = this.token.getTokenUpdateFile();
    return this.httpAdvance.uploadFile(this.url+"folio_pictures",data,header,img,"name");
  }

  uploadVideo(folio,filename,path){
    var data = {
      filename: filename,
      folio_id: folio.id.toString(),
      id_carpeta_copia: "-1",
    }
    var header = this.token.getTokenUpdateFile();
    return this.httpAdvance.uploadFile(this.url+"folio_videos",data,header,path,"name");
  }

  uploadAudio(folio,filename,path){
    var data = {
      filename: filename,
      folio_id: folio.id.toString(),
      id_carpeta_copia: "-1",
    }
    var header = this.token.getTokenUpdateFile();
    return this.httpAdvance.uploadFile(this.url+"folio_audios", data, header,path,"name");
  }

  uploadDocument(folio,filename,path){
    var data = {
      filename: filename,
      folio_id: folio.id.toString(),
      id_carpeta_copia: "-1",
    }
    var header = this.token.getTokenUpdateFile();
    return this.httpAdvance.uploadFile(this.url+"folio_files",data,header,path,"name");
  }

  logout(){
    var data = {};
    var header = this.token.getTokenPost();
    return this.httpAdvance.delete(this.url + "auth/sign_out",data,header);
  }

  agregarFotoContrato(foto,datos,contract){
    var header = this.token.getTokenUpdateFile();
    var data = {
      photo: foto.base64 ,
      nombre: datos.nombre ,
      periodo: datos.fecha
    }
    return this.httpAdvance.post(this.url + "contracts/"+ contract.contratoId +"/gallery_items",data,header);
  }

  obtenerFotoContrato(contract){
    var header = this.token.getTokenUpdateFile();
    var data = {}
    return this.httpAdvance.get(this.url + "contracts/"+ contract.contratoId +"/gallery_items",data,header);
  }

  loadUserAppData(user_id){
    console.log("loadUserAppData...: ", user_id);
    const url = this.url + "user_app_tree";
    var data = {"user_id": user_id};
    var header = this.token.getTokenPost();

    return this.httpAdvance.post(url, data, header);
  }

  sendCoords(formCoords, contrato){
    var data = formCoords;
    var header = this.token.getTokenPost();
    return this.httpAdvance.post(this.url+'contracts/'+contrato.contratoId+'/contract_ubications',data,header);
  }

}
