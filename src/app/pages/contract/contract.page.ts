import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { LtecRestService } from 'src/app/service/rest/ltec-rest.service';
import { LtecDataService } from 'src/app/service/data/ltec-data.service';
import { LtecTokenService } from 'src/app/service/token/ltec-token.service';
import { LoadingController, Platform, AlertController } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { NetworkService, ConnectionStatus } from 'src/app/service/network/ltec-network.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-contract',
  templateUrl: './contract.page.html',
  styleUrls: ['./contract.page.scss'],
})
export class ContractPage implements OnInit,  OnDestroy, AfterViewInit  {
  backButtonSubscription;

  contracts: any;
  isContracts: boolean = false;
  user: any;
  books: any;
  users: any;

  constructor(
    private restService: LtecRestService,
    private dataService: LtecDataService,
    private tokenService: LtecTokenService,
    public loading: LoadingController,
    private router: Router,
    private platform: Platform,
    public alert: AlertController,
    private activateRoute :ActivatedRoute,
    private networkService: NetworkService,
    private storage: Storage,
  ) {
    this.contracts = [];
    this.activateRoute.params.subscribe(val => {
      console.log(val);
      if(this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Online){
        this.loadContracts();
      }
      else{
        this.loadContractsOffline();
      }
    });
  }

  ionViewWillEnter(){
    this.user = this.dataService.getUser();
    if(this.user){
      if(this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Online){
        this.loadContracts();
      }
      else{
        this.loadContractsOffline();
      }
    }
  }

  ngOnInit() {
    this.user = this.dataService.getUser();
    if(!this.isContracts){
      if(this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Online){
        this.loadContractsFirst();
      }
      else{
        this.loadContractsOfflineFirst();
      }
    }
  }


  ngAfterViewInit() {
    this.backButtonSubscription = this.platform.backButton.subscribe(() => {
      console.log("Aprete la flecha para atras en tabs del contract");
      navigator['app'].exitApp();
    });
  }

  ngOnDestroy() {
    this.backButtonSubscription.unsubscribe();
  }

  async loadContractsFirst(){
    console.log("Cargando contratos...");
    this.contracts = [];
    const loading = await this.loading.create({
      message: 'Cargando contratos...',
      spinner: "circles",
      cssClass: 'loading-Custom'
    });
    loading.present();
    console.log("Cargando contratos...");
    this.user= this.dataService.getUser();
    this.restService.contracts(this.user).then((res) => {
      let header = res.headers;
      let datos = JSON.parse(res.data);
      console.log("loadContractsFirst: ", JSON.stringify(datos.data));
      this.tokenService.setToken(header);
      this.dataService.setContracts(datos);
      this.isContracts = true;
      this.contracts = this.dataService.getContracts();
      loading.dismiss();
    }, (error) => {
      console.log("Error al cargar los contratos: ", error);
      this.errorLoadContract();
      loading.dismiss();
    })
  }

  async loadContractsOfflineFirst(){
    //this.contracts = [];
    const loading = await this.loading.create({
      message: 'Cargando contratos...',
      spinner: "circles",
      cssClass: 'loading-Custom'
    });
    loading.present();
    setTimeout(() => {
      let allData = this.dataService.getAllData();
      this.dataService.setContractsOffline(allData);
      this.isContracts = true;
      this.contracts = this.dataService.getContracts();
      console.log(this.contracts);
      loading.dismiss();
    },2000);
  }

  loadContracts(){
    this.user = this.dataService.getUser();
    this.restService.contracts(this.user).then((res) => {
      console.log("la data que retorna del contracts() es",JSON.stringify(res));
      let header = res.headers;
      let datos = JSON.parse(res.data);
      this.tokenService.setToken(header);
      this.dataService.setContracts(datos);
      this.isContracts = true;
      setTimeout(() => {this.contracts = this.dataService.getContracts()},500);
    },(error) =>{
      console.log("Error al cargar los contratos", error);
    })
  }

  loadContractsOffline(){
    //this.contracts = [];
    let allData = this.dataService.getAllData();
    this.dataService.setContractsOffline(allData);
    this.isContracts = true;
    this.contracts = this.dataService.getContracts();
    console.log(this.contracts);
  }

