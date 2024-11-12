import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { inject } from '@angular/core';


export const sesionGuard: CanActivateFn = (route, state) => {
  const session = inject(AuthService);
  const router = inject(Router);

  if(!session.esSesionActiva()){
    router.navigateByUrl("/");
  }

  return session.esSesionActiva();
};
