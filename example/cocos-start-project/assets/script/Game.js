// Learn cc.Class:
//  - https://docs.cocos.com/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        // 这个属性引用了星星预制资源
        starPrefab: {
            default: null,
            type: cc.Prefab
        },

        // 星星产生后消失时间的随机范围
        maxStarDuration: 0,
        minStarDuration: 0,

        // 地面节点，用于确定星星生成的高度
        ground: {
            default: null,
            type: cc.Node
        },

        // Player 节点， 用于获取主角弹跳的高度，控制主角行动开关
        player:{
            default: null,
            type: cc.Node
        },
        scoreDisplay: {
            default: null,
            type: cc.Label
        },
        // 得分音效资源
        scoreAudio: {
            default: null,
            type: cc.AudioClip
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 获取地面的y轴坐标
        this.groundY = this.ground.y + this.ground.height/2;

         // 初始化计时器
         this.timer = 0;
         this.starDuration = 0;
 
         // 生成一个新的星星
         this.spawnNewStar();
 
         // 初始化计分
         this.score = 0;
    },

    start () {

    },
    spawnNewStar(){
        // 使用给定的模板在场景中生成一个新节点
        var newStar = cc.instantiate(this.starPrefab);
        // 将新增的节点添加到canvas节点下面
        this.node.addChild(newStar);
        // 为星星设置一个随机位置
        newStar.setPosition(this.getNewStarPosition());
        // 在星星脚本组件上保存game对象的引用
        newStar.getComponent('Star').game = this;
        // 重置计时器，根据消失时间范围随机取一个值
        this.starDuration = this.minStarDuration + Math.random() * (this.maxStarDuration - this.minStarDuration);
        this.timer = 0;

    },
    getNewStarPosition(){
        var randX = 0;
        var randY = this.groundY + Math.random()*this.player.getComponent('Player').jumpHeight + 50;
        // 根据屏幕宽度，随机得到一个星星x坐标
        var maxX = this.node.width/2;
        randX = (Math.random() - 0.5)*2*maxX;
        // 返回星星坐标
        return cc.v2(randX, randY);
    },

    update (dt) {
        // 每帧更新计时器，超过限度还没有生成新的星星
        // 就会调用游戏失败逻辑
        if (this.timer > this.starDuration) {
            this.gameOver();
            return;
        }

        this.timer += dt;
        // 根据 Game 脚本中的计时器更新星星的透明度
        var opacityRatio = 1 - this.game.timer/this.game.starDuration;
        var minOpacity = 50;
        this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
    },
    gainScore(){
        this.score += 1;
        // 更新scoreDisplay label 的文字
        this.scoreDisplay.string = 'Score: ' + this.score;

        // 播放得分音效
        cc.audioEngine.playEffect(this.scoreAudio, false);
    },
    gameOver: function () {
        // 停止 Player 节点的跳跃动作
        this.player.stopAllActions(); 

        // 重新加载场景 game
        cc.director.loadScene('game');
    }
});
