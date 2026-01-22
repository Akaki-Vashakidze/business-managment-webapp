import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-branches',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    CommonModule
  ],
  templateUrl: './add-branches.component.html',
  styleUrl: './add-branches.component.scss'
})
export class AddBranchesComponent {

  branchForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)]
    })
  });

  submit() {
    if (this.branchForm.invalid) return;

    const branch = this.branchForm.value;
    console.log('Branch to add:', branch);

    // 🔗 later: call API here
    // this.branchService.create(branch).subscribe(...)
    
    this.branchForm.reset();
  }
}
