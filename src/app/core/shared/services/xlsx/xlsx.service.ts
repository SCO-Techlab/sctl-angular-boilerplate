import { Injectable } from '@angular/core';
import { MAGIC_NUMBERS, XLSX_CONSTANTS } from '@core/shared/constants';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class XlsxService {

  public createStandardColsInfo(json: any[]): XLSX.ColInfo[] {
    if (!json?.length) {
      return [];
    }

    const keys: string[] = Object.keys(json[MAGIC_NUMBERS.N_0]);
    if (!keys?.length) {
      return [];
    }

    const colsInfo = keys.map(key => {
      return { wch: Math.max(...json.map(item => item[key]?.toString()?.length ?? MAGIC_NUMBERS.N_0), key.length) + MAGIC_NUMBERS.N_2 }
    });

    return colsInfo ?? [];
  }

  public exportAsExcel(json: any[], excelFileName: string, colsInfo?: XLSX.ColInfo[]): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    if (worksheet && colsInfo?.length) {
      worksheet['!cols'] = colsInfo;
    }

    const workbook: XLSX.WorkBook = { Sheets: { data: worksheet }, SheetNames: [XLSX_CONSTANTS.SHEET_NAME] };
    const excelBuffer = XLSX.write(workbook, {
      bookType: XLSX_CONSTANTS.BOOK_TYPE as XLSX.BookType,
      type: XLSX_CONSTANTS.XLSX_TYPE as XLSX.WritingOptions['type']
    });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: XLSX_CONSTANTS.EXCEL_TYPE });
    const name = fileName + XLSX_CONSTANTS.FILENAME + new Date().getTime() + XLSX_CONSTANTS.EXCEL_EXTENSION;
    FileSaver.saveAs(data, name);
  }
}