  test(){
    console.log("test:.... ");
    window.location.reload();
  }
  async presentLoading(tiempo = 40000){
    const loading = await this.loading.create({
      message: 'Cargando libros...',
      spinner: "circles",
      cssClass: 'loading-Custom'
    });
    return loading.present();
  }
  async showContract(contract){
    
   
    this.presentLoading()
    //Necesitamos saber si hay internet
    if(this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Online){
      this.restService.books(contract).then((res) => {
        this.dataService.setContract(contract);
        //console.log("la data que retorna del books() es",JSON.stringify(res));
        let header = res.headers;
        let datos = JSON.parse(res.data);
        this.tokenService.setToken(header);
        this.dataService.setBooks(datos);
        this.backButtonSubscription.unsubscribe();
        this.user = this.dataService.getUser();
        console.log("AFUERA BOOKS")
        this.restService.users(contract).then((response) => {
          //console.log("la data que retorna del users() es",JSON.stringify(response));
          header = response.headers;
          datos = JSON.parse(response.data);
          this.tokenService.setToken(header);
          this.dataService.setUsers(datos);
          this.reloadAllData();
          console.log("DENTRO DE USUARIOS")
          setTimeout(() => {
            this.loading.dismiss();
            this.router.navigate(['tabsBook/tabsBook/book'],{});
          },500);
        },(error) => {
          this.loading.dismiss();
          this.errorLoadBook();
          console.log("Error al cargar los usuarios",error);
        });
      },(error) => {
        this.loading.dismiss();
        this.errorLoadBook();
        console.log("Error al cargar los libros",error);
      });
    }
    else{
      if(contract.libros != null){
        console.log("NO HAY INTERNET PERO HAY LIBROS")
        this.dataService.setContract(contract);
        this.dataService.setBooksOffline(contract.libros);
        this.dataService.setUsersOffline(contract.usuarios);
        this.backButtonSubscription.unsubscribe();
        this.user = this.dataService.getUser();
        setTimeout(() => {
          this.loading.dismiss();
          this.router.navigate(['tabsBook/tabsBook/book'],{});
        },500);
      }
      else{

        console.log("NO HAY INTERNET Y NO HAY LIBROS")
        let allData = this.dataService.getAllData();
        //console.log(allData);
        this.dataService.setContractsOffline(allData);
        let contracts = this.dataService.getContracts();
        for(let contrato of contracts){
          //Una vez encontrado seteo el contrato con las nuevas variables offline, seteo sus variables offline del contrato
          if(contrato.id == contract.id){
            this.dataService.setContract(contrato);
            this.dataService.setBooksOffline(contrato.libros);
            this.dataService.setUsersOffline(contrato.usuarios);
            this.backButtonSubscription.unsubscribe();
            this.user = this.dataService.getUser();
            setTimeout(() => {
              this.loading.dismiss();
              this.router.navigate(['tabsBook/tabsBook/book'],{});
            },500);
          }
        }
      }
    }
  }

  async errorLoadContract(){
    const alert = await this.alert.create({
      header: 'Problemas al cargar Contratos',
      mode: "ios",
      message: 'Al parecer no es posible cargar contratos, ya que se perdio la sesión',
      backdropDismiss: false,
      buttons: [
        {
          text : 'Volver iniciar sesión',
          handler: () => {
            this.router.navigate(['login'],{});
          }
        }
      ]
    });
    await alert.present();
  }

  async errorLoadBook(){
    const alert = await this.alert.create({
      header: 'Problemas al cargar libros',
      mode: "ios",
      message: 'Al parecer no es posible cargar los libros en este momento, intentelo más tarde',
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

  //Aqui recargamos el arbol por cada accion del usuario
  reloadAllData(){
    this.user = this.dataService.getUser();
    this.restService.loadUserAppData(this.user.id).then((res) => {
      let data = JSON.parse(res.data);
      this.dataService.setAllData(data);
      let header = res.headers;
      this.tokenService.setToken(header);
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
