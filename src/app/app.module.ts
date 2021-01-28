import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { File } from '@ionic-native/file/ngx';
import { FileTransfer } from '@ionic-native/file-transfer/ngx';
import { StreamingMedia } from '@ionic-native/streaming-media/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { MediaCapture } from '@ionic-native/media-capture/ngx';
import { Media } from '@ionic-native/media/ngx';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { Base64 } from '@ionic-native/base64/ngx';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';

import { IonicStorageModule } from '@ionic/storage';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ImageModalPageModule } from './pages/this-folio/image-modal/image-modal.module';
import { ImageModalPage } from './pages/this-folio/image-modal/image-modal.page';
import { VideoModalPageModule } from './pages/this-folio/video-modal/video-modal.module';
import { VideoModalPage } from './pages/this-folio/video-modal/video-modal.page';
import { PopoverFolioPageModule } from './pages/this-folio/popover-folio/popover-folio.module';
import { PopoverFolioPage } from './pages/this-folio/popover-folio/popover-folio.page';
import { AudioModalPage } from './pages/this-folio/audio-modal/audio-modal.page';
import { AudioModalPageModule } from './pages/this-folio/audio-modal/audio-modal.module';
import { DocumentModalPage } from './pages/this-folio/document-modal/document-modal.page';
import { DocumentModalPageModule } from './pages/this-folio/document-modal/document-modal.module';
import { IOSFilePicker } from '@ionic-native/file-picker/ngx';
import { AgregarFotoPageModule } from './pages/galeria/agregar-foto/agregar-foto.module';
import { AgregarFotoPage } from './pages/galeria/agregar-foto/agregar-foto.page';
import {ReactiveFormsModule,FormsModule} from '@angular/forms';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [
    AgregarFotoPage,
    ImageModalPage,
    VideoModalPage,
    PopoverFolioPage,
    AudioModalPage,
    DocumentModalPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    IonicStorageModule.forRoot(),
    AgregarFotoPageModule,
    ImageModalPageModule,
    VideoModalPageModule,
    PopoverFolioPageModule,
    AudioModalPageModule,
    DocumentModalPageModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    HTTP,
    File,
    FileTransfer,
    StreamingMedia,
    FileOpener,
    Camera,
    MediaCapture,
    Media,
    FileChooser,
    FilePath,
    IOSFilePicker,
    Base64,
    NativeAudio,
    Keyboard,
    Network,
    Geolocation,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
