import { trigger, transition, style, animate, state, keyframes } from '@angular/animations';

export const modalAnimation = trigger('modalAnimation', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(-20%)' }),
      animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
    ]),
    transition(':leave', [
      animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20%)' })),
    ]),
]);

export const sideBarAnimation = trigger('sideBarAnimation', [
  state('closed', style({
    transform: 'translateX(-100%)',
  })),
  state('open', style({
    transform: 'translateX(0)',
  })),
  transition('closed => open', [
    animate('500ms ease-in-out')
  ]),
  transition('open => closed', [
    animate('500ms ease-in-out')
  ]),
]);

export const spinAnimation = trigger('spinAnimation', [
  transition('* => *', [
    animate(
      '2s linear',
      keyframes([
        style({ transform: 'rotateY(0deg)', offset: 0 }),
        style({ transform: 'rotateY(360deg)', offset: 1 }),
      ])
    ),
  ]),
]);

export const slideInAnimation = trigger('routeAnimations', [
  transition('animation1 => animation2', [
    style({ transform: 'translateY(100%)', opacity: 0 }),
    animate('2s ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
  ]),
]);