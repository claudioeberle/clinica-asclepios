import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHighlightEstado]',
  standalone: true
})
export class HighlightEstadoDirective implements OnChanges {
  @Input() appHighlightEstado: string = '';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(): void {
    this.updateBackgroundColor();
  }

  private updateBackgroundColor(): void {
    let backgroundColor = '';

    switch (this.appHighlightEstado.toLowerCase()) {
      case 'aceptado':
      case 'realizado':
        backgroundColor = '#d4edda';
        break;
      case 'cancelado':
      case 'rechazado':
        backgroundColor = '#f8d7da';
        break;
      case 'pendiente':
        backgroundColor = '#fff3cd';
        break;
      default:
        backgroundColor = '#ffffff';
        break;
    }

    this.renderer.setStyle(this.el.nativeElement, 'background-color', backgroundColor);
    this.renderer.setStyle(this.el.nativeElement, 'color', '#000');
  }
}
