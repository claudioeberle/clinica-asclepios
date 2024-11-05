import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { usuario } from '../../interfaces/usuario';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { SpinnerService } from '../../services/spinner.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent implements OnInit{

  public altaFormPaciente: FormGroup;
  public altaFormEspecialista: FormGroup;
  public altaFormAdmin: FormGroup;
  public prompt:string = '';
  public tipoRegistro: string = '';
  public isOtraEspecialidad = false;
  public fotoPerfil1Error = false;
  public fotoPerfil2Error = false;
  public fotoPerfil1Base64: string | null = null;
  public fotoPerfil2Base64: string | null = null;
  public perfil1src = "https://placehold.co/150";
  public perfil2src = "https://placehold.co/150";
  public formData:any;
  public email:string = '';
  public usuarioLogueado:any;
  public esUsuarioAdmin = false;


  constructor(
    private fb: FormBuilder, 
    private firestore:Firestore,
    private router:Router,
    private auth:AuthService,
    private spinnerService:SpinnerService
  ) {

    this.altaFormPaciente = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(0), Validators.max(120)]],
      dni: ['', Validators.required],
      obra_social: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required],
      perfil1: ['', Validators.required],
      perfil2: ['', Validators.required],

    });

    this.altaFormEspecialista = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(18), Validators.max(65)]],
      dni: ['', Validators.required],
      especialidad: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required],
      perfil1: ['', Validators.required],
    });

    this.altaFormAdmin = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(18), Validators.max(65)]],
      dni: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required],
      perfil1: ['', Validators.required],
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

  onEspecialidadChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.isOtraEspecialidad = selectedValue === 'Otra';

    if (!this.isOtraEspecialidad) {
      this.altaFormEspecialista.get('especialidad')?.setValue(selectedValue);
    } else {
      this.altaFormEspecialista.get('especialidad')?.setValue('');
    }
  }

  updateEspecialidad(event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value;
    this.altaFormEspecialista.get('especialidad')?.setValue(inputValue);
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

            if(this.tipoRegistro === 'paciente'){
              this.altaFormPaciente.get('perfil1')?.setValue(this.fotoPerfil1Base64);
            }else if(this.tipoRegistro === 'especialista'){
              this.altaFormEspecialista.get('perfil1')?.setValue(this.fotoPerfil1Base64);
            }else{
              this.altaFormAdmin.get('perfil1')?.setValue(this.fotoPerfil1Base64);
            }
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
          console.log('ERROR: La Foto Perfil 1 es demasiado grande (máx. 50 KB)');
        } else if (perfil === 'perfil2') {
          this.fotoPerfil2Error = true;
          console.log('ERROR: La Foto Perfil 2 es demasiado grande (máx. 50 KB)');
        }
      }

    } else {
      
      if (perfil === 'perfil1') {
        this.fotoPerfil1Error = true;
        console.log('ERROR Foto Perfil 1 - Debe ser .JPG')
      } else if (perfil === 'perfil2') {
        this.fotoPerfil2Error = true;
        console.log('ERROR Foto Perfil 2 - Debe ser .JPG')
      }
    }
  }


  async onSubmit(): Promise<void> {
    if (this.tipoRegistro === 'paciente' 
      && this.altaFormPaciente.valid
    ) {
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

    } else if (this.tipoRegistro === 'especialista' 
      && this.altaFormEspecialista.valid
    ) {
        const alta = this.auth.AltaUsuario(this.altaFormEspecialista.get('email')?.value, this.altaFormEspecialista.get('contrasena')?.value);
        let formData: usuario = {
        id:'',
        nombre: this.altaFormEspecialista.get('nombre')?.value || '',
        apellido: this.altaFormEspecialista.get('apellido')?.value || '',
        edad: this.altaFormEspecialista.get('edad')?.value || 0,
        dni: this.altaFormEspecialista.get('dni')?.value || 0,
        email: this.altaFormEspecialista.get('email')?.value || '',
        obra_social: '',
        especialidad: this.altaFormEspecialista.get('especialidad')?.value || '',
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

    } else if (this.tipoRegistro === 'administrador' 
      && this.altaFormAdmin.valid
    ) {
        const alta = this.auth.AltaUsuario(this.altaFormAdmin.get('email')?.value, this.altaFormAdmin.get('contrasena')?.value);
        let formData: usuario = {
        id:'',
        nombre: this.altaFormAdmin.get('nombre')?.value || '',
        apellido: this.altaFormAdmin.get('apellido')?.value || '',
        edad: this.altaFormAdmin.get('edad')?.value || 0,
        dni: this.altaFormAdmin.get('dni')?.value || 0,
        email: this.altaFormAdmin.get('email')?.value || '',
        obra_social: '',
        especialidad: '',
        perfil1: this.fotoPerfil1Base64 || '',
        perfil2: '',
        cuenta_valida: false,
        esPaciente: false,
        esEspecialista: false,
        esAdmin: true,
        fechaAlta: new Date()
      };
      this.formData = formData;
      this.email = this.altaFormEspecialista.get('email')?.value;

    }else {
      this.tipoRegistro === 'paciente' ? this.altaFormPaciente.markAllAsTouched() : this.altaFormEspecialista.markAllAsTouched();
      console.log('Datos incorrectos!');
      console.log('tipo: ' + this.tipoRegistro);
      console.log('Formulario inválido:', this.altaFormPaciente.errors, this.altaFormEspecialista.errors);
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
        console.log(`${this.tipoRegistro} guardado exitosamente!`);
      }     
    } catch (error) {
      Swal.fire({
        title: "Error Guardado",
        text: `Error al guardar el ${this.tipoRegistro}: `,
        icon: "error"
      });
      console.error(`Error al guardar el ${this.tipoRegistro}: `, error);
    }
  }

}