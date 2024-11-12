import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { map, Observable } from 'rxjs';
import { usuario } from '../interfaces/usuario';

@Injectable({
  providedIn: 'root'
})
export class EspecialistasService {

  constructor(private firestore:Firestore, private authService:AuthService) { }

  GetAllEspecialistas(): Observable<usuario[]> {
    return this.authService.getAllUsers().pipe(
      map((usuarios) => usuarios.filter(usuario => usuario.esEspecialista === true))
    );
  }

  

}
