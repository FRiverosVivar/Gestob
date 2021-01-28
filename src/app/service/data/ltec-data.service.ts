import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { OfflineManagerService, OfflineStatus } from '../offline/ltec-offline-manager.service';
import { JsonPipe } from '@angular/common';

const STORAGE_REQ_KEY = 'ltecOffline';

@Injectable({
  providedIn: 'root'
})
export class LtecDataService {

  user: any;
  contracts: any;
  books: any;
  users: any;
  contract: any;
  folios: any;
  foliosAlert: any;
  book: any;
  userInfo: any;
  isBookSpecialit: boolean = false;
  folio: any;
  list_archives: any;
  foliosOffline : any;
  foliosAlertOffline : any;
  list_archivesOffline: any;

  allData: any;

  chilean_formater = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })
  CATEGORIAS_FOLIO = ["Entrega de documentación", "Notificación", "Solicitud", "Instrucción", "Citación", "Creación de libro", "Creación de usuario", "Anulación", "Rectificación", "Multa", "Entrega terreno", "Recepción provisoria", "Recepción definitiva", "Informa", "Respuesta", "Reiteración", "Constancia","Alta de libro","Incidente"]
  PRIORITY_FOLIO = ["Baja", "Media","Alta"];
  constructor(
    private storage: Storage,
    private offlineService: OfflineManagerService,
  ){
    console.log("Data Service");
  }

  //----------------------------------Datos del Usuario--------------------------------------------
  setUser(userData){
    this.user = {
      is_locked: userData.data.is_locked,
      id: userData.data.id,
      email: userData.data.email,
      avatar: userData.data.avatar,
      name: userData.data.name,
      last_names: userData.data.last_names,
      rut: userData.data.rut,
      phone: userData.data.phone
    }
  }

  getUser(){
    return this.user;
  }

  deleteUser(){
    this.user =  {
      is_locked: "",
      id: "",
      email: "",
      avatar: "",
      name: "",
      last_names: "",
      rut: "",
      phone: "",
    }
    this.contracts = [];
    console.log("Eliminado",this.user);
    console.log("Eliminado",this.contracts);
  }

  setUserInfo(informacion){
    if(informacion.data.boss){
      this.userInfo = {
        bossId : informacion.data.worker.info.boss_id,
        activado: informacion.data.worker.info.enabled,
        tipo: informacion.data.worker.info.worker_type,
        id: informacion.data.worker.info.id,
        bossTipo: informacion.data.boss.info.worker_type
      }
    }
    else{
      this.userInfo = {
        bossId : informacion.data.worker.info.boss_id,
        activado: informacion.data.worker.info.enabled,
        tipo: informacion.data.worker.info.worker_type,
        id: informacion.data.worker.info.id,
        bossTipo: informacion.data.boss,
      }
    }
  }

  getUserInfo(){
    return this.userInfo;
  }

  //-----------------------------------Contratos------------------------------------------------
  setContracts(list_contratos){
    this.contracts = [];
    for(let contract in list_contratos.data){
      var fecha_inicio : string = "";
      var fecha_termino: string = "";
      var fecha_tramitacion: string = "";
      fecha_inicio = list_contratos.data[contract].contrato.start_date;
      fecha_termino = list_contratos.data[contract].contrato.end_date;
      fecha_tramitacion = list_contratos.data[contract].contrato.tramitation_date;
      this.contracts.push({
        libros: null,
        usuarios: null,
        contratoId : list_contratos.data[contract].contrato.id,
        contratoEstado: list_contratos.data[contract].contrato.status,
        contratoSafi: list_contratos.data[contract].contrato.safi,
        contratoNombre: list_contratos.data[contract].contrato.name,
        contratoInicio: this.convertDate(fecha_inicio.substring(0,10)),
        contratoTermino: this.convertDate(fecha_termino.substring(0,10)),
        empresaId: list_contratos.data[contract].empresa.id,
        empresaNombre: list_contratos.data[contract].empresa.name,
        contratoMandante: list_contratos.data[contract].contrato.institution,
        contratoInstitucion: list_contratos.data[contract].contrato.address,
        contratoRegion: list_contratos.data[contract].contrato.region,
        contratoNumeroResolucion: list_contratos.data[contract].contrato.resolution_number,
        contratoTramitacion: this.convertDate(fecha_tramitacion.substring(0,10)),
        contratoPlazo: list_contratos.data[contract].contrato.duration,
        contratoPresupuesto: this.chilean_formater.format(list_contratos.data[contract].contrato.official_price),
        contratoOferta: this.chilean_formater.format(list_contratos.data[contract].contrato.adjudication_value),
        contratoModalidad: list_contratos.data[contract].contrato.modality,
        contratoReajuste: list_contratos.data[contract].contrato.readjust_modality,
        contratoIndiceBase: list_contratos.data[contract].contrato.base_index,
        contratoProvisorioFirmado: list_contratos.data[contract].provisorio_firmado,
        user_info: null,
      });
    }
  }

  getContracts(){
    return this.contracts;
  }

  setContract(contract){
    this.contract = contract;
  }

  getContract(){
    return this.contract;
  }

  //---------------------------------------------Libros-------------------------------------------------
  setBooks(list_libros){
    this.books = [];
    for(let book in list_libros.data){
      if(list_libros.data[book].book_type == 2){
        this.books.push({
          nombre:  list_libros.data[book].title,
          borradores: list_libros.data[book].borradores,
          firmados: list_libros.data[book].pendientes,
          vistos: list_libros.data[book].vistos,
          alertas: list_libros.data[book].alertas,
          id: list_libros.data[book].id,
          codigo: list_libros.data[book].code,
          type: list_libros.data[book].book_type,
          especialista: list_libros.data[book].especialistas,
          folios: null,
        });
      }
      else{
        this.books.push({
          nombre:  list_libros.data[book].title,
          borradores: list_libros.data[book].borradores,
          firmados: list_libros.data[book].pendientes,
          vistos: list_libros.data[book].vistos,
          alertas: list_libros.data[book].alertas,
          id: list_libros.data[book].id,
          codigo: list_libros.data[book].code,
          type: list_libros.data[book].book_type,
          especialista: null,
          folios: null,
        });
      }
    }
  }

  getBooks(){
    return this.books;
  }

  setIsBookSpecialist(book,user){
    this.isBookSpecialit = false;
    if(user != null && book.type == 2){
      for(let i=0; i<book.especialista.length; i++){
        if(Number(book.especialista[i].user_id) == Number(user.id)){
          this.isBookSpecialit = true;
        }
      }
    }
  }

  getIsBookSpecialist(){
    return this.isBookSpecialit;
  }

  setBook(book){
    this.book = book;
  }

  getBook(){
    return this.book;
  }

  setUsers(list_usuarios){
    this.users = [];
    for(let user in list_usuarios.data){

      console.log("BOSS: "+list_usuarios.data[user].boss)

      this.users.push({
        name: list_usuarios.data[user].name,
        last_names: list_usuarios.data[user].last_names,
        email: list_usuarios.data[user].email,
        id: list_usuarios.data[user].id,
        phone: list_usuarios.data[user].phone,
        rut: list_usuarios.data[user].rut,
        boss_name: list_usuarios.data[user].boss_name,
        type: list_usuarios.data[user].worker_type,
        libros: list_usuarios.data[user].libros,
        enabled: list_usuarios.data[user].worker.enabled,
        rol: list_usuarios.data[user].rol,
        boss: list_usuarios.data[user].boss
      })
    }
  }

  getUsers(){
    return this.users;
  }

  //---------------------------------------------Folios-------------------------------------------------
  setFolios(list_folio){
    this.folios = [];
    this.foliosAlert = [];
    for(let folio in list_folio.data){
      var fecha_limite : string = "";
      fecha_limite = list_folio.data[folio].deadline_date;
      if(fecha_limite){
        fecha_limite = this.convertDate(fecha_limite.substring(0,10));
      }
      if(list_folio.data[folio].deadline_date){
        if(!list_folio.data[folio].terminado){
          var d1 = new Date();
          var d2 = new Date(list_folio.data[folio].deadline_date);
          if(d1.getTime() > d2.getTime() && list_folio.data[folio].status != 0){
            this.folios.push({
              categoria: this.CATEGORIAS_FOLIO[list_folio.data[folio].category],
              categoriaNumber: list_folio.data[folio].category,
              codigo: list_folio.data[folio].code,
              contenido: list_folio.data[folio].content,
              number: list_folio.data[folio].folio_number,
              creado: list_folio.data[folio].created_by,
              id: list_folio.data[folio].id,
              prioridad: this.PRIORITY_FOLIO[list_folio.data[folio].priority],
              prioridadNumber: list_folio.data[folio].priority,
              estado: 3,
              referencia: list_folio.data[folio].ref_code,
              fecha_limite: fecha_limite,
              terminado: list_folio.data[folio].terminado,
              asunto: list_folio.data[folio].subject,
              archivos: null,
              online: true,
            });
          }
          else{
            this.folios.push({
              categoria: this.CATEGORIAS_FOLIO[list_folio.data[folio].category],
              categoriaNumber: list_folio.data[folio].category,
              codigo: list_folio.data[folio].code,
              contenido: list_folio.data[folio].content,
              number: list_folio.data[folio].folio_number,
              creado: list_folio.data[folio].created_by,
              id: list_folio.data[folio].id,
              prioridad: this.PRIORITY_FOLIO[list_folio.data[folio].priority],
              prioridadNumber: list_folio.data[folio].priority,
              estado: list_folio.data[folio].status,
              referencia: list_folio.data[folio].ref_code,
              fecha_limite: fecha_limite,
              terminado: list_folio.data[folio].terminado,
              asunto: list_folio.data[folio].subject,
              archivos: null,
              online: true,
            });
          }
        }
        else{
          this.folios.push({
            categoria: this.CATEGORIAS_FOLIO[list_folio.data[folio].category],
            categoriaNumber: list_folio.data[folio].category,
            codigo: list_folio.data[folio].code,
            contenido: list_folio.data[folio].content,
            number: list_folio.data[folio].folio_number,
            creado: list_folio.data[folio].created_by,
            id: list_folio.data[folio].id,
            prioridad: this.PRIORITY_FOLIO[list_folio.data[folio].priority],
            prioridadNumber: list_folio.data[folio].priority,
            estado: list_folio.data[folio].status,
            referencia: list_folio.data[folio].ref_code,
            fecha_limite: fecha_limite,
            terminado: list_folio.data[folio].terminado,
            asunto: list_folio.data[folio].subject,
            archivos: null,
            online: true,
          });
        }
      }
      else{
        this.folios.push({
          categoria: this.CATEGORIAS_FOLIO[list_folio.data[folio].category],
          categoriaNumber: list_folio.data[folio].category,
          codigo: list_folio.data[folio].code,
          contenido: list_folio.data[folio].content,
          number: list_folio.data[folio].folio_number,
          creado: list_folio.data[folio].created_by,
          id: list_folio.data[folio].id,
          prioridad: this.PRIORITY_FOLIO[list_folio.data[folio].priority],
          prioridadNumber: list_folio.data[folio].priority,
          estado: list_folio.data[folio].status,
          referencia: list_folio.data[folio].ref_code,
          fecha_limite: fecha_limite,
          terminado: list_folio.data[folio].terminado,
          asunto: list_folio.data[folio].subject,
          archivos: null,
          online: true,
        });
      }
      
      
      if(list_folio.data[folio].deadline_date){
        if(!list_folio.data[folio].terminado){
          var d1 = new Date();
          var d2 = new Date(list_folio.data[folio].deadline_date);
          if(d1.getTime() > d2.getTime() && list_folio.data[folio].status != 0){
            this.foliosAlert.push({
              categoria: this.CATEGORIAS_FOLIO[list_folio.data[folio].category],
              categoriaNumber: list_folio.data[folio].category,
              codigo: list_folio.data[folio].code,
              contenido: list_folio.data[folio].content,
              number: list_folio.data[folio].folio_number,
              creado: list_folio.data[folio].created_by,
              id: list_folio.data[folio].id,
              prioridad: this.PRIORITY_FOLIO[list_folio.data[folio].priority],
              prioridadNumber: list_folio.data[folio].priority,
              estado: list_folio.data[folio].status,
              referencia: list_folio.data[folio].ref_code,
              fecha_limite: fecha_limite,
              terminado: list_folio.data[folio].terminado,
              asunto: list_folio.data[folio].subject,
              archivos: null,
              online: true,
            });
          }
        }
      }
    }
  }

  getFolios(){
    return this.folios;
  }

  getFoliosAlert(){
    return this.foliosAlert;
  }

  setFolio(folio){
    this.folio = folio;
  }

  getFolio(){
    return this.folio
  }

  setNewFolio(folio){
    var fecha_limite : string = "";
    fecha_limite = folio.data.deadline_date;
    if(fecha_limite){
      fecha_limite = this.convertDate(fecha_limite.substring(0,10));
    }
    this.folio = {
      categoria: this.CATEGORIAS_FOLIO[folio.data.category],
      categoriaNumber: folio.data.category,
      codigo: folio.data.code,
      contenido: folio.data.content,
      number: folio.data.folio_number,
      creado: folio.data.created_by,
      id: folio.data.id,
      prioridad: this.PRIORITY_FOLIO[folio.data.priority],
      prioridadNumber: folio.data.priority,
      estado: folio.data.status,
      referencia: folio.data.ref_code,
      fecha_limite: fecha_limite,
      terminado: folio.data.terminado,
      asunto: folio.data.subject,
      archivos: null,
      online: true,
    }
  }

  setArchives(list_archives){
    if(!list_archives){
      this.list_archives = {
        imagenes : [],
        videos: [],
        audios: [],
        archivos: []
      }
    }
    else {
      this.list_archives = {
        imagenes : list_archives.data.imagenes,
        videos: list_archives.data.videos,
        audios: list_archives.data.audios,
        archivos: list_archives.data.archivos
      }
    }
  }

  getArchives(){
    return this.list_archives;
  }



  //-------------------------------------Formato fecha--------------------------------------------------------------
  convertDate(dateString){
    if(dateString){
      var p = dateString.split(/\D/g)
      return [p[2],p[1],p[0] ].join("-")
    }
    else{
      return null;
    }
  }


  //---------------------------------------Tratamiento de la Data OFFLINE---------------------------------------------
  setAllData(allData){
    this.allData = allData;
  }

  getAllData(){
    return this.allData;
  }

  setContractsOffline(list_contratos){
    this.contracts = [];
    console.log(list_contratos);
    if(list_contratos.data){
      for(let contract in list_contratos.data.contratos){
        var fecha_inicio : string = "";
        var fecha_termino: string = "";
        var fecha_tramitacion: string = "";
        fecha_inicio = list_contratos.data.contratos[contract].contrato.start_date;
        fecha_termino = list_contratos.data.contratos[contract].contrato.end_date;
        fecha_tramitacion = list_contratos.data.contratos[contract].contrato.tramitation_date;
        this.contracts.push({
          libros: list_contratos.data.contratos[contract].libros,
          usuarios: list_contratos.data.contratos[contract].usuarios,
          contratoId : list_contratos.data.contratos[contract].contrato.id,
          contratoEstado: list_contratos.data.contratos[contract].contrato.status,
          contratoSafi: list_contratos.data.contratos[contract].contrato.safi,
          contratoNombre: list_contratos.data.contratos[contract].contrato.name,
          contratoInicio: this.convertDate(fecha_inicio.substring(0,10)),
          contratoTermino: this.convertDate(fecha_termino.substring(0,10)),
          empresaId: list_contratos.data.contratos[contract].empresa.id,
          empresaNombre: list_contratos.data.contratos[contract].empresa.name,
          contratoMandante: list_contratos.data.contratos[contract].contrato.institution,
          contratoInstitucion: list_contratos.data.contratos[contract].contrato.address,
          contratoRegion: list_contratos.data.contratos[contract].contrato.region,
          contratoNumeroResolucion: list_contratos.data.contratos[contract].contrato.resolution_number,
          contratoTramitacion: this.convertDate(fecha_tramitacion.substring(0,10)),
          contratoPlazo: list_contratos.data.contratos[contract].contrato.duration,
          contratoPresupuesto: this.chilean_formater.format(list_contratos.data.contratos[contract].contrato.official_price),
          contratoOferta: this.chilean_formater.format(list_contratos.data.contratos[contract].contrato.adjudication_value),
          contratoModalidad: list_contratos.data.contratos[contract].contrato.modality,
          contratoReajuste: list_contratos.data.contratos[contract].contrato.readjust_modality,
          contratoIndiceBase: list_contratos.data.contratos[contract].contrato.base_index,
          contratoProvisorioFirmado: list_contratos.data.contratos[contract].provisorio_firmado,
          user_info: list_contratos.data.contratos[contract].rol_usuario,
        });
      }
    }
    else{
      for(let contract in this.allData.data.contratos){
        var fecha_inicio : string = "";
        var fecha_termino: string = "";
        var fecha_tramitacion: string = "";
        fecha_inicio = this.allData.data.contratos[contract].contrato.start_date;
        fecha_termino = this.allData.data.contratos[contract].contrato.end_date;
        fecha_tramitacion = this.allData.data.contratos[contract].contrato.tramitation_date;
        this.contracts.push({
          libros: this.allData.data.contratos[contract].libros,
          usuarios: this.allData.data.contratos[contract].usuarios,
          contratoId : this.allData.data.contratos[contract].contrato.id,
          contratoEstado: this.allData.data.contratos[contract].contrato.status,
          contratoSafi: this.allData.data.contratos[contract].contrato.safi,
          contratoNombre: this.allData.data.contratos[contract].contrato.name,
          contratoInicio: this.convertDate(fecha_inicio.substring(0,10)),
          contratoTermino: this.convertDate(fecha_termino.substring(0,10)),
          empresaId: this.allData.data.contratos[contract].empresa.id,
          empresaNombre: this.allData.data.contratos[contract].empresa.name,
          contratoMandante: this.allData.data.contratos[contract].contrato.institution,
          contratoInstitucion: this.allData.data.contratos[contract].contrato.address,
          contratoRegion: this.allData.data.contratos[contract].contrato.region,
          contratoNumeroResolucion: this.allData.data.contratos[contract].contrato.resolution_number,
          contratoTramitacion: this.convertDate(fecha_tramitacion.substring(0,10)),
          contratoPlazo: this.allData.data.contratos[contract].contrato.duration,
          contratoPresupuesto: this.chilean_formater.format(this.allData.data.contratos[contract].contrato.official_price),
          contratoOferta: this.chilean_formater.format(this.allData.data.contratos[contract].contrato.adjudication_value),
          contratoModalidad: this.allData.data.contratos[contract].contrato.modality,
          contratoReajuste: this.allData.data.contratos[contract].contrato.readjust_modality,
          contratoIndiceBase: this.allData.data.contratos[contract].contrato.base_index,
          contratoProvisorioFirmado: this.allData.data.contratos[contract].provisorio_firmado,
          user_info: this.allData.data.contratos[contract].rol_usuario,
        });
      }
    }
  }

  setBooksOffline(list_books){
    this.books = [];
    for(let book in list_books){
      if(list_books[book].book_type == 2){
        this.books.push({
          nombre:  list_books[book].title,
          borradores: list_books[book].borradores,
          firmados: list_books[book].pendientes,
          vistos: list_books[book].vistos,
          alertas: list_books[book].alertas,
          id: list_books[book].id,
          codigo: list_books[book].code,
          type: list_books[book].book_type,
          especialista: list_books[book].especialistas,
          folios: list_books[book].folios,
        });
      }
      else{
        this.books.push({
          nombre: list_books[book].title,
          borradores: list_books[book].borradores,
          firmados: list_books[book].pendientes,
          vistos: list_books[book].vistos,
          alertas: list_books[book].alertas,
          id: list_books[book].id,
          codigo: list_books[book].code,
          type: list_books[book].book_type,
          especialista: null,
          folios: list_books[book].folios,
        });
      }
    }
  }

  setUsersOffline(list_users){
    this.users = [];
    for(let user in list_users){
      this.users.push({
        name: list_users[user].name,
        last_names: list_users[user].last_names,
        email: list_users[user].email,
        id: list_users[user].id,
        phone: list_users[user].phone,
        rut: list_users[user].rut,
        boss_name: list_users[user].boss_name,
        type: list_users[user].worker_type,
        libros: list_users[user].libros,
        enabled: list_users[user].worker.enabled,
      })
    }
  }

  setFoliosDontCloud(book){
    this.foliosOffline = []
    this.foliosAlertOffline = []
    this.storage.get(STORAGE_REQ_KEY).then((res) => {
      if(res){
        for(let data of JSON.parse(res)){
          if(data.type == "post" && data.tipo == "folio" && data.book == book.id){
            var fecha_limite : string = "";
            fecha_limite = data.data.deadline_date;
            if(fecha_limite){
              fecha_limite = this.convertDate(fecha_limite.substring(0,10));
            }
            this.foliosOffline.push({
              categoria: this.CATEGORIAS_FOLIO[data.data.category],
              categoriaNumber: data.data.category,
              codigo: "",
              contenido: data.data.content,
              number: "",
              creado: "",
              id: data.id,
              prioridad: this.PRIORITY_FOLIO[data.data.priority],
              prioridadNumber: data.data.priority,
              estado: 0,
              referencia: "",
              fecha_limite: fecha_limite,
              terminado: "",
              asunto: data.data.subject,
              archivos: data.archives,
              online: false,
            });
      
            if(data.data.deadline_date){
              if(!data.data.terminado){
                var d1 = new Date();
                var d2 = new Date(data.data.deadline_date);
                if(d1.getTime() > d2.getTime()){
                  this.foliosAlertOffline.push({
                    categoria: this.CATEGORIAS_FOLIO[data.data.category],
                    categoriaNumber: data.data.category,
                    codigo: "",
                    contenido: data.data.content,
                    number: "",
                    creado: "",
                    id: data.id,
                    prioridad: this.PRIORITY_FOLIO[data.data.priority],
                    prioridadNumber: data.data.priority,
                    estado: 0,
                    referencia: "",
                    fecha_limite: fecha_limite,
                    terminado: "",
                    asunto: data.data.subject,
                    archivos: data.archives,
                    online: false,
                  });
                }
              }
            }
          }
        }
      }
    });
  }

  getFoliosDontCloud(){
    return this.foliosOffline;
  }

  getFoliosDontCloudAlert(){
    return this.foliosAlertOffline;
  }

  setFoliosOffline(list_folio){
    this.folios = [];
    this.foliosAlert = [];
    if(this.folios.length == 0 && this.foliosAlert == 0){
      for(let folio in list_folio){
        var fecha_limite : string = "";
        fecha_limite = list_folio[folio].folio.deadline_date;
        if(fecha_limite){
          fecha_limite = this.convertDate(fecha_limite.substring(0,10));
        }
        if(list_folio[folio].folio.deadline_date){
          if(!list_folio[folio].folio.terminado){
            var d1 = new Date();
            var d2 = new Date(list_folio[folio].folio.deadline_date);
            if(d1.getTime() > d2.getTime() && list_folio[folio].folio.status != 0){
              this.folios.push({
                categoria: this.CATEGORIAS_FOLIO[list_folio[folio].folio.category],
                categoriaNumber: list_folio[folio].folio.category,
                codigo: list_folio[folio].folio.code,
                contenido: list_folio[folio].folio.content,
                number: list_folio[folio].folio.folio_number,
                creado: list_folio[folio].folio.created_by,
                id: list_folio[folio].folio.id,
                prioridad: this.PRIORITY_FOLIO[list_folio[folio].folio.priority],
                prioridadNumber: list_folio[folio].folio.priority,
                estado: 3,
                referencia: list_folio[folio].folio.ref_code,
                fecha_limite: fecha_limite,
                terminado: list_folio[folio].folio.terminado,
                asunto: list_folio[folio].folio.subject,
                archivos: list_folio[folio].archivos,
                online: true,
              });
            }
            else{
              this.folios.push({
                categoria: this.CATEGORIAS_FOLIO[list_folio[folio].folio.category],
                categoriaNumber: list_folio[folio].folio.category,
                codigo: list_folio[folio].folio.code,
                contenido: list_folio[folio].folio.content,
                number: list_folio[folio].folio.folio_number,
                creado: list_folio[folio].folio.created_by,
                id: list_folio[folio].folio.id,
                prioridad: this.PRIORITY_FOLIO[list_folio[folio].folio.priority],
                prioridadNumber: list_folio[folio].folio.priority,
                estado: list_folio[folio].folio.status,
                referencia: list_folio[folio].folio.ref_code,
                fecha_limite: fecha_limite,
                terminado: list_folio[folio].folio.terminado,
                asunto: list_folio[folio].folio.subject,
                archivos: list_folio[folio].archivos,
                online: true,
              });
            }
          }
          else{
            this.folios.push({
              categoria: this.CATEGORIAS_FOLIO[list_folio[folio].folio.category],
              categoriaNumber: list_folio[folio].folio.category,
              codigo: list_folio[folio].folio.code,
              contenido: list_folio[folio].folio.content,
              number: list_folio[folio].folio.folio_number,
              creado: list_folio[folio].folio.created_by,
              id: list_folio[folio].folio.id,
              prioridad: this.PRIORITY_FOLIO[list_folio[folio].folio.priority],
              prioridadNumber: list_folio[folio].folio.priority,
              estado: list_folio[folio].folio.status,
              referencia: list_folio[folio].folio.ref_code,
              fecha_limite: fecha_limite,
              terminado: list_folio[folio].folio.terminado,
              asunto: list_folio[folio].folio.subject,
              archivos: list_folio[folio].archivos,
              online: true,
            });
          }
        }
        else{
          this.folios.push({
            categoria: this.CATEGORIAS_FOLIO[list_folio[folio].folio.category],
            categoriaNumber: list_folio[folio].folio.category,
            codigo: list_folio[folio].folio.code,
            contenido: list_folio[folio].folio.content,
            number: list_folio[folio].folio.folio_number,
            creado: list_folio[folio].folio.created_by,
            id: list_folio[folio].folio.id,
            prioridad: this.PRIORITY_FOLIO[list_folio[folio].folio.priority],
            prioridadNumber: list_folio[folio].folio.priority,
            estado: list_folio[folio].folio.status,
            referencia: list_folio[folio].folio.ref_code,
            fecha_limite: fecha_limite,
            terminado: list_folio[folio].folio.terminado,
            asunto: list_folio[folio].folio.subject,
            archivos: list_folio[folio].archivos,
            online: true,
          });
        }
      
        if(list_folio[folio].folio.deadline_date){
          if(!list_folio[folio].folio.terminado){
            var d1 = new Date();
            var d2 = new Date(list_folio[folio].folio.deadline_date);
            if(d1.getTime() > d2.getTime()){
              this.foliosAlert.push({
                categoria: this.CATEGORIAS_FOLIO[list_folio[folio].folio.category],
                categoriaNumber: list_folio[folio].folio.category,
                codigo: list_folio[folio].folio.code,
                contenido: list_folio[folio].folio.content,
                number: list_folio[folio].folio.folio_number,
                creado: list_folio[folio].folio.created_by,
                id: list_folio[folio].folio.id,
                prioridad: this.PRIORITY_FOLIO[list_folio[folio].folio.priority],
                prioridadNumber: list_folio[folio].folio.priority,
                estado: list_folio[folio].folio.status,
                referencia: list_folio[folio].folio.ref_code,
                fecha_limite: fecha_limite,
                terminado: list_folio[folio].folio.terminado,
                asunto: list_folio[folio].folio.subject,
                archivos: list_folio[folio].archivos,
                online: true,
              });
            }
          }
        }
      }
    }
  }

  setUserInfoOffline(info_user){
    if(info_user.boss){
      this.userInfo = {
        bossId : info_user.worker.info.boss_id,
        activado: info_user.worker.info.enabled,
        tipo: info_user.worker.info.worker_type,
        id: info_user.worker.info.id,
        bossTipo: info_user.boss.info.worker_type
      }
    }
    else{
      this.userInfo = {
        bossId : info_user.worker.info.boss_id,
        activado: info_user.worker.info.enabled,
        tipo: info_user.worker.info.worker_type,
        id:info_user.worker.info.id,
        bossTipo: info_user.boss,
      }
    }
  }

  setArchivesOffline(archives){
    if(archives == null){
      this.list_archives = {
        imagenes : [],
        videos: [],
        audios: [],
        archivos: []
      }
    }
    else {
      this.list_archives = {
        imagenes : archives.imagenes,
        videos: archives.videos,
        audios: archives.audios,
        archivos: archives.archivos
      }
    }
  }

  setArchivesNoCloud(folio){
    console.log("Voy a setear los archivos folios")
    this.list_archivesOffline = {
      imagenes : [],
      videos: [],
      audios: [],
      archivos: []
    }
    this.storage.get(STORAGE_REQ_KEY).then((res) => {
      if(res){
        for(let data of JSON.parse(res)){
          if(data.tipo == "img" || data.tipo == "video" || data.tipo == "audio" || data.tipo == "archivo"){
            if(data.folio == folio.id){
              if(data.tipo == "img"){
                this.list_archivesOffline.imagenes.push({filename: data.data.filename});
              }
              else if(data.tipo == "video"){
                this.list_archivesOffline.videos.push({filename: data.data.filename});
              }
              else if(data.tipo == "audio"){
                this.list_archivesOffline.audios.push({filename: data.data.filename});
              }
              else{
                this.list_archivesOffline.archivos.push({filename: data.data.filename});
              }
            }
          }
        }
      }
    }); 
  }

  getArchivesNoCloud(){
    return this.list_archivesOffline;
  }

  setNewFolioOffline(folio){
    var fecha_limite : string = "";
    fecha_limite = folio.data.deadline_date;
    if(fecha_limite){
      fecha_limite = this.convertDate(fecha_limite.substring(0,10));
    }
    this.folio = {
      categoria: this.CATEGORIAS_FOLIO[folio.data.category],
      categoriaNumber: folio.data.category,
      codigo: "",
      contenido: folio.data.content,
      number: "",
      creado: "",
      id: folio.id,
      prioridad: this.PRIORITY_FOLIO[folio.data.priority],
      prioridadNumber: folio.data.priority,
      estado: 0,
      referencia: "",
      fecha_limite: fecha_limite,
      terminado: "",
      asunto: folio.data.subject,
      archivos: null,
      online: false,
    }
  }

}
