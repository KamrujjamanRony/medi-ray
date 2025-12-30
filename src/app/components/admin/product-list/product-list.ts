import { Component, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductM } from '../../../utils/models';
import { environment } from '../../../../environments/environment';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPencil, faXmark, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Field, form, required, validate, debounce } from '@angular/forms/signals';
import { ProductS } from '../../../services/product-s';
import { PermissionS } from '../../../services/auth/permission-s';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FontAwesomeModule, Field],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {
  faPencil = faPencil;
  faXmark = faXmark;
  faMagnifyingGlass = faMagnifyingGlass;
  /* ---------------- DI ---------------- */
  private productService = inject(ProductS);
  private permissionService = inject(PermissionS);
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  imgURL = environment.ImageApi;
  emptyImg = environment.emptyImg;

  /* ---------------- SIGNAL STATE ---------------- */
  products = signal<ProductM[]>([]);
  searchQuery = signal('');

  filteredProductList = computed(() => {
    const query = this.searchQuery().toLowerCase();

    return this.products()
      .filter(product =>
        product.title?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        String(product.companyID ?? '').toLowerCase().includes(query)
      )
      .reverse();
  });

  selectedProduct = signal<ProductM | null>(null);
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
    this.loadProducts();
    this.loadPermissions();
  }

  /* ---------------- LOADERS ---------------- */
  loadPermissions() {
    this.isView.set(this.permissionService.hasPermission('Product', 'view'));
    this.isInsert.set(this.permissionService.hasPermission('Product', 'create'));
    this.isEdit.set(this.permissionService.hasPermission('Product', 'edit'));
    this.isDelete.set(this.permissionService.hasPermission('Product', 'delete'));
  }

  loadProducts(title = "", description = "", companyID = environment.companyCode) {
    this.isLoading.set(true);
    this.hasError.set(false);
    const searchParams = {companyID, title, description}

    this.productService.getAllProducts(searchParams).subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
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

    this.isSubmitted.set(true);

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

    const request$ = this.selectedProduct()
      ? this.productService.updateProduct(this.selectedProduct()!.id, formData as any)
      : this.productService.addProduct(formData);

    request$.subscribe({
      next: () => {
        this.loadProducts();
        this.formReset();
        this.isSubmitted.set(false);
      },
      error: () => {
        this.isSubmitted.set(false);
      }
    });
  }


  /* ---------------- UPDATE ---------------- */
  onUpdate(product: ProductM) {
    this.selectedProduct.set(product);

    this.model.update(current => ({
      ...current,
      title: product.title,
      description: product.description ?? '',
      companyID: product.companyID,
    }));

    this.form().reset();

    this.previewUrl.set(
      product.imageUrl
        ? `${environment.apiUrl}/uploads/${product.imageUrl}`
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
    if (!confirm('Are you sure you want to delete this product?')) return;

    this.productService.deleteProduct(id).subscribe(() => {
      this.products.update(list => list.filter(c => c.id !== id));
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

    this.selectedProduct.set(null);
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.isSubmitted.set(false);

    this.form().reset();
    this.clearFileInput();

    // ✅ SAFE way to reset file input
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

}
