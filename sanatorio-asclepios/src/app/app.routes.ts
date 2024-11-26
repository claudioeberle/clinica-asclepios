import { Routes } from '@angular/router';
import { HomeComponent } from './componentes/home/home.component';
import { LoginComponent } from './componentes/login/login.component';
import { RegistroComponent } from './componentes/altas/registro/registro.component';
import { ConsolaComponent } from './componentes/consola/consola.component';
import { UsuariosComponent } from './componentes/usuarios/usuarios.component';
import { SpinnerComponent } from './componentes/spinner/spinner.component';
import { ContactoComponent } from './componentes/contacto/contacto.component';
import { RegistroPacienteComponent } from './componentes/altas/registro-paciente/registro-paciente.component';
import { RegistroEspecialistasComponent } from './componentes/altas/registro-especialistas/registro-especialistas.component';
import { RegistroAdminComponent } from './componentes/altas/registro-admin/registro-admin.component';
import { sesionGuard } from './guards/sesion.guard';
import { AltaTurnoComponent } from './componentes/turnos/alta-turno/alta-turno.component';
import { PerfilComponent } from './componentes/perfil/perfil.component';
import { MisTurnosPacienteComponent } from './componentes/turnos/mis-turnos-paciente/mis-turnos-paciente.component';
import { MisTurnosEspecialistaComponent } from './componentes/turnos/mis-turnos-especialista/mis-turnos-especialista.component';
import { TurnosComponent } from './componentes/turnos/turnos/turnos.component';
import { PacientesComponent } from './componentes/pacientes/pacientes.component';
import { EstadisticasComponent } from './componentes/estadisticas/estadisticas.component';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: "full" },
    { path: 'logout', redirectTo: '/home' },
    { path: 'home',component: HomeComponent },
    { path: 'login',component: LoginComponent },
    { path: 'registro',component: RegistroComponent},
    { path: 'registro-paciente',component: RegistroPacienteComponent },
    { path: 'registro-especialistas',component: RegistroEspecialistasComponent },
    { path: 'registro-admin',component: RegistroAdminComponent, canActivate: [sesionGuard, adminGuard] },
    { path: 'servicios', component: ConsolaComponent, canActivate: [sesionGuard], data: { animation: 'animation1' } },
    { path: 'usuarios', component: UsuariosComponent, canActivate: [sesionGuard], data: { animation: 'animation2' } },
    { path: 'spinner', component: SpinnerComponent },
    { path: 'contacto', component: ContactoComponent, data: { animation: 'animation2' } },
    { path: 'turnos-alta', component: AltaTurnoComponent, canActivate: [sesionGuard]},
    { path: 'turnos-misturnos-paciente', component: MisTurnosPacienteComponent, canActivate: [sesionGuard], data: { animation: 'animation2' } },
    { path: 'turnos-misturnos-especialista', component: MisTurnosEspecialistaComponent, canActivate: [sesionGuard], data: { animation: 'animation2' } },
    { path: 'turnos', component: TurnosComponent, canActivate: [sesionGuard], data: { animation: 'animation2' } },
    { path: 'perfil', component: PerfilComponent, canActivate: [sesionGuard], data: { animation: 'animation2' } },
    { path: 'pacientes', component: PacientesComponent, canActivate: [sesionGuard], data: { animation: 'animation2' } },
    { path: 'estadisticas', component: EstadisticasComponent, canActivate: [sesionGuard, adminGuard], data: { animation: 'animation2' } }

];
