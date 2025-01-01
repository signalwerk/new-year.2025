let e;const t=Math.floor(10.714285714285715),s={BACKGROUND:"#edf1e7",TEXT:"#c0aa9a",DEFENSE_OPTION_TEXT:"#c0aa9a",DEFENSE_OPTION_TEXT_INACTIVE:"#f00",BUTTON:"#444",BUTTON_TEXT:"#fff",PROGRESS_BAR:"#c0aa9a",PROGRESS_BORDER:"#c0aa9a",DEFENSE_BACKGROUND:"rgba(255,255,255,0.2)",GRID_LINE:"rgba(0,0,0,0.25)",SELECTION:"rgba(255,80,80,0.7)",HEART_FILL:"#c0aa9a",HEART_STROKE:"#c0aa9a"},i={LEVEL:"Level",SCORE:"Punkte",CURRENCY:"Geld:"},a={levelVersion:"1.8.3",baseDuration:3e4,durationIncrease:0,maxLevels:30,difficultyMultiplier:.85,meteorWeights:{start:{small:1,medium:0,large:0},end:{small:0,medium:.35,large:.65}},minSpawnGap:900,minSpawnGapEnd:200,maxSpawnGap:1300,maxSpawnGapEnd:200,difficultyRamp:1.25,waveDuration:6200,waveDurationEnd:1200,waveGap:3200,waveGapEnd:400},l=function(e=a){let t=[],s=e.difficultyMultiplier;for(let a=0;a<e.maxLevels;a++){let m=(e.baseDuration+e.durationIncrease*a)/Math.sqrt(s),g=[],f=1e3;for(e.difficultyRamp;f<m-2e3;){var l,h,r,n,o,c,d;let t=f/m,i=(l=e.waveDuration/Math.sqrt(s),l+(e.waveDurationEnd/Math.sqrt(s)-l)*t*t),a=f+i;for(;f<a;){let t=(f-(a-i))/i,l=function(e){let t=Math.random()*(e.small+e.medium+e.large);return t<e.small?0:t<e.small+e.medium?1:2}({small:(h=e.meteorWeights.start.small,h+(e.meteorWeights.end.small/s-h)*t*t),medium:(r=e.meteorWeights.start.medium,r+(e.meteorWeights.end.medium*s-r)*t*t),large:(n=e.meteorWeights.start.large,n+(e.meteorWeights.end.large*s-n)*t*t)}),d=Math.floor(6*Math.random());g.push({type:l,lane:d,startTime:Math.floor(f)});let m=(o=e.minSpawnGap/s,o+(e.minSpawnGapEnd/s-o)*t*t);f+=Math.random()*(c=e.maxSpawnGap/s,c+(e.maxSpawnGapEnd/s-c)*t*t-m)+m}f+=(d=e.waveGap/s,d+(e.waveGapEnd/s-d)*t*t)}t.push({name:`${i.LEVEL} ${a+1}`,duration:m,meteors:g.sort((e,t)=>e.startTime-t.startTime)})}return t}(),h={LOADING:"loading",MENU:"menu",PLAYING:"playing",LIFE_LOST:"lifeLost",LEVEL_COMPLETE:"levelComplete",GAME_OVER:"gameover",GAME_COMPLETE:"gameComplete"},r=[{id:0,name:"Basic",color:"#4CAF50",cost:100,damage:10,health:100},{id:1,name:"Medium",color:"#2196F3",cost:140,damage:20,health:100},{id:2,name:"Strong",color:"#9C27B0",cost:180,damage:30,health:100}],n=[{id:0,name:"Small",color:"#FF9999",health:30,speed:.2,damageRate:30,rotateRate:5e-4,wiggleRate:.001,wiggleAmount:7,sizeMultiplier:{x:1,y:1},coinReward:20},{id:1,name:"Medium",color:"#FF4444",health:60,speed:.14,damageRate:50,rotateRate:0,wiggleRate:.03,wiggleAmount:.03,sizeMultiplier:{x:1,y:2},coinReward:40},{id:2,name:"Large",color:"#FF0000",health:90,speed:.2,damageRate:50,rotateRate:0,wiggleRate:.03,wiggleAmount:.03,sizeMultiplier:{x:1,y:2},coinReward:50}],o={TINY:{size:28,family:"GameText",get full(){return`${this.size}px ${this.family}`}},SMALL:{size:52,family:"GameText",get full(){return`${this.size}px ${this.family}`}},LARGE:{size:72,family:"GameText",get full(){return`${this.size}px ${this.family}`}},TITLE:{size:144,family:"GameTitle",get full(){return`${this.size}px ${this.family}`}}},c=["/assets/img/meteor-1.png","/assets/img/meteor-2.png","/assets/img/meteor-3.png"],d=["/assets/img/defense-1.png","/assets/img/defense-2.png","/assets/img/defense-3.png"];class m{constructor(){this.images=new Map,this.fonts=new Map,this.totalAssets=0,this.loadedAssets=0}async loadAll(){let e=c.map((e,t)=>this.loadImage(`meteor-${t}`,e)),t=d.map((e,t)=>this.loadImage(`defense-${t}`,e)),s=this.loadImage("background","/assets/img/bg.png"),i=[this.loadFont("GameTitle","/assets/fonts/pilowlava/Fonts/webfonts/Pilowlava-Regular.woff2"),this.loadFont("GameText","/assets/fonts/space-mono/SpaceMono-Regular.ttf")];try{return await Promise.all([...e,...t,s,...i]),!0}catch(e){return console.error("Error loading assets:",e),!1}}loadImage(e,t){return new Promise((s,i)=>{let a=new Image;this.totalAssets++,a.onload=()=>{this.images.set(e,a),this.loadedAssets++,s(a)},a.onerror=()=>{i(Error(`Failed to load image: ${t}`))},a.src=t})}getImage(e){return this.images.get(e)}getLoadingProgress(){return this.totalAssets?this.loadedAssets/this.totalAssets:0}async loadFont(e,t){this.totalAssets++;let s=new FontFace(e,`url(${t})`);try{let t=await s.load();return document.fonts.add(t),this.fonts.set(e,t),this.loadedAssets++,t}catch(e){throw console.error(`Failed to load font: ${t}`,e),e}}}class g{constructor(e,t=n[0]){this.lane=e,this.type=t,this.y=160,this.health=t.health,this.speed=t.speed,this.isBlocked=!1,this.blockingDefense=null,this.baseRotation=0,this.wiggleRotation=0,this.wiggleOffset=0,this.baseX=160+186.66666666666666*e+93.33333333333333}update(e){this.isBlocked||(this.y+=this.speed*e,this.baseRotation+=this.type.rotateRate*e,this.wiggleOffset+=this.type.wiggleRate*e,this.wiggleRotation=Math.cos(this.wiggleOffset)*this.type.wiggleAmount*.5)}block(e){this.isBlocked=!0,this.blockingDefense=e}unblock(){this.isBlocked=!1,this.blockingDefense=null}draw(t){let s=this.baseX+Math.sin(this.wiggleOffset)*this.type.wiggleAmount,i=e?.assetLoader.getImage(`meteor-${this.type.id}`);if(i){t.save(),t.translate(s,this.y),t.rotate(this.baseRotation+this.wiggleRotation);let e=149.33333333333334*this.type.sizeMultiplier.y,a=149.33333333333334*this.type.sizeMultiplier.x;t.drawImage(i,-a/2,-e/2,a,e),t.restore()}else t.fillStyle=this.type.color,t.beginPath(),t.arc(s,this.y,10,0,2*Math.PI),t.fill()}takeDamage(e){return this.health-=e,this.health<=0}}class f{constructor(e,t=s.BUTTON,i=s.BUTTON_TEXT,a=16){this.x=360,this.y=1190,this.width=720,this.height=180,this.text=e,this.backgroundColor=t,this.textColor=i,this.fontSize=a}isClicked(e,t){return e>=this.x&&e<=this.x+this.width&&t>=this.y&&t<=this.y+this.height}draw(e){e.fillStyle=this.backgroundColor,e.fillRect(this.x,this.y,this.width,this.height),e.fillStyle=this.textColor,e.font=o.LARGE.full,e.textAlign="center",e.textBaseline="middle",e.fillText(this.text,this.x+this.width/2,this.y+this.height/2)}}class u{constructor(e,t,s){this.x=e,this.y=t,this.speed=1.2,this.damage=s,this.size=16}update(e){this.y-=this.speed*e}draw(e){e.fillStyle="black",e.beginPath(),e.arc(this.x,this.y,this.size,0,2*Math.PI),e.fill()}checkCollision(e){let t=160+186.66666666666666*e.lane+93.33333333333333,s=this.x-t,i=this.y-e.y;return Math.sqrt(s*s+i*i)<this.size+10}isOffScreen(){return this.y<160}}class p{constructor(e=null){this.type=e,this.health=e?e.health:0,this.maxHealth=e?e.health:0,this.projectiles=[],this.lastFireTime=0,this.fireRate=1e3,this.blockingMeteors=[]}isEmpty(){return null===this.type}takeDamage(e){return this.health-=e,this.health<=0}update(e,t,s,i,a){if(!this.isEmpty()){e-this.lastFireTime>this.fireRate&&(this.projectiles.push(new u(t,s,this.type.damage)),this.lastFireTime=e);let l=Math.floor((s-160)/186.66666666666666);i.forEach(e=>{Math.floor((e.y-160)/186.66666666666666)===l&&e.lane===Math.floor((t-160)/186.66666666666666)&&(e.isBlocked||(e.block(this),this.blockingMeteors.push(e)),e.blockingDefense===this&&this.takeDamage(e.type.damageRate/60)&&(this.blockingMeteors.forEach(e=>e.unblock()),this.blockingMeteors=[],this.type=null,this.health=0,this.maxHealth=0))}),this.projectiles=this.projectiles.filter(e=>{e.update(16);for(let t=0;t<i.length;t++){let s=i[t];if(e.checkCollision(s)){if(s.takeDamage(e.damage)){let e=160+186.66666666666666*s.lane+93.33333333333333;a.push(new y(e,s.y,s.type.coinReward)),i.splice(t,1)}return!1}}return!e.isOffScreen()})}}draw(t,i,a,l,h=!1,r=!1){if(t.strokeStyle=this.isEmpty()?s.GRID_LINE:"#888",t.lineWidth=4,t.strokeRect(i-l/2,a-l/2,l,l),t.fillStyle=s.DEFENSE_BACKGROUND,t.fillRect(i-l/2,a-l/2,l,l),!this.isEmpty()){if(e?.assetLoader){let s=e.assetLoader.getImage(`defense-${this.type.id}`);s&&(r?t.globalAlpha=.5:t.globalAlpha=Math.max(.3,this.health/this.maxHealth),t.drawImage(s,i-l/2,a-l/2,l,l),t.globalAlpha=1)}this.projectiles.forEach(e=>e.draw(t)),h&&(t.strokeStyle=s.SELECTION,t.lineWidth=16,t.strokeRect(i-l/2,a-l/2,l,l))}}}class w{constructor(e,t,s){this.type=e,this.x=t,this.y=s,this.defense=new p(e)}draw(e,t=!1,i=0){let a=i<this.type.cost;this.defense.draw(e,this.x+93.33333333333333,this.y+93.33333333333333,186.66666666666666,t,a),e.fillStyle=a?s.DEFENSE_OPTION_TEXT_INACTIVE:s.DEFENSE_OPTION_TEXT,e.font=o.SMALL.full,e.textAlign="center",e.fillText(`$${this.type.cost}`,this.x+93.33333333333333,this.y+186.66666666666666+60)}isClicked(e,t){return e>=this.x&&e<=this.x+186.66666666666666&&t>=this.y&&t<=this.y+186.66666666666666}}class S{constructor(e,t,s,i){this.x=e,this.y=t,this.row=s,this.lane=i,this.defense=new p}isEmpty(){return this.defense.isEmpty()}placeDefense(e){return!!this.isEmpty()&&(this.defense=new p(e),!0)}removeDefense(){this.defense=new p}draw(e){this.defense.draw(e,this.x,this.y,186.66666666666666)}update(e,t,s){this.defense.update(e,this.x,this.y,t,s)}}class y{constructor(e,t,s=10){this.x=e,this.y=t,this.value=s,this.lifetime=5e3,this.createTime=performance.now(),this.hitRadius=120,this.size=4*(8+(s-10)/10*2);let i=Math.random()*Math.PI*2,a=4*(.3+.1*Math.random());this.vx=Math.cos(i)*a,this.vy=Math.sin(i)*a,this.waveAmplitude=4*(2.2+.2*Math.random()),this.waveFrequency=.005+.001*Math.random(),this.waveOffset=Math.random()*Math.PI*2,this.baseX=e,this.baseY=t,this.time=0}draw(e,t){let s=t-this.createTime,i=this.lifetime-s;if(i<1500&&Math.floor(t/(100+i/1500*400))%2==0)return;let a=this.x+Math.sin(this.time*this.waveFrequency+this.waveOffset)*this.waveAmplitude,l=this.y+Math.cos(this.time*this.waveFrequency+this.waveOffset)*this.waveAmplitude,h=e.createRadialGradient(a-this.size/3,l-this.size/3,0,a,l,this.size);h.addColorStop(0,"#FFD700"),h.addColorStop(1,"#DAA520"),e.fillStyle=h,e.beginPath(),e.arc(a,l,this.size,0,2*Math.PI),e.fill(),e.strokeStyle="#B8860B",e.lineWidth=4,e.stroke(),e.fillStyle="black",e.globalAlpha=.7,e.font=`${Math.max(10,this.size)}px ${o.SMALL.family}`,e.textAlign="center",e.textBaseline="middle",e.fillText(`${this.value}`,a,l+this.size/8),e.globalAlpha=1}update(e){return this.time+=16,this.baseX+=this.vx,this.baseY+=this.vy,this.x=this.baseX+Math.sin(this.time*this.waveFrequency+this.waveOffset)*this.waveAmplitude,this.y=this.baseY+Math.cos(this.time*this.waveFrequency+this.waveOffset)*this.waveAmplitude,e-this.createTime<this.lifetime}isClicked(e,t){let s=e-this.x,i=t-this.y;return Math.sqrt(s*s+i*i)<this.hitRadius}}class v{constructor(){this.currentLevel=0,this.levelStartTime=0,this.remainingMeteors=[],this.allMeteorsSpawned=!1,this.pauseStartTime=0,this.totalPausedTime=0}startLevel(e){this.currentLevel=e,this.levelStartTime=performance.now(),this.remainingMeteors=[...l[e].meteors],this.allMeteorsSpawned=!1,this.totalPausedTime=0}update(e,t){if(this.currentLevel>=l.length)return!1;let s=e-this.levelStartTime-this.totalPausedTime;if(s>=l[this.currentLevel].duration)return this.allMeteorsSpawned=!0,!1;for(;this.remainingMeteors.length>0&&s>=this.remainingMeteors[0].startTime;){let e=this.remainingMeteors.shift();t.push(new g(e.lane,n[e.type]))}return 0===this.remainingMeteors.length&&(this.allMeteorsSpawned=!0),!0}isLevelComplete(e){return this.allMeteorsSpawned&&0===e.length}getLevelProgress(){let e=performance.now(),t=e-this.levelStartTime-this.totalPausedTime;return this.pauseStartTime&&(t-=e-this.pauseStartTime),Math.min(t/l[this.currentLevel].duration,1)}pause(){this.pauseStartTime||(this.pauseStartTime=performance.now())}resume(){this.pauseStartTime&&(this.totalPausedTime+=performance.now()-this.pauseStartTime,this.pauseStartTime=0)}}const E="meteorDefenseHighScore";class x{static drawTitle(e,t,i=s.TEXT,a=null){let l=1.5*o.TITLE.size,h=1.3*o.LARGE.size;e.fillStyle=i,e.font=o.TITLE.full,e.textAlign="center",e.textBaseline="middle",e.fillText(t,720,640),a&&(e.font=o.LARGE.full,a.split("\n").forEach((t,s)=>{e.fillText(t,720,640+l+s*h)}))}}class T{constructor(){this.canvas=document.getElementById("canvas"),this.ctx=this.canvas.getContext("2d"),this.lastTime=0,this.meteors=[],this.coins=[],this.assetLoader=new m,this.gameState=h.LOADING,this.initializeCanvas(),window.addEventListener("resize",()=>this.initializeCanvas()),this.loadAssets(),requestAnimationFrame(e=>this.gameLoop(e)),this.testMeteor=new g(2),this.gameState=h.MENU,this.setupEventListeners(),this.startButton=new f("Start Game"),this.retryButton=new f("Try Again"),this.currency=500,this.defenseOptions=this.createDefenseOptions(),this.selectedDefense=null,this.defenseGrid=this.createDefenseGrid(),this.levelManager=new v,this.nextLevelButton=new f("Next Level"),this.continueButton=new f("Continue"),this.lifeLostText=new f("Life Lost!"),this.lives=3,this.currentScore=0,this.highScore=this.loadHighScore(),this.levelHighScore=this.loadLevelHighScore(),this.gameOverColor="#FF4444",this.successColor="#4CAF50"}initializeCanvas(){let e;let t=window.innerWidth,s=window.innerHeight;e=Math.min(e=t/s>.5625?s/2560:t/1440,1),this.canvas.width=1440,this.canvas.height=2560,this.canvas.style.width=`${1440*e}px`,this.canvas.style.height=`${2560*e}px`}setupEventListeners(){this.canvas.addEventListener("click",e=>{let t=this.canvas.getBoundingClientRect(),s=this.canvas.width/t.width,i=(e.clientX-t.left)*s,a=(e.clientY-t.top)*s;if(this.gameState===h.MENU)this.startButton.isClicked(i,a)&&this.startGame();else if(this.gameState===h.GAME_OVER)this.retryButton.isClicked(i,a)&&this.startGame();else if(this.gameState===h.LEVEL_COMPLETE)this.nextLevelButton.isClicked(i,a)&&this.startNextLevel();else if(this.gameState===h.PLAYING){let e=!1;for(let t=this.coins.length-1;t>=0;t--){let s=this.coins[t];if(s.isClicked(i,a)){this.currency+=s.value,this.currentScore+=s.value,this.coins.splice(t,1),e=!0;break}}if(!e&&(this.defenseOptions.forEach(e=>{e.isClicked(i,a)&&(this.selectedDefense===e.type?(this.selectedDefense=null,console.log("Defense deselected")):this.currency>=e.type.cost?(this.selectedDefense=e.type,console.log(`Selected ${e.type.name} defense`)):console.log("Not enough currency!"))}),this.selectedDefense)){let e=this.getSpotAtPosition(i,a);e&&e.isEmpty()&&this.currency>=this.selectedDefense.cost&&(e.placeDefense(this.selectedDefense),this.currency-=this.selectedDefense.cost,this.selectedDefense=null)}}else this.gameState===h.LIFE_LOST&&this.continueButton.isClicked(i,a)&&(this.continuePlaying(),this.currency+=120)})}startGame(){this.gameState=h.PLAYING,this.meteors=[],this.coins=[],this.currency=500,this.selectedDefense=null,this.lives=3,this.currentScore=0,this.levelManager.startLevel(0);for(let e=0;e<this.defenseGrid.length;e++)for(let t=0;t<this.defenseGrid[e].length;t++)this.defenseGrid[e][t].removeDefense()}startNextLevel(){this.meteors=[],this.coins=[],this.currency=500,this.selectedDefense=null;for(let e=0;e<this.defenseGrid.length;e++)for(let t=0;t<this.defenseGrid[e].length;t++)this.defenseGrid[e][t].removeDefense();this.levelManager.startLevel(this.levelManager.currentLevel+1),this.gameState=h.PLAYING}gameLoop(e){let t=e-this.lastTime;this.lastTime=e,this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.update(t),this.draw(),requestAnimationFrame(e=>this.gameLoop(e))}drawBackground(){let e=this.assetLoader.getImage("background");e?(this.ctx.fillStyle="#000",this.ctx.fillRect(0,0,1440,2560),this.ctx.drawImage(e,0,0,1440,2560)):(this.ctx.fillStyle=s.BACKGROUND,this.ctx.fillRect(0,0,1440,2560))}drawDefenseGrid(){for(let e=0;e<this.defenseGrid.length;e++)for(let t=0;t<this.defenseGrid[e].length;t++)this.defenseGrid[e][t].draw(this.ctx)}update(e){if(this.gameState===h.PLAYING){let t=performance.now();for(let e=0;e<this.defenseGrid.length;e++)for(let s=0;s<this.defenseGrid[e].length;s++)this.defenseGrid[e][s].update(t,this.meteors,this.coins);this.meteors=this.meteors.filter(t=>(t.update(e),!(t.y>=2160)||(this.lives--,this.lives<=0?(this.currentScore>this.highScore&&(this.highScore=this.currentScore,this.saveHighScore()),this.levelManager.currentLevel>this.levelHighScore&&(this.levelHighScore=this.levelManager.currentLevel,this.saveLevelHighScore()),this.gameState=h.GAME_OVER):this.gameState=h.LIFE_LOST,!1))),this.coins=this.coins.filter(e=>e.update(t)),this.levelManager.update(t,this.meteors),this.levelManager.isLevelComplete(this.meteors)&&(this.levelManager.currentLevel>=l.length-1?this.gameState=h.GAME_COMPLETE:this.gameState=h.LEVEL_COMPLETE)}else this.gameState===h.LIFE_LOST&&this.levelManager.pause()}drawCurrency(){this.ctx.fillStyle=s.TEXT,this.ctx.font=o.SMALL.full,this.ctx.textAlign="center",this.ctx.fillText(`${i.CURRENCY} $${this.currency}`,720,2220),this.ctx.textAlign="left",this.ctx.fillText(`${this.currentScore} ${i.SCORE}`,160,240)}draw(){if(this.drawBackground(),this.gameState===h.LOADING)this.drawLoadingScreen();else if(this.gameState===h.MENU)x.drawTitle(this.ctx,"HELLO!",s.TEXT,"Welcome to the game!\nTwo words about the game."),this.startButton.draw(this.ctx),this.drawVersion();else if(this.gameState===h.PLAYING){this.drawDefenseGrid(),this.drawCurrency(),this.drawLives(),this.drawProgressBar(this.ctx),this.defenseOptions.forEach(e=>{e.draw(this.ctx,this.selectedDefense&&e.type.id===this.selectedDefense.id,this.currency)}),this.meteors.forEach(e=>e.draw(this.ctx));let e=performance.now();this.coins.forEach(t=>t.draw(this.ctx,e)),this.drawVersion()}else this.gameState===h.LIFE_LOST?(this.drawCurrency(),this.drawLives(),this.drawProgressBar(this.ctx),this.ctx.fillStyle="rgba(0, 0, 0, 0.7)",this.ctx.fillRect(0,0,1440,2560),x.drawTitle(this.ctx,"Life Lost!",this.gameOverColor,`${this.lives} ${1===this.lives?"life":"lives"} remaining`),this.continueButton.draw(this.ctx)):this.gameState===h.LEVEL_COMPLETE?(x.drawTitle(this.ctx,"Level Complete!",this.successColor),this.nextLevelButton.draw(this.ctx)):this.gameState===h.GAME_COMPLETE?x.drawTitle(this.ctx,"Game Complete!",this.successColor,`Final Score: ${this.currentScore}`):this.gameState===h.GAME_OVER&&(x.drawTitle(this.ctx,"Game Over!",this.gameOverColor,`Final Score: ${this.currentScore} (Level ${this.levelManager.currentLevel+1})`),this.retryButton.draw(this.ctx))}createDefenseOptions(){let e=(1440-(266.66666666666663*r.length-80))/2;return r.map((t,s)=>new w(t,e+266.66666666666663*s,2280))}createDefenseGrid(){let e=[];for(let s=0;s<t;s++){let t=[];for(let e=0;e<6;e++){let i=160+186.66666666666666*e+93.33333333333333,a=2160-186.66666666666666*s-93.33333333333333;t.push(new S(i,a,s,e))}e.push(t)}return e}getSpotAtPosition(e,t){for(let s=0;s<this.defenseGrid.length;s++)for(let i=0;i<this.defenseGrid[s].length;i++){let a=this.defenseGrid[s][i];if(e>=a.x-93.33333333333333&&e<=a.x+93.33333333333333&&t>=a.y-93.33333333333333&&t<=a.y+93.33333333333333)return a}return null}drawProgressBar(e){e.fillStyle="rgba(0, 0, 0, 0.5)",e.fillRect(160,80,1120,80);let t=1-this.levelManager.getLevelProgress();e.fillStyle=s.PROGRESS_BAR,e.fillRect(160,80,1120*t,80),e.strokeStyle=s.PROGRESS_BORDER,e.lineWidth=8,e.strokeRect(160,80,1120,80),e.fillStyle=s.TEXT,e.font=o.SMALL.full,e.textAlign="center",e.fillText(`${l[this.levelManager.currentLevel].name}`,720,240)}async loadAssets(){await this.assetLoader.loadAll()?this.gameState=h.MENU:console.error("Failed to load assets")}drawLoadingScreen(){let e=this.assetLoader.getLoadingProgress();this.ctx.fillStyle=s.BUTTON,this.ctx.fillRect(620,1280,200,20),this.ctx.fillStyle="#4CAF50",this.ctx.fillRect(620,1280,200*e,20),this.ctx.strokeStyle=s.TEXT,this.ctx.strokeRect(620,1280,200,20),this.ctx.fillStyle=s.TEXT,this.ctx.font=o.LARGE.full,this.ctx.textAlign="center",this.ctx.fillText("Loading...",720,1200),this.ctx.fillText(`${Math.floor(100*e)}%`,720,1440)}drawLives(){for(let e=0;e<3;e++){let t=1070+88*e;this.ctx.strokeStyle=s.HEART_STROKE,this.ctx.lineWidth=8,this.drawHeart(t,206,68),e<this.lives&&(this.ctx.fillStyle=s.HEART_FILL,this.drawHeart(t,206,68,!0))}}drawHeart(e,t,s,i=!1){let a=new Path2D;a.moveTo(e,t+s/4),a.bezierCurveTo(e,t,e-s/2,t,e-s/2,t+s/4),a.bezierCurveTo(e-s/2,t+s/2,e,t+3*s/4,e,t+3*s/4),a.bezierCurveTo(e,t+3*s/4,e+s/2,t+s/2,e+s/2,t+s/4),a.bezierCurveTo(e+s/2,t,e,t,e,t+s/4),i?this.ctx.fill(a):(this.ctx.lineCap="round",this.ctx.stroke(a))}continuePlaying(){this.gameState=h.PLAYING,this.meteors=[],this.levelManager.resume()}loadHighScore(){let e=localStorage.getItem(E+"_coins");return e?parseInt(e,0):0}saveHighScore(){localStorage.setItem(E+"_coins",this.highScore.toString())}drawVersion(){this.ctx.globalAlpha=.5,this.ctx.fillStyle=s.TEXT,this.ctx.font=o.TINY.full,this.ctx.textAlign="right",this.ctx.fillText(`v${a.levelVersion}`,1420,2540),this.ctx.globalAlpha=1}loadLevelHighScore(){let e=localStorage.getItem(E+"_level");return e?parseInt(e,0):0}saveLevelHighScore(){localStorage.setItem(E+"_level",this.levelHighScore.toString())}}window.addEventListener("load",()=>{e=new T});
//# sourceMappingURL=index.6143ec9d.js.map
