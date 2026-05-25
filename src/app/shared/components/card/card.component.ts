import { NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { LayoutService } from '@layout/services';
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

  public get isDarkTheme(): boolean {
    return this.layoutService.layoutConfig().darkTheme;
  }

  private layoutService = inject(LayoutService);
}
