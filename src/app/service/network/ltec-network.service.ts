import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network/ngx'
import { BehaviorSubject, Observable } from 'rxjs';
import { ToastController, Platform } from '@ionic/angular';
import { OfflineManagerService } from '../offline/ltec-offline-manager.service';

export enum ConnectionStatus {
  Online,
  Offline
}

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  private status: BehaviorSubject<ConnectionStatus> = new BehaviorSubject(ConnectionStatus.Offline);

  constructor(
    private network: Network,
    private toastController: ToastController,
    private plt: Platform,
    private offlineManagerService: OfflineManagerService,
  ) {
    console.log("NetworkService");
    this.plt.ready().then(() => {
      this.initializeNetworkEvents();
      let status =  this.network.type !== 'none' ? ConnectionStatus.Online : ConnectionStatus.Offline;
      this.status.next(status);
    });
  }

  public initializeNetworkEvents() {
    this.network.onDisconnect().subscribe(() => {
      if (this.status.getValue() === ConnectionStatus.Online) {
        console.log('No hay conexión a internet');
        this.updateNetworkStatus(ConnectionStatus.Offline);
      }
    });

    this.network.onConnect().subscribe(() => {
      if (this.status.getValue() === ConnectionStatus.Offline) {
        console.log('Tenemos conexión a internet: ', this.status);
        this.updateNetworkStatus(ConnectionStatus.Online);
      }
    });
  }

  private async updateNetworkStatus(status: ConnectionStatus) {
    this.status.next(status);
    let connection = status == ConnectionStatus.Offline ? 'Offline' : 'Online';
    let toast = this.toastController.create({
      message: `Estamos ${connection}`,
      position: 'bottom',
      duration : 3000,
      buttons: [{
          side: 'end',
          icon: status == ConnectionStatus.Offline ? 'sad' : 'happy',
          text: status == ConnectionStatus.Offline ? 'ok'  :  'ok',
          handler: () => {
            if(status == ConnectionStatus.Offline){
              console.log('Estamos ofline asi que no se hace nada');
            }
            else{
              console.log('Estamos online por lo que el usuario deberia sincronizar');
              // window.location.reload() este recarga la app pero se queda cargando contratos infinito,
              // es la solucion mas simple pero habria que solucionar eso
              // this.router.navigate(['tabs']) solucion 2 dirigirlo al home para que cargue contratos nuevamente
              // no me fije si realmente recargaba todo, quiza baste con esto y no haya necesdad de reiniciar todo
            }
          }
        }]
    });
    toast.then(toast => toast.present());

    if(status == ConnectionStatus.Online){
      this.offlineManagerService.toastUpdate();
    }
  }

  public onNetworkChange(): Observable<ConnectionStatus> {
    return this.status.asObservable();
  }

  public getCurrentNetworkStatus(): ConnectionStatus {
    return this.status.getValue();
  }
}
