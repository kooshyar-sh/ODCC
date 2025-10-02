import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'users_v1';

@Injectable({ providedIn: 'root' })
export class UserService {
  private subject = new BehaviorSubject<User[]>(this.loadInitial());

  constructor() {}

  // Observable برای اشتراک‌گذاری لیست کاربران
  getAll$(): Observable<User[]> {
    return this.subject.asObservable();
  }

  // خواندن فعلی
  getAll(): User[] {
    return this.subject.getValue();
  }

  create(user: Omit<User, 'id'>): User {
    const newUser: User = { ...user, id: uuidv4() };
    const next = [newUser, ...this.getAll()];
    this.save(next);
    return newUser;
  }

  update(id: string, partial: Partial<User>): User | null {
    const list = this.getAll();
    const idx = list.findIndex(u => u.id === id);
    if (idx === -1) return null;
    const updated = { ...list[idx], ...partial };
    list[idx] = updated;
    this.save(list);
    return updated;
  }

  delete(id: string): boolean {
    const list = this.getAll();
    const next = list.filter(u => u.id !== id);
    if (next.length === list.length) return false;
    this.save(next);
    return true;
  }

  // جستجو ساده (روی firstName, lastName, nationalId)
  search(query: string): User[] {
    if (!query) return this.getAll();
    const q = query.trim().toLowerCase();
    return this.getAll().filter(u =>
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.nationalId.toLowerCase().includes(q)
    );
  }

  // ذخیره در localStorage و اعلام به مشترکین
  private save(list: User[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    this.subject.next(list);
  }

  private loadInitial(): User[] {
    const json = localStorage.getItem(STORAGE_KEY);
    if (json) {
      try { return JSON.parse(json) as User[]; } catch { /* fallthrough */ }
    }
    // اگر داده‌ای نبود، مقدار دهی اولیه با 10 کاربر فیک
    const initial = this.makeFakeUsers();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  private makeFakeUsers(): User[] {
    // برای عکس از سرویس تصویر عمومی استفاده شده (آدرس)، اما می‌توانی بعداً base64 جایگزین کنی
    const names = [
      ['Ali','Mohammadi'],
      ['Sara','Azizi'],
      ['Reza','Karimi'],
      ['Narges','Hosseini'],
      ['Mahdi','Rahimi'],
      ['Fatemeh','Jafari'],
      ['Hassan','Gholami'],
      ['Mina','Sadeghi'],
      ['Omid','Taheri'],
      ['Lina','Shiri']
    ];
    const ed = ['BSc Computer Science','MSc Design','BA Management','PhD Physics','BSc Civil'];
    const births = ['1993-06-15','1996-02-20','1988-11-03','1990-08-30','1995-01-12','1994-09-09','1987-04-22','1999-12-05','1992-07-19','1997-03-27'];

    return names.map((n, i) => {
      const birth = births[i];
      const age = this.calculateAge(birth);
      // از سرویس pravatar برای عکس استفاده می‌کنیم (تصاویر تصادفی)
      const photo = `https://i.pravatar.cc/150?img=${i+10}`; 
      return {
        id: uuidv4(),
        photo: null,
        firstName: n[0],
        lastName: n[1],
        age,
        education: ed[i % ed.length],
        nationalId: String(1000000000 + i), // مثال کد ملی ساختگی
        birthDate: birth
      } as User;
    });
  }

  private calculateAge(birthIso: string): number {
    const b = new Date(birthIso);
    const now = new Date();
    let age = now.getFullYear() - b.getFullYear();
    const m = now.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
    return age;
  }
}
