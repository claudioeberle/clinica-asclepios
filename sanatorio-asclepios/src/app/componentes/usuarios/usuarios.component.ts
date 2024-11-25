import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { usuario } from '../../interfaces/usuario';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FiltroPorTipoUsrPipe } from '../../pipes/filtro-por-tipo-usr.pipe';
import { doc, Firestore, updateDoc } from '@angular/fire/firestore';
import { UsuariosService } from '../../services/usuarios.service';
import { SpinnerService } from '../../services/spinner.service';
import { CuentaValidaPipe } from '../../pipes/cuenta-valida.pipe';
import { FotoUsuarioPipe } from '../../pipes/foto-usuario.pipe';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { TurnosService } from '../../services/turnos.service';
import Swal from 'sweetalert2';
import { MapToUsuarioPipe } from '../../pipes/map-to-usuario.pipe';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FormsModule, 
    FiltroPorTipoUsrPipe,
    CuentaValidaPipe,
    FotoUsuarioPipe],

  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss',
  animations: [],
})
export class UsuariosComponent implements OnInit{
  
  usuarios$!: Observable<usuario[]>;
  tipoSeleccionado: string = 'Paciente';
  usuarioSeleccionado:any;
  prompt:string= '';
  fotoActual: { [id: string]: boolean } = {};

  constructor(
    private firestore: Firestore,
    private usrService: UsuariosService,
    private spinnerService:SpinnerService,
    private turnosService:TurnosService
  ) {
    this.usuarios$ = this.usrService.getUsuariosId().pipe(
      map(users => new MapToUsuarioPipe().transform(users))
    );
  }

  ngOnInit(): void {
    this.showSpinner();
  }

  toggleFoto(id: string): void {
    this.fotoActual[id] = !this.fotoActual[id];
  }

  async activarUsuario(usuario: usuario): Promise<void> {
    try {

      const usuarioDoc = doc(this.firestore, `usuarios/${usuario.id}`);
      const nuevoEstado = !usuario.cuenta_valida;

      await updateDoc(usuarioDoc, { cuenta_valida: nuevoEstado });
      this.prompt = `Usuario ${usuario.email} modificado: ${nuevoEstado ? 'Activado' : 'Desactivado'}`;
      setTimeout(() => {
        this.prompt = '';
      }, 2000);
    } catch (error) {
      console.error('Error al modificar el usuario: ', error);
    }
  }

  showSpinner(): void {
    this.spinnerService.show();
    setTimeout(() => {
      this.spinnerService.hide();
    }, 1000);
  }

  async exportarUsuariosExcel(tipo: string): Promise<void> {
    this.usuarios$.subscribe((usuarios) => {
      const usuariosFiltrados = usuarios.filter((usr) => {
        if (tipo === 'Paciente') return usr.esPaciente;
        if (tipo === 'Especialista') return usr.esEspecialista;
        if (tipo === 'Administrador') return usr.esAdmin;
        return false;
      });

      const datosExcel = usuariosFiltrados.map((usr) => ({
        Nombre: usr.nombre,
        Apellido: usr.apellido,
        Edad: usr.edad,
        DNI: usr.dni,
        ...(tipo === 'Paciente' && {
          'Obra Social': usr.obra_social,
        }),
        ...(tipo === 'Especialista' && {
          Especialidades: usr.especialidad,
          'Cuenta Habilitada': usr.cuenta_valida ? 'Sí' : 'No',
        }),
        Email: usr.email,
      }));

      const hoja = XLSX.utils.json_to_sheet(datosExcel);
      const libro = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(libro, hoja, 'Usuarios');

      const nombreArchivo = `Usuarios_${tipo}.xlsx`;
      XLSX.writeFile(libro, nombreArchivo);
    });
  }

  obtenerEncabezados(tipo: string): string[] {
    switch (tipo) {
      case 'Paciente':
        return ['nombre', 'apellido', 'edad', 'dni', 'obra_social', 'email'];
      case 'Especialista':
        return ['nombre', 'apellido', 'edad', 'dni', 'especialidad', 'email', 'cuenta_valida'];
      case 'Administrador':
        return ['nombre', 'apellido', 'edad', 'dni', 'email', 'cuenta_valida'];
      default:
        return [];
    }
  }

  guardarArchivoExcel(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(data, `${fileName}.xlsx`);
  }

  async descargarTurnos(paciente: usuario): Promise<void> {
    try {
      this.spinnerService.show();
  
      const turnos = await this.turnosService.getTurnosPorPaciente(paciente.email);
  
      if (turnos.length === 0) {
        await Swal.fire('Atención','No se encontraron turnos para el paciente seleccionado.', 'info');
        return
      }
  
      const datosExcel = turnos.map(turno => ({
        Paciente: `${turno.paciente?.nombre} ${turno.paciente?.apellido}`,
        Especialista: `${turno.especialista?.nombre} ${turno.especialista?.apellido}`,
        Especialidad: turno.especialidad,
        Fecha: turno.fecha,
        Horario: turno.inicio,
        Estado: turno.estado
      }));
  
      const hoja = XLSX.utils.json_to_sheet(datosExcel);
      const libro = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(libro, hoja, 'Turnos');
  
      const nombreArchivo = `Turnos_${paciente.nombre}_${paciente.apellido}.xlsx`;
      XLSX.writeFile(libro, nombreArchivo);
    } catch (error) {
      console.error('Error al descargar los turnos:', error);
      await Swal.fire('Error','Hubo un error al intentar descargar los turnos para el paciente seleccionado', 'error');
    } finally {
      this.spinnerService.hide();
    }
  }

  async mostrarHistoriaClinica(email:string): Promise<void> {
    const historiasClinicas = await this.turnosService.getHistoriaClinicaCompleta(email);
  
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



}