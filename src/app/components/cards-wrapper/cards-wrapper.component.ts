import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { interval, Subject, Subscription } from 'rxjs';
import { Card } from '../../shared/interface/card';
import { FormSubmitService } from '../../services/form-submit.service';

@Component({
	selector: 'app-cards-wrapper',
	templateUrl: './cards-wrapper.component.html',
	styleUrl: './cards-wrapper.component.scss'
})
export class CardsWrapperComponent implements OnInit {
	cardsWrapperForm: FormGroup;
	private destroy$ = new Subject<void>();
	private counter = 1;
	timer = 5;
	submitted = false;
	private timerSubscription: Subscription | undefined;

	constructor(
		private fb: FormBuilder,
		private cdRef: ChangeDetectorRef,
		private formSubmitervice: FormSubmitService
	) {
		this.cardsWrapperForm = this.fb.group({
			cards: this.fb.array([])
		});
	}

	ngOnInit(): void {
		this.addCard();
	}

	addCard(): void {
		if (this.cardsArray.length < 10) {
			const newCardForm = this.createCardForm();
			this.cardsArray.push(newCardForm);
		}
	}

	canAddCard(): boolean {
		return this.cardsArray.length < 10;
	}

	removeCard(index: number): void {
		if (this.cardsArray.length > 1) {
			this.cardsArray.removeAt(index);
		}
	}

	get cardsArray(): FormArray {
		return this.cardsWrapperForm.get('cards') as FormArray;
	}

	get cardControls() {
		return this.cardsArray.controls;
	}

	private createCardForm(): FormGroup {
		return this.fb.group({
		id: [this.generateCardId()],
		country: ['', Validators.required],
		username: ['', Validators.required],
		birthday: ['', Validators.required]
		});
	}

	private generateCardId(): string {
		return `card-${this.counter++}`;
	}

	onSubmitAll(): void {
		if (this.cardsWrapperForm.valid) {
			const allCardData: Card[] = this.cardsWrapperForm.value.cards;
			console.log('All cards data:', allCardData);
			this.submitted = true;
			this.startCountDown();
		} else {
			console.log('Form is invalid');
			this.markAllAsTouched();
		}
	}

	onCancel(): void {
		this.submitted = false;
		this.resetCountDown();
	}

	private markAllAsTouched(): void {
		this.cardsArray.controls.forEach(cardControl => {
		cardControl.markAllAsTouched();
		});
	}

	private startCountDown() {
		this.timerSubscription = interval(1000).subscribe(() => {
			if (this.timer > 0) {
				this.timer --;
				this.cdRef.detectChanges();
			} else {
				this.formSubmitervice.submitForm(this.cardsWrapperForm.value.cards).subscribe();
				this.resetCountDown();
				this.cardsWrapperForm.reset();
			}
		})
	}

	private resetCountDown() {
		if (this.timerSubscription) {
			this.timerSubscription.unsubscribe();
		}
		this.timer = 5;
		this.submitted = false;
	}

	getCardId(index: number): string {
		return this.cardsArray.at(index).get('id')?.value || `card-${index}`;
	}

	isFormValid(): boolean {
		return this.cardsWrapperForm.valid;
	}

	getInvalidCardsCount(): number {
		return this.cardsArray.controls.filter(control => control.invalid).length;
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
