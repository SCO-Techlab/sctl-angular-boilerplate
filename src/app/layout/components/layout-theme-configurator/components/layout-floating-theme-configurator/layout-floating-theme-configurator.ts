import { CommonModule } from "@angular/common";
import { Component, computed, inject, input } from '@angular/core';
import { LayoutService } from "@layout/services";
import { ButtonModule } from 'primeng/button';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutThemeConfiguratorComponent } from "../layout-theme-configurator";

@Component({
  selector: 'sctl-layout-floating-theme-configurator',
  templateUrl: './layout-floating-theme-configurator.html',
  imports: [
    CommonModule,
    ButtonModule,
    StyleClassModule,
    LayoutThemeConfiguratorComponent
  ],
})
export class LayoutFloatingThemeConfigurator {

  public float = input<boolean>(true);

  public isDarkTheme = computed(() => this.LayoutService.layoutConfig().darkTheme);

  private readonly LayoutService = inject(LayoutService);

  public toggleDarkMode(): void {
    this.LayoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
  }
}
