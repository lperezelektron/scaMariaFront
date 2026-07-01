import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  private readonly months = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
  ];

  transform(value: string | Date | null | undefined): string {
    if (!value) return '-';

    try {
      const date = typeof value === 'string' ? new Date(value) : value;
      
      if (isNaN(date.getTime())) return '-';

      const day = date.getDate();
      const month = this.months[date.getMonth()];
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    } catch {
      return '-';
    }
  }
}
