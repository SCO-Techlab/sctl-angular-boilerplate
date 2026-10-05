import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environment';
import { IResidenceRoomSelection } from '@shared/interfaces';
import { Observable } from 'rxjs';
import { IInformationEmailsData } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class InformationEmailsService {

  private readonly http = inject(HttpClient);

  public sendOrganizationInformation(tenantId: string, userId: string, emails: string[]): Observable<boolean> {
    const body = { emails };
    return this.http.post<boolean>(`${environment.apiUrl}/information-emails/organizations/${tenantId}/${userId}`, body);
  }

  public getInformationEmailsData(tenantId: string): Observable<IInformationEmailsData> {
    return this.http.get<IInformationEmailsData>(`${environment.apiUrl}/information-emails/data/${tenantId}`);
  }

  public sendResidencesInformation(tenantId: string, userId: string, emails: string[], residenceIds: string[]): Observable<boolean> {
    const body = { emails, residenceIds };
    return this.http.post<boolean>(`${environment.apiUrl}/information-emails/residences/${tenantId}/${userId}`, body);
  }

  public sendRoomsInformation(tenantId: string, userId: string, emails: string[], roomIds: string[]): Observable<boolean> {
    const body = { emails, roomIds };
    return this.http.post<boolean>(`${environment.apiUrl}/information-emails/rooms/${tenantId}/${userId}`, body);
  }

  public sendResidencesRoomsInformation(tenantId: string, userId: string, emails: string[], residencesAndRooms: IResidenceRoomSelection[]): Observable<boolean> {
    const distinctResidencesIds = residencesAndRooms?.map(selection => selection.residenceId).filter((value, index, self) => self.indexOf(value) === index) || [];
    const residencesRooms = distinctResidencesIds.reduce((acc, residenceId) => {
      acc[residenceId] = residencesAndRooms?.filter(selection => selection.residenceId === residenceId).map(selection => selection.roomId) || [];
      return acc;
    }, {} as Record<string, string[]>);
    const body = { emails, residencesRooms };
    return this.http.post<boolean>(`${environment.apiUrl}/information-emails/residences-rooms/${tenantId}/${userId}`, body);
  }
}
