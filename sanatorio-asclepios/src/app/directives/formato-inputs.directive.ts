import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appFormatoInputs]',
  standalone: true
})
export class FormatoInputsDirective {

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInputChange(event: Event): void {
    const inputElement = this.el.nativeElement as HTMLInputElement;
    let value = inputElement.value.toLowerCase();

    value = value.replace(/\b\w/g, (char) => char.toUpperCase());
    inputElement.value = value;

    inputElement.dispatchEvent(new Event('input'));
  }
  
}
