<template>
	<div>
		<table class="table is-striped is-narrow is-fullwidth">
			<tbody v-if="blockInfo && type == 'bus'">
				<tr>
					<td>
						<strong>{{ $t("general.confirmation-in") }}</strong>
					</td>
					<td class="break">{{ confirmationTime }}</td>
				</tr>
				<tr v-if="!mwebOnly">
					<td>
						<strong>{{ $root.i18n($root.busFeeTitleLong) }}</strong>
					</td>
					<td
						v-if="blockInfo.feeArray && blockInfo.feeArray.length > 10 && feeGraphPoints.length > 1"
						class="break"
					>
						<vue-bar-graph
							class="bar-graph"
							:bar-color="'#' + $root.coinConfig.color"
							:points="feeGraphPoints"
							:height="100"
							:width="300"
							:show-x-axis="true"
							:key="lastUpdated"
						/>
					</td>
					<td v-else-if="blockInfo.lowFee" class="break">{{ rangeValue }}</td>
				</tr>
				<tr v-if="!mwebOnly">
					<td>
						<strong>{{ $t("general.loaded") }}</strong>
					</td>
					<td class="break">
						<div class="progress-wrapper">
							<progress
								class="progress is-primary is-medium"
								:value="blockInfo.loaded"
								:max="blockInfo.busCapacity"
							></progress>
							<p class="progress-value">
								{{ Math.floor((blockInfo.loaded / blockInfo.busCapacity) * 100) + "%" }}
							</p>
						</div>
					</td>
				</tr>
				<template v-for="formatEntry in format">
					<tr v-if="blockInfo[formatEntry.key] && !mwebOnly" :key="formatEntry.key">
						<td>
							<strong>{{ $root.i18n(formatEntry.title) }}</strong>
						</td>
						<td class="break">
							{{ blockInfo[formatEntry.key] }}
							<span v-if="formatEntry.after">{{ formatEntry.after }}</span>
						</td>
					</tr>
				</template>
				<tr v-if="blockInfo.loaded && !mwebOnly">
					<td>
						<strong>{{ $t("general.loaded") }} ({{ $root.i18n($root.sizeTitle) }})</strong>
					</td>
					<td class="break">
						<span v-if="$root.sizeTitle === 'Gas'">~</span>
						{{ blockInfo.loaded.toLocaleString($i18n.locale) }}
					</td>
				</tr>
				<tr v-if="blockInfo.loadedAlt && !mwebOnly">
					<td>
						<strong>Loaded ({{ $root.i18n($root.sizeAltTitle) }})</strong>
					</td>
					<td class="break">{{ blockInfo.loadedAlt.toLocaleString($i18n.locale) }}</td>
				</tr>
				<tr v-if="blockInfo.txs">
					<td>
						<strong><span v-if="mwebOnly">MWEB </span>{{ $tc("general.transaction", 2) }}</strong>
					</td>
					<td class="break">
						<span v-if="mwebOnly">{{ blockInfo.mwebTxs }}</span>
						<span v-else>
							{{ blockInfo.txs.toLocaleString($i18n.locale) }}
							<span v-if="blockInfo.mwebTxs"
								><br />({{ blockInfo.mwebTxs.toLocaleString($i18n.locale) }} MWEB)</span
							>
						</span>
						<button v-if="Object.keys(blockInfo.txFull || {}).length" @click="showTx" class="right button">
							{{ !showTransactions ? $t("general.show-list") : $t("general.hide-list") }}
						</button>
					</td>
				</tr>
			</tbody>
			<tbody v-else-if="blockInfo && type == 'block'">
				<tr v-if="!mwebOnly">
					<td>
						<strong>{{ $t("general.hash") }}</strong>
					</td>
					<td class="break">
						<a :href="$root.coinConfig.explorerBlockUrl + String(blockInfo.height)" target="_blank">{{
							shortHash(blockInfo.hash, 10, true)
						}}</a>
					</td>
				</tr>
				<tr v-if="$root.coinConfig.ticker === 'LTC'">
					<td>
						<strong>MWEB {{ $t("general.hash") }}</strong>
					</td>
					<td class="break">
						<a :href="$root.coinConfig.mwebExplorerBlockUrl + String(blockInfo.height)" target="_blank">{{
							shortHash(blockInfo.mweb.hash, 10, true)
						}}</a>
					</td>
				</tr>
				<tr>
					<td>
						<strong>{{ $t("general.confirmed") }}</strong>
					</td>
					<td class="break">{{ confirmedTime }}</td>
				</tr>
				<tr v-if="blockInfo.lowFee && !mwebOnly">
					<td>
						<strong>{{ $root.i18n($root.busFeeTitleLong) }}</strong>
					</td>
					<td v-if="blockInfo.feeArray && blockInfo.feeArray.length > 1" class="break">
						<vue-bar-graph
							class="bar-graph"
							:bar-color="'#' + $root.coinConfig.color"
							:points="feeGraphPoints"
							:height="100"
							:width="350"
							:show-x-axis="true"
						/>
					</td>
					<td v-else-if="blockInfo.lowFee" class="break">{{ rangeValue }}</td>
				</tr>
				<tr v-else-if="blockInfo.verbose === false && !mwebOnly">
					<td>
						<strong>{{ $root.i18n($root.busFeeTitleLong) }}</strong>
					</td>
					<td class="break">
						<button @click="loadBlock(blockInfo.hash, false)" class="button">Load Data</button>
					</td>
				</tr>
				<tr v-if="blockInfo.size && !mwebOnly">
					<td>
						<strong>{{ $t("general.size") }}</strong>
					</td>
					<td class="break">
						{{ blockInfo.size.toLocaleString($i18n.locale) }} {{ $tc("general.bytes", 2) }}
					</td>
				</tr>
				<template v-for="formatEntry in format">
					<tr v-if="blockInfo[formatEntry.key] && !mwebOnly" :key="formatEntry.key">
						<td>
							<strong>{{ $root.i18n(formatEntry.title) }}</strong>
						</td>
						<td class="break">
							{{ blockInfo[formatEntry.key] }}
							<span v-if="formatEntry.after">{{ formatEntry.after }}</span>
						</td>
					</tr>
				</template>
				<tr v-if="!mwebOnly">
					<td>
						<strong>{{ $tc("general.transaction", 2) }}</strong>
					</td>
					<td class="break">
						{{ blockInfo.txFull ? blockInfo.txs.toLocaleString($i18n.locale) : 0 }}
						<button
							v-if="blockInfo.txFull && Object.keys(blockInfo.txFull || {}).length"
							@click="showTx"
							class="right button"
						>
							{{ !showTransactions ? $t("general.show-list") : $t("general.hide-list") }}
						</button>
						<button
							@click="loadBlock(blockInfo.hash)"
							class="right button"
							v-else-if="!Object.keys(blockInfo.txFull).length && blockInfo.verbose === false"
						>
							Load List
						</button>
					</td>
				</tr>
				<tr v-else>
					<td>
						<strong>MWEB {{ $tc("general.transaction", 2) }}</strong>
					</td>
					<td class="break">
						{{ blockInfo.mweb.num_kernels.toLocaleString($i18n.locale) }}
					</td>
				</tr>
			</tbody>
		</table>
		<transactions
			v-if="showTransactions && blockInfo.txs"
			:key="height + '-txs'"
			v-bind="{ thead: $tc('general.transaction', 2), txsEnabled: true, customList: customList }"
		></transactions>
	</div>
</template>

<script>
// @ts-nocheck
/* eslint-disable vue/no-unused-components */
import Transactions from "./Transactions.vue";
import VueBarGraph from "vue-bar-graph";
import dayjs from "dayjs";
import "dayjs/locale/en"; // Replace 'en' with your desired locale if needed
import { shortHash } from "../utils";

export default {
	props: {
		data: {
			type: Object,
			default: null,
		},
		height: {
			type: Number,
			default: 0,
		},
		type: {
			type: String,
			default: "bus",
		},
	},
	data() {
		return {
			showTransactions: false,
			mwebOnly: false,
			customList: false,
			feeGraphPoints: [],
			blockInfo: {},
			lastUpdated: 0,
			confirmationTime: "",
			confirmedTime: "",
			rangeValue: "",
			format: [
				{
					key: "blocktime",
					title: "general.blocktime",
				},
				{
					key: "minedTime",
					title: "general.mined",
					after: " mins",
				},
				{
					key: "bits",
					title: "general.difficulty",
				},
			],
		};
	},
	watch: {
		height() {
			this.mwebOnly = this.height < 0;
			this.loadData();
		},
	},
	components: {
		Transactions,
		VueBarGraph,
	},
	computed: {
		...Vuex.mapState("root", ["busFeeTitleLong"]),
		...Vuex.mapState("stats", ["medianBlockTime"]),
		...Vuex.mapState("config", ["coinConfig"]),
	},
	methods: {
		showTx() {
			this.showTransactions = !this.showTransactions;
		},
		loadData() {
			if (this.height > 0) {
				this.blockInfo = this.data || {};
				this.lastUpdated = this.blockInfo.timestamp;
				this.confirmationTime = this.confirmationTime;
				this.confirmedTime = this.confirmedTime;
				this.rangeValue = this.rangeValue;
			}
		},
	},
	mounted() {
		this.loadData();
	},
};
</script>

<style scoped>
.break {
	word-break: break-word;
}
.progress-wrapper {
	display: flex;
	align-items: center;
}
.progress {
	flex-grow: 1;
	margin-right: 5px;
}
.progress-value {
	min-width: 4em;
	text-align: center;
}
.bar-graph {
	width: 100%;
}
</style>
