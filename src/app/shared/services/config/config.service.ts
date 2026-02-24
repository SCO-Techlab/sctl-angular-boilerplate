import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private _data: any = {};

  constructor(private http: HttpClient) { }

  async readConfigJson(path: string): Promise<void> {
    try {
      const data = await firstValueFrom(this.http.get(path));
      this._data = data;
    } catch (error) {
      throw error;
    }
  }

  get(path: string): any {
    if (!this._data || !path) return null;

    return path.split('.').reduce((acc, key) => {
      if (acc && Object.prototype.hasOwnProperty.call(acc, key)) {
        return acc[key];
      }
      return null;
    }, this._data);
  }

  getAll(): any {
    return structuredClone
      ? structuredClone(this._data)
      : JSON.parse(JSON.stringify(this._data));
  }
}
