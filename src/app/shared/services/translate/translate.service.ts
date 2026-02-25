import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, from, map, Observable, of, startWith, switchMap } from 'rxjs';
import { MAGIC_NUMBERS } from '../../constants';
import { ITranslateConfig } from '../../interfaces';

@Injectable({ providedIn: 'root' })
export class TranslateService {

  private _data = new Map<string, any>();
  private _currentLang: string;
  private _defaultLang: string;
  private _availableLangs: string[] = [];

  private _onLangChange: BehaviorSubject<string>;
  private _onLangChange$: Observable<string>;

  constructor(
    @Inject('TRANSLATE_CONFIG') private readonly config: ITranslateConfig,
    private readonly http: HttpClient,
  ) {
    this._defaultLang = this.config.defaultLang;
    this._availableLangs = this.config.availableLangs;
    this._onLangChange = new BehaviorSubject<string>(this._currentLang);
    this._onLangChange$ = this._onLangChange.asObservable();
    this.setNavigatorLanguage();
    this.use(this._currentLang);
  }

  public get currentLang(): string {
    return this._currentLang;
  }

  public get defaultLang(): string {
    return this._defaultLang;
  }

  public get availableLangs(): string[] {
    return this._availableLangs;
  }

  public get onLangChange$(): Observable<string> {
    return this._onLangChange$;
  }

  setNavigatorLanguage(): void {
    let language = navigator?.language?.includes('-')
      ? navigator.language.split('-')[MAGIC_NUMBERS.N_0]
      : navigator.language;

    if (!language) language = this._defaultLang ?? this.config.defaultLang;

    if (this._availableLangs.length > 0) {
      const exists = this._availableLangs.includes(language);
      if (!exists) language = this._defaultLang ?? this.config.defaultLang;
    }

    this._currentLang = language;
    this._onLangChange.next(this._currentLang);
  }

  use(lang: string): Promise<boolean> {
    if (this._currentLang === lang && this._data.has(lang)) {
      return Promise.resolve(true);
    }

    if (this._data.has(lang)) {
      this._currentLang = lang;
      this._onLangChange.next(lang);
      return Promise.resolve(true);
    }

    const path: string = this.config.path[this.config.path.length - MAGIC_NUMBERS.N_1] === '/'
      ? this.config.path
      : `${this.config.path}/`;

    return this.http.get(`${path}${lang}.json`).toPromise()
      .then((data: any) => {
        this._data.set(lang, data);
        this._currentLang = lang;
        this._onLangChange.next(lang);
        return true;
      })
      .catch((err) => {
        console.error(`[TranslateService] Error loading ${lang}.json`, err);
        return false;
      });
  }

  instant(key: string, params?: Record<string, any>): string {
    const langData = this._data.get(this._currentLang);
    const translation = this.getValue(langData, key);
    return translation ? this.interpolate(translation, params) : key;
  }

  get(key: string, params?: Record<string, any>): Observable<string> {
    const translation = this.instant(key, params);
    if (translation !== key) return of(translation);

    return from(this.use(this._currentLang)).pipe(
      map(() => this.instant(key, params))
    );
  }

  stream(key: string, params?: Record<string, any>): Observable<string> {
    return this._onLangChange$.pipe(
      startWith(this.currentLang),
      switchMap(() => this.get(key, params))
    );
  }

  private getValue(obj: any, path: string): string | undefined {
    if (!obj) return undefined;
    return path
      .split('.')
      .reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
  }

  private interpolate(str: string, params?: Record<string, any>): string {
    if (!params) return str;
    return str.replace(/{{\s*([^}]+)\s*}}/g, (_, key) => {
      const v = params[key.trim()];
      return v === undefined || v === null ? '' : String(v);
    });
  }
}
