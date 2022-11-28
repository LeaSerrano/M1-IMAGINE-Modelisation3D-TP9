class Joint {
    static id = 0;
    p;
    bones;
    moves;

    constructor(joint) {
       this.bones = new Array();
        this.moves = new Array();
        this.idj = Joint.id++;
        this.p = new Coord2D(joint.x, joint.y, "" +Joint.id);
    }

    toString() {
        return this.p.c.toString() + " ("+this.length+")";
    }

    drawIn(displayer) {
        displayer.mDrawPoint(this.p, this.selected);
    }

    move(p_e, p_previousLocation) {
        let delta = new Coord2D(p_e.offsetX - p_previousLocation.x, p_e.offsetY - p_previousLocation.y);

        this.getGhost().x += delta.x;
        this.getGhost().y += delta.y;

    }

    changeAlpha(up) {
        //todo up est un booléen qui dépend de l'évènement provenant de la souris (molette vers le haut ou vers le bas)
        //console.log("Todo: implémenter la méthode changeAlpha de Joint");

        if (this.bones[0] != undefined) {
            let x = this.bones[0].to.p.c.x;
            let y = this.bones[0].to.p.c.y;
            let cx = this.bones[0].from.p.c.x;
            let cy = this.bones[0].from.p.c.y;

            let radians;

            if (up == true) {
                radians = (Math.PI / 180) * Math.PI/2;
            }
            else {
                radians = (Math.PI / 180) * (-1 * Math.PI/2);
            }


            let cos = Math.cos(radians);
            let sin = Math.sin(radians);

            let delta = new Coord2D((cos * (x - cx)) + (sin * (y - cy)) + cx, (cos * (y - cy)) - (sin * (x - cx)) + cy);

            this.bones[0].to.p.c.x = delta.x;
            this.bones[0].to.p.c.y = delta.y;
        }
    }

    getGhost() {
        return this.p.c;
    }

}

class Bone {
    static id;
    needsUpdate;

    //from et to sont des Joints, ils référencent donc les coordonnées modèles et les coordonnées écran pour chaque articulation
    from;
    to;

    // ro et alpha sont les coordonnées polaires du vecteur fromto. Coordonnées polaires données dans un système de coordonnées écran, 
    // ça devrait couaquer mais je suppose que, pour le moment les couacs s'annulent.
    ro;
    alpha;

    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.needsUpdate = { ro: true, alpha: true };
        this.from.bones.push(this);
        this.idb = Bone.id++;
    }

    drawIn(displayer) {
        displayer.mDrawLine(this.from.p, this.to.p,);
    }
}

class Squelette {
    joints;
    bones;

    constructor(name) {
        this.name = name;
        this.forward = true;
        this.initModel();
    }

    getModelBox() {
        let minx = this.joints[0].p.x, miny = this.joints[0].p.y, maxx=minx, maxy=miny;
        for (let p of this.joints) {       
            if (p.p.x < minx) minx = p.p.x; if (p.p.y < miny) miny = p.p.y;
            if (p.p.x > maxx) maxx = p.p.x; if (p.p.y > maxy) maxy = p.p.y;
        }
 //       console.log("{ minX: " + minx + ", maxX: " + maxx + ", minY: " + miny + ", maxY: " + maxy + "}");
        return { minX: minx, maxX: maxx, minY: miny, maxY: maxy };
    }

    //dessin à partir du modèle
    draw(displayer, colors, incrementalDrawing) {
        //todo - gerer colors et incrementalDrawing
        displayer.setOptions(colors, incrementalDrawing);
        this.bones.forEach(e => e.drawIn(displayer));
        this.joints.forEach(ce => ce.drawIn(displayer));
        if (this.neverDrawnBefore) {
            this.neverDrawnBefore = false;
        }
    }
    //on multiplie les coords par unitx et unity
    createNodesFromArrays(ox, oy, lx, ly, label) {
        let that = this, currentJoint;
        ly.forEach(
            (li, i) => {
                currentJoint = new Coord2D(ox+lx[i], oy + li , label + i);
                //if (i == size - 1) length = 0;
                that.joints.push(new Joint(currentJoint));
            });
    }
    createEdges(i, j) {
        let l;
         for (let k = i; k < j - 1; k++) {
             this.bones.push(new Bone(this.joints[k], this.joints[k + 1]));
             l = k + 1;
 //            console.log("createEdge from " + k + " to " + l);
       }
    }
    addEdge(i, j) {
 //       console.log("createEdge from " + i + " to " + j);
        this.bones.push(new Bone(this.joints[i], this.joints[j]));
    }

