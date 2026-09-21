import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectTenantService {


  public onTenantChange: BehaviorSubject<string>;
  public onTenantChange$: Observable<string>;

  public get selectedTenant(): string {
    return this._selectedTenant;
  }

  public set selectedTenant(tenantId: string) {
    this._selectedTenant = tenantId;
  }

  private _selectedTenant: string;

  constructor() {
    this._selectedTenant = '';
    this.onTenantChange = new BehaviorSubject<string>(this._selectedTenant ?? '');
    this.onTenantChange$ = this.onTenantChange.asObservable();
  }
}
