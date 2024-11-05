import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-consola',
  standalone: true,
  imports: [],
  templateUrl: './consola.component.html',
  styleUrl: './consola.component.scss'
})
export class ConsolaComponent {

  constructor(private router:Router){}

  goTo(componente:string){
    this.router.navigateByUrl(componente);
  }
}
