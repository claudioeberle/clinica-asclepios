import { Component } from '@angular/core';
import { LogsService } from '../../services/logs.service';
import { TurnosService } from '../../services/turnos.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimestampPipe } from '../../pipes/timestamp.pipe';
import { Log } from '../../interfaces/log';
import { SpinnerComponent } from '../spinner/spinner.component';
import { SpinnerService } from '../../services/spinner.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { environment } from '../../../environment';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    TimestampPipe
  ],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.scss'
})
export class EstadisticasComponent {
  selectedInforme: string = 'logIngresos';
  logs: any[] = [];
  turnosPorEspecialidad: any = {};
  arrayTurnosPorEspecialidad: any[] = [];
  turnosPorDia: any = {}; 
  turnosPorMedico: any = {};
  fechaDesde: string = '';
  fechaHasta: string = '';
  estadoTurno: string = 'todos';
  pieChart: Chart<'pie'> | null = null;
  Chart: Chart<'pie'> | null = null;
  turnosPorDiaArray: any[] = [];
  turnosPorDiaChart!: Chart;
  turnosPorMedicoArray: any[] = [];

  informes = [
    { value: 'logIngresos', label: 'Log de Ingresos al Sistema' },
    { value: 'turnosEspecialidad', label: 'Cantidad de Turnos por Especialidad' },
    { value: 'turnosDia', label: 'Cantidad de Turnos por Día' },
    { value: 'turnosPorMedico', label: 'Cantidad de Turnos por Médico' },
  ];

  constructor(
    private logsService: LogsService,
    private turnosService: TurnosService,
    private spinnerService: SpinnerService
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    if (this.selectedInforme === 'logIngresos') {
      this.obtenerLogs();
    }
  }

  onInformeChange(): void {
    if (this.selectedInforme === 'logIngresos') {
      this.obtenerLogs();
    } else if (this.selectedInforme === 'turnosEspecialidad') {
      this.obtenerTurnosPorEspecialidad();
    } else if (this.selectedInforme === 'turnosDia') {
      this.obtenerTurnosPorDia();
    } else if (this.selectedInforme === 'turnosPorMedico') {
      this.obtenerTurnosPorMedico();
    }
  }

  ngAfterViewInit(): void {
    if (this.selectedInforme === 'turnosPorMedico') {
      this.obtenerTurnosPorMedico();
    }
  }

  obtenerLogs(): void {
    this.logsService.getLogs('login').then(logs => {
      this.logs = logs;
    });
    console.log(this.logs);
  }

  async descargarExcelLogs(logs:Log[]): Promise<void> {
    try {
      this.spinnerService.show();
  
      if (logs.length === 0) {
        await Swal.fire('Atención','No se encontraron logs para mostrar.', 'error');
        return
      }
  
      const datosExcel = logs.map(log => ({
        Usuario: `${log.usuario.nombre} ${log.usuario.apellido}`,
        Email: log.usuario.email,
        Fecha: `${this.timestamp(log.fecha)}`,
        Accion: log.accion
      }));
  
      const hoja = XLSX.utils.json_to_sheet(datosExcel);
      const libro = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(libro, hoja, 'Turnos');
  
      const nombreArchivo = `Logs_${new Date().toLocaleDateString()}.xlsx`;
      XLSX.writeFile(libro, nombreArchivo);
    } catch (error) {
      console.error('Error al descargar los logs:', error);
      await Swal.fire('Error','Hubo un error al intentar descargar los logs', 'error');
    } finally {
      this.spinnerService.hide();
    }
  }

  timestamp(value: any): string {
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

  obtenerTurnosPorEspecialidad(): void {
    this.turnosService.contarTurnosPorEspecialidad('').then(data => {
      this.turnosPorEspecialidad = data;
      this.arrayTurnosPorEspecialidad= Object.entries(data).map(([especialidad, cantidad]) => ({
        especialidad,
        cantidad
      }));
      console.log(this.turnosPorEspecialidad);
      this.initTurnosEspecialidadChart();
    });
  }

  initTurnosEspecialidadChart(): void {
    const labels = Object.keys(this.turnosPorEspecialidad);
    const data = Object.values(this.turnosPorEspecialidad) as number[];
    const total = data.reduce((acc, curr) => acc + curr, 0);

    if (this.pieChart) {
      this.pieChart.destroy();
    }

    const config: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Turnos por Especialidad',
            data: data,
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40',
            ],
            hoverOffset: 6,
          },
        ],
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const index = tooltipItem.dataIndex;
                const cantidad = data[index];
                const porcentaje = ((cantidad / total) * 100).toFixed(2);
                return `${labels[index]}: ${porcentaje}% (${cantidad} turnos)`;
              },
            },
          },
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 20,
              },
            }
          },
        },
      },
    };

    this.pieChart = new Chart<'pie'>('turnosPorEspecialidadChart', config);
  }

  obtenerTurnosPorDia(): void {
    this.turnosService.contarTurnosPorFecha('').then(data => {
      this.turnosPorDia = data;
  
      this.turnosPorDiaArray = Object.entries(this.turnosPorDia).map(([fecha, cantidad]) => ({
        fecha,
        cantidad
      }));
      this.initTurnosPorDiaChart();
    });
  }

  initTurnosPorDiaChart(): void {
    const labels = this.turnosPorDiaArray.map(dato => dato.fecha);
    const data = this.turnosPorDiaArray.map(dato => dato.cantidad);
  
    if (this.turnosPorDiaChart) {
      this.turnosPorDiaChart.destroy();
    }
  
    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Cantidad de Turnos',
            data: data,
            backgroundColor: '#36A2EB',
            borderColor: '#2980B9',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
        },
        scales: {
          x: {
            title: { display: true, text: 'Fecha' },
          },
          y: {
            title: { display: true, text: 'Cantidad de Turnos' },
            beginAtZero: true,
          },
        },
      },
    };
  
    this.turnosPorDiaChart = new Chart('turnosPorDiaChart', config);
  }

  obtenerTurnosPorMedico(): void {
    this.turnosService.contarTurnosPorEspecialista(this.fechaDesde, this.fechaHasta, this.estadoTurno).then(data => {
      this.turnosPorMedico = data;
      this.turnosPorMedicoArray = Object.entries(this.turnosPorMedico).map(([especialista, cantidad]) => ({
        especialista,
        cantidad
      }));
  
      setTimeout(() => this.initTurnosPorMedicoChart(), 0);
    });
  }

  initTurnosPorMedicoChart(): void {
    const labels = Object.keys(this.turnosPorMedico);
    const data = Object.values(this.turnosPorMedico) as number[];
    const total = data.reduce((acc, curr) => acc + curr, 0);
    console.log('Labels: '+labels);
    console.log('Data: '+data);

    if (this.Chart) {
      this.Chart.destroy();
    }

    const config: ChartConfiguration<'pie'> = {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Turnos por Especialista',
            data: data,
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40',
            ],
            hoverOffset: 6,
          },
        ],
      },
      options: {
        plugins: {
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const index = tooltipItem.dataIndex;
                const cantidad = data[index];
                const porcentaje = ((cantidad / total) * 100).toFixed(2);
                return `${labels[index]}: ${porcentaje}% (${cantidad} turnos)`;
              },
            },
          },
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 20,
              },
            }
          },
        },
      },
    };

    this.Chart = new Chart<'pie'>('turnosPorMedicoChart', config);
  }

  descargarPDF(
    chartId: string,
    tableData: any[],
    tableHeaders: string[],
    subtitulo: string,
    subtituloExtra?: string
  ): void {
    const doc = new jsPDF();
  
    const logo = environment.logo64 as string;
    const titulo = 'Sanatorio Asclepios';
    const logoWidth = 25;
    const logoHeight = 25;
    const pageWidth = doc.internal.pageSize.getWidth();
  
    doc.addImage(logo, 'PNG', (pageWidth - logoWidth) / 2, 10, logoWidth, logoHeight);
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(titulo, pageWidth / 2, 40, { align: 'center' });
  
    doc.setFillColor(76, 106, 146);
    doc.rect(10, 50, pageWidth - 20, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(subtitulo, pageWidth / 2, 57, { align: 'center' });
  
    if (subtituloExtra) {
      doc.setFontSize(12);
      doc.setTextColor(76, 106, 146);
      doc.text(subtituloExtra, pageWidth / 2, 67, { align: 'center' });
    }
  
    const chart = document.getElementById(chartId) as HTMLCanvasElement;
    if (chart) {
      const chartImage = chart.toDataURL('image/png');
      const chartWidth = (pageWidth - 20) * 0.7;
      const aspectRatio = chart.height / chart.width;
      const chartHeight = chartWidth * aspectRatio;
  
      doc.addImage(chartImage, 'PNG', 40, subtituloExtra ? 80 : 70, chartWidth, chartHeight); // Ajustar posición si hay subtítulo extra
    }
  
    doc.addPage();
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Tabla de ' + subtitulo, pageWidth / 2, 20, { align: 'center' });
  
    (doc as any).autoTable({
      startY: 30,
      head: [tableHeaders],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [76, 106, 146], textColor: [255, 255, 255] },
      styles: { fontSize: 10, align: 'center' },
    });
    doc.save(subtitulo + '.pdf');
  }  

  getInformeLabel(): string {
    const informe = this.informes.find((info) => info.value === this.selectedInforme);
    return informe ? informe.label : 'Sin título';
  }

  getDatosTablaEspecialidad(): any[] {
    return this.arrayTurnosPorEspecialidad.map(dato => [dato.especialidad, dato.cantidad]);
  }

  getDatosTablaEspecialista(): any[] {
    return this.turnosPorMedicoArray.map(dato => [dato.especialista, dato.cantidad]);
  }
  
  getDatosTablaDia(): any[] {
    return this.turnosPorDiaArray.map(dato => [dato.fecha, dato.cantidad]);
  }

}