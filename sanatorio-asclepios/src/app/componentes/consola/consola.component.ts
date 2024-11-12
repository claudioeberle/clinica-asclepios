import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consola',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './consola.component.html',
  styleUrl: './consola.component.scss'
})
export class ConsolaComponent {

  esAdmin:boolean = false;
  esEspecialista:boolean = false;
  esPaciente:boolean = false;

  constructor(private router:Router, private auth:AuthService){

    if(this.auth.esUsuarioAdmin()){
      this.esAdmin = true;
    } else if(this.auth.esUsuarioEspecialista()){
      this.esEspecialista = true;
    } else {
      this.esPaciente = true;
    }
  }

  goTo(componente:string){
    this.router.navigateByUrl(componente);
  }
}
