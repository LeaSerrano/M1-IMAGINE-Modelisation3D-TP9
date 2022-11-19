class Coord2D {
    c; //ghost utilisé pour gérer les interactions
   constructor(x, y, label) {
        this.x = x;
        this.y = y;
        this.label = label;
    }

    norme() {
        //        console.log("vecteur " + this.label + " = " + this.x + ", " + this.y);
        let squareSum = this.x * this.x + this.y * this.y;
        if (squareSum > 0) return Math.sqrt(squareSum);
        else {
            console.log("warning: in norme@Coord2D a sum of square is negative : " + squareSum);
            return 0;
        }
    }

    // copie s-uperficielle 
    scopy() {
        return new Coord2D(this.x, this.y, this.label );
    }



    //a et b sont des points du plan représentés par leurs coordonnées en 2D
    static vecteur(a, b) {
 //       console.log("v = " + a.label + "(" + a.x + "," + a.y + "), " + b.label + "("+b.x + "," + b.y + ")" );
 //       console.log("\n(" + a.label + ", " + b.label+")");
        let resultat = new Coord2D(b.x - a.x, b.y - a.y, a.label);
       /* console.log("v = (" + resultat.x + "," + resultat.y + ")");
        console.log("norme = " + resultat.norme());*/
        return resultat;
    }

 
}
