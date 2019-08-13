import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'formatDate' })
export class FormatDatePipe implements PipeTransform {

    public transform(value: Date): string {
        const day = value.getDate() > 9 ? value.getDate() : '0' + value.getDate();
        const month = value.getMonth() > 9 ? value.getMonth() : '0' + value.getMonth();
        const year = value.getFullYear();

        const hours = value.getHours() > 9 ? value.getHours() : '0' + value.getHours();
        const minutes = value.getMinutes() > 9 ? value.getMinutes() : '0' + value.getMinutes();
        const seconds = value.getSeconds() > 9 ? value.getSeconds() : '0' + value.getSeconds();

        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }
}
