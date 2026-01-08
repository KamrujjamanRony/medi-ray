import { Component, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemM, ProductM } from '../../../utils/models';
import { environment } from '../../../../environments/environment';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPencil, faXmark, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Field, form, required, validate, debounce } from '@angular/forms/signals';
import { ProductS } from '../../../services/product-s';
import { PermissionS } from '../../../services/auth/permission-s';
import { MultiSelect } from "../../shared/multi-select/multi-select";
import { FormsModule } from '@angular/forms';
import { ItemS } from '../../../services/item-s';

interface RelatedProductOption {
  key: number;
  value: string;
}

interface ImagePreview {
  url: string;
  file: File;
  index: number;
}

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FontAwesomeModule, Field, MultiSelect, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {
  faPencil = faPencil;
  faXmark = faXmark;
  faMagnifyingGlass = faMagnifyingGlass;
  
  /* ---------------- DI ---------------- */
  private productService = inject(ProductS);
  private itemService = inject(ItemS);
  private permissionService = inject(PermissionS);
  
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('multipleFileInput') multipleFileInput!: ElementRef<HTMLInputElement>;
  
  imgURL = environment.ImageApi;
  emptyImg = environment.emptyImg;

  /* ---------------- SIGNAL STATE ---------------- */
  products = signal<ProductM[]>([]);
  items = signal<ItemM[]>([]);
  relatedProducts: RelatedProductOption[] = [];
  searchQuery = signal('');

  selectedProduct = signal<ProductM | null>(null);
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  
  // New signals for multiple images
  selectedFiles = signal<File[]>([]);
  multiplePreviewUrls = signal<ImagePreview[]>([]);

  isLoading = signal(false);
  hasError = signal(false);

  isView = signal(false);
  isInsert = signal(false);
  isEdit = signal(false);
  isDelete = signal(false);

  highlightedTr = signal<number>(-1);
  isSubmitted = signal(false);

  /* ---------------- COMPUTED ---------------- */
  filteredProductList = computed(() => {
    const query = this.searchQuery().toLowerCase();

    return this.products()
      .filter(product =>
        product.title?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        String(product.companyID ?? '').toLowerCase().includes(query)
      )      
      .sort((a, b) => (a.sl! - b.sl!));
  });

  relatedProductOptions = computed(() =>
    this.products().map(product => ({
      key: product.id,
      value: product.title
    }))
  );

  itemOptions = computed(() =>
    this.items().map(item => ({
      key: item.id,
      value: item.description || ''
    }))
  );

  /* ---------------- FORM MODEL ---------------- */
  model = signal({
    title: '',
    description: '',
    itemId: '',
    brand: '',
    model: '',
    origin: '',
    additionalInformation: '',
    specialFeature: '',
    catalogURL: '',
    sl: '',
    companyID: environment.companyCode,
    imageFile: '',
    imageFiles: '',
    imageUrl: '',
    images: [] as any[],
    relatedProducts: [] as any[],
  });

  /* ---------------- SIGNAL FORM ---------------- */
  form = form(this.model, (schemaPath) => {
    required(schemaPath.title, { message: 'Title is required' });
    validate(schemaPath.sl, ({ value }) => {
      const numberRegex = /^\d+$/;
      if (!numberRegex.test(value())) {
        return {
          kind: 'complexity',
          message: 'Product SL must be a valid number'
        }
      }
      return null
    })

    debounce(schemaPath.title, 300);
  });

  /* ---------------- LIFECYCLE ---------------- */
  ngOnInit(): void {
    this.loadProducts();
    this.loadPermissions();
    this.loadItems();
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
    const searchParams = { companyID, title, description }

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

  loadItems(companyID = environment.companyCode) {
    this.itemService.getAllItems({ companyID }).subscribe({
      next: (data) => {
        // Process items if needed
        this.items.set(data);
      },
      error: (error) => {
        console.error('Error loading items:', error);
      }
    });
  }

  /* ---------------- SEARCH ---------------- */
  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value.trim());
  }

  /* ---------------- Image File Handlers ---------------- */
  onMainImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile.set(file);

      const reader = new FileReader();
      reader.onload = () => this.previewUrl.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  onMultipleImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const newPreviews: ImagePreview[] = [];

    if (input.files && input.files.length > 0) {
      // Convert FileList to array
      const files = Array.from(input.files);
      
      // Add new files to existing ones
      const currentFiles = this.selectedFiles();
      const updatedFiles = [...currentFiles, ...files];
      this.selectedFiles.set(updatedFiles);

      // Create previews for new files only
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview: ImagePreview = {
            url: e.target?.result as string,
            file: file,
            index: currentFiles.length + index
          };
          newPreviews.push(preview);
          
          // When all new previews are loaded, update the signal
          if (newPreviews.length === files.length) {
            this.multiplePreviewUrls.update(current => [...current, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  removeMultipleImagePreview(index: number) {
    // Remove from previews
    this.multiplePreviewUrls.update(previews => 
      previews.filter(p => p.index !== index)
    );
    
    // Remove from selected files
    this.selectedFiles.update(files => 
      files.filter((_, i) => i !== index)
    );
    
    // Update indices for remaining previews
    this.multiplePreviewUrls.update(previews => 
      previews.map((preview, i) => ({
        ...preview,
        index: i
      }))
    );
  }

  clearFileInput() {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  clearMultipleFileInput() {
    if (this.multipleFileInput) {
      this.multipleFileInput.nativeElement.value = '';
    }
  }

  // Convert RelatedProductOption[] to string[] (just keys)
  getRelatedProductKeys(relatedProduct: RelatedProductOption[]): number[] {
    return relatedProduct.map(p => p.key);
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

    const payload = {
      companyID: formValue.companyID,
      title: formValue.title,
      description: formValue.description,
      itemId: formValue.itemId,
      brand: formValue.brand,
      model: formValue.model,
      origin: formValue.origin,
      additionalInformation: formValue.additionalInformation,
      specialFeature: formValue.specialFeature,
      catalogURL: formValue.catalogURL,
      sl: Number(formValue.sl),
      imageUrl: formValue.imageUrl,
      images: formValue.images,
      relatedProducts: this.getRelatedProductKeys(this.relatedProducts),
    };

    console.log('Payload to send:', payload);
    
    const formData = new FormData();

    // Append form fields
    formData.append('CompanyID', String(payload.companyID));
    formData.append('Title', payload.title);
    formData.append('Description', payload.description ?? '');
    formData.append('ItemId', payload.itemId ?? '');
    formData.append('Brand', payload.brand ?? '');
    formData.append('Model', payload.model ?? '');
    formData.append('Origin', payload.origin ?? '');
    formData.append('AdditionalInformation', payload.additionalInformation ?? '');
    formData.append('SpecialFeature', payload.specialFeature ?? '');
    formData.append('CatalogURL', payload.catalogURL ?? '');
    formData.append('SL', String(payload.sl));
    
    // Append related products
    payload.relatedProducts.forEach((prodId) => {
      formData.append('RelatedProducts', prodId.toString());
    });
    
    // ✅ Append main image file
    if (this.selectedFile()) {
      formData.append('ImageFile', this.selectedFile() as File);
    }
    
    // ✅ Append multiple image files
    const multipleFiles = this.selectedFiles();
    if (multipleFiles.length > 0) {
      multipleFiles.forEach((file, index) => {
        formData.append('ImageFiles', file); // Use same name for backend
      });
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
      error: (error) => {
        console.error('Error submitting form:', error);
        this.isSubmitted.set(false);
      }
    });
  }

  /* ---------------- UPDATE ---------------- */
onUpdate(product: ProductM) {
  this.selectedProduct.set(product);

  // Convert related products
  if (product.relatedProducts) {
    this.relatedProducts = this.relatedProductOptions().filter(option =>
      product.relatedProducts!.includes(option.key)
    );
  } else {
    this.relatedProducts = [];
  }

  // Update form model
  this.model.update(current => ({
    ...current,
    title: product.title,
    description: product.description ?? '',
    companyID: product.companyID,
    itemId: product.itemId ?? '',
    brand: product.brand ?? '',
    model: product.model ?? '',
    origin: product.origin ?? '',
    additionalInformation: product.additionalInformation ?? '',
    specialFeature: product.specialFeature ?? '',
    catalogURL: product.catalogURL ?? '',
    sl: product.sl?.toString() ?? '',
    imageUrl: product.imageUrl ?? '',
    images: product.images ?? [],
    relatedProducts: this.relatedProductOptions().filter(rp => product.relatedProducts?.includes(rp.key)) || [],
  }));

  this.form().reset();

  // FIX: Use imgURL instead of environment.apiUrl
  // Set main image preview
  if (product.imageUrl) {
    this.previewUrl.set(
      this.imgURL ? `${this.imgURL}${product.imageUrl}` : product.imageUrl
    );
  } else {
    this.previewUrl.set(null);
  }

  // Reset main image file
  this.selectedFile.set(null);

  // FIX: Set multiple image previews if exists - use imgURL
  if (product.images && product.images.length > 0) {
    const previews: ImagePreview[] = [];
    product.images.forEach((image, index) => {
      previews.push({
        url: this.imgURL ? `${this.imgURL}${image}` : image,
        file: new File([], image), // Empty file for existing images
        index: index
      });
    });
    this.multiplePreviewUrls.set(previews);
    this.selectedFiles.set([]); // No new files selected for existing images
  } else {
    this.multiplePreviewUrls.set([]);
    this.selectedFiles.set([]);
  }

  // Clear file inputs
  if (this.fileInput) {
    this.fileInput.nativeElement.value = '';
  }
  if (this.multipleFileInput) {
    this.multipleFileInput.nativeElement.value = '';
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
      itemId: '',
      brand: '',
      model: '',
      origin: '',
      additionalInformation: '',
      specialFeature: '',
      catalogURL: '',
      sl: '',
      companyID: environment.companyCode,
      imageFile: '',
      imageFiles: '',
      imageUrl: '',
      images: [],
      relatedProducts: [],
    });

    this.relatedProducts = [];
    this.selectedProduct.set(null);
    
    // Reset image states
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.selectedFiles.set([]);
    this.multiplePreviewUrls.set([]);
    
    this.isSubmitted.set(false);
    this.form().reset();
    
    // Clear file inputs
    this.clearFileInput();
    this.clearMultipleFileInput();
  }
}