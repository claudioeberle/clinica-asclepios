import { Component } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { usuario } from '../../../interfaces/usuario';
import { AuthService } from '../../../services/auth.service';
import { SpinnerService } from '../../../services/spinner.service';
import { CommonModule } from '@angular/common';
import { RecaptchaModule, RecaptchaFormsModule } from "ng-recaptcha";

@Component({
  selector: 'app-registro-admin',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, RecaptchaFormsModule, RecaptchaModule],
  templateUrl: './registro-admin.component.html',
  styleUrl: './registro-admin.component.scss'
})
export class RegistroAdminComponent {
  public altaFormAdmin: FormGroup;
  public prompt:string = '';
  public tipoRegistro: string = '';
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

  constructor(
    private fb: FormBuilder, 
    private firestore:Firestore,
    private router:Router,
    private auth:AuthService,
    private spinnerService:SpinnerService,
  ) {
    this.altaFormAdmin = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$'), Validators.maxLength(20)]],
      apellido: ['', [Validators.required, Validators.pattern('[A-Za-zÀ-ÿ ]'), Validators.maxLength(50)]],
      edad: ['', [Validators.required, Validators.min(0), Validators.max(65)]],
      dni: ['', [Validators.required, Validators.min(1000000), Validators.max(99000000)]],
      email: ['', [Validators.required, Validators.email]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
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
          this.fotoPerfil1Base64 = reader.result as string;
          this.fotoPerfil1Error = false;
          this.perfil1src = this.fotoPerfil1Base64;
          this.altaFormAdmin.get('perfil1')?.setValue(this.fotoPerfil1Base64);
          console.log('Foto Perfil 1 cargado OK')
        };
        reader.readAsDataURL(file);

      } else {
        this.fotoPerfil1Error = true;
        this.perfil1src = '';
        console.log('ERROR: La Foto Perfil 1 es demasiado grande (máx. 50 KB)');
      }
    } else {
      this.fotoPerfil1Error = true;
      this.perfil1src = '';
      console.log('ERROR Foto Perfil 1 - Debe ser .JPG')
    }
  }


  async onSubmit(): Promise<void> {

    if (this.altaFormAdmin.valid && !this.fotoPerfil1Error) {
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
      this.email = this.altaFormAdmin.get('email')?.value;

    }else {
      this.altaFormAdmin.markAllAsTouched();
      this.fotoPerfil1Error = true;
      console.log('Datos incorrectos!');
      console.log('tipo: ' + this.tipoRegistro);
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