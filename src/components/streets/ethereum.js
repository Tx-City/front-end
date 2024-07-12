import { Street } from "../street.js";
// import { toRes, ethNewTxSetDepending } from "../utils/";
import { toRes, ethNewTxSetDepending,getSheetKey } from "../utils/";
import { ETH, ethUnits } from "../config.js";
import i18n from "../../i18n";
import eventHub from "../vue/eventHub.js";
import state from "../../wallet";
import Bus from "../game-objects/bus.js";


export default class ETHStreet extends Street {
	constructor(side) {
		super(ETH, side);
	}

	init() {
		this.myDummyData;
		this.foundBoarding = false;
		this.busStop = toRes(1500);
		this.myMainCameraPosition= 1300;
		this.busDoorFromTop = toRes(42);
		this.personPixelsPerSecond = 5;
		this.decelerationArea = 500;
		this.sceneHeight = toRes(10000);
		let walkingLaneOffset = 10 * this.tileSize;
		this.walkingLane = this.side == "right" ? toRes(960) - walkingLaneOffset : walkingLaneOffset;
		this.lineLength = 9500;
		this.maxSizePplToLoad = 20000000;
		this.streetInit();
		this.stringLengths = {
			tx: [64, 66],
			address: [40, 42],
		};
		this.medianFeeStat = "medianFee-gasPrice";
		this.vueTxFormat = [
			{
				title: () => {
					return "Max " + i18n.t(this.ticker.toLowerCase() + ".gp"); //TODO change to max gas price
				},
				format: val => {
					return ethUnits(val);
				},
				key: "feeVal",
			},
			{
				title: () => {
					return i18n.t(this.ticker.toLowerCase() + ".mpfpg"); //TODO change to max gas price
				},
				format: val => {
					return ethUnits(val);
				},
				key: "mpfpg",
			},
			{
				title: () => {
					return i18n.t(this.ticker.toLowerCase() + ".g");
				},
				key: "g",
			},
			{
				title: () => {
					return "Type";
				},
				key: "ty",
			},
			{
				title: () => {
					return "Nonce";
				},
				key: "n",
			},
			{
				title: () => {
					return "Address Nonce";
				},
				key: "an",
			},
			{
				title: () => {
					return i18n.t(this.ticker.toLowerCase() + ".tot");
				},
				key: "tot",
				after: this.ticker,
			},
		];
		this.vueBlockFormat = this.config.blockFormat;
		this.sizeVar = "g";
		this.bottomStats = this.config.stats;
	}

	preload() {}

	
	async create() {
		super.create();
		this.addressNonces = this.config.addressNonces;
		this.streetCreate();
		this.cameras.main.scrollY =this.myMainCameraPosition;
		this.vue.navigation.unshift({
			key: "characters",
			html: "<span class='fas fa-user-astronaut'></span>",
			title: "Character Select",
			tooltip: "Character Select",
			hasWindow: true,
		});

		this.vue.windowData.push({
			key: "characters",
			title: "Character Select",
			components: [
				{
					name: "CharacterSelect",
				},
			],
			styles: {
				width: "min(965px, 80%)",
				height: "90%",
			},
			position: "center",
		});

		this.vue.busFeeTitle = "Gwei";
		(this.vue.busFeeTitleLong = () => {
			return "Tip Price (Gwei)";
		}),
			(this.vue.sizeTitle = () => {
				return i18n.t(this.ticker.toLowerCase() + ".sizeTitle");
			}),
			this.ethBuses();
		this.createPeople();
		eventHub.$on(this.ticker + "-follow", (address) => {
			this.followAddress(address);
		});
		eventHub.$on("createMyStaticSearch",()=>{this.createStaticSearch()});
		if (state.address) this.followAddress(state.address);
		this.createIsabella();
	}

	createStaticSearch(){


       setInterval(() => {
		if(this.myMainCameraPosition > 0){
		this.myMainCameraPosition -= 10;
		this.cameras.main.scrollY = this.myMainCameraPosition;
	}}, 20);

		this.mybus = new Bus(this);
		this.mybus.y = 200;
		this.mybus.text1.setText("#20975174");
		this.mybus.text2.setText("2Gwei");
		this.mybus.text3.setText("+0Wei");
        this.mybus.logo.setScale(0.3);
		this.mybus.createInside();
		//this.busInsideSingle(this.mybus);
		this.mybus.txsOverride = true;
		//this.mybus.tx.length = 4;
		this.mybus.loaded = 4 ;
		this.mymailman = this.add.image(this.mybus.x,this.mybus.y-50,getSheetKey("person-"),"mailman-0.png").setDepth(100).setScale(0.5);
		this.mypersonman = this.add.image(this.mybus.x-20,this.mybus.y-50,getSheetKey("person-"),"person-59.png").setDepth(100).setScale(0.5);
		this.mysecondpersonman = this.add.image(this.mybus.x+40,this.mybus.y-50,getSheetKey("person-"),"bear-0.png").setDepth(100).setScale(0.5);

		this.mymailman1 = this.add.image(this.mybus.x,this.mybus.y-28,getSheetKey("person-"),"lizard-0.png").setDepth(100).setScale(0.5);
		this.mypersonman1 = this.add.image(this.mybus.x-30,this.mybus.y-28,getSheetKey("person-"),"person-59.png").setDepth(100).setScale(0.5);
		this.mysecondpersonman1 = this.add.image(this.mybus.x+20,this.mybus.y-28,getSheetKey("person-"),"bear-0.png").setDepth(100).setScale(0.5);
		//this.myPeopleInBus = this.scene.add.image(this.mybus.x,this.mybus.y, "myPeopleInBus").setOrigin(0, 0).setDepth(11);

		this.mySecondBus = new Bus(this);
		this.mySecondBus.y =400;
		this.mySecondBus.text1.setText("#20175274");
		this.mySecondBus.text2.setText("4Gwei");
		this.mySecondBus.text3.setText("+0Wei");
        this.mySecondBus.logo.setScale(0.3);

		this.myThirdBus = new Bus(this);
		this.myThirdBus.y = 600;
		this.myThirdBus.text1.setText("#20188174");
		this.myThirdBus.text2.setText("3Gwei");
		this.myThirdBus.text3.setText("+0Wei");
        this.myThirdBus.logo.setScale(0.3);
		this.time.delayedCall(3500, () => {
			
		console.log("tumeanzia hapa")
		this.myPerson =this.newPerson(this.myDummyData);
		this.myPerson.setTexture(getSheetKey("person-"),"mailman-0.png");
	
		this.myPerson.active = true;
		this.myPerson.visible = true;
		this.myPerson.setDepth(10);
		this.myPerson.setPosition(this.mybus.x,this.mybus.y);
		this.myPerson.setInteractive({ useHandCursor: true });
		this.myPerson.createHitArea();
		this.myPerson.setLineData("status", null);
		this.myPerson.setScale(1)
		//this.myPerson.resetData();

		
		

		this.myPerson.createPath([this.mybus.x-50,this.mybus.y,
		this.mybus.x-200,this.mybus.y,
		this.mybus.x-200,this.myThirdBus.y,
		this.mybus.x-300,this.myThirdBus.y])
		this.myPerson.goAlongPath();
        }, [], this);


	}



	// cycleIsaMessage() {
	// 	if (!this.isabella.isaChange) {
	// 		this.isabella.currentMessage = 0;
	// 		this.isabella.isaChange = setInterval(() => {
	// 			this.cycleIsaMessage();
	// 		}, 30000);
	// 	}

	// 	if (this.isapop) this.isapop.destroy();
	// 	if (!this.isabella.messages[this.isabella.currentMessage]) {
	// 		clearInterval(this.isabella.isaChange);
	// 		delete this.isabella.isaChange;
	// 		return;
	// 	}
	// 	this.isapop = new Popup(
	// 		this,
	// 		mirrorX(390, this.side),
	// 		toRes(170),
	// 		false,
	// 		"bubble",
	// 		this.isabella.messages[this.isabella.currentMessage++]
	// 	);
	// }

	// createIsabella() {
	// 	this.isabella = this.add.image(mirrorX(390, this.side), toRes(160), getSheetKey("taha-1.png"), "taha-1.png");
	// 	this.isabella.setDisplaySize(toRes(128), toRes(128));
	// 	this.isabella.setInteractive({ useHandCursor: true });
	// 	this.isabella.on("pointerup", () => {
	// 		this.cycleIsaMessage();
	// 	});
	// 	this.isabella.setDepth(this.personDepth);
	// 	this.isabella.messages = [
	// 		"Hi Anon! My name is Taha, like to add your L2 here?",
	// 		"Are you looking to Rent a house on our street?",
	// 		"Feel free to reach out to me on X @web3dopamine",
	// 	];
	// 	this.cycleIsaMessage();
	// }


	crowdCountDisplay() {
		if (this.vue.stats["mempool-size"].value && this.vue.stats["mempool-size"].value > 75000) {
			return ">75000";
		}
		return this.crowdCount;
	}

	formatAddr(address) {
		return address.toLowerCase();
	}

	addToMove(entry, toMove) {
		if (typeof toMove[entry.txData.fr] === "undefined") toMove[entry.txData.fr] = [];
		entry.ignoreBusFee = true;
		toMove[entry.txData.fr].push(entry);
	}

	getModSize(txData, g = false) {
		if (txData.modSize) return txData.modSize;
		let minGasDif;
		let gasDif;
		if (!g) {
			gasDif = this.vue.stats.gasUsedDif.value / 100;
			minGasDif = 21000 / gasDif;
		} else {
			gasDif = g[0];
			minGasDif = g[1];
		}
		let gas = txData.ag ? txData.ag : txData.g;
		let modSize = gas > minGasDif ? gas * gasDif : gas;
		return Number(modSize);
	}

	getGasTarget() {
		return this.vue.stats["gasTarget"].value || 15000000;
	}

	getBaseFee() {
		return this.vue.stats["baseFee"].value || 1000000000;
	}

	calcBusBaseFee(busArray, index) {
		if (!index || index < 1) return this.getBaseFee();
		let prevBus = busArray[index - 1];
		let prevBaseFee = prevBus.baseFee || this.getBaseFee();
		let prevLoaded = prevBus.realLoaded;
		let baseFee = this.calcBaseFee(prevBaseFee, prevLoaded, this.config.busCapacity);
		return baseFee;
	}

	calcBaseFee(prevBaseFee, used, limit) {
		const elasticity = 2;
		const denominator = 8;
		const target = limit / elasticity;
		let baseFee = prevBaseFee;
		if (used > target) {
			const usedDelta = used - target;
			const baseDelta = Math.max((prevBaseFee * usedDelta) / target / denominator, 1);
			baseFee = prevBaseFee + baseDelta;
		} else if (used < target) {
			const usedDelta = target - used;
			const baseDelta = (prevBaseFee * usedDelta) / target / denominator;
			baseFee = prevBaseFee - baseDelta;
		}
		return baseFee;
	}

	getFittingTxs(hashArray, bus, skipTxs = {}) {
		let spaceRemaining = (this.config.busCapacity - bus.loaded) * 1.5;

		let txs = [];
		for (let i = 0; i < hashArray.length; i++) {
			if (spaceRemaining < 21000) break; //TODO replace 21000 based on coin
			let entry = hashArray[i];
			if (entry.deleted) continue;
			if (entry.txData.feeVal < bus.baseFee) continue;
			if (typeof skipTxs.hashes[entry.txData.tx] !== "undefined") continue;
			if (entry.modSize < spaceRemaining) {
				//it fits!
				spaceRemaining -= entry.modSize;
				entry.ignoreBusFee = true;
				txs.push(entry);
			}
		}
		return txs;
	}

	addBusTxs(bus, hashArray, skipTxs, instant = false, increasingNonces, toMove) {
		let busId = bus.getData("id");
		let candidates = [];

		for (let i = 0; i < hashArray.length; i++) {
			const entry = hashArray[i];
			if (skipTxs.hashes[entry.txData.tx]) continue;
			if (this.config.getAndApplyFee(entry.txData) < bus.baseFee) continue;
			if (entry.txData.deleted) continue;
			if (typeof entry.modSize === "undefined") entry.modSize = this.getModSize(entry.txData);

			//calculate tip based on base fee
			let tip = entry.txData.feeVal - bus.baseFee;
			if (entry.txData.mpfpg && tip > Number(entry.txData.mpfpg)) tip = Number(entry.txData.mpfpg);
			entry.tipForBus = tip / 1000000000; //hardcoded to gwei for now
			candidates.push(entry);
		}

		candidates.sort((a, b) => {
			return b.tipForBus - a.tipForBus;
		});

		for (let i = 0; i < candidates.length; i++) {
			const entry = candidates[i];
			if (bus.loaded + entry.modSize > this.config.busCapacity) {
				let fittedTxs = this.getFittingTxs(candidates, bus, skipTxs);
				for (let j = 0; j < fittedTxs.length; j++) {
					const fittedTx = fittedTxs[j];
					if (typeof fittedTx.modSize === "undefined") fittedTx.modSize = this.getModSize(fittedTx.txData);
					if (fittedTx.modSize + bus.loaded > this.config.busCapacity) continue;
					if (this.addTxToBus(fittedTx, bus, busId, instant, skipTxs, increasingNonces, toMove)) {
						fittedTx.ignoreBusFee = true;
					}
				}
				break;
			}
			this.addTxToBus(entry, bus, busId, instant, skipTxs, increasingNonces, toMove);
		}
		bus.realLoaded = bus.loaded;
		bus.loaded = this.config.busCapacity;
	}

	addTxToBus(entry, bus, busId, instant, skipTxs, increasingNonces, toMove) {
		if (skipTxs.hashes[entry.txData.tx]) return false;
		if (typeof increasingNonces[entry.txData.fr] === "undefined" || increasingNonces[entry.txData.fr] !== entry.txData.n) {
			entry.txData.dependingOn = true;
			this.addToMove(entry, toMove);
			return false;
		}
		increasingNonces[entry.txData.fr]++;

		skipTxs.hashes[entry.txData.tx] = true;
		skipTxs.count++;

		if ((typeof entry.ignoreBusFee === "undefined" || !entry.ignoreBusFee) && Boolean(entry.tipForBus)) {
			bus.feeArray.push(parseFloat(entry.tipForBus.toFixed(2)));
		}
		bus.tx.push(entry.txData);
		bus.loaded += entry.modSize;

		if (instant) {
			this.lineManager[entry.txData.tx].status = "on_bus";
			this.lineManager[entry.txData.tx].boarded = busId;
		}
		this.lineManager[entry.txData.tx].destination = busId;
		this.lineManager[entry.txData.tx].spot = "bus";

		if (typeof toMove[entry.txData.fr] !== "undefined" && toMove[entry.txData.fr].length) {
			let nextToAdd = toMove[entry.txData.fr][0];
			let nextNonce = increasingNonces[nextToAdd.txData.fr];
			//check if toMove entry meets requirements
			if (
				nextNonce === nextToAdd.txData.n &&
				nextToAdd.feeVal > bus.baseFee &&
				nextToAdd.modSize + bus.loaded < this.config.busCapacity
			) {
				//correct to add next one
				toMove[entry.txData.fr].shift();
				this.addTxToBus(nextToAdd, bus, busId, instant, skipTxs, increasingNonces, toMove);
			}
		}

		return true;
	}

	//go through list
	sortBuses(instant = false, hashArray = false) {
		console.log("sfjslkjf;lkasjfklja")
		if (!hashArray) hashArray = this.sortedLineHashes(false);
		for (let i = 0; i < hashArray.length; i++) {
			hashArray[i].txData.dependingOn = false;
		}
		let increasingNonces = JSON.parse(JSON.stringify(this.addressNonces));
		let skipTxs = {
			hashes: {},
			count: 0,
		};
		let toMove = {};
		if (!this.vue.isConnected) return false;
		let activeBusesBefore = this.activeBuses(false);
		let nonEmptyBuses = [];
		for (let i = 0; i < activeBusesBefore.length; i++) {
			const bus = activeBusesBefore[i];
			if (bus.tx.length > 0) nonEmptyBuses.push(bus.getData("id"));
		}

		let activeBuses = this.activeBuses();

		for (let i = 0; i < this.config.userSettings.maxBuses.value; i++) {
			let bus = activeBuses[i];
			if (!bus) {
				activeBuses.push(this.addBus());
				i--;
				continue;
			}
			bus.baseFee = this.calcBusBaseFee(activeBuses, i);
			bus.feeText = ethUnits(bus.baseFee, true, true);
			this.addBusTxs(bus, hashArray, skipTxs, instant, increasingNonces, toMove);
		}

		//get leftovers from hasharray (not in skipTxs)
		let leftovers = [];
		let peopleSizeAdded = 0;
		let peopleAdded = 0;
		for (let i = 0; i < hashArray.length; i++) {
			const entry = hashArray[i];
			if (skipTxs.hashes[entry.txData.tx]) continue;
			if (entry.txData.deleted) continue;
			leftovers.push(entry);
		}
		if (instant) this.resetBoardingAndDestination(leftovers);
		this.sortLine(leftovers);
		for (let i = 0; i < leftovers.length; i++) {
			const entry = leftovers[i];
			if (peopleSizeAdded > this.config.busCapacity || peopleAdded > 1000) {
				//TODO also check count
				if (this.txFollowers[entry.txData.tx]) {
					this.lineManager[entry.txData.tx].spot = peopleAdded + 1;
					continue;
				}
				if (entry.status === "waiting" || !entry.status) {
					this.deleteLinePerson(entry.txData.tx, true);
				}
				continue;
			}

			peopleSizeAdded += entry.modSize;
			peopleAdded++;
			this.lineManager[entry.txData.tx].destination = false;
			if (instant) {
				this.lineManager[entry.txData.tx].status = "waiting";
				//add to line as person
				this.newPerson(this.lineManager[entry.txData.tx]);
				this.myDummyData = this.lineManager[entry.txData.tx];
			}
		}

		let compare = this.getLineCords(peopleAdded)[1];
		this.setCrowdY(compare);

		let foundLoaded = false;
		let target = this.getGasTarget();
		for (let i = activeBuses.length - 1; i >= 0; i--) {
			this.calcBusFees(activeBuses, i);
			activeBuses[i].feeText2 = "+" + ethUnits(Math.ceil(activeBuses[i].lowFee) * 1000000000);
			let busId = activeBuses[i].getData("id");
			if (foundLoaded || nonEmptyBuses.includes(busId) || activeBuses[i].tx.length > 0) {
				foundLoaded = true;
				let overTarget = activeBuses[i].realLoaded - target;
				if (overTarget < 0) overTarget = 0;
				activeBuses[i].resize(overTarget > 0 ? Math.round(overTarget / 500000) : 0);
				continue;
			}
			activeBuses[i].bye();
			activeBuses.splice(i, 1);
		}

		const notDeleted = hashArray.filter(obj => !obj.txData.deleted).length;
		const pplLeftover = this.bottomStats["mempool-size"].value - notDeleted;

		if (activeBuses.length > 0 && pplLeftover > 1000 && activeBuses[0].loaded === this.config.busCapacity) {
			this.crowdCount = pplLeftover;
			if (this.crowd.text)
				this.crowd.text.setText(i18n.t("messages.low-fee-line") + ": " + this.crowdCountDisplay());
		} else {
			this.crowdCount = 0;
		}

		this.updateAllBusPercent(activeBuses);

		this.vue.sortedCount++;
		this.busInside();
	}

	calcBusHeight(/*size*/) {
		return 0; //TODO maybe do dynamic, but block size is so small that it would show as 0 all the time
	}

	calcBusHeightFromBlock(block) {
		let target = this.getGasTarget();
		let overTarget = block.gu - target;
		if (overTarget < 0) overTarget = 0;
		return overTarget > 0 ? Math.round(overTarget / 500000) : 0;
	}

	setMaxScalePerson(person = false, txSize) {
		let scale = 0.35;
		if (txSize <= 21000) {
			scale = 0.35;
		} else if (txSize < 50000) {
			scale = 0.4;
		} else if (txSize < 100000) {
			scale = 0.45;
		} else if (txSize < 500000) {
			scale = 0.55;
		} else if (txSize < 1000000) {
			scale = 0.65;
		} else if (txSize < 10000000) {
			scale = 0.8;
		} else {
			scale = 1;
		}
		if (person) person.setData("maxScale", scale);
		return scale;
	}

	ethBuses() {
		this.busesLeaving = this.add.group();
		this.config.busCapacity = this.vue.stats.gasLimit.value;
		if (typeof this.config.busCapacity === "undefined" || !this.config.busCapacity) {
			setTimeout(() => {
				this.ethBuses();
			}, 100);
			return false;
		}
	}

	update() {
		this.streetUpdate();
	}

	beforeNewTx(tx) {
		//set the address nonce
		ethNewTxSetDepending(tx, this.config);

		if (tx.dh) {
			for (let i = 0; i < tx.dh.length; i++) {
				const hashToDelete = tx.dh[i];
				this.deleteLinePerson(hashToDelete, true);
				this.removeFollower(hashToDelete, true);
			}
		}
	}

	afterProcessBlock(block) {
		if (typeof block.txFull !== "undefined") {
			for (const hash in block.txFull) {
				const tx = block.txFull[hash];
				const fromAddress = tx.fr;
				if (tx.an >= this.addressNonces[fromAddress]) this.addressNonces[fromAddress] = tx.an;
			}
		}
	}
}

ETHStreet.config = ETH;
