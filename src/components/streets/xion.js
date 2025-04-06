import { Street } from "../street.js";
import { mirrorX, toRes, getSheetKey } from "../utils/";
import { XION } from "../config.js";
import { fds, default as i18n } from "../../i18n";
import { add } from "date-fns";

export default class XIONStreet extends Street {
	constructor(side) {
		super(XION, side);
	}

	init() {
		this.foundBoarding = false;
		this.busStop = toRes(200);
		this.busDoorFromTop = toRes(42);
		this.personPixelsPerSecond = 10;
		this.decelerationArea = toRes(500);
		this.sceneHeight = toRes(10000);
		this.alwaysGetPendingAfterBlock = true;
		let walkingLaneOffset = 10 * this.tileSize;
		this.walkingLane = this.side == "right" ? toRes(960) - walkingLaneOffset : walkingLaneOffset;
		this.lineLength = 9500;
		this.streetInit();
		this.stringLengths = {
			tx: [64],
			address: [34, 42],
		};
		this.sizeVar = "s";
		this.medianFeeStat = "medianFee-satPerByte";
		this.vueTxFormat = [
			{
				title: () => {
					return i18n.t(this.ticker.toLowerCase() + ".spb");
				},
				key: "spb",
			},
			{
				title: () => {
					return i18n.t(this.ticker.toLowerCase() + ".s");
				},
				key: "s",
			},
			{
				title: () => {
					return i18n.t(this.ticker.toLowerCase() + ".rs");
				},
				key: "rs",
			},
			{
				title: () => {
					return i18n.t(this.ticker.toLowerCase() + ".tot");
				},
				key: "tot",
				after: this.ticker,
			},
		];
		this.bottomStats = this.config.stats;

		// Debug mode
		this.debug = true;
	}

	preload() {}

	create() {
		super.create();
		console.log("XION street create() called");
		this.createPeople();
		this.streetCreate();
		this.vue.busFeeTitle = "XION";
		this.vue.busFeeTitleLong = () => {
			return i18n.t(this.ticker.toLowerCase() + ".spb");
		};
		this.vue.sizeTitle = () => {
			return i18n.t(this.ticker.toLowerCase() + ".sizeTitle");
		};
		this.createBuses();
		console.log("Buses group created, active buses:", this.buses ? this.buses.countActive() : 0);

		// Watch for blockchain updates
		this.vue.$watch("blockchainLength", (val) => {
			console.log("Blockchain length changed:", val);
			if (this.loaded && !this.processingBlock && !this.busesMoving) {
				console.log("Checking new blocks...");
				this.checkNewBlocks();
			} else {
				console.log(
					"Skipping block check - loaded:",
					this.loaded,
					"processing:",
					this.processingBlock,
					"buses moving:",
					this.busesMoving
				);
			}
		});

		// Start monitoring for new blocks
		this.checkBlockInterval();
	}

	checkNewBlocks() {
		console.log("Checking for new blocks...");
		console.log("Blockchain length:", this.blockchain ? this.blockchain.length : 0);
		console.log("Active buses:", this.buses ? this.buses.countActive() : 0);
		super.checkNewBlocks();
	}

	calcBusHeightFromBlock(block) {
		return 40; // Fixed height for all blocks
	}

	update() {
		this.streetUpdate();
	}

	// Called when the street resumes
	afterResume() {
		console.log("Street resumed");
	}

	// Override newTx to ensure transactions are properly handled
	newTx(data, status = "new", addPerson = true, addToVue = true) {
		console.log("New transaction received:", data.tx);
		const result = super.newTx(data, status, addPerson, addToVue);
		if (result) {
			// If we have transactions but no buses, create one
			if (this.buses && this.buses.countActive() === 0) {
				console.log("Creating bus for new transaction");
				this.addBus();
			}
		}
		return result;
	}

	// Override sortBuses to maintain at least one bus
	sortBuses() {
		super.sortBuses();

		// If no active buses, create one
		if (this.buses && this.buses.countActive() === 0) {
			console.log("No active buses, creating one");
			const bus = this.addBus();
			// Set a small loaded value to prevent immediate removal
			bus.loaded = 1;
			bus.realLoaded = 1;
		}
	}

	// Override lineToBlock to ensure transactions are properly loaded into buses
	lineToBlock(data) {
		console.log("Processing block:", data.height);
		if (typeof data.txFull === "undefined" || !data.txFull) {
			console.log("No transactions in block");
			return false;
		}

		// Get or create a bus for this block
		let bus = this.getBusFromId(data.height);
		if (!bus) {
			console.log("Creating new bus for block:", data.height);
			bus = this.addBus();
			bus.setData("id", data.height);
		}

		// Process transactions in the block
		const tx = Object.keys(data.txFull);
		console.log("Processing", tx.length, "transactions");
		for (let i = 0; i < tx.length; i++) {
			const hash = tx[i];
			if (this.lineManager[hash]) {
				let entry = this.lineManager[hash];
				if (bus) {
					bus.tx.push(entry.txData);
					bus.loaded += entry.modSize || 0;
				}
				entry.leavingForBlock = data.height;
				entry.destination = data.height;
				entry.status = "on_bus";
				entry.boarded = data.height;
			} else {
				// Create new transaction entry
				this.newTx(data.txFull[hash], "new", true, false);
				let entry = this.lineManager[hash];
				if (entry && bus) {
					bus.tx.push(entry.txData);
					bus.loaded += entry.modSize || 0;
					entry.leavingForBlock = data.height;
					entry.destination = data.height;
					entry.status = "on_bus";
					entry.boarded = data.height;
				}
			}
		}

		// Update bus state
		if (bus) {
			console.log("Bus loaded with", bus.tx.length, "transactions, size:", bus.loaded);
			bus.realLoaded = bus.loaded;
			this.busInsideSingle(bus);
		}

		return true;
	}
}

XIONStreet.config = XION;
s;
