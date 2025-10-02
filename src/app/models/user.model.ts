export interface User {
  id: string;
  photo?: File | null;
  firstName: string;
  lastName: string;
  age: number;
  education: string;
  nationalId: string;
  birthDate: string;
}
