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
  styleUrl: './usuarios.component.scss'
})
export class UsuariosComponent implements OnInit{
  
  usuarios$!: Observable<usuario[]>;
  tipoSeleccionado: string = 'Paciente';
  usuarioSeleccionado:any;
  prompt:string= '';

  constructor(
    private firestore: Firestore,
    private usrService: UsuariosService,
    private spinnerService:SpinnerService
  ) {
    this.usuarios$ = this.usrService.getUsuariosId().pipe(
      map((users: any[]) => users.map(user => user as usuario))
    );
  }

  ngOnInit(): void {
    this.showSpinner();
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

  async exportarExcel(tipo: string): Promise<void> {
    this.usuarios$.subscribe((usuarios) => {
      // Filtrar usuarios según el tipo seleccionado
      const usuariosFiltrados = usuarios.filter((usr) => {
        if (tipo === 'Paciente') return usr.esPaciente;
        if (tipo === 'Especialista') return usr.esEspecialista;
        if (tipo === 'Administrador') return usr.esAdmin;
        return false;
      });

      // Crear datos para la tabla
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

      // Crear libro de Excel
      const hoja = XLSX.utils.json_to_sheet(datosExcel);
      const libro = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(libro, hoja, 'Usuarios');

      // Descargar archivo
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



}