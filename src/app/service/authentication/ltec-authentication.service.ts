import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Storage } from '@ionic/storage';
import { Platform } from '@ionic/angular'
import { LtecRestService } from '../rest/ltec-rest.service';
import { LtecDataService } from '../data/ltec-data.service';
import { LtecTokenService } from '../token/ltec-token.service';
import { NetworkService, ConnectionStatus } from '../network/ltec-network.service';

const TOKEN_KEY_LTEC = 'auth-token-ltec';

@Injectable({
  providedIn: 'root'
})
export class LtecAuthenticationService {

  authenticationState = new BehaviorSubject(false);

  constructor(
    private storage: Storage,
    private platform: Platform,
    private restService: LtecRestService,
    private dataService: LtecDataService,
    private tokenService: LtecTokenService,
    private networkService: NetworkService,
  ){
    console.log("Autentication Service");
    this.platform.ready().then(() => {
      this.chekAuth();
    })
  }

  chekAuth(){
    //Verifico si tiene las creedenciales para iniciar sesion
    return this.storage.get(TOKEN_KEY_LTEC).then(res => {
      console.log("Estan las creedenciales del usuario: ", JSON.stringify(res));
      //Ahora verificamos si tiene conexion a internet si tiene que siga el conducto regular como antes
      if(this.networkService.getCurrentNetworkStatus() == ConnectionStatus.Online){
        if(res) {
          //Significa que el usuario se logeo por lo tanto hay que iniciar sesion para tener token y el user
          this.restService.login(res.email,res.password).then((data) => {
            this.authenticationState.next(true);

            console.log("la data que retorna del Login() es: ", JSON.stringify(data));
            let header = data.headers;
            let datos = JSON.parse(data.data);
            this.tokenService.setToken(header);
            this.dataService.setUser(datos);

            //Hay que guardar los datos del usuario
            this.storage.set("UserDataLtec",datos).then((save) => {
              console.log("Datos del usuario Guardado",save);
            },(error) => {
              console.log("Error al guardar los datos del usuario",error);
            });


            //Esta es la url que carga todo, vamos a guardar los datos
            this.restService.loadUserAppData(datos.data.id).then((res) => {
              console.log("la data que retorna del loadUserAppData() es: ", JSON.stringify(res))
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
          }, (error) => {
            console.log(error);
            this.authenticationState.next(false);
          });
        }
        else {
          this.authenticationState.next(false);
        }
      }
      //Caso que esta offline
      else{
        if(res){
          //Tengo las creedenciales pero debo saber si tiene data del usuario cargada y lo demas para funcionamiento de la aplicacion
          this.storage.get("UserDataLtec").then((user) => {
            console.log(user);
            this.storage.get("AllDataLtec").then((data) => {
              console.log(data);
              //Si tiene esos datos guardados puede entrar a la aplicacion pk han sido guardados
              if(user && data){
                this.dataService.setUser(user);
                this.dataService.setAllData(data);
                this.authenticationState.next(true);
              }
              else{
                this.authenticationState.next(false);
              }
            })
          })
        }
        else{
          this.authenticationState.next(false);
        }
      }
    })
  }

  login(email:string, password:string){
    let token = {
      email: email,
      password: password
    }
    return this.storage.set(TOKEN_KEY_LTEC, token).then(res => {
      console.log(res);
      this.authenticationState.next(true);
    })
  }

  logout(){
    return this.storage.remove(TOKEN_KEY_LTEC).then(() => {
      this.authenticationState.next(false);
    })
  }

  isAuthenticated(){
    return this.authenticationState.value
  }

}
