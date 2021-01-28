import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LtecDataService } from 'src/app/service/data/ltec-data.service';
import { LtecRestService } from 'src/app/service/rest/ltec-rest.service';
import { LtecTokenService } from 'src/app/service/token/ltec-token.service';
import { NetworkService,ConnectionStatus } from 'src/app/service/network/ltec-network.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {

  contract: any;
  users: any;
  user: any;

  constructor(    
    private router: Router,
    private dataService: LtecDataService,
    private restService: LtecRestService,
    private tokenService: LtecTokenService,
    private networkService: NetworkService,
    private storage: Storage,
  ){
  }

  ngOnInit() {
    this.contract = this.dataService.getContract();
    this.users = this.dataService.getUsers();
    this.user = this.dataService.getUser();
  }

  back(){
    this.router.navigate(['tabs/tabs/contract'],{});
  }

  ionViewWillEnter(){
    if(this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Online){
      this.loadUsers();
    }
    else{
      this.loadUsersOffline();
    }
    
  }

  loadUsers(){
    this.restService.users(this.contract).then((response) => {
      console.log("la data que retorna del users() es",JSON.stringify(response.data));
      let header = response.headers;
      let datos = JSON.parse(response.data);
      this.tokenService.setToken(header);
      this.dataService.setUsers(datos);
      setTimeout(()=>this.users = this.dataService.getUsers(),500);
    },(error) =>{
      console.log("error al actualizar los usuarios",error);
    })
  }

  loadUsersOffline(){
    if(this.contract.usuarios != null){
      this.dataService.setUsersOffline(this.contract.usuarios);
      this.users = this.dataService.getUsers();
    }
    else{
      let allData = this.dataService.getAllData();
      console.log("allData",allData);
      this.dataService.setContractsOffline(allData);
      let contracts = this.dataService.getContracts();
      console.log("contracts",contracts);
      for(let contrato of contracts){
        console.log(contrato);
        if(contrato.id == this.contract.id){
          this.dataService.setUsersOffline(contrato.usuarios);
          this.users = this.dataService.getUsers();
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
