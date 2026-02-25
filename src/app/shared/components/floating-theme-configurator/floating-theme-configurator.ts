import { CommonModule } from "@angular/common";
import { Component, computed, inject, input } from '@angular/core';
import { LayoutService } from "@shared/services";
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { ThemeConfiguratorComponent } from "../theme-configurator";

@Component({
  selector: 'sctl-floating-theme-configurator',
  templateUrl: './floating-theme-configurator.html',
  imports: [
    CommonModule,
    ButtonModule,
    StyleClassModule,
    ThemeConfiguratorComponent
  ],
})
export class FloatingThemeConfigurator {
  LayoutService = inject(LayoutService);

  float = input<boolean>(true);

  isDarkTheme = computed(() => this.LayoutService.layoutConfig().darkTheme);

  toggleDarkMode() {
    this.LayoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
  }

}
