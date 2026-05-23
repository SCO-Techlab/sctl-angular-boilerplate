import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MAGIC_NUMBERS } from '@core/shared/constants';
import { ITranslateLiterals } from '@core/shared/interfaces';
import { TranslateModule } from '@core/shared/modules';
import { LayoutService, TranslateService } from '@core/shared/services';
import { $t, updatePreset, updateSurfacePalette } from '@primeuix/themes';
import { SelectButtonModule } from 'primeng/selectbutton';
import { THEME_CONFIGURATOR_COLORS, THEME_CONFIGURATOR_PRESETS, THEME_CONFIGURATOR_SURFACES } from '../../constants';
import { KeyOfType, SurfacesType } from '../../types';

@Component({
  selector: 'sctl-theme-configurator',
  standalone: true,
  templateUrl: './theme-configurator.component.html',
  host: {
    class: 'hidden absolute top-13 right-0 w-72 p-4 bg-surface-0 dark:bg-surface-900 border border-surface rounded-border origin-top shadow-[0px_3px_5px_rgba(0,0,0,0.02),0px_0px_2px_rgba(0,0,0,0.05),0px_1px_4px_rgba(0,0,0,0.08)]'
  },
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    SelectButtonModule
  ],
})
export class ThemeConfiguratorComponent {

  private readonly destroyRef$ = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly layoutService: LayoutService = inject(LayoutService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly translateService = inject(TranslateService);

  public presets = Object.keys(THEME_CONFIGURATOR_PRESETS);
  public showMenuModeButton = signal(!this.router.url.includes('auth'));
  public menuModeOptions = [];
  public surfaces: SurfacesType[] = THEME_CONFIGURATOR_SURFACES;;
  public selectedPrimaryColor = computed(() => { return this.layoutService.layoutConfig().primary });
  public selectedSurfaceColor = computed(() => this.layoutService.layoutConfig().surface);
  public selectedPreset = computed(() => this.layoutService.layoutConfig().preset);
  public menuMode = computed(() => this.layoutService.layoutConfig().menuMode);
  public primaryColors = computed<SurfacesType[]>(() => {
    const presetPalette = THEME_CONFIGURATOR_PRESETS[this.layoutService.layoutConfig().preset as KeyOfType<typeof THEME_CONFIGURATOR_PRESETS>].primitive;
    const colors = THEME_CONFIGURATOR_COLORS;
    const palettes: SurfacesType[] = [{ name: 'noir', palette: {} }];

    colors.forEach((color) => {
      palettes.push({
        name: color,
        palette: presetPalette?.[color as KeyOfType<typeof presetPalette>] as SurfacesType['palette']
      });
    });

    return palettes;
  });

  public get darkTheme(): boolean {
    return this.layoutService.layoutConfig().darkTheme;
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.onPresetChange(this.layoutService.layoutConfig().preset);
    }

    this.translateService.stream('LAYOUT.THEME_CONFIGURATOR')
      .pipe(takeUntilDestroyed(this.destroyRef$))
      .subscribe((res: ITranslateLiterals) => {
        this.menuModeOptions = [
          { label: res['MENU_STATIC'], value: 'static' },
          { label: res['MENU_OVERLAY'], value: 'overlay' }
        ]
      });
  }

  public updateColors(event: any, type: string, color: any): void {
    if (type === 'primary') {
      this.layoutService.layoutConfig.update((state) => ({ ...state, primary: color.name }));
    } else if (type === 'surface') {
      this.layoutService.layoutConfig.update((state) => ({ ...state, surface: color.name }));
    }
    this.applyTheme(type, color);

    event.stopPropagation();
  }

  public onPresetChange(event: any): void {
    this.layoutService.layoutConfig.update((state) => ({ ...state, preset: event }));
    const preset = THEME_CONFIGURATOR_PRESETS[event as KeyOfType<typeof THEME_CONFIGURATOR_PRESETS>];
    const surfacePalette = this.surfaces.find((s) => s.name === this.selectedSurfaceColor())?.palette;
    $t().preset(preset).preset(this.getPresetExt()).surfacePalette(surfacePalette).use({ useDefaultOptions: true });
  }

  public onMenuModeChange(event: string): void {
    this.layoutService.layoutConfig.update((prev) => ({ ...prev, menuMode: event }));
  }

  private applyTheme(type: string, color: any): void {
    if (type === 'primary') {
      updatePreset(this.getPresetExt());
    } else if (type === 'surface') {
      updateSurfacePalette(color.palette);
    }
  }

  private getPresetExt(): any {
    const color: SurfacesType = this.primaryColors().find((c) => c.name === this.selectedPrimaryColor()) || {};
    const preset = this.layoutService.layoutConfig().preset;

    if (color.name === 'noir') {
      return {
        semantic: {
          primary: {
            [MAGIC_NUMBERS.N_50]: '{surface.50}',
            [MAGIC_NUMBERS.N_100]: '{surface.100}',
            [MAGIC_NUMBERS.N_200]: '{surface.200}',
            [MAGIC_NUMBERS.N_300]: '{surface.300}',
            [MAGIC_NUMBERS.N_400]: '{surface.400}',
            [MAGIC_NUMBERS.N_500]: '{surface.500}',
            [MAGIC_NUMBERS.N_600]: '{surface.600}',
            [MAGIC_NUMBERS.N_700]: '{surface.700}',
            [MAGIC_NUMBERS.N_800]: '{surface.800}',
            [MAGIC_NUMBERS.N_900]: '{surface.900}',
            [MAGIC_NUMBERS.N_950]: '{surface.950}'
          },
          colorScheme: {
            light: {
              primary: {
                color: '{primary.950}',
                contrastColor: '#ffffff',
                hoverColor: '{primary.800}',
                activeColor: '{primary.700}'
              },
              highlight: {
                background: '{primary.950}',
                focusBackground: '{primary.700}',
                color: '#ffffff',
                focusColor: '#ffffff'
              }
            },
            dark: {
              primary: {
                color: '{primary.50}',
                contrastColor: '{primary.950}',
                hoverColor: '{primary.200}',
                activeColor: '{primary.300}'
              },
              highlight: {
                background: '{primary.50}',
                focusBackground: '{primary.300}',
                color: '{primary.950}',
                focusColor: '{primary.950}'
              }
            }
          }
        }
      };
    } else {
      if (preset === 'Nora') {
        return {
          semantic: {
            primary: color.palette,
            colorScheme: {
              light: {
                primary: {
                  color: '{primary.600}',
                  contrastColor: '#ffffff',
                  hoverColor: '{primary.700}',
                  activeColor: '{primary.800}'
                },
                highlight: {
                  background: '{primary.600}',
                  focusBackground: '{primary.700}',
                  color: '#ffffff',
                  focusColor: '#ffffff'
                }
              },
              dark: {
                primary: {
                  color: '{primary.500}',
                  contrastColor: '{surface.900}',
                  hoverColor: '{primary.400}',
                  activeColor: '{primary.300}'
                },
                highlight: {
                  background: '{primary.500}',
                  focusBackground: '{primary.400}',
                  color: '{surface.900}',
                  focusColor: '{surface.900}'
                }
              }
            }
          }
        };
      } else {
        return {
          semantic: {
            primary: color.palette,
            colorScheme: {
              light: {
                primary: {
                  color: '{primary.500}',
                  contrastColor: '#ffffff',
                  hoverColor: '{primary.600}',
                  activeColor: '{primary.700}'
                },
                highlight: {
                  background: '{primary.50}',
                  focusBackground: '{primary.100}',
                  color: '{primary.700}',
                  focusColor: '{primary.800}'
                }
              },
              dark: {
                primary: {
                  color: '{primary.400}',
                  contrastColor: '{surface.900}',
                  hoverColor: '{primary.300}',
                  activeColor: '{primary.200}'
                },
                highlight: {
                  background: 'color-mix(in srgb, {primary.400}, transparent 84%)',
                  focusBackground: 'color-mix(in srgb, {primary.400}, transparent 76%)',
                  color: 'rgba(255,255,255,.87)',
                  focusColor: 'rgba(255,255,255,.87)'
                }
              }
            }
          }
        };
      }
    }
  }
}
