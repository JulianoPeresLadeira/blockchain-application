import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'formatValue' })
export class FormatValuePipe implements PipeTransform {
    public transform(value: number): string {
        return `${value} tokens`;
    }
}
