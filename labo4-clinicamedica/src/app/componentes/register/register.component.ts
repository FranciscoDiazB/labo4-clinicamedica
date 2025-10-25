import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [NgClass],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  alertNumber:number = 0;
  alertTitle:string = '';
  alertMessage:string = '';
  spinner:boolean = false;
  showPassword:boolean = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

}
