import { Routes } from '@angular/router';
import { HomeComponent } from './componentes/home/home.component';
import { LoginComponent } from './componentes/login/login.component';
import { RegistroComponent } from './componentes/registro/registro.component';
import { ConsolaComponent } from './componentes/consola/consola.component';
import { UsuariosComponent } from './componentes/usuarios/usuarios.component';
import { SpinnerComponent } from './componentes/spinner/spinner.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: "full" },
    { path: 'logout', redirectTo: '/home' },
    { path: 'home',component: HomeComponent },
    { path: 'login',component: LoginComponent },
    { path: 'registro',component: RegistroComponent },
    { path: 'servicios', component: ConsolaComponent },
    { path: 'usuarios', component: UsuariosComponent },
    { path: 'spinner', component: SpinnerComponent },

];
