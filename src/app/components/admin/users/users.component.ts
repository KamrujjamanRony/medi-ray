import { Component, inject, signal, computed } from '@angular/core';
import { UserAccessTreeComponent } from '../../shared/user-access-tree/user-access-tree.component';
import { environment } from '../../../../environments/environment';
import { UserS } from '../../../services/auth/user-s';
import { MenuS } from '../../../services/auth/menu-s';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPencil, faXmark, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { Field, form, required, validate, debounce, minLength, maxLength } from '@angular/forms/signals';
import { PermissionS } from '../../../services/auth/permission-s';

/* --------------------------------------------
   Optional: Strong typing for menu permissions
--------------------------------------------- */
interface MenuPermission {
  menuId: number;
  PermissionKey: string[];
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    FontAwesomeModule,
    UserAccessTreeComponent,
    Field
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  faPencil = faPencil;
  faXmark = faXmark;
  faMagnifyingGlass = faMagnifyingGlass;
  /* ---------------- DI ---------------- */
  private userS = inject(UserS);
  private menuS = inject(MenuS);
  private permissionService = inject(PermissionS);

  /* ---------------- SIGNAL STATE ---------------- */

  users = signal<any[]>([]);
  searchQuery = signal('');
  userAccessTree = signal<MenuPermission[]>([]);
  selectedUser = signal<any | null>(null);

  isLoading = signal(false);
  hasError = signal(false);

  isView = signal(false);
  isInsert = signal(false);
  isEdit = signal(false);
  isDelete = signal(false);

  highlightedTr = signal<number>(-1);

  /* ---------------- COMPUTED ---------------- */

  filteredUserList = computed(() => {
    const query = this.searchQuery().toLowerCase() || '';
    return this.users()
      .filter(u => u.userName?.toLowerCase().includes(query))
    // .slice(1); // remove first element
  });

  /* ---------------- FORM MODEL ---------------- */
  model = signal({
    username: '',
    password: '',
    companyID: environment.companyCode,
    isActive: 'true',
    menuPermissions: [],
  });

  /* ---------------- SIGNAL FORM ---------------- */
  form = form(this.model, (schemaPath) => {
    required(schemaPath.username, { message: 'Username is required' });
    required(schemaPath.password, { message: 'Password is required' });
    minLength(schemaPath.password, 6, { message: 'Password must be at least 6 character' })
    maxLength(schemaPath.password, 18, { message: 'Password cannot exceed 18 character' })
    validate(schemaPath.password, ({ value }) => {
      const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
      if (!specialCharRegex.test(value())) {
        return {
          kind: 'complexity',
          message: 'Password must contain at least one special character'
        }
      }
      return null
    })
    debounce(schemaPath.username, 500);
    debounce(schemaPath.password, 500);
  });

  /* ---------------- LIFECYCLE ---------------- */

  ngOnInit(): void {
    this.loadPermissions();
    this.loadUsers();
    this.loadTreeData('');
  }

  /* ---------------- LOADERS ---------------- */

  loadPermissions() {
    this.isView.set(this.permissionService.hasPermission('User', 'view'));
    this.isInsert.set(this.permissionService.hasPermission('User', 'create'));
    this.isEdit.set(this.permissionService.hasPermission('User', 'edit'));
    this.isDelete.set(this.permissionService.hasPermission('User', 'delete'));
  }

  loadUsers() {
    this.isLoading.set(true);
    this.hasError.set(false);
    const query = {
      "companyID": environment.companyCode,
      "username": "",
      "postBy": ""
    }


    this.userS.getUser(query).subscribe({
      next: data => {
        this.users.set(data ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  loadTreeData(userId: any) {
    this.menuS
      .generateTreeData(userId)
      .subscribe(tree => {
        this.userAccessTree.set(tree)
      });
  }

  /* ---------------- SEARCH ---------------- */

  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  /* ---------------- SUBMIT ---------------- */
  onSubmit(event: Event) {
    event.preventDefault();
    if (this.form().valid() && this.userAccessTree().length > 0) {

      // Create the payload with proper types
      const formValue = this.form().value();

      const payload = {
        username: formValue.username,
        password: formValue.password,
        companyID: formValue.companyID,
        isActive: formValue.isActive === 'true', // Convert string to boolean
        menuPermissions: this.userAccessTree(),
      };

      const request$ = this.selectedUser()
        ? this.userS.updateUser(this.selectedUser()!.id, payload)
        : this.userS.addUser(payload);

      request$.subscribe({
        next: () => {
          this.loadUsers();
          this.formReset();
        },
        error: () => {}
      });
    } else {
      alert("Form is Invalid!")
    }
  }

  /* ---------------- UPDATE ---------------- */
  onUpdate(user: any) {
    this.selectedUser.set({...user, username: user.userName});
    this.loadTreeData(user.id);

    // Update the form model
    this.model.update(current => ({
      ...current,
      username: user.userName,
      password: user.password ?? '',
      companyID: user.companyID ?? environment.companyCode,
      isActive: user.isActive ? 'true' : 'false',
      menuPermissions: user.menuPermissions ?? []
    }));

    // Reset validation states
    this.form().reset();
  }

  /* ---------------- DELETE ---------------- */

  onDelete(id: any) {
    if (!confirm('Are you sure you want to delete?')) return;

    this.userS.deleteUser(id).subscribe(() => {
      this.users.update(list => list.filter(u => u.id !== id));
    });
  }

  /* ---------------- RESET ---------------- */
  formReset() {
    // Reset the model
    this.model.set({
      username: '',
      password: '',
      companyID: environment.companyCode,
      isActive: 'true',
      menuPermissions: [],
    });
    this.loadTreeData('');
    this.selectedUser.set(null);
    this.form().reset();
  }
}
