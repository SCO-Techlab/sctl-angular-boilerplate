import { Component, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@core/shared/modules';
import { formatResidenceAddress } from '@shared/helpers';
import { IResidence } from '@shared/interfaces';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'sctl-residences-selector',
  standalone: true,
  templateUrl: './residences-selector.component.html',
  imports: [
    FormsModule,
    TranslateModule,
    ButtonModule,
    SelectModule,
  ]
})
export class ResidencesSelectorComponent {

  public residences = input<IResidence[]>([]);
  public value = input<IResidence[]>([]);

  public valueChange = output<IResidence[]>();
  public selections: (string | null)[] = [null];

  public get canAddSelection(): boolean {
    return this.selections.length < (this.residences()?.length ?? 0);
  }

  constructor() {
    effect(() => {
      this.residences();
      const selectedResidenceIds = this.value()
        ?.map(residence => typeof residence === 'string' ? residence : residence?._id)
        .filter((residenceId): residenceId is string => Boolean(residenceId)) ?? [];
      this.selections = selectedResidenceIds.length ? selectedResidenceIds : [...this.selections];
    });
  }

  public getOptions(selectionIndex: number): IResidence[] {
    const selectedResidenceId = this.selections[selectionIndex];

    return this.residences()
      ?.filter(residence => {
        const selectedCount = this.selections.filter(id => id === residence._id).length;
        return selectedCount < 1 || selectedResidenceId === residence._id;
      }) ?? [];
  }

  public onSelectionChange(index: number, residenceId: string | null): void {
    this.selections[index] = residenceId;
    this.emitSelection();
  }

  public addSelection(): void {
    if (this.canAddSelection) {
      this.selections = [...this.selections, null];
    }
  }

  public removeSelection(index: number): void {
    if (this.selections.length <= 1) {
      return;
    }

    this.selections = this.selections.filter((_, selectionIndex) => selectionIndex !== index);
    this.emitSelection();
  }

  public formatResidenceAddress(residence: IResidence): string {
    if (!residence) {
      return '';
    }

    return formatResidenceAddress(residence);
  }

  private emitSelection(): void {
    const selectedResidenceIds = this.selections.filter((residenceId): residenceId is string => Boolean(residenceId));
    const selectedResidences = selectedResidenceIds
      .map(residenceId => this.residences().find(residence => residence._id === residenceId))
      .filter((residence): residence is IResidence => Boolean(residence));

    this.valueChange.emit(selectedResidences);
  }
}
