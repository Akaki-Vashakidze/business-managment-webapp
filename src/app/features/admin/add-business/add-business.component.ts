import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { BusinessService } from '../../auth/services/business.service';
import { SnackbarService } from '../../auth/services/snack-bar.service';

@Component({
  selector: 'app-add-business',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    CommonModule
  ],
  templateUrl: './add-business.component.html',
  styleUrl: './add-business.component.scss'
})
export class AddBusinessComponent {
  constructor(private businessService:BusinessService, private snackbarService:SnackbarService){}
  businessForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    })
  });

  submit() {
    if (this.businessForm.invalid) return;

    const business = this.businessForm.value;
    console.log('business to add:', business);
    this.businessService.createBusiness(business.name || '').subscribe({
      next: (response) => {
        this.snackbarService.success('Business created successfully');
        this.businessService.onBusinessesUpdated();
        this.businessForm.reset();
      },
      error: (error) => {
        console.error('Error creating business:', error);
      }
    });
  }
}

