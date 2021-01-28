import { Component, OnInit } from '@angular/core';
import { LtecDataService } from 'src/app/service/data/ltec-data.service';

@Component({
  selector: 'app-tabs-folio',
  templateUrl: './tabs-folio.page.html',
  styleUrls: ['./tabs-folio.page.scss'],
})
export class TabsFolioPage implements OnInit {

  book: any;
  contract: any;
  user_info: any;
  isEspecialistAsigned: boolean = false;
  isHaveSpecialist: boolean = false;

  constructor(
    private dataService: LtecDataService,
  ){
    this.book = this.dataService.getBook();
    this.contract = this.dataService.getContract();
    this.user_info = this.dataService.getUserInfo();
    this.isEspecialistAsigned = this.dataService.getIsBookSpecialist();
    console.log(this.book);
    console.log("isEspecialistAsigned",this.isEspecialistAsigned);
    if(this.book.especialista != null){
      console.log("tiene especialista");
      if( this.book.especialista.length > 0){
        console.log("son mas de 0");
        this.isHaveSpecialist = true;
      }
      else{
        console.log("son menos de 0");
        this.isHaveSpecialist = false;
      }
    }
    else{
      console.log("no tiene especialista");
      this.isHaveSpecialist = false
    }
  }

  ngOnInit() {
    this.book = this.dataService.getBook();
    this.contract = this.dataService.getContract();
    this.user_info = this.dataService.getUserInfo();
    this.isEspecialistAsigned = this.dataService.getIsBookSpecialist();
    if(this.book.especialista){
      if(this.book.especialista.length > 0){
        this.isHaveSpecialist = true;
      }
      else{
        this.isHaveSpecialist = false;
      }
    }
    else{
      this.isHaveSpecialist = false
    }
  }

  ionViewWillEnter(){
    this.book = this.dataService.getBook();
    this.contract = this.dataService.getContract();
    this.user_info = this.dataService.getUserInfo();
    this.isEspecialistAsigned = this.dataService.getIsBookSpecialist();
    if(this.book.especialista){
      if(this.book.especialista.length > 0){
        this.isHaveSpecialist = true;
      }
      else{
        this.isHaveSpecialist = false;
      }
    }
    else{
      this.isHaveSpecialist = false
    }
  }

}

