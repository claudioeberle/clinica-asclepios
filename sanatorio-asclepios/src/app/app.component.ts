import { Component, HostBinding, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { LoginComponent } from "./componentes/login/login.component";
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { SpinnerComponent } from './componentes/spinner/spinner.component';
import { SpinnerService } from './services/spinner.service';
import { sideBarAnimation, spinAnimation, modalAnimation, slideInAnimation } from '../animations';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, LoginComponent, CommonModule, SpinnerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    modalAnimation, 
    sideBarAnimation, 
    spinAnimation,
    slideInAnimation
  ]
})
export class AppComponent implements OnInit{

  title = 'sanatorio-asclepios';
  isSidebarOpen = false;
  isLoginModalOpen = false;
  isModalOpen = false;
  usuario: any = false;
  isLoading = false;
  spin = true;

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

  @HostBinding('@routeAnimations') get triggerAnimation() {
    return true;
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }

  ngOnInit(): void {
    this.showSpinner(5000);
    setInterval(() => {
      this.spin = !this.spin;
    }, 5000);
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
    console.log(this.isSidebarOpen == true);

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
