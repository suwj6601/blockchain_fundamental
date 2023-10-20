const Blockchain = require("./blockchain");

const bitcoin = new Blockchain();

const previousBlockHash = "ADKAJKF";
const currentBlockData = [
  {
    amount: 10,
    sender: "ASNDASJKDN12",
    recipient: "ASKJDFN1",
  },
  {
    amount: 100,
    sender: "HEHHEH",
    recipient: "HEHEH1234",
  },
];

const hash = bitcoin.hashBlock(previousBlockHash, currentBlockData, 25808);
console.log(hash);
