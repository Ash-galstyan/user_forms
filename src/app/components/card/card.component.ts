import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Country } from '../../shared/enum/country';
import {  Observable, Subject, takeUntil } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CheckUserResponseData } from '../../shared/interface/responses';
import { UserNameService } from '../../services/username.service';

@Component({
	selector: 'app-card',
	templateUrl: './card.component.html',
	styleUrl: './card.component.scss'
})
export class CardComponent implements OnInit, OnDestroy {
	@Input() parentForm!: AbstractControl;
	@Input() cardIndex!: number;
	form!: FormGroup;
	showSuggestions = false;
	initialCountries = Object.values(Country);
	filteredCountries: Country[] = [];
	isUsernameValid = false;
	hasUserNameError = false;
	isChackingUserName = false;
	usernameErrorMsg = '';
	countryErrorMsg = 'Please provide a correct Country';
	private destroy$ = new Subject<void>();
	constructor(
		private fb: FormBuilder,
		private http: HttpClient,
		public usernameService: UserNameService,
		private cdRef: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.form = this.parentForm as FormGroup;
		this.filteredCountries = [...this.initialCountries];
		this.subscribeToCountryChange();
	}

	onCountryFocus(): void {
		this.showSuggestions = this.filteredCountries.length > 0;
	}

	onCountryBlur(): void {
		this.showSuggestions = false;
		this.cdRef.detectChanges()
	}

	subscribeToCountryChange() {
		this.form?.controls['country'].valueChanges.pipe(takeUntil(this.destroy$)).subscribe(country => {
			let value = '';
			if (country) {
				value = country.toLowerCase();
			}
			if (value) {
				this.filteredCountries = this.initialCountries.filter(count => count.toLowerCase().includes(value));
				const exactMatch = this.initialCountries.some(count => count.toLowerCase() === value);
				if (exactMatch) {
					country = country.charAt(0).toUpperCase() + country.slice(1);
					this.form?.controls['country'].patchValue(country, {emitEvent: false})
				}
				this.showSuggestions = !exactMatch && (this.filteredCountries.length > 0 &&
					!this.form?.controls['country'].hasError('countryNotFound'));
			} else {
				this.filteredCountries = [...this.initialCountries];
				this.showSuggestions = false;
			}
		})
	}

	selectCountry(country: string) {
		this.form.patchValue({ country });
		this.showSuggestions = false;
	}

	checkUserNameAvailability(username: string): Observable<CheckUserResponseData> {
		return this.http.post<CheckUserResponseData>('/api/checkUsername', { username });
	}

	ngOnDestroy(): void {
		this.destroy$.next();
    	this.destroy$.complete();
	}
  
}
