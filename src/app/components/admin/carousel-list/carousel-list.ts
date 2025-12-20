import {
  Component,
  ElementRef,
  inject,
  signal,
  computed,
  viewChild,
  viewChildren
} from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FieldComponent } from '../../shared/field/field.component';
import { SearchComponent } from '../../shared/search/search.component';
import { PermissionService } from '../../../services/auth/permission.service';
import { CarouselM } from '../../../utils/models';
import { CarouselS } from '../../../services/carousel-s';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-carousel-list',
  imports: [CommonModule, ReactiveFormsModule, FieldComponent, SearchComponent],
  templateUrl: './carousel-list.html',
  styleUrl: './carousel-list.css',
})
export class CarouselList {
  /* ---------------- DI ---------------- */
  private fb = inject(NonNullableFormBuilder);
  private carouselService = inject(CarouselS);
  private permissionService = inject(PermissionService);

  /* ---------------- SIGNAL STATE ---------------- */
  carousels = signal<CarouselM[]>([]);
  searchQuery = signal('');

  filteredCarouselList = computed(() => {
    const query = this.searchQuery().toLowerCase();

    return this.carousels()
      .filter(carousel =>
        carousel.title?.toLowerCase().includes(query) ||
        carousel.description?.toLowerCase().includes(query) ||
        String(carousel.companyID ?? '').toLowerCase().includes(query)
      )
      .reverse();
  });

  selectedCarousel = signal<CarouselM | null>(null);
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);

  isLoading = signal(false);
  hasError = signal(false);

  isView = signal(false);
  isInsert = signal(false);
  isEdit = signal(false);
  isDelete = signal(false);

  highlightedTr = signal<number>(-1);
  isSubmitted = signal(false);

  readonly inputRefs = viewChildren<ElementRef>('inputRef');
  readonly searchInput =
    viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  /* ---------------- FORM ---------------- */
  form = this.fb.group({
    title: this.fb.control<any>('', Validators.required),
    description: this.fb.control<any>(''),
    companyID: this.fb.control<number | null>(environment.companyCode, Validators.required),
    imageUrl: this.fb.control<any>(''),
  });

  /* ---------------- LIFECYCLE ---------------- */
  ngOnInit(): void {
    this.loadCarousels();
    this.loadPermissions();

    setTimeout(() => {
      this.inputRefs()?.[0]?.nativeElement.focus();
    }, 10);
  }

  /* ---------------- LOADERS ---------------- */
  loadPermissions() {
    this.isView.set(this.permissionService.hasPermission('Product'));
    this.isInsert.set(this.permissionService.hasPermission('Product', 'create'));
    this.isEdit.set(this.permissionService.hasPermission('Product', 'edit'));
    this.isDelete.set(this.permissionService.hasPermission('Product', 'delete'));
    // this.isView.set(this.permissionService.hasPermission('Carousel'));                 // Todo: remove this part after debug
    // this.isInsert.set(this.permissionService.hasPermission('Carousel', 'create'));
    // this.isEdit.set(this.permissionService.hasPermission('Carousel', 'edit'));
    // this.isDelete.set(this.permissionService.hasPermission('Carousel', 'delete'));
  }

  loadCarousels() {
    this.isLoading.set(true);
    this.hasError.set(false);
    const searchParams = {
  "companyID": environment.companyCode
}

    this.carouselService.getAllCarousel(searchParams).subscribe({
      next: (data) => {
        this.carousels.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  /* ---------------- SEARCH ---------------- */
  onSearchCarousel(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  /* ---------------- FORM HELPERS ---------------- */
  getControl(name: string): FormControl {
    return this.form.get(name) as FormControl;
  }

  /* ---------------- FILE HANDLING ---------------- */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile.set(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  /* ---------------- KEYBOARD NAVIGATION ---------------- */
  handleEnterKey(event: Event, currentIndex: number) {
    event.preventDefault();
    const inputs = this.inputRefs()?.filter(
      i => !i.nativeElement.disabled
    );

    if (!inputs) return;

    if (currentIndex + 1 < inputs.length) {
      inputs[currentIndex + 1].nativeElement.focus();
    } else {
      this.onSubmit(event);
    }
  }

  handleSearchKeyDown(event: KeyboardEvent) {
    const list = this.filteredCarouselList();
    if (!list.length) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.highlightedTr.update(i => (i + 1) % list.length);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.highlightedTr.update(i => (i - 1 + list.length) % list.length);
    }

    if (event.key === 'Enter' && this.highlightedTr() !== -1) {
      event.preventDefault();
      this.onUpdate(list[this.highlightedTr()]);
      this.highlightedTr.set(-1);
    }
  }

  /* ---------------- SUBMIT ---------------- */
  onSubmit(e: Event) {
    console.log("clicked");
    console.log(this.form);
    console.log(this.form.value);
    e.preventDefault();
    this.isSubmitted.set(true);
    const {title, companyID, imageUrl} = this.form.value;

    if (!title || !companyID) {
      return;
    }

    // Create FormData
    const formData = new FormData();

    // Add form values
    const formValue = this.form.getRawValue();
    console.log(formValue);
    formData.append('Title', formValue.title);
    formData.append('Description', formValue.description);
    formData.append('CompanyID', formValue.companyID?.toString() || '');
    formData.append('ImageFile', formValue.imageUrl);

    // Add file if selected
    if (this.selectedFile()) {
      formData.append('imageFile', this.selectedFile()!);
    }

    if (this.selectedCarousel()) {
      // Update existing
      const id = this.selectedCarousel()!.id;
      this.carouselService.updateCarousel(id, formData).subscribe({
        next: () => {
          this.loadCarousels();
          this.formReset();
        },
        error: (err) => {
          console.error('Update failed:', err);
          alert('Update failed. Please check the data.');
        }
      });
    } else {
      // Create new
      if (!this.selectedFile()) {
        alert('Please select an image file');
        return;
      }

      this.carouselService.addCarousel(formData).subscribe({
        next: () => {
          this.loadCarousels();
          this.formReset();
        },
        error: (err) => {
          console.error('Create failed:', err);
          alert('Create failed. Please check the data.');
        }
      });
    }
  }

  /* ---------------- UPDATE ---------------- */
  onUpdate(carousel: CarouselM) {
    this.selectedCarousel.set(carousel);

    this.form.patchValue({
      title: carousel.title,
      description: carousel.description ?? '',
      companyID: carousel.companyID,
      imageUrl: carousel.imageUrl ?? '',
    });

    // Set preview from existing imageUrl
    if (carousel.imageUrl) {
      this.previewUrl.set(carousel.imageUrl);
    } else {
      this.previewUrl.set(null);
    }
    this.selectedFile.set(null);

    setTimeout(() => {
      this.inputRefs()?.[0]?.nativeElement.focus();
    });
  }

  /* ---------------- DELETE ---------------- */
  onDelete(id: any) {
    if (!confirm('Are you sure you want to delete this carousel?')) return;

    this.carouselService.deleteCarousel(id).subscribe(() => {
      this.carousels.update(list => list.filter(c => c.id !== id));
    });
  }

  /* ---------------- RESET ---------------- */
  formReset() {
    this.form.reset({
      title: '',
      description: '',
      companyID: null,
      imageUrl: '',
    });

    this.selectedCarousel.set(null);
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.isSubmitted.set(false);
  }

}
