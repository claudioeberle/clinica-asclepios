import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  
  @Output() close = new EventEmitter<void>();

  correo = '';
  contrasena = '';
  prompt = '';

  constructor(
    private router:Router,
    private auth:AuthService
  ) {}

  closeModal() {
    this.close.emit();
  }

  onRegister() {
    this.router.navigateByUrl('registro');
    console.log('Ir a registro');
    this.closeModal();
  }

  async IniciarSesion(){
    const usuario = this.auth.getUserbyEmail(this.correo);

    if(usuario){
      const res = await this.auth.Autenticar(this.correo, this.contrasena);
      this.auth.SetUsuario(null);
      if(res){
        if((usuario.esPaciente && this.auth.EmailVerificado()) 
        || (usuario.esEspecialista && this.auth.EmailVerificado() && usuario.cuenta_valida)
        || (usuario.esAdmin && usuario.cuenta_valida)){
          this.auth.SetUsuario(usuario);
          console.log(res);
          this.closeModal();
          this.router.navigateByUrl('servicios');
        } else if(!this.auth.EmailVerificado()){
          Swal.fire({title: "Su Email no ha sido validado aún.",text: "Verifique su correo.", icon: "error"});

        }else{
          Swal.fire({title: "Su cuenta se encuentra deshabilitada.",text: "Contacte al Administrador.",icon: "error"});
        }
        this.LimpiarCampos();

      }else{
        this.MostrarError('Error de Usuario y/o Contrasena');
      }
    }else{
      this.MostrarError('El usuario no existe. Regístrese.');
    }
  }

  MostrarError(mensaje:string){
    this.prompt = mensaje;
    setTimeout(()=>{
      this.prompt = ''
    }, 2000)
  }

  LimpiarCampos(){
    this.correo = '';
    this.contrasena = '';
  }

  cargaUser(tipo:string){
    if(tipo === 'paciente'){
      this.correo = 'gijec46023@acroins.com'
    }else if(tipo === 'especialista'){
      this.correo = 'claudioeberle@gmail.com'
    } else {
      this.correo = 'mamopoy258@edectus.com'
    }
    this.contrasena = '123456'
  }
}