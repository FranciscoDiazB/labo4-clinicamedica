import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  email:string = ''
  password:string = '';
  showPassword:boolean = false;
  condition:boolean = false;
  alertNumber:number = 0;
  alertTitle:string = '';
  alertMessage:string = '';

  constructor(private supabaseService:SupabaseService){

  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleShortcuts() {
    const element = document.getElementById('shortcuts');

    if (this.condition) {
      element?.classList.add('hide-shortcuts');
      this.condition = false;
      return;
    }

    element?.classList.remove('hide-shortcuts');
    this.condition = true;
    return;
  }

  toggleAlertMessage(condition:boolean){

    const element = document.getElementById('alert-message');
    
    if(condition){
      element?.classList.add('hide-shortcuts');
    }
    else{
      element?.classList.remove('hide-shortcuts');
    }
  }

  loginUser(){
    try{
      this.supabaseService.signIn(this.email, this.password).then(
        async ({ data, error }) => {
          if (error?.message === 'Email not confirmed') {
            this.alertNumber = 1;
            this.alertTitle = 'Correo no Confirmado'
            this.alertMessage = 'El usuario está creado, pero todavía no se confirmó el correo. Confirme el correo que le ingresó a la casilla'
            this.toggleAlertMessage(false);
            
          } else if (error?.message === 'Invalid login credentials' && this.email != '' && this.password != '') {
            console.log('Credenciales Erroneas');
            this.alertNumber = 1;
            this.alertTitle = 'Credenciales Inválidas'
            this.alertMessage = 'Alguna o ambas de las creadenciales ingresadas son erroneas. Por favor, reingresar credenciales...'
            this.toggleAlertMessage(false);

          }else if (error?.message === 'missing email or phone' || this.email == '' || this.password == '') {
            console.log('Hay campos sin completar');
            this.alertNumber = 1;
            this.alertTitle = 'Campos Incompletos'
            this.alertMessage = 'Hay por lo menos un campo que no contiene informacion. Por favor, completar campos...'
            this.toggleAlertMessage(false);

          } else if (error) {
            console.log('Error en el correo');
            this.alertNumber = 1;
            this.alertTitle = 'Error en la Conexión'
            this.alertMessage = 'Hubo un error en la conexion con el autenticador de Supabase'
            this.toggleAlertMessage(false);
          } 
          else if (data.user) {
            console.log('Exitos al loguear');
            this.alertNumber = 2;
            this.alertTitle = 'Éxito Validando Usuario'
            this.alertMessage = 'Se pudo validar con éxito el usuario en la base de datos. Ingresando...'
            this.toggleAlertMessage(false);
          }
        }
      );
      setTimeout(() => {
        this.toggleAlertMessage(true);
      }, 2500);
    }
    catch{
      console.log('Excepcion');
    }
  }

}
