import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { usuario } from '../../interfaces/usuario';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FiltroPorTipoUsrPipe } from '../../pipes/filtro-por-tipo-usr.pipe';
import { doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { UsuariosService } from '../../services/usuarios.service';
import { SpinnerService } from '../../services/spinner.service';
import { CuentaValidaPipe } from '../../pipes/cuenta-valida.pipe';
import { FotoUsuarioPipe } from '../../pipes/foto-usuario.pipe';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    FiltroPorTipoUsrPipe,
    CuentaValidaPipe,
    FotoUsuarioPipe],

  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit{
  
  usuarios$!: Observable<usuario[]>;
  tipoSeleccionado: string = '';
  usuarioSeleccionado:any;
  prompt:string= '';

  constructor(
    private firestore: Firestore,
    private usrService: UsuariosService,
    private spinnerService:SpinnerService
  ) {
    this.usuarios$ = this.usrService.getUsuariosId().pipe(
      map((users: any[]) => users.map(user => user as usuario))
    );
  }

  ngOnInit(): void {
    this.showSpinner();
  }

  async activarUsuario(usuario: usuario): Promise<void> {
    try {

      const usuarioDoc = doc(this.firestore, `usuarios/${usuario.id}`);
      const nuevoEstado = !usuario.cuenta_valida;

      await updateDoc(usuarioDoc, { cuenta_valida: nuevoEstado });
      this.prompt = `Usuario ${usuario.email} modificado: ${nuevoEstado ? 'Activado' : 'Desactivado'}`;
      setTimeout(() => {
        this.prompt = '';
      }, 2000);
    } catch (error) {
      console.error('Error al modificar el usuario: ', error);
    }
  }

  showSpinner(): void {
    this.spinnerService.show();
    setTimeout(() => {
      this.spinnerService.hide();
    }, 1000);
  }

}