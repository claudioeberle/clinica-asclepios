import { Component, Input, Output, EventEmitter, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Turno } from '../../interfaces/turno';

@Component({
  selector: 'app-historia-clinica',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './historia-clinica.component.html',
  styleUrls: ['./historia-clinica.component.scss']
})
export class HistoriaClinicaComponent {
  historiaForm: FormGroup;
  turno:Turno;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<HistoriaClinicaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { turno: Turno }
  ) {
    this.turno = data.turno;
    this.historiaForm = this.fb.group({
      altura: [null, [Validators.required, Validators.min(30), Validators.max(250)]],
      peso: [null, [Validators.required, Validators.min(2), Validators.max(300)]],
      temperatura: [null, [Validators.required, Validators.min(30), Validators.max(45)]],
      presion: [null, [Validators.required]],
      datosDinamicos: this.fb.array([])
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

      const historia = {
        fecha_atencion:new Date(),
        paciente:`${this.turno.paciente?.nombre} ${this.turno.paciente?.apellido}`,
        especialista:`${this.turno.especialista?.nombre} ${this.turno.especialista?.apellido}`,
        especialidad: this.turno.especialidad,
        diagnostico: this.turno.diagnostico,
        historiaClinica : this.historiaForm.value
      }
      this.dialogRef.close(historia);
    }
  }

  cancelar(): void{
    this.dialogRef.close(null);
  }

}
