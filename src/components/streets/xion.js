import { Street } from "../street.js";
// import { toRes, ethNewTxSetDepending } from "../utils/";
import { toRes } from "../utils/";
import { XION } from "../config.js";
import i18n from "../../i18n";
import eventHub from "../vue/eventHub.js";
import Bus from "../game-objects/bus.js";

export default class XIONStreet extends Street {
	constructor(side) {
		super(XION, side);
	}

	init() {
		this.foundBoarding = false;
		this.busStop = toRes(200);
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
					return i18n.t(this.ticker.toLowerCase() + ".g");
				},
				key: "g",
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
		this.createEtherPeopleAnims();

		// Initialize groups
		this.houseArray = [];
		this.houses = this.add.group();
		this.people = this.add.group();
		this.movingPeople = [];

		// Initialize bus system
		this.createBuses();
		this.busLeavingInterval();
		this.busInsideInterval();

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

		this.vue.busFeeTitleLong = () => {
			return i18n.t(this.ticker.toLowerCase() + ".spb");
		};
		this.vue.sizeTitle = () => {
			return i18n.t(this.ticker.toLowerCase() + ".sizeTitle");
		};
		this.xionBuses();
		this.createPeople();
		eventHub.$on(this.ticker + "-follow", (address) => {
			this.followAddress(address);
		});
	}

	createEtherPeopleAnims() {
		this.anims.create({
			key: "walk_up_2002",
			frames: this.anims.generateFrameNumbers("etherPeopleBack"),
			frameRate: 6,
			repeat: -1,
			repeatDelay: 0,
			callbackScope: this,
			onComplete: function () {},
		});

		this.anims.create({
			key: "walk_down_2002",
			frames: this.anims.generateFrameNumbers("etherPeopleFront"),
			frameRate: 6,
			repeat: -1,
			repeatDelay: 0,
			callbackScope: this,
			onComplete: function () {},
		});

		this.anims.create({
			key: "walk_side_2002",
			frames: this.anims.generateFrameNumbers("etherPeopleSide"),
			frameRate: 6,
			repeat: -1,
			repeatDelay: 0,
			callbackScope: this,
			onComplete: function () {},
		});

		this.anims.create({
			key: "stand_2002",
			frames: this.anims.generateFrameNumbers("etherPeopleFront"),
			frameRate: 0,
			repeat: 0,
			repeatDelay: 0,
			callbackScope: this,
			onComplete: function () {},
		});
	}

	// crowdCountDisplay() {
	// 	if (this.vue.stats["mempool-size"].value && this.vue.stats["mempool-size"].value > 75000) {
	// 		return ">75000";
	// 	}
	// 	return this.crowdCount;
	// }

	// formatAddr(address) {
	// 	return address.toLowerCase();
	// }

	addToMove(entry, toMove) {
		if (typeof toMove[entry.txData.fr] === "undefined") toMove[entry.txData.fr] = [];
		entry.ignoreBusFee = true;
		toMove[entry.txData.fr].push(entry);
	}

	getModSize(txData) {
		if (txData.modSize) return txData.modSize;
		return Number(txData.g || 0); // Return gas value directly for XION
	}

	getGasTarget() {
		return this.vue.stats["gasTarget"].value || 15000000;
	}

	getFittingTxs(hashArray, bus, skipTxs = {}) {
		let spaceRemaining = this.config.busCapacity - bus.loaded;
		let txs = [];

		for (let i = 0; i < hashArray.length; i++) {
			let entry = hashArray[i];
			if (entry.deleted) continue;
			if (typeof skipTxs.hashes[entry.txData.tx] !== "undefined") continue;

			if (typeof entry.modSize === "undefined") {
				entry.modSize = this.getModSize(entry.txData);
			}

			if (entry.modSize <= spaceRemaining) {
				spaceRemaining -= entry.modSize;
				txs.push(entry);
			}
		}
		return txs;
	}

	addBusTxs(bus, hashArray, skipTxs, instant = false) {
		let busId = bus.getData("id");
		let candidates = [];

		// Collect valid transactions
		for (let i = 0; i < hashArray.length; i++) {
			const entry = hashArray[i];
			if (skipTxs.hashes[entry.txData.tx]) continue;
			if (entry.txData.deleted) continue;

			if (typeof entry.modSize === "undefined") {
				entry.modSize = this.getModSize(entry.txData);
			}
			candidates.push(entry);
		}

		// Sort by gas value (higher gas first)
		candidates.sort((a, b) => b.txData.g - a.txData.g);

		// Add transactions to bus
		for (let i = 0; i < candidates.length; i++) {
			const entry = candidates[i];
			if (bus.loaded + entry.modSize > this.config.busCapacity) {
				// Try to fit smaller transactions if space remains
				let remainingSpace = this.config.busCapacity - bus.loaded;
				let fittedTxs = candidates.filter(
					(tx) => !skipTxs.hashes[tx.txData.tx] && tx.modSize <= remainingSpace
				);

				for (let j = 0; j < fittedTxs.length; j++) {
					this.addTxToBus(fittedTxs[j], bus, busId, instant, skipTxs);
				}
				break;
			}
			this.addTxToBus(entry, bus, busId, instant, skipTxs);
		}

		bus.realLoaded = bus.loaded;
		bus.loaded = this.config.busCapacity;
	}

	addTxToBus(entry, bus, busId, instant, skipTxs) {
		if (skipTxs.hashes[entry.txData.tx]) return false;

		skipTxs.hashes[entry.txData.tx] = true;
		skipTxs.count++;

		bus.tx.push(entry.txData);
		bus.loaded += entry.modSize;

		if (instant) {
			this.lineManager[entry.txData.tx].status = "on_bus";
			this.lineManager[entry.txData.tx].boarded = busId;
		}
		this.lineManager[entry.txData.tx].destination = busId;
		this.lineManager[entry.txData.tx].spot = "bus";

		return true;
	}

	//go through list
	sortBuses(instant = false, hashArray = false) {
		if (!hashArray) hashArray = this.sortedLineHashes(false);

		let skipTxs = {
			hashes: {},
			count: 0,
		};

		if (!this.vue.isConnected) return false;

		// Track existing buses with transactions
		let activeBusesBefore = this.activeBuses(false);
		let nonEmptyBuses = [];
		for (let i = 0; i < activeBusesBefore.length; i++) {
			const bus = activeBusesBefore[i];
			if (bus.tx.length > 0) nonEmptyBuses.push(bus.getData("id"));
		}

		let activeBuses = this.activeBuses();

		// Ensure we have the configured number of buses
		for (let i = 0; i < this.config.userSettings.maxBuses.value; i++) {
			let bus = activeBuses[i];
			if (!bus) {
				activeBuses.push(this.addBus());
				i--;
				continue;
			}

			// Sort transactions by gas value
			let candidates = [];
			for (let j = 0; j < hashArray.length; j++) {
				const entry = hashArray[j];
				if (skipTxs.hashes[entry.txData.tx]) continue;
				if (entry.txData.deleted) continue;

				if (typeof entry.modSize === "undefined") {
					entry.modSize = this.getModSize(entry.txData);
				}

				candidates.push(entry);
			}

			// Sort by gas value (higher gas first)
			candidates.sort((a, b) => b.txData.g - a.txData.g);

			// Add transactions to bus
			for (let j = 0; j < candidates.length; j++) {
				const entry = candidates[j];
				if (bus.loaded + entry.modSize > this.config.busCapacity) {
					break;
				}

				skipTxs.hashes[entry.txData.tx] = true;
				skipTxs.count++;

				bus.tx.push(entry.txData);
				bus.loaded += entry.modSize;

				// Set up proper boarding state
				if (instant) {
					if (this.lineManager[entry.txData.tx]) {
						this.lineManager[entry.txData.tx].status = "boarding";
						this.lineManager[entry.txData.tx].boarding = bus.getData("id");
						this.lineManager[entry.txData.tx].boarded = false;
						this.lineManager[entry.txData.tx].spot = "boarding";
					}
				} else {
					if (this.lineManager[entry.txData.tx]) {
						this.lineManager[entry.txData.tx].destination = bus.getData("id");
						this.lineManager[entry.txData.tx].spot = "bus";
					}
				}
			}

			bus.realLoaded = bus.loaded;
		}

		// Handle leftover transactions
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

		// Add leftover transactions to the waiting line
		for (let i = 0; i < leftovers.length; i++) {
			const entry = leftovers[i];
			if (peopleSizeAdded > this.config.busCapacity || peopleAdded > 1000) {
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
				this.newPerson(this.lineManager[entry.txData.tx]);
			}
		}

		let compare = this.getLineCords(peopleAdded)[1];
		this.setCrowdY(compare);

		// Update bus visuals
		for (let i = activeBuses.length - 1; i >= 0; i--) {
			let busId = activeBuses[i].getData("id");
			if (nonEmptyBuses.includes(busId) || activeBuses[i].tx.length > 0) {
				activeBuses[i].resize(40); // Fixed height for XION buses
				continue;
			}
			activeBuses[i].bye();
			activeBuses.splice(i, 1);
		}

		this.updateAllBusPercent(activeBuses);
		this.vue.sortedCount++;
		this.busInside();
	}

	calcBusHeight(/*size*/) {
		return 40; //TODO maybe do dynamic, but block size is so small that it would show as 0 all the time
	}

	calcBusHeightFromBlock(block) {
		return 40;
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

	// ... existing code ...
	xionBuses() {
		// Create bus groups if not already created
		if (!this.buses) {
			this.buses = this.add.group({
				classType: Bus,
				maxSize: 100,
				runChildUpdate: false,
				active: false,
				visible: false,
			});
		}
		if (!this.busFloors) {
			this.busFloors = this.add.group();
		}
		if (!this.busesLeaving) {
			this.busesLeaving = this.add.group();
		}

		// Set bus capacity
		this.config.busCapacity = 15000000; // Fixed capacity for XION

		// Add initial bus if none exists
		if (!this.buses.countActive()) {
			this.addBus();
		}
	}
	// ... existing code ...

	update() {
		this.streetUpdate();
	}

	beforeNewTx(tx) {
		//set the address nonce
		// ethNewTxSetDepending(tx, this.config);

		if (tx.dh) {
			for (let i = 0; i < tx.dh.length; i++) {
				const hashToDelete = tx.dh[i];
				this.deleteLinePerson(hashToDelete, true);
				this.removeFollower(hashToDelete, true);
			}
		}
	}

	afterProcessBlock(block) {
		// Remove confirmed transactions from the street
		if (typeof block.txFull !== "undefined") {
			for (const hash in block.txFull) {
				// Delete the person from the line
				this.deleteLinePerson(hash, true);
				// Remove from followers if being followed
				this.removeFollower(hash, true);
			}
		}
	}

	addBus(atStop = true) {
		const bus = this.buses.get();
		if (bus) {
			bus.scene = this; // Set the scene context
			bus.newBus(atStop);
			bus.setActive(true).setVisible(true);
			if (bus.busFloor) {
				this.busFloors.add(bus.busFloor);
			}
			return bus;
		}
		return null;
	}
}

XIONStreet.config = XION;
