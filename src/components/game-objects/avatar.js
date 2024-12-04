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

		this.myAvatar = this.scene.add.sprite(x, y, key).setScale(1.5);
		this.myAvatar.setTexture(getSheetKey("person-"), key);
		this.myAvatar.setInteractive(); // Make the sprite interactive

		// Add click handler
		this.myAvatar.on("pointerdown", () => {
			console.log("Character clicked!");
			this.initiateTransfer();
		});

		this.add(this.myAvatar);
		this.scene.add.existing(this);
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
	});

	scene.input.keyboard.on("keydown-W", () => {
		this.y -= 5;
		this.myAvatar.y = this.y;
		this.myAvatar.anims.play("walk_up_2", true);
	});

	scene.input.keyboard.on("keydown-D", () => {
		this.x += 5;
		this.myAvatar.x = this.x;
		this.myAvatar.setFlipX(true);
		this.myAvatar.anims.play("walk_side_2", true);
	});

	scene.input.keyboard.on("keydown-A", () => {
		this.x -= 5;
		this.myAvatar.x = this.x;
		this.myAvatar.setFlipX(false);
		this.myAvatar.anims.play("walk_side_2", true);
	});
};

export default Avatar;
