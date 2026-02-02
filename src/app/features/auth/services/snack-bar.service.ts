import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {

  constructor(private snackBar: MatSnackBar) {}

  open(message: string, action: string = 'OK', duration: number = 3000) {
    this.snackBar.open(message, action, {
      duration,
      horizontalPosition: 'right',
      verticalPosition: 'bottom',
      panelClass: ['custom-snackbar']
    });
  }

  success(message: string) {
    this.open(message, 'OK', 8000);
  }

  error(message: string) {
    this.open(message, 'Close', 8000);
  }
}
