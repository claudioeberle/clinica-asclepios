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

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: "full" },
    { path: 'logout', redirectTo: '/home' },
    { path: 'home',component: HomeComponent },
    { path: 'login',component: LoginComponent },
    { path: 'registro',component: RegistroComponent },
    { path: 'registro-paciente',component: RegistroPacienteComponent },
    { path: 'registro-especialistas',component: RegistroEspecialistasComponent },
    { path: 'registro-admin',component: RegistroAdminComponent },
    { path: 'servicios', component: ConsolaComponent, canActivate: [sesionGuard]},
    { path: 'usuarios', component: UsuariosComponent, canActivate: [sesionGuard]},
    { path: 'spinner', component: SpinnerComponent },
    { path: 'contacto', component: ContactoComponent },
    { path: 'turno-alta', component: AltaTurnoComponent, canActivate: [sesionGuard]},
    { path: 'perfil', component: PerfilComponent, canActivate: [sesionGuard]}

];
