import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./componentes/navbar/navbar.component";
import { FabMenuComponent } from "./componentes/fab-menu/fab-menu.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FabMenuComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'labo4-clinicamedica';
}
