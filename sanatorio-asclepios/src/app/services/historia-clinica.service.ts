import { Injectable } from '@angular/core';
import { historiaClinica } from '../interfaces/historiaClinica';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class HistoriaClinicaService {

  constructor(private firestore:Firestore) { }



}
