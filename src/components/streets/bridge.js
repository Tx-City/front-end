//import { Street } from "../street.js";
import Phaser from "phaser";
import eventHub from "../vue/eventHub.js";
import { ETH } from "../config.js";
import Bus from "../game-objects/bus.js";
export default class bridge extends Phaser.Scene {
	constructor(side) {
		super(side);
        //will soon handle this using constructor so that different types of buses can be created 
        this.config = ETH;
        this.ticker = ETH.ticker;
       // this.config.busCapacity = 20;
	}

	init() {
        
    }
    preload() {}
   async create() {
    this.busFloors = this.add.group();
    this.myBridge =  this.add.image(950, 500, "BRIDGE");
    eventHub.$on("myScrollData",(mydata)=>{
    this.cameras.main.scrollY=mydata.cameraY;});
    
    this.createmyBridgeBus();

    }

    customCallback(functionName, position, obj) {
		let callbackName = position + functionName.charAt(0).toUpperCase() + functionName.slice(1);
		if (typeof this[callbackName] !== "function") return false;
		this[callbackName](obj);
		return true;
	}

    createmyBridgeBus() {

   
        this.myBridgeBus = new Bus(this);
        this.myBridgeBus.y = this.myBridge.y+125 
        this.myBridgeBus.x = this.myBridge.x-250;
        this.myBridgeBus.text1.setText("#20975174");
        this.myBridgeBus.text2.setText("2Gwei");
        this.myBridgeBus.text3.setText("+0Wei");
        this.myBridgeBus.logo.setScale(0.3);
        this.myBridgeBus.angle= 270;

        this.myBridgeBus.createBridgePath([this.myBridge.x-250,this.myBridge.y+100,
            this.myBridge.x-350,this.myBridge.y+100,this.myBridge.x-280,this.myBridge.y-280,
            this.myBridge.x+250,this.myBridge.y-280,this.myBridge.x+380,this.myBridge.y-250,
            this.myBridge.x+380,this.myBridge.y+100,this.myBridge.x+300,this.myBridge.y+100,

        
        ])
        this.myBridgeBus.followBridgePath();
       


    }
    calcBusHeight() {
		return (20 / 1000000) * 195 - 115;
	}
    update() {}



}

bridge.config = ETH;