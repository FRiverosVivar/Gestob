import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LtecDataService } from 'src/app/service/data/ltec-data.service';

@Component({
  selector: 'app-information',
  templateUrl: './information.page.html',
  styleUrls: ['./information.page.scss'],
})
export class InformationPage implements OnInit {

  contract: any;

  constructor(
    private router: Router,
    private dataService: LtecDataService,
  ){
  }

  ngOnInit() {
    this.contract = this.dataService.getContract();
  }

  back(){
    this.router.navigate(['tabs/tabs/contract'],{});
  }

}
