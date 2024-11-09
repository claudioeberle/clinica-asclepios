import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideFirebaseApp(() => initializeApp(
      {"projectId":"sanatorio-asclepios",
        "appId":"1:626562526898:web:2b594c1a1f1b81b8d023ab",
        "storageBucket":"sanatorio-asclepios.firebasestorage.app",
        "apiKey":"AIzaSyDSUuOUzo2sycWdQOBYxaPGU_f6YGS-UU0",
        "authDomain":"sanatorio-asclepios.firebaseapp.com",
        "messagingSenderId":"626562526898"}
    )), 
    provideAuth(() => getAuth()), 
    provideFirestore(() => getFirestore()), 
    provideStorage(() => getStorage())

  ]
};
