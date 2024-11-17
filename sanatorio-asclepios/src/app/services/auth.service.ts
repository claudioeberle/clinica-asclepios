import { Injectable, OnInit } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, User } from '@angular/fire/auth';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { usuario } from '../interfaces/usuario';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService{

  private usuarioSubject = new BehaviorSubject<any>(false);
  usuario$ = this.usuarioSubject.asObservable();
  public usersCollection:any[] = [];
  tempUsr:any;

  constructor(
    private auth:Auth, 
    private firestore:Firestore,
    private router:Router
  ) {

    this.getAllUsers().subscribe(users => {
      this.usersCollection = users;
    });
  }

  async Autenticar(correo:string, contrasena:string): Promise<any>{
    try {
      const res = await signInWithEmailAndPassword(this.auth, correo, contrasena);
      if(res){
        console.log(this.usersCollection);
        this.tempUsr = this.getUserbyEmail(correo);
        this.usuarioSubject.next(this.tempUsr);
        return this.tempUsr;
      }
    }catch (e: any) {
      console.log('error en authService');
      console.log(e);
      return false;
    }
  }

  getCurrentUser(){
    return this.usuarioSubject.getValue();
  }


  getAllUsers(): Observable<usuario[]> {
    const col = collection(this.firestore, 'usuarios');
    return collectionData(col, { idField: 'id' }) as Observable<usuario[]>;
  }

  GetAllPacientes(): Observable<usuario[]> {
    return this.getAllUsers().pipe(
      map((usuarios) => usuarios.filter(usuario => usuario.esPaciente === true))
    );
  }

  getUserbyEmail(correo:string){
    const user = this.usersCollection.find(user => user.email == correo);
    if (user) {
      return user;
    }else{
      return null;
    }
  }

  cerrarSesion(){
    this.usuarioSubject.next(false);
    this.router.navigateByUrl('home');
    console.log('Sesión cerrada');
  }

  async AltaUsuario(correo:string, contrasena:string){
    this.tempUsr = null;
    this.tempUsr = this.getCurrentUser();
      const userCredential = await createUserWithEmailAndPassword(this.auth, correo, contrasena)
      .then(async (res) =>{
        sendEmailVerification(res.user);
        if(this.tempUsr){
          this.auth.updateCurrentUser(this.tempUsr);
          console.log('usuario logueado: ' + this.auth.currentUser);
          return false;
        }
        this.auth.updateCurrentUser(null);
        this.auth.signOut();
        return false;
      })
      .catch((e) => {
        return e.code;
      });
  }

  EmailVerificado(){
    return this.auth.currentUser?.emailVerified
  }

  SetUsuario(usuario:any){
    this.usuarioSubject.next(usuario);
  }

  esUsuarioAdmin(){
    const usuario = this.getCurrentUser();
    return usuario ? usuario.esAdmin : false;
  }

  esUsuarioEspecialista(){
    const usuario = this.getCurrentUser();
    return usuario ? usuario.esEspecialista : false;
  }

  esSesionActiva(){
    return this.auth.currentUser != null;
  }

  
}
