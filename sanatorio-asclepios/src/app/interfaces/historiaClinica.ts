import { Turno } from "./turno";
import { usuario } from "./usuario";

export interface historiaClinica{
    fecha_atencion:Date,
    especialista:usuario,
    paciente:usuario,
    turno:Turno,
    altura:number,
    peso:number,
    temperatura:number,
    presion:number
}