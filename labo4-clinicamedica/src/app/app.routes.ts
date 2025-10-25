import { flush } from '@angular/core/testing';
import { Routes } from '@angular/router';

export const routes: Routes = [

    {path: '', redirectTo: '/welcome', pathMatch: "full"}, 
    {path: 'welcome', loadComponent: ()=> import('./componentes/welcome/welcome.component').then(m => m.WelcomeComponent)}, 
    {path: 'login', loadComponent: ()=> import('./componentes/login/login.component').then(m => m.LoginComponent)},
    {path: 'register', loadComponent: ()=> import('./componentes/register/register.component').then(m => m.RegisterComponent)},
    {path: 'home', loadComponent: ()=> import('./componentes/home/home.component').then(m => m.HomeComponent)},
];
