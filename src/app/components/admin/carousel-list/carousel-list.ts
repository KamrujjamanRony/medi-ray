import { Component, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, IMAGE_LOADER, ImageLoaderConfig, NgOptimizedImage } from '@angular/common';
import { CarouselM } from '../../../utils/models';
import { CarouselS } from '../../../services/carousel-s';
import { environment } from '../../../../environments/environment';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPencil, faXmark, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Field, form, required, validate, debounce } from '@angular/forms/signals';
import { PermissionS } from '../../../services/auth/permission-s';

@Component({
  selector: 'app-carousel-list',
  imports: [CommonModule, FontAwesomeModule, Field, NgOptimizedImage],
  templateUrl: './carousel-list.html',
  styleUrl: './carousel-list.css',
  providers: [
    {
      provide: IMAGE_LOADER,
      useValue: (config: ImageLoaderConfig) => {
        // config.src is the filename (e.g., 'image.jpg')
        // config.width is the width Angular wants for a specific srcset
        return `${environment.ImageApi + config.src}?w=${config.width}`;
      },
    },
  ],
})
export class CarouselList {
  faPencil = faPencil;
  faXmark = faXmark;
  faMagnifyingGlass = faMagnifyingGlass;
  /* ---------------- DI ---------------- */
  private carouselService = inject(CarouselS);
  private permissionService = inject(PermissionS);
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  imgURL = environment.ImageApi;
  emptyImg = environment.emptyImg;

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
  error = signal({
    message: '',
    type: 'form'
  });

  isView = signal(false);
  isInsert = signal(false);
  isEdit = signal(false);
  isDelete = signal(false);

  highlightedTr = signal<number>(-1);
  isSubmitting = signal(false);

  /* ---------------- FORM MODEL ---------------- */
  model = signal({
    title: '',
    description: '',
    companyID: environment.companyCode,
    imageFile: '',
    imageUrl: '',
  });

  /* ---------------- SIGNAL FORM ---------------- */
  form = form(this.model, (schemaPath) => {
    required(schemaPath.title, { message: 'Title is required' });

    // Debounce form updates for better performance
    debounce(schemaPath.title, 300);
  });

  /* ---------------- LIFECYCLE ---------------- */
  ngOnInit(): void {
    this.loadCarousels();
    this.loadPermissions();
  }

  /* ---------------- LOADERS ---------------- */
  loadPermissions() {
    this.isView.set(this.permissionService.hasPermission('Carousel', 'view'));
    this.isInsert.set(this.permissionService.hasPermission('Carousel', 'create'));
    this.isEdit.set(this.permissionService.hasPermission('Carousel', 'edit'));
    this.isDelete.set(this.permissionService.hasPermission('Carousel', 'delete'));
  }

  loadCarousels(title = "", description = "", companyID = environment.companyCode) {
    this.isLoading.set(true);
    this.error.set({message: '', type: 'load'});
    const searchParams = {companyID, title, description}

    this.carouselService.getAllCarousel(searchParams).subscribe({
      next: (data) => {
        this.carousels.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set({message: 'Failed to load carousels.', type: 'load'});
        this.isLoading.set(false);
      }
    });
  }

  /* ---------------- SEARCH ---------------- */
  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value.trim());
  }

  /* ---------------- Image File Handler ---------------- */
  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);

      const reader = new FileReader();
      reader.onload = () => this.previewUrl.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  clearFileInput() {
    setTimeout(() => {
      const input = document.getElementById('imageUrl') as HTMLInputElement;
      if (input) {
        input.value = '';
      }
    });
  }

  /* ---------------- SUBMIT ---------------- */
  onSubmit(event: Event) {
    event.preventDefault();

    if (!this.form().valid()) {
      alert('Form is Invalid!');
      return;
    }

    this.isSubmitting.set(true);
    this.error.set({message: '', type: 'form'});

    const formValue = this.form().value();
    const formData = new FormData();

    formData.append('CompanyID', String(formValue.companyID));
    formData.append('Title', formValue.title);
    formData.append('Description', formValue.description ?? '');
    console.log(this.selectedFile());
    // ✅ Append file correctly
    if (this.selectedFile()) {
      formData.append('ImageFile', this.selectedFile() as File);
    }

    const request$ = this.selectedCarousel()
      ? this.carouselService.updateCarousel(this.selectedCarousel()!.id, formData)
      : this.carouselService.addCarousel(formData);

    request$.subscribe({
      next: () => {
        this.loadCarousels();
        this.formReset();
        this.isSubmitting.set(false);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.error.set({message: error?.message || error?.error?.message || 'An error occurred during submission.', type: 'form'});
      }
    });
  }


  /* ---------------- UPDATE ---------------- */
  onUpdate(carousel: CarouselM) {
    this.selectedCarousel.set(carousel);

    this.model.update(current => ({
      ...current,
      title: carousel.title,
      description: carousel.description ?? '',
      companyID: carousel.companyID,
    }));

    this.form().reset();

    this.previewUrl.set(
      carousel.imageUrl
        ? `${environment.apiUrl}/uploads/${carousel.imageUrl}`
        : null
    );

    this.selectedFile.set(null);

    // ✅ Clear file input safely
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
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
    this.model.set({
      title: '',
      description: '',
      companyID: environment.companyCode,
      imageFile: '',
      imageUrl: '',
    });   

    this.selectedCarousel.set(null);
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.isSubmitting.set(false);

    this.form().reset();
    this.clearFileInput();

    // ✅ SAFE way to reset file input
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  closeError(e: Event) {
    e.preventDefault();
    this.error.set({message: '', type: 'form'});
  }
}
