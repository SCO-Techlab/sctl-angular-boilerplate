import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MAGIC_NUMBERS } from '@core/shared';
import { IPaginationQuery, IPaginationResponse } from '@core/shared/interfaces';
import { environment } from '@environment';
import { fillHttpParams } from '@shared/helpers';
import { IRoom } from '@shared/interfaces';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoomsService {

  private readonly MAX_IMAGES_PER_ROOM = MAGIC_NUMBERS.N_5;
  private readonly MAX_IMAGE_SIZE_BYTES = MAGIC_NUMBERS.N_5 * MAGIC_NUMBERS.N_1024 * MAGIC_NUMBERS.N_1024;

  private readonly http = inject(HttpClient);

  public find(filter: Partial<IRoom>, pagination?: IPaginationQuery): Observable<IRoom[] | IPaginationResponse<IRoom>> {
    const httpParams: HttpParams = fillHttpParams(filter, pagination);
    return this.http
      .get<IRoom[] | IPaginationResponse<IRoom>>(`${environment.apiUrl}/rooms`, { params: httpParams });
  }

  public save(room: IRoom): Observable<IRoom> {
    const body = this.mapToRequestBody(room);
    return this.http.post<IRoom>(`${environment.apiUrl}/rooms`, body);
  }

  public update(_id: string, room: IRoom): Observable<IRoom> {
    const body = this.mapToRequestBody(room);
    return this.http.put<IRoom>(`${environment.apiUrl}/rooms/${_id}`, body);
  }

  public delete(room: IRoom): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/rooms/${room._id}`);
  }

  public deleteMultiple(_ids: string[]): Observable<number> {
    const body = { _ids };
    return this.http.delete<number>(`${environment.apiUrl}/rooms/delete/bulk`, { body });
  }

  public getRoomImageUrl(roomId: string, imageId: string, tenantId: string): string {
    return `${environment.apiUrl}/rooms/get/image/${roomId}/${imageId}/${tenantId}`;
  }

  public validateMaxImagesPerRoom(files: File[]): string {
    if (files?.length > this.MAX_IMAGES_PER_ROOM) {
      return `Only ${this.MAX_IMAGES_PER_ROOM} images are allowed.`;
    }

    return null;
  }

  public validateMaxImageSize(files: File[]): string {
    const invalidFile = files?.find((file: File) => file.size > this.MAX_IMAGE_SIZE_BYTES);
    if (invalidFile) {
      return 'Each image must be at most 5MB.';
    }

    return null;
  }

  public addRoomImages(roomId: string, files: File[]): Observable<IRoom> {
    const countError = this.validateMaxImagesPerRoom(files);
    if (countError) {
      return throwError(() => new Error(countError));
    }

    const sizeError = this.validateMaxImageSize(files);
    if (sizeError) {
      return throwError(() => new Error(sizeError));
    }

    const formData = new FormData();
    files.forEach((file: File) => formData.append('files', file));

    return this.http.put<IRoom>(`${environment.apiUrl}/rooms/images/${roomId}`, formData);
  }

  public deleteRoomImage(roomId: string, imageId: string): Observable<IRoom> {
    return this.http.delete<IRoom>(`${environment.apiUrl}/rooms/delete/image/${roomId}/${encodeURIComponent(imageId)}`);
  }

  private mapToRequestBody(room: IRoom): Record<string, unknown> {
    return {
      ...room,
      tenant: this.resolveRelationId(room?.tenant),
      residence: this.resolveRelationId(room?.residence)
    };
  }

  private resolveRelationId(value: string | { _id?: string } | undefined): string {
    if (typeof value === 'string') {
      return value;
    }

    return value?._id ?? '';
  }
}