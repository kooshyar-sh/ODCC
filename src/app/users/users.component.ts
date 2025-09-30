import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxDataGridModule,
  DxPopupModule,
  DxFormModule,
  DxFileUploaderModule,
  DxButtonModule,
  DxTextBoxModule,
  DxDateBoxModule,
  DxNumberBoxModule,
  DxSelectBoxModule,
} from 'devextreme-angular';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DxDataGridModule,
    DxPopupModule,
    DxFormModule,
    DxFileUploaderModule,
    DxButtonModule,
    DxTextBoxModule,
    DxDateBoxModule,
    DxNumberBoxModule,
    DxSelectBoxModule,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filtered: User[] = [];
  sub: Subscription | undefined;

  // برای popup و فرم
  popupVisible = false;
  isEditMode = false;
  formData: Partial<User> = {};

  // جستجو
  searchQuery = '';

  // گزینه‌های تحصیلات (نمونه)
  educationOptions = [
    'BSc Computer Science',
    'MSc Design',
    'BA Management',
    'PhD Physics',
    'BSc Civil',
  ];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.sub = this.userService.getAll$().subscribe((list) => {
      this.users = list;
      this.applyFilter();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  applyFilter() {
    const q = (this.searchQuery || '').trim();
    this.filtered = q ? this.userService.search(q) : [...this.users];
  }

  onSearchChange() {
    this.applyFilter();
  }

  openAdd() {
    this.isEditMode = false;
    this.formData = {
      photo: null,
      firstName: '',
      lastName: '',
      age: 18,
      education: '',
      nationalId: '',
      birthDate: new Date().toISOString().slice(0, 10),
    };
    this.popupVisible = true;
  }

  //   openEdit(user: User) {
  //     this.isEditMode = true;
  //     this.formData = { ...user };
  //     this.popupVisible = true;
  //   }

  //   onDelete(id: string) {
  //     if (!confirm('آیا از حذف کاربر مطمئنی؟')) return;
  //     this.userService.delete(id);
  //   }

  // فایل آپلود شده -> خواندن به base64 یا استفاده از آدرس temp (در اینجا خواندن base64)
  onFileChanged(e: any) {
    const files: File[] = e?.value;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.formData.photo = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  submitButtonOptions = {
    text: 'ذخیره',
    type: 'success',
    useSubmitBehavior: false, // نیازی به submit HTML نیست، DevExtreme خودش onClick رو مدیریت می‌کنه
    onClick: () => this.saveForm(),
  };

  handleSubmit = function (e: any) {
    setTimeout(() => {
      alert('Submitted');
    }, 1000);

    e.preventDefault();
  };

  saveForm() {
    // اعتبارسنجی ساده در سمت TS (همه فیلدها باید مقدار داشته باشند)
    const required = ['firstName', 'lastName', 'age', 'education', 'nationalId', 'birthDate'];
    for (const k of required) {
      const val = (this.formData as any)[k];
      if (val === undefined || val === null || String(val).trim() === '') {
        alert('لطفاً تمام فیلدهای اجباری را تکمیل کنید.');
        return;
      }
    }

    if (this.isEditMode && this.formData.id) {
      this.userService.update(this.formData.id, this.formData as Partial<User>);
    } else {
      // create نیاز به نوع کامل
      const payload: Omit<User, 'id'> = {
        photo: this.formData.photo || null,
        firstName: this.formData.firstName!.trim(),
        lastName: this.formData.lastName!.trim(),
        age: Number(this.formData.age),
        education: this.formData.education!.trim(),
        nationalId: this.formData.nationalId!.trim(),
        birthDate: this.formData.birthDate!,
      };
      this.userService.create(payload);
    }

    this.popupVisible = false;
  }

  // نمایش پیش‌نمایش عکس در grid و popup
  getPhotoThumbnail(user: User | Partial<User>) {
    if (!user.photo || user.photo === 'null') {
      return 'assets/avatar-placeholder.png';
    }
    return user.photo;
  }
}
