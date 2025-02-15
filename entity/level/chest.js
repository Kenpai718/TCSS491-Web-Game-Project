class Chest extends AbstractInteractable {
    constructor(game, x, y, direction) {

        super(game, x, y);
        //Object.assign(this, { game, x, y });
        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/environment/dark_castle_tileset.png");

        // Items in chest
        //this.arrowStorage = 0; // 0 until player interacts with chest
        //this.potionStorage = 0;
        this.diamondStorage = 0;

        // Scale sizes
        this.scale = 5; // 4
        // this.width = 21 * this.scale;
        // this.height = 12 * this.scale;
        this.w = 1.5;
        this.h = 1;

        this.scale = PARAMS.BLOCKDIM;

        // Update settings
        this.timerGUI = 0;
        this.timerGUI2 = 0;

        // Mapping animations and states
        this.states = { closed: 0, opened: 1 };
        this.directions = { left: 0, right: 1 };

        this.state = 0;
        this.direction = direction;
        this.playOpenSFX = true;
        this.opened = false;
        this.collected = false;

        //fade out logic
        this.myOpacity = 100;
        this.openElapsed = 0;
        this.fadeOutTime = 1;

        //posible diamond reward
        this.max = 20;
        this.min = 10;


        this.spritesheet = ASSET_MANAGER.getAsset("./sprites/environment/dark_castle_tileset.png");
        this.diamond = [];
        this.diamond[0] = new Animator(this.spritesheet, 19, 84, 10, 8, 1, 0, 0, false, false, false);
        this.diamond[1] = new Animator(this.spritesheet, 35, 84, 10, 8, 1, 0, 0, false, false, false);
        this.diamond[2] = new Animator(this.spritesheet, 51, 84, 10, 8, 1, 0, 0, false, false, false);
        this.diamond[3] = new Animator(this.spritesheet, 67, 84, 10, 8, 1, 0, 0, false, false, false);
        this.diamond[4] = new Animator(this.spritesheet, 83, 84, 10, 8, 1, 0, 0, false, false, false);
        this.diamond[5] = new Animator(this.spritesheet, 99, 84, 10, 8, 1, 0, 0, false, false, false);

        // Other
        this.updateBB();
    };

    updateBB() {
        this.lastBoundingBox = this.BB;
        this.BB = new BoundingBox(this.x * PARAMS.BLOCKDIM, this.y * PARAMS.BLOCKDIM, this.w * PARAMS.BLOCKDIM, this.h * PARAMS.BLOCKDIM)
    };

    viewBoundingBox(ctx) {
        // This is the Bounding Box, defines space where chest is and can be opened
        ctx.strokeStyle = "Red";
        ctx.strokeRect(this.x - this.game.camera.x, this.y - this.game.camera.y, this.w, this.h);
    };

    update() {

        // If Chest is hit by player, change to Opened state
        let that = this;
        this.game.entities.forEach(function (entity) {
            let playerNextToChest = entity.BB && that.BB.collide(entity.BB) && entity instanceof AbstractPlayer && that.state != 1;
            let playerHitChest = entity.HB && that.BB.collide(entity.HB) && entity instanceof AbstractPlayer && that.state != 1;
            if (playerNextToChest && that.game.up || playerHitChest) {
                that.game.myReportCard.myChestsOpened++;
                that.state = 1;
                that.opened = true;
                ASSET_MANAGER.playAsset(SFX.CHEST_OPEN);

                // varaibles needed for GUI to display amount
                //that.potionStorage = 1 + Math.floor(Math.random() * 3);      // Gives random amount of hp potions 1-3
                //that.arrowStorage = 1 + Math.floor(Math.random() * 15);     // Gives random amount of arrows 1-15
                let randomAmount = 15 + rand_5(that.max, that.min);
                that.diamondStorage = randomAmount;
                that.game.myReportCard.myDiamondsEarned += randomAmount;  

                //entity.myInventory.potions += that.potionStorage;
                //entity.myInventory.arrows += that.arrowStorage;
                entity.myInventory.diamonds += that.diamondStorage;

                that.timerGUI = that.timerGUI2 + 1;
            }
        }); // Allows timer to start when open, used for fade effect

        if (this.opened) this.openElapsed += this.game.clockTick;
        
    };

    draw(ctx) {

        switch (this.state) {
            case 0: // Closed chest
                if (this.direction == this.directions.left) {
                    ctx.drawImage(this.spritesheet, 19, 147, 22, 12, this.x * PARAMS.BLOCKDIM - this.game.camera.x, this.y * PARAMS.BLOCKDIM - this.game.camera.y, this.w * PARAMS.BLOCKDIM, this.h * PARAMS.BLOCKDIM);
                } else {
                    ctx.drawImage(this.spritesheet, 115, 147, 22, 12, this.x * PARAMS.BLOCKDIM - this.game.camera.x, this.y * PARAMS.BLOCKDIM - this.game.camera.y, this.w * PARAMS.BLOCKDIM, this.h * PARAMS.BLOCKDIM);
                }
                break;
            case 1: // Opened chest
                if (this.direction == this.directions.left) {
                    ctx.drawImage(this.spritesheet, 51, 147, 22, 12, this.x * PARAMS.BLOCKDIM - this.game.camera.x, this.y * PARAMS.BLOCKDIM - this.game.camera.y, this.w * PARAMS.BLOCKDIM, this.h * PARAMS.BLOCKDIM);
                } else {
                    ctx.drawImage(this.spritesheet, 83, 147, 22, 12, this.x * PARAMS.BLOCKDIM - this.game.camera.x, this.y * PARAMS.BLOCKDIM - this.game.camera.y, this.w * PARAMS.BLOCKDIM, this.h * PARAMS.BLOCKDIM);
                }
                break;
        }

        // Once opened, Chest will display # of earned items from the chest
        // After a few seconds this display will fade and disappear after 10 seconds
        let that = this;
        if (that.opened) {
            ctx.font = PARAMS.BIG_FONT;
            let tempColor = ctx.fillStyle;
            ctx.fillStyle = "White"

            //fade out after .5 seconds
            if (this.openElapsed >= this.fadeOutTime && this.myOpacity > 0) {
                this.myOpacity--;
            }

            ctx.filter = "opacity(" + this.myOpacity + "%)";

            //ctx.fillText("🏹 x" + that.arrowStorage, that.x * PARAMS.BLOCKDIM - this.game.camera.x, that.y * PARAMS.BLOCKDIM - 5 - this.game.camera.y);
            //ctx.fillText("⚗️ x" + that.potionStorage, that.x * PARAMS.BLOCKDIM - this.game.camera.x, that.y * PARAMS.BLOCKDIM - 40 - this.game.camera.y);
            ctx.fillText("  x" + that.diamondStorage, that.x * PARAMS.BLOCKDIM - this.game.camera.x, that.y * PARAMS.BLOCKDIM - 5 - this.game.camera.y);
            this.diamond[(Math.floor(this.myOpacity / 16.5) + 1) % 6].drawFrame(this.game.clockTick, ctx, that.x * PARAMS.BLOCKDIM - this.game.camera.x, that.y * PARAMS.BLOCKDIM - this.game.camera.y - 24, 3);

            ctx.filter = "none";

            ctx.font = PARAMS.DEFAULT_FONT;
            ctx.fillStyle = tempColor;
        }
    };

    drawDebug(ctx) {
        ctx.strokeStyle = "Red";
        ctx.strokeRect(this.x * PARAMS.BLOCKDIM - this.game.camera.x, this.y * PARAMS.BLOCKDIM - this.game.camera.y, this.w * PARAMS.BLOCKDIM, this.h * PARAMS.BLOCKDIM);

        //     ctx.fillStyle = "White"
        //     ctx.fillText("Chest", this.x - this.game.camera.x, this.y - this.game.camera.y + 20);
        //     ctx.fillText("Contents: ", this.x - this.game.camera.x, this.y - this.game.camera.y + 10);
    }


};


// Money money moneyyyy...
