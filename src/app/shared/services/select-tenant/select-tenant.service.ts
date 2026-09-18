import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environment';
import { ITenant } from '@shared/interfaces';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectTenantService {


  public onTenantChange: BehaviorSubject<string>;
  public onTenantChange$: Observable<string>;

  public get tenants(): ITenant[] {
    return this._tenants;
  }

  public set tenants(tenants: ITenant[]) {
    this._tenants = tenants;
  }

  public get selectedTenant(): string {
    return this._selectedTenant;
  }

  public set selectedTenant(tenantId: string) {
    this._selectedTenant = tenantId;
  }

  private _tenants: ITenant[] = [];
  private _selectedTenant: string;

  private readonly http = inject(HttpClient);

  constructor() {
    this.onTenantChange = new BehaviorSubject<string>(this._selectedTenant ?? '');
    this.onTenantChange$ = this.onTenantChange.asObservable();
  }

  public getUserTenants(_id: string): Observable<ITenant[]> {
    return this.http.get<ITenant[]>(`${environment.apiUrl}/profile/get/user/tenants/${_id}`);
  }
}
