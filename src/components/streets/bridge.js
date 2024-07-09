//import { Street } from "../street.js";
import Phaser from "phaser";
import {getSheetKey } from "../utils/";
import eventHub from "../vue/eventHub.js";
import { ETH } from "../config.js";
import Bus from "../game-objects/bus.js";
import Person from "../game-objects/person";
//import { Street } from "../street.js";
export default class bridge extends Phaser.Scene {
	constructor(side) {
		super(side);
        //will soon handle this using constructor so that different types of buses can be created 
    //     this.config = ETH;
    //    this.ticker = ETH.ticker;
       // this.config.busCapacity = 20;
	}

	init() {
        // this.myBridgeStreet= new Street(this.config, this.side);
    }
    preload() {}
   async create() {
    this.busFloors = this.add.group();
    this.myBridge =  this.add.image(965, 500, "BRIDGE");
    eventHub.$on("myScrollData",(mydata)=>{
    this.cameras.main.scrollY=mydata.cameraY;});

    // eventHub.$on("myTestPersonData",(myData)=>{
    //    this.myPersonData = myData.myPersonData;
    // });
    
       setTimeout(() => {
        console.log(this.myPersonData)
       this.createPersonOnBridge();

       }, 3000);


    }


    customCallback(functionName, position, obj) {
		let callbackName = position + functionName.charAt(0).toUpperCase() + functionName.slice(1);
		if (typeof this[callbackName] !== "function") return false;
		this[callbackName](obj);
		return true;
	}


    createPersonOnBridge() {

        this.myPerson = new Person(this);
        this.myPerson.setTexture(getSheetKey("person-"),"mailman-0.png");
        this.myPerson.x = this.myBridge.x;
        this.myPerson.y = this.myBridge.y;
        this.myPerson.active = true;
		this.myPerson.visible = true;
        //this.myPerson.setLineData("status", null);

        this.myPerson.createPath([this.myBridge.x-350,this.myBridge.y+400,
            this.myBridge.x-350,this.myBridge.y+200,this.myBridge.x-280,this.myBridge.y-180,
            this.myBridge.x+250,this.myBridge.y-180,this.myBridge.x+380,this.myBridge.y-150,
            this.myBridge.x+380,this.myBridge.y+200,this.myBridge.x+380,this.myBridge.y+400,

        
        ])

        this.myPerson.goAlongPath();
       
        this.myPerson.setDepth(1000);

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