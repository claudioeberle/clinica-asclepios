import { historiaClinica } from "./historiaClinica";
import { usuario } from "./usuario";

export interface Turno {
    id:string | null,
    inicio: string | null;
    fecha: string | null;
    ano: string;
    paciente: usuario | null;
    especialista: usuario | null;
    especialidad: string | null;
    otorgado: boolean;
    estado: string;
    comentarioCancelacion?: string;
    comentarioResena?: string;
    diagnostico?: string;
    encuestaCompleta?: boolean;
    comentarioRechazo?: string;
    calificacionAtencion?: {
      comentario: string;
      puntuacion: number;
    } | null;
    historiaClinica: historiaClinica | null;
  }