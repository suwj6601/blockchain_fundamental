const Blockchain = require("./blockchain");

const bitcoin = new Blockchain();

const bc1 = {
  chain: [
    {
      index: 1,
      timestamp: 1698833470536,
      transactions: [],
      nonce: 100,
      hash: "0",
      previousBlockHash: "0",
    },
    {
      index: 2,
      timestamp: 1698833528316,
      transactions: [],
      nonce: 18140,
      hash: "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
      previousBlockHash: "0",
    },
    {
      index: 3,
      timestamp: 1698833699595,
      transactions: [
        {
          amount: 12.5,
          sender: "00",
          recipient: "336e075d8e354128a1d65e0e79466e24",
          transactionId: "afa0c11f2a8c4fa6b4813a23558608a3",
        },
        {
          amount: 10,
          sender: "taone",
          recipient: "mayne",
          transactionId: "bdfdc86c22764e08a8485ed9e76aef47",
        },
        {
          amount: 20,
          sender: "taone",
          recipient: "mayne",
          transactionId: "269db6157b9d4939b8ff644f4a8db93c",
        },
      ],
      nonce: 228763,
      hash: "0000532c0d84e86f49c893c124e6be5178012de9f1778fc32c06e2c1a1782f5d",
      previousBlockHash:
        "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
    },
    {
      index: 4,
      timestamp: 1698833852729,
      transactions: [
        {
          amount: 12.5,
          sender: "00",
          recipient: "336e075d8e354128a1d65e0e79466e24",
          transactionId: "fcfe29eec98348ec8d7eb254dd3e466b",
        },
      ],
      nonce: 105922,
      hash: "0000c3a7e7502c88abd897f02e57c7adf59dd4839aeef302b102f065bfd117d8",
      previousBlockHash:
        "0000532c0d84e86f49c893c124e6be5178012de9f1778fc32c06e2c1a1782f5d",
    },
    {
      index: 5,
      timestamp: 1698833855731,
      transactions: [
        {
          amount: 12.5,
          sender: "00",
          recipient: "336e075d8e354128a1d65e0e79466e24",
          transactionId: "ae8541b021cf43209a48493bd5b3a449",
        },
      ],
      nonce: 202871,
      hash: "000059958d5ba5076370636f2670640182b0e1ac543bf2d19f26fa788dd304e5",
      previousBlockHash:
        "0000c3a7e7502c88abd897f02e57c7adf59dd4839aeef302b102f065bfd117d8",
    },
    {
      index: 6,
      timestamp: 1698833857069,
      transactions: [
        {
          amount: 12.5,
          sender: "00",
          recipient: "336e075d8e354128a1d65e0e79466e24",
          transactionId: "8d5dad7e65c94a2eb5ac5a1966978ac8",
        },
      ],
      nonce: 51911,
      hash: "00004a0ba500ecc4087d559adcb88c1e57d766b6fbb5181c44ff221387b7c7c7",
      previousBlockHash:
        "000059958d5ba5076370636f2670640182b0e1ac543bf2d19f26fa788dd304e5",
    },
  ],
  pendingTransactions: [
    {
      amount: 12.5,
      sender: "00",
      recipient: "336e075d8e354128a1d65e0e79466e24",
      transactionId: "f78184e175e14ad8b6553326c06dec28",
    },
  ],
  currentNodeUrl: "http://localhost:3001",
  networkNodes: [],
};

const isValid = bitcoin.chainIsValid(bc1.chain);
console.log("isValid", isValid);
