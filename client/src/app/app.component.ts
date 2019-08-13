import { Component, OnInit, AfterViewInit } from '@angular/core';
import { BlockchainService } from './services/blockchain.service';
import { interval } from 'rxjs';
import { switchMap } from 'rxjs/operators'
import DataEntry from './models/data-entry';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {

    title = 'client';

    public errorMessage: string = null;
    public initialized = false;
    public blockchainInformation: any;
    public dataEntries: Array<DataEntry>;

    constructor(private blockchainService: BlockchainService) { }

    public ngOnInit(): void {
        this.blockchainService.getBlockchainInformation().subscribe(
            blockchainInformation => {
                this.processResponse(blockchainInformation);
                this.initialized = true;
            },
            (error: HttpErrorResponse) => {
                this.errorMessage = `Error fetching data from the server: ${error.message}`;
                this.initialized = true;
            }
        );
    }

    public ngAfterViewInit(): void {
        interval(this.minutesToMilliseconds(0.5))
            .pipe(switchMap(() => {
                this.errorMessage = null;
                return this.blockchainService.getBlockchainInformation();
            }))
            .subscribe(
                (blockchainInformation => this.processResponse(blockchainInformation)),
                (error: HttpErrorResponse) => {
                    this.errorMessage = `Error fetching data from the server: ${error.message}`;
                }
            );
    }

    private minutesToMilliseconds(minutes: number): number {
        return minutes * 1000 * 60;
    }

    private processResponse(blockchainInformation): void {
        this.blockchainInformation = blockchainInformation;
        this.dataEntries = this.blockchainService.formatDataEntries(blockchainInformation);
    }
}
