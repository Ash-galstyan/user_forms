import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { MockBackendInterceptor } from './shared/mock-backend/mock-backend.interceptor';
import { AppComponent } from './app.component';
import { CardComponent } from './components/card/card.component';
import { CardsWrapperComponent } from './components/cards-wrapper/cards-wrapper.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BirthdayValidatorDirective, ForbiddenCountryValidatorDirective, UserNameValidatorDirective } from './directives/input-validation.directive';
import { BaseValidatorDirective } from './directives/base-validator-directive';

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    CardsWrapperComponent,
    UserNameValidatorDirective,
    ForbiddenCountryValidatorDirective,
    BirthdayValidatorDirective
  ],
  imports: [
    BrowserModule,
    RouterOutlet,
    NgbModule,
    ReactiveFormsModule
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: MockBackendInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
