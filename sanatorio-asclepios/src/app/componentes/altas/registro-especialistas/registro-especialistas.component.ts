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

@Component({
  selector: 'app-registro-especialistas',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RecaptchaFormsModule, RecaptchaModule],
  templateUrl: './registro-especialistas.component.html',
  styleUrl: './registro-especialistas.component.scss'
})
export class RegistroEspecialistasComponent {

  public altaFormEspecialista: FormGroup;
  public isOtraEspecialidad = false;
  public fotoPerfil1Error = false;
  public fotoPerfil1Base64: string | null = null;
  public perfil1src = "https://placehold.co/150";
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
    this.altaFormEspecialista = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      edad: ['', [Validators.required]],
      dni: ['', [Validators.required]],
      especialidad: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required]],
      perfil1: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.usuarioLogueado = this.auth.getCurrentUser();
    this.esUsuarioAdmin = this.auth.esUsuarioAdmin();
    this.showSpinner();
    this.especialidadesService.getEspecialidades().subscribe((especialidades) => {
      this.especialidades = especialidades;
      console.log('Especialidades cargadas:', this.especialidades);
    });
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

  agregarEspecialidad(nombre:string){
    this.especialidadesElegidas.push(nombre);
  }

  agregarNuevaEspecialidad(nuevaEspecialidad:string) {
    if (nuevaEspecialidad.trim() === '') {
      Swal.fire({
        title: "Campo vacío",
        text: "Por favor, ingrese una especialidad.",
        icon: "warning"
      });
      return;
    }
  
    console.log('Nueva especialidad: ' + nuevaEspecialidad);
    this.especialidadesService.agregarEspecialidad(nuevaEspecialidad.trim());
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
            this.altaFormEspecialista.get('perfil1')?.setValue(this.fotoPerfil1Base64);
          }
        };
        reader.readAsDataURL(file);

      } else {
        if (perfil === 'perfil1') {
          this.fotoPerfil1Error = true;
          this.perfil1src = '';
          console.log('ERROR: La Foto Perfil 1 es demasiado grande (máx. 50 KB)');
        }
      }
    } else {    
      this.fotoPerfil1Error = true;
      this.perfil1src = '';
      console.log('ERROR Foto Perfil 1 - Debe ser .JPG')
    }
  }

  async onSubmit(): Promise<void> {

    if (this.altaFormEspecialista.valid) {
      const alta = this.auth.AltaUsuario(this.altaFormEspecialista.get('email')?.value, this.altaFormEspecialista.get('contrasena')?.value);
        let formData: usuario = {
        id:'',
        nombre: this.altaFormEspecialista.get('nombre')?.value || '',
        apellido: this.altaFormEspecialista.get('apellido')?.value || '',
        edad: this.altaFormEspecialista.get('edad')?.value || 0,
        dni: this.altaFormEspecialista.get('dni')?.value || 0,
        email: this.altaFormEspecialista.get('email')?.value || '',
        obra_social: '',
        especialidad: this.especialidadesElegidas.join(', '),
        perfil1: this.fotoPerfil1Base64 || '',
        perfil2: '',
        cuenta_valida: false,
        esPaciente: false,
        esEspecialista: true,
        esAdmin: false,
        fechaAlta: new Date()
      };
      this.formData = formData;
      this.email = this.altaFormEspecialista.get('email')?.value;

    }else {
      this.altaFormEspecialista.markAllAsTouched();
      console.log('Datos incorrectos!');
      console.log('tipo: Especialista');
      console.log('Formulario inválido:', this.altaFormEspecialista.errors);
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
        console.log(`Especialista guardado exitosamente!`);
      }
    } catch (error) {
      Swal.fire({
        title: "Error Guardado",
        text: `Error al guardar el nuevo Especialista `,
        icon: "error"
      });
      console.error(`Error al guardar el Especialista: `, error);
    }
  }

}