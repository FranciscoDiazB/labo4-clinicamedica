import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { createClient, Session, SupabaseClient, User, } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  public supabaseClient: SupabaseClient;
  public estaLogueado: boolean = false;
  private sessionPromise: Promise<any> | null = null;
  public usuarioLogueado: any = null;

  private sessionSubject = new BehaviorSubject<Session | null>(null);
  session$ = this.sessionSubject.asObservable();

  private roleSubject = new BehaviorSubject<string | null>(null);
  role$ = this.roleSubject.asObservable();

  constructor() {
    localStorage.clear();
    this.supabaseClient = createClient(environment.apiUrl, environment.publicAnonKey);
    this.initSessionListener();
  }

  async getUser(): Promise<User | null> {
    const {
      data: { user },
    } = await this.supabaseClient.auth.getUser();
    return user;
  }

  getPublicUrl(ruta: string) {
    const publicUrl = this.supabaseClient.storage
      .from('clinica')
      .getPublicUrl(ruta);
    return publicUrl.data.publicUrl;
  }

  async getSpecialty(id: number): Promise<string | null> {
    try {
      const { data, error } = await this.supabaseClient
        .from('especialidades')
        .select('descripcion')
        .eq('id', id)
        .single();
  
      if (error) throw error;
  
      return data?.descripcion || null;
    } catch (err) {
      console.error('Error al obtener especialidad:', err);
      return null;
    }
  }

  public async getCollection(tableName: string): Promise<any[]> {
    const { data, error } = await this.supabaseClient
      .from(tableName)
      .select('*');
    if (error) {
      console.log('Error al obtener la tabla', error);
      return [];
    }
    return data || [];
  }

  signIn(email: string, password: string) {
    return this.supabaseClient.auth.signInWithPassword({
      email: email,
      password: password,
    });
  }

  async signUp(email: string, password: string) {
    return await this.supabaseClient.auth.signUp({ email, password });
  }

  async signUpUser(email: string, password: string) {
    const { data, error } = await this.supabaseClient.auth.signUp({ email, password });
  
    if (error) {
      if (error.message.includes('User already registered')) {
        console.log('El correo ya existe en el sistema');
        return { existe: true };
      }
      console.error('Error al registrar:', error.message);
      return { error };
    }
  
    console.log('Usuario registrado:', data);
    return { existe: false, data };
  }
  

  async insertUser(usuario: any) {
    return await this.supabaseClient.from('usuarios').insert(usuario);
  }

  async insertPatient(paciente: any) {
    return await this.supabaseClient.from('pacientes').insert(paciente);
  }

  async insertSpecialist(esp: any) {
    return await this.supabaseClient.from('especialista').insert(esp);
  }

  async insertAdmin(adm: any) {
    return await this.supabaseClient.from('administradores').insert(adm);
  }

  async uploadImage(bucket: string, path: string, file: File) {
    return await this.supabaseClient.storage.from(bucket).upload(path, file);
  }

  async existsDNIOnDataBase(table: string, nombre: string): Promise<boolean> {
    const { data, error } = await this.supabaseClient
      .from(table)
      .select('dni') // solo necesitamos el id
      .ilike('nombre', nombre); // ilike para case-insensitive

    if (error) {
      console.error('Error al verificar existencia:', error);
      return false;
    }
    return data && data.length > 0;
  }

  async buscarEspecialidades(texto: string) {
    const { data, error } = await this.supabaseClient
      .from('especialidades')
      .select('*')
      .ilike('descripcion', `%${texto}%`)
      .limit(10);

    if (error) throw error;
    return data;
  }

  async agregarEspecialidad(descripcion: string) {
    const { data, error } = await this.supabaseClient
      .from('especialidades')
      .insert([{ descripcion }])
      .select();

    if (error) throw error;
    return data[0];
  }

  private async initSessionListener() {
    const { data } = await this.supabaseClient.auth.getSession();
    this.sessionSubject.next(data.session);
    if (data.session?.user) {
      await this.loadUserRole(data.session.user);
    }

    // Detecta cambios de sesión automáticamente
    this.supabaseClient.auth.onAuthStateChange((_event, session) => {
      this.sessionSubject.next(session);
      if (session?.user) this.loadUserRole(session.user);
      else this.roleSubject.next(null);
    });
  }

  async loadUserRole(user: User) {
    // Ejemplo: si tenés una tabla "perfiles" o "usuarios" donde guardás el rol
    const { data, error } = await this.supabaseClient
      .from('usuarios')
      .select('perfil')
      .eq('id_usuario', user.id)
      .single();

    if (!error && data) {
      this.roleSubject.next(data.perfil);
    }
  }

  async logout() {
    await this.supabaseClient.auth.signOut();
    this.sessionSubject.next(null);
    this.roleSubject.next(null);
  }

}
