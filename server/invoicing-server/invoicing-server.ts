import express = require('express');
import cors = require('cors');
import fs = require('fs');
import path = require('path');

import serverConfig from '../server-config.json';

import { Request, Response, Application } from 'express';
import { ServerApiMethodInformation } from "../common/server-api-method-information";

const axios = require('axios');
const Invoice = require("nodeice");

/**
 * Generates invoices with all the transactions
 * processed by the blockchain.
 * 
 * API Methods: 
 *  GET: invoice
 */
export default class InvoicingServer {

    private static routes: Array<ServerApiMethodInformation> = [
        { type: 'GET', route: '/invoice', method: InvoicingServer.invoice }
    ]

    private static port: number;
    private static server: Application;

    private static blockchainInformationRequestPath: string;
    private static invoiceCodeCounter: number = 0;

    public static start(port: number): void {
        InvoicingServer.port = port;
        InvoicingServer.blockchainInformationRequestPath = serverConfig.BlockchainInformationFetchingAddress;
        InvoicingServer.server = express();

        InvoicingServer.server.use(cors());

        InvoicingServer.routes.forEach(
            serverApiMethodInformation => {
                const apiMethod = (serverApiMethodInformation.type == 'GET' ? InvoicingServer.server.get.bind(InvoicingServer.server) : InvoicingServer.server.post.bind(InvoicingServer.server));
                apiMethod(serverApiMethodInformation.route, serverApiMethodInformation.method)
            }
        )
        InvoicingServer.server.listen(InvoicingServer.port, () => console.log(`Invoicing Server started on port ${InvoicingServer.port}`));
    }

    /**
     * Returns the invoice containing all the information
     * processed by the blockchain.
     * 
     * Route: http://localhost:8081/invoice
     * Response: PDF File
     */
    public static invoice(req: Request, res: Response): void {
        const formatDate = (date: Date) => {
            const day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
            const month = date.getMonth() > 9 ? date.getMonth() : '0' + date.getMonth();
            const year = date.getFullYear();

            return `${day}/${month}/${year}`;
        }
        const getDueDate = () => {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + 7);
            return dueDate;
        }
        axios.get(InvoicingServer.blockchainInformationRequestPath).then(
            response => {
                let invoice = new Invoice({
                    config: {
                        template: path.join(__dirname + serverConfig.AssetPath + "/template/index.html"),
                        tableRowBlock: path.join(__dirname + serverConfig.AssetPath + "/template/blocks/row.html")
                    },
                    data: {
                        currencyBalance: {
                            main: 1,
                            secondary: 3.67
                        },
                        invoice: {
                            number: {
                                id: InvoicingServer.invoiceCodeCounter++
                            },
                            date: formatDate(new Date()),
                            dueDate: formatDate(getDueDate()),
                            explanation: "Thank you for your business!",

                        },
                        tasks: InvoicingServer.formatChain(response.data)
                    },
                    seller: {
                        company: "Seller Company Inc.",
                        registrationNumber: "F05/XX/YYYY",
                        taxId: "00000000",
                        address: {
                            street: "Place Clemenceau",
                            number: "14",
                            zip: "75008",
                            city: "Paris",
                            region: "Élysée",
                            country: "France"
                        },
                        phone: "+40 726 xxx xxx",
                        email: "seller@company.com",
                        website: "seller.com"
                    },
                    buyer: {
                        company: "Buyer Company GmbH",
                        taxId: "00000000",
                        address: {
                            street: "Werner-Heisenberg-Allee",
                            number: "25",
                            zip: "80939",
                            city: "München",
                            region: "Bavaria",
                            country: "Germany"
                        },
                        phone: "+40 726 xxx xxx",
                        email: "buyer@company.com",
                        website: "buyer.com"
                    }
                });

                const now = new Date();
                const invoiceFileName = `/invoice-${now.getTime()}.pdf`;
                const pathToInvoice = path.join(__dirname, serverConfig.ResourcesPath, invoiceFileName);
                // // Render invoice as HTML and PDF
                invoice.toPdf(pathToInvoice,
                    (err, data) => {
                        res.status(200);
                        res.download(pathToInvoice);
                    });
            }
        )
    }

    private static formatChain(blockchainInformation: any): Array<any> {

        const transactionOriginatesFromTrackedWallet = (transaction) => transaction.fromAddress === blockchainInformation.myWalletAddress;
        const formatDate = (date: Date) => {
            const day = date.getDate() > 9 ? date.getDate() : '0' + date.getDate();
            const month = date.getMonth() > 9 ? date.getMonth() : '0' + date.getMonth();
            const year = date.getFullYear();

            const hours = date.getHours() > 9 ? date.getHours() : '0' + date.getHours();
            const minutes = date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes();
            const seconds = date.getSeconds() > 9 ? date.getSeconds() : '0' + date.getSeconds();

            return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        }
        const entries: Array<any> = [];

        if (blockchainInformation.chain && blockchainInformation.chain.length > 0) {
            blockchainInformation.chain.forEach(
                link => {
                    const transactions = link.transactions;
                    if (transactions && Array.isArray(transactions)) {
                        transactions
                            .filter(transactionOriginatesFromTrackedWallet)
                            .map(
                                transaction => ({
                                    payload: transaction.payload,
                                    date: formatDate(new Date(transaction.timestamp)),
                                    unit: "Tokens",
                                    quantity: transaction.amount,
                                    unitPrice: 5
                                }))
                            .forEach(entry => entries.push(entry));
                    }
                }
            );
        }

        return entries;
    }
}