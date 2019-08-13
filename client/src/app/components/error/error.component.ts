import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-error',
    templateUrl: 'error.component.html',
    styles: ['./error.component.sass']
})
export class ErrorComponent {

    @Input() public errorMessage: string;

    constructor() { }
}
