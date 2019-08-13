import BlockchainServer from './blockchain-server/blockchain-server';
import InvoicingServer from './invoicing-server/invoicing-server';

/**
 * Starts both servers.
 */

const blockchainServerPort = 8080;
const invoicingServerPort = 8081;

BlockchainServer.start(blockchainServerPort);
InvoicingServer.start(invoicingServerPort);
