import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { createClient, Session, SupabaseClient, User, } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  public supabaseClient: SupabaseClient;
  public estaLogueado: boolean = false;
  private sessionPromise: Promise<any> | null = null;
  public usuarioLogueado: any = null;

  constructor() {
    localStorage.clear();
    this.supabaseClient = createClient(environment.apiUrl, environment.publicAnonKey);
  }

  signIn(email: string, password: string) {
    return this.supabaseClient.auth.signInWithPassword({
      email: email,
      password: password,
    });
  }
}
