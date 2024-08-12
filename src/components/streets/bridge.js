//import { Street } from "../street.js";
import Phaser from "phaser";
import {getSheetKey } from "../utils/";
import eventHub from "../vue/eventHub.js";
import { ETH,charConfig ,config} from "../config.js";
import Bus from "../game-objects/bus.js";
import Person from "../game-objects/person";
// import sideCtor from "../vue/SideController.vue";
//import { Street } from "../street.js";
export default class bridge extends Phaser.Scene {
	constructor(side) {
		super(side);
        //will soon handle this using constructor so that different types of buses can be created 
    //     this.config = ETH;
    //    this.ticker = ETH.ticker;
       this.config = config;
       this.movingPeople = [];
       this.charConfig = charConfig;
       this.lineManager = {};
       this.sizeVar = "g";
	}

	init() {

        // this.vue = new sideCtor({
		// 	propsData: {
		// 		coinConfig: this.config,
		// 		stats: this.bottomStats,
		// 		side: this.side,
		// 		txFollowersHashes: this.txFollowersHashes,
		// 	},
		// });

        // this.myBridgeStreet= new Street(this.config, this.side);
        this.config.getAndApplyFee =  function (txData) {

            if (txData.feeVal) return txData.feeVal;
            txData.feeVal =  function (txData) {
                if (typeof txData.ty === "undefined") return 0;
                if (txData.ty === 0) {
                    return txData.gp || 0;
                } else if (txData.ty === 1) {
                    return txData.gp || 0;
                } else if (txData.ty === 2) {
                    return txData.mfpg || 0;
                } else {
                    return 0;
                }
            };
    
            return txData.feeVal;
        }

    }
    preload() {}
   async create() {
    this.busFloors = this.add.group();
    this.myBridge =  this.add.image(965, 500, "BRIDGE");
    eventHub.$on("myScrollData",(mydata)=>{
    this.cameras.main.scrollY=mydata.cameraY;});

    eventHub.$on("myTestPersonData",(myData)=>{
       this.myPersonData = myData.myPersonData;
      console.log("changed");
    });
    
    eventHub.$on("AlightBridge",(mypos)=>{
        let myX = mypos.myStartX;
       let  myY = mypos.myStartY;
       let mySide = mypos.mySide;
       let myRightStartPoint = mypos.myRightPoint;
       let myBridgePeople = mypos.myBridgeTxData;
        this.createPersonOnBridge(this.myPersonData,myX,myY,mySide,myRightStartPoint,myBridgePeople);
     });
    //will change the calling of the function to be triggered by bridgeTransaction
    //    setTimeout(() => {
    //     console.log(this.myPersonData)
        
    //     setInterval(() => {
    //         this.createPersonOnBridge(this.myPersonData);
    //        }, 5000);
    //    }, 3000);
 
    


    }
    getFee (txData) {
		if (typeof txData.ty === "undefined") return 0;
		if (txData.ty === 0) {
			return txData.gp || 0;
		} else if (txData.ty === 1) {
			return txData.gp || 0;
		} else if (txData.ty === 2) {
			return txData.mfpg || 0;
		} else {
			return 0;
		}
	}

    customCallback(functionName, position, obj) {
		let callbackName = position + functionName.charAt(0).toUpperCase() + functionName.slice(1);
		if (typeof this[callbackName] !== "function") return false;
		this[callbackName](obj);
		return true;
	}



    createPersonOnBridge(data,startx,starty,side,rightStartPoint,myBridgPeopleData) {


        for (let i = 0 ; i < myBridgPeopleData.length ; i++){


            console.log(data);
            console.log(data.txData);
            console.log(data.txData.spriteNo);
            this.myPerson = new Person(this);
            this.myPerson.setTexture(getSheetKey("person-"),"mailman-0.png");
            this.myPerson.x = this.myBridge.x;
            this.myPerson.y = this.myBridge.y;
            this.myPerson.active = true;
            this.myPerson.visible = true;
            let mySkinSpriteNo = data.txData.spriteNo;
            console.log(mySkinSpriteNo);
            this.myPerson.customResetData();

            if (side === "left") {
                this.myPerson.createPath([startx-40,starty-50,
                    this.myBridge.x-350,this.myBridge.y+200,this.myBridge.x-350,this.myBridge.y-150,
                    this.myBridge.x+250,this.myBridge.y-150,this.myBridge.x+380,this.myBridge.y-150,
                    this.myBridge.x+380,this.myBridge.y+200,this.myBridge.x+380,this.myBridge.y+1400,
                ])
            }else{
    
                this.myPerson.createPath([startx+40+rightStartPoint/2,starty-50,
                    this.myBridge.x+380,this.myBridge.y+200,this.myBridge.x+380,this.myBridge.y-150,
                    this.myBridge.x+250,this.myBridge.y-150,this.myBridge.x-350,this.myBridge.y-150,
                    this.myBridge.x-350,this.myBridge.y+200 ,this.myBridge.x-350,this.myBridge.y+1400,
                ])
            }
    
         
    
            this.myPerson.goAlongPath(mySkinSpriteNo,side,myBridgPeopleData[i].completionTime*1000);
           
            this.myPerson.setDepth(1000);
    
        }
       

       // this.myPerson.resetData(data.txData);
   

      //  this.myPerson.play("walk_down_1");
      
        //this.myPerson.setLineData("status", null);

      
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
    setMaxScalePerson(person = false, txSize) {
		let scale = 0.35;
		if (txSize < 200) {
			scale = 0.35;
		} else if (txSize < 500) {
			scale = 0.4;
		} else if (txSize < 1000) {
			scale = 0.45;
		} else if (txSize < 5000) {
			scale = 0.55;
		} else if (txSize < 10000) {
			scale = 0.65;
		} else if (txSize < 100000) {
			scale = 0.8;
		} else {
			scale = 1;
		}
		if (person) person.setData("maxScale", scale);
		return scale;
	}
    getModSize(txData) {
		if (txData.modSize) return txData.modSize;
		return txData[this.sizeVar];
	}
    calcBusHeight() {
		return (20 / 1000000) * 195 - 115;
	}
    update() {}



}

bridge.config = ETH;