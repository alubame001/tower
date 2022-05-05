import * as PIXI from 'pixi.js'


import SceneManager from './core/SceneManager'

import Clock from '@gamestdio/timer'
window.clock = new Clock();

import Tweener from 'tweener'
window.Tweener = Tweener
window.tweener = new Tweener();

// define endpoint based on environment
const endpoint = (window.location.hostname.indexOf("com") === -1)
  ? "ws://localhost:2567" // development (local)
  : `${window.location.protocol.replace("http", "ws")}//${window.location.hostname}` // production (remote)
console.log("endpoint:",endpoint)
import { Client } from 'colyseus.js'
window.colyseus = new Client(endpoint);

export default class Application {

  constructor (app) {
    this.app = app

    this.width = 640;
    this.height = 640;

  //  console.log("app",app)
    this.loader = app.loader ;
    
    //{UNKNOWN: 0, WEBGL: 1, CANVAS: 2}
   // console.log("app.renderer.type:",app.renderer.type);
    //this.background = new PIXI.Sprite.fromImage('images/background.jpg')

    this.background = new PIXI.Sprite(app.loader.resources.background.texture);
    this.background.anchor.set(0.5)

    this.background.x = this.screenWidth / 2
    this.background.y = this.screenHeight / 2

    this.app.stage =new SceneManager(this.scale)

   
    this.app.stage.addChild(this.background);

    // canvas size
    this.screenWidth = window.innerWidth
    this.screenHeight = window.innerHeight
 //   console.log(this.screenWidth,this.screenHeight)

    this.scaledWidth = this.screenWidth / this.scale
    this.scaledHeight = this.screenHeight / this.scale    
    this.scale = this.getMaxScale();   
    tweener.add(this.background).from({ alpha: 0 }, 10000, Tweener.ease.quadOut)
    window.addEventListener('resize', this.onResize.bind(this))
    this.onResize()

  }


  

  onResize (e) {
    this.background.x = window.innerWidth / 2
    this.background.y = window.innerHeight / 2

    this.scale =  this.getMaxScale()

    this.screenWidth = window.innerWidth
    this.screenHeight = window.innerHeight

    this.scaledWidth = this.screenWidth / this.scale
    this.scaledHeight = this.screenHeight / this.scale

    this.app.renderer.resize(this.screenWidth, this.screenHeight)

   //  this.app.stage.x = this.screenWidth / 2
    // this.app.stage.y = this.screenHeight / 2

     this.app.stage.x = 0
     this.app.stage.y = 0
  //   console.log("this.scale ",this.scale)
    this.app.stage.scale.set(this.scale)

    Application.WIDTH = this.scaledWidth
    Application.HEIGHT = this.scaledHeight
    Application.MARGIN = (this.scaledHeight / 100) * 10

  }

  gotoScene (sceneClass,loader) {
    this.app.stage.goTo(sceneClass,loader)
  }

  getMaxScale () {
   
 //   console.log("window.innerWidth",window.innerWidth)
 //   console.log("this.width",this.width)

    return Math.min(window.innerWidth / this.width, 1)
  }

  update () {
    window.requestAnimationFrame( this.update.bind( this) )
    clock.tick()

    tweener.update(clock.deltaTime)

   //  this.app.renderer.render(this.container)
  }

}
