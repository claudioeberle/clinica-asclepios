import { CommonModule } from '@angular/common';
import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { SpinnerService } from '../../../services/spinner.service';
import { RegistroPacienteComponent } from '../registro-paciente/registro-paciente.component';
import { RegistroEspecialistasComponent } from '../registro-especialistas/registro-especialistas.component';
import { RegistroAdminComponent } from '../registro-admin/registro-admin.component';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule, 
    RegistroPacienteComponent,
    RegistroEspecialistasComponent,
    RegistroAdminComponent],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent implements OnInit{

  public tipoRegistro: string = '';
  public usuarioLogueado:any;
  public esUsuarioAdmin = false;
  
  constructor(
    private auth:AuthService,
    private spinnerService:SpinnerService,
  ) {}

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

  goTo(destino: string) {
    this.tipoRegistro = destino;
  }
}