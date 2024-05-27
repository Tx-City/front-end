# TxCity Frontend

---

# Summary

TxCity is a live transaction and mempool visualizer featuring Bitcoin, Ethereum, Bitcoin Cash, Monero and Litecoin. When a new transaction is broadcasted to a cryptocurrency network, a person appears and attempts to board a bus in real time. If the transaction has a high enough fee, they will board the first bus and be ready to be included in the next mined block. If there are too many transactions to be included in the next block, and the transaction didn't pay a high enough fee, the person will either wait in line or board a different bus. The movement speed of a person represents how high of a fee they paid compared to the current median fee. The size of a person represents the size of the transaction in bytes or gas.

The frontend is built with Vue, Bulma and Phaser 3. It connects to TxCity backends using websockets (socket.io) and REST APIs.


---


# License

The MIT License (MIT)

Copyright (c) 2023 TxCity.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
