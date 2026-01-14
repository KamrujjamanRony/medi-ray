import { Component, ElementRef, inject, signal, computed, viewChild, viewChildren, OnInit } from '@angular/core';
import { Field, form, required, validate, debounce } from '@angular/forms/signals';
import { MenuS } from '../../../services/auth/menu-s';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPencil, faXmark, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { MultiSelect } from '../../shared/multi-select/multi-select';
import { MenuM } from '../../../utils/models';
import { PermissionS } from '../../../services/auth/permission-s';

// Define interface for multi-select options
interface PermissionOption {
  key: string;
  value: string;
}

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [FontAwesomeModule, Field, FormsModule, MultiSelect],
  templateUrl: './menu-list.component.html',
  styleUrl: './menu-list.component.css'
})
export class MenuListComponent implements OnInit {
  faPencil = faPencil;
  faXmark = faXmark;
  faMagnifyingGlass = faMagnifyingGlass;
  
  /* ---------------- DI ---------------- */
  private menuService = inject(MenuS);
  private permissionService = inject(PermissionS);

  /* ---------------- SIGNAL STATE ---------------- */
  menus = signal<MenuM[]>([]);
  searchQuery = signal('');
  permissionsKey: PermissionOption[] = []; // Change to PermissionOption array

  filteredMenuList = computed(() => {
    const query = this.searchQuery().toLowerCase();

    return this.menus()
      .filter(menu =>
        menu.menuName?.toLowerCase().includes(query) ||
        menu.url?.toLowerCase().includes(query) ||
        menu.icon?.toLowerCase().includes(query)
      )
      .reverse();
  });

  menuOptions = computed(() =>
    this.menus().map(menu => ({
      key: menu.id,
      value: menu.menuName
    }))
  );

  selectedMenu = signal<MenuM | null>(null);

  isLoading = signal(false);
  hasError = signal(false);

  isView = signal(false);
  isInsert = signal(false);
  isEdit = signal(false);
  isDelete = signal(false);

  // Define permission options as array of objects
  permissionOptions: PermissionOption[] = [ 
    { key: 'view', value: 'View' },
    { key: 'create', value: 'Create' },
    { key: 'edit', value: 'Edit' },
    { key: 'delete', value: 'Delete' },
  ];

  readonly inputRefs = viewChildren<ElementRef>('inputRef');
  readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  /* ---------------- FORM MODEL ---------------- */
  model = signal({
    menuName: '',
    parentMenuId: '',
    url: '',
    isActive: 'true',
    icon: '',
    permissionsKey: [] as string[], // Keep as string[] for form
    postBy: ''
  });

  /* ---------------- SIGNAL FORM ---------------- */
  form = form(this.model, (schemaPath) => {
    required(schemaPath.menuName, { message: 'Menu Name is required' });
    required(schemaPath.url, { message: 'Menu URL is required' });
    validate(schemaPath.url, ({ value }) => {
      if (!value().startsWith('/')) {
        return {
          kind: 'https',
          message: 'URL must start with / symbol'
        }
      }
      return null
    })

    debounce(schemaPath.menuName, 300);
    debounce(schemaPath.url, 300);
  });

  /* ---------------- LIFECYCLE ---------------- */
  ngOnInit(): void {
    this.loadMenus();
    this.loadPermissions();

    setTimeout(() => {
      this.inputRefs()?.[0]?.nativeElement.focus();
    }, 10);
  }

  /* ---------------- LOADERS ---------------- */
  loadPermissions() {
    this.isView.set(this.permissionService.hasPermission('Menu'));
    this.isInsert.set(this.permissionService.hasPermission('Menu', 'create'));
    this.isEdit.set(this.permissionService.hasPermission('Menu', 'edit'));
    this.isDelete.set(this.permissionService.hasPermission('Menu', 'delete'));
  }

  loadMenus() {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.menuService.getAllMenu().subscribe({
      next: data => {
        this.menus.set((data as MenuM[]) ?? []);
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
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  /* ---------------- FORM HELPERS ---------------- */
  getParentMenuName(menuId: any): string {
    return this.menuOptions().find(m => m.key === menuId)?.value ?? '';
  }

  // Convert PermissionOption[] to string[] (just keys)
  getPermissionKeys(permissions: PermissionOption[]): string[] {
    return permissions.map(p => p.key);
  }

  /* ---------------- SUBMIT ---------------- */
  onSubmit(event: Event) {
    event.preventDefault();
    
    if (this.form().valid()) {
      const formValue = this.form().value();

      const payload = {
        menuName: formValue.menuName,
        parentMenuId: formValue.parentMenuId ? Number(formValue.parentMenuId) : null,
        url: formValue.url,
        isActive: formValue.isActive === 'true',
        icon: formValue.icon,
        permissionsKey: this.getPermissionKeys(this.permissionsKey), // Convert to string[]
        postBy: formValue.postBy
      };

      const request$ = this.selectedMenu()
        ? this.menuService.updateMenu(this.selectedMenu()!.id, payload)
        : this.menuService.addMenu(payload);

      request$.subscribe({
        next: () => {
          this.loadMenus();
          this.formReset();
        },
        error: (error) => {
          console.error('Error submitting form:', error);
        }
      });
    } else {
      alert("Form is Invalid!");
    }
  }

  /* ---------------- UPDATE ---------------- */
  onUpdate(menu: MenuM) {
    this.selectedMenu.set(menu);
    
    // Convert string[] to PermissionOption[]
    if (menu.permissionsKey) {
      this.permissionsKey = this.permissionOptions.filter(option => 
        menu.permissionsKey!.includes(option.key)
      );
    } else {
      this.permissionsKey = [];
    }

    // Update the form model
    this.model.update(current => ({
      ...current,
      menuName: menu.menuName,
      parentMenuId: menu.parentMenuId ?? '',
      url: menu.url ?? '',
      isActive: menu.isActive ? 'true' : 'false',
      icon: menu.icon ?? '',
      permissionsKey: menu.permissionsKey ?? []
    }));

    // Reset validation states
    this.form().reset();
  }

  /* ---------------- DELETE ---------------- */
  onDelete(id: any) {
    if (!confirm('Are you sure you want to delete?')) return;

    this.menuService.deleteMenu(id).subscribe(() => {
      this.menus.update(list => list.filter(m => m.id !== id));
    });
  }

  /* ---------------- RESET ---------------- */
  formReset() {
    // Reset the model
    this.model.set({
      menuName: '',
      parentMenuId: '',
      url: '',
      isActive: 'true',
      icon: '',
      permissionsKey: [],
      postBy: '',
    });
    
    // Reset permissions
    this.permissionsKey = [];
    this.selectedMenu.set(null);
    this.form().reset();
  }
}