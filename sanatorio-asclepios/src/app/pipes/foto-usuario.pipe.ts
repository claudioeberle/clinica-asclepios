import { Pipe, PipeTransform } from '@angular/core';
import { usuario } from '../interfaces/usuario';

@Pipe({
  name: 'fotoUsuario',
  standalone: true
})
export class FotoUsuarioPipe implements PipeTransform {

  transform(user: usuario, fotoIndex: number = 1): string {
    if (!user) return '';

    if (user.esPaciente) {
      return fotoIndex === 1 ? user.perfil1 : user.perfil2;
    }
    return user.perfil1;
  }
}

