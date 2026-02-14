import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AnalyticsService } from '../../auth/services/analytics.service';

@Component({
  selector: 'app-analytics',
  imports: [CommonModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent {
  analytics: any;

  constructor(public analyticsService: AnalyticsService) {
    this.analyticsService.getAnalyticsStats().subscribe(data => {
      this.analytics = data;
    });
  }

  // Helper to get device count safely
  getDeviceCount(type: string): number {
    return this.analytics?.devices.find((d: any) => d._id === type)?.count || 0;
  }

  // Helper for progress bar width
  getPercentage(type: string): number {
    if (!this.analytics) return 0;
    const count = this.getDeviceCount(type);
    return (count / this.analytics.totalUniqueUsers) * 100;
  }
}
