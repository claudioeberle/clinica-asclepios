import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SpinnerService } from '../../services/spinner.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [],
})
export class HomeComponent {
  images: string[] = [
    '../../assets/fotos/carrousel-1.jpg',
    '../../assets/fotos/carrousel-2.jpg',
    '../../assets/fotos/carrousel-3.jpg',
  ];
  currentIndex: number = 0;
  intervalId: any;


  constructor(private spinnerService:SpinnerService) {}


  ngOnInit() {
    this.showSpinner();
    this.startCarousel();
  }

  ngOnDestroy() {
    this.stopCarousel();
  }

  startCarousel() {
    this.intervalId = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    }, 4000);
  }

  stopCarousel() {
    clearInterval(this.intervalId);
  }

  showSpinner(): void {
    this.spinnerService.show();
    setTimeout(() => {
      this.spinnerService.hide();
    }, 1500);
  }
}