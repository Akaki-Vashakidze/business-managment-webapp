import { Component } from '@angular/core';
import { LoadingService } from '../../features/auth/services/loading.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  imports:[CommonModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  loading$: any;
  constructor(private loadingService: LoadingService) {
    this.loading$ = this.loadingService.loading$;
  }

}