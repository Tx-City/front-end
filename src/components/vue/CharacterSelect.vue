<template>
	<div>
		<div class="has-text-right block">
			<connect />
		</div>
		<p class="block">
			Connect your wallet and choose a character that will represent you in TxCity. Clicking a character will
			initiate a transfer.
		</p>
		<div class="section has-text-centered" v-if="state.address">
			<div class="block char-button-container">
				<div
					v-for="character in availableCharacters"
					:key="character"
					@click="handleCharacterClick(character)"
					class="char-button button"
					:class="{ 'is-primary': selected === character, 'is-success': newSelected === character }"
				>
					<img :src="`/static/img/singles/characters/${character}-0.png?v=${process.env.VUE_APP_VERSION}`" />
				</div>
			</div>
			<div class="block has-text-centered">
				<button
					:disabled="!newSelected || newSelected === selected"
					@click="setCharacter"
					class="button is-success is-large"
				>
					Set Character
				</button>
			</div>
		</div>
	</div>
</template>

<script>
// @ts-nocheck
import { web3, init, default as state } from "../../wallet";
import Connect from "./Connect.vue";

export default {
	components: { Connect },
	data: function () {
		return {
			selected: "",
			newSelected: null,
			availableCharacters: ["person-1", "person-2", "person-3", "person-4", "person-5"],
			transferAmount: "0.001", // Default transfer amount in ETH
		};
	},
	methods: {
		async handleCharacterClick(character) {
			console.log("Character clicked:", character);
			try {
				if (!state.address) {
					alert("Please connect your wallet first");
					return;
				}

				if (!web3 || !web3.eth) {
					console.error("Web3 not properly initialized");
					alert("Web3 not properly initialized. Please make sure your wallet is connected.");
					return;
				}

				this.newSelected = character;

				// Ask for confirmation before initiating transfer
				if (confirm(`Would you like to send ${this.transferAmount} ETH to select this character?`)) {
					await this.initiateTransfer();
				}
			} catch (error) {
				console.error("Error in handleCharacterClick:", error);
				alert("Error handling character click. Please try again.");
			}
		},
		async initiateTransfer() {
			try {
				console.log("Initiating transfer with address:", state.address);

				// Convert ETH amount to Wei
				const amountInWei = web3.utils.toWei(this.transferAmount, "ether");
				console.log("Amount in Wei:", amountInWei);

				// Create transaction parameters
				const transactionParameters = {
					to: process.env.VUE_APP_RECIPIENT_ADDRESS || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
					from: state.address,
					value: amountInWei,
					gas: "21000", // Add explicit gas limit
				};

				console.log("Transaction parameters:", transactionParameters);

				// Request transaction
				const txHash = await web3.eth.sendTransaction(transactionParameters);
				console.log("Transaction successful:", txHash);
				alert(`Transaction successful! Hash: ${txHash.transactionHash}`);

				// If transaction is successful, proceed with character selection
				await this.setCharacter();
			} catch (error) {
				console.error("Detailed transfer error:", error);
				alert(`Transfer failed: ${error.message}`);
			}
		},
		async getCharacter() {
			if (!state.address) return;
			let url = process.env.VUE_APP_REST_API + "/api/v2/nft/getCharacter/" + state.address;
			let result = await fetch(url);
			let parsed = await result.json();
			if (!parsed.result) return;
			this.selected = parsed.result;
			return parsed;
		},
		async setCharacter() {
			if (!this.newSelected) return;
			const message = "Set character to " + this.newSelected;
			let signature = await web3.eth.personal.sign(message, state.address, "");
			let body = JSON.stringify({
				address: state.address,
				message: message,
				signature: signature,
			});
			let promise = await fetch(process.env.VUE_APP_REST_API + "/api/v2/nft/setCharacter", {
				method: "POST",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
				},
				body,
			});
			let json = await promise.json();
			if (json.result) {
				this.selected = this.newSelected;
				this.newSelected = null;
			}
		},
		async initSelect() {
			await init();
			this.getCharacter();
		},
	},
	computed: {
		state() {
			return state;
		},
	},
	watch: {
		"state.address"() {
			this.getCharacter();
		},
	},
	mounted() {
		this.initSelect();
	},
};
</script>
<style lang="scss" scoped>
.char-button-container {
	text-align: center;
	.char-button {
		height: 100px;
		width: auto;
		display: inline-block;
		margin: 2px;
		img {
			height: 100%;
			width: auto;
		}
	}
}
</style>
