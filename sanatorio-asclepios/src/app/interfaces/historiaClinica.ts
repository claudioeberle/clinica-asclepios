import { Turno } from "./turno";
import { usuario } from "./usuario";

export interface historiaClinica{
    fecha_atencion:Date,
    paciente:string,
    especialista:string,
    especialidad: string,
    diagnostico: string,
    historiaClinica:{
        especialista:usuario,
        paciente:usuario,
        turno:Turno,
        altura:number,
        peso:number,
        temperatura:number,
        presion:number,
        datosDinamicos: Array<{ clave: string; valor: string }> | null
    }
}