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
		this.maxSizePplToLoad = 2000000;
		this.streetInit();
		this.stringLengths = {
			tx: [64],
			address: [34, 42],
		};
		this.sizeVar = "s";
		this.medianFeeStat = "medianFee-gasPrice";
		this.vueTxFormat = [
			{
				title: () => {
					return i18n.t(this.ticker.toLowerCase() + ".gp");
				},
				key: "gp",
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

	beforeNewTx(tx) {
		// if (tx.h == "coinjoin") {
		// 	tx.char = "flash";
		// } else if (tx.h == "privatesend") {
		// 	tx.char = "ps";
		// } else {
		// 	tx.char = "xion";
		// }

		// Ensure transaction has size and fee values
		if (!tx.size) tx.size = 250;
	}

	preload() {}

	create() {
		super.create();

		this.streetCreate();
		this.vue.busFeeTitle = "XION";
		this.vue.busFeeTitleLong = () => {
			return i18n.t(this.ticker.toLowerCase() + ".spb");
		};
		this.vue.sizeTitle = () => {
			return i18n.t(this.ticker.toLowerCase() + ".sizeTitle");
		};

		// Create buses with blockchain monitoring
		console.log("Creating buses");

		this.createBuses();
		console.log("Bus group created, buses count:", this.buses ? this.buses.countActive() : 0);

		// Start monitoring for blockchain data and bus creation
		// this.monitorBlockchainAndBuses();
		this.createInitialBus();
		// Initialize other components
		this.xionBuses();
		this.createPeople();

		// Watch for blockchain updates
		this.vue.$watch("blockchainLength", (val) => {
			// this.calcHalving();

			// Process blocks when blockchain updates
			if (this.loaded && !this.processingBlock && !this.busesMoving) {
				this.checkNewBlocks();
			}
		});

		this.calcHalving();

		// Set initial traffic light color
		if (this.stoplight) {
			this.stoplight.setLight("red");
		}
	}

	calcHalving(numberOfCountdowns = 10) {
		// Set the first countdown date to March 16, 2025
		const startDate = new Date(2025, 2, 16); // Month is 0-indexed (0=Jan, 1=Feb, 2=Mar)

		// Array to store all countdown dates
		const countdownDates = [];

		// Calculate all the countdown dates
		for (let i = 0; i < numberOfCountdowns; i++) {
			// For the first countdown, use the start date
			// For subsequent countdowns, add 9.125 days to the previous date
			if (i === 0) {
				countdownDates.push(new Date(startDate));
			} else {
				// Calculate the new date by adding 9.125 days to the previous date
				const previousDate = new Date(countdownDates[i - 1]);

				// Convert 9.125 days to milliseconds (9.125 * 24 * 60 * 60 * 1000)
				const daysInMs = 9.125 * 24 * 60 * 60 * 1000;

				// Add the time to the previous date
				const newDate = new Date(previousDate.getTime() + daysInMs);
				countdownDates.push(newDate);
			}
		}

		// Format the dates for output
		const formattedDates = countdownDates.map((date, index) => {
			const day = date.getDate();
			const month = date.toLocaleString("default", { month: "long" });
			const year = date.getFullYear();

			// Add suffix to day number (1st, 2nd, 3rd, etc.)
			const daySuffix = this.getDaySuffix(day);

			return {
				countdown: index + 1,
				date: `${day}${daySuffix} ${month}`,
			};
		});
		console.log("Halving countdowns:", formattedDates);
		return formattedDates;
	}

	// Helper function to get the correct suffix for a day number
	getDaySuffix(day) {
		if (day > 3 && day < 21) return "th";

		switch (day % 10) {
			case 1:
				return "st";
			case 2:
				return "nd";
			case 3:
				return "rd";
			default:
				return "th";
		}
	}
	// Add this method to monitor blockchain state and create buses when ready
	monitorBlockchainAndBuses() {
		// If blockchain is loaded but we have no buses, create one
		if (this.blockchain && this.blockchain.length > 0 && (!this.buses || this.buses.countActive() === 0)) {
			console.log(
				"Blockchain loaded, creating bus. Block height:",
				this.blockchain[this.blockchain.length - 1].height
			);
			this.createInitialBus();
		} else {
			// Log current state for debugging
			if (this.debug) {
				console.log("Monitoring blockchain and buses:");
				console.log("- Blockchain ready:", this.blockchain && this.blockchain.length > 0);
				console.log("- Buses active:", this.buses && this.buses.countActive() > 0);
			}
			this.createInitialBus();
		}
	}

	// Method to safely create initial bus
	createInitialBus() {
		console.log("Creating initial bus directly");

		if (!this.buses) {
			console.error("Buses group is not initialized!");
			return;
		}

		// Check if blockchain exists and has blocks
		if (this.blockchain.length === 0) {
			console.log("Blockchain not ready, scheduling another attempt");
			this.time.addEvent({
				delay: 200,
				callback: this.createInitialBus,
				callbackScope: this,
			});
			return;
		}

		// 	console.log("Active buses:", this.buses.countActive());
		// 	console.log("Blockchain latest height:", this.blockchain[this.blockchain.length - 1].height);

		// Try to get a bus from the group
		let bus = this.buses.get();
		if (bus) {
			try {
				console.log("Got a bus object from pool");
				bus.newBus(true);
				console.log("Bus initialized with ID:", bus.getData("id"));

				// Call the bus's own moveToStop method when creating a new bus

				// console.error("Bus doesn't have moveToStop method");
				// Explicitly position the bus as fallback
				// bus.y = this.busStop + toRes(140);
				// if (bus.busFloor) {
				// 	bus.busFloor.y = bus.y - toRes(100);
				// }
				// bus.setVisible(true);
			} catch (error) {
				console.error("Error initializing bus:", error);
			}
		} else {
			console.error("Failed to get bus from pool");
		}
	}

	// We're not implementing moveToStop here since we're using the one from bus.js

	// Example usage:
	// const countdowns = calcHalving(5);
	// countdowns.forEach(item => {
	//     console.log(`Countdown ${item.countdown}: ${item.date}`);
	// });

	// Create and initialize bus-related groups
	xionBuses() {
		console.log("xionBuses called");
		// Initialize busesLeaving group if it doesn't exist
		if (!this.busesLeaving) {
			this.busesLeaving = this.add.group();
		}

		// Set a fixed bus capacity if not defined
		if (typeof this.config.busCapacity === "undefined" || !this.config.busCapacity) {
			this.config.busCapacity = 1000000;
		}
	}

	// Use a fixed height for all buses
	calcBusHeight(size) {
		return 40; // Fixed height for visibility
	}

	calcBusHeightFromBlock(block) {
		return 40; // Fixed height for all blocks
	}

	// Set person scaling based on transaction size
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

	update() {
		this.streetUpdate();
		for (let i = this.movingPeople.length - 1; i >= 0; i--) {
			let person = this.movingPeople[i];
			if (person && person.halo) {
				let halo = person.halo;
				halo.x = person.x;
				halo.y = person.y - person.displayHeight / 2;
				let toPass = mirrorX(256, this.side);
				let passed =
					(person.x < toPass && this.side === "right") || (person.x > toPass && this.side !== "right");
				if (passed && !halo.deleting) {
					halo.deleting = true;
					this.add.tween({
						targets: [halo],
						duration: 500 * window.txStreetPhaser.streetController.fpsTimesFaster,
						alpha: {
							getStart: () => 0.7,
							getEnd: () => 0,
						},
						onComplete: () => {
							if (halo) halo.destroy();
							if (person) delete person.halo;
						},
					});
				}
			}
		}
	}

	// Update live blocks and confirmation time
	updateLiveBlocks(block) {
		if (!block) return;

		// Update live blocks array
		this.config.liveBlocks.push(block);

		// Keep only the last N blocks
		if (this.config.liveBlocks.length > this.config.maxBlocksToKeep) {
			this.config.liveBlocks.shift();
		}

		// Update last block stat
		if (this.vue && this.vue.stats && this.vue.stats["lastBlock"]) {
			this.vue.stats["lastBlock"].value = block.height;
		}

		// Emit block update event
		if (typeof eventHub !== "undefined" && eventHub.$emit) {
			eventHub.$emit("addBlock-" + this.config.ticker, block);
		}
	}

	// Override fillBusesAndLeave to update live blocks
	// fillBusesAndLeave(block, statusOnly = false) {
	// 	if (!block) return false;

	// 	// Update live blocks first
	// 	// this.updateLiveBlocks(block);

	// 	let blockBus = this.getBusFromId(block.height);
	// 	if (!blockBus) {
	// 		if (this.debug) console.log("No bus found for block:", block.height);
	// 		return false;
	// 	}

	// 	blockBus.loaded = typeof block.size === "undefined" || !block.size ? 0 : block.size;

	// 	if (statusOnly) {
	// 		blockBus.setData("leaving", true);
	// 		let sizeInMB = +(block.size / 1000000).toFixed(3) + " MB";
	// 		blockBus.text2.setText(sizeInMB);
	// 		blockBus.text3.setText("");

	// 		// Turn light green when bus is ready to leave
	// 		if (this.stoplight) {
	// 			this.stoplight.setLight("green");
	// 		}
	// 	} else {
	// 		// Call leave method to start movement
	// 		if (blockBus.leave) {
	// 			blockBus.leave(block);
	// 		}
	// 	}

	// 	return true;
	// }

	// Called after a person enters a bus
	// afterEnterBus(array) {
	// 	if (!array || array.length < 2) return;

	// 	let person = array[0];
	// 	let bus = array[1];
	// 	let txData = person.getLineData("txData");
	// }

	// // Called after the bus height changes
	// afterMoveLength(arr) {
	// 	if (!arr || arr.length < 4) return;

	// 	let bus = arr[0];
	// 	let duration = arr[1];
	// 	let value = arr[2];
	// 	let difference = arr[3];
	// }

	// // Called when the street resumes
	// afterResume() {
	// 	console.log("Street resumed");

	// 	// Start monitoring blockchain and buses
	// 	this.monitorBlockchainAndBuses();

	// 	// Check for blocks to process
	// 	if (this.loaded && !this.processingBlock && !this.busesMoving) {
	// 		this.checkNewBlocks();
	// 	}
	// }

	// Called when a bus is destroyed
	afterByeBus(bus) {
		console.log("Bus destroyed:", bus ? bus.getData("id") : "unknown");

		// Only create a new bus if all buses are gone
		// Don't use a timer as it can cause cycling issues
		if (this.buses && this.buses.countActive() === 0) {
			console.log("No active buses after one was destroyed, creating new one");

			// Check if we're actually allowed to create a new bus now
			if (!this.blockFactory || !this.blockFactory.processing) {
				this.createInitialBus();
			} else {
				console.log("Block processing in progress, waiting to create bus");

				// Wait for block processing to finish before creating a new bus
				this.time.addEvent({
					delay: 3000, // Longer delay to avoid rapid cycling
					callback: () => {
						if (this.buses.countActive() === 0) {
							this.createInitialBus();
						}
					},
					callbackScope: this,
				});
			}
		}
	}

	// Called after a transaction is loaded onto a bus
	// afterSortBusesLoadTx(array) {
	// 	if (!array || array.length < 2) return;

	// 	let entry = array[0];
	// 	let bus = array[1];

	// 	// Track additional metrics
	// 	if (entry.txData && entry.txData.rs) {
	// 		bus.loadedAlt += entry.txData.rs;
	// 	}
	// }
}

XIONStreet.config = XION;
