import { Pipe, PipeTransform } from '@angular/core';
import { usuario } from '../interfaces/usuario';

@Pipe({
  name: 'filtroPorTipoUsr',
  standalone: true
})
export class FiltroPorTipoUsrPipe implements PipeTransform {

  transform(usuarios: usuario[], tipoUsuario: string): usuario[] {
    if (!usuarios || !tipoUsuario) {
      return usuarios || [];
    }
    
    return usuarios.filter(user => {
      if (tipoUsuario === 'Paciente') {
        return user.esPaciente;
      } else if (tipoUsuario === 'Especialista') {
        return user.esEspecialista;
      } else if (tipoUsuario === 'Administrador') {
        return user.esAdmin;
      }
      return false;
    });
  }
}
