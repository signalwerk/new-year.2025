let e;const t=Math.floor(10.714285714285715),i="0.05em",s={BACKGROUND:"#edf1e7",TEXT:"#c0aa9a",DEFENSE_OPTION_TEXT:"#c0aa9a",DEFENSE_OPTION_TEXT_INACTIVE:"#f00",BUTTON:"#5d908a",BUTTON_TEXT:"#fff",PROGRESS_BAR:"#c0aa9a",PROGRESS_BORDER:"#c0aa9a",DEFENSE_BACKGROUND:"rgba(255,255,255,0.2)",GRID_LINE:"rgba(0,0,0,0.25)",SELECTION:"rgba(255,80,80,0.7)",HEART_FILL:"#c0aa9a",HEART_STROKE:"#c0aa9a",GAME_OVER_COLOR:"#FF4444",SUCCESS_COLOR:"#5c8e8b"},a={TITLE:TXT?.TITLE||"Meteor\nDefense",SUB_TITLE:TXT?.SUB_TITLE||"Alles Gute im neuen Jahr!",INTRO:TXT?.INTRO||"",START_GAME:"Start!",TRY_AGAIN:"Neustart!",LIVES:"Leben:",LEVEL:"Level",SCORE:"Punkte",COINS:"Coins:",CURRENCY:"Geld:",HIGH_SCORE:"Rekord",LEVEL_COMPLETE:"Geschafft!",GAME_OVER:"Game Over!",GAME_COMPLETE:"Alle\nLevels\ngeschafft!",LIFE_LOST:"Leben\nverloren!",CONTINUE:"Weiter",NEXT_LEVEL:"Nächstes Level",LIFE_REMAINING:e=>`noch ${e} Leben`},l={levelVersion:"1.8.4",baseDuration:3e4,durationIncrease:0,maxLevels:30,difficultyMultiplier:.85,meteorWeights:{start:{small:1,medium:0,large:0},end:{small:0,medium:.35,large:.65}},minSpawnGap:900,minSpawnGapEnd:200,maxSpawnGap:1300,maxSpawnGapEnd:200,difficultyRamp:1.25,waveDuration:6200,waveDurationEnd:1200,waveGap:3200,waveGapEnd:400},h=function(e=l){let t=[],i=e.difficultyMultiplier;for(let l=0;l<e.maxLevels;l++){let g=(e.baseDuration+e.durationIncrease*l)/Math.sqrt(i),m=[],f=1e3;for(e.difficultyRamp;f<g-2e3;){var s,h,r,n,o,c,d;let t=f/g,a=(s=e.waveDuration/Math.sqrt(i),s+(e.waveDurationEnd/Math.sqrt(i)-s)*t*t),l=f+a;for(;f<l;){let t=(f-(l-a))/a,s=function(e){let t=Math.random()*(e.small+e.medium+e.large);return t<e.small?0:t<e.small+e.medium?1:2}({small:(h=e.meteorWeights.start.small,h+(e.meteorWeights.end.small/i-h)*t*t),medium:(r=e.meteorWeights.start.medium,r+(e.meteorWeights.end.medium*i-r)*t*t),large:(n=e.meteorWeights.start.large,n+(e.meteorWeights.end.large*i-n)*t*t)}),d=Math.floor(6*Math.random());m.push({type:s,lane:d,startTime:Math.floor(f)});let g=(o=e.minSpawnGap/i,o+(e.minSpawnGapEnd/i-o)*t*t);f+=Math.random()*(c=e.maxSpawnGap/i,c+(e.maxSpawnGapEnd/i-c)*t*t-g)+g}f+=(d=e.waveGap/i,d+(e.waveGapEnd/i-d)*t*t)}t.push({name:`${a.LEVEL} ${l+1}`,duration:g,meteors:m.sort((e,t)=>e.startTime-t.startTime)})}return t}(),r={LOADING:"loading",MENU:"menu",PLAYING:"playing",LIFE_LOST:"lifeLost",LEVEL_COMPLETE:"levelComplete",GAME_OVER:"gameover",GAME_COMPLETE:"gameComplete"},n=[{id:0,name:"Basic",color:"#4CAF50",cost:100,damage:10,health:100},{id:1,name:"Medium",color:"#2196F3",cost:140,damage:20,health:100},{id:2,name:"Strong",color:"#9C27B0",cost:180,damage:30,health:100}],o=[{id:0,name:"Small",color:"#FF9999",health:30,speed:.2,damageRate:30,rotateRate:5e-4,wiggleRate:.001,wiggleAmount:7,sizeMultiplier:{x:1,y:1},coinReward:20},{id:1,name:"Medium",color:"#FF4444",health:60,speed:.14,damageRate:50,rotateRate:0,wiggleRate:.03,wiggleAmount:.03,sizeMultiplier:{x:1,y:2},coinReward:40},{id:2,name:"Large",color:"#FF0000",health:90,speed:.2,damageRate:50,rotateRate:0,wiggleRate:.03,wiggleAmount:.03,sizeMultiplier:{x:1,y:2},coinReward:50}],c={TINY:{size:28,family:"GameText",get full(){return`${this.size}px ${this.family}`}},SMALL:{size:52,family:"GameText",get full(){return`${this.size}px ${this.family}`}},LARGE:{size:72,family:"GameText",get full(){return`${this.size}px ${this.family}`}},TITLE:{size:168,family:"GameTitle",get full(){return`${this.size}px ${this.family}`}}},d=["/assets/img/meteor-1.png","/assets/img/meteor-2.png","/assets/img/meteor-3.png"],g=["/assets/img/defense-1.png","/assets/img/defense-2.png","/assets/img/defense-3.png"];class m{constructor(){this.images=new Map,this.fonts=new Map,this.totalAssets=0,this.loadedAssets=0}async loadAll(){let e=d.map((e,t)=>this.loadImage(`meteor-${t}`,e)),t=g.map((e,t)=>this.loadImage(`defense-${t}`,e)),i=this.loadImage("background","/assets/img/bg.png"),s=[this.loadFont("GameTitle","/assets/fonts/pilowlava/Fonts/webfonts/Pilowlava-Regular.woff2"),this.loadFont("GameText","/assets/fonts/space-mono/SpaceMono-Regular.ttf")];try{return await Promise.all([...e,...t,i,...s]),!0}catch(e){return console.error("Error loading assets:",e),!1}}loadImage(e,t){return new Promise((i,s)=>{let a=new Image;this.totalAssets++,a.onload=()=>{this.images.set(e,a),this.loadedAssets++,i(a)},a.onerror=()=>{s(Error(`Failed to load image: ${t}`))},a.src=t})}getImage(e){return this.images.get(e)}getLoadingProgress(){return this.totalAssets?this.loadedAssets/this.totalAssets:0}async loadFont(e,t){this.totalAssets++;let i=new FontFace(e,`url(${t})`);try{let t=await i.load();return document.fonts.add(t),this.fonts.set(e,t),this.loadedAssets++,t}catch(e){throw console.error(`Failed to load font: ${t}`,e),e}}}class f{constructor(e,t=o[0]){this.lane=e,this.type=t,this.y=160,this.health=t.health,this.speed=t.speed,this.isBlocked=!1,this.blockingDefense=null,this.baseRotation=0,this.wiggleRotation=0,this.wiggleOffset=0,this.baseX=160+186.66666666666666*e+93.33333333333333}update(e){this.isBlocked||(this.y+=this.speed*e,this.baseRotation+=this.type.rotateRate*e,this.wiggleOffset+=this.type.wiggleRate*e,this.wiggleRotation=Math.cos(this.wiggleOffset)*this.type.wiggleAmount*.5)}block(e){this.isBlocked=!0,this.blockingDefense=e}unblock(){this.isBlocked=!1,this.blockingDefense=null}draw(t){let i=this.baseX+Math.sin(this.wiggleOffset)*this.type.wiggleAmount,s=e?.assetLoader.getImage(`meteor-${this.type.id}`);if(s){t.save(),t.translate(i,this.y),t.rotate(this.baseRotation+this.wiggleRotation);let e=149.33333333333334*this.type.sizeMultiplier.y,a=149.33333333333334*this.type.sizeMultiplier.x;t.drawImage(s,-a/2,-e/2,a,e),t.restore()}else t.fillStyle=this.type.color,t.beginPath(),t.arc(i,this.y,10,0,2*Math.PI),t.fill()}takeDamage(e){return this.health-=e,this.health<=0}}class u{constructor(e,t=s.BUTTON,i=s.BUTTON_TEXT,a=16){this.x=288,this.y=1172,this.width=864,this.height=216,this.text=e,this.backgroundColor=t,this.textColor=i,this.fontSize=a}isClicked(e,t){return e>=this.x&&e<=this.x+this.width&&t>=this.y&&t<=this.y+this.height}draw(e){e.fillStyle=this.backgroundColor,e.fillRect(this.x,this.y,this.width,this.height),e.fillStyle=this.textColor,e.font=c.LARGE.full,e.textAlign="center",e.textBaseline="middle",e.letterSpacing=i,e.fillText(this.text,this.x+this.width/2,this.y+.52*this.height),e.letterSpacing="0px"}}class E{constructor(e,t,i){this.x=e,this.y=t,this.speed=1.2,this.damage=i,this.size=16}update(e){this.y-=this.speed*e}draw(e){e.fillStyle="black",e.beginPath(),e.arc(this.x,this.y,this.size,0,2*Math.PI),e.fill()}checkCollision(e){let t=160+186.66666666666666*e.lane+93.33333333333333,i=this.x-t,s=this.y-e.y;return Math.sqrt(i*i+s*s)<this.size+40}isOffScreen(){return this.y<160}}class p{constructor(e=null){this.type=e,this.health=e?e.health:0,this.maxHealth=e?e.health:0,this.projectiles=[],this.lastFireTime=0,this.fireRate=1e3,this.blockingMeteors=[]}isEmpty(){return null===this.type}takeDamage(e){return this.health-=e,this.health<=0}update(e,t,i,s,a){if(!this.isEmpty()){e-this.lastFireTime>this.fireRate&&(this.projectiles.push(new E(t,i,this.type.damage)),this.lastFireTime=e);let l=Math.floor((i-160)/186.66666666666666);s.forEach(e=>{Math.floor((e.y-160)/186.66666666666666)===l&&e.lane===Math.floor((t-160)/186.66666666666666)&&(e.isBlocked||(e.block(this),this.blockingMeteors.push(e)),e.blockingDefense===this&&this.takeDamage(e.type.damageRate/60)&&(this.blockingMeteors.forEach(e=>e.unblock()),this.blockingMeteors=[],this.type=null,this.health=0,this.maxHealth=0))}),this.projectiles=this.projectiles.filter(e=>{e.update(16);for(let t=0;t<s.length;t++){let i=s[t];if(e.checkCollision(i)){if(i.takeDamage(e.damage)){let e=160+186.66666666666666*i.lane+93.33333333333333;a.push(new T(e,i.y,i.type.coinReward)),s.splice(t,1)}return!1}}return!e.isOffScreen()})}}draw(t,i,a,l,h=!1,r=!1){if(t.strokeStyle=this.isEmpty()?s.GRID_LINE:"#888",t.lineWidth=4,t.strokeRect(i-l/2,a-l/2,l,l),t.fillStyle=s.DEFENSE_BACKGROUND,t.fillRect(i-l/2,a-l/2,l,l),!this.isEmpty()){if(e?.assetLoader){let s=e.assetLoader.getImage(`defense-${this.type.id}`);s&&(r?t.globalAlpha=.5:t.globalAlpha=Math.max(.3,this.health/this.maxHealth),t.drawImage(s,i-l/2,a-l/2,l,l),t.globalAlpha=1)}this.projectiles.forEach(e=>e.draw(t)),h&&(t.strokeStyle=s.SELECTION,t.lineWidth=16,t.strokeRect(i-l/2,a-l/2,l,l))}}}class S{constructor(e,t,i){this.type=e,this.x=t,this.y=i,this.defense=new p(e)}draw(e,t=!1,a=0){let l=a<this.type.cost;this.defense.draw(e,this.x+93.33333333333333,this.y+93.33333333333333,186.66666666666666,t,l),e.fillStyle=l?s.DEFENSE_OPTION_TEXT_INACTIVE:s.DEFENSE_OPTION_TEXT,e.font=c.SMALL.full,e.textAlign="center",e.letterSpacing=i,e.fillText(`$${this.type.cost}`,this.x+93.33333333333333,this.y+186.66666666666666+60),e.letterSpacing="0px"}isClicked(e,t){return e>=this.x&&e<=this.x+186.66666666666666&&t>=this.y&&t<=this.y+186.66666666666666}}class L{constructor(e,t,i,s){this.x=e,this.y=t,this.row=i,this.lane=s,this.defense=new p}isEmpty(){return this.defense.isEmpty()}placeDefense(e){return!!this.isEmpty()&&(this.defense=new p(e),!0)}removeDefense(){this.defense=new p}draw(e){this.defense.draw(e,this.x,this.y,186.66666666666666)}update(e,t,i){this.defense.update(e,this.x,this.y,t,i)}}class T{constructor(e,t,i=10){this.x=e,this.y=t,this.value=i,this.lifetime=5e3,this.createTime=performance.now(),this.hitRadius=120,this.size=4*(8+(i-10)/10*2);let s=Math.random()*Math.PI*2,a=4*(.3+.1*Math.random());this.vx=Math.cos(s)*a,this.vy=Math.sin(s)*a,this.waveAmplitude=4*(2.2+.2*Math.random()),this.waveFrequency=.005+.001*Math.random(),this.waveOffset=Math.random()*Math.PI*2,this.baseX=e,this.baseY=t,this.time=0}draw(e,t){let s=t-this.createTime,a=this.lifetime-s;if(a<1500&&Math.floor(t/(100+a/1500*400))%2==0)return;let l=this.x+Math.sin(this.time*this.waveFrequency+this.waveOffset)*this.waveAmplitude,h=this.y+Math.cos(this.time*this.waveFrequency+this.waveOffset)*this.waveAmplitude,r=e.createRadialGradient(l-this.size/3,h-this.size/3,0,l,h,this.size);r.addColorStop(0,"#FFD700"),r.addColorStop(1,"#DAA520"),e.fillStyle=r,e.beginPath(),e.arc(l,h,this.size,0,2*Math.PI),e.fill(),e.strokeStyle="#B8860B",e.lineWidth=4,e.stroke(),e.fillStyle="black",e.globalAlpha=.7,e.font=`${Math.max(10,this.size)}px ${c.SMALL.family}`,e.textAlign="center",e.textBaseline="middle",e.letterSpacing=i,e.fillText(`${this.value}`,l,h+this.size/8),e.letterSpacing="0px",e.globalAlpha=1}update(e){return this.time+=16,this.baseX+=this.vx,this.baseY+=this.vy,this.x=this.baseX+Math.sin(this.time*this.waveFrequency+this.waveOffset)*this.waveAmplitude,this.y=this.baseY+Math.cos(this.time*this.waveFrequency+this.waveOffset)*this.waveAmplitude,e-this.createTime<this.lifetime}isClicked(e,t){let i=e-this.x,s=t-this.y;return Math.sqrt(i*i+s*s)<this.hitRadius}}class w{constructor(){this.currentLevel=0,this.levelStartTime=0,this.remainingMeteors=[],this.allMeteorsSpawned=!1,this.pauseStartTime=0,this.totalPausedTime=0}startLevel(e){this.currentLevel=e,this.levelStartTime=performance.now(),this.remainingMeteors=[...h[e].meteors],this.allMeteorsSpawned=!1,this.totalPausedTime=0}update(e,t){if(this.currentLevel>=h.length)return!1;let i=e-this.levelStartTime-this.totalPausedTime;if(i>=h[this.currentLevel].duration)return this.allMeteorsSpawned=!0,!1;for(;this.remainingMeteors.length>0&&i>=this.remainingMeteors[0].startTime;){let e=this.remainingMeteors.shift();t.push(new f(e.lane,o[e.type]))}return 0===this.remainingMeteors.length&&(this.allMeteorsSpawned=!0),!0}isLevelComplete(e){return this.allMeteorsSpawned&&0===e.length}getLevelProgress(){let e=performance.now(),t=e-this.levelStartTime-this.totalPausedTime;return this.pauseStartTime&&(t-=e-this.pauseStartTime),Math.min(t/h[this.currentLevel].duration,1)}pause(){this.pauseStartTime||(this.pauseStartTime=performance.now())}resume(){this.pauseStartTime&&(this.totalPausedTime+=performance.now()-this.pauseStartTime,this.pauseStartTime=0)}}const y="meteorDefenseHighScore";class x{static drawTitle(e,{title:t="",color:a=s.TEXT,subtitle:l=null,copy:h=null}){let r=1.2*c.TITLE.size,n=1.3*c.LARGE.size,o=1.35*c.SMALL.size,d=t.split("\n"),g=640-(d.length-1)*r;e.fillStyle=a,e.font=c.TITLE.full,e.textAlign="center",e.textBaseline="middle",d.forEach((t,i)=>{e.fillText(t,720,g+i*r)}),l&&(e.fillStyle=s.TEXT,e.font=c.LARGE.full,e.letterSpacing=i,l.split("\n").forEach((t,i)=>{e.fillText(t,720,640+r+i*n)}),e.letterSpacing="0px"),h&&(e.fillStyle=s.TEXT,e.font=c.SMALL.full,e.letterSpacing=i,h.split("\n").forEach((t,i)=>{e.fillText(t,720,1536+i*o)}),e.letterSpacing="0px")}}class v{constructor(){this.canvas=document.getElementById("canvas"),this.ctx=this.canvas.getContext("2d"),this.lastTime=0,this.meteors=[],this.coins=[],this.assetLoader=new m,this.gameState=r.LOADING,this.initializeCanvas(),window.addEventListener("resize",()=>this.initializeCanvas()),this.loadAssets(),requestAnimationFrame(e=>this.gameLoop(e)),this.testMeteor=new f(2),this.gameState=r.MENU,this.setupEventListeners(),this.startButton=new u(a.START_GAME),this.retryButton=new u(a.TRY_AGAIN),this.currency=500,this.defenseOptions=this.createDefenseOptions(),this.selectedDefense=null,this.defenseGrid=this.createDefenseGrid(),this.levelManager=new w,this.nextLevelButton=new u(a.NEXT_LEVEL),this.continueButton=new u(a.CONTINUE),this.lives=3,this.currentScore=0,this.highScore=this.loadHighScore(),this.levelHighScore=this.loadLevelHighScore()}initializeCanvas(){let e;let t=window.innerWidth,i=window.innerHeight;e=Math.min(e=t/i>.5625?i/2560:t/1440,1),this.canvas.width=1440,this.canvas.height=2560,this.canvas.style.width=`${1440*e}px`,this.canvas.style.height=`${2560*e}px`}setupEventListeners(){this.canvas.addEventListener("click",e=>{let t=this.canvas.getBoundingClientRect(),i=this.canvas.width/t.width,s=(e.clientX-t.left)*i,a=(e.clientY-t.top)*i;if(this.gameState===r.MENU)this.startButton.isClicked(s,a)&&this.startGame();else if(this.gameState===r.GAME_OVER)this.retryButton.isClicked(s,a)&&this.startGame();else if(this.gameState===r.LEVEL_COMPLETE)this.nextLevelButton.isClicked(s,a)&&this.startNextLevel();else if(this.gameState===r.PLAYING){let e=!1;for(let t=this.coins.length-1;t>=0;t--){let i=this.coins[t];if(i.isClicked(s,a)){this.currency+=i.value,this.currentScore+=i.value,this.coins.splice(t,1),e=!0;break}}if(!e&&(this.defenseOptions.forEach(e=>{e.isClicked(s,a)&&(this.selectedDefense===e.type?(this.selectedDefense=null,console.log("Defense deselected")):this.currency>=e.type.cost?(this.selectedDefense=e.type,console.log(`Selected ${e.type.name} defense`)):console.log("Not enough currency!"))}),this.selectedDefense)){let e=this.getSpotAtPosition(s,a);e&&e.isEmpty()&&this.currency>=this.selectedDefense.cost&&(e.placeDefense(this.selectedDefense),this.currency-=this.selectedDefense.cost,this.selectedDefense=null)}}else this.gameState===r.LIFE_LOST&&this.continueButton.isClicked(s,a)&&(this.continuePlaying(),this.currency+=120)})}startGame(){this.gameState=r.PLAYING,this.meteors=[],this.coins=[],this.currency=500,this.selectedDefense=null,this.lives=3,this.currentScore=0,this.levelManager.startLevel(0);for(let e=0;e<this.defenseGrid.length;e++)for(let t=0;t<this.defenseGrid[e].length;t++)this.defenseGrid[e][t].removeDefense()}startNextLevel(){this.meteors=[],this.coins=[],this.currency=500,this.selectedDefense=null;for(let e=0;e<this.defenseGrid.length;e++)for(let t=0;t<this.defenseGrid[e].length;t++)this.defenseGrid[e][t].removeDefense();this.levelManager.startLevel(this.levelManager.currentLevel+1),this.gameState=r.PLAYING}gameLoop(e){let t=e-this.lastTime;this.lastTime=e,this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.update(t),this.draw(),requestAnimationFrame(e=>this.gameLoop(e))}drawBackground(){let e=this.assetLoader.getImage("background");e?(this.ctx.fillStyle="#000",this.ctx.fillRect(0,0,1440,2560),this.ctx.drawImage(e,0,0,1440,2560)):(this.ctx.fillStyle=s.BACKGROUND,this.ctx.fillRect(0,0,1440,2560))}drawDefenseGrid(){for(let e=0;e<this.defenseGrid.length;e++)for(let t=0;t<this.defenseGrid[e].length;t++)this.defenseGrid[e][t].draw(this.ctx)}update(e){if(this.gameState===r.PLAYING){let t=performance.now();for(let e=0;e<this.defenseGrid.length;e++)for(let i=0;i<this.defenseGrid[e].length;i++)this.defenseGrid[e][i].update(t,this.meteors,this.coins);this.meteors=this.meteors.filter(t=>(t.update(e),!(t.y>=2160)||(this.lives--,this.lives<=0?(this.currentScore>this.highScore&&(this.highScore=this.currentScore,this.saveHighScore()),this.levelManager.currentLevel>this.levelHighScore&&(this.levelHighScore=this.levelManager.currentLevel,this.saveLevelHighScore()),this.gameState=r.GAME_OVER):this.gameState=r.LIFE_LOST,!1))),this.coins=this.coins.filter(e=>e.update(t)),this.levelManager.update(t,this.meteors),this.levelManager.isLevelComplete(this.meteors)&&(this.levelManager.currentLevel>=h.length-1?this.gameState=r.GAME_COMPLETE:this.gameState=r.LEVEL_COMPLETE)}else this.gameState===r.LIFE_LOST&&this.levelManager.pause()}drawCurrency(){this.ctx.fillStyle=s.TEXT,this.ctx.font=c.SMALL.full,this.ctx.textAlign="center",this.ctx.letterSpacing=i,this.ctx.fillText(`${a.CURRENCY} $${this.currency}`,720,2220),this.ctx.fillText(`${h[this.levelManager.currentLevel].name}`,720,240),this.ctx.textAlign="left",this.ctx.fillText(`${this.currentScore} ${a.SCORE}`,160,240),this.ctx.letterSpacing="0px"}draw(){if(this.drawBackground(),this.gameState===r.LOADING)this.drawLoadingScreen();else if(this.gameState===r.MENU)x.drawTitle(this.ctx,{title:a.TITLE,subtitle:a.SUB_TITLE,copy:a.INTRO,color:s.GAME_OVER_COLOR}),this.startButton.draw(this.ctx),this.drawVersion();else if(this.gameState===r.PLAYING){this.drawDefenseGrid(),this.drawCurrency(),this.drawLives(),this.drawProgressBar(this.ctx),this.defenseOptions.forEach(e=>{e.draw(this.ctx,this.selectedDefense&&e.type.id===this.selectedDefense.id,this.currency)}),this.meteors.forEach(e=>e.draw(this.ctx));let e=performance.now();this.coins.forEach(t=>t.draw(this.ctx,e)),this.drawVersion()}else this.gameState===r.LIFE_LOST?(this.drawCurrency(),this.drawLives(),this.drawProgressBar(this.ctx),this.ctx.fillStyle="rgba(0, 0, 0, 0.7)",this.ctx.fillRect(0,0,1440,2560),x.drawTitle(this.ctx,{title:a.LIFE_LOST,color:s.GAME_OVER_COLOR,subtitle:a.LIFE_REMAINING(this.lives)}),this.continueButton.draw(this.ctx)):this.gameState===r.LEVEL_COMPLETE?(x.drawTitle(this.ctx,{title:a.LEVEL_COMPLETE,color:s.SUCCESS_COLOR}),this.nextLevelButton.draw(this.ctx)):this.gameState===r.GAME_COMPLETE?x.drawTitle(this.ctx,{title:a.GAME_COMPLETE,color:s.SUCCESS_COLOR,subtitle:`${a.SCORE}: ${this.currentScore} (${a.LEVEL} ${this.levelManager.currentLevel+1})
${a.HIGH_SCORE}: ${this.highScore} (${a.LEVEL} ${this.levelHighScore+1})`}):this.gameState===r.GAME_OVER&&(x.drawTitle(this.ctx,{title:a.GAME_OVER,color:s.GAME_OVER_COLOR,subtitle:`${a.SCORE}: ${this.currentScore} (${a.LEVEL} ${this.levelManager.currentLevel+1})
${a.HIGH_SCORE}: ${this.highScore} (${a.LEVEL} ${this.levelHighScore+1})`}),this.retryButton.draw(this.ctx))}createDefenseOptions(){let e=(1440-(266.66666666666663*n.length-80))/2;return n.map((t,i)=>new S(t,e+266.66666666666663*i,2280))}createDefenseGrid(){let e=[];for(let i=0;i<t;i++){let t=[];for(let e=0;e<6;e++){let s=160+186.66666666666666*e+93.33333333333333,a=2160-186.66666666666666*i-93.33333333333333;t.push(new L(s,a,i,e))}e.push(t)}return e}getSpotAtPosition(e,t){for(let i=0;i<this.defenseGrid.length;i++)for(let s=0;s<this.defenseGrid[i].length;s++){let a=this.defenseGrid[i][s];if(e>=a.x-93.33333333333333&&e<=a.x+93.33333333333333&&t>=a.y-93.33333333333333&&t<=a.y+93.33333333333333)return a}return null}drawProgressBar(e){e.fillStyle="rgba(0, 0, 0, 0.5)",e.fillRect(160,80,1120,80);let t=1-this.levelManager.getLevelProgress();e.fillStyle=s.PROGRESS_BAR,e.fillRect(160,80,1120*t,80),e.strokeStyle=s.PROGRESS_BORDER,e.lineWidth=8,e.strokeRect(160,80,1120,80)}async loadAssets(){await this.assetLoader.loadAll()?this.gameState=r.MENU:console.error("Failed to load assets")}drawLoadingScreen(){let e=this.assetLoader.getLoadingProgress();this.ctx.fillStyle=s.BUTTON,this.ctx.fillRect(620,1280,200,20),this.ctx.fillStyle="#4CAF50",this.ctx.fillRect(620,1280,200*e,20),this.ctx.strokeStyle=s.TEXT,this.ctx.strokeRect(620,1280,200,20),this.ctx.fillStyle=s.TEXT,this.ctx.font=c.LARGE.full,this.ctx.textAlign="center",this.ctx.fillText("Loading...",720,1200),this.ctx.fillText(`${Math.floor(100*e)}%`,720,1440)}drawLives(){for(let e=0;e<3;e++){let t=1070+88*e;this.ctx.strokeStyle=s.HEART_STROKE,this.ctx.lineWidth=8,this.drawHeart(t,206,68),e<this.lives&&(this.ctx.fillStyle=s.HEART_FILL,this.drawHeart(t,206,68,!0))}}drawHeart(e,t,i,s=!1){let a=new Path2D;a.moveTo(e,t+i/4),a.bezierCurveTo(e,t,e-i/2,t,e-i/2,t+i/4),a.bezierCurveTo(e-i/2,t+i/2,e,t+3*i/4,e,t+3*i/4),a.bezierCurveTo(e,t+3*i/4,e+i/2,t+i/2,e+i/2,t+i/4),a.bezierCurveTo(e+i/2,t,e,t,e,t+i/4),s?this.ctx.fill(a):(this.ctx.lineCap="round",this.ctx.stroke(a))}continuePlaying(){this.gameState=r.PLAYING,this.meteors=[],this.levelManager.resume()}loadHighScore(){let e=localStorage.getItem(y+"_coins");return e?parseInt(e,0):0}saveHighScore(){localStorage.setItem(y+"_coins",this.highScore.toString())}drawVersion(){this.ctx.globalAlpha=.5,this.ctx.fillStyle=s.TEXT,this.ctx.font=c.TINY.full,this.ctx.textAlign="right",this.ctx.fillText(`v${l.levelVersion}`,1420,2540),this.ctx.globalAlpha=1}loadLevelHighScore(){let e=localStorage.getItem(y+"_level");return e?parseInt(e,0):0}saveLevelHighScore(){localStorage.setItem(y+"_level",this.levelHighScore.toString())}}window.addEventListener("load",()=>{e=new v});
//# sourceMappingURL=index.225052eb.js.map
