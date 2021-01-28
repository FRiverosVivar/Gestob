import { Component, OnInit } from '@angular/core';
import { LtecDataService } from 'src/app/service/data/ltec-data.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { LtecRestService } from 'src/app/service/rest/ltec-rest.service';
import { LtecTokenService } from 'src/app/service/token/ltec-token.service';
import { NetworkService, ConnectionStatus } from 'src/app/service/network/ltec-network.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-folio',
  templateUrl: './folio.page.html',
  styleUrls: ['./folio.page.scss'],
})
export class FolioPage implements OnInit {

  contract : any;
  book: any;
  folios: any;
  select: string = "all";
  foliosAlert: any;
  user: any;
  foliosOffline: any;
  foliosAlertOffline: any;

  constructor(
    private dataService: LtecDataService,
    private router: Router,
    public loading: LoadingController,
    private restService: LtecRestService,
    private tokenService: LtecTokenService,
    public alert: AlertController,
    private activateRoute :ActivatedRoute,
    private networkService: NetworkService,
    private storage: Storage,
  ) {
    this.activateRoute.params.subscribe(val => {
      console.log(val);
      this.contract = this.dataService.getContract();
      this.book = this.dataService.getBook();
      this.user = this.dataService.getUser();  
      if(this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Online){
        this.loadFolios();
      }
      else{
        this.loadFoliosOffline();
      }
    });
  }

  ngOnInit() {
    this.contract = this.dataService.getContract();
    this.book = this.dataService.getBook();
    this.folios = this.dataService.getFolios();
    console.log(this.folios);
    this.foliosAlert = this.dataService.getFoliosAlert();
    if(this.networkService.getCurrentNetworkStatus() ==  ConnectionStatus.Offline){
      this.foliosOffline = this.dataService.getFoliosDontCloud();
      this.foliosAlertOffline = this.dataService.getFoliosDontCloudAlert();
    }
  }

  segmentChanged(ev: any) {
    console.log('Segment changed', ev.detail.value);
    this.select = ev.detail.value.toString();
  }

  back(){
    this.router.navigate(['tabsBook/tabsBook/book'],{});
  }

  ionViewWillEnter(){
    this.contract = this.dataService.getContract();
    this.book = this.dataService.getBook();
    if(this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Online){
      this.loadFolios();
    }
    else{
      this.loadFoliosOffline();
    }
  }

  async showFolio(folio){
    const loading = await this.loading.create({
      message: 'Cargando folio...',
      spinner: "circles",
      cssClass: 'loading-Custom'
    });
    await loading.present();
    if(this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Online){
      this.dataService.setFolio(folio);
      this.restService.archivesFolio(this.contract,this.book,folio).then((res) =>{
        console.log("la data que retorna del archivesFolio() es",JSON.stringify(res));
        let header = res.headers;
        let datos = JSON.parse(res.data);
        this.tokenService.setToken(header);
        this.dataService.setArchives(datos);
        this.reloadAllData();
        loading.dismiss();
        this.router.navigate(['thisFolio'],{});
      },(error) => {
        console.log("Error al tomar los archivos del folio",error);
        loading.dismiss();
        this.alertFolio();
      })
    }
    else{
      if(folio.archivos != null){
        this.dataService.setFolio(folio);
        this.dataService.setArchivesOffline(folio.archivos);
        this.dataService.setArchivesNoCloud(folio);
        loading.dismiss();
        console.log("existe archivos",folio);
        setTimeout(() => this.router.navigate(['thisFolio'],{}), 500);
      }
      else{
        console.log("no existe archivos",folio);
        let allData = this.dataService.getAllData();
        this.dataService.setContractsOffline(allData);
        let contracts = this.dataService.getContracts()
        //Una vez creado el nuevo contracts procedo a buscar el contrato en el que estoy parado x el id
        for(let contrato of contracts){
          //Una vez encontrado seteo el contrato con las nuevas variables offline  y seteo los libros de ese contrato
          if(contrato.id == this.contract.id){
            this.dataService.setContract(contrato);
            this.contract = this.dataService.getContract();
            this.dataService.setBooksOffline(contrato.libros);
            let books = this.dataService.getBooks();
            //Ahora se procede a buscar el libro el cual selecciono el usuario para preparar la info offline 
            for(let libro of books){
              //Una vez encontrado el libro se procede hacer todo lo necesario para la siguiente vista
              if(libro.id == this.book.id){
                this.dataService.setFoliosOffline(libro.folios);
                this.dataService.setUserInfoOffline(this.contract.user_info);
                this.dataService.setIsBookSpecialist(libro,this.user);
                this.dataService.setBook(libro);
                this.book = this.dataService.getBook();
                let folios = this.dataService.getFolios();
                for(let folioAux of folios){
                  if(folioAux.id == folio.id){
                    this.dataService.setFolio(folioAux);
                    this.dataService.setArchivesOffline(folioAux.archivos);
                    this.dataService.setArchivesNoCloud(folioAux);
                    loading.dismiss();
                    setTimeout(() => this.router.navigate(['thisFolio'],{}), 500);
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  async alertFolio() {
    const alert = await this.alert.create({
      header: 'No es posible ingresar al folio',
      message: 'Revise su conexión a internet y vuelva a intentarlo.',
      mode: 'ios',
      buttons: ['OK']
    });
    await alert.present();
  }

  loadFolios(){
    this.restService.folios(this.contract,this.book).then((res) => {
      console.log("la data que retorna del folios() es",JSON.stringify(res));
      let header = res.headers;
      let datos = JSON.parse(res.data);
      this.tokenService.setToken(header);
      this.dataService.setFolios(datos);
      this.reloadAllData();
      setTimeout(() => {
        this.folios = this.dataService.getFolios();
        this.foliosAlert = this.dataService.getFoliosAlert();
      },500);
    },(error)=> {
      console.log(error);
    })
  }

  loadFoliosOffline(){
    if(this.book.folios != null){
      this.dataService.setFoliosOffline(this.book.folios);
      this.dataService.setFoliosDontCloud(this.book);
      setTimeout(() => {
        this.folios = this.dataService.getFolios();
        this.foliosAlert = this.dataService.getFoliosAlert();
        this.foliosOffline =  this.removeRepeat(this.dataService.getFoliosDontCloud(),'id');
        this.foliosAlertOffline =  this.removeRepeat(this.dataService.getFoliosDontCloudAlert(),'id');
      },500);
    }
    else{
      let allData = this.dataService.getAllData();
      this.dataService.setContractsOffline(allData);
      let contracts = this.dataService.getContracts()
      for(let contrato of contracts){
        if(contrato.id == this.contract.id){
          this.dataService.setContract(contrato);
          this.contract = this.dataService.getContract();
          this.dataService.setBooksOffline(contrato.libros);
          let books = this.dataService.getBooks();
          for(let libro of books){
            if(libro.id = this.book.id){
              this.dataService.setBook(libro);
              this.book = this.dataService.getBook();
              this.dataService.setFoliosOffline(libro.folios);
              this.dataService.setFoliosDontCloud(libro);
              setTimeout(() => {
                this.folios = this.dataService.getFolios();
                this.foliosAlert = this.dataService.getFoliosAlert();
                this.foliosOffline = this.removeRepeat(this.dataService.getFoliosDontCloud(),'id');
                this.foliosAlertOffline =  this.removeRepeat(this.dataService.getFoliosDontCloudAlert(),'id');
              },500);
            }
          }
        }
      }
    }
  }

  removeRepeat(originalArray,prop){
    var newArray = [];
    var lookupObject  = {};
    for(var i in originalArray) {
       lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for(i in lookupObject) {
        newArray.push(lookupObject[i]);
    }
     return newArray;
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
