import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'turnoHora',
  standalone: true
})
export class TurnoHoraPipe implements PipeTransform {

  transform(value: string): string {
    const [hora, minuto] = value.split(':').map(Number);

    let horaAMPM = hora % 12;
    horaAMPM = horaAMPM ? horaAMPM : 12;
    const ampm = hora < 12 ? 'AM' : 'PM';

    return `${horaAMPM}:${minuto.toString().padStart(2, '0')}${ampm}`;
  }

}
