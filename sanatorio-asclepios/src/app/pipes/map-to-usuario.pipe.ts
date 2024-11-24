import { Pipe, PipeTransform } from '@angular/core';
import { usuario } from '../interfaces/usuario';

@Pipe({
  name: 'mapToUsuario',
  standalone: true
})
export class MapToUsuarioPipe implements PipeTransform {

  transform(users: any[]): usuario[] {
    return users.map(user => user as usuario);
  }

}
