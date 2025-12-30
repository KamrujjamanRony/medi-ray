import { Component, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS, FormControl, FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'multi-select',
  imports: [FormsModule],
  templateUrl: './multi-select.html',
  styleUrl: './multi-select.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelect),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MultiSelect),
      multi: true
    }
  ]
})
export class MultiSelect {
  @Input() placeholder: string = 'Select options';
  @Input() options: string[] = [];

  selectedOptions: string[] = [];
  isDropdownOpen = false;
  filteredOptions: string[] = [];

  private onChange: (value: any) => void = () => { };
  private onTouched: () => void = () => { };
  private subscription: Subscription = new Subscription();

  ngOnInit() {
    this.filterOptions();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  toggleDropdown(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.filterOptions();
    }
  }

  filterOptions(shouldEmit: boolean = true) {
    // Show only options that haven't been selected
    this.filteredOptions = this.options.filter(option =>
      !this.selectedOptions.includes(option)
    );
  }

  selectOption(option: string) {
    if (!this.selectedOptions.includes(option)) {
      this.selectedOptions.push(option);
      this.onChange(this.selectedOptions);
      this.onTouched();
      this.filterOptions();
    }
  }

  removeOption(option: string) {
    const index = this.selectedOptions.indexOf(option);
    if (index > -1) {
      this.selectedOptions.splice(index, 1);
      this.onChange(this.selectedOptions);
      this.onTouched();
      this.filterOptions();
    }
  }

  // ControlValueAccessor implementation
  writeValue(value: string[]): void {
    if (value) {
      this.selectedOptions = [...value];
    } else {
      this.selectedOptions = [];
    }
    // DON'T emit valueChanged here - it causes infinite loop
    // Just filter options without emitting
    this.filteredOptions = this.options.filter(option =>
      !this.selectedOptions.includes(option)
    );
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Implement if needed
  }

  // Validator implementation
  validate(control: FormControl) {
    return null; // No validation in component, handled by form
  }

}
