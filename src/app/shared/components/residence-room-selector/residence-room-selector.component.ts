import { Component, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@core/shared/modules';
import { IResidence, IResidenceRoomSelection, IRoom } from '@shared/interfaces';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'sctl-residence-room-selector',
  standalone: true,
  templateUrl: './residence-room-selector.component.html',
  imports: [
    FormsModule,
    TranslateModule,
    ButtonModule,
    SelectModule,
  ],
})
export class ResidenceRoomSelectorComponent {

  public residences = input<IResidence[]>([]);
  public rooms = input<IRoom[]>([]);
  public value = input<IResidenceRoomSelection[]>([]);

  public valueChange = output<IResidenceRoomSelection[]>();
  public selections: IResidenceRoomSelection[] = [{ residenceId: null, roomId: null }];

  public get canAddSelection(): boolean {
    return this.selections.length < (this.rooms()?.length ?? 0);
  }

  constructor() {
    effect(() => {
      const inputValue = this.value() ?? [];

      if (!inputValue.length) {
        return;
      }

      const normalizedSelections = inputValue
        .map((entry) => this.normalizeSelection(entry))
        .filter((selection) => Boolean(selection.residenceId) && Boolean(selection.roomId));

      if (!normalizedSelections.length) {
        return;
      }

      const currentSelections = this.getCompleteSelections();
      if (JSON.stringify(normalizedSelections) === JSON.stringify(currentSelections)) {
        return;
      }

      this.selections = normalizedSelections;
    });
  }

  public getRoomOptions(selectionIndex: number): IRoom[] {
    const currentSelection = this.selections[selectionIndex] ?? { residenceId: null, roomId: null };
    const residenceId = currentSelection.residenceId;

    return (this.rooms() ?? []).filter((room) => {
      const roomResidenceId = typeof room?.residence === 'string' ? room.residence : room?.residence?._id ?? null;
      const matchesResidence = residenceId ? roomResidenceId === residenceId : true;

      if (!matchesResidence) {
        return false;
      }

      const selectedUsage = this.selections.filter((selection) => selection.roomId === room._id).length;
      return selectedUsage < 1 || currentSelection.roomId === room._id;
    });
  }

  public onResidenceChange(index: number, residenceId: string | null): void {
    const currentSelection = this.selections[index] ?? { residenceId: null, roomId: null };
    this.selections[index] = {
      residenceId,
      roomId: null,
    };

    if (currentSelection.roomId && residenceId !== currentSelection.residenceId) {
      this.emitSelection();
      return;
    }

    this.emitSelection();
  }

  public onRoomChange(index: number, roomId: string | null): void {
    const currentSelection = this.selections[index] ?? { residenceId: null, roomId: null };
    this.selections[index] = {
      ...currentSelection,
      roomId,
    };

    this.emitSelection();
  }

  public addSelection(): void {
    if (this.canAddSelection) {
      this.selections = [...this.selections, { residenceId: null, roomId: null }];
    }
  }

  public removeSelection(index: number): void {
    if (this.selections.length <= 1) {
      return;
    }

    this.selections = this.selections.filter((_, selectionIndex) => selectionIndex !== index);
    this.emitSelection();
  }

  private normalizeSelection(entry: IResidenceRoomSelection | IRoom): IResidenceRoomSelection {
    if (typeof entry === 'object' && entry !== null && '_id' in entry) {
      const room = entry as IRoom;

      return {
        residenceId: typeof room.residence === 'string' ? room.residence : room.residence?._id ?? null,
        roomId: room._id ?? null,
      };
    }

    const selection = entry as IResidenceRoomSelection;
    return {
      residenceId: selection?.residenceId ?? null,
      roomId: selection?.roomId ?? null,
    };
  }

  private getCompleteSelections(): IResidenceRoomSelection[] {
    return this.selections
      .filter((selection) => Boolean(selection.residenceId) && Boolean(selection.roomId));
  }

  private emitSelection(): void {
    const selectedEntries = this.selections
      .filter((selection) => Boolean(selection.residenceId) && Boolean(selection.roomId))
      .map((selection) => ({
        residenceId: selection.residenceId as string,
        roomId: selection.roomId as string,
      }));

    this.valueChange.emit(selectedEntries);
  }
}
