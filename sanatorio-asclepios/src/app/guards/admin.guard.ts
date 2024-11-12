import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = (route, state) => {
  const session = inject(AuthService);
  const router = inject(Router);

  if(!session.esUsuarioAdmin()){
    router.navigateByUrl("/");
  }

  return session.esUsuarioAdmin();
};
