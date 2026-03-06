import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { ICardComponent } from '@shared/interfaces';

@Component({
  selector: 'sctl-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  imports: [
    NgClass
  ]
})
export class CardComponent {
  public config = input<ICardComponent>({
    title: '',
    contrast: true,
    noPadding: false
  });
}
