import { usuario } from "./usuario"

export interface Turno{
    inicio:string | null,
    fecha:string | null,
    ano:string,
    paciente:usuario | null,
    especialista:usuario | null,
    especialidad:string | null,
    otorgado:boolean
}