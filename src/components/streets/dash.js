import { Street } from "../street.js";
import { mirrorX, toRes, toResRev, getSheetKey } from "../utils/";
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
	}
	beforeNewTx(tx) {
		tx.char = "flash";
	}
	preload() {}

	create() {
		super.create();

		this.streetCreate();
		this.vue.busFeeTitle = "Duff/B";
		(this.vue.busFeeTitleLong = () => {
			return i18n.t(this.ticker.toLowerCase() + ".spb");
		}),
			(this.vue.sizeTitle = () => {
				return i18n.t(this.ticker.toLowerCase() + ".sizeTitle");
			});
		this.createBuses();
		this.createPeople();
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

	newSetInitialPosition(person) {
		let count = this.inLineCount(true);
		let cords = this.getLineCords(count);
		let yPos;
		let xPos;
		//check that the house exists on the street
		yPos = this.busStop + (Math.random() * (cords[1] + toRes(500)));
		console.log(yPos)
		xPos = mirrorX(0, this.side);
		// if (yPos < this.busStop) {
		// 	yPos = 10;
		// 	xPos = mirrorX(Math.random() * 150 + 50, this.side);
		// }
		person.setPosition(xPos, yPos);
		person.halo = this.add.image(
			xPos,
			yPos - person.displayHeight / 2,
			getSheetKey("lightning.png"),
			"lightning.png"
		);
		person.halo.setScale(person.scale * 2);
		person.halo.setDepth(500);
		person.halo.setAlpha(0.7);
	}

	update() {
		this.streetUpdate();
		for (let i = this.movingPeople.length - 1; i >= 0; i--) {
			let person = this.movingPeople[i];
			if (person.halo) {
				let halo = person.halo;
				halo.x = person.x;
				halo.y = person.y - person.displayHeight / 2;
				let toPass = mirrorX(256, this.side);
				let passed =
					(person.x < toPass && this.side === "right") || (person.x > toPass && this.side !== "right");
				if (passed && !person.halo.deleting) {
					person.halo.deleting = true;
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
	}
}

DASHStreet.config = DASH;
