const canvas = document.querySelector('canvas');
const scoreEl = document.querySelector('#score_el');
const startGameBtn = document.getElementById("start_game_btn");
const modalEl = document.querySelector('#modal_el');
const bigScore = document.getElementById('big_score');

console.log(scoreEl)

canvas.width = innerWidth;
canvas.height = innerHeight;

const c = canvas.getContext('2d');

class Player {
    constructor(x, y, radius, color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
}

const W = canvas.width / 2;
const H = canvas.height / 2;

 let player = new Player(W, H, 18, 'white');

class Projectile {
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    upDate() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
};

class Enemy {
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    upDate() {
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
};

const friction = 0.98;

class Particle {
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }

    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }

    upDate() {
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpha -= 0.01;
    }
};

let projectiles = [];
let enemies = []; 
let particles = [];

function init() {
   player = new Player(W, H, 18, 'white');
   projectiles = [];
   enemies = [];
   particles = [];
   score = 0;
   bigScore.innerHTML = score;
   scoreEl.innerHTML = score;
}

function spawnEnemies() {
setInterval(() => {

    const radius = Math.random() * (30 - 6) + 6;
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`;

    let x;
    let y;

    if (Math.random() < 0.5) {
        x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
        y = Math.random() * canvas.height;
    } else {
        x = Math.random() * canvas.width;
        y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
   
    const angle = Math.atan2(
        canvas.height / 2 - y,
        canvas.width / 2 - x
    )

    const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    };

    enemies.push(new Enemy(x, y, radius, color, velocity));
}, 1000);
};

let animationId;
let score = 0;

function animate() {
    animationId = requestAnimationFrame(animate);

    c.fillStyle = 'rgb(0, 0, 0, 0.1)';
    c.fillRect(0, 0, canvas.width, canvas.height);
    player.draw();

    particles.forEach((Particle, index) => {
        if (Particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
            Particle.upDate();
        }
    });

    projectiles.forEach((Projectile, index) => {
        Projectile.upDate();

        // Remove from the screen
        if (Projectile.x + Projectile.radius < 0 ||
            Projectile.x - Projectile.radius > canvas.width ||
            Projectile.y + Projectile.radius < 0 ||
            Projectile.y - Projectile.radius > canvas.height
            ) {
            setTimeout(() => {
                projectiles.splice(index, 1);
              }, 0);
        }
    });

    enemies.forEach((Enemy, index) => {
        Enemy.upDate();

        // End the Game
        const dist = Math.hypot(player.x - Enemy.x, player.y - Enemy.y);
        if (dist - Enemy.radius - player.radius < 1){
            cancelAnimationFrame(animationId);
            modalEl.style.display = 'flex';
            bigScore.innerHTML = score;
        };

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - Enemy.x, projectile.y - Enemy.y);

            // When projectiles touch the enemy
            if (dist - Enemy.radius - projectile.radius < 1){

                //Create explosions
                for (let i = 0; i < Enemy.radius * 2; i++) {
                    particles.push(
                        new Particle(
                            projectile.x, projectile.y,
                             Math.random() * 2, Enemy.color,
                            {
                                x: (Math.random() - 0.5) * 
                                   (Math.random() * 6),
                                y: (Math.random() - 0.5) *
                                   (Math.random() * 6) 
                            })
                    );
                };
                if (Enemy.radius - 10 > 7) {
                    gsap.to(Enemy, {
                        radius: Enemy.radius - 10
                    });
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1);
                      }, 0);
                         //Increase Our Score When Shrink An Enemy
                score += 50;
                scoreEl.innerHTML = score;
                } else {
                    setTimeout(() => {
                        enemies.splice(index, 1);
                        projectiles.splice(projectileIndex, 1);
                      }, 0);
                           //Increase Our Score When Remove An Enemy
                score += 150;
                scoreEl.innerHTML = score;
                }
            };
        });
    });
};

addEventListener('click', (event) => {

    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2
    )

    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    };

    projectiles.push(
        new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white',
        velocity)
    );
   
});

startGameBtn.addEventListener('click', () => {
    init();
    animate();
    spawnEnemies()
    modalEl.style.display = 'none';
})

