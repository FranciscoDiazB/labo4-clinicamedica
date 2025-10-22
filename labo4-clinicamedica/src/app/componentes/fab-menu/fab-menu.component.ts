import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { NavbarService } from '../../services/navbar.service';


@Component({
  selector: 'app-fab-menu',
  imports: [NavbarComponent],
  templateUrl: './fab-menu.component.html',
  styleUrl: './fab-menu.component.scss'
})
export class FabMenuComponent {
  constructor(private navbarService: NavbarService) {}

  toggleNavbar() {
    this.navbarService.toggle();
  }
}
