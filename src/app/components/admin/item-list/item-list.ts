import { Component, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemM } from '../../../utils/models';
import { environment } from '../../../../environments/environment';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPencil, faXmark, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Field, form, required, validate, debounce } from '@angular/forms/signals';
import { ItemS } from '../../../services/item-s';
import { PermissionS } from '../../../services/auth/permission-s';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-item-list',
  imports: [CommonModule, FontAwesomeModule, Field, FormsModule],
  templateUrl: './item-list.html',
  styleUrl: './item-list.css',
})
export class ItemList {
  faPencil = faPencil;
  faXmark = faXmark;
  faMagnifyingGlass = faMagnifyingGlass;
  
  /* ---------------- DI ---------------- */
  private itemService = inject(ItemS);
  private permissionService = inject(PermissionS);
  
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  /* ---------------- SIGNAL STATE ---------------- */
  items = signal<ItemM[]>([]);
  searchQuery = signal('');

  filteredItemList = computed(() => {
    const query = this.searchQuery().toLowerCase();

    return this.items()
      .filter(item =>
        String(item.id ?? '').toLowerCase().includes(query) ||
        String(item.slItem ?? '').toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      )
      .sort((a, b) => (a.slItem! - b.slItem!));
  });

  selectedItem = signal<ItemM | null>(null);

  isLoading = signal(false);
  hasError = signal(false);

  isView = signal(false);
  isInsert = signal(false);
  isEdit = signal(false);
  isDelete = signal(false);

  isSubmitted = signal(false);

  /* ---------------- FORM MODEL ---------------- */
  model = signal({
    description: '',
    slItem: '',
    companyID: environment.companyCode.toString(),
  });

  /* ---------------- SIGNAL FORM ---------------- */
  form = form(this.model, (schemaPath) => {
    required(schemaPath.description, { message: 'Description is required' });
    validate(schemaPath.slItem, ({ value }) => {
      if (value() && !/^\d+$/.test(value())) {
        return {
          kind: 'complexity',
          message: 'SL Item must be a valid number'
        }
      }
      return null;
    })

    debounce(schemaPath.description, 300);
  });

  /* ---------------- LIFECYCLE ---------------- */
  ngOnInit(): void {
    this.loadItems();
    this.loadPermissions();
  }

  /* ---------------- LOADERS ---------------- */
  loadPermissions() {
    this.isView.set(this.permissionService.hasPermission('Item', 'view'));
    this.isInsert.set(this.permissionService.hasPermission('Item', 'create'));
    this.isEdit.set(this.permissionService.hasPermission('Item', 'edit'));
    this.isDelete.set(this.permissionService.hasPermission('Item', 'delete'));
  }

  loadItems() {
    this.isLoading.set(true);
    this.hasError.set(false);
    
    const params = { 
      companyID: environment.companyCode 
    };

    this.itemService.getAllItems(params).subscribe({
      next: (data) => {
        this.items.set(data);
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
      companyID: Number(formValue.companyID),
      description: formValue.description,
      slItem: formValue.slItem ? Number(formValue.slItem) : null,
    };

    console.log('Payload to send:', payload);
    
    const request$ = this.selectedItem()
      ? this.itemService.updateItem(this.selectedItem()!.id!, payload)
      : this.itemService.addItem(payload);

    request$.subscribe({
      next: () => {
        this.loadItems();
        console.log("clicked");
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
  onUpdate(item: ItemM) {
    this.selectedItem.set(item);

    // Update form model
    this.model.update(current => ({
      ...current,
      description: item.description ?? '',
      slItem: item.slItem?.toString() ?? '',
      companyID: item.companyID.toString(),
    }));

    this.form().reset();
  }

  /* ---------------- DELETE ---------------- */
  onDelete(id: number) {
    if (!confirm('Are you sure you want to delete this item?')) return;

    this.itemService.deleteItem(id).subscribe({
      next: () => {
        this.items.update(list => list.filter(i => i.id !== id));
      },
      error: (error) => {
        console.error('Error deleting item:', error);
      }
    });
  }

  /* ---------------- RESET ---------------- */
  formReset() {
    this.model.set({
      description: '',
      slItem: '',
      companyID: environment.companyCode.toString(),
    });

    this.selectedItem.set(null);
    this.isSubmitted.set(false);
    this.form().reset();
  }

}
