import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  imports: [],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {

  spinner:boolean = false;

  constructor(private router:Router){

  }

  goTo(path:string){

    this.spinner = true;

    setTimeout(() => {
      this.spinner = false;
      this.router.navigateByUrl(path);
    }, 1500);


  }

}
