//basic blockchain with basic integrity check

const SHA256 = require('crypto-js/sha256');

class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

class Block {
    //index-where the block sits on the chain
    //timestamp-when it is created
    constructor(timestamp, transactions, previousHash = '') {
        //this.index = index;

        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
        //to make changes to the block so as to recalculate the hash
    }

    calculateHash() {
        //identify the block on the block chain
        //SHA256 returns an object
        //nonce variable not taken into account
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        //to get a string of all zeroes
        while (this.hash.substring(0, difficulty) != Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined:" + this.hash);
    }
}

class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
        //an array of blocks
        //genesis block- added manually
    }

    createGenesisBlock() {
        return new Block("01/01/2022", "Genesis block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // addBlock(newBlock) {
    //     newBlock.previousHash = this.getLatestBlock().hash;
    //     //newBlock.hash = newBlock.calculateHash();
    //     newBlock.mineBlock(this.difficulty);
    //     this.chain.push(newBlock);
    // }

    minePendingTransactions(miningRewardAddress) {
        let block = new Block(Date.now(), this.pendingTransactions);
        //in reality, we choose the transactions we need
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);

        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    createTransaction(transaction) {
        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAddress(address) {
        //console.log(address);
        let balance = 0;
        //go through all the transactions related to your address 
        //to calculate the balance

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress == address) {
                    balance -= trans.amount;
                }
                if (trans.toAddress == address) {
                    balance += trans.amount;
                }
            }
        }
        console.log('%s',balance);
        return balance;
    }

    isChainValid() {
        //verifying the integrity
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash != currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash != previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

let savjeeCoin = new Blockchain();

//address- public key of someone's wallet
savjeeCoin.createTransaction(new Transaction('address1', 'address2', 100));
savjeeCoin.createTransaction(new Transaction('address1', 'address2', 50));

console.log('\nStarting the miner...');
savjeeCoin.minePendingTransactions('amisha-address');

//new reward reflected in the pending transactions, will be reflected once mined again
console.log('\nBalance of amisha is', savjeeCoin.getBalanceOfAddress('amisha-address'));

console.log('\nStarting the miner again...');
savjeeCoin.minePendingTransactions('amisha-address');

console.log('\nBalance of amisha is', savjeeCoin.getBalanceOfAddress('amisha-address'));

//console.log('Mining block 1...');
//savjeeCoin.addBlock(new Block(1, "04/05/2022", { amount: 4 }));

// console.log('Mining block 2...');
// savjeeCoin.addBlock(new Block(2, "06/05/2022", { amount: 7 }));

//prints without checking if valid
// console.log(JSON.stringify(savjeeCoin, null, 4));
//4 spaces for formatting

//console.log('Is blockchain valid?' + savjeeCoin.isChainValid());

//tampered here, wrong transactions stored
//savjeeCoin.chain[1].transactions = { amount: 100 };

//tried to rectify by recalculating hash but chain is broken
//savjeeCoin.chain[1].hash = savjeeCoin.chain[1].calculateHash();

//so still remains invalid
//console.log('Is blockchain valid?' + savjeeCoin.isChainValid());
