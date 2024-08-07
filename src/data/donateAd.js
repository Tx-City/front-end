export const donateData = (ticker) => {
	console.log("ticker", ticker);

	let walletAddress;
	switch (ticker) {
		case "ETH":
			walletAddress = "0x01";
			break;
		case "BTC":
			walletAddress = "0x02";
			break;
		case "XMR":
			walletAddress = "0x03";
			break;
		case "BCH":
			walletAddress = "0x04";
			break;
		case "LTC":
			walletAddress = "0x05";
			break;
		case "ARBI":
			walletAddress = "0x06";
			break;
		case "CELO":
			walletAddress = "0x07";
			break;
		case "LUKSO":
			walletAddress = "0x08";
			break;
		default:
			walletAddress = "0x09";
	}

	return {
		key: "donate-ad",
		title: "Contribute to Txcity!",
		html: `<div class="ta-l">
    <span class="t-yellow">Txcity citizens!</span>
    <br />
    Now you can contribute to the development of Txcity, your donations will help to develop features.						
    <br />

    <div class="contributeInner">
    <b>Donation address</b>
    <ul>
    <li>
    <span class="t-yellow">Wallet address fro ${ticker}:</span
    <br/>
    ${walletAddress}</li>
    						
    </ul>									
    </div>								
    </div>
    `,
	};
};
