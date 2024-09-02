import { Street } from "../street.js";
import { toRes, getSheetKey } from "../utils/";
import { DASH } from "../config.js";
import { fds, default as i18n } from "../../i18n";
import { add } from "date-fns";

export default class DASHStreet extends Street {
	constructor(side) {
		super(DASH, side);
	}

	init() {
		this.foundBoarding = false;
		this.busStop = toRes(200);
		this.busDoorFromTop = toRes(42);
		this.personPixelsPerSecond = 3;
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
	}

	preload() {}

	create() {
		super.create();
		this.createPeople();
		this.streetCreate();
		this.vue.busFeeTitle = "Sat/B";
		(this.vue.busFeeTitleLong = () => {
			return i18n.t(this.ticker.toLowerCase() + ".spb");
		}),
			(this.vue.sizeTitle = () => {
				return i18n.t(this.ticker.toLowerCase() + ".sizeTitle");
			}),
			(this.vue.sizeAltTitle = () => {
				return i18n.t(this.ticker.toLowerCase() + ".sizeAltTitle");
			}),
			this.createBuses();

		this.vue.$watch("blockchainLength", (val) => {
			this.calcHalving(val);
		});
		this.calcHalving(this.blockchain.length);
	}

	calcHalving(val) {
		if (!this.blockchain.length) return;
		let recentBlock = this.blockchain[val - 1];
		let height = recentBlock.height;
		let halvingHeight = 0;
		while (halvingHeight < height) {
			halvingHeight += 210240;
		}
		let blocksUntilHalving = halvingHeight - height;
		let secondsUntilHalving = blocksUntilHalving * 150;
		this.vue.stats["halving"].value = fds(add(new Date(), { seconds: secondsUntilHalving }), new Date(), {
			roundingMethod: "floor",
			addSuffix: true,
		});
	}

	update() {
		this.streetUpdate();
	}

	afterEnterBus(array) {
		let person = array[0];
		let bus = array[1];
		let txData = person.getLineData("txData");
	}

	afterMoveLength(arr) {
		let bus = arr[0];
		let duration = arr[1];
		let difference = arr[3];
	}

	afterResume() {}

	afterSortBusesLoadTx(array) {
		let entry = array[0];
		let bus = array[1];

		bus.loadedAlt += entry.txData.rs;
	}
}

DASHStreet.config = DASH;
