import { Street } from "../street.js";
import { mirrorX, toRes, getSheetKey } from "../utils/";
import { EVOLUTION } from "../config.js";
import { fds, default as i18n } from "../../i18n";
import { add } from "date-fns";

export default class EVOLUTIONStreet extends Street {
	constructor(side) {
		super(EVOLUTION, side);
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

	beforeNewTx(tx) {
		// if (tx.h == "coinjoin") {
		// 	tx.char = "flash";
		// } else if (tx.h == "privatesend") {
		// 	tx.char = "ps";
		// } else {
		// 	tx.char = "evolution";
		// }

		// Ensure transaction has size and fee values
		if (!tx.size) tx.size = 250;
	}

	preload() {}

	create() {
		super.create();

		this.streetCreate();
		this.vue.busFeeTitle = "Duff/B";
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
		this.monitorBlockchainAndBuses();

		// Initialize other components
		this.evolutionBuses();
		this.createPeople();

		// Watch for blockchain updates
		this.vue.$watch("blockchainLength", (val) => {
			this.calcHalving(val);

			// Process blocks when blockchain updates
			if (this.loaded && !this.processingBlock && !this.busesMoving) {
				this.checkNewBlocks();
			}
		});

		this.calcHalving(this.blockchain ? this.blockchain.length : 0);

		// Set initial traffic light color
		if (this.stoplight) {
			this.stoplight.setLight("red");
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

			// Schedule another check in a moment
			this.time.addEvent({
				delay: 100,
				callback: this.monitorBlockchainAndBuses,
				callbackScope: this,
			});
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
		if (!this.blockchain || this.blockchain.length === 0) {
			console.log("Blockchain not ready, scheduling another attempt");
			this.time.addEvent({
				delay: 200,
				callback: this.createInitialBus,
				callbackScope: this,
			});
			return;
		}

		console.log("Active buses:", this.buses.countActive());
		console.log("Blockchain latest height:", this.blockchain[this.blockchain.length - 1].height);

		// Try to get a bus from the group
		let bus = this.buses.get();
		if (bus) {
			try {
				console.log("Got a bus object from pool");
				bus.newBus(true);
				console.log("Bus initialized with ID:", bus.getData("id"));

				// Explicitly position the bus
				bus.y = this.busStop + toRes(140);
				if (bus.busFloor) {
					bus.busFloor.y = bus.y - toRes(100);
				}
				bus.setVisible(true);
			} catch (error) {
				console.error("Error initializing bus:", error);
			}
		} else {
			console.error("Failed to get bus from pool");
		}
	}

	calcHalving(val) {
		if (!this.blockchain || !this.blockchain.length) return;
		let recentBlock = this.blockchain[val - 1];
		if (!recentBlock) return;

		let height = recentBlock.height;
		let halvingHeight = 0;
		while (halvingHeight < height) {
			halvingHeight += 210240;
		}
		let blocksUntilHalving = halvingHeight - height;
		let secondsUntilHalving = blocksUntilHalving * 150;

		if (this.vue && this.vue.stats && this.vue.stats["halving"]) {
			this.vue.stats["halving"].value = fds(add(new Date(), { seconds: secondsUntilHalving }), new Date(), {
				roundingMethod: "floor",
				addSuffix: true,
			});
		}
	}

	// Create and initialize bus-related groups
	evolutionBuses() {
		console.log("evolutionBuses called");
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
		return 80; // Fixed height for visibility
	}

	calcBusHeightFromBlock(block) {
		return 80; // Fixed height for all blocks
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

	// Override checkView to safely handle visibility
	checkView() {
		try {
			const cameraY = this.cameras.main.scrollY;
			const cameraHeight = this.cameras.main._height;
			const bottom = cameraY + cameraHeight;

			// Process buses
			if (this.buses && this.buses.children && this.buses.children.entries) {
				const topMeasure = cameraY - toRes(50);
				const bottomMeasure = bottom + toRes(100);

				for (let i = 0; i < this.buses.children.entries.length; i++) {
					try {
						let bus = this.buses.children.entries[i];
						if (!bus || !bus.active) continue;
						if (!bus.bottomSpriteName || !bus.busTopSprite) continue;

						if (
							bus[bus.bottomSpriteName].getBottomLeft(null, true).y < topMeasure ||
							bus.busTopSprite.getTopLeft(null, true).y > bottomMeasure
						) {
							if (bus.visible) {
								bus.setVisible(false);
								if (bus.busFloor) bus.busFloor.setVisible(false);
								if (typeof this.busInsideSingle === "function") this.busInsideSingle(bus);
							}
						} else {
							if (!bus.visible) {
								bus.setVisible(true);
								if (bus.busFloor) bus.busFloor.setVisible(true);
								if (typeof this.busInsideSingle === "function") this.busInsideSingle(bus);
							}
						}
					} catch (e) {
						console.warn("Error processing bus in checkView", e);
					}
				}
			}

			// Process people
			if (this.people && this.people.children && this.people.children.entries) {
				const topMeasure = cameraY - toRes(15);
				const bottomMeasure = bottom + toRes(50);

				for (let i = 0; i < this.people.children.entries.length; i++) {
					try {
						let person = this.people.children.entries[i];
						if (!person || !person.isInUse) continue;
						if (!person.isInUse()) continue;

						if (person.y < topMeasure || person.y > bottomMeasure) {
							if (person.status == "teleporting") continue;
							if (person.visible) {
								person.setOffScreen();
							}
						} else {
							if (!person.visible) {
								person.setOnScreen();
							}
						}
					} catch (e) {
						console.warn("Error processing person in checkView", e);
					}
				}
			}
		} catch (error) {
			console.warn("Error in checkView:", error);
		}
	}

	// Override setCrowdY to add safety checks
	setCrowdY(y) {
		if (!this.crowd) {
			// Return without error if crowd doesn't exist
			return false;
		}

		if (y === this.crowd.rawY) return false;
		if (y < this.crowd.rawY) {
			if (!this.crowd.changeLowerCount) this.crowd.changeLowerCount = 0;
			this.crowd.changeLowerCount++;
			if (this.crowd.changeLowerCount < 10) return false;
		}
		this.crowd.changeLowerCount = 0;
		this.crowd.y = y + toRes(100);
		this.crowd.rawY = y;
		if (this.crowd.y < toRes(1000)) this.crowd.y = toRes(1000);
		this.crowd.y = Math.ceil(this.crowd.y / toRes(50)) * toRes(50);

		// Add safety checks for crowd components
		if (this.crowdSign) {
			this.crowdSign.y = this.crowd.y - toRes(30);
			this.crowdSign.x = this.crowd.x;
		}

		// Call checkView safely
		try {
			this.checkView();
		} catch (error) {
			console.warn("Error in checkView called from setCrowdY:", error);
		}
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

	// Override fillBusesAndLeave to ensure buses move properly and light transitions work
	fillBusesAndLeave(block, statusOnly = false) {
		if (!block) return false;

		let blockBus = this.getBusFromId(block.height);
		if (!blockBus) {
			if (this.debug) console.log("No bus found for block:", block.height);
			return false;
		}

		blockBus.loaded = typeof block.size === "undefined" || !block.size ? 0 : block.size;

		if (statusOnly) {
			blockBus.setData("leaving", true);
			let sizeInMB = +(block.size / 1000000).toFixed(3) + " MB";
			blockBus.text2.setText(sizeInMB);
			blockBus.text3.setText("");

			// Turn light green when bus is ready to leave
			if (this.stoplight) {
				this.stoplight.setLight("green");
			}
		} else {
			// Call leave method to start movement
			if (blockBus.leave) {
				blockBus.leave(block);
			}
		}

		return true;
	}

	// Called after a person enters a bus
	afterEnterBus(array) {
		if (!array || array.length < 2) return;

		let person = array[0];
		let bus = array[1];
		let txData = person.getLineData("txData");
	}

	// Called after the bus height changes
	afterMoveLength(arr) {
		if (!arr || arr.length < 4) return;

		let bus = arr[0];
		let duration = arr[1];
		let value = arr[2];
		let difference = arr[3];
	}

	// Called when the street resumes
	afterResume() {
		console.log("Street resumed");

		// Start monitoring blockchain and buses
		this.monitorBlockchainAndBuses();

		// Check for blocks to process
		if (this.loaded && !this.processingBlock && !this.busesMoving) {
			this.checkNewBlocks();
		}
	}

	// Called when a bus is destroyed
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
	afterSortBusesLoadTx(array) {
		if (!array || array.length < 2) return;

		let entry = array[0];
		let bus = array[1];

		// Track additional metrics
		if (entry.txData && entry.txData.rs) {
			bus.loadedAlt += entry.txData.rs;
		}
	}

	// Override busLeavingUpdate to handle traffic light changes
	busLeavingUpdate() {
		if (!this.buses) return;

		// Get the last bus that's leaving
		let bus = this.lastBusLeaving();
		if (!bus) return false;

		// Check if past the bus stop and then set the light to yellow
		if (bus.y < this.busStop && !bus.hasTriggeredLight) {
			console.log("Bus passing stoplight, setting to yellow");
			if (this.stoplight) {
				this.stoplight.setLight("yellow");
			}
			bus.hasTriggeredLight = true;

			// Set light to red after a delay
			this.setRedLight = this.time.addEvent({
				delay: 2000 * window.txStreetPhaser.streetController.fpsTimesFaster,
				callback: () => {
					if (this.stoplight && this.stoplight.currentColor == "yellow") {
						this.setRedLight = null;
						console.log("Setting stoplight back to red");
						this.stoplight.setLight("red");
					}
				},
			});
		}
	}

	// Override scrollY to add safety checks
	scrollY(amount, reset = false) {
		// Check if we're in a follower focus mode
		if (this.isFollowerFocused && typeof this.isFollowerFocused === "function" && this.isFollowerFocused()) {
			if (!this.scrollWarnCount) this.scrollWarnCount = 0;
			this.scrollWarnCount++;
			if (this.scrollWarnCount > 15) {
				try {
					if (window.mainVue && window.mainVue.$toast) {
						window.mainVue.$toast.warning(
							{
								component: Notification,
								props: {
									title: "Stop tracking to scroll.",
								},
							},
							{
								position: "bottom-center",
								id: "track-scroll",
							}
						);
					}
				} catch (e) {
					console.warn("Error showing toast:", e);
				}
				this.scrollWarnCount = 0;
			}
			return false;
		}

		this.scrollWarnCount = 0;

		// Safety check to make sure cameras exist
		if (!this.cameras || !this.cameras.main) return false;

		if (this.cameras.main.scrollY + amount < 0 || reset) amount = -this.cameras.main.scrollY;

		// Calculate new boundaries safely
		let newHeight = toRes(960);
		if (window.innerWidth) {
			newHeight =
				((this.side == "full" ? toRes(960) : toRes(1920)) / window.innerWidth) *
				(window.innerHeight - (typeof config !== "undefined" ? config.vPadding : 0));
		}

		if (this.cameras.main.scrollY + newHeight + amount > this.sceneHeight)
			amount = this.sceneHeight - (this.cameras.main.scrollY + newHeight);

		let xPos = this.cameras.main.scrollX;
		let yPos = this.cameras.main.scrollY + amount;

		try {
			this.scrollTileSprites(amount, reset);
		} catch (e) {
			console.warn("Error in scrollTileSprites:", e);
		}

		this.cameras.main.setScroll(xPos, yPos);

		if (Math.abs(amount) > 4) {
			try {
				this.checkView();
			} catch (e) {
				console.warn("Error in checkView from scrollY:", e);
			}
		}

		if (this.events) {
			this.events.emit("scrollY", { amount: amount, reset: reset });
		}

		try {
			if (typeof eventHub !== "undefined" && eventHub.$emit) {
				eventHub.$emit("myScrollData", { cameraY: yPos, bottom: yPos + newHeight });
			}
		} catch (e) {
			console.warn("Error emitting scroll data:", e);
		}
	}
}

EVOLUTIONStreet.config = EVOLUTION;
