import Phaser, { Scene } from "phaser";
import { getSheetKey,toRes ,toResRev} from "./../utils/";
import Popup from "./popup";
import eventHub from "../vue/eventHub.js";
import TextInput from "./TextInput"
const Avatar = new Phaser.Class({
	Extends: Phaser.GameObjects.Container,
	initialize: function Avatar(scene, side, x, y, key) {
		Phaser.GameObjects.Container.call(this, scene, 0, 0);
		this.scene = scene;
		this.x = x;
		this.y = y;
		this.key = key;
		this.side = side;

		this.myAvatar = this.scene.add.sprite(toRes(x), toRes(y), key).setScale(toRes(1.5));
		this.myAvatar.setTexture(getSheetKey("person-"), key);
		this.add(this.myAvatar);
		this.scene.add.existing(this);
		TextInput.setDefaults({
            x: 300,
            originX: 0,
            size: 32,
            padding: 8,
            outlineColor: 0xffffff,
            hideOutlineOnFocusLoss: false,
            labelPadding: 8,
            maxlength: 16,
            width: 300
        });
		//this.follow = this.scene.cameras.main.startFollow(this.myAvatar);
	},
});

Avatar.prototype.setupControls = function (scene) {

	eventHub.$on("popUpDestroyed",()=>{

		// if(this.avatarPopUp){this.avatarPopUp.active=false;this.remove(this.avatarPopUp);console.log("yooh")}

	});
	this.setupPopUp(scene);
	this.setUpButtons(scene);
	this.setUpForm();
	this.myAvatar.setInteractive({useHandCursor:true});
	// this.scene.cameras.main.startFollow(this.myAvatar)
	scene.input.keyboard.on("keydown-S", () => {
		this.y += toRes(5);
		this.myAvatar.y = this.y;
		// this.followScroll = this.follow._scrollY-500;
		// this.scene.scrollTileSprites(this.followScroll , true);
		this.myAvatar.anims.play("walk_down_2", true);
	});

	scene.input.keyboard.on("keydown-W", () => {
		this.y -= toRes(5);
		this.myAvatar.y = this.y;
		// this.followScroll = this.follow._scrollY-500;
		// this.scene.scrollTileSprites(this.followScroll , true);
		this.myAvatar.anims.play("walk_up_2", true);
	});

	scene.input.keyboard.on("keydown-D", () => {
		this.x += toRes(5);
		this.myAvatar.x = this.x;
		this.myAvatar.setFlipX(true);
		this.myAvatar.anims.play("walk_side_2", true);
	});

	scene.input.keyboard.on("keydown-A", () => {
		this.x -= toRes(5);
		this.myAvatar.x = this.x;
		this.myAvatar.setFlipX(false);
		this.myAvatar.anims.play("walk_side_2", true);
	});

	scene.input.keyboard.on("keyup-A", () => {
	
		this.myAvatar.anims.play("stand_2", true);
	});

	scene.input.keyboard.on("keyup-D", () => {
	
		this.myAvatar.anims.play("stand_2", true);
	});

	scene.input.keyboard.on("keyup-W", () => {
	
		this.myAvatar.anims.play("stand_2", true);
	});

	scene.input.keyboard.on("keyup-S", () => {
	
		this.myAvatar.anims.play("stand_2", true);
	});

	this.myAvatar.on("pointerdown",()=>{

		

		if (this.avatarPopUp.isVisible()) { 
			this.avatarPopUp.setInvisible();
		} else {
			this.avatarPopUp.setVisible();
		}

	});

	

};

 Avatar.prototype.setupPopUp = function(scene){


	this.avatarPopUp = new Popup(scene,this.myAvatar.x,this.myAvatar.y+toRes(50),false,"bubble","0x3ff0812e7dd0f7f37b0e9b619198b70084df9399")
    this.avatarPopUp.setInvisible();
	this.add(this.avatarPopUp);



 }

 Avatar.prototype.setUpButtons = function (scene){


	this.transferButton = this.scene.add.sprite(this.myAvatar.x-toRes(100), this.myAvatar.y-toRes(100), "transferButton").setScale(toRes(0.3));

	this.bridgeTxButton = this.scene.add.sprite(this.myAvatar.x+toRes(100), this.myAvatar.y-toRes(100), "bridgeTxButton").setScale(toRes(0.3));
 
	this.add(this.transferButton);
	this.add(this.bridgeTxButton);

	this.transferButton.setInteractive({useHandCursor:true});
	this.bridgeTxButton.setInteractive({useHandCursor:true});

	this.bridgeTxButton.on("pointerdown",()=>{

		if (this.myFormIsVisible) { 
			this.setFormInvisible;
		} else {
			this.setFormVisible();
			this.bridgeTxButton.visible = false;
			this.transferButton.visible = false;
		}

	});


 }

 Avatar.prototype.setUpForm = function (scene){


	this.popUpwidth = toRes(400);
		this.popUpheight = toRes(400);
		this.radius = toRes(30);
		this.headerRadius = toRes(50);
		this.myXpos = this.myAvatar.x;
		this.myYpos = this.myAvatar.y;

		this.Popupbackground = this.scene.add.graphics();
		this.Popupbackground.fillStyle(0xffffff, 1);
		this.Popupbackground.lineStyle(this.border, 0xffff00, 1);
		this.Popupbackground.fillRoundedRect(this.myXpos, this.myYpos, this.popUpwidth, this.popUpheight, this.radius);
		if (this.border > 0) this.Popupbackground.strokeRoundedRect(0, 0, this.popUpwidth, this.popUpheight, this.radius);
		this.add(this.Popupbackground);
		this.sendToBack(this.Popupbackground);



		this.HeaderPopupbackground = this.scene.add.graphics();
		this.HeaderPopupbackground.fillStyle(0x022d58, 1);
		this.HeaderPopupbackground.lineStyle(this.border, 0xffff00, 1);
		this.HeaderPopupbackground.fillRoundedRect(this.myXpos,this.myYpos, this.popUpwidth, this.popUpheight/7, 25);
		if (this.border > 0) this.HeaderPopupbackground.strokeRoundedRect(0, 0, this.popUpwidth, this.popUpheight, this.radius);
		this.add(this.HeaderPopupbackground);

		
		this.popUpTextHeader = this.scene.add.text(0, 0, "BRIDGE TX", {
			fontSize: toRes(30) + "px",
			fontFamily: 'Arial, sans-serif-bold',
			fill: "#ffffff",
			wordWrap: { width: this.maxWidth, useAdvancedWrap: true },
			metrics: {
				ascent: toRes(50),
				descent: toRes(4),
				fontSize: toRes(50),
			},
		});
		this.popUpTextHeader.setResolution(toResRev());
		this.add(this.popUpTextHeader);
		this.popUpTextHeader.setOrigin(0.5);
		this.popUpTextHeader.setPosition(this.popUpwidth / 2, this.popUpheight / 25);

		this.userAdress = this.scene.add.text(this.myAvatar.x-toRes(150),this.myAvatar.y-toRes(250), 'From: 0x3f***f9399 ', { font: '24px Courier', fill: '#000000' });
		this.ToText = this.scene.add.text(this.userAdress.x,this.userAdress.y+ toRes(40), 'To:0xesf******adfws', { font: '24px Courier', fill: '#000000' });

        this.amount = this.scene.add.text(10,100, ' 0.01 ETH', { font: '32px Courier', fill: '#00ff00' });

		this.sendButton = this.scene.add.sprite(this.myAvatar.x,this.myAvatar.y - toRes(60) ,"sendButton").setScale(toRes(0.3));
 
		this.sendButton.setInteractive({useHandCursor:true});

		this.sendButton.on("pointerdown",()=>{

				this.setFormInvisible();
				eventHub.$emit("avatarEnterBus");

		});

		this.add(this.sendButton);
        // this.scene.input.keyboard.on('keydown', event =>
        // {

        //     if (event.keyCode === 8 &&  this.receptextEntry.text.length > 0)
        //     {
		// 		this.receptextEntry.text =  this.receptextEntry.text.substr(0,  this.receptextEntry.text.length - 1);
        //     }
        //     else if (event.keyCode === 32 || (event.keyCode >= 48 && event.keyCode < 90))
        //     {
		// 		this.receptextEntry.text += event.key;
        //     }

        // });

		this.add(this.amount);
		this.add(this.ToText);
		this.add(this.userAdress);

		this.setFormInvisible();
        // this.userAdress = new TextInput('font', {
        //     x: this.myAvatar.x,
        //     y: this.myAvatar.y,
        //     align: 1,
        //     width: 300,
        //     size: 30,
        //     text: 'ADRESS',
        //     label:"0x3ff0812e7dd0f7f37b0e9b619198b70084df9399",
        //     padding: 8,
        //     maxlength: 8,
        //     backgroundColor: 0x000000,
        //     backgroundAlpha: 0.4
        // });

		//this.add(this.userAdress);

 }


 Avatar.prototype.setFormVisible = function (scene){
	this.Popupbackground.visible = true;
	this.HeaderPopupbackground.visible = true;
	this.popUpTextHeader.visible = true;
	this.userAdress.visible = true;
	this.ToText.visible = true;
	this.amount.visible = true;
	this.sendButton.visible = true;
	this.myFormIsVisible = true;


 }

 Avatar.prototype.setFormInvisible = function (scene){
	this.Popupbackground.visible = false;
	this.HeaderPopupbackground.visible = false;
	this.popUpTextHeader.visible = false;
	this.userAdress.visible = false;
	this.ToText.visible = false;
	this.amount.visible = false;
	this.sendButton.visible = false;
	this.myFormIsVisible = false;
 }

 Avatar.prototype.updateAvatarPopUp = function(scene){

	if(this.avatarPopUp){

	this.avatarPopUp.y = this.myAvatar.y+toRes(60);
	this.avatarPopUp.x = this.myAvatar.x;

	this.transferButton.x = this.myAvatar.x-toRes(70)
	this.transferButton.y = this.myAvatar.y-toRes(100);

	this.bridgeTxButton.x = this.myAvatar.x+toRes(70);
	this.bridgeTxButton.y = this.myAvatar.y-toRes(100);

	this.Popupbackground.x = this.myAvatar.x-toRes(450);
	this.Popupbackground.y = this.myAvatar.y-toRes(650);

	this.HeaderPopupbackground.x =this.myAvatar.x-toRes(450);
	this.HeaderPopupbackground.y = this.myAvatar.y-toRes(650);

	this.popUpTextHeader.x = this.myAvatar.x;
	this.popUpTextHeader.y = this.myAvatar.y-toRes(340);

	this.userAdress.x = this.myAvatar.x - toRes(190);
	this.userAdress.y = this.myAvatar.y - toRes(250);

	this.ToText.x = this.myAvatar.x - toRes(190);
	this.ToText.y = this.myAvatar.y - toRes(200);

	this.amount.x = this.myAvatar.x - toRes(150);
	this.amount.y = this.myAvatar.y - toRes(150);

	this.sendButton.x = this.myAvatar.x ;
	this.sendButton.y = this.myAvatar.y - toRes(60);
	}

 }

export default Avatar;
