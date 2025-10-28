import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { CommonModule, NgForOf, NgClass, NgIf } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';


interface User{
  name:string;
  surname:string; 
  age:number;
  identity:number;
  insurance?:string;
  specialty?:string;
  email:string;
  image:string;
  second_image?:string;
}

@Component({
  selector: 'app-profile',
  imports: [NgClass],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {

  alertNumber:number = 0;
  alertTitle:string = '';
  alertMessage:string = '';
  spinner:boolean = false;

  userProfile:any = {
    id: null
  }

  userAllData:any = {

    name: '',
    surname: '',

  }

  profileUser:string = '';
  userName:string = '';

  constructor(private supabaseService:SupabaseService){

  }

  ngOnInit(): void {
    this.spinner = true

    setTimeout(() => {
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

}
