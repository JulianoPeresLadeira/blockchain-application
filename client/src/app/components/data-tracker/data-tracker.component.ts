import { Component, Input } from '@angular/core';
import DataEntry from 'src/app/models/data-entry';

@Component({
    selector: 'app-data-tracker',
    templateUrl: './data-tracker.component.html',
    styles: ['./data-tracker.component.sass']
})
export class DataTrackerComponent {

    @Input() public data: Array<DataEntry>;

    constructor() { }

}