    initModel() {
        Joint.id = 0;
        Bone.id = 0;
        this.joints = new Array();
        this.bones = new Array();
        this.neverDrawnBefore = true;
        this.margX = 1; this.margY = 1;
        let x1 = this.margX + 1, x0 = this.margX;
        let lx, ly;
        let i = this.joints.length, j;

        //tronc
        x0 = x1 - 1;
        lx = [x1, x1, x1, x1, x1, x1];
        ly = [4.5, 5, 5.5, 6, 6.5, 7];
        i = this.joints.length;
        this.createNodesFromArrays(this.margX, this.margY, lx, ly, "t");
        j = this.joints.length;
        let neck = j - 1;
        this.createEdges(i, j);
       

        //right leg
        x0 = x1 - 0.75;
        lx = [ x0, x0, x0];
        ly = [ 4, 2, 0];
        i = this.joints.length;
       this.createNodesFromArrays(this.margX, this.margY, lx, ly, "rl");
        j = this.joints.length;
        this.createEdges(i, j);
        this.addEdge(0, i);

        //left leg
        x0 = x1 + 0.75;
        lx = [x0, x0, x0];
        ly = [4, 2, 0];
        i = this.joints.length;
        this.createNodesFromArrays(this.margX, this.margY, lx, ly, "ll");
        j = this.joints.length;
        this.createEdges(i, j);
        this.addEdge(0, i);
       

        //left arm
        x0 = x1 + 1;
        lx = [ x0, x0+0.5, x0+1];
        ly = [ 6.5, 5, 3.5];
        i = this.joints.length;
        this.createNodesFromArrays(this.margX, this.margY, lx, ly, "la");
        j = this.joints.length;
        this.createEdges(i, j);
        this.addEdge(neck, i);

        //right arm
        x0= x1 - 1;
        lx = [x0, x0 - 0.5, x0 - 1];
        ly = [6.5, 5, 3.5];
        i = this.joints.length;
        this.createNodesFromArrays(this.margX, this.margY, lx, ly, "ra");
        j = this.joints.length;
        this.createEdges(i, j);
        this.addEdge(neck, i);

        //mouth+nose
        lx = [x1, x1];
        ly = [7.5, 7.75];
        i = this.joints.length;
        this.createNodesFromArrays(this.margX, this.margY, lx, ly, "");
        j = this.joints.length;
        this.createEdges(i, j);
        this.addEdge(neck, i);

        //eyes
        lx = [x1+0.4];
        ly = [8];
        let nose = this.joints.length - 1;
        this.createNodesFromArrays(this.margX, this.margY, lx, ly, "le");
        j = this.joints.length;
        this.addEdge(nose, j - 1);
        lx = [x1 - 0.4];
        ly = [8];
        this.createNodesFromArrays(this.margX, this.margY, lx, ly, "re");
        j = this.joints.length;
        this.addEdge(nose, j - 1);

        //this.joints.forEach((x, i) => console.log("init squelette " + i + " " + x.p.toString()));
    }

    pick(p_displayer, p_e) {
        let selection = this.joints.filter(ce => p_displayer.intersect(ce, { x: p_e.offsetX, y: p_e.offsetY }));
        let s = selection.length > 0 ? selection[0] : undefined; //todo : à affiner au besoin pour gérer superpositions, pour le moment fait l'hypothèse qu'il n'y en a pas et/ou retourne le premier élément trouvé, ie le dernier affiché...
  //     console.log("selection " + selection.length);
        let size = this.joints.length;
        if (s) {
           return s; 
        }
        return undefined;
    }
}