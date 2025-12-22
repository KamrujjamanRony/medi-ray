import { Component, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../../shared/search/search.component';
import { PermissionService } from '../../../services/auth/permission.service';
import { CarouselM } from '../../../utils/models';
import { CarouselS } from '../../../services/carousel-s';
import { environment } from '../../../../environments/environment';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPencil, faXmark, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Field, form, required, validate, debounce } from '@angular/forms/signals';

@Component({
  selector: 'app-carousel-list',
  imports: [CommonModule, SearchComponent, FontAwesomeModule, Field],
  templateUrl: './carousel-list.html',
  styleUrl: './carousel-list.css',
})
export class CarouselList {
  faPencil = faPencil;
  faXmark = faXmark;
  faMagnifyingGlass = faMagnifyingGlass;
  /* ---------------- DI ---------------- */
  private carouselService = inject(CarouselS);
  private permissionService = inject(PermissionService);
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  imgURL = environment.ImageApi;

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

  /* ---------------- FORM MODEL ---------------- */
  carouselModel = signal({
    title: '',
    description: '',
    companyID: environment.companyCode,
    imageFile: '',
    imageUrl: '',
  });

  /* ---------------- SIGNAL FORM ---------------- */
  carouselForm = form(this.carouselModel, (schemaPath) => {
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

    if (!this.carouselForm().valid()) {
      alert('Form is Invalid!');
      return;
    }

    this.isSubmitted.set(true);

    const formValue = this.carouselForm().value();
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
        this.isSubmitted.set(false);
      },
      error: () => {
        this.isSubmitted.set(false);
      }
    });
  }


  /* ---------------- UPDATE ---------------- */
  onUpdate(carousel: CarouselM) {
    this.selectedCarousel.set(carousel);

    this.carouselModel.update(current => ({
      ...current,
      title: carousel.title,
      description: carousel.description ?? '',
      companyID: carousel.companyID,
    }));

    this.carouselForm().reset();

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
    this.carouselModel.set({
      title: '',
      description: '',
      companyID: environment.companyCode,
      imageFile: '',
      imageUrl: '',
    });

    this.selectedCarousel.set(null);
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.isSubmitted.set(false);

    this.carouselForm().reset();
    this.clearFileInput();

    // ✅ SAFE way to reset file input
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }



}
