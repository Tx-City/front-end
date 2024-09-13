//import { Street } from "../street.js";
import Phaser from "phaser";
import {getSheetKey,toRes } from "../utils/";
import AppleTest from '../utils/apple_test.js';
import eventHub from "../vue/eventHub.js";
import { ETH,charConfig ,config} from "../config.js";
import Bus from "../game-objects/bus.js";
import Person from "../game-objects/person";
import Popup from "../game-objects/popup";
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
       this.popUps = [];
       this.charConfig = charConfig;
       this.lineManager = {};
       this.sizeVar = "g";
       this._appleTest = new AppleTest();
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

        this.postFxPlugin = this._getRightFxPlugin();

    }
    preload() {}
   async create() {
    this.createMasks();
    this.busFloors = this.add.group();
    this.createBridgeButton();
    this.cameras.main.scrollY=toRes(1300)
    this.myBridge =  this.add.image(toRes(960), toRes(500), "BRIDGE").setVisible(false).setScale(toRes(1));
    eventHub.$on("myScrollData",(mydata)=>{
   if(this.cameras.main){ this.cameras.main.scrollY=mydata.cameraY;}
    this.myBridge.setVisible(true);
});
    eventHub.$on("bridgeSearchData",(searchdata)=>{
     console.log(searchdata.searchData);
     this.checkIfBridgeTxFollow(searchdata.searchData);
    })

    eventHub.$on("scrollToBridge",()=>{ setTimeout(()=>{  this.myBridge.setVisible(true);},2500);});
  
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
    // this.input.on('gameobjectdown', function (pointer, gameObject) {

    //     fork.x = pointer.x;
    //     fork.y = pointer.y;

    // });

    createBridgeButton(){

        this.bridgeBut = this.add.image(toRes(960), toRes(1320),'bridgeBut').setScale(toRes(0.3));
        this.bridgeBut.setInteractive({useHandCursor: true}); 
		this.bridgeBut.on('pointerup', () => {
            eventHub.$emit("scrollToBridge");
            this.myBridge.setVisible(true);
            this.bridgeBut.setActive = false;
            this.bridgeBut.setVisible(false)
		});
    }

    checkIfBridgeTxFollow(data) {

     
        for (let i = 0; i < this.movingPeople.length; i++) {

            if( data == this.popUps[i].transactionHashText){
             console.log("searchfound");
             if (this.popUps[i].isVisible()) { 
                 this.popUps[i].setInvisible();
             } else {
                 this.popUps[i].setVisible();
                 window.txStreetPhaser.streetController.addToRainbow(this.movingPeople[i]);
             }
            }
            }


    }


    _getRightFxPlugin() {
		if (this._isABadApple()) {
			return {
				add: () => {


				},
				get: () => {
					return [
						{
							setOutlineColor: (gameObject, colorCode) => {
								this._handleTint(gameObject, colorCode);
							}
						}
					]
				},
				remove: (gobject) => {

					this._handleRemoveTint(gobject)
				}
			}
		} else {
			return this.plugins.get("rexOutlinePipeline");
		}
	}

    _isABadApple() {
		return this._appleTest.isABadApple();
	}

    createMasks(){

 
    this.maskRectLeft = this.add.rectangle(toRes(520), toRes(1380), 420, toRes(135), 0x000000).setVisible(false);
    this.myMaskLeft = this.maskRectLeft.createGeometryMask();
    this.myMaskLeft.invertAlpha = true;
    this.maskRectRight = this.add.rectangle(toRes(1400), toRes(1380), 420, toRes(135), 0x000000).setVisible(false);
    this.myMaskRight = this.maskRectRight.createGeometryMask();
    this.myMaskRight.invertAlpha = true;

    }

    maskBridgePeopleLeft(myPerson){
        myPerson.setMask(this.myMaskLeft);
    }

    maskBridgePeopleRight(myPerson){
        myPerson.setMask(this.myMaskRight);
    }

    createPersonOnBridge(data,startx,starty,side,rightStartPoint,myBridgPeopleData) {


        for (let i = 0 ; i < myBridgPeopleData.length ; i++){


            console.log(data);
            console.log(data.txData);
            console.log(data.txData.spriteNo);
            this.myPerson = new Person(this);
            this.myPerson.setInteractive({useHandCursor: true});
            this.myPerson.setTexture(getSheetKey("person-"),"mailman-0.png");
            this.myPerson.x = this.myBridge.x;
            this.myPerson.y = this.myBridge.y;
            this.myPerson.active = true;
            this.myPerson.visible = true;
            let mySkinSpriteNo = data.txData.spriteNo;
            console.log(mySkinSpriteNo);
            this.myPerson.customResetData();

            if (side === "left") {
                this.maskBridgePeopleRight(this.myPerson);
                this.myPerson.createPath([startx - toRes(70), starty - toRes(80),
                    this.myBridge.x - toRes(350), this.myBridge.y + toRes(200), this.myBridge.x - toRes(350), this.myBridge.y - toRes(150),
                    this.myBridge.x + toRes(250), this.myBridge.y - toRes(150), this.myBridge.x + toRes(380), this.myBridge.y - toRes(150),
                    this.myBridge.x + toRes(380), this.myBridge.y + toRes(200), this.myBridge.x + toRes(380), this.myBridge.y + toRes(1400),
                    this.myBridge.x + toRes(1800), this.myBridge.y + toRes(1400)
                ])
            }else{
                this.maskBridgePeopleLeft(this.myPerson);
                this.myPerson.createPath([ startx + toRes(60)+ rightStartPoint / 2, starty - toRes(80),
                    this.myBridge.x + toRes(380), this.myBridge.y + toRes(200), this.myBridge.x + toRes(380), this.myBridge.y - toRes(150),
                    this.myBridge.x + toRes(250), this.myBridge.y - toRes(150), this.myBridge.x - toRes(350), this.myBridge.y - toRes(150),
                    this.myBridge.x - toRes(350), this.myBridge.y + toRes(200), this.myBridge.x - toRes(350), this.myBridge.y + toRes(1400),
                    this.myBridge.x - toRes(1800), this.myBridge.y + toRes(1350)
                ])
            }
    
         
            this.myPerson.setDepth(1000);
            this.myPerson.goAlongPath(mySkinSpriteNo,side,myBridgPeopleData[i].completionTime*1000);
            this.movingPeople.push(this.myPerson);
     

            this.myPopUp = new Popup(
                this,
                this.myPerson.x,
                this.myPerson.y,
                false,
                "popup",
               myBridgPeopleData[i].address,
                myBridgPeopleData[i].amount,
                myBridgPeopleData[i].transactionHash,
                myBridgPeopleData[i].type,
              
            );

            this.myPopUp.setInvisible();

            this.popUps.push(this.myPopUp);


        }
       
      
        this.createPopUpFunctionality();
        this.popUpEnabled = true;
       // this.myPerson.resetData(data.txData);
   

      //  this.myPerson.play("walk_down_1");
      
        //this.myPerson.setLineData("status", null);

      
    }

    createPopUpFunctionality() {

        if (this.popUpEnabled) return;

        this.input.on("gameobjectup", (pointer,gameObject) => {

            let p = pointer;
            let obj = gameObject;
 
            for (let i = 0; i < this.movingPeople.length; i++) {

              if( obj == this.movingPeople[i]){
               console.log("found");
               if (this.popUps[i].isVisible()) { 
                   this.popUps[i].setInvisible();
                   window.txStreetPhaser.streetController.removeFromRainbow(this.movingPeople[i]);
               } else {
                   this.popUps[i].setVisible();
               }
              }
              }


           });

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
    update() {

        for (let i = 0; i < this.movingPeople.length; i++) {
            let person = this.movingPeople[i];
            let popup = this.popUps[i];
         
            popup.x = person.x - popup.width /5;
            popup.y = person.y  - popup.height / 3.25;
        }
    }



}

bridge.config = ETH;