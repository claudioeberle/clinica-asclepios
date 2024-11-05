import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { LoginComponent } from "./componentes/login/login.component";
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { SpinnerComponent } from './componentes/spinner/spinner.component';
import { SpinnerService } from './services/spinner.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, LoginComponent, CommonModule, SpinnerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  title = 'sanatorio-asclepios';
  isSidebarOpen = false;
  isLoginModalOpen = false;
  isModalOpen = false;
  usuario: any = false;
  isLoading = false;

  constructor(
    private router:Router, 
    private authService:AuthService,
    private spinnerService: SpinnerService){

    this.authService.usuario$.subscribe(usuario => {
      this.usuario = usuario;
    });

    this.spinnerService.spinner$.subscribe(
      (loading: boolean) => {
        this.isLoading = loading;
      }
    );
  }

  ngOnInit(): void {
    this.showSpinner(5000);
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  goTo(ruta:string){
    this.router.navigateByUrl(ruta);
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
  }

  showSpinner(milisec:number): void {
    this.spinnerService.show();
    setTimeout(() => {
      this.spinnerService.hide();
    }, milisec);
  }
}
