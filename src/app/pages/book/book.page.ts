import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { LtecDataService } from 'src/app/service/data/ltec-data.service';
import { LtecRestService } from 'src/app/service/rest/ltec-rest.service';
import { LtecTokenService } from 'src/app/service/token/ltec-token.service';
import { NetworkService, ConnectionStatus} from 'src/app/service/network/ltec-network.service';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'app-book',
  templateUrl: './book.page.html',
  styleUrls: ['./book.page.scss'],
})
export class BookPage implements OnInit {

  books: any;
  contract: any;
  folios: any;
  user: any;

  constructor(
    private router: Router,
    public loading: LoadingController,
    private dataService: LtecDataService,
    private restService: LtecRestService,
    private tokenService: LtecTokenService,
    public alert: AlertController,
    private activateRoute :ActivatedRoute,
    private networkService: NetworkService,
    private storage: Storage,

  ){
    this.activateRoute.params.subscribe(val => {
      if(this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Online){
        console.log(val);
        this.loadBooks();
      }
      else{
        this.contract = this.dataService.getContract();
        this.loadBooksOffline();
      }
    });
  }

  ngOnInit() {
    this.contract = this.dataService.getContract();
    this.books = this.dataService.getBooks();
    this.user = this.dataService.getUser();
  }

  ionViewWillEnter(){
    if(this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Online){
      this.loadBooks();
    }
    else{
      this.loadBooksOffline();
    }
  }

  back(){
    this.router.navigate(['tabs/tabs/contract'],{});
  }

  async showBook(book){
    const loading = await this.loading.create({
      message: 'Cargando folios...',
      spinner: "circles",
      cssClass: 'loading-Custom'
    });
    await loading.present();
    if(this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Online){
      this.restService.folios(this.contract,book).then((res) => {
        console.log("la data que retorna del folios() es",JSON.stringify(res));
        let header = res.headers;
        let datos = JSON.parse(res.data);
        this.tokenService.setToken(header);
        this.dataService.setFolios(datos);
        this.restService.user_info(this.contract,this.user).then((response) =>{
          console.log("la data que retorna del user_info() es",JSON.stringify(response));
          header = response.headers;
          datos = JSON.parse(response.data);
          this.tokenService.setToken(header);
          this.dataService.setUserInfo(datos);
          this.dataService.setIsBookSpecialist(book,this.user);
          this.folios = this.dataService.getFolios();
          this.dataService.setBook(book);
          this.reloadAllData();
          loading.dismiss();
          this.router.navigate(['tabsFolio/tabsFolio/folio'],{});
        },(error) =>{
          console.log("error al pedir la info usuario",error);
          loading.dismiss();
          this.errorLoadFolio();
        });
      },(error) =>{
        console.log("error al pedir los folios",error);
        loading.dismiss();
        this.errorLoadFolio();
      })
    }
    else{
      //Veo si tienen las variables que deberia tener en offline
      if(book.folios != null && this.contract.user_info != null){
        this.dataService.setFoliosOffline(book.folios);
        this.dataService.setFoliosDontCloud(book);
        this.dataService.setUserInfoOffline(this.contract.user_info);
        this.dataService.setIsBookSpecialist(book,this.user);
        this.dataService.setBook(book);
        loading.dismiss();
        setTimeout(() => this.router.navigate(['tabsFolio/tabsFolio/folio'],{}),500);
      }
      //Si no las tiene debo crear la data desde cero
      else{
        let allData = this.dataService.getAllData();
        this.dataService.setContractsOffline(allData);
        let contracts = this.dataService.getContracts()
        //Una vez creado el nuevo contracts procedo a buscar el contrato en el que estoy parado x el id
        for(let contrato of contracts){
          //Una vez encontrado seteo el contrato con las nuevas variables offline  y seteo los libros de ese contrato
          if(contrato.id == this.contract.id){
            console.log("encontre contrato");
            this.dataService.setContract(contrato);
            this.contract = this.dataService.getContract();
            this.dataService.setBooksOffline(contrato.libros);
            this.books = this.dataService.getBooks();
            //Ahora se procede a buscar el libro el cual selecciono el usuario para preparar la info offline 
            for(let libro of this.books){
              //Una vez encontrado el libro se procede hacer todo lo necesario para la siguiente vista
              if(libro.id == book.id){
                console.log("Encontre libro");
                this.dataService.setFoliosOffline(book.folios);
                this.dataService.setFoliosDontCloud(book);
                this.dataService.setUserInfoOffline(this.contract.user_info);
                this.dataService.setIsBookSpecialist(book,this.user);
                this.dataService.setBook(book);
                loading.dismiss();
                setTimeout(() => this.router.navigate(['tabsFolio/tabsFolio/folio'],{}),500); 
              }
            }
          }
        }
      }
    }
  }

  loadBooks(){
    this.restService.books(this.contract).then((res) => {
      console.log("la data que retorna del books() es",JSON.stringify(res));
      let header = res.headers;
      let datos = JSON.parse(res.data);
      this.tokenService.setToken(header);
      this.dataService.setBooks(datos);
      this.contract = this.dataService.getContract();
      this.reloadAllData();
      setTimeout (() => {this.books = this.dataService.getBooks(),500});
    },(error) => {
      console.log("error al actualizar los libros",error);
    });
  }

  async errorLoadFolio(){
    const alert = await this.alert.create({
      header: 'Problemas al cargar folios',
      mode: "ios",
      message: 'Al parecer no es posible cargar los folios en este momento, intentelo más tarde',
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

  loadBooksOffline(){
    if(this.contract.libros != null){
      this.dataService.setBooksOffline(this.contract.libros);
      this.books = this.dataService.getBooks();
    }
    else{
      let allData = this.dataService.getAllData();
      this.dataService.setContractsOffline(allData);
      let contracts = this.dataService.getContracts()
      for(let contrato of contracts){
        if(contrato.id == this.contract.id){
          this.dataService.setBooksOffline(contrato.libros);
          this.books = this.dataService.getBooks();
        }
      }
    }
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
