import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';

@Component({
  selector: 'app-historia-clinica',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './historia-clinica.component.html',
  styleUrls: ['./historia-clinica.component.scss']
})
export class HistoriaClinicaComponent {
  @Input() turno: any;
  @Output() historiaGuardada = new EventEmitter<any>();

  historiaForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.historiaForm = this.fb.group({
      altura: [null, [Validators.required, Validators.min(50), Validators.max(250)]], // cms
      peso: [null, [Validators.required, Validators.min(2), Validators.max(300)]], // kgs
      temperatura: [null, [Validators.required, Validators.min(30), Validators.max(45)]], // ºC
      presion: [null, [Validators.required]], // mmHg
      datosDinamicos: this.fb.array([]) // Clave-valor dinámico
    });
  }

  get datosDinamicos(): FormArray {
    return this.historiaForm.get('datosDinamicos') as FormArray;
  }

  agregarDatoDinamico(): void {
    if (this.datosDinamicos.length < 3) {
      this.datosDinamicos.push(
        this.fb.group({
          clave: ['', Validators.required],
          valor: ['', Validators.required]
        })
      );
    }
  }

  eliminarDatoDinamico(index: number): void {
    this.datosDinamicos.removeAt(index);
  }

  guardar(): void {
    if (this.historiaForm.valid) {
      this.historiaGuardada.emit(this.historiaForm.value);
    }
  }
}
