import fs = require('fs');
import path = require('path');
import express = require('express');
import cors = require('cors');

import { Request, Response, Application } from 'express';
import { Transaction, Blockchain } from '../blockchain-JS/blockchain';
import { ServerApiMethodInformation } from '../common/server-api-method-information';

import serverConfig from '../server-config.json';

const EC = require('elliptic').ec;

/**
 * This is the core of the Blockchain Service. It serves 
 * the information of the blockchain and processes the
 * pending cycles upon request.
 * 
 * API Methods: 
 *  GET: blockchain-information
 *  GET: process-new-cycles
 */
export default class BlockchainServer {

    private static routes: Array<ServerApiMethodInformation> = [
        { type: 'GET', route: '/blockchain-information', method: BlockchainServer.getBlockchainInformation },
        { type: 'GET', route: '/process-new-cycles', method: BlockchainServer.processNewCycles }
    ];

    private static myKey;
    private static myWalletAddress;

    private static otherKey;
    private static otherWalletAddress;

    private static port: number;
    private static server: Application;

    private static blockchain = new Blockchain();
    private static transactions: Map<string, boolean> = new Map<string, boolean>();

    public static start(port: number): void {
        BlockchainServer.port = port;
        BlockchainServer.server = express();

        BlockchainServer.server.use(cors());
        BlockchainServer.server.disable('etag');

        const ec = new EC('secp256k1');

        BlockchainServer.myKey = ec.keyFromPrivate(serverConfig.MyKey);
        BlockchainServer.myWalletAddress = BlockchainServer.myKey.getPublic('hex');

        BlockchainServer.otherKey = ec.keyFromPrivate(serverConfig.OtherKey);
        BlockchainServer.otherWalletAddress = BlockchainServer.otherKey.getPublic('hex');

        BlockchainServer.routes.forEach(
            serverApiMethodInformation => {
                const apiMethod = (serverApiMethodInformation.type == 'GET' ? BlockchainServer.server.get.bind(BlockchainServer.server) : BlockchainServer.server.post.bind(BlockchainServer.server));
                apiMethod(serverApiMethodInformation.route, serverApiMethodInformation.method)
            }
        );

        BlockchainServer.server.listen(BlockchainServer.port, () => console.log(`Blockchain Server started on port ${BlockchainServer.port}`));
        BlockchainServer.processCycles();
    }

    /**
     * Returns the information on the blockchain.
     * 
     * Route: http://localhost:8080/blockchain-information
     * Response: {
     *  myWalletAddress: string,
     *  myAmount: number,
     *  otherAmount: number,
     *  block: Block => The last block processed by the blockchain,
     *  chain: Array<Block> => Every transaction processed by the block
     * }
     */
    public static getBlockchainInformation(req: Request, res: Response): void {
        const block = BlockchainServer.blockchain.getLatestBlock();
        const myAmount = BlockchainServer.blockchain.getBalanceOfAddress(BlockchainServer.myWalletAddress);
        const otherAmount = BlockchainServer.blockchain.getBalanceOfAddress(BlockchainServer.otherWalletAddress);
        const chain = BlockchainServer.blockchain.chain;
        const myWalletAddress = BlockchainServer.myWalletAddress;

        res.status(200);
        res.send({
            myWalletAddress: myWalletAddress,
            myAmount: myAmount,
            otherAmount: otherAmount,
            block: block,
            chain: chain
        });
    }

    /**
     * Process the pending cycles on the /json folder.
     * 
     * Route: http://localhost:8080/process-new-cycles
     * Response: {success: true}
     */
    public static processNewCycles(req: Request, res: Response): void {
        BlockchainServer.processCycles();

        res.status(200);
        res.send({ success: true });
    }

    private static processCycle(cycle: string): void {
        const tx = new Transaction(BlockchainServer.myWalletAddress, BlockchainServer.otherWalletAddress, 10, cycle);
        tx.signTransaction(BlockchainServer.myKey);
        BlockchainServer.blockchain.addTransaction(tx);
        BlockchainServer.transactions.set(cycle, true);
    }

    private static processCycles(): void {
        const dirPath: string = path.join(__dirname, serverConfig.CycleJsonPath);
        fs.readdir(dirPath,
            (err, fileNames: Array<string>) => {

                if (err) {
                    console.log(`Error reading cycle Json files: ${err}`);
                    return;
                }

                const unprocessedCycles: Array<string> = fileNames
                    .map(fileName => require(path.join(__dirname, serverConfig.CycleJsonPath, fileName)))
                    .filter(cycleJson => cycleJson['cycle'] != null && !BlockchainServer.transactions.get(cycleJson['cycle']))
                    .map(cycleJson => cycleJson['cycle']);

                if (unprocessedCycles.length > 0) {
                    unprocessedCycles.forEach(BlockchainServer.processCycle);
                }

                BlockchainServer.blockchain.minePendingTransactions(BlockchainServer.myWalletAddress);
            }
        );
    }
}