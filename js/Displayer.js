class Interactor {

    constructor(p_chain, p_displayer) {
        this.displayer = p_displayer;
        this.chain = p_chain;
        this.state = "idle";
        this.needRefreshing = false;
 
        p_displayer
            .getCanvas()
            .addEventListener("mousedown", this.follow(this, this.handlePress));
        p_displayer
            .getCanvas()
            .addEventListener("mousemove", this.follow(this, this.handleMove));
        p_displayer
            .getCanvas()
            .addEventListener("mouseup", this.follow(this, this.handleUpLeave));
        p_displayer
            .getCanvas()
            .addEventListener(
                "mouseleave",
                this.follow(this, this.handleUpLeave)
            );
        p_displayer
            .getCanvas()
            .addEventListener(
                "wheel",
                this.follow(this, this.handleWheel)
            );
    }

    follow(that, callback) {
        return function (e) {
            callback.call(that, e);
        };
    }

    handleWheel(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (this.state === "selected") {
            this.selection.changeAlpha(e.deltaY > 0);
            this.chain.draw(this.displayer, undefined, false);
        }
    }

    handlePress(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        let selection = this.chain.pick(this.displayer, e);
        this.needRefreshing = false;
        this.previousLocation = { x: e.offsetX, y: e.offsetY };

        if (this.state === "idle" && selection) {
            this.state = "down";
            this.changeSelection(selection);
            this.needRefreshing = true;
        } else if (this.state === "selected") {
            if (selection === undefined) {
                this.state = "idle";
                this.changeSelection(undefined);
                this.needRefreshing = true;
            } else {
                this.state = "down";
                if (selection !== this.selection) {
                    this.changeSelection(selection);
                    //Question 4
                    //this.deplacementDistant(e);
                    this.needRefreshing = true;
                }
            }
        }
        if (this.needRefreshing)
            this.chain.draw(this.displayer, undefined, false);
    }

    //fait l'hypothèse que p_selection est différent de this.selection
    changeSelection(p_selection) {
        if (this.selection) {
            this.selection.selected = false;
        }
        this.selection = p_selection;
        if (p_selection) this.selection.selected = true;
    }

    deplacementLibre(e) {
        this.selection.move(e, this.previousLocation);
        this.previousLocation = { x: e.offsetX, y: e.offsetY };
        this.needRefreshing = true;
    }

    returnChild(select) {
        if (select.bones[0] != undefined) {
            return select.bones[0].to;
        }
    }

    loopSnakeLike(select, i, distTab, force) {
        while (select != undefined && force != 0) {
            let vectFromToApres = new Coord2D(select.from.p.c.x - select.to.p.c.x, select.from.p.c.y - select.to.p.c.y);
           
            let lengthVect = vectFromToApres.norme();
            vectFromToApres.x /= lengthVect;
            vectFromToApres.y /= lengthVect;

            if (select.to.p.c.x > select.from.p.c.x) {
                vectFromToApres.x *= -1;
            }

            if (select.to.p.c.y > select.from.p.c.y) {
                vectFromToApres.y *= -1;
            }

            console.log(vectFromToApres, select.to.p.c, select.from.p.c);
            select.to.p.c = new Coord2D(vectFromToApres.x* distTab[i] + select.from.p.c.x, vectFromToApres.y * distTab[i] + select.from.p.c.y);
            select = select.to.bones[0];
            i++;
            force--;
        }
    }

    loopDistFromToAvant(select) {
        let distTab = [];
        while (select != undefined) {
            distTab.push(Math.sqrt(Math.pow(select.from.p.c.x - select.to.p.c.x, 2) + Math.pow(select.from.p.c.y - select.to.p.c.y, 2)));
            select = select.to.bones[0];
        }

        return distTab;
    }

    deplacementSnakeLike(e, force) {
        let distTab = this.loopDistFromToAvant(this.selection.bones[0]);

        this.selection.move(e, this.previousLocation);
        this.previousLocation = { x: e.offsetX, y: e.offsetY };

        this.loopSnakeLike(this.selection.bones[0], 0, distTab, force);
    }

    deplacementDistant(e) {
        if (this.selection.bones[0] != undefined) {
            let save = this.selection.bones[0].to.p.c;
            this.selection.bones[0].to.p.c = this.selection.bones[0].from.p.c;
            this.selection.bones[0].from.p.c = save;
            
            this.selection.move(e, this.previousLocation);
            this.previousLocation = { x: e.offsetX, y: e.offsetY };
            this.needRefreshing = true;

        }
    }

    handleMove(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        this.needRefreshing = false;
 
        if (this.state === "down") {
            this.state = "move";
        }
        if (this.state === "move") {
            //Question 1
            //this.deplacementLibre(e);

            //Question 2
            this.deplacementSnakeLike(e, 2);
            this.needRefreshing = true;

            //Question 4 (voir handlePress)

        }
        if (this.needRefreshing)
            this.chain.draw(this.displayer, undefined, false);
    }

    handleUpLeave(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        this.needRefreshing = false;

        if (this.state === "move") {
            this.state = "selected";
        } else if (this.state === "down") {
            this.state = "selected";
        }
        if (this.needRefreshing)
            this.chain.draw(this.displayer, undefined, false);
    }
}

class Displayer {
    static defaultWindowSpace = { w: 600, h: 800 };
    static defaultModelSpace = {
        minX: 0,
        maxX: Displayer.defaultWindowSpace.w,
        minY: 0,
        maxY: Displayer.defaultWindowSpace.h,
    };
    currentTest;

