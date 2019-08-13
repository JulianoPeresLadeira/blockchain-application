import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class InvoicingService {

    // constructor(private httpClient: HttpClient) { }

    public getInvoicePath(): string {
        const route = '/invoice';
        return this.buildAddress(route);
    }

    private buildAddress(path: string): string {
        return `${environment.invoicingServerAddress}${path}`;
    }

    // public invoice(): Observable<any> {
    //     return this.httpClient.get(this.buildAddress(route), { responseType: 'blob' });
    // }

}
