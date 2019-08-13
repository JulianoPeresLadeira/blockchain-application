import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import DataEntry from '../models/data-entry';

@Injectable({
    providedIn: 'root'
})
export class BlockchainService {

    constructor(private httpClient: HttpClient) { }

    public getBlockchainInformation(): Observable<any> {
        const route = '/blockchain-information';
        return this.httpClient.get(this.buildAddress(route));
    }

    public formatDataEntries(blockchainInformation: any): Array<DataEntry> {
        const transactionOriginatesFromTrackedWallet = (transaction) => transaction.fromAddress === blockchainInformation.myWalletAddress;
        const entries: Array<DataEntry> = [];

        if (blockchainInformation.chain && blockchainInformation.chain.length > 0) {
            blockchainInformation.chain.forEach(
                link => {
                    const transactions = link.transactions;
                    if (transactions && Array.isArray(transactions)) {
                        transactions
                            .filter(transactionOriginatesFromTrackedWallet)
                            .map(
                                transaction => ({
                                    date: new Date(transaction.timestamp),
                                    amount: transaction.amount,
                                    payload: transaction.payload
                                }))
                            .forEach(entry => entries.push(entry));
                    }
                }
            );
        }

        return entries;
    }

    private buildAddress(path: string): string {
        return `${environment.blockchainServerAddress}${path}`;
    }
}
