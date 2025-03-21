import Web3 from "web3";
import Web3Modal from "web3modal";
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import Vue from "vue";
import eventHub from "./components/vue/eventHub";

const state = Vue.observable({
	connected: false,
	address: null,
	chainId: 1,
	networkId: null,
});
export default state;

export let web3;
export let provider;

// Create a custom WalletConnect provider factory to avoid dependency issues
const createWalletConnectProvider = async (opts) => {
	const provider = await EthereumProvider.init({
		projectId: opts.projectId,
		chains: opts.chains || [1],
		showQrModal: true,
		methods: ["eth_sendTransaction", "eth_sign", "eth_signTypedData", "personal_sign", "eth_signTypedData_v4"],
		events: ["chainChanged", "accountsChanged"],
		rpcMap: opts.rpcMap || {},
	});

	return provider;
};

// Initialize Web3Modal with manual provider handling
export const web3Modal = new Web3Modal({
	network: "mainnet",
	cacheProvider: true,
	// Empty providerOptions to avoid pre-configured providers
	providerOptions: {},
});

// Custom connect function to avoid Web3Modal's provider handling
export const init = async () => {
	if (state.connected && state.address) return;

	try {
		// Try to get the injected provider (MetaMask) first
		let selectedProvider;

		try {
			// Open Web3Modal for MetaMask/injected provider
			selectedProvider = await web3Modal.connect();
		} catch (modalError) {
			console.log("Injected provider not available or user rejected, trying WalletConnect", modalError);

			// If Web3Modal fails, try WalletConnect directly
			selectedProvider = await createWalletConnectProvider({
				projectId: "de9f4c3645b4e59b85572a918156fb6f", // Get from https://cloud.walletconnect.com
				chains: [1],
				rpcMap: {
					1: `https://mainnet.infura.io/v3/${process.env.VUE_APP_INFURA}`,
				},
			});

			// Need to manually connect WalletConnect provider
			await selectedProvider.enable();
		}

		if (selectedProvider) {
			provider = selectedProvider;

			// Initialize Web3 instance
			web3 = new Web3(provider);

			// Get accounts and network
			const accounts = await web3.eth.getAccounts();
			if (!accounts || accounts.length === 0) {
				throw new Error("No accounts found");
			}

			const address = accounts[0];
			let networkId;

			try {
				networkId = await web3.eth.net.getId();
			} catch (networkError) {
				console.warn("Could not get network ID:", networkError);
				networkId = 1; // Default to mainnet if we can't get the network
			}

			// Update state
			state.connected = true;
			state.address = address;
			state.networkId = networkId;

			// Emit event for any components listening for ETH-follow
			eventHub.$emit("ETH-follow", address);

			// Subscribe to provider events
			await subscribeProvider(provider);

			return { web3, provider, address };
		}
	} catch (error) {
		console.error("Connection error:", error);
		// Reset any partially connected state
		state.connected = false;
		state.address = null;
		return null;
	}
};

export const disconnect = async () => {
	try {
		// If provider has disconnect method, call it
		if (provider && typeof provider.disconnect === "function") {
			await provider.disconnect();
		}

		// Clear cached provider
		await web3Modal.clearCachedProvider();
	} catch (error) {
		console.warn("Error during disconnect:", error);
	} finally {
		// Always reset state even if disconnect failed
		state.connected = false;
		state.address = null;
		state.chainId = 1;
		state.networkId = null;
	}
};

const subscribeProvider = async (provider) => {
	if (!provider.on) {
		return;
	}

	// Handle account changes
	provider.on("accountsChanged", async (accounts) => {
		if (!accounts || accounts.length === 0) {
			// User disconnected their wallet
			await disconnect();
		} else {
			state.address = accounts[0];
			eventHub.$emit("ETH-follow", accounts[0]);
		}
	});

	// Handle chain changes
	provider.on("chainChanged", async (chainId) => {
		try {
			// Convert hex chainId to decimal if needed
			const parsedChainId =
				typeof chainId === "string" && chainId.startsWith("0x") ? parseInt(chainId, 16) : parseInt(chainId);

			state.chainId = parsedChainId || 1; // Default to 1 if parsing fails

			try {
				const networkId = await web3.eth.net.getId();
				state.networkId = networkId;
			} catch (error) {
				console.warn("Error getting network ID:", error);
			}
		} catch (error) {
			console.warn("Error handling chainChanged event:", error);
		}
	});

	// Handle disconnect
	provider.on("disconnect", () => {
		console.log("Provider disconnected");
		disconnect();
	});
};

// Check if connection exists in cache on startup
export const checkConnection = async () => {
	if (web3Modal.cachedProvider) {
		try {
			return await init();
		} catch (error) {
			console.error("Failed to restore cached connection:", error);
			await web3Modal.clearCachedProvider();
			return null;
		}
	}
	return null;
};
