import { enabledConfig } from "../../../config";
import { joinRoom, ethNewTxSetDepending, getSocket } from "../../../utils/";
import eventHub from "../../eventHub";

const listeners = {};

const instances = [];

export const removeStaleListeners = () => {
    const stale = {};
    for (const listenerKey in listeners) {
        const listener = listeners[listenerKey];
        let needed = false;
        for (let i = 0; i < instances.length; i++) {
            const instance = instances[i];
            if (instance.listener === listener) needed = true;
        }
        if (!needed) stale[listenerKey] = listener;
    }
    for (const listenerKey in stale) {
        const listener = stale[listenerKey];
        listener.socket.off(listener.eventName, listener.listener);
        delete listeners[listenerKey];
    }
}

export const getNeededRooms = () => {
    const needed = [];
    for (let i = 0; i < instances.length; i++) {
        const instance = instances[i];
        needed.push(instance.ticker + "-transactions");
    }
    return needed;
}

class Transactions {
    constructor(ticker) {
        this.ticker = ticker;
        this.connectSocket();
        this.bridge = {
            liveTxs: [],
            addTx: (tx) => {
                this.bridge.liveTxs.push(tx);
                if (this.bridge.liveTxs.length > 10000) {
                    this.bridge.liveTxs.splice(0, 1000);
                }
            },
            removeTx: (tx) => {
                const index = this.bridge.liveTxs.indexOf(tx);
                if (index !== -1) this.bridge.liveTxs.splice(index, 1);
            },
            clearTxs: () => {
                this.bridge.liveTxs = [];
            },
        };
    }

    connectSocket() {
        let coinConfig = enabledConfig[this.ticker];
        let socket = joinRoom(coinConfig, "transactions");
        let listenerKey = "transactions-" + coinConfig.ticker;

        if (!listeners[listenerKey]) {
            this.listener = (listeners[listenerKey] = {
                socket: socket,
                eventName: "tx",
                listener: data => {
                    if (data.chain === "ETH") ethNewTxSetDepending(data, coinConfig);
                    coinConfig.liveTxs.push(data);
                    eventHub.$emit("addTx-" + coinConfig.ticker, data);
                    if (coinConfig.liveTxs.length > 10000) {
                        coinConfig.liveTxs.splice(0, 1000);
                    }
                },
            });
            socket.on(this.listener.eventName, this.listener.listener);
        }
        else {
            this.listener = listeners[listenerKey];
        }

        // connect to bridge tx socket
        const bridgeSocketServerUrl = process.env.VUE_APP_BRIDGE_TX_SOCKET_SERVER_URL;
        let bridgeSocket = getSocket(false, bridgeSocketServerUrl);
        bridgeSocket.socket.on("newTransaction", data => {
            console.log('newTransaction emitted', data);

            if(data.direction === "LYX->wLYX"){
                
                eventHub.$emit("LuxoBridgeTx", data); 
              
            }
            if (data.direction === "wLYX->LYX"){

                eventHub.$emit("EthBridgeTx", data);
            }
            this.bridge.addTx(data);
        });

        /* Sample data

            [
                {
                    "_id": "66b48e2dad0ed40d04be5ece",
                    "address": "0x185d0F59324ADaF8a24D11Fd1a90c44d09053464",
                    "amount": "676194608925157200000",
                    "type": "BurnFor",
                    "direction": "wLYX->LYX",
                    "completionTime": 144,
                    "transactionHash": "0x7cc40708cce9b05e5232fac5b9f597f7dbfdc45f349ac379b69de150f5d7dad7",
                    "chain": "ETH",
                    "createdAt": "2024-08-08T09:21:49.094Z",
                    "updatedAt": "2024-08-08T09:21:49.094Z",
                    "__v": 0
                },
                {
                    "_id": "66b48e2dad0ed40d04be5ecb",
                    "address": "0x5405ec3511fe518dbCF18c638011e3c07c2788fa",
                    "amount": "2310000000000000000000",
                    "type": "BurnFor",
                    "direction": "wLYX->LYX",
                    "completionTime": 144,
                    "transactionHash": "0x37a0b5f25ea7f3061fa18ef72c43f3d3b3a4e300c9c13996033584993f76c0f5",
                    "chain": "ETH",
                    "createdAt": "2024-08-08T09:21:49.091Z",
                    "updatedAt": "2024-08-08T09:21:49.091Z",
                    "__v": 0
                },
            ]
        
        */
    }

    stop() {
        instances.splice(instances.indexOf(this), 1);
        removeStaleListeners();
    }
}

export const newTransactions = (ticker) => {
    const transactions = new Transactions(ticker);
    instances.push(transactions);
    return transactions;
}