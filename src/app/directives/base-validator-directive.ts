import { Directive, ElementRef, inject, Injectable, OnDestroy, OnInit, Renderer2 } from "@angular/core";
import { AbstractControl, NgControl } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";

@Directive()
export abstract class BaseValidatorDirective implements OnInit, OnDestroy {
    protected control: AbstractControl | null = null;
    private errorEl: HTMLElement | null = null;
    private statusSubscription: any = null;

    constructor(
        protected elementRef: ElementRef,
        protected renderer: Renderer2
    ) {}

    ngOnInit(): void {
        this.renderer.listen(this.elementRef.nativeElement, 'blur', () => {
            this.updateErrorMessage();
        });

        this.renderer.listen(this.elementRef.nativeElement, 'change', () => {
            this.updateErrorMessage();
        });
    }

    protected setupControl(control: AbstractControl): void {
        if (!this.control) {
            this.control = control;

            if (this.control.statusChanges && !this.statusSubscription) {
                this.statusSubscription = this.control.statusChanges.subscribe(() => {
                    this.updateErrorMessage();
                });
            }
        }
    }

    public updateErrorMessage(): void {
        if (!this.control) return;
        this.removeErrorMessage();
        
        const errorKey = this.getErrorKey();
        if (this.control.hasError(errorKey) && (this.control.touched || this.control.dirty)) {
            this.addErrorMessage();
        }
    }

    private addErrorMessage(): void {
        this.errorEl = this.renderer.createElement('div');
        const errorMessage = this.getErrorMessage();
        const error = this.renderer.createText(errorMessage);

        this.renderer.setStyle(this.errorEl, 'color', '#cb444a');
        this.renderer.setStyle(this.errorEl, 'font-size', '12px');
        this.renderer.setStyle(this.errorEl, 'margin-top', '4px');
        this.renderer.addClass(this.errorEl, 'validation-error');

        this.renderer.appendChild(this.errorEl, error);

        const parentElement = this.renderer.parentNode(this.elementRef.nativeElement);
        const nextSibling = this.renderer.nextSibling(this.elementRef.nativeElement);

        if (nextSibling) {
            this.renderer.insertBefore(parentElement, this.errorEl, nextSibling);
        } else {
            this.renderer.appendChild(parentElement, this.errorEl);
        }
    }

    private removeErrorMessage(): void {
        if (this.errorEl) {
            this.renderer.removeChild(this.renderer.parentNode(this.errorEl), this.errorEl);
            this.errorEl = null;
        }
    }

    ngOnDestroy(): void {
        this.removeErrorMessage();
        if (this.statusSubscription) {
            this.statusSubscription.unsubscribe();
        }
    }

    protected abstract getErrorKey(): string;
    protected abstract getErrorMessage(): string;
}