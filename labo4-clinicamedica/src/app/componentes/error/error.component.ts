import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error',
  imports: [],
  templateUrl: './error.component.html',
  styleUrl: './error.component.scss'
})
export class ErrorComponent implements OnInit {

  spinner:boolean = false;

  constructor(private router:Router){

  }

  ngOnInit(): void {
    setTimeout(() => {
      this.spinner = true;
    }, 3000);
    setTimeout(() => {
      this.goTo('welcome');
    }, 5000);
  }

  goTo(path:string){
    this.spinner = false;
    this.router.navigateByUrl(path);
  }
}
