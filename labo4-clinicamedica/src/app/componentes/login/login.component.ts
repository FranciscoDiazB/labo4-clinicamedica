import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  email:string = ''
  password:string = '';
  showPassword:boolean = false;
  condition:boolean = false;
  alertNumber:number = 0;
  alertTitle:string = '';
  alertMessage:string = '';
  spinner:boolean = false;
  userPatients:any[] = [];

  constructor(private supabaseService:SupabaseService, private router:Router){

  }

  async ngOnInit(){

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

  async loginUser(){
    try{
      this.spinner = true;

      let success = false;

      const mailUser = await this.supabaseService.supabaseClient
              .from('usuarios')
              .select('*')
              .eq('mail', this.email)
              .single();

      console.log(mailUser);

      if(mailUser.data != null && mailUser.data != undefined){

        if(mailUser.data.perfil === 'Especialista' && !mailUser.data.seVerificoEsp){
                this.alertNumber = 1;
                this.alertTitle = 'Especialista no Verificado'
                this.alertMessage = 'El administrador todavía no habilitó su cuenta para que pueda usarla. Espere su confirmación.'
                this.toggleAlertMessage(false);
        }
        else{
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
                success = true;
              }
            }
          );
        }

      }
      setTimeout(() => {
        this.toggleAlertMessage(true);
        this.spinner = false;
        if(success){
          this.resetAll();
          this.router.navigateByUrl('home');
        }
      }, 2500);
    }
    catch{
      console.log('Excepcion');
    }
    finally{
    }
  }

  goTo(path:string){
    this.router.navigateByUrl(path);
  }

  fillUserOnShortcuts(userNumber:number){

    if(userNumber == 1){
      this.email = 'estebanaguirre95@yopmail.com';
    }
    if(userNumber == 2){
      this.email = 'mariaazuldiaz@yopmail.com';
    }
    if(userNumber == 3){
      this.email = 'dvazquez021@yopmail.com';
    }
    if(userNumber == 4){
      this.email = 'draying.derma@yopmail.com';
    }
    if(userNumber == 5){
      this.email = 'drruiz.cardio@yopmail.com';
    }
    if(userNumber == 6){
      this.email = 'admin.j.etcheverry@yopmail.com';
    }

    this.password = '123456';

    this.loginUser();
    
    this.toggleShortcuts();
  }

  resetAll(){
    this.email = '';
    this.password = '';
    this.condition = false;
    this.showPassword = false;
  }

}
