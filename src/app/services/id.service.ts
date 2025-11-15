import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IdService {
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
}
