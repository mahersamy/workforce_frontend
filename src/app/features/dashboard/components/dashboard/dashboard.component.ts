import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardFacadeService } from '../../services/dashboard-facade.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DachboardCard } from "./components/dachboard-card/dachboard-card";
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule, DachboardCard,ChartModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private readonly dashboardFacade = inject(DashboardFacadeService);

  
  stats = this.dashboardFacade.stats;
  isLoading = this.dashboardFacade.isLoading;

  taskChartOptions: any;

  // Compute total tasks dynamically
  totalTasks = computed(() => {
    const s = this.stats();
    if (!s) return 0;
    return s.tasksByStatus.reduce((acc, curr) => acc + curr.count, 0);
  });

  // Helper to get task count by status
  getTaskCount(statusName: string): number {
    const s = this.stats();
    if (!s) return 0;
    const item = s.tasksByStatus.find(t => t.status.toLowerCase() === statusName.toLowerCase());
    return item ? item.count : 0;
  }

  // Calculate percentages for bar heights or circle progress
  getTaskPercentage(statusName: string): number {
    const total = this.totalTasks();
    if (total === 0) return 0;
    return Math.round((this.getTaskCount(statusName) / total) * 100);
  }

  taskChartData = computed(() => ({
  labels: ['Completed', 'In Progress', 'Pending', 'Cancelled'],
  datasets: [
    {
      data: [
        this.getTaskCount('Completed'),
        this.getTaskCount('InProgress'),
        this.getTaskCount('Pending'),
        this.getTaskCount('Cancelled')
      ],
      backgroundColor: [
        '#22c55e',
        '#3b82f6',
        '#f59e0b',
        '#ef4444'
      ]
    }
  ]
}));


  ngOnInit(): void {
    this.dashboardFacade.loadStats();
  }
}
