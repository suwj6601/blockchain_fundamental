const express = require("express");

const { v4: uuidv4 } = require("uuid");

const Blockchain = require("../building-a-blockchain/blockchain");
const bitcoin = new Blockchain();

const nodeAddress = uuidv4().split("-").join("");

const app = express();
app.use(express.json());

app.get("/blockchain", (req, res) => {
  res.send(bitcoin);
});

app.post("/transaction", (req, res) => {
  const { amount, sender, recipient } = req.body;
  const blockIndex = bitcoin.createNewTransaction(amount, sender, recipient);

  res.json({ note: `Transaction will be added in block ${blockIndex}` });
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

  bitcoin.createNewTransaction(12.5, "00", nodeAddress);

  res.json({
    note: "New block mine successfully",
    block: newBlock,
  });
});

app.listen(3000, () => {
  console.log("Listening on port 3000...");
});
