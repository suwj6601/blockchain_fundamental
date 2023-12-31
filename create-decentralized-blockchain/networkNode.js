const express = require("express");
const { v4: uuidv4 } = require("uuid");
const rp = require("request-promise");

const Blockchain = require("../building-a-blockchain/blockchain");
const bitcoin = new Blockchain();

const nodeAddress = uuidv4().split("-").join("");
const port = process.argv[2];

const app = express();
app.use(express.json());
app.use(express.static(__dirname + "/public"));

app.get("/blockchain", (req, res) => {
  res.send(bitcoin);
});

app.post("/transaction", (req, res) => {
  const newTransaction = req.body;

  const blockIndex =
    bitcoin.addTransactionToPendingTransactions(newTransaction);
  res.json({ note: `Transaction will be added in block${blockIndex}` });
});

app.post("/transaction/broadcast", (req, res) => {
  const { amount, sender, recipient } = req.body;

  const newTransaction = bitcoin.createNewTransaction(
    amount,
    sender,
    recipient
  );

  bitcoin.addTransactionToPendingTransactions(newTransaction);
  const networkNodes = bitcoin.networkNodes;

  const requestPromise = [];
  networkNodes.forEach((networkUrl) => {
    const requestOption = {
      url: networkUrl + "/transaction",
      method: "POST",
      body: newTransaction,
      json: true,
    };

    requestPromise.push(rp(requestOption));
  });

  Promise.all(requestPromise).then((data) => {
    res.send({ note: "Transaction created and broadcast successfully." });
  });
});

app.get("/mine", (req, res) => {
  const lastBlock = bitcoin.getLastBlock();
  const previousBlockHash = lastBlock["hash"];

  const currentBlockData = {
    transactions: bitcoin.pendingTransactions,
    index: lastBlock["index"] + 1,
  };
  const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = bitcoin.hashBlock(
    previousBlockHash,
    currentBlockData,
    nonce
  );
  const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);

  const requestPromises = [];
  bitcoin.networkNodes.forEach((networkUrl) => {
    const requestOption = {
      uri: networkUrl + "/receive-new-block",
      body: { newBlock },
      json: true,
      method: "POST",
    };

    requestPromises.push(rp(requestOption));
  });

  Promise.all(requestPromises)
    .then((data) => {
      const requestOptions = {
        uri: bitcoin.currentNodeUrl + "/transaction/broadcast",
        method: "POST",
        body: {
          amount: 12.5,
          sender: "00",
          recipient: nodeAddress,
        },
        json: true,
      };

      return rp(requestOptions);
    })
    .then((data) => {
      res.json({
        note: "New block mine & broadcast successfully",
        block: newBlock,
      });
    });
});

app.post("/receive-new-block", (req, res) => {
  const { newBlock } = req.body;

  const lastBlock = bitcoin.getLastBlock();
  const correctHash = lastBlock.hash === newBlock.previousBlockHash;
  const correctIndex = lastBlock["index"] + 1 === newBlock["index"];

  if (correctHash && correctIndex) {
    bitcoin.chain.push(newBlock);
    bitcoin.pendingTransactions = [];

    res.json({ note: "New block receive and accepted.", newBlock });
  } else {
    res.json({
      note: "New block rejected.",
      newBlock,
    });
  }
});

// register a node and broadcast it to the network
app.post("/register-and-broadcast-node", (req, res) => {
  const { newNodeUrl } = req.body;
  if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1) {
    bitcoin.networkNodes.push(newNodeUrl);
  }

  const regNodesPromises = [];

  bitcoin.networkNodes.forEach((networkNodeUrl) => {
    // "/register-node"

    const requestOptions = {
      uri: networkNodeUrl + "/register-node",
      method: "POST",
      body: { newNodeUrl },
      json: true,
    };

    regNodesPromises.push(rp(requestOptions));
  });

  Promise.all(regNodesPromises)
    .then((data) => {
      const bulkRegisterOptions = {
        uri: newNodeUrl + "/register-nodes-bulk",
        method: "POST",
        body: {
          allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl],
        },
        json: true,
      };

      return rp(bulkRegisterOptions);
    })
    .then((data) => {
      res.json({ note: "New node registered with network successfully." });
    });
});

// register a node with the network
app.post("/register-node", (req, res) => {
  const { newNodeUrl } = req.body;

  const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
  const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;

  if (nodeNotAlreadyPresent && notCurrentNode) {
    bitcoin.networkNodes.push(newNodeUrl);
  }
  res.json({ note: "New node registered successfully." });
});

// register multiple nodes at once
app.post("/register-nodes-bulk", (req, res) => {
  const { allNetworkNodes } = req.body;

  allNetworkNodes.forEach((networkNodeUrl) => {
    const nodeNotAlreadyPresent =
      bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
    const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;

    if (nodeNotAlreadyPresent && notCurrentNode) {
      bitcoin.networkNodes.push(networkNodeUrl);
    }
  });

  res.json({ note: "Bulk registration successful." });
});

app.get("/consensus", (req, res) => {
  const requestPromises = [];
  bitcoin.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      uri: networkNodeUrl + "/blockchain",
      method: "GET",
      json: true,
    };

    requestPromises.push(rp(requestOptions));
  });

  Promise.all(requestPromises).then((blockchains) => {
    const currentChainLength = bitcoin.chain.length;
    let maxChainLength = currentChainLength;
    let newLongestChain = null;
    let newPendingTransactions = null;

    blockchains.forEach((blockchain) => {
      if (blockchain.chain.length > maxChainLength) {
        maxChainLength = blockchain.chain.length;
        newLongestChain = blockchain.chain;
        newPendingTransactions = blockchain.pendingTransactions;
      }
    });

    if (
      !newLongestChain ||
      (newLongestChain && !bitcoin.chainIsValid(newLongestChain))
    ) {
      res.json({
        note: "Current chain has not been replaced",
        chain: bitcoin.chain,
      });
    } else {
      bitcoin.chain = newLongestChain;
      bitcoin.pendingTransactions = newPendingTransactions;

      res.json({
        note: "This chain has been replaced",
        chain: bitcoin.chain,
      });
    }
  });
});

app.get("/block/:blockHash", (req, res) => {
  const blockHash = req.params.blockHash;

  const correctBlock = bitcoin.getBlock(blockHash);
  res.json({
    block: correctBlock,
  });
});

app.get("/transaction/:transactionId", (req, res) => {
  const { transaction, correctBlock } = bitcoin.getTransaction(
    req.params.transactionId
  );

  res.json({
    transaction,
    block: correctBlock,
  });
});
app.get("/address/:address", (req, res) => {
  const address = req.params.address;

  const addressData = bitcoin.getAddressData(address);
  res.json({
    addressData,
  });
});

app.get("/block-explorer", (req, res) => {
  res.sendFile("./block-explorer/index.html", { root: __dirname });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
