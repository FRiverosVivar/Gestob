import { Component, OnInit } from '@angular/core';
import { LtecDataService } from 'src/app/service/data/ltec-data.service';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { LtecRestService } from 'src/app/service/rest/ltec-rest.service';
import { LtecTokenService } from 'src/app/service/token/ltec-token.service';
import { NetworkService,ConnectionStatus } from 'src/app/service/network/ltec-network.service';
import { OfflineManagerService } from 'src/app/service/offline/ltec-offline-manager.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-newfolio',
  templateUrl: './newfolio.page.html',
  styleUrls: ['./newfolio.page.scss'],
})
export class NewfolioPage implements OnInit {

  book: any;
  contract: any;
  newFolio: any;
  isFecha: boolean = false;
  user: any;

  constructor(
    private dataService : LtecDataService,
    private router: Router,
    public alert: AlertController,
    public loading: LoadingController,
    private restService: LtecRestService,
    private tokenService: LtecTokenService,
    public toast: ToastController,
    private networkService: NetworkService,
    private OfflineService: OfflineManagerService,
    private storage: Storage,
  ){
    this.newFolio = {
      'asunto' : "",
      'categoria' : "",
      'prioridad' : "",
      'fecha_limite': "",
      'contenido': ""
    }
  }

  ngOnInit() {
    this.book = this.dataService.getBook();
    this.contract = this.dataService.getContract();
    this.user = this.dataService.getUser();
  }

  back(){
    this.router.navigate(['tabsBook/tabsBook/book'],{});
  }

  async createFolio(){
    console.log(this.newFolio);
    if(!this.isFecha){
      this.newFolio.fecha_limite = "";
    }
    if(this.newFolio.categoria != "" && this.newFolio.asunto != "" && this.newFolio.contenido != "" && this.newFolio.prioridad != "" ){
      const loading = await this.loading.create({
        message: 'Creando folio...',
        spinner: "circles",
        cssClass: 'loading-Custom'
      });
      await loading.present();

      if(this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Online){
        this.restService.newFolio(this.newFolio,this.contract,this.book).then((res) => {
          console.log("newFolio: ", JSON.stringify(res));
          let header = res.headers;
          let datos = JSON.parse(res.data);
          this.tokenService.setToken(header);
          this.dataService.setNewFolio(datos);
          this.dataService.setArchives(null);
          this.reloadAllData();
          loading.dismiss();
          this.confirm();
          setTimeout(() => {
            this.router.navigate(['thisFolio'],{});
            this.resetForm();
          }, 1000);
        },(error) =>{
          console.log("Error al crear el folio",error);
          loading.dismiss();
          this.alertNoCreate();
        })
      }
      else{
        this.restService.newFolioOffline(this.newFolio,this.contract,this.book)
        setTimeout(() =>{
          let data = this.OfflineService.getObjectNew();
          this.dataService.setNewFolioOffline(data);
          this.dataService.setArchivesOffline(null);
          let folio = this.dataService.getFolio();
          this.dataService.setArchivesNoCloud(folio);
          loading.dismiss();
          setTimeout(() => {
            this.router.navigate(['thisFolio'],{});
            this.resetForm();
          },2000);
        },500);
      }
    }
    else{
      this.alertNoData();
    }
  }

  resetForm(){
    this.newFolio = {
      'asunto' : "",
      'categoria' : "",
      'prioridad' : "",
      'fecha_limite': "",
      'contenido': ""
    }
  }

  async alertNoData(){
    const alert = await this.alert.create({
      header: 'Problemas al crear el folio',
      mode: "ios",
      message: 'Al parecer no completo todos los campos necesarios para crear el folio, vuelva a revisar',
      buttons: [{text : 'OK'}]
    });
    await alert.present();
  }

  async alertNoCreate(){
    const alert = await this.alert.create({
      header: 'Problemas al crear el folio',
      mode: "ios",
      message: 'No es posible crear el folio en este momento, intente más tarde',
      buttons: [{text : 'OK'}]
    });
    await alert.present();
  }

  async alertNoLoadArchives(){
    const alert = await this.alert.create({
      header: 'Folio creado',
      mode: "ios",
      message: 'Folio creado pero no es posible ingresar automanticamente, ingrese manualmente',
      buttons: [{text : 'OK',  handler: () => {
        this.router.navigate(['tabsFolio/tabsFolio/folio'],{});
        }
      }]
    });
    await alert.present();
  }

  async confirm(){
    const toast = await this.toast.create({
      message: 'Folio creado correctamente',
      duration: 1000,
      cssClass: 'toast-Confirm',
      keyboardClose: true,
    });
    toast.present();
  }

  cambiotext(){
    console.log(this.newFolio.contenido);
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
