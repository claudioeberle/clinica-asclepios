import { CanActivateFn } from '@angular/router';

export const especialistaGuard: CanActivateFn = (route, state) => {
  return true;
};
