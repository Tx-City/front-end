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
		this.transferAmount = "0.001"; // Default transfer amount in ETH

		// Create the avatar sprite and center it
		this.myAvatar = this.scene.add.sprite(x, y, key).setScale(1.5);
		this.myAvatar.setTexture(getSheetKey("person-"), key);

		// Create Transfer button - positioned left
		const transferButton = this.scene.add
			.text(x - 100, y - 20, "TRANSFER", {
				backgroundColor: "#ffffff",
				padding: { x: 10, y: 5 },
				fontSize: "16px",
				color: "#000000",
				align: "center",
			})
			.setInteractive();

		// Create BridgeTX button - positioned right
		const bridgeButton = this.scene.add
			.text(x + 40, y - 20, "BRIDGETX", {
				backgroundColor: "#ffffff",
				padding: { x: 10, y: 5 },
				fontSize: "16px",
				color: "#000000",
				align: "center",
			})
			.setInteractive();

		// Add hover effects
		[transferButton, bridgeButton].forEach((button) => {
			button.on("pointerover", () => {
				button.setStyle({ backgroundColor: "#e0e0e0" });
			});
			button.on("pointerout", () => {
				button.setStyle({ backgroundColor: "#ffffff" });
			});
		});

		// Add click handlers
		transferButton.on("pointerdown", () => {
			console.log("Transfer clicked!");
			this.initiateTransfer();
		});

		bridgeButton.on("pointerdown", () => {
			console.log("BridgeTX clicked!");
			// Add bridge functionality here
		});

		// Add everything to the container
		this.add([this.myAvatar, transferButton, bridgeButton]);
		this.scene.add.existing(this);

		// Store buttons for position updates
		this.transferButton = transferButton;
		this.bridgeButton = bridgeButton;

		// Update button positions when avatar moves
		this.updateButtonPositions = () => {
			this.transferButton.setPosition(this.x - 100, this.y - 20);
			this.bridgeButton.setPosition(this.x + 40, this.y - 20);
		};
	},
});

Avatar.prototype.initiateTransfer = async function () {
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

		const amountInWei = web3.utils.toWei(this.transferAmount, "ether");
		const transactionParameters = {
			to: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
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
};

Avatar.prototype.setupControls = function (scene) {
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
};

export default Avatar;
