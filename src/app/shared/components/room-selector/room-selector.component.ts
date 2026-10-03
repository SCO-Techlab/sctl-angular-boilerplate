import { Component, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@core/shared/modules';
import { IRoom } from '@shared/interfaces';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

@Component({
    selector: 'sctl-room-selector',
    standalone: true,
    templateUrl: './room-selector.component.html',
    imports: [
        FormsModule,
        TranslateModule,
        ButtonModule,
        SelectModule,
    ]
})
export class RoomSelectorComponent {

    public rooms = input<IRoom[]>([]);
    public value = input<IRoom[]>([]);
    public label = input<string>('Room');

    public valueChange = output<IRoom[]>();
    public selections: (string | null)[] = [null];

    public get canAddSelection(): boolean {
        const availableBeds = this.rooms()?.reduce((total, room) => total + (room?.beds ?? 0), 0) ?? 0;
        return this.selections.length < availableBeds;
    }

    constructor() {
        effect(() => {
            this.rooms();
            const selectedRoomIds = this.value()
                ?.map(room => typeof room === 'string' ? room : room?._id)
                .filter((roomId): roomId is string => Boolean(roomId)) ?? [];
            this.selections = selectedRoomIds.length ? selectedRoomIds : [null];
        });
    }

    public getOptions(selectionIndex: number): IRoom[] {
        const selectedRoomId = this.selections[selectionIndex];

        return this.rooms()
            ?.filter(room => {
                const selectedCount = this.selections.filter(id => id === room._id).length;
                return selectedCount < (room.beds ?? 0) || selectedRoomId === room._id;
            }) ?? [];
    }

    public onSelectionChange(index: number, roomId: string | null): void {
        this.selections[index] = roomId;
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

    private emitSelection(): void {
        const selectedRoomIds = this.selections.filter((roomId): roomId is string => Boolean(roomId));
        const selectedRooms = selectedRoomIds
            .map(roomId => this.rooms().find(room => room._id === roomId))
            .filter((room): room is IRoom => Boolean(room));

        this.valueChange.emit(selectedRooms);
    }
}
