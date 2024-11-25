import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timestamp',
  standalone: true
})
export class TimestampPipe implements PipeTransform {

  transform(value: any): string {
    if (!value) return '';
    
    const timestamp = value.seconds * 1000;
    const date = new Date(timestamp);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }

}
