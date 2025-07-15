import { Directive, ElementRef, forwardRef, inject, Injectable, OnInit, Renderer2 } from "@angular/core";
import { AbstractControl, AsyncValidator, NG_ASYNC_VALIDATORS, NG_VALIDATORS, ValidationErrors, Validator } from "@angular/forms";
import { debounceTime, distinctUntilChanged, Observable, of, switchMap } from "rxjs";
import { UserNameService } from "../services/username.service";
import { UserNameDebounceTime } from "../shared/const/consts";
import { CheckUserResponseData } from "../shared/interface/responses";
import { Country } from "../shared/enum/country";
import { BaseValidatorDirective } from "./base-validator-directive";

@Injectable({providedIn: 'root'})
export class UserNameValidator implements AsyncValidator {
    private readonly userNameService = inject(UserNameService);

    validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
        return this.userNameService.checkUserNameAvailability(control.value).pipe(
            debounceTime(UserNameDebounceTime),
            distinctUntilChanged(),
            switchMap((availability: CheckUserResponseData) => {
                return of(!availability.isAvailable ? {isAvailable: true} : null)
            }),
        )
    }
}

@Directive({
    selector: '[userNameValidator]',
    providers: [
        {
            provide: NG_ASYNC_VALIDATORS,
            useExisting: forwardRef(() => UserNameValidatorDirective),
            multi: true
        }
    ]
})

export class UserNameValidatorDirective extends BaseValidatorDirective implements AsyncValidator {
    private readonly validator = inject(UserNameValidator);

    constructor(elementRef: ElementRef, renderer: Renderer2) {
        super(elementRef, renderer)
    }

    validate(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
        this.setupControl(control);
        return this.validator.validate(control);
    }

    protected getErrorKey(): string {
        return 'isAvailable';
    }

    protected getErrorMessage(): string {
        return 'Please provide a correct Username';
    }
}

const initialCountries = Object.values(Country);

@Directive({
    selector: '[forbiddenCountryValidator]',
    providers: [{provide: NG_VALIDATORS, useExisting: ForbiddenCountryValidatorDirective, multi: true}],
})

export class ForbiddenCountryValidatorDirective extends BaseValidatorDirective implements Validator, OnInit {
    private isUserTyping = false;
    constructor(elementRef: ElementRef, renderer: Renderer2) {
        super(elementRef, renderer);
    }

    override ngOnInit(): void {
        this.renderer.listen(this.elementRef.nativeElement, 'input', () => {
            this.isUserTyping = true;
            if (this.control) {
                this.control.updateValueAndValidity();
                this.updateErrorMessage();
            }
        });

        this.renderer.listen(this.elementRef.nativeElement, 'blur', () => {
            this.isUserTyping = false;
            if (this.control) {
                this.control.updateValueAndValidity();
            }
        });
    }

    validate(control: AbstractControl): ValidationErrors | null {
        this.setupControl(control);
        
        if (!control.value || !control.touched) {
            return null;
        }

        const inputValue = control.value.trim();

        const exactMatch = initialCountries.some(country => 
            country.toLowerCase() === inputValue.toLowerCase()
        );
        
        if (exactMatch) {
            return null;
        }

        if (this.isUserTyping) {
            const partialMatches = initialCountries.filter(country => 
                country.toLowerCase().includes(inputValue.toLowerCase())
            );

            // If there are partial matches, don't show error (user might still be typing)
            if (partialMatches.length > 0) {
                return null;
            }
        }

        return {
            countryNotFound: {
                value: control.value
            }
        };
    }

    protected getErrorKey(): string {
        return 'countryNotFound';
    }

    protected getErrorMessage(): string {
        return 'Please provide a correct Country';
    }
}

@Directive({
    selector: '[birthdayValidator]',
    providers: [{provide: NG_VALIDATORS, useExisting: BirthdayValidatorDirective, multi: true}],
})
export class BirthdayValidatorDirective extends BaseValidatorDirective implements Validator {

    constructor(elementRef: ElementRef, renderer: Renderer2) {
        super(elementRef, renderer);
    }

    validate(control: AbstractControl): ValidationErrors | null {
        this.setupControl(control);
        
        if (!control.value) {
            return null;
        }

        const inputDate = new Date(control.value);
        const currentDate = new Date();
        
        // Reset time to compare only dates
        currentDate.setHours(0, 0, 0, 0);
        inputDate.setHours(0, 0, 0, 0);

        // Check if the input is a valid date
        if (isNaN(inputDate.getTime())) {
            return {
                invalidDate: {
                    value: control.value
                }
            };
        }

        // Check if birthday is in the future
        if (inputDate > currentDate) {
            return {
                futureDate: {
                    value: control.value
                }
            };
        }

        return null;
    }

    protected getErrorKey(): string {
        if (this.control?.hasError('invalidDate')) {
            return 'invalidDate';
        }
        return 'futureDate';
    }

    protected getErrorMessage(): string {
        return 'Please provide a correct Birthday';
    }
}