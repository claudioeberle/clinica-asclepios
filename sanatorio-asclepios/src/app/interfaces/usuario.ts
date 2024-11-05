export interface usuario{
    id:any;
    nombre:string;
    apellido:string;
    edad:number;
    dni:number;
    email:string;
    obra_social:string;
    especialidad:string;
    perfil1:string;
    perfil2:string;
    cuenta_valida:boolean;
    esPaciente:boolean;
    esEspecialista:boolean;
    esAdmin:boolean;
    fechaAlta:Date
}