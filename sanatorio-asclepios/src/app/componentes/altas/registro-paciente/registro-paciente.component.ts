import { Component } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { usuario } from '../../../interfaces/usuario';
import { AuthService } from '../../../services/auth.service';
import { EspecialidadesService } from '../../../services/especialidades.service';
import { SpinnerService } from '../../../services/spinner.service';
import { CommonModule } from '@angular/common';
import { RecaptchaModule, RecaptchaFormsModule } from "ng-recaptcha";
import { FormatoInputsDirective } from '../../../directives/formato-inputs.directive';

@Component({
  selector: 'app-registro-paciente',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    FormsModule, 
    CommonModule, 
    RecaptchaFormsModule, 
    RecaptchaModule,
    FormatoInputsDirective
  ],
  templateUrl: './registro-paciente.component.html',
  styleUrl: './registro-paciente.component.scss'
})
export class RegistroPacienteComponent {

  public altaFormPaciente: FormGroup;
  public prompt:string = '';
  public isOtraEspecialidad = false;
  public fotoPerfil1Error = true;
  public fotoPerfil2Error = true;
  public fotoPerfil1Base64: string | null = null;
  public fotoPerfil2Base64: string | null = null;
  public perfil1src = "https://placehold.co/150";
  public perfil2src = "https://placehold.co/150";
  public formData:any;
  public email:string = '';
  public usuarioLogueado:any;
  public esUsuarioAdmin = false;
  public captchaResponse: string | null = null;
  public altaExitosa = false;
  public especialidades: any[] = [];
  public especialidadesElegidas: any[] = [];


  constructor(
    private fb: FormBuilder, 
    private firestore:Firestore,
    private router:Router,
    private auth:AuthService,
    private spinnerService:SpinnerService,
    private especialidadesService:EspecialidadesService
  ) {

    this.altaFormPaciente = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'), Validators.maxLength(20)]],
      apellido: ['', [Validators.required, Validators.pattern('[A-Za-zÀ-ÿ ]'), Validators.maxLength(50)]],
      edad: ['', [Validators.required, Validators.min(0), Validators.max(65)]],
      dni: ['', [Validators.required, Validators.min(1000000), Validators.max(99000000)]],
      obra_social: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      perfil1: ['', Validators.required],
      perfil2: ['', Validators.required],

    });
  }

  ngOnInit(): void {
    this.usuarioLogueado = this.auth.getCurrentUser();
    this.esUsuarioAdmin = this.auth.esUsuarioAdmin();
    this.showSpinner();
  }

  showSpinner(): void {
    this.spinnerService.show();
    setTimeout(() => {
      this.spinnerService.hide();
    }, 1000);
  }

  resolved(captchaResponse: any) {
    this.captchaResponse = captchaResponse;
  }

  onFileSelected(event: Event, perfil: string) {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (file && file.type === 'image/jpeg') {
      const fileSizeInKB = file.size/1024;

      if (fileSizeInKB <= 50) {
        const reader = new FileReader();
        reader.onload = () => {

          if (perfil === 'perfil1') {
            this.fotoPerfil1Base64 = reader.result as string;
            this.fotoPerfil1Error = false;
            this.perfil1src = this.fotoPerfil1Base64;
            this.altaFormPaciente.get('perfil1')?.setValue(this.fotoPerfil1Base64);
            console.log('Foto Perfil 1 cargado OK')

          } else if (perfil === 'perfil2') {
            this.fotoPerfil2Base64 = reader.result as string;
            this.fotoPerfil2Error = false;
            this.perfil2src = this.fotoPerfil2Base64;
            this.altaFormPaciente.get('perfil2')?.setValue(this.fotoPerfil2Base64);
            console.log('Foto Perfil 2 cargado OK')
          }
        };
        reader.readAsDataURL(file);

      } else {

        if (perfil === 'perfil1') {
          this.fotoPerfil1Error = true;
          this.perfil1src = '';
          console.log('ERROR: La Foto Perfil 1 es demasiado grande (máx. 50 KB)');
        } else if (perfil === 'perfil2') {
          this.fotoPerfil2Error = true;
          this.perfil2src = '';
          console.log('ERROR: La Foto Perfil 2 es demasiado grande (máx. 50 KB)');
        }
      }

    } else {
      
      if (perfil === 'perfil1') {
        this.fotoPerfil1Error = true;
        this.perfil1src = '';
        console.log('ERROR Foto Perfil 1 - Debe ser .JPG')
      } else if (perfil === 'perfil2') {
        this.fotoPerfil2Error = true;
        this.perfil2src = '';
        console.log('ERROR Foto Perfil 2 - Debe ser .JPG')
      }
    }
  }


  async onSubmit(): Promise<void> {

    if (this.altaFormPaciente.valid && !this.fotoPerfil1Error && !this.fotoPerfil2Error) {
        const alta = this.auth.AltaUsuario(this.altaFormPaciente.get('email')?.value, this.altaFormPaciente.get('contrasena')?.value);
        let formData: usuario = {
          id:'',
          nombre: this.altaFormPaciente.get('nombre')?.value || '',
          apellido: this.altaFormPaciente.get('apellido')?.value || '',
          edad: this.altaFormPaciente.get('edad')?.value || 0,
          dni: this.altaFormPaciente.get('dni')?.value || 0,
          email: this.altaFormPaciente.get('email')?.value || '',
          obra_social: this.altaFormPaciente.get('obra_social')?.value || '',
          especialidad: '',
          perfil1: this.fotoPerfil1Base64 || '',
          perfil2: this.fotoPerfil2Base64 || '',
          cuenta_valida: true,
          esPaciente: true,
          esEspecialista: false,
          esAdmin: false,
          fechaAlta: new Date()
        };
      this.formData = formData;
      this.email = this.altaFormPaciente.get('email')?.value;
    }else {
      this.altaFormPaciente.markAllAsTouched();
      console.log('Datos incorrectos!');
      console.log('Formulario inválido:', this.altaFormPaciente.errors);
      console.log('p1 ' + this.fotoPerfil1Error)
      console.log('p2 ' + this.fotoPerfil1Error)

      return;
    }

    try {
      const collectionRef = collection(this.firestore, 'usuarios');
      await addDoc(collectionRef, this.formData);
      if(this.esUsuarioAdmin){
        this.router.navigate(['servicios']);
        Swal.fire({
          title: "Alta exitosa",
          icon: "success"
        });
      }else{
        this.router.navigate(['home']);
        Swal.fire({
          title: "Valida tu Email para comenzar",
          text: "Hemos enviado un email a " + this.email,
          icon: "info"
        });
        console.log(`Guardado exitosamente!`);
      }     
    } catch (error) {
      Swal.fire({
        title: "Error Guardado",
        text: `Error al intentar crear el nuevo Paciente`,
        icon: "error"
      });
      console.error(`Error al guardar el Paciente`, error);
    }
  }

}