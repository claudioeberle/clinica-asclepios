import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cuentaValida',
  standalone: true
})
export class CuentaValidaPipe implements PipeTransform {

  transform(value: boolean): string {
    return value ? 'Activo' : 'Inactivo';
  }

}
