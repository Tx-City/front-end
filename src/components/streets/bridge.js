//import { Street } from "../street.js";
import Phaser from "phaser";
import eventHub from "../vue/eventHub.js";
import Bus from "../game-objects/bus.js";
export default class bridge extends Phaser.Scene {
	constructor(side) {
		super(side);
	}

	init() {}
    preload() {}
   async create() {

    this.myBridge =  this.add.image(950, 500, "BRIDGE");
    eventHub.$on("myScrollData",(mydata)=>{
    this.cameras.main.scrollY=mydata.cameraY;});

    this.createBridgeBus();

    }

    createmyBridgeBus() {

 
        this.myBridgeBus = new Bus(this);
        this.myBridgeBus.y = this.myBridge.y 
        this.myBridgeBus.x = this.myBridge.x;
        this.myBridgeBus.text1.setText("#20975174");
        this.myBridgeBus.setText("2Gwei");
        this.myBridgeBus.setText("+0Wei");
        this.myBridgeBus.logo.setScale(0.3);


    }
    update() {}



}