import { Component, Input } from '@angular/core';
import { InvoicingService } from 'src/app/services/invoicing.service';

@Component({
    selector: 'app-billing-component',
    templateUrl: './billing-amount.component.html',
    styleUrls: ['./billing-amount.component.sass']
})
export class BillingAmountComponent {
    @Input() public value: number;

    constructor(public invoicingService: InvoicingService) { }

    // public downloadInvoice(): void {
    //     this.invoicingService.invoice().subscribe(
    //         fileData => {
    //             const blob = new Blob([fileData], { type: 'application/pdf' });
    //             const url = window.URL.createObjectURL(blob);
    //             window.open(url);
    //         }
    //     );
    // }
}
