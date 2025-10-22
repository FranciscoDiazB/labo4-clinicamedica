import { Component } from '@angular/core';
import { NavbarService } from '../../services/navbar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  isOpen = false;
  private sub!: Subscription;

  constructor(private navbarService: NavbarService) {}

  ngOnInit() {
    this.sub = this.navbarService.isOpen$.subscribe(value => {
      this.isOpen = value;
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  toggle() {
    this.navbarService.toggle();
  }

  close() {
    this.navbarService.close();
  }
}