    constructor(_htmlElement) {
        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("width", Displayer.defaultWindowSpace.w);
        this.canvas.setAttribute("height", Displayer.defaultWindowSpace.h);
        _htmlElement.appendChild(this.canvas);

        if (this.canvas.getContext) {
            this.g2d = this.canvas.getContext("2d");
        } else {
            this.canvas.write(
                "Votre navigateur ne peut visualiser cette page correctement"
            );
        }

        this.lineWidth = 1;
        this.pointSize = 15; //= half width
        this.padding = 4 * this.pointSize;
        this.epsilon = 3 * this.lineWidth;
        this.colors = new Colors();

        //dimensions du display
        this.setDisplaySpace(this.canvas.width, this.canvas.height);

        //dimensions des données à afficher
        this.setModelSpace(
            Displayer.defaultModelSpace.minX,
            Displayer.defaultModelSpace.minY,
            Displayer.defaultModelSpace.maxX,
            Displayer.defaultModelSpace.maxY
        );

        this.init();
    }

    getCanvas() {
        return this.canvas;
    }

    //todo: vérifier max > min et gérer les erreurs ?
    setModelSpace(minX, minY, maxX, maxY) {
        //dimensions des données à afficher
        this.minX = minX ?? 0;
        this.maxX = maxX ?? this.canvas.width;
        this.minY = minY ?? 0;
        this.maxY = maxY ?? this.canvas.height;
    }

    setDisplaySpace(w, h) {
        //dimensions du display
        this.cWidth = w;
        this.cHeight = h;
        this.cCenterX = w / 2;
        this.cCenterY = h / 2;
    }

    setOptions(points, incrementalDrawing) {
        this.points = points ?? this.points;
        this.incrementalDrawing = incrementalDrawing ?? false;
        //console.log("pn = " + pointsNumber);
        let pointsNumber = this.points ? this.points.length: 0;
        this.pointSize = pointsNumber < 200 ? 15 : pointsNumber < 2000 ? 2 : 1;
        if (!incrementalDrawing) this.init();
    }

    init() {
        this.g2d.clearRect(0, 0, this.cWidth, this.cHeight);
        this.g2d.fillStyle = this.colors.bg;
        this.g2d.fillRect(0, 0, this.cWidth, this.cHeight);
    }

    // crée des coordonnées pour l'interaction dans le canvas de ce displayer
    m2p(p) {
        if (p.c) return p.c;
        p.c = new Coord2D(
            this.padding +
                ((this.cWidth - 2 * this.padding) * (p.x - this.minX)) /
                    (this.maxX - this.minX),
            this.padding +
                ((this.cHeight - 2 * this.padding) * (p.y - this.maxY)) /
                    (this.minY - this.maxY),
            "g_" + p.label
        );
        let d = this.minX;
       // console.log("making ghost  " + this.minX);
        //console.log("making ghost  " + p.c.toString());
        return p.c;
    }

    // mc - { mc.x, mc.y } coordonnées de la souris dans le canvas
    // ce un chainElement affiché par un ghost dans le display
    intersect(ce, mc) {
        let x = ce.getGhost().x,
            y = ce.getGhost().y,
            r = this.pointSize + this.epsilon;
        let b =
            mc.x <= x + r && mc.x >= x - r && mc.y <= y + r && mc.y >= y - r;

        return b;
    }

    //dessin point donné par coordonnées cartésiennes (transformées en coordonnées canvas)
    mDrawPoint(p, selected) {
        this.g2d.beginPath();
        let ghost = this.m2p(p),
            x = ghost.x,
            y = ghost.y;
        //       console.log("coordinates on canvas " + ghost.toString() + " " + y);

        this.g2d.arc(x, y, this.pointSize, 0, Math.PI * 2, true);
        this.g2d.fillStyle = selected ? this.colors.lc: this.colors.bg;
        this.g2d.fill();
        this.g2d.strokeStyle =  this.colors.fg;
        //        console.log("what is the color of points " + this.colors.fg+ " "+ this.pointSize+this.g2d);
        this.g2d.stroke();
        if (this.pointSize > 10 && p.label) {
            this.g2d.fillStyle = selected ? this.colors.bg : this.colors.txt;
            let dx = p.label.length * 3,
                dy = 2;
            this.g2d.fillText(p.label, x - dx, y + dy);
        } else if (!p.label) {
            console.log("drole d'oiseau que ce point la " + p);
        }
    }

 
    // dessin segment entre points en coordonnées cartésiennes
    // coordonnées du modèle traduites en coordonnées canvas
    mDrawLine(p1, p2) {
        this.g2d.strokeStyle = this.colors.lc;
       // console.log(this.colors.lc);
        this.g2d.beginPath();
        this.g2d.moveTo(this.m2p(p1).x, this.m2p(p1).y);
        this.g2d.lineWidth = this.lineWidth;
        this.g2d.lineJoin = "round";
        this.g2d.lineTo(this.m2p(p2).x, this.m2p(p2).y);
        this.g2d.stroke();
    }

    //dessin segment entre points en coordonnées "canvas"
    pDrawLine(x1, y1, x2, y2) {
        this.g2d.strokeStyle = this.colors.lc;
        this.g2d.beginPath();
        this.g2d.moveTo(x1, y1);
        this.g2d.lineTo(x2, y2);
        this.g2d.stroke();
    }
 
}
