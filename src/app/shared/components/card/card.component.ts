import { Component, input } from '@angular/core';
import { ICardComponent } from '@shared/interfaces';

@Component({
  selector: 'sctl-card',
  standalone: true,
  templateUrl: './card.component.html',
  imports: []
})
export class CardComponent {
  public config = input<ICardComponent>({
    title: ''
  });
}
