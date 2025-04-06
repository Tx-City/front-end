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
		this.createPeople();
		this.createInitialBus();
	}

	// Method to safely create initial bus
	createInitialBus() {
		// Try to get a bus from the group
		let bus = this.buses.get();
		console.log("Bus from pool:", bus);
		if (bus) {
			try {
				console.log("Got a bus object from pool");
				bus.newBus(true);
				console.log("Bus initialized with ID:", bus.getData("id"));

				// bus.setVisible(true);
			} catch (error) {
				console.error("Error initializing bus:", error);
			}
		} else {
			console.error("Failed to get bus from pool");
		}
	}

	calcBusHeightFromBlock(block) {
		return 40; // Fixed height for all blocks
	}

	update() {
		this.streetUpdate();
	}

	// Called when the street resumes
	afterResume() {
		this.createInitialBus();
		console.log("Street resumed");
	}
}

XIONStreet.config = XION;
