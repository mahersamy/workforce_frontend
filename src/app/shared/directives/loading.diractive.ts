import { Directive, ElementRef, Renderer2, effect, input } from '@angular/core';

@Directive({
  selector: '[appLoading]',
  standalone: true
})
export class LoadingDirective {
  // Input signal to bind the loading state: [appLoading]="isLoading()"
  appLoading = input<boolean>(false);

  private spinnerElement: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {
    // React to changes in the appLoading signal
    effect(() => {
      if (this.appLoading()) {
        this.addSpinner();
      } else {
        this.removeSpinner();
      }
    });
  }

  private addSpinner() {
    if (this.spinnerElement) return;

    // Disable the element and add visual cues
    this.renderer.setProperty(this.el.nativeElement, 'disabled', true);
    this.renderer.addClass(this.el.nativeElement, 'pointer-events-none');
    this.renderer.addClass(this.el.nativeElement, 'opacity-70');

    this.spinnerElement = this.renderer.createElement('i');
    this.renderer.addClass(this.spinnerElement, 'pi');
    this.renderer.addClass(this.spinnerElement, 'pi-spinner');
    this.renderer.addClass(this.spinnerElement, 'pi-spin');
    this.renderer.setStyle(this.spinnerElement, 'margin-left', '8px');

    // Append it to the host element
    this.renderer.appendChild(this.el.nativeElement, this.spinnerElement);
  }

  private removeSpinner() {
    // Remove the visual cues added during loading
    this.renderer.setProperty(this.el.nativeElement, 'disabled', false);
    this.renderer.removeClass(this.el.nativeElement, 'pointer-events-none');
    this.renderer.removeClass(this.el.nativeElement, 'opacity-70');

    // Remove the spinner element
    if (this.spinnerElement) {
      this.renderer.removeChild(this.el.nativeElement, this.spinnerElement);
      this.spinnerElement = null;
    }
  }
}