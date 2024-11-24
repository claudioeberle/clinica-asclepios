import { usuario } from "./usuario";

export interface Log{
    fecha:Date,
    usuario:usuario,
    accion:string
}