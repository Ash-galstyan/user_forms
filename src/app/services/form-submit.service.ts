import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { Card } from "../shared/interface/card";
import { SubmitFormResponseData } from "../shared/interface/responses";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class FormSubmitService {
    constructor(private http: HttpClient) {}

    submitForm(cards: Card[]): Observable<any> {
        return this.http.post('/api/submitForm', {body: cards})
    }
}