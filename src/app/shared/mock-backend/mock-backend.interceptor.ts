import { HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, Observable, of, tap } from 'rxjs';

import { CheckUserResponseData, SubmitFormResponseData } from '../interface/responses';
import { SubmitFormRequestData } from '../interface/requests';

const RESPONSE_DELAY_MS = 500;

@Injectable({
  providedIn: 'root'
})
export class MockBackendInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<SubmitFormRequestData>): Observable<HttpResponse<CheckUserResponseData | SubmitFormResponseData>> {
    if (req.url.endsWith('/api/checkUsername') && req.method === 'POST') {
      return this.handleCheckUsername(req);
    }

    if (req.url.endsWith('/api/submitForm') && req.method === 'POST') {
      return this.handleSubmitForm();
    }

    return of(new HttpResponse({ status: 404, body: { result: 'You are using the wrong endpoint'} }));
  }

  private handleCheckUsername(req: HttpRequest<SubmitFormRequestData>): Observable<HttpResponse<CheckUserResponseData>> {
    const isAvailable = req.body?.username.includes('new') ?? false;
    const response = new HttpResponse({ status: 200, body: { isAvailable } });

    return of(response).pipe(
      delay(RESPONSE_DELAY_MS),
      tap(() => console.log('checkUsername response:', { isAvailable }))
    );
  }

  private handleSubmitForm(): Observable<HttpResponse<SubmitFormResponseData>> {
    const response = new HttpResponse({ status: 200, body: { result: 'nice job' } });

    return of(response).pipe(
      delay(RESPONSE_DELAY_MS),
      tap(() => console.log('submitForm response'))
    );
  }
}
