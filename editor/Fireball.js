/* classe permettant de dessiner une boule de feu d'une certaine couleur*/
class Fireball {

    static getInstanceFromData(data){
        let fireball = new Fireball(); 
        fireball.x = data.x;
        fireball.y = data.y;
        fireball.width = data.width;
        fireball.height = data.height;
        fireball.pivotX = data.pivotX;
        fireball.pivotY = data.pivotY;
        fireball.scaleX = data.scaleX;
        fireball.scaleY= data.scaleY;
        fireball.rotation = data.rotation;
        fireball.fillColor = data.fillColor;
        fireball.numPeaks = data.numPeaks;
        fireball.shadowBlur = data.shadowBlur;
        fireball.shadowColor = data.shadowColor;
        fireball.edgeColor = data.edgeColor;
        fireball.offset = data.offset;
        fireball.power = data.power;
        fireball.thickness = data.thickness;

        return fireball;
    }


    constructor(width = 100, height = 200, color = "#ffffff", edgeColor = "#ff0000", shadowColor ="#ff0000") {
        this.width = width;
        this.height = height;
        this.fillColor = color;
        this.numPeaks = 6;
        this.shadowBlur = 4;
        this.shadowColor = shadowColor;
        this.edgeColor = edgeColor;
        this.offset = 0;
        this.power = 1;
        this.thickness = 4;
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.scaleX = 1;
        this.scaleY = 1; 
        this.pivotX = 0;
        this.pivotY = 0;
    }
    // fonction renvoyant toujours le même nombre en position "num"
    // pour la graine "seed". Cette fonctionnalité nous sert à retourner
    // une suite de nombres qui ont l'air aléatoire.
    pseudorandom(num, seed = 0) {

        let t = seed + ((num % 0xFFFF) * 0x6D2B79F5);

        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    // fonction "double dent de scie avec bruit"
    // le paramètre "t" représente le "temps courant"
    // le paramètre "m" représente le "temps maximum"
    // le paramètre "o" représente un décalage dans le temps "offset"
    compose(t, m, o = 0) {

        t = t % m;

        // on inverse le décalage (offset)  lorsqu'on
        // est situé en dessous de la moitié de la courbe
        // afin que le décalage s'opère dans le bon sens
        let offset = ((t < m / 2) < 0.5) ? -o : o;

        // on calcule la valeur "double dent de scie"
        let value1 = this.doubleSawtooth(t, m, 0);

        // puis on calcule la valeur "dent de scie" sur un 1/6ème
        // de la longueur totale à chaque fois
        let value2 = this.sawtooth(t, m / this.numPeaks, -offset);

        // puis on ajoute un bruit pseudo aléatoire
        let value3 = this.pseudorandom(t * m);

        // on inverse le sens de la fonction "dent de scie"
        // lorsqu'on est situé en dessous de la moitié de la 
        // courbe afin d'obtenir la courbe dans le bon sens
        if (t < m / 2) {
            value2 = 1 - value2;
        }

        // on pondère le résultat de la première fonction en lui accordant 
        // un "poids" plus important qu'au second et troisième résultats
        value1 *= 0.85;
        value2 *= 0.1;
        value3 *= 0.05;

        // on retourne la combinaison des deux valeurs élevée à puissance 1/2
        return Math.pow(value1 + value2 + value3, this.power);
    }

    // fonction traçant une courbe de type "dent de scie" au cours du temps
    // le paramètre "t" représente le "temps courant"
    // le paramètre "m" représente le "temps maximum"
    // le paramètre "o" représente un décalage dans le temps "offset"
    doubleSawtooth(t, m, o = 0) {
        let x = (t + o) / m * 2;
        return 1 - Math.abs(x % 2 - 1);
    }

    // fonction traçant une courbe de type "dent de scie" au cours du temps
    // le paramètre "t" représente le "temps courant"
    // le paramètre "m" représente le "temps maximum"
    // le paramètre "o" représente un décalage dans le temps "offset"
    sawtooth(t, m, o = 0) {
        let x = (t + o) / m;
        return (1 - x - Math.floor(1 - x));
    }

    getSmartPivot(){
        return {
            x: this.width >> 1,
            y:  this.height - ( this.width >> 1 )
        }
    }
    
    // dessine une boule de feu 
    render(ctx) {
        
        let startHeight = this.height - ( this.width >> 1 );
        // save context
        ctx.save();


        // style definition
        ctx.fillStyle = this.fillColor;
        ctx.strokeStyle = this.edgeColor;
        ctx.lineWidth = this.thickness;
        ctx.shadowBlur = this.shadowBlur;
        ctx.shadowColor = this.shadowColor;

        // geometric operations
        ctx.translate(this.x + this.pivotX, this.y + this.pivotY);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.scale(this.scaleX, this.scaleY);
        ctx.translate(-this.pivotX, -this.pivotY);

        // draw path
        ctx.beginPath();
        ctx.moveTo(0, startHeight);
        
        
        for (let i = 0; i < this.width; i++) {
            ctx.lineTo(i, startHeight - this.compose(i, this.width, this.offset) * startHeight);
        }
        
        ctx.lineTo(this.width, startHeight);
        ctx.arc(this.width >> 1, startHeight, this.width >> 1, 0, Math.PI);
        ctx.lineTo(0, startHeight);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        // restore context
        ctx.restore();
    }

}

export {Fireball};