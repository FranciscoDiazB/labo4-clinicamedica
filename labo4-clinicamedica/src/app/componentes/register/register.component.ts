import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { errorContext } from 'rxjs/internal/util/errorContext';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SupabaseClient } from '@supabase/supabase-js';
import { iterator } from 'rxjs/internal/symbol/iterator';
import { RecaptchaModule } from 'ng-recaptcha';

@Component({
  selector: 'app-register',
  imports: [NgClass, CommonModule, NgClass, FormsModule, ReactiveFormsModule, RecaptchaModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {

  alertNumber:number = 0;
  alertTitle:string = '';
  alertMessage:string = '';
  spinner:boolean = false;
  showPassword:boolean = false;
  condition:boolean = true;

  imagePreview1: string | ArrayBuffer | null = null;
  imagePreview2: string | ArrayBuffer | null = null;
  imageFile1: File | null = null;
  imageFile2: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  defaultInsurance = 'Obra Social'

  firstPatientForm:boolean = false;
  imagePatientForm:boolean = false;
  secondPart:boolean = false;

  registerPatient!:FormGroup;
  registerUserDataPatient!:FormGroup;
  imagePatient!:FormGroup;

  registerMedic!:FormGroup
  registerUserDataMedic!:FormGroup;
  imageMedic!:FormGroup;

  options = ['OSDE', 'Swiss Medical', 'Medicus', 'OSEP', 'OSPE', 'OSSEG', 'Medifé', 'GALENO', 'OSMATA'];
  selectedOption = '';

  formForPatients:boolean = false;
  formForMedics:boolean = false;

  captchaValid = false;

  ///////////////////////

  specialtyControl = new FormControl('', Validators.required);
  suggestions: any[] = [];
  loading = false;


  constructor(private supabaseService: SupabaseService){

    this.specialtyControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((valor) => {
        if (valor && valor.trim().length > 0) {
          this.searchSpecialty(valor);
        } else {
          this.suggestions = [];
        }
      });
  }

  ngOnInit(): void {

    this.registerPatient = new FormGroup({
      name: new FormControl(null, [Validators.pattern('^[a-zA-ZÀ-ÿ ]+$'), Validators.required]),
      surname: new FormControl(null, [Validators.pattern('^[a-zA-ZÀ-ÿ ]+$'), Validators.required]),
      age: new FormControl(null, [Validators.min(15), Validators.max(110) ,Validators.required]),
      identity: new FormControl(null, [Validators.required, Validators.min(1000000), Validators.max(999999999)]),
      insurance: new FormControl(null, [Validators.required]),
    });

    this.registerUserDataPatient = new FormGroup({
      email: new FormControl(null, [Validators.email, Validators.required]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)]),
    });

    this.imagePatient = new FormGroup({
      image_one: new FormControl(null, [Validators.required]),
      image_two: new FormControl(null, [Validators.required]),
    });

    this.registerPatient.addControl('registerUserDataPatient',this.registerUserDataPatient);
    this.registerPatient.addControl('imagePatient',this.imagePatient);

    /////////////////////////////////////////////

    this.registerMedic = new FormGroup({
      nameM: new FormControl(null, [Validators.pattern('^[a-zA-ZÀ-ÿ ]+$'), Validators.required]),
      surnameM: new FormControl(null, [Validators.pattern('^[a-zA-ZÀ-ÿ ]+$'), Validators.required]),
      ageM: new FormControl(null, [Validators.min(24), Validators.max(65) ,Validators.required]),
      identityM: new FormControl(null, [Validators.required, Validators.min(1000000), Validators.max(999999999)]),
      specialtyM: this.specialtyControl,
    });

    this.registerUserDataMedic = new FormGroup({
      emailM: new FormControl(null, [Validators.email, Validators.required]),
      passwordM: new FormControl(null, [Validators.required, Validators.minLength(6)]),
    });

    this.imageMedic = new FormGroup({
      image_oneM: new FormControl(null, [Validators.required]),
    });

    this.registerMedic.addControl('registerUserDataMedic', this.registerUserDataMedic);
    this.registerMedic.addControl('imageMedic', this.imageMedic);
  }

  async searchSpecialty(value: string) {
    this.loading = true;
    try {
      this.suggestions = await this.supabaseService.buscarEspecialidades(value);
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  async addSpecialty() {

    try{
      const value = this.specialtyControl.value?.trim();
    if (!value) return;

    // Verificar si ya existe

    const itExists = await this.supabaseService.supabaseClient.from('especialidades').select('*')
    .eq('descripcion', value).single();

    if(itExists.error){
      console.log('No existe');
    }
    else{
      console.log('Existe');
      console.log(itExists.data);
      this.toggleAlertMessage(false, 1, 'Especialidad existente', 'Ya existe la especialidad en el sistema. Ingresar otra...');
      return;
    }
    

    const yaExiste = this.suggestions.some(
      (esp) => esp.descripcion.toLowerCase() == value.toLowerCase()
    );

    console.log(yaExiste);

    if (yaExiste) {
      this.toggleAlertMessage(false, 1, 'Especialidad existente', 'Ya existe la especialidad en el sistema. Ingresar otra...');
      setTimeout(() => {
        this.toggleAlertMessage(true, 0, '', '');
      }, 2000);
      return;
    }

    try {
      const nueva = await this.supabaseService.agregarEspecialidad(value);
      this.suggestions = [nueva, ...this.suggestions];
      this.toggleAlertMessage(false, 2, 'Especialidad agregada', 'Se agregó con éxito la nueva especialidad al sistema');
    } catch (err) {
      console.error(err);
      this.toggleAlertMessage(false, 1, 'Error', 'Error al intentar agregar la especialidad');
    }
    }
    catch{

    }
    finally{
      setTimeout(() => {
        this.toggleAlertMessage(true, 0, '', '');
      }, 2000);
    }
  }

  removeAccents(text: string): string {
    return text
      .normalize('NFD') 
      .replace(/[\u0300-\u036f]/g, ''); 
  }
  
  selectSpecialty(description: string) {
    this.specialtyControl.setValue(description);
    this.suggestions = [];
  }

  showFormPatient(){
    this.formForPatients = true;
  }

  showFormMedics(){
    this.formForMedics = true;
  }

  get justName() {
    return this.registerPatient.get('name');
  }

  get justSurname() {
    return this.registerPatient.get('surname');
  }

  get justAge() {
    return this.registerPatient.get('age');
  }

  get justIdentity() {
    return this.registerPatient.get('identity');
  }

  get justInsurance(){
    return this.registerPatient.get('insurance');
  }

  get justEmail() {
    return this.registerUserDataPatient.get('email');
  }

  get justPassword(){
    return this.registerUserDataPatient.get('password');
  }

  get justFirstImage() {
    return this.imagePatient.get('image_one');
  }

  get justSecondImage(){
    return this.imagePatient.get('image_two');
  }

  get justMedicName() {
    return this.registerMedic.get('nameM');
  }

  get justMedicSurname() {
    return this.registerMedic.get('surnameM');
  }

  get justMedicAge() {
    return this.registerMedic.get('ageM');
  }

  get justMedicIdentity() {
    return this.registerMedic.get('identityM');
  }

  get justMedicSpecialty(){
    return this.registerMedic.get('specialtyM');
  }

  get justMedicEmail() {
    return this.registerUserDataMedic.get('emailM');
  }

  get justMedicPassword(){
    return this.registerUserDataMedic.get('passwordM');
  }

  get justMedicImage() {
    return this.imageMedic.get('image_oneM');
  }

  showSecondForm(id:string){
    const element = document.getElementById('id');
    this.firstPatientForm = true;
    this.secondPart = true;
  }

  returnFirstForm(){
    this.firstPatientForm = false;
    this.secondPart = false;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }


  onImagesSelected(event: any, user:number) {

    if(user == 1){

      const patientData = this.registerPatient.value;
  
      const files: FileList = event.target.files;
      if (files && files.length > 0) {
        const file1 = files[0];
        const file2 = files[1];
  
        if (file1) {
          const reader1 = new FileReader();
          reader1.onload = () => (this.imagePreview1 = reader1.result);
          reader1.readAsDataURL(file1);
          this.imageFile1 = file1;
          this.justFirstImage?.setValue(`pacientes/DNI-${patientData.identity}/imagen1.jpg`);
        }
  
        if (file2) {
          const reader2 = new FileReader();
          reader2.onload = () => (this.imagePreview2 = reader2.result);
          reader2.readAsDataURL(file2);
          this.imageFile2 = file2;
          this.justSecondImage?.setValue(`pacientes/DNI-${patientData.identity}/imagen2.jpg`);
        }
      }
    }
    else{
      const medicData = this.registerMedic.value;
  
      const files: FileList = event.target.files;
      if (files) {
        const file1 = files[0];
  
        if (file1) {
          const reader1 = new FileReader();
          reader1.onload = () => (this.imagePreview1 = reader1.result);
          reader1.readAsDataURL(file1);
          this.imageFile1 = file1;
          this.justMedicImage?.setValue(`especialistas/DNI-${medicData.identity}/imagen.jpg`);
        }
      }
    }
  }


  toggleAlertMessage(condition:boolean, number:number, title:string, message:string){

    const element = document.getElementById('alert-message');

    if(number != 0){

      this.alertNumber = number;
      this.alertTitle = title;
      this.alertMessage = message;
    }
    
    if(condition){
      element?.classList.add('hide-shortcuts');
    }
    else{
      element?.classList.remove('hide-shortcuts');
    }
  }

  closeOpenPreview(srcImage:any){
  
    const element = document.getElementById('img-pre-large');
    this.imagePreview = srcImage;

    if(this.condition){
      element?.classList.add('open-img-preview-large');
      this.condition = false
      return
    }

    element?.classList.remove('open-img-preview-large');
    this.condition = true;
    return;
  }

  async onSubmit() {

    try{
      this.spinner = true;
      if (!this.imageFile1 || !this.imageFile2) {
        this.toggleAlertMessage(false, 1, 'Seleccionar Imagenes', 'Debe seleccionar dos imagenes para poder continuar');
        return;
      }
  
      const userData = this.registerPatient.value.registerUserDataPatient;
      const patientData = this.registerPatient.value;

      const dataPatients = await this.supabaseService.supabaseClient
              .from('usuarios')
              .select('*')
              .eq('dni', patientData.identity)
              .maybeSingle();

      const mailPatients = await this.supabaseService.supabaseClient
              .from('usuarios')
              .select('*')
              .eq('mail', userData.email)
              .maybeSingle();

      console.log(dataPatients);
      console.log(mailPatients);

      if(mailPatients.data != null && mailPatients.data != undefined){
        console.log('Ya se encuentra el mail');
        this.toggleAlertMessage(false, 1, 'Correo Electrónico', 'Ya se encuentra en el sistema un usuario con el mismo correo electrónico. Ingrese otro...');
        return;
      }

      if(dataPatients.data != null && dataPatients.data != undefined){
        console.log('Ya se encuentra el DNI');
        this.toggleAlertMessage(false, 1, 'Identificación DNI', 'Ya se encuentra en el sistema un usuario con el mismo DNI. Ingrese otro...');
        return;
      }
  
      // 1️⃣ Crear usuario en Auth
      const { data, error } = await this.supabaseService.signUp(userData.email, userData.password);
  
      const uuid = data.user?.id;
      if (!uuid) return;
  
      // 2️⃣ Insertar en tabla usuarios
      const usuario = {
        id_usuario: uuid,
        nombre: patientData.name,
        perfil: 'Paciente',
        mail: userData.email,
        dni: patientData.identity
      };
      const userInserted = await this.supabaseService.insertUser(usuario);

      if(userInserted.error){
        this.toggleAlertMessage(false, 1, 'Error al insertar el usuario', 'Error');
        console.log(userInserted.error);
      }
  
      // 3️⃣ Insertar en tabla pacientes
      const paciente = {
        id_paciente: uuid,
        nombre: patientData.name,
        apellido: patientData.surname,
        edad: patientData.age,
        dni: patientData.identity,
        obra_soc: patientData.insurance,
        imagen_uno: `pacientes/DNI-${patientData.identity}/imagen1.jpg`,
        imagen_dos: `pacientes/DNI-${patientData.identity}/imagen2.jpg`,
        mail:userData.email,
      };

      const patientInserted = await this.supabaseService.insertPatient(paciente);
  
      console.log(userInserted);
      console.log(patientInserted);

      if(patientInserted.error == null && userInserted.error == null){

        const errorOne = await this.supabaseService.uploadImage('clinica', `pacientes/DNI-${patientData.identity}/imagen1.jpg`, this.imageFile1);
        const errorTwo = await this.supabaseService.uploadImage('clinica', `pacientes/DNI-${patientData.identity}/imagen2.jpg`, this.imageFile2);

        this.toggleAlertMessage(false, 2, 'Registro exitoso', 'Se pudo registrar exitosamente un paciente en el sistema. Recuerde confirmar la cuenta a traves de su casilla de correo ingresada.')
        this.resetAll();
      }
      else{
        this.toggleAlertMessage(false, 1, 'Error al insertar el paciente', 'Error');
        console.log(userInserted.error);
      }
    }
    catch(error){
      this.toggleAlertMessage(false, 1, 'Error', '');
      console.log(error);
    }
    finally{
      setTimeout(() => {
        this.spinner = false;
        this.toggleAlertMessage(true, 0, '', '');
      }, 2500);
    }
  }

  async onSubmitMedic() {

    try{
      this.spinner = true;
      if (!this.imageFile1) {
        this.toggleAlertMessage(false, 1, 'Seleccionar Imagen', 'Debe seleccionar una imagen para poder continuar');
        return;
      }
  
      const userData = this.registerMedic.value.registerUserDataMedic;
      const medicData = this.registerMedic.value;

      const dataMedics = await this.supabaseService.supabaseClient
              .from('usuarios')
              .select('*')
              .eq('dni', medicData.identityM)
              .maybeSingle();

      const mailMedics = await this.supabaseService.supabaseClient
              .from('usuarios')
              .select('*')
              .eq('mail', userData.email)
              .maybeSingle();

      const itExists = await this.supabaseService.supabaseClient.from('especialidades').select('*')
              .eq('descripcion', medicData.specialtyM).single();


      console.log(itExists);
      console.log(medicData);
      console.log(mailMedics);
      console.log(userData);

      if(mailMedics.data != null && mailMedics.data != undefined){
        console.log('Ya se encuentra el mail');
        this.toggleAlertMessage(false, 1, 'Correo Electrónico', 'Ya se encuentra en el sistema un usuario con el mismo correo electrónico. Ingrese otro...');
        return;
      }

      if(dataMedics.data != null && dataMedics.data != undefined){
        console.log('Ya se encuentra el DNI');
        this.toggleAlertMessage(false, 1, 'Identificación DNI', 'Ya se encuentra en el sistema un usuario con el mismo DNI. Ingrese otro...');
        return;
      }
  
      // 1️⃣ Crear usuario en Auth
      const { data, error } = await this.supabaseService.signUp(userData.emailM, userData.passwordM);

      console.log(data);
      console.log(error);
  
      const uuid = data.user?.id;
      if (!uuid) return;
  
      // 2️⃣ Insertar en tabla usuarios
      const user = {
        id_usuario: uuid,
        nombre: medicData.nameM,
        perfil: 'Especialista',
        mail: userData.emailM, 
        dni: medicData.identityM,
      };
      const userInserted = await this.supabaseService.insertUser(user);

      if(userInserted.error){
        this.toggleAlertMessage(false, 1, 'Error al insertar el usuario', 'Error');
        console.log(userInserted.error);
      }
  
      // 3️⃣ Insertar en tabla pacientes
      const medic = {
        id_especialista: uuid,
        nombre: medicData.nameM,
        apellido: medicData.surnameM,
        edad: medicData.ageM,
        dni: medicData.identityM,
        especialidad: itExists.data.id,
        imagen: `especialistas/DNI-${medicData.identityM}/imagen.jpg`,
        mail:userData.emailM,
      };

      const patientInserted = await this.supabaseService.insertSpecialist(medic);
  
      console.log(userInserted);
      console.log(patientInserted);

      if(patientInserted.error == null && userInserted.error == null){

        await this.supabaseService.uploadImage('clinica', `especialistas/DNI-${medicData.identityM}/imagen.jpg`, this.imageFile1);

        this.toggleAlertMessage(false, 2, 'Registro exitoso', 'Se pudo registrar exitosamente un paciente en el sistema. Recuerde confirmar la cuenta a traves de su casilla de correo ingresada.')
        this.resetAll();
      }
      else{
        this.toggleAlertMessage(false, 1, 'Error al insertar el paciente', 'Error');
        console.log(userInserted.error);
      }
    }
    catch(error){
      this.toggleAlertMessage(false, 1, 'Error', '');
      console.log(error);
    }
    finally{
      setTimeout(() => {
        this.spinner = false;
        this.toggleAlertMessage(true, 0, '', '');
      }, 2500);
    }
  }

  resetAll(){
   this.registerPatient.reset();
   this.registerMedic.reset();
   this.imagePreview1 = null;
   this.imagePreview2 = null;
   this.imagePreview = null;
   this.imageFile1 = null;
   this.imageFile2 = null;
   this.showPassword = false;
   this.condition = true;
   this.firstPatientForm = false;
   this.imagePatientForm = false;
   this.secondPart = false;
   this.formForMedics = false;
   this.formForPatients = false;
   this.captchaValid = false;
  }



}
