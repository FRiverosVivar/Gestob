import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LtecTokenService {
  
  token_headerGet: any;
  token_headerPost: any;
  token_headerUpdateFile: any;

  constructor(){
    console.log("ServiceToken");
  }

  setToken(header){
    if(header['access-token'] != "" && header['access-token']){
      this.token_headerPost = {
        'access_token' : header['access-token'],
        'content_type' : header['content-type'],
        'client': header['client'],
        'uid': header['uid'],
      }

      this.token_headerGet = {
        'access_token' : header['access-token'],
        'client': header['client'],
        'uid': header['uid'],
      }

      this.token_headerUpdateFile = {
        'access_token' : header['access-token'],
        'client': header['client'],
        'uid': header['uid'],
        'content_type' : 'multipart/form-data',
      }
    }
  }

  getTokenPost(){
    return this.token_headerPost;
  }

  getTokenGet(){
    return this.token_headerGet;
  }

  getTokenUpdateFile(){
    return this.token_headerUpdateFile;
  }



}
