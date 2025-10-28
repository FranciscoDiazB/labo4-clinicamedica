import { AfterViewInit, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';
import { Router } from '@angular/router';
import { CommonModule, NgForOf, NgClass, NgIf } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { RecaptchaModule } from 'ng-recaptcha';

@Component({
  selector: 'app-users',
  imports: [NgForOf, NgClass, NgIf, ɵInternalFormsSharedModule, ReactiveFormsModule, RecaptchaModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements AfterViewInit, OnInit{

  userProfile:any = {
    id: null
  }

  condition:boolean = true;

  alertNumber:number = 0;
  alertTitle:string = '';
  alertMessage:string = '';
  showPassword:boolean = false;

  profileUser:string = '';
  userName:string = '';

  showUsersOnSystem:boolean = false;
  enableSpecialist:boolean = false;
  registerNewAdmin:boolean = false;

  usersOnSystemList:any[] = [];
  patientsOnSystemList:any[] = [];
  specialistsOnSystemList:any[] = [];
  specialtiesOnSystem:any[] = [];
  pendingSpecialistsOnSystem:any[] = [];

  imageFile: File | null = null;
  imageFile2: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  imagePreview2: string | ArrayBuffer | null = null;
  imagePreviewMax: string | ArrayBuffer | null = null;

  spinner:boolean = false;

  selectedSpecialist:any = null;

  registerAdmin!:FormGroup;

  registerPatient!:FormGroup;

  registerMedic!:FormGroup

  specialtyControl = new FormControl('', Validators.required);

  suggestions: any[] = [];

  registerAdminFlag:boolean = false;
  registerPatietnFlag:boolean = false;
  registerMedicFlago:boolean = false;

  loading = false;

  options = ['OSDE', 'Swiss Medical', 'Medicus', 'OSEP', 'OSPE', 'OSSEG', 'Medifé', 'GALENO', 'OSMATA'];
  selectedOption = '';

  siteKey = '6LcRS_orAAAAAMlyLf0tQWselUoNnsS7KGRkWClS';

  captchaValid = false;

  constructor(private supabaseService:SupabaseService, private router:Router){

    this.registerAdmin = new FormGroup({
      name: new FormControl(null, [Validators.pattern('^[a-zA-ZÀ-ÿ ]+$'), Validators.required]),
      surname: new FormControl(null, [Validators.pattern('^[a-zA-ZÀ-ÿ ]+$'), Validators.required]),
      age: new FormControl(null, [Validators.min(15), Validators.max(110) ,Validators.required]),
      identity: new FormControl(null, [Validators.required, Validators.min(1000000), Validators.max(999999999)]),
      email: new FormControl(null, [Validators.email, Validators.required]),
      password: new FormControl(null, [Validators.required, Validators.minLength(6)]),
      image: new FormControl(null, [Validators.required]),
    });

    this.registerPatient = new FormGroup({
      nameP: new FormControl(null, [Validators.pattern('^[a-zA-ZÀ-ÿ ]+$'), Validators.required]),
      surnameP: new FormControl(null, [Validators.pattern('^[a-zA-ZÀ-ÿ ]+$'), Validators.required]),
      ageP: new FormControl(null, [Validators.min(15), Validators.max(110) ,Validators.required]),
      identityP: new FormControl(null, [Validators.required, Validators.min(1000000), Validators.max(999999999)]),
      insuranceP: new FormControl(null, [Validators.required]),
      emailP: new FormControl(null, [Validators.email, Validators.required]),
      passwordP: new FormControl(null, [Validators.required, Validators.minLength(6)]),
      imageP: new FormControl(null, [Validators.required]),
      image_twoP: new FormControl(null, [Validators.required]),
    });

    this.registerMedic = new FormGroup({
      nameM: new FormControl(null, [Validators.pattern('^[a-zA-ZÀ-ÿ ]+$'), Validators.required]),
      surnameM: new FormControl(null, [Validators.pattern('^[a-zA-ZÀ-ÿ ]+$'), Validators.required]),
      ageM: new FormControl(null, [Validators.min(24), Validators.max(65) ,Validators.required]),
      identityM: new FormControl(null, [Validators.required, Validators.min(1000000), Validators.max(999999999)]),
      specialtyM: this.specialtyControl,
      emailM: new FormControl(null, [Validators.email, Validators.required]),
      passwordM: new FormControl(null, [Validators.required, Validators.minLength(6)]),
      image_oneM: new FormControl(null, [Validators.required]),
    });

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

  ngAfterViewInit() {
    //this.loadRecaptchaScript();
  }


  loadRecaptchaScript() {
    if (document.getElementById('recaptcha-script')) return;

    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.id = 'recaptcha-script';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // Esperar hasta que grecaptcha esté disponible
    const interval = setInterval(() => {
      if ((window as any).grecaptcha) {
        clearInterval(interval);
        console.log('✅ grecaptcha disponible');
        this.renderCaptcha();
      }
    }, 500);
  }

  renderCaptcha() {
    (window as any).grecaptcha.render('recaptcha-container', {
      sitekey: this.siteKey,
      theme: 'light'
    });
    console.log('✅ reCAPTCHA renderizado');
  }


  ngOnInit(): void {
    this.spinner = true;
    this.getProfileUser();
    this.getMedicsSystem()
    this.getPatientsSystem();
    setTimeout(() => {
      console.log('Desde On Init: ' +this.profileUser);
      console.log('Desde On Init: ' +this.userName);
      this.spinner = false;
    }, 2000);
  }

  get justName() {
    return this.registerAdmin.get('name');
  }

  get justSurname() {
    return this.registerAdmin.get('surname');
  }

  get justAge() {
    return this.registerAdmin.get('age');
  }

  get justIdentity() {
    return this.registerAdmin.get('identity');
  }

  get justEmail() {
    return this.registerAdmin.get('email');
  }

  get justPassword(){
    return this.registerAdmin.get('password');
  }

  get justImage() {
    return this.registerAdmin.get('image');
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

  enableFlags(numberButton:number){

    if(numberButton != 3){
      this.spinner = true;
    }

    if(numberButton == 1){
      this.showUsersOnSystem = true;
      this.getPatientsSystem();
      this.getMedicsSystem();
    }
    if(numberButton == 2){
      this.getMedicsSystem();
      this.enableSpecialist = true;
    }
    if(numberButton == 3){
      this.registerNewAdmin = true;
    }

    setTimeout(() => {
      this.spinner = false;
    }, 2000);
    
  }

  showCorrectForm(form:number){

    if(form == 1){
      this.registerAdminFlag = true;
    }
    else if(form == 2){
      this.registerMedicFlago = true
    }
    else if(form == 3){
      this.registerPatietnFlag = true;
    }

    this.loadRecaptchaScript();

  }

  async getPatientsSystem(){

    try{
      const mailUser = await this.supabaseService.supabaseClient
              .from('pacientes')
              .select('*')

      if (mailUser.data) {
                // Mapear la URL pública de la foto
        this.patientsOnSystemList = mailUser.data.map((user: any) => ({
          ...user,
          fotoUno: user.imagen_uno
          ? this.supabaseService.getPublicUrl(user.imagen_uno)
          : null,
          fotoDos: user.imagen_dos
          ? this.supabaseService.getPublicUrl(user.imagen_dos)
          : null,
      }));
      } else {
        this.patientsOnSystemList = [];
      }
      console.log(this.patientsOnSystemList);
    }
    catch(err){
      console.log(err);
    }
  }

  onImagesSelected(event: any) {

      const medicData = this.registerAdmin.value;
  
      const files: FileList = event.target.files;
      if (files) {
        const file1 = files[0];
  
        if (file1) {
          const reader1 = new FileReader();
          reader1.onload = () => (this.imagePreview = reader1.result);
          reader1.readAsDataURL(file1);
          this.imageFile = file1;
          this.justImage?.setValue(`administradores/DNI-${medicData.identity}/imagen.jpg`);
        }
      }
  }

  async getMedicsSystem(){

    try{
      const mailUser = await this.supabaseService.supabaseClient
              .from('especialista')
              .select('*');

      if (mailUser.data) {
                // Mapear la URL pública de la foto
        this.specialistsOnSystemList = await Promise.all(
          mailUser.data.map(async (user: any) => ({
            ...user,
            foto: this.supabaseService.getPublicUrl(user.imagen),
            espe: await this.supabaseService.getSpecialty(user.especialidad),
          }))
        );
      } else {
        this.specialistsOnSystemList = [];
      }

      if(this.specialistsOnSystemList.length > 0){

        this.pendingSpecialistsOnSystem = this.specialistsOnSystemList.filter((user)=>{
          if(user.estado === 'Pendiente'){
            return true;
          }
          else{
            return false;
          }
        });
      }
      else{
        this.pendingSpecialistsOnSystem = [];
      }

      console.log(this.specialistsOnSystemList);
    }
    catch(err){
      console.log(err);
    }
  }

  closeOpenPreview(srcImage:any){
  
    const element = document.getElementById('img-pre-large');
    this.imagePreviewMax = srcImage;

    if(this.condition){
      element?.classList.add('open-img-preview-large');
      this.condition = false
      return
    }

    element?.classList.remove('open-img-preview-large');
    this.condition = true;
    return;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async getUsersSystem(){

    try{
      const mailUser = await this.supabaseService.supabaseClient
              .from('usuarios')
              .select('*')

      if(mailUser.data != null && mailUser.data != undefined){

        this.usersOnSystemList = mailUser.data;
      }
      else{
        this.usersOnSystemList = [];
      }
    }
    catch(err){
      console.log(err);
    }
  }

  async aproveSpecialistToEnter(){

    try{

      this.spinner = true;

      if(this.selectedSpecialist != null && this.selectedSpecialist != undefined){

        const espUser = await this.supabaseService.supabaseClient
                .from('especialista')
                .update({estado: 'Aprobado'})
                .eq('id_especialista', this.selectedSpecialist.id_especialista);
  
        console.log(espUser);
  
        const userUser = await this.supabaseService.supabaseClient
                .from('usuarios')
                .update({seVerificoEsp: true})
                .eq('id_usuario', this.selectedSpecialist.id_especialista);
  
        console.log(userUser);
  
        if(espUser.error == null && userUser.error == null){
          this.toggleAlertMessage(false, 2, 'Especialista aprobado.', 'Fue exitosa la aprobación del especialista. Se le habilitó el ingreso al sistema a dicha cuenta.');
        }
        else{
          this.toggleAlertMessage(false, 1, 'Error al aprobar.', 'No se pudo llevar a cabo la aprobación del especialista.');
        }
      }
      this.getMedicsSystem();

      setTimeout(() => {
        this.spinner = false;
        this.toggleAlertMessage(true, 0, '', '');
        this.showModalSpecialist(false);
      }, 2500);
    }
    catch(error){
      this.toggleAlertMessage(false, 1, 'Error.', 'Hubo un error.');
      console.log(error);
      setTimeout(()  => {
        this.spinner = false;
        this.toggleAlertMessage(true, 0, '', '');
        this.showModalSpecialist(false);
      }, 2500);
    }
    finally{
    }
  }

  async onSubmitAdmin() {

    try{
      this.spinner = true;
      if (!this.imageFile) {
        this.toggleAlertMessage(false, 1, 'Seleccionar Imagen', 'Debe seleccionar una imagen para poder continuar');
        return;
      }

      if (!this.captchaValid){
        this.toggleAlertMessage(false, 1, 'Captcha Inválido', '');
        return;
      }
  
      const adminData = this.registerAdmin.value;

      const dataAdmins = await this.supabaseService.supabaseClient
              .from('administradores')
              .select('*')
              .eq('dni', adminData.identity)
              .maybeSingle();

      const mailAdmins = await this.supabaseService.supabaseClient
              .from('usuarios')
              .select('*')
              .eq('mail', adminData.email)
              .maybeSingle();

      console.log(mailAdmins);
      console.log(dataAdmins);
      console.log(adminData);

      if(mailAdmins.data != null && mailAdmins.data != undefined){
        console.log('Ya se encuentra el mail');
        this.toggleAlertMessage(false, 1, 'Correo Electrónico', 'Ya se encuentra en el sistema un usuario con el mismo correo electrónico. Ingrese otro...');
        return;
      }

      if(dataAdmins.data != null && dataAdmins.data != undefined){
        console.log('Ya se encuentra el DNI');
        this.toggleAlertMessage(false, 1, 'Identificación DNI', 'Ya se encuentra en el sistema un usuario con el mismo DNI. Ingrese otro...');
        return;
      }
  
      const { data, error } = await this.supabaseService.signUp(adminData.email, adminData.password);

      console.log(data);
      console.log(error);
  
      const uuid = data.user?.id;
      if (!uuid) return;
  
      // 2️⃣ Insertar en tabla usuarios
      const user = {
        id_usuario: uuid,
        nombre: adminData.name,
        perfil: 'Admin',
        mail: adminData.email
      };
      const userInserted = await this.supabaseService.insertUser(user);

      if(userInserted.error){
        this.toggleAlertMessage(false, 1, 'Error al insertar el usuario', 'Error');
        console.log(userInserted.error);
      }
  
      // 3️⃣ Insertar en tabla pacientes
      const admin = {
        id_admin: uuid,
        nombre: adminData.name,
        apellido: adminData.surname,
        edad: adminData.age,
        dni: adminData.identity,
        mail: adminData.email,
        imagen: `administradores/DNI-${adminData.identity}/imagen.jpg`,
      };

      const adminInserted = await this.supabaseService.insertAdmin(admin);
  
      console.log(userInserted);
      console.log(adminInserted);

      if(adminInserted.error == null && userInserted.error == null){

        await this.supabaseService.uploadImage('clinica', `administradores/DNI-${adminData.identity}/imagen.jpg`, this.imageFile);

        this.toggleAlertMessage(false, 2, 'Registro exitoso', 'Se pudo registrar exitosamente un admin en el sistema.')
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

  showId(item:any){
    this.selectedSpecialist = item;
    this.showModalSpecialist(true);
    console.log(item.id_especialista);
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

  showModalSpecialist(cond:boolean) {
    const element = document.getElementById('modal-special');

    if (!cond) {
      element?.classList.add('hide-shortcuts');
      this.selectedSpecialist = null;
      return;
    }

    element?.classList.remove('hide-shortcuts');
    return;
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

  onImagesSelectedMP(event: any, user:number) {

    if(user == 1){

      const patientData = this.registerPatient.value;
  
      const files: FileList = event.target.files;
      if (files && files.length > 0) {
        const file1 = files[0];
        const file2 = files[1];
  
        if (file1) {
          const reader1 = new FileReader();
          reader1.onload = () => (this.imagePreview = reader1.result);
          reader1.readAsDataURL(file1);
          this.imageFile = file1;
          this.registerPatient.get('imageP')?.setValue(`pacientes/DNI-${patientData.identity}/imagen1.jpg`);
        }
  
        if (file2) {
          const reader2 = new FileReader();
          reader2.onload = () => (this.imagePreview2 = reader2.result);
          reader2.readAsDataURL(file2);
          this.imageFile2 = file2;
          this.registerPatient.get('image_twoP')?.setValue(`pacientes/DNI-${patientData.identity}/imagen2.jpg`);
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
          reader1.onload = () => (this.imagePreview = reader1.result);
          reader1.readAsDataURL(file1);
          this.imageFile = file1;
          this.registerMedic.get('image_oneM')?.setValue(`especialistas/DNI-${medicData.identity}/imagen.jpg`);
        }
      }
    }
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

  selectSpecialty(description: string) {
    this.specialtyControl.setValue(description);
    this.suggestions = [];
  }

  async onSubmit() {

    try{
      this.spinner = true;
      if (!this.imageFile || !this.imageFile2) {
        this.toggleAlertMessage(false, 1, 'Seleccionar Imagenes', 'Debe seleccionar dos imagenes para poder continuar');
        return;
      }
  
      const patientData = this.registerPatient.value;

      const dataPatients = await this.supabaseService.supabaseClient
              .from('usuarios')
              .select('*')
              .eq('dni', patientData.identityP)
              .maybeSingle();

      const mailPatients = await this.supabaseService.supabaseClient
              .from('usuarios')
              .select('*')
              .eq('mail', patientData.emailP)
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
      const { data, error } = await this.supabaseService.signUp(patientData.emailP, patientData.passwordP);
  
      const uuid = data.user?.id;
      if (!uuid) return;
  
      // 2️⃣ Insertar en tabla usuarios
      const usuario = {
        id_usuario: uuid,
        nombre: patientData.nameP,
        perfil: 'Paciente',
        mail: patientData.emailP
      };
      const userInserted = await this.supabaseService.insertUser(usuario);

      if(userInserted.error){
        this.toggleAlertMessage(false, 1, 'Error al insertar el usuario', 'Error');
        console.log(userInserted.error);
      }
  
      // 3️⃣ Insertar en tabla pacientes
      const paciente = {
        id_paciente: uuid,
        nombre: patientData.nameP,
        apellido: patientData.surnameP,
        edad: patientData.ageP,
        dni: patientData.identityP,
        obra_soc: patientData.insuranceP,
        imagen_uno: `pacientes/DNI-${patientData.identityP}/imagen1.jpg`,
        imagen_dos: `pacientes/DNI-${patientData.identityP}/imagen2.jpg`,
        mail:patientData.emailP,
      };

      const patientInserted = await this.supabaseService.insertPatient(paciente);
  
      console.log(userInserted);
      console.log(patientInserted);

      if(patientInserted.error == null && userInserted.error == null){

        const errorOne = await this.supabaseService.uploadImage('clinica', `pacientes/DNI-${patientData.identityP}/imagen1.jpg`, this.imageFile);
        const errorTwo = await this.supabaseService.uploadImage('clinica', `pacientes/DNI-${patientData.identityP}/imagen2.jpg`, this.imageFile2);

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
      if (!this.imageFile) {
        this.toggleAlertMessage(false, 1, 'Seleccionar Imagen', 'Debe seleccionar una imagen para poder continuar');
        return;
      }
  
      const medicData = this.registerMedic.value;

      const dataMedics = await this.supabaseService.supabaseClient
              .from('usuarios')
              .select('*')
              .eq('dni', medicData.identityM)
              .maybeSingle();

      const mailMedics = await this.supabaseService.supabaseClient
              .from('usuarios')
              .select('*')
              .eq('mail', medicData.emailM)
              .maybeSingle();

      const itExists = await this.supabaseService.supabaseClient.from('especialidades').select('*')
              .eq('descripcion', medicData.specialtyM).single();


      console.log(itExists);
      console.log(dataMedics);
      console.log(mailMedics);

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
      const { data, error } = await this.supabaseService.signUp(medicData.emailM, medicData.passwordM);

      console.log(data);
      console.log(error);
  
      const uuid = data.user?.id;
      if (!uuid) return;
  
      // 2️⃣ Insertar en tabla usuarios
      const user = {
        id_usuario: uuid,
        nombre: medicData.nameM,
        perfil: 'Especialista',
        mail: medicData.emailM
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
        mail:medicData.emailM,
      };

      const patientInserted = await this.supabaseService.insertSpecialist(medic);
  
      console.log(userInserted);
      console.log(patientInserted);

      if(patientInserted.error == null && userInserted.error == null){

        await this.supabaseService.uploadImage('clinica', `especialistas/DNI-${medicData.identityM}/imagen.jpg`, this.imageFile);

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
    this.registerAdmin.reset();
    this.registerMedic.reset();
    this.registerPatient.reset();
    this.showUsersOnSystem = false;
    this.enableSpecialist = false;
    this.registerNewAdmin = false;
    this.condition = true;
    this.imageFile = null;
    this.imageFile2 = null;
    this.imagePreview = null;
    this.imagePreview2 = null;
    this.imagePreviewMax = null;
    this.showPassword = false;
    this.registerAdminFlag = false;
    this.registerMedicFlago = false;
    this.registerPatietnFlag = false;
    this.captchaValid = false;
  }

}
