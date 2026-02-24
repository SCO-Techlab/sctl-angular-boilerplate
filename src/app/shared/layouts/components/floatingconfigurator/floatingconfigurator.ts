import { CommonModule } from "@angular/common";
import { Component, computed, inject, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../../services/layout.service';
import { Configurator } from '../configurator/configurator';

@Component({
  selector: 'sctl-floating-configurator',
  templateUrl: './floatingconfigurator.html',
  imports: [
    CommonModule,
    ButtonModule,
    StyleClassModule,
    Configurator
  ],
})
export class FloatingConfigurator {
  LayoutService = inject(LayoutService);

  float = input<boolean>(true);

  isDarkTheme = computed(() => this.LayoutService.layoutConfig().darkTheme);

  toggleDarkMode() {
    this.LayoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
  }

}
