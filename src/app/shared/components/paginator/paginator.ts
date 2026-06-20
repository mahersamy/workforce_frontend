import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { PageChangeEvent, PaginatorConfig } from './models/pagination.model';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './paginator.html',
  styleUrls: ['./paginator.scss']
})
export class AppPaginator {
  config = input.required<PaginatorConfig>();
  pageChange = output<PageChangeEvent>()

  readonly limitOptions = [5,10, 25, 50, 100];
  pages: (number | '...')[] = [];




  get total(): number {
    return this.config().totalCount;
  }

  get currentPage(): number {
    return this.config().pageNumber;
  }

  get limit(): number {
    return this.config().pageSize;
  }

  get totalPages(): number {
    return this.config().totalPages;
  }

  ngOnChanges() {
    this.buildPages();
  }

  // ─── Build page number array with ellipsis ────────────────────────────────
  buildPages() {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: (number | '...')[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }

    this.pages = pages;
  }

  // ─── Getters for display ──────────────────────────────────────────────────
  get fromEntry(): number {
    return (this.currentPage - 1) * this.limit + 1;
  }

  get toEntry(): number {
    return Math.min(this.currentPage * this.limit, this.total);
  }

  // ─── Actions ──────────────────────────────────────────────────────────────
  goToPage(page: number | '...') {
    if (page === '...' || page === this.currentPage) return;
    this.pageChange.emit({ page: page as number, limit: this.limit });
  }

  prev() {
    if (this.currentPage > 1) {
      this.pageChange.emit({ page: this.currentPage - 1, limit: this.limit });
    }
  }

  next() {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit({ page: this.currentPage + 1, limit: this.limit });
    }
  }

  onLimitChange(event: Event) {
    const value = Number(
      (event.target as HTMLSelectElement).value
    );

    this.pageChange.emit({
      page: 1,
      limit: value
    });
  }

  isEllipsis(page: number | '...'): boolean {
    return page === '...';
  }
}
