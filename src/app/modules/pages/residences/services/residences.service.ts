import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MAGIC_NUMBERS } from '@core/shared';
import { IPaginationQuery, IPaginationResponse } from '@core/shared/interfaces';
import { environment } from '@environment';
import { fillHttpParams } from '@shared/helpers';
import { Observable, throwError } from 'rxjs';
import { IResidence } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ResidencesService {

  private readonly MAX_IMAGES_PER_RESIDENCE = MAGIC_NUMBERS.N_5;
  private readonly MAX_IMAGE_SIZE_BYTES = MAGIC_NUMBERS.N_5 * MAGIC_NUMBERS.N_1024 * MAGIC_NUMBERS.N_1024;

  private readonly http = inject(HttpClient);

  public find(filter: Partial<IResidence>, pagination?: IPaginationQuery): Observable<IResidence[] | IPaginationResponse<IResidence>> {
    const httpParams: HttpParams = fillHttpParams(filter, pagination);
    return this.http
      .get<IResidence[] | IPaginationResponse<IResidence>>(`${environment.apiUrl}/residences`, { params: httpParams });
  }

  public save(residence: IResidence): Observable<IResidence> {
    const body = {
      ...residence,
      tenant: residence.tenant?._id
    };
    return this.http.post<IResidence>(`${environment.apiUrl}/residences`, body);
  }

  public update(_id: string, residence: IResidence): Observable<IResidence> {
    const body = {
      ...residence,
      tenant: residence.tenant?._id
    };
    return this.http.put<IResidence>(`${environment.apiUrl}/residences/${_id}`, body);
  }

  public delete(residence: IResidence): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/residences/${residence._id}`);
  }

  public deleteMultiple(_ids: string[]): Observable<number> {
    const body = { _ids };
    return this.http.delete<number>(`${environment.apiUrl}/residences/delete/bulk`, { body });
  }

  public getResidenceImageUrl(residenceId: string, imageId: string, tenantId: string): string {
    return `${environment.apiUrl}/residences/get/image/${residenceId}/${imageId}/${tenantId}`;
  }

  public validateMaxImagesPerResidence(files: File[]): string {
    if (files?.length > this.MAX_IMAGES_PER_RESIDENCE) {
      return `Only ${this.MAX_IMAGES_PER_RESIDENCE} images are allowed.`;
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

  public addResidenceImages(_id: string, files: File[]): Observable<IResidence> {
    const countError = this.validateMaxImagesPerResidence(files);
    if (countError) {
      return throwError(() => new Error(countError));
    }

    const sizeError = this.validateMaxImageSize(files);
    if (sizeError) {
      return throwError(() => new Error(sizeError));
    }

    const formData = new FormData();
    files.forEach((file: File) => formData.append('files', file));

    return this.http.put<IResidence>(`${environment.apiUrl}/residences/images/${_id}`, formData);
  }

  public deleteResidenceImage(_id: string, imageId: string): Observable<IResidence> {
    return this.http.delete<IResidence>(`${environment.apiUrl}/residences/delete/image/${_id}/${encodeURIComponent(imageId)}`);
  }
}
