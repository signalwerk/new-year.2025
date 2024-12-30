let t;const e=Math.floor(10.714285714285715),i={BACKGROUND:"#edf1e7",TEXT:"#000",DEFENSE_OPTION_TEXT:"#000",DEFENSE_OPTION_TEXT_INACTIVE:"#f00",BUTTON:"#444",BUTTON_TEXT:"#fff",PROGRESS_BAR:"#4CAF50",BORDER:"#333",DEBUG_LINE:"rgba(0,0,0,0.1)",SELECTION:"rgba(255,80,80,0.7)"},s={baseDuration:3e4,durationIncrease:5e3,maxLevels:30,difficultyMultiplier:.85,meteorWeights:{start:{small:1,medium:0,large:0},end:{small:.6,medium:.2,large:.2}},minSpawnGap:900,maxSpawnGap:1500,minSpawnGapEnd:450,maxSpawnGapEnd:900,difficultyRamp:1.25,waveDuration:6e3,waveDurationEnd:4e3,waveGap:3200,waveGapEnd:1600},h=function(t=s){let e=[],i=t.difficultyMultiplier;for(let s=0;s<t.maxLevels;s++){let d=(t.baseDuration+t.durationIncrease*s)/Math.sqrt(i),f=[],m=1e3;for(t.difficultyRamp;m<d-2e3;){var h,a,l,r,n,o,c;let e=m/d,s=(h=t.waveDuration/Math.sqrt(i),h+(t.waveDurationEnd/Math.sqrt(i)-h)*e),g=m+s;for(;m<g;){let e=(m-(g-s))/s,h=function(t){let e=Math.random()*(t.small+t.medium+t.large);return e<t.small?0:e<t.small+t.medium?1:2}({small:(a=t.meteorWeights.start.small,a+(t.meteorWeights.end.small/i-a)*e),medium:(l=t.meteorWeights.start.medium,l+(t.meteorWeights.end.medium*i-l)*e),large:(r=t.meteorWeights.start.large,r+(t.meteorWeights.end.large*i-r)*e)}),c=Math.floor(6*Math.random());f.push({type:h,lane:c,startTime:Math.floor(m)});let d=(n=t.minSpawnGap/i,n+(t.minSpawnGapEnd/i-n)*e);m+=Math.random()*(o=t.maxSpawnGap/i,o+(t.maxSpawnGapEnd/i-o)*e-d)+d}let e=m/d;m+=(c=t.waveGap/i,c+(t.waveGapEnd/i-c)*e)}e.push({name:`Level ${s+1}`,duration:d,meteors:f.sort((t,e)=>t.startTime-e.startTime)})}return e}(),a={LOADING:"loading",MENU:"menu",PLAYING:"playing",LIFE_LOST:"lifeLost",LEVEL_COMPLETE:"levelComplete",GAME_OVER:"gameover",GAME_COMPLETE:"gameComplete"},l=[{id:0,name:"Basic",color:"#4CAF50",cost:100,damage:10,health:100},{id:1,name:"Medium",color:"#2196F3",cost:150,damage:20,health:100},{id:2,name:"Strong",color:"#9C27B0",cost:200,damage:30,health:100}],r=[{id:0,name:"Small",color:"#FF9999",health:30,speed:.05,damageRate:30,rotateRate:5e-4,wiggleRate:.001,wiggleAmount:7,sizeMultiplier:{x:1,y:1},coinReward:20},{id:1,name:"Medium",color:"#FF4444",health:50,speed:.035,damageRate:50,rotateRate:0,wiggleRate:.03,wiggleAmount:.03,sizeMultiplier:{x:1,y:2},coinReward:40},{id:2,name:"Large",color:"#FF0000",health:70,speed:.05,damageRate:50,rotateRate:0,wiggleRate:.03,wiggleAmount:.03,sizeMultiplier:{x:1,y:2},coinReward:50}],n={SMALL:{size:"12px",family:"Arial",get full(){return`${this.size} ${this.family}`}},LARGE:{size:"14px",family:"Arial",get full(){return`${this.size} ${this.family}`}}},o=["/assets/img/meteor-1.png","/assets/img/meteor-2.png","/assets/img/meteor-3.png"];class c{constructor(){this.images=new Map,this.totalAssets=0,this.loadedAssets=0}async loadAll(){let t=o.map((t,e)=>this.loadImage(`meteor-${e}`,t));try{return await Promise.all(t),!0}catch(t){return console.error("Error loading assets:",t),!1}}loadImage(t,e){return new Promise((i,s)=>{let h=new Image;this.totalAssets++,h.onload=()=>{this.images.set(t,h),this.loadedAssets++,i(h)},h.onerror=()=>{s(Error(`Failed to load image: ${e}`))},h.src=e})}getImage(t){return this.images.get(t)}getLoadingProgress(){return this.totalAssets?this.loadedAssets/this.totalAssets:0}}class d{constructor(t,e=r[0]){this.lane=t,this.type=e,this.y=40,this.health=e.health,this.speed=e.speed,this.isBlocked=!1,this.blockingDefense=null,this.baseRotation=0,this.wiggleRotation=0,this.wiggleOffset=0,this.baseX=40+46.666666666666664*t+23.333333333333332}update(t){this.isBlocked||(this.y+=this.speed*t,this.baseRotation+=this.type.rotateRate*t,this.wiggleOffset+=this.type.wiggleRate*t,this.wiggleRotation=Math.cos(this.wiggleOffset)*this.type.wiggleAmount*.5)}block(t){this.isBlocked=!0,this.blockingDefense=t}unblock(){this.isBlocked=!1,this.blockingDefense=null}draw(e){let i=this.baseX+Math.sin(this.wiggleOffset)*this.type.wiggleAmount,s=t?.assetLoader.getImage(`meteor-${this.type.id}`);if(s){e.save(),e.translate(i,this.y),e.rotate(this.baseRotation+this.wiggleRotation);let t=37.333333333333336*this.type.sizeMultiplier.y,h=37.333333333333336*this.type.sizeMultiplier.x;e.drawImage(s,-h/2,-t/2,h,t),e.restore()}else e.fillStyle=this.type.color,e.beginPath(),e.arc(i,this.y,10,0,2*Math.PI),e.fill()}takeDamage(t){return this.health-=t,this.health<=0}}class f{constructor(t,e,s,h,a,l=i.BUTTON,r=i.BUTTON_TEXT,n=16){this.x=t,this.y=e,this.width=s,this.height=h,this.text=a,this.backgroundColor=l,this.textColor=r,this.fontSize=n}isClicked(t,e){return t>=this.x&&t<=this.x+this.width&&e>=this.y&&e<=this.y+this.height}draw(t){t.fillStyle=this.backgroundColor,t.fillRect(this.x,this.y,this.width,this.height),t.fillStyle=this.textColor,t.font=n.LARGE.full,t.textAlign="center",t.textBaseline="middle",t.fillText(this.text,this.x+this.width/2,this.y+this.height/2)}}class m{constructor(t,e,i){this.x=t,this.y=e,this.speed=.3,this.damage=i,this.size=4}update(t){this.y-=this.speed*t}draw(t){t.fillStyle="black",t.beginPath(),t.arc(this.x,this.y,this.size,0,2*Math.PI),t.fill()}checkCollision(t){let e=40+46.666666666666664*t.lane+23.333333333333332,i=this.x-e,s=this.y-t.y;return Math.sqrt(i*i+s*s)<this.size+10}isOffScreen(){return this.y<40}}class g{constructor(t=null){this.type=t,this.health=t?t.health:0,this.maxHealth=t?t.health:0,this.projectiles=[],this.lastFireTime=0,this.fireRate=1e3,this.blockingMeteors=[]}isEmpty(){return null===this.type}takeDamage(t){return this.health-=t,this.health<=0}update(t,e,i,s,h){if(!this.isEmpty()){t-this.lastFireTime>this.fireRate&&(this.projectiles.push(new m(e,i,this.type.damage)),this.lastFireTime=t);let a=Math.floor((i-40)/46.666666666666664);s.forEach(t=>{Math.floor((t.y-40)/46.666666666666664)===a&&t.lane===Math.floor((e-40)/46.666666666666664)&&(t.isBlocked||(t.block(this),this.blockingMeteors.push(t)),t.blockingDefense===this&&this.takeDamage(t.type.damageRate/60)&&(this.blockingMeteors.forEach(t=>t.unblock()),this.blockingMeteors=[],this.type=null,this.health=0,this.maxHealth=0))}),this.projectiles=this.projectiles.filter(t=>{t.update(16);for(let e=0;e<s.length;e++){let i=s[e];if(t.checkCollision(i)){if(i.takeDamage(t.damage)){let t=40+46.666666666666664*i.lane+23.333333333333332;h.push(new x(t,i.y,i.type.coinReward)),s.splice(e,1)}return!1}}return!t.isOffScreen()})}}draw(t,e,s,h,a=!1,l=!1){t.strokeStyle=this.isEmpty()?i.DEBUG_LINE:"#888",t.lineWidth=1,t.strokeRect(e-h/2,s-h/2,h,h),!this.isEmpty()&&(t.fillStyle=this.type.color,l?t.globalAlpha=.5:t.globalAlpha=Math.max(.3,this.health/this.maxHealth),t.fillRect(e-h/2,s-h/2,h,h),t.globalAlpha=1,this.projectiles.forEach(e=>e.draw(t)),a&&(t.strokeStyle=i.SELECTION,t.lineWidth=4,t.strokeRect(e-h/2,s-h/2,h,h)))}}class u{constructor(t,e,i){this.type=t,this.x=e,this.y=i,this.defense=new g(t)}draw(t,e=!1,s=0){let h=s<this.type.cost;this.defense.draw(t,this.x+23.333333333333332,this.y+23.333333333333332,46.666666666666664,e,h),t.fillStyle=h?i.DEFENSE_OPTION_TEXT_INACTIVE:i.DEFENSE_OPTION_TEXT,t.font=n.LARGE.full,t.textAlign="center",t.fillText(`$${this.type.cost}`,this.x+23.333333333333332,this.y+46.666666666666664+15)}isClicked(t,e){return t>=this.x&&t<=this.x+46.666666666666664&&e>=this.y&&e<=this.y+46.666666666666664}}class p{constructor(t,e,i,s){this.x=t,this.y=e,this.row=i,this.lane=s,this.defense=new g}isEmpty(){return this.defense.isEmpty()}placeDefense(t){return!!this.isEmpty()&&(this.defense=new g(t),!0)}removeDefense(){this.defense=new g}draw(t){this.defense.draw(t,this.x,this.y,46.666666666666664)}update(t,e,i){this.defense.update(t,this.x,this.y,e,i)}}class x{constructor(t,e,i=10){this.x=t,this.y=e,this.value=i,this.lifetime=5e3,this.createTime=performance.now(),this.hitRadius=30,this.size=8+(i-10)/10*2;let s=Math.random()*Math.PI*2,h=.3+.1*Math.random();this.vx=Math.cos(s)*h,this.vy=Math.sin(s)*h,this.waveAmplitude=2.2+.2*Math.random(),this.waveFrequency=.005+.001*Math.random(),this.waveOffset=Math.random()*Math.PI*2,this.baseX=t,this.baseY=e,this.time=0}draw(t,e){let i=e-this.createTime,s=this.lifetime-i;if(s<1500&&Math.floor(e/(100+s/1500*400))%2==0)return;let h=this.x+Math.sin(this.time*this.waveFrequency+this.waveOffset)*this.waveAmplitude,a=this.y+Math.cos(this.time*this.waveFrequency+this.waveOffset)*this.waveAmplitude,l=t.createRadialGradient(h-this.size/3,a-this.size/3,0,h,a,this.size);l.addColorStop(0,"#FFD700"),l.addColorStop(1,"#DAA520"),t.fillStyle=l,t.beginPath(),t.arc(h,a,this.size,0,2*Math.PI),t.fill(),t.strokeStyle="#B8860B",t.lineWidth=1,t.stroke(),t.fillStyle="black",t.font=`bold ${Math.max(10,this.size)}px ${n.SMALL.family}`,t.textAlign="center",t.textBaseline="middle",t.fillText(`${this.value}`,h,a)}update(t){return this.time+=16,this.baseX+=this.vx,this.baseY+=this.vy,this.x=this.baseX+Math.sin(this.time*this.waveFrequency+this.waveOffset)*this.waveAmplitude,this.y=this.baseY+Math.cos(this.time*this.waveFrequency+this.waveOffset)*this.waveAmplitude,t-this.createTime<this.lifetime}isClicked(t,e){let i=t-this.x,s=e-this.y;return Math.sqrt(i*i+s*s)<this.hitRadius}}class w{constructor(){this.currentLevel=0,this.levelStartTime=0,this.remainingMeteors=[],this.allMeteorsSpawned=!1}startLevel(t){this.currentLevel=t,this.levelStartTime=performance.now(),this.remainingMeteors=[...h[t].meteors],this.allMeteorsSpawned=!1}update(t,e){if(this.currentLevel>=h.length)return!1;let i=t-this.levelStartTime;if(i>=h[this.currentLevel].duration)return this.allMeteorsSpawned=!0,!1;for(;this.remainingMeteors.length>0&&i>=this.remainingMeteors[0].startTime;){let t=this.remainingMeteors.shift();e.push(new d(t.lane,r[t.type]))}return 0===this.remainingMeteors.length&&(this.allMeteorsSpawned=!0),!0}isLevelComplete(t){return this.allMeteorsSpawned&&0===t.length}getLevelProgress(){return Math.min((performance.now()-this.levelStartTime)/h[this.currentLevel].duration,1)}}const y="meteorDefenseHighScore";class v{constructor(){this.canvas=document.getElementById("canvas"),this.ctx=this.canvas.getContext("2d"),this.lastTime=0,this.meteors=[],this.coins=[],this.assetLoader=new c,this.gameState=a.LOADING,this.initializeCanvas(),window.addEventListener("resize",()=>this.initializeCanvas()),this.loadAssets(),requestAnimationFrame(t=>this.gameLoop(t)),this.testMeteor=new d(2),this.gameState=a.MENU,this.setupEventListeners(),this.startButton=new f(130,295,100,50,"Start Game"),this.retryButton=new f(130,295,100,50,"Try Again"),this.gameOverText=new f(80,220,200,50,"Game Over!","transparent","red",24),this.currency=500,this.defenseOptions=this.createDefenseOptions(),this.selectedDefense=null,this.defenseGrid=this.createDefenseGrid(),this.levelManager=new w,this.nextLevelButton=new f(120,370,120,40,"Next Level"),this.levelCompleteText=new f(80,270,200,50,"Level Complete!","transparent","#4CAF50",24),this.gameCompleteText=new f(80,270,200,50,"Game Complete!","transparent","#4CAF50",24),this.continueButton=new f(120,370,120,40,"Continue"),this.lifeLostText=new f(80,270,200,50,"Life Lost!","transparent","#FF4444",24),this.lives=3,this.currentScore=0,this.highScore=this.loadHighScore()}initializeCanvas(){let t;let e=window.innerWidth,i=window.innerHeight;t=Math.min(t=e/i>.5625?i/640:e/360,1),this.canvas.width=360,this.canvas.height=640,this.canvas.style.width=`${360*t}px`,this.canvas.style.height=`${640*t}px`}setupEventListeners(){this.canvas.addEventListener("click",t=>{let e=this.canvas.getBoundingClientRect(),i=this.canvas.width/e.width,s=(t.clientX-e.left)*i,h=(t.clientY-e.top)*i;if(this.gameState===a.MENU)this.startButton.isClicked(s,h)&&this.startGame();else if(this.gameState===a.GAME_OVER)this.retryButton.isClicked(s,h)&&this.startGame();else if(this.gameState===a.LEVEL_COMPLETE)this.nextLevelButton.isClicked(s,h)&&this.startNextLevel();else if(this.gameState===a.PLAYING){let t=!1;for(let e=this.coins.length-1;e>=0;e--){let i=this.coins[e];if(i.isClicked(s,h)){this.currency+=i.value,this.currentScore+=i.value,this.currentScore>this.highScore&&(this.highScore=this.currentScore,this.saveHighScore()),this.coins.splice(e,1),t=!0;break}}if(!t&&(this.defenseOptions.forEach(t=>{t.isClicked(s,h)&&(this.selectedDefense===t.type?(this.selectedDefense=null,console.log("Defense deselected")):this.currency>=t.type.cost?(this.selectedDefense=t.type,console.log(`Selected ${t.type.name} defense`)):console.log("Not enough currency!"))}),this.selectedDefense)){let t=this.getSpotAtPosition(s,h);t&&t.isEmpty()&&this.currency>=this.selectedDefense.cost&&(t.placeDefense(this.selectedDefense),this.currency-=this.selectedDefense.cost,this.selectedDefense=null)}}else this.gameState===a.LIFE_LOST&&this.continueButton.isClicked(s,h)&&this.continuePlaying()})}startGame(){this.gameState=a.PLAYING,this.meteors=[],this.coins=[],this.currency=500,this.selectedDefense=null,this.lives=3,this.currentScore=0,this.levelManager.startLevel(0);for(let t=0;t<this.defenseGrid.length;t++)for(let e=0;e<this.defenseGrid[t].length;e++)this.defenseGrid[t][e].removeDefense()}startNextLevel(){this.meteors=[],this.coins=[],this.currency=500,this.selectedDefense=null;for(let t=0;t<this.defenseGrid.length;t++)for(let e=0;e<this.defenseGrid[t].length;e++)this.defenseGrid[t][e].removeDefense();this.levelManager.startLevel(this.levelManager.currentLevel+1),this.gameState=a.PLAYING}gameLoop(t){let e=t-this.lastTime;this.lastTime=t,this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.update(e),this.draw(),requestAnimationFrame(t=>this.gameLoop(t))}drawBackground(){this.ctx.fillStyle=i.BACKGROUND,this.ctx.fillRect(0,0,360,640),this.ctx.strokeStyle=i.BORDER,this.ctx.strokeRect(40,40,this.gameAreaWidth,this.gameAreaHeight);for(let t=0;t<=6;t++){let e=40+t*this.laneWidth;this.ctx.beginPath(),this.ctx.moveTo(e,40),this.ctx.lineTo(e,540),this.ctx.stroke()}this.ctx.fillStyle=i.BACKGROUND,this.ctx.fillRect(0,0,360,40),this.ctx.fillRect(0,540,360,100),this.ctx.fillRect(0,40,40,this.gameAreaHeight),this.ctx.fillRect(320,40,40,this.gameAreaHeight);for(let t=0;t<this.defenseGrid.length;t++)for(let e=0;e<this.defenseGrid[t].length;e++)this.defenseGrid[t][e].draw(this.ctx)}update(t){if(this.gameState!==a.PLAYING)return;let e=performance.now();for(let t=0;t<this.defenseGrid.length;t++)for(let i=0;i<this.defenseGrid[t].length;i++)this.defenseGrid[t][i].update(e,this.meteors,this.coins);this.meteors=this.meteors.filter(e=>(e.update(t),!(e.y>=540)||(this.lives--,this.lives<=0?this.gameState=a.GAME_OVER:this.gameState=a.LIFE_LOST,!1))),this.coins=this.coins.filter(t=>t.update(e)),this.levelManager.update(e,this.meteors),this.levelManager.isLevelComplete(this.meteors)&&(this.levelManager.currentLevel>=h.length-1?this.gameState=a.GAME_COMPLETE:this.gameState=a.LEVEL_COMPLETE)}drawCurrency(){this.ctx.fillStyle=i.TEXT,this.ctx.font=n.LARGE.full,this.ctx.textAlign="center",this.ctx.fillText(`Currency: $${this.currency}`,180,555),this.ctx.textAlign="left",this.ctx.fillText(`Score: ${this.currentScore}`,40/3,60)}draw(){if(this.drawBackground(),this.gameState===a.LOADING)this.drawLoadingScreen();else if(this.gameState===a.MENU)this.startButton.draw(this.ctx),this.drawVersion();else if(this.gameState===a.PLAYING){this.drawCurrency(),this.drawLives(),this.drawProgressBar(this.ctx),this.defenseOptions.forEach(t=>{t.draw(this.ctx,this.selectedDefense&&t.type.id===this.selectedDefense.id,this.currency)}),this.meteors.forEach(t=>t.draw(this.ctx));let t=performance.now();this.coins.forEach(e=>e.draw(this.ctx,t)),this.drawVersion()}else this.gameState===a.LIFE_LOST?(this.drawCurrency(),this.drawLives(),this.drawProgressBar(this.ctx),this.ctx.fillStyle="rgba(0, 0, 0, 0.7)",this.ctx.fillRect(0,0,360,640),this.lifeLostText.draw(this.ctx),this.continueButton.draw(this.ctx),this.ctx.fillStyle="#FFF",this.ctx.font=n.LARGE.full,this.ctx.textAlign="center",this.ctx.fillText(`${this.lives} ${1===this.lives?"life":"lives"} remaining`,180,320),this.drawVersion()):this.gameState===a.LEVEL_COMPLETE?(this.levelCompleteText.draw(this.ctx),this.nextLevelButton.draw(this.ctx),this.drawVersion()):this.gameState===a.GAME_COMPLETE?(this.gameCompleteText.draw(this.ctx),this.drawVersion()):this.gameState===a.GAME_OVER&&(this.gameOverText.draw(this.ctx),this.retryButton.draw(this.ctx),this.ctx.fillStyle=i.TEXT,this.ctx.font=n.LARGE.full,this.ctx.textAlign="center",this.ctx.fillText(`Final Score: ${this.currentScore}`,180,370),this.ctx.fillText(`High Score: ${this.highScore}`,180,400),this.drawVersion())}createDefenseOptions(){let t=(360-(66.66666666666666*l.length-20))/2;return l.map((e,i)=>new u(e,t+66.66666666666666*i,570))}createDefenseGrid(){let t=[];for(let i=0;i<e;i++){let e=[];for(let t=0;t<6;t++){let s=40+46.666666666666664*t+23.333333333333332,h=540-46.666666666666664*i-23.333333333333332;e.push(new p(s,h,i,t))}t.push(e)}return t}getSpotAtPosition(t,e){for(let i=0;i<this.defenseGrid.length;i++)for(let s=0;s<this.defenseGrid[i].length;s++){let h=this.defenseGrid[i][s];if(t>=h.x-23.333333333333332&&t<=h.x+23.333333333333332&&e>=h.y-23.333333333333332&&e<=h.y+23.333333333333332)return h}return null}drawProgressBar(t){t.fillStyle="rgba(0, 0, 0, 0.5)",t.fillRect(50,20,260,20);let e=1-this.levelManager.getLevelProgress();t.fillStyle=i.PROGRESS_BAR,t.fillRect(50,20,260*e,20),t.strokeStyle=i.BORDER,t.strokeRect(50,20,260,20),t.fillStyle=i.TEXT,t.font=n.LARGE.full,t.textAlign="center",t.fillText(`${h[this.levelManager.currentLevel].name}`,180,56);let s=Math.ceil((h[this.levelManager.currentLevel].duration-(performance.now()-this.levelManager.levelStartTime))/1e3);s>0&&(t.font=n.SMALL.full,t.fillText(`${s}s`,330,35))}async loadAssets(){await this.assetLoader.loadAll()?this.gameState=a.MENU:console.error("Failed to load assets")}drawLoadingScreen(){let t=this.assetLoader.getLoadingProgress();this.ctx.fillStyle=i.BUTTON,this.ctx.fillRect(80,320,200,20),this.ctx.fillStyle="#4CAF50",this.ctx.fillRect(80,320,200*t,20),this.ctx.strokeStyle=i.TEXT,this.ctx.strokeRect(80,320,200,20),this.ctx.fillStyle=i.TEXT,this.ctx.font=n.LARGE.full,this.ctx.textAlign="center",this.ctx.fillText("Loading...",180,300),this.ctx.fillText(`${Math.floor(100*t)}%`,180,360)}drawLives(){this.ctx.fillStyle=i.TEXT,this.ctx.font=n.LARGE.full,this.ctx.textAlign="right",this.ctx.fillText("Lives:",284,60);for(let t=0;t<3;t++){let e=294+22*t;this.ctx.strokeStyle="#FF0000",this.ctx.lineWidth=2,this.drawHeart(e,51.5,17),t<this.lives&&(this.ctx.fillStyle="#FF0000",this.drawHeart(e,51.5,17,!0))}}drawHeart(t,e,i,s=!1){let h=new Path2D;h.moveTo(t,e+i/4),h.bezierCurveTo(t,e,t-i/2,e,t-i/2,e+i/4),h.bezierCurveTo(t-i/2,e+i/2,t,e+3*i/4,t,e+3*i/4),h.bezierCurveTo(t,e+3*i/4,t+i/2,e+i/2,t+i/2,e+i/4),h.bezierCurveTo(t+i/2,e,t,e,t,e+i/4),s?this.ctx.fill(h):this.ctx.stroke(h)}continuePlaying(){this.gameState=a.PLAYING,this.meteors=[]}loadHighScore(){let t=localStorage.getItem(y);return t?parseInt(t,0):0}saveHighScore(){localStorage.setItem(y,this.highScore.toString())}drawVersion(){this.ctx.fillStyle=i.TEXT,this.ctx.font="11px Arial",this.ctx.textAlign="left",this.ctx.fillText("v1.2",5,635)}}window.addEventListener("load",()=>{t=new v});
//# sourceMappingURL=index.34635396.js.map
