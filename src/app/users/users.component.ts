import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DxDataGridModule,
  DxPopupModule,
  DxFileUploaderModule,
  DxButtonModule,
  DxTextBoxModule,
  DxDateBoxModule,
  DxNumberBoxModule,
  DxSelectBoxModule,
  DxValidationGroupModule,
  DxValidationSummaryModule,
  DxValidatorModule,
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
    DxFileUploaderModule,
    DxButtonModule,
    DxTextBoxModule,
    DxDateBoxModule,
    DxNumberBoxModule,
    DxSelectBoxModule,
    DxValidationGroupModule,
    DxValidationSummaryModule,
    DxValidatorModule
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filtered: User[] = [];
  sub: Subscription | undefined;

  popupVisible = false;
  isEditMode = false;

  formData: User = {
    id: '',
    photo: null,
    firstName: '',
    lastName: '',
    age: 18,
    education: '',
    nationalId: '',
    birthDate: new Date().toISOString().slice(0, 10),
  };

  fileUploaderFiles: File[] = [];
  previewPhoto: string | null = null;

  searchQuery = '';
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
      id: '',
      photo: null,
      firstName: '',
      lastName: '',
      age: 18,
      education: '',
      nationalId: '',
      birthDate: new Date().toISOString().slice(0, 10),
    };
    this.previewPhoto = null;
    this.popupVisible = true;
  }

  onFileChanged(e: any) {
    const files: File[] = e.value;
    if (!files || files.length === 0) {
      this.formData.photo = null;
      this.previewPhoto = null;
      this.fileUploaderFiles = [];
      return;
    }

    const file = files[0];

    // فقط عکس
    if (!file.type.startsWith('image/')) {
      alert('لطفاً فقط فایل تصویر انتخاب کنید');
      e.component.reset();
      return;
    }

    this.formData.photo = file;
    this.fileUploaderFiles = [file];

    const reader = new FileReader();
    reader.onload = () => {
      this.previewPhoto = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  validateAndSave(group: any) {
    const result = group.instance.validate();
    if (!result.isValid) return;
    this.saveForm();
  }

  saveForm() {
    const requiredFields: (keyof User)[] = [
      'firstName',
      'lastName',
      'age',
      'education',
      'nationalId',
      'birthDate',
    ];

    for (const field of requiredFields) {
      const val = this.formData[field];
      if (val === undefined || val === null || String(val).trim() === '') {
        alert('لطفاً تمام فیلدهای اجباری را تکمیل کنید.');
        return;
      }
    }

    if (this.isEditMode && this.formData.id) {
      this.userService.update(this.formData.id, this.formData);
    } else {
      this.userService.create(this.formData);
    }

    this.popupVisible = false;
  }

  getPhotoThumbnail(user: User) {
    if (!user.photo) return 'assets/avatar-placeholder.png';
    if (user.photo instanceof File) {
      return URL.createObjectURL(user.photo);
    }
    return 'assets/avatar-placeholder.png';
  }
}
