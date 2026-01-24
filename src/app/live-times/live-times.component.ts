import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { ItemManagementService } from '../features/auth/services/itemManagement.service';

@Component({
  selector: 'app-live-times',
  imports: [CommonModule],
  templateUrl: './live-times.component.html',
  styleUrl: './live-times.component.scss'
})
export class LiveTimesComponent implements OnChanges {
  @Input() itemsIds!: string[];
  constructor(private itemManagementService:ItemManagementService){}
  ngOnChanges(): void {
    if (this.itemsIds && this.itemsIds.length) {
      console.log(this.itemsIds)
      this.itemManagementService.getAllItemsReservationsForToday(this.itemsIds).subscribe(res => {
        console.log(res)
      })
    }
  }
}
