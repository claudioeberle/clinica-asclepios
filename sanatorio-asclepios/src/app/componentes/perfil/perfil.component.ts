import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { usuario } from '../../interfaces/usuario';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Disponibilidad } from '../../interfaces/disponibilidad';
import { DisponibilidadService } from '../../services/disponibilidad.service';
import Swal from 'sweetalert2';
import { TurnosService } from '../../services/turnos.service';
import { historiaClinica } from '../../interfaces/historiaClinica';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import { environment } from '../../../environment';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.scss'
})
export class PerfilComponent implements OnInit{

  usuario: usuario;
  mostrarPerfil1: boolean = true;
  prompt: string = '';
  especialidades: any[] = [];
  disponibilidad:any;
  especialistas: usuario[] = [];
  especialistaSeleccionado: string | usuario = 'Todos';
  historiasFiltradas:any;
  horario: { [key: string]: { dia: string; desde: string; hasta: string } } = {
    lunes: { dia: 'lunes', desde: '', hasta: '' },
    martes: { dia: 'martes', desde: '', hasta: '' },
    miercoles: { dia: 'miercoles', desde: '', hasta: '' },
    jueves: { dia: 'jueves', desde: '', hasta: '' },
    viernes: { dia: 'viernes', desde: '', hasta: '' },
    sabado: { dia: 'sabado', desde: '', hasta: '' }
  };

  constructor(
    private auth: AuthService, 
    private dispoServ:DisponibilidadService, 
    private cdRef: ChangeDetectorRef,
    private turnosServ:TurnosService
  ) {
    this.usuario = this.auth.getCurrentUser();
  }

  async ngOnInit(){
    this.actualizarHorarios();
    await this.cargarEspecialistas();
  }

  toggleFoto() {
    this.mostrarPerfil1 = !this.mostrarPerfil1;
  }

  obtenerOpcionesHorario(dia: string, tipo: 'desde' | 'hasta'): string[] {
    const opciones: string[] = [];
    let horaInicio: number;
    let horaFin: number;
  
    if (tipo === 'desde') {
      horaInicio = 8;
      horaFin = dia === 'sabado' ? 10 : 15;
    } 
    else {
      horaInicio = dia === 'sabado' ? 12 : 12;
      horaFin = dia === 'sabado' ? 14 : 19;
    }
  
    for (let i = horaInicio; i <= horaFin; i++) {
      opciones.push(`${i < 10 ? '0' + i : i}:00`);
    }
  
    return opciones;
  }

  esHorarioValido(): boolean {
    for (const dia in this.horario) {
      const desde = this.horario[dia].desde;
      const hasta = this.horario[dia].hasta;
  
      if (!desde || !hasta) continue;
  
      const desdeHora = parseInt(desde.split(':')[0], 10);
      const hastaHora = parseInt(hasta.split(':')[0], 10);
  
      if (hastaHora - desdeHora < 4) {
        return false;
      }
    }
    return true;
  }

  actualizarHorarios() {
    this.dispoServ.getDisponibilidadByEmail(this.usuario.email).subscribe({
      next: (disponibilidad) => {
        if (disponibilidad && disponibilidad.disponibilidad) {
          const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
          
          dias.forEach((dia, index) => {
            const disponibilidadDia = disponibilidad.disponibilidad[index];
            if (disponibilidadDia) {
              this.horario[dia].desde = disponibilidadDia.desde || '';
              this.horario[dia].hasta = disponibilidadDia.hasta || '';
            }
          });
  
          this.cdRef.detectChanges();
        } else {
          console.log('No se encontró disponibilidad para este especialista.');
        }
      },
      error: (error) => {
        console.error('Error al cargar la disponibilidad:', error);
      }
    });
  }

  ActualizarDisponibilidad() {
    if (this.esHorarioValido()) {
      Swal.fire({
        title: '¿Estás seguro de que deseas actualizar la disponibilidad?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          const disponibilidadConDia = this.convertirHorariosADisponibilidad();
  
          this.dispoServ.actualizarDisponibilidad(this.usuario.email, disponibilidadConDia)
            .then(() => {
              Swal.fire(
                '¡Actualizado!',
                'Tus horarios se han actualizado correctamente.',
                'success'
              );
            })
            .catch((error) => {
              Swal.fire(
                'Error',
                'Hubo un problema al actualizar los horarios.',
                'error'
              );
            });
        }
      });
    } else {
      this.MostrarMensaje('Hay rangos horarios de menos de 4 hs.');
    }
  }
  
  convertirHorariosADisponibilidad() {
    const disponibilidad: { dia: string; desde: string; hasta: string }[] = [];
    
    for (const dia in this.horario) {
      const { desde, hasta } = this.horario[dia];
      if (desde && hasta) {
        disponibilidad.push({
          dia: dia,
          desde: desde,
          hasta: hasta
        });
      }
    }
    return disponibilidad;
  }

  MostrarMensaje(mensaje:string){
    this.prompt = mensaje;
    setTimeout(() => {
      this.prompt = '';
    }, 2000);
  }

  async mostrarHistoriaClinica(): Promise<void> {
    const historiasClinicas = await this.turnosServ.getHistoriaClinicaCompleta(this.usuario.email);
  
    if (!historiasClinicas.length) {
      Swal.fire('Sin Historia Clínica', 'No hay atenciones registradas para este paciente.', 'info');
      return;
    }
  
    const historiaHtml = historiasClinicas
      .map(historia => `
        <div style="border: 1px solid #5f83b1; padding: 10px; margin-bottom: 10px; border-radius: 5px;">
          <h4 style="color: #5f83b1;">Atención</h4>
          <p><strong>Fecha de Atención:</strong> ${new Date(historia.fecha_atencion).toLocaleDateString()}</p>
          <p><strong>Especialidad:</strong> ${historia.especialidad}</p>
          <p><strong>Especialista:</strong> ${historia.especialista}</p>
          <p><strong>Diagnóstico:</strong> ${historia.diagnostico}</p>
          <hr />
          <p><strong>Altura:</strong> ${historia.historiaClinica.altura} cm</p>
          <p><strong>Peso:</strong> ${historia.historiaClinica.peso} kg</p>
          <p><strong>Temperatura:</strong> ${historia.historiaClinica.temperatura} °C</p>
          <p><strong>Presión:</strong> ${historia.historiaClinica.presion}</p>
          ${
            historia.historiaClinica.datosDinamicos?.length
              ? `<h5>Datos Dinámicos:</h5>
                 <ul>
                   ${historia.historiaClinica.datosDinamicos.map(dato => `<li>${dato.clave}: ${dato.valor}</li>`).join('')}
                 </ul>`
              : ''
          }
        </div>
      `)
      .join('');
  
    Swal.fire({
      title: 'Historia Clínica',
      html: `<div style="max-height: 400px; overflow-y: auto;">${historiaHtml}</div>`,
      width: '600px',
      showCloseButton: true,
      confirmButtonText: 'Cerrar',
    });
  }

  async descargarHistoriaClinica() {
    try {
      const historiasClinicas = await this.turnosServ.getHistoriaClinicaCompleta(this.usuario.email);
      //console.log(historiasClinicas);
      //console.log('especialista seleccionado: ' + this.especialistaSeleccionado);
      
      if (this.especialistaSeleccionado === 'Todos') {
        this.historiasFiltradas = historiasClinicas;
      } else {
        this.historiasFiltradas = historiasClinicas.filter(historia => {
          //console.log(historia);
          //console.log('historia especialista: ' + historia.especialista);
          return this.especialistaSeleccionado === this.obtenerApellido(historia.especialista);
        });
      }
      this.generatePDF(this.historiasFiltradas);
    } catch (error) {
      console.error('Error al obtener las historias clínicas:', error);
    }
  }

  generatePDF(historiaClinicas: historiaClinica[]): void {
    const doc = new jsPDF();
  
    const pageWidth = doc.internal.pageSize.getWidth();
    const logo = environment.logo64;
  
    const logoWidth = 20;
    const logoHeight = 20;
    const logoX = (pageWidth - logoWidth) / 2;
    doc.addImage(logo, 'PNG', logoX, 5, logoWidth, logoHeight);
  
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text('Sanatorio Asclepios', pageWidth / 2, 35, { align: 'center' });
  
    doc.setFillColor('#5f83b1');
    doc.rect(0, 45, pageWidth, 20, 'F');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('HISTORIA CLÍNICA', pageWidth / 2, 57, { align: 'center' });
  
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Fecha de Impresión: ${new Date().toLocaleString()}`, 10, 75);
  
    if (historiaClinicas.length > 0) {
      const pacienteNombre = historiaClinicas[0].paciente;
      doc.text(`Paciente: ${pacienteNombre}`, 10, 85);
    }
  
    let currentY = 95;
  
    historiaClinicas.forEach((historia, index) => {
      doc.setDrawColor('#003366');
      doc.setLineWidth(0.5);
      doc.line(10, currentY, pageWidth - 10, currentY);
      currentY += 10;
  
      doc.setFontSize(12);
      doc.text(`Atención #${index + 1}`, 10, currentY);
      doc.setFontSize(10);
      currentY += 10;
      doc.text(`Fecha de Atención: ${historia.fecha_atencion.toLocaleDateString()}`, 10, currentY);
      doc.text(`Especialidad: ${historia.especialidad}`, 10, currentY + 10);
      doc.text(`Especialista: ${historia.especialista}`, 10, currentY + 20);
      doc.text(`Diagnóstico: ${historia.diagnostico}`, 10, currentY + 30);
  
      currentY += 40;
  
      autoTable(doc, {
        startY: currentY,
        head: [['Dato', 'Valor']],
        body: [
          ['Altura', historia.historiaClinica.altura.toString()],
          ['Peso', historia.historiaClinica.peso.toString()],
          ['Temperatura', historia.historiaClinica.temperatura.toString()],
          ['Presión', historia.historiaClinica.presion.toString()],
          ...(historia.historiaClinica.datosDinamicos || []).map((dato: any) => [
            dato.clave,
            dato.valor,
          ]),
        ],
      });
  
      currentY = doc.lastAutoTable.finalY + 10;
  
      if (currentY > 260) {
        doc.addPage();
        currentY = 10;
      }
    });
  
    doc.save('HistoriasClinicas.pdf');
  }

  async cargarEspecialistas() {
    try {
      this.especialistas = await this.turnosServ.getEspecialistasPorPaciente(this.usuario.email);
    } catch (error) {
      console.error('Error al cargar los especialistas:', error);
    }
  }

  obtenerApellido(nombreCompleto: string): string {
    const partes = nombreCompleto.split(' ');
    return partes[partes.length - 1];
  }
  
}


