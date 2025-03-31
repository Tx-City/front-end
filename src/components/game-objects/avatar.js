import Phaser from "phaser";
import { getSheetKey } from "./../utils/";
import { web3 } from "../../wallet";

const Avatar = new Phaser.Class({
	Extends: Phaser.GameObjects.Container,
	initialize: function Avatar(scene, side, x, y, key) {
		Phaser.GameObjects.Container.call(this, scene, 0, 0);
		this.scene = scene;
		this.x = x;
		this.y = y;
		this.key = key;
		this.side = side;
		this.transferAmount = "0.001";
		this.activeInput = null;

		this.hiddenTextArea = document.createElement("textarea");
		this.hiddenTextArea.style.position = "absolute";
		this.hiddenTextArea.style.left = "-9999px";
		this.hiddenTextArea.style.top = "0";
		document.body.appendChild(this.hiddenTextArea);

		this.myAvatar = this.scene.add.sprite(x, y, key).setScale(1.5);
		this.myAvatar.setTexture(getSheetKey("person-"), key);

		const transferButton = this.scene.add
			.text(x - 100, y - 20, "TRANSFER", {
				backgroundColor: "#ffffff",
				padding: { x: 10, y: 5 },
				fontSize: "16px",
				color: "#000000",
				align: "center",
			})
			.setInteractive();

		const bridgeButton = this.scene.add
			.text(x + 40, y - 20, "BRIDGETX", {
				backgroundColor: "#ffffff",
				padding: { x: 10, y: 5 },
				fontSize: "16px",
				color: "#000000",
				align: "center",
			})
			.setInteractive();

		this.popup = this.scene.add.container(400, 300).setVisible(false);

		this.popup.setDepth(1000);

		const bg = this.scene.add.rectangle(0, 0, 800, 600, 0x000000, 0.7);
		bg.setOrigin(0.5);

		const panel = this.scene.add.rectangle(0, 0, 400, 300, 0xffffff);
		panel.setStrokeStyle(2, 0x000000);

		const createInputField = (y) => {
			const field = this.scene.add.rectangle(0, y, 320, 40, 0xf0f0f0);
			field.setStrokeStyle(1, 0x999999);
			return field;
		};

		const walletField = createInputField(-40);
		const amountField = createInputField(30);

		const walletLabel = this.scene.add.text(-190, -80, "Wallet Address:", {
			fontSize: "18px",
			color: "#000000",
			fontFamily: "Arial",
		});

		const amountLabel = this.scene.add.text(-190, -10, "Amount (ETH):", {
			fontSize: "18px",
			color: "#000000",
			fontFamily: "Arial",
		});

		this.walletInput = this.scene.add
			.text(-150, -50, "", {
				fontSize: "16px",
				color: "#000000",
				fontFamily: "Arial",
				fixedWidth: 280,
				padding: { x: 5, y: 5 },
			})
			.setInteractive();

		this.amountInput = this.scene.add
			.text(-150, 20, "", {
				fontSize: "16px",
				color: "#000000",
				fontFamily: "Arial",
				fixedWidth: 280,
				padding: { x: 5, y: 5 },
			})
			.setInteractive();

		this.walletInput.on("pointerdown", () => {
			this.activeInput = this.walletInput;
			walletField.setStrokeStyle(2, 0x0000ff);
			amountField.setStrokeStyle(1, 0x999999);
			this.hiddenTextArea.focus();
		});

		this.amountInput.on("pointerdown", () => {
			this.activeInput = this.amountInput;
			amountField.setStrokeStyle(2, 0x0000ff);
			walletField.setStrokeStyle(1, 0x999999);
			this.hiddenTextArea.focus();
		});

		this.hiddenTextArea.addEventListener("paste", (e) => {
			e.preventDefault();
			if (this.activeInput) {
				const pastedText = e.clipboardData.getData("text");
				this.activeInput.text = pastedText;
			}
		});

		bg.setInteractive();
		panel.setInteractive();
		bg.on("pointerdown", () => {
			this.activeInput = null;
			walletField.setStrokeStyle(1, 0x999999);
			amountField.setStrokeStyle(1, 0x999999);
			this.hiddenTextArea.blur();
		});
		panel.on("pointerdown", () => {
			this.activeInput = null;
			walletField.setStrokeStyle(1, 0x999999);
			amountField.setStrokeStyle(1, 0x999999);
			this.hiddenTextArea.blur();
		});

		const sendButton = this.scene.add.container(0, 90);
		const sendBg = this.scene.add.rectangle(0, 0, 120, 40, 0x4caf50);
		const sendText = this.scene.add.text(-25, -12, "SEND", {
			fontSize: "18px",
			color: "#ffffff",
			fontFamily: "Arial",
		});
		sendButton.add([sendBg, sendText]);
		sendButton.setInteractive(new Phaser.Geom.Rectangle(-60, -20, 120, 40), Phaser.Geom.Rectangle.Contains);

		const closeButton = this.scene.add.container(170, -120);
		const closeBg = this.scene.add.rectangle(0, 0, 30, 30, 0xff5555);
		const closeText = this.scene.add.text(-5, -12, "×", {
			fontSize: "24px",
			color: "#ffffff",
			fontFamily: "Arial",
		});
		closeButton.add([closeBg, closeText]);
		closeButton.setInteractive(new Phaser.Geom.Rectangle(-15, -15, 30, 30), Phaser.Geom.Rectangle.Contains);

		sendButton.on("pointerover", () => {
			sendBg.setFillStyle(0x45a049);
		});
		sendButton.on("pointerout", () => {
			sendBg.setFillStyle(0x4caf50);
		});

		closeButton.on("pointerover", () => {
			closeBg.setFillStyle(0xff0000);
		});
		closeButton.on("pointerout", () => {
			closeBg.setFillStyle(0xff5555);
		});

		this.popup.add([
			bg,
			panel,
			walletField,
			amountField,
			walletLabel,
			amountLabel,
			this.walletInput,
			this.amountInput,
			sendButton,
			closeButton,
		]);

		this.scene.input.keyboard.on("keydown", (event) => {
			if (!this.popup.visible || !this.activeInput) return;

			if ((event.metaKey || event.ctrlKey) && event.key === "v") {
				navigator.clipboard
					.readText()
					.then((text) => {
						if (this.activeInput) {
							this.activeInput.text = text;
						}
					})
					.catch((err) => console.error("Failed to read clipboard:", err));
				return;
			}

			if (event.keyCode === 8) {
				this.activeInput.text = this.activeInput.text.slice(0, -1);
			} else if (event.key.length === 1) {
				this.activeInput.text += event.key;
			}
		});

		sendButton.on("pointerdown", () => {
			const address = this.walletInput.text;
			const amount = this.amountInput.text;
			if (address && amount) {
				this.popup.setVisible(false);
				this.initiateTransfer(address, amount);
			}
		});

		closeButton.on("pointerdown", () => {
			this.popup.setVisible(false);
		});

		transferButton.on("pointerdown", () => {
			console.log("Transfer clicked!");
			this.popup.setVisible(true);
			this.walletInput.text = "";
			this.amountInput.text = "";
			this.activeInput = null;
		});

		bridgeButton.on("pointerdown", () => {
			console.log("BridgeTX clicked!");
		});

		[transferButton, bridgeButton].forEach((button) => {
			button.on("pointerover", () => {
				button.setStyle({ backgroundColor: "#e0e0e0" });
			});
			button.on("pointerout", () => {
				button.setStyle({ backgroundColor: "#ffffff" });
			});
		});

		this.add([this.myAvatar, transferButton, bridgeButton, this.popup]);
		this.scene.add.existing(this);

		this.transferButton = transferButton;
		this.bridgeButton = bridgeButton;

		this.updateButtonPositions = () => {
			this.transferButton.setPosition(this.x - 100, this.y - 20);
			this.bridgeButton.setPosition(this.x + 40, this.y - 20);
		};

		this.scene.events.on("destroy", () => {
			document.body.removeChild(this.hiddenTextArea);
		});
	},

	initiateTransfer: async function (toAddress, amount) {
		try {
			if (!web3 || !web3.eth) {
				console.error("Web3 not properly initialized");
				return;
			}

			const accounts = await web3.eth.getAccounts();
			if (!accounts || !accounts[0]) {
				console.error("No wallet connected");
				return;
			}

			const amountInWei = web3.utils.toWei(amount, "ether");
			const transactionParameters = {
				to: toAddress,
				from: accounts[0],
				value: amountInWei,
				gas: "21000",
			};

			console.log("Initiating transfer:", transactionParameters);
			const txHash = await web3.eth.sendTransaction(transactionParameters);
			console.log("Transaction successful:", txHash);
		} catch (error) {
			console.error("Transfer error:", error);
		}
	},

	setupControls: function (scene) {
		scene.input.keyboard.on("keydown-S", () => {
			this.y += 5;
			this.myAvatar.y = this.y;
			this.myAvatar.anims.play("walk_down_2", true);
			this.updateButtonPositions();
		});

		scene.input.keyboard.on("keydown-W", () => {
			this.y -= 5;
			this.myAvatar.y = this.y;
			this.myAvatar.anims.play("walk_up_2", true);
			this.updateButtonPositions();
		});

		scene.input.keyboard.on("keydown-D", () => {
			this.x += 5;
			this.myAvatar.x = this.x;
			this.myAvatar.setFlipX(true);
			this.myAvatar.anims.play("walk_side_2", true);
			this.updateButtonPositions();
		});

		scene.input.keyboard.on("keydown-A", () => {
			this.x -= 5;
			this.myAvatar.x = this.x;
			this.myAvatar.setFlipX(false);
			this.myAvatar.anims.play("walk_side_2", true);
			this.updateButtonPositions();
		});
	},
});

export default Avatar;
