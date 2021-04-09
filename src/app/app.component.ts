import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { LtecAuthenticationService } from './service/authentication/ltec-authentication.service';
import { Router } from '@angular/router';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Network } from '@ionic-native/network/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

  count: any;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService : LtecAuthenticationService,
    private router: Router,
    private keyboard: Keyboard,
    private network: Network,
    private androidPermission: AndroidPermissions
  ) {
    console.log("App Components");
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      console.log("initializeApp: ")
      this.count = 0;
      this.statusBar.backgroundColorByHexString('#66bd51');
      this.statusBar.overlaysWebView(true);
      this.keyboard.disableScroll(true);
      this.authService.authenticationState.subscribe(state => {
        console.log('Auth change: ', state);
        console.log(this.count);
        if(state){
          //this.data.loadUser();
          if(this.count != 0){
            this.router.navigate(['tabs'])
            this.splashScreen.hide();
          }
          this.count++;
        }
        else{
          if(this.count != 0){
            this.router.navigate(['login']);
            this.splashScreen.hide();
          }
          this.count++;
        }
      });

    });
  }
}
