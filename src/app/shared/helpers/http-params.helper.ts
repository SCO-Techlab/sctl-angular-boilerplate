import { HttpParams } from "@angular/common/http";
import { IPaginationQuery } from "@core/shared/interfaces";

export const fillHttpParams = (filter?: any, pagination?: IPaginationQuery): HttpParams => {
  let httpParams = new HttpParams();

  if (pagination?.page && pagination?.limit) {
    httpParams = httpParams.append('page', pagination.page.toString());
    httpParams = httpParams.append('limit', pagination.limit.toString());
  }

  if (filter && Object.values(filter)?.length) {
    Object.keys(filter).forEach((key: string) => {
      if (filter[key]) {
        httpParams = httpParams.append(key, filter[key].toString());
      }
    });
  }

  return httpParams;
}