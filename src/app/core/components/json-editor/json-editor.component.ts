import { NgStyle } from '@angular/common';
import { Component, ElementRef, input, OnInit, output, ViewChild } from '@angular/core';
import { MAGIC_NUMBERS } from '@core/shared/constants';
import { JSON_EDITOR_HEIGHT_UNIT, JSON_EDITOR_MODE, JSON_EDITOR_TYPE } from '@core/shared/enums';
import { IJsonEditorComponent } from '@core/shared/interfaces';
import JSONEditor from 'jsoneditor';

@Component({
  selector: 'sctl-json-editor',
  standalone: true,
  templateUrl: './json-editor.component.html',
  styleUrls: ['./json-editor.component.scss'],
  imports: [
    NgStyle
  ]
})
export class JsonEditorComponent implements OnInit {

  @ViewChild('jsonEditor', { static: true }) jsonEditor: ElementRef;

  public config = input<IJsonEditorComponent>({
    mode: JSON_EDITOR_MODE.CODE,
    height: MAGIC_NUMBERS.N_600,
    heightUnit: JSON_EDITOR_HEIGHT_UNIT.PIXELS,
    type: JSON_EDITOR_TYPE.OBJECT,
    inputId: ''
  });
  public value = input<any>({});

  public valueChange = output<any>();

  public get unit(): string {
    return this.config()?.heightUnit ?? JSON_EDITOR_HEIGHT_UNIT.PIXELS;
  }

  private editor: any;

  ngOnInit(): void {
    const container = this.jsonEditor.nativeElement;
    const options = this.getEditorOptions();
    this.editor = new JSONEditor(container, options);
    this.setEditorValue(this.value());
  }

  private setEditorValue(value: any): void {
    if (!this.editor) {
      return;
    }

    let set_value: any = typeof value === 'string'
      ? this.parseJson(value)
      : value;

    set_value = set_value !== undefined
      ? set_value
      : this.config()?.type === JSON_EDITOR_TYPE.OBJECT ? {} : [];

    this.editor.set(set_value);

    if (this.config()?.mode === JSON_EDITOR_MODE.VIEW || this.config()?.mode === JSON_EDITOR_MODE.TREE) {
      this.editor.expandAll();
    }
  }

  private getEditorOptions(): any {
    return {
      mode: this.config()?.mode ?? JSON_EDITOR_MODE.CODE,
      onChange: () => {
        if (this.editor) {
          const updatedJson = this.editor?.getText?.();
          if (updatedJson) {
            this.valueChange.emit(this.parseJson(updatedJson));
          } else {
            this.valueChange.emit(this.config()?.type === JSON_EDITOR_TYPE.OBJECT ? {} : []);
          }
        }
      }
    };
  }

  private parseJson(value: any): any {
    let parsed: any = undefined;
    try {
      parsed = JSON.parse(value);
    } catch {
      parsed = this.config()?.type === JSON_EDITOR_TYPE.OBJECT ? {} : [];
    }
    return parsed;
  }
}