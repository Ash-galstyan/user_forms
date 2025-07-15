import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CheckUserResponseData } from "../shared/interface/responses";
import { Observable, tap } from "rxjs";
import { UserNameErrorMessage } from "../shared/const/consts";

@Injectable({providedIn: 'root'})
export class UserNameService {
    usernameErrorMsg = '';
    constructor(private http: HttpClient) {}

    checkUserNameAvailability(username: string): Observable<CheckUserResponseData> {
        return this.http.post<CheckUserResponseData>('/api/checkUsername', { username }).pipe(tap((availability) => {
            if (!availability.isAvailable) {
                this.usernameErrorMsg = UserNameErrorMessage
            } else {
                this.usernameErrorMsg = ''
            }
        }));
    }
}