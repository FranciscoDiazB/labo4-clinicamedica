import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { NavbarService } from '../../services/navbar.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-navbar',
  imports: [NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  isOpen = false;
  private sub!: Subscription;
  session: any = null;
  role: string | null = null;

  constructor(private navbarService: NavbarService, private router:Router, private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.sub = this.navbarService.isOpen$.subscribe(value => {
      this.isOpen = value;
    });

    this.supabaseService.session$.subscribe(session => this.session = session);
    this.supabaseService.role$.subscribe(role => this.role = role);
    console.log('Session:' + this.session);
    console.log('Role:' + this.role);
  }

  goTo(path:string){
    this.close();
    this.router.navigateByUrl(path);
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

  logout() {
    this.supabaseService.logout();
    console.log('Session:' + this.session);
    console.log('Role:' + this.role);
    this.goTo('welcome');
  }
}
