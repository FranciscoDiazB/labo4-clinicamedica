import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  userProfile:any = {
    id: null
  }

  profileUser:string = '';
  userName:string = '';

  spinner:boolean = false;

  showInfo:boolean = false;

  constructor(private supabaseService:SupabaseService, private router:Router){

  }

  ngOnInit(): void {

    this.spinner = true;
    this.getProfileUser();
    setTimeout(() => {
      console.log('Desde On Init: ' +this.profileUser);
      console.log('Desde On Init: ' +this.userName);
      this.spinner = false;
    }, 2000);
  }

  async getProfileUser() {
    const user = await this.supabaseService.getUser();
    if (user) {
      this.userProfile.id = user.id
    } else {
      this.userProfile = null;
      return;
    }

    // Buscar en usuarios
    const usuariosAux = await this.supabaseService.getCollection('usuarios');
    const usuario = usuariosAux.find(
      //(e: any) => e.email?.toLowerCase() === this.usuario.email.toLowerCase()
      (e: any) => e.id_usuario === this.userProfile.id
    );
    if (
      usuario.perfil === 'Admin' ||
      usuario.perfil === 'Especialista' ||
      usuario.perfil === 'Paciente' 
    ) {
      this.profileUser = usuario.perfil;
      this.userName = usuario.nombre;
      console.log('Desde la funcion: ' + this.profileUser);
      return;
    }
  }

  goTo(path:string){
    this.router.navigateByUrl(path);
  }

}
