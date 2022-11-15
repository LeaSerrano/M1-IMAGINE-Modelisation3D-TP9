class Move {
    rank;
    idj;
    x;
    y;
    constructor(joint, moveId) {
        this.rank = moveId;
        this.idj = joint.idj;
        this.x = joint.p.c.x;
        this.y = joint.p.c.y;
    }
    toString() {
        let a1 = Math.round(this.x * 100) / 100,
        a2 = Math.round(this.y * 100) / 100;
       
        return "[" + this.rank + "," + this.idj + "," +a1+ "," + a2 + "],<br \>";
    }
}

class Interactor {
//todo: à écrire

    constructor(p_chain, p_displayer, p_htmlElement) {
        this.displayer = p_displayer;
 
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
        console.log("handle wheel "+ e.deltaY );
    }

    handlePress(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.log("handle press " + e.offsetX + " " + e.offsetY);
    }

    handleMove(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.log("handle move " + e.offsetX + " " + e.offsetY);
    }

    handleUpLeave(e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.log("handle up and leave " + e.offsetX + " " + e.offsetY);
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
