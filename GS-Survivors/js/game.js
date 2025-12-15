/* ============================================
   GameStar Survivors - Das ultimative Redaktions-Roguelike
   Main Game Engine
   ============================================ */

// ============================================
// Configuration
// ============================================
const CONFIG = {
    // Player
    PLAYER_BASE_SPEED: 7,
    PLAYER_BASE_HEALTH: 100,

    // XP & Leveling
    XP_BASE_REQUIREMENT: 15,
    XP_SCALING: 1.6,

    // Enemies
    ENEMY_BASE_SPEED: 2.2,
    ENEMY_SPAWN_RATE_INITIAL: 1200, // ms
    ENEMY_SPAWN_RATE_MIN: 250,
    ENEMY_SPAWN_ACCELERATION: 0.96,

    // Combat
    INVINCIBILITY_FRAMES: 60,

    // Visual
    PARTICLE_LIMIT: 100,
    DAMAGE_NUMBER_DURATION: 1000,
};

// ============================================
// Game State
// ============================================
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    LEVEL_UP: 'levelUp',
    GAME_OVER: 'gameOver'
};

let currentState = GameState.MENU;
let canvas, ctx;
let lastTime = 0;
let deltaTime = 0;
let gameTime = 0;
let frameCount = 0;

// Game Objects
let player;
let enemies = [];
let projectiles = [];
let particles = [];
let xpOrbs = [];
let damageNumbers = [];
let groundEffects = [];

// Game Stats
let score = 0;
let killCount = 0;
let waveNumber = 1;
let coinsEarned = 0;

// Meta Progression (persisted in localStorage)
let metaProgression = {
    totalCoins: 0,
    upgrades: {
        maxHealth: 0,
        damage: 0,
        speed: 0,
        xpGain: 0,
        startingWeapon: 0
    },
    unlockedWeapons: ['faktenschleuder', 'wertungsblitz', 'news_nova']
};

const META_UPGRADES = {
    maxHealth: { name: "Lebenskraft", cost: [50, 100, 200, 400, 800], bonus: 10, emoji: "❤️" },
    damage: { name: "Waffenöl", cost: [75, 150, 300, 600], bonus: 0.1, emoji: "⚔️" },
    speed: { name: "Koffein-Resistenz", cost: [50, 100, 200, 400], bonus: 0.1, emoji: "👟" },
    xpGain: { name: "Schnellleser", cost: [100, 200, 400], bonus: 0.15, emoji: "📚" },
    startingWeapon: { name: "Waffenlizenz", cost: [200, 400, 600, 1000], bonus: 1, emoji: "🔓" }
};

// Starter weapon selection
let selectedStarterWeapon = 'faktenschleuder';

// Input
const keys = {};
const mouse = { x: 0, y: 0 };

// Camera (for infinite map feel)
const camera = { x: 0, y: 0 };

// ============================================
// Characters (Playable)
// ============================================
const CHARACTERS = {
    petra: {
        name: "Petra Schmitz",
        emoji: "👩‍💼",
        description: "Chefredakteurin",
        startWeapon: "faktenschleuder",
        stats: { health: 100, speed: 14, power: 1.0 }
    },
    heiko: {
        name: "Heiko Klinge",
        emoji: "🎮",
        description: "Test-Experte",
        startWeapon: "wertungsblitz",
        stats: { health: 80, speed: 16, power: 1.2 }
    },
    michael: {
        name: "Michael Graf",
        emoji: "📝",
        description: "News-Veteran",
        startWeapon: "news_nova",
        stats: { health: 120, speed: 12, power: 0.9 }
    }
};

let selectedCharacter = 'petra';

// ============================================
// Weapons Definition
// ============================================
const WEAPONS = {
    faktenschleuder: {
        name: "Faktenschleuder",
        emoji: "📰",
        description: "Schießt Gaming-Fakten auf den nächsten Feind",
        baseDamage: 10,
        fireRate: 500,
        projectileSpeed: 8,
        pierce: 1,
        type: "projectile"
    },
    wertungsblitz: {
        name: "Wertungsblitz",
        emoji: "⚡",
        description: "Blitzschnelle 90er-Wertungen",
        baseDamage: 15,
        fireRate: 350,
        projectileSpeed: 12,
        pierce: 2,
        type: "projectile"
    },
    news_nova: {
        name: "News Nova",
        emoji: "💥",
        description: "Explosive Breaking News",
        baseDamage: 25,
        fireRate: 1000,
        projectileSpeed: 6,
        pierce: 1,
        aoe: 80,
        type: "explosive"
    },
    kaffee_aura: {
        name: "Kaffee-Aura",
        emoji: "☕",
        description: "Schädigt nahestehende Feinde",
        baseDamage: 5,
        fireRate: 200,
        range: 120,
        type: "aura"
    },
    mausklick: {
        name: "Mausklick-Massaker",
        emoji: "🖱️",
        description: "Trifft alle Feinde im Bereich",
        baseDamage: 8,
        fireRate: 600,
        range: 200,
        type: "radial"
    },
    deadline_drohne: {
        name: "Deadline-Drohne",
        emoji: "🚁",
        description: "Kreist um den Spieler",
        baseDamage: 12,
        fireRate: 100,
        range: 100,
        type: "orbital"
    },
    kettenblitz: {
        name: "Kettenblitz",
        emoji: "⚡",
        description: "Springt zwischen Feinden",
        baseDamage: 18,
        fireRate: 800,
        chainCount: 4,
        chainRange: 150,
        type: "chain"
    },
    flammenspur: {
        name: "Flammenspur",
        emoji: "🔥",
        description: "Hinterlässt brennenden Boden",
        baseDamage: 6,
        fireRate: 100,
        duration: 3000,
        type: "trail"
    },
    heiliges_wasser: {
        name: "Heiliges Wasser",
        emoji: "💧",
        description: "Schadenszonen am Boden",
        baseDamage: 15,
        fireRate: 2000,
        range: 100,
        duration: 4000,
        type: "zone"
    },
    schrotflinte: {
        name: "Schrotflinte",
        emoji: "💨",
        description: "Feuert mehrere Projektile",
        baseDamage: 8,
        fireRate: 900,
        projectileSpeed: 10,
        projectileCount: 5,
        spread: 0.4,
        pierce: 1,
        type: "shotgun"
    }
};

// ============================================
// Enemy Types
// ============================================
const ENEMY_TYPES = {
    troll: {
        name: "Kommentar-Troll",
        emoji: "👹",
        health: 25,
        damage: 15,
        speed: 1.4,
        size: 30,
        color: "#FF4444",
        xp: 3
    },
    bug: {
        name: "Release-Bug",
        emoji: "🐛",
        health: 18,
        damage: 10,
        speed: 2.0,
        size: 25,
        color: "#88FF44",
        xp: 2
    },
    clickbait: {
        name: "Clickbait-Geist",
        emoji: "👻",
        health: 12,
        damage: 20,
        speed: 2.5,
        size: 28,
        color: "#FF88FF",
        xp: 4
    },
    hater: {
        name: "Hater-Horde",
        emoji: "😠",
        health: 30,
        damage: 12,
        speed: 1.2,
        size: 32,
        color: "#FF8800",
        xp: 3
    },
    boss_microtransaction: {
        name: "Microtransaktions-Monster",
        emoji: "💰",
        health: 800,
        damage: 40,
        speed: 0.8,
        size: 80,
        color: "#FFD700",
        xp: 50,
        isBoss: true
    },
    boss_crunch: {
        name: "Crunch-Krake",
        emoji: "🐙",
        health: 1200,
        damage: 35,
        speed: 1.0,
        size: 100,
        color: "#9B59B6",
        xp: 75,
        isBoss: true
    }
};

// ============================================
// Upgrades Pool
// ============================================
const UPGRADES = {
    // Weapon Upgrades
    damage_up: {
        name: "Mehr Argumente",
        emoji: "💪",
        description: "+20% Waffenschaden",
        rarity: "common",
        effect: (p) => { p.damageMultiplier *= 1.2; }
    },
    speed_up: {
        name: "Red Bull",
        emoji: "🥤",
        description: "+15% Bewegungstempo",
        rarity: "common",
        effect: (p) => { p.speed *= 1.15; }
    },
    fire_rate_up: {
        name: "Schnellschreiben",
        emoji: "⌨️",
        description: "+20% Feuerrate",
        rarity: "common",
        effect: (p) => { p.fireRateMultiplier *= 0.8; }
    },
    health_up: {
        name: "Döner-Pause",
        emoji: "🥙",
        description: "+25 Max Leben",
        rarity: "common",
        effect: (p) => { p.maxHealth += 25; p.health = Math.min(p.health + 25, p.maxHealth); }
    },
    pickup_range: {
        name: "Langer Arm",
        emoji: "🦾",
        description: "+50% XP-Aufnahmeradius",
        rarity: "uncommon",
        effect: (p) => { p.pickupRange *= 1.5; }
    },
    pierce_up: {
        name: "Durchschlagskraft",
        emoji: "🎯",
        description: "+1 Durchdringung",
        rarity: "uncommon",
        effect: (p) => { p.pierce += 1; }
    },
    regeneration: {
        name: "Kaffee-Tropf",
        emoji: "☕",
        description: "Regeneriere 1 HP/Sek",
        rarity: "rare",
        effect: (p) => { p.regen += 1; }
    },
    critical: {
        name: "Hot Take",
        emoji: "🔥",
        description: "+10% Kritische Chance",
        rarity: "rare",
        effect: (p) => { p.critChance += 0.1; }
    },
    shield: {
        name: "Quellen-Schutz",
        emoji: "🛡️",
        description: "Absorbiert 1 Treffer alle 30 Sek",
        rarity: "legendary",
        effect: (p) => { p.shieldCooldown = 30; p.hasShield = true; }
    },

    // New Weapons
    new_kaffee: {
        name: "Kaffee-Aura",
        emoji: "☕",
        description: "Neue Waffe: Dauerschaden im Nahbereich",
        rarity: "rare",
        isWeapon: true,
        weaponId: "kaffee_aura"
    },
    new_mausklick: {
        name: "Mausklick-Massaker",
        emoji: "🖱️",
        description: "Neue Waffe: AoE-Angriffe",
        rarity: "rare",
        isWeapon: true,
        weaponId: "mausklick"
    },
    new_deadline: {
        name: "Deadline-Drohne",
        emoji: "🚁",
        description: "Neue Waffe: Orbitale Verteidigung",
        rarity: "legendary",
        isWeapon: true,
        weaponId: "deadline_drohne"
    }
};

// ============================================
// Player Class
// ============================================
class Player {
    constructor(characterId) {
        const char = CHARACTERS[characterId];

        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.worldX = 0;
        this.worldY = 0;

        this.size = 40;
        this.speed = char.stats.speed;
        this.maxHealth = char.stats.health;
        this.health = this.maxHealth;

        // Stats
        this.damageMultiplier = char.stats.power;
        this.fireRateMultiplier = 1.0;
        this.pickupRange = 60;
        this.pierce = 0;
        this.regen = 0;
        this.critChance = 0.05;
        this.hasShield = false;
        this.shieldActive = false;
        this.shieldTimer = 0;
        this.shieldCooldown = 0;

        // XP & Level
        this.level = 1;
        this.xp = 0;
        this.xpToLevel = CONFIG.XP_BASE_REQUIREMENT;

        // Weapons
        this.weapons = [{
            id: char.startWeapon,
            level: 1,
            lastFire: 0
        }];

        // Animation
        this.animFrame = 0;
        this.animTimer = 0;
        this.facingRight = true;

        // Invincibility
        this.invincible = false;
        this.invincibilityTimer = 0;

        // Character visuals
        this.emoji = char.emoji;
        this.color = "#005D9E";
    }

    update(dt) {
        // Movement
        let dx = 0, dy = 0;

        if (keys['w'] || keys['W'] || keys['ArrowUp']) dy -= 1;
        if (keys['s'] || keys['S'] || keys['ArrowDown']) dy += 1;
        if (keys['a'] || keys['A'] || keys['ArrowLeft']) { dx -= 1; this.facingRight = false; }
        if (keys['d'] || keys['D'] || keys['ArrowRight']) { dx += 1; this.facingRight = true; }

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }

        this.worldX += dx * this.speed;
        this.worldY += dy * this.speed;

        // Animation
        if (dx !== 0 || dy !== 0) {
            this.animTimer += dt;
            if (this.animTimer > 100) {
                this.animFrame = (this.animFrame + 1) % 4;
                this.animTimer = 0;
            }
        }

        // Regeneration
        if (this.regen > 0) {
            this.health = Math.min(this.maxHealth, this.health + this.regen * dt / 1000);
        }

        // Shield
        if (this.hasShield && !this.shieldActive) {
            this.shieldTimer += dt / 1000;
            if (this.shieldTimer >= this.shieldCooldown) {
                this.shieldActive = true;
                this.shieldTimer = 0;
            }
        }

        // Invincibility frames
        if (this.invincible) {
            this.invincibilityTimer -= dt;
            if (this.invincibilityTimer <= 0) {
                this.invincible = false;
            }
        }

        // Fire weapons
        this.weapons.forEach(weapon => this.fireWeapon(weapon));

        // Collect XP orbs
        this.collectXP();
    }

    fireWeapon(weapon) {
        const now = performance.now();
        const def = WEAPONS[weapon.id];
        const adjustedFireRate = def.fireRate * this.fireRateMultiplier;

        if (now - weapon.lastFire < adjustedFireRate) return;

        weapon.lastFire = now;

        switch (def.type) {
            case "projectile":
            case "explosive":
                this.fireProjectile(weapon, def);
                break;
            case "aura":
                this.fireAura(weapon, def);
                break;
            case "radial":
                this.fireRadial(weapon, def);
                break;
            case "orbital":
                this.fireOrbital(weapon, def);
                break;
            case "chain":
                this.fireChainLightning(weapon, def);
                break;
            case "trail":
                this.fireTrail(weapon, def);
                break;
            case "zone":
                this.fireZone(weapon, def);
                break;
            case "shotgun":
                this.fireShotgun(weapon, def);
                break;
        }
    }

    fireProjectile(weapon, def) {
        // Find closest enemy
        let closest = null;
        let minDist = Infinity;

        enemies.forEach(enemy => {
            const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (dist < minDist) {
                minDist = dist;
                closest = enemy;
            }
        });

        if (!closest) return;

        const dx = closest.x - this.x;
        const dy = closest.y - this.y;
        const mag = Math.hypot(dx, dy);

        const damage = def.baseDamage * this.damageMultiplier * (1 + (weapon.level - 1) * 0.2);

        projectiles.push(new Projectile(
            this.x,
            this.y,
            (dx / mag) * def.projectileSpeed,
            (dy / mag) * def.projectileSpeed,
            damage,
            def.pierce + this.pierce + (weapon.level - 1),
            def.aoe || 0,
            def.emoji
        ));

        // Spawn particle
        this.spawnMuzzleFlash();
    }

    fireAura(weapon, def) {
        const damage = def.baseDamage * this.damageMultiplier * (1 + (weapon.level - 1) * 0.3);
        const range = def.range * (1 + (weapon.level - 1) * 0.15);

        enemies.forEach(enemy => {
            const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (dist < range) {
                enemy.takeDamage(damage);
            }
        });

        // Aura visual
        particles.push(new Particle(this.x, this.y, "#884400", range, "ring", 200));
    }

    fireRadial(weapon, def) {
        const damage = def.baseDamage * this.damageMultiplier * (1 + (weapon.level - 1) * 0.25);
        const range = def.range * (1 + (weapon.level - 1) * 0.1);

        enemies.forEach(enemy => {
            const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (dist < range) {
                enemy.takeDamage(damage);
                // Hit flash
                particles.push(new Particle(enemy.x, enemy.y, "#FFFF00", 15, "flash", 100));
            }
        });

        // Radial wave visual
        particles.push(new Particle(this.x, this.y, "#00AAFF", range, "wave", 300));
    }

    fireOrbital(weapon, def) {
        // Add orbital projectiles if not at max
        const maxOrbitals = weapon.level + 1;
        const existingOrbitals = projectiles.filter(p => p.orbital && p.weaponId === weapon.id).length;

        if (existingOrbitals < maxOrbitals) {
            const damage = def.baseDamage * this.damageMultiplier;
            const angle = (existingOrbitals / maxOrbitals) * Math.PI * 2;
            projectiles.push(new OrbitalProjectile(this, damage, def.range, angle, weapon.id, def.emoji));
        }
    }

    fireChainLightning(weapon, def) {
        if (enemies.length === 0) return;

        const damage = def.baseDamage * this.damageMultiplier * (1 + (weapon.level - 1) * 0.25);
        const chainCount = def.chainCount + weapon.level - 1;
        const chainRange = def.chainRange * (1 + (weapon.level - 1) * 0.1);

        // Find first target
        let currentTarget = null;
        let minDist = Infinity;
        enemies.forEach(e => {
            const d = Math.hypot(e.x - this.x, e.y - this.y);
            if (d < minDist) { minDist = d; currentTarget = e; }
        });

        if (!currentTarget) return;

        const hitEnemies = new Set();
        let prevX = this.x, prevY = this.y;

        for (let i = 0; i < chainCount && currentTarget; i++) {
            currentTarget.takeDamage(damage * Math.pow(0.8, i));
            hitEnemies.add(currentTarget);

            // Lightning visual
            this.drawLightning(prevX, prevY, currentTarget.x, currentTarget.y);
            prevX = currentTarget.x;
            prevY = currentTarget.y;

            // Find next target
            let nextTarget = null;
            let nextDist = Infinity;
            enemies.forEach(e => {
                if (hitEnemies.has(e)) return;
                const d = Math.hypot(e.x - currentTarget.x, e.y - currentTarget.y);
                if (d < chainRange && d < nextDist) { nextDist = d; nextTarget = e; }
            });
            currentTarget = nextTarget;
        }
    }

    drawLightning(x1, y1, x2, y2) {
        for (let i = 0; i < 5; i++) {
            const t = i / 4;
            const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 20;
            const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 20;
            particles.push(new Particle(x, y, "#00FFFF", 8, "spark", 150));
        }
    }

    fireTrail(weapon, def) {
        const damage = def.baseDamage * this.damageMultiplier * (1 + (weapon.level - 1) * 0.2);
        // Drop fire on ground
        if (Math.random() < 0.3) {
            groundEffects.push(new GroundEffect(
                this.x + (Math.random() - 0.5) * 30,
                this.y + (Math.random() - 0.5) * 30,
                damage, 40 + weapon.level * 5, def.duration, "fire"
            ));
        }
    }

    fireZone(weapon, def) {
        const damage = def.baseDamage * this.damageMultiplier * (1 + (weapon.level - 1) * 0.3);
        const range = def.range * (1 + (weapon.level - 1) * 0.15);

        // Find random enemy position or random spot near player
        let x, y;
        if (enemies.length > 0 && Math.random() < 0.7) {
            const target = enemies[Math.floor(Math.random() * enemies.length)];
            x = target.x;
            y = target.y;
        } else {
            x = this.x + (Math.random() - 0.5) * 300;
            y = this.y + (Math.random() - 0.5) * 300;
        }

        groundEffects.push(new GroundEffect(x, y, damage, range, def.duration, "water"));
    }

    fireShotgun(weapon, def) {
        let closest = null;
        let minDist = Infinity;
        enemies.forEach(e => {
            const d = Math.hypot(e.x - this.x, e.y - this.y);
            if (d < minDist) { minDist = d; closest = e; }
        });

        if (!closest) return;

        const baseAngle = Math.atan2(closest.y - this.y, closest.x - this.x);
        const damage = def.baseDamage * this.damageMultiplier * (1 + (weapon.level - 1) * 0.15);
        const count = def.projectileCount + Math.floor(weapon.level / 2);

        for (let i = 0; i < count; i++) {
            const angle = baseAngle + (i - (count - 1) / 2) * def.spread / count;
            projectiles.push(new Projectile(
                this.x, this.y,
                Math.cos(angle) * def.projectileSpeed,
                Math.sin(angle) * def.projectileSpeed,
                damage, def.pierce + this.pierce, 0, def.emoji
            ));
        }
        this.spawnMuzzleFlash();
    }

    spawnMuzzleFlash() {
        particles.push(new Particle(
            this.x + (this.facingRight ? 20 : -20),
            this.y,
            "#FFD700",
            15,
            "flash",
            100
        ));
    }

    collectXP() {
        for (let i = xpOrbs.length - 1; i >= 0; i--) {
            const orb = xpOrbs[i];
            const dist = Math.hypot(orb.x - this.x, orb.y - this.y);

            if (dist < this.pickupRange) {
                // Attract orb
                const speed = 8;
                const dx = this.x - orb.x;
                const dy = this.y - orb.y;
                orb.x += (dx / dist) * speed;
                orb.y += (dy / dist) * speed;

                if (dist < 15) {
                    this.xp += orb.value;
                    xpOrbs.splice(i, 1);

                    // Check level up
                    while (this.xp >= this.xpToLevel) {
                        this.xp -= this.xpToLevel;
                        this.level++;
                        this.xpToLevel = Math.floor(CONFIG.XP_BASE_REQUIREMENT * Math.pow(CONFIG.XP_SCALING, this.level - 1));
                        this.onLevelUp();
                    }
                }
            }
        }
    }

    onLevelUp() {
        currentState = GameState.LEVEL_UP;
        showLevelUpModal();
    }

    takeDamage(amount) {
        if (this.invincible) return;

        // Shield check
        if (this.shieldActive) {
            this.shieldActive = false;
            particles.push(new Particle(this.x, this.y, "#00FFFF", 60, "ring", 300));
            return;
        }

        this.health -= amount;
        this.invincible = true;
        this.invincibilityTimer = CONFIG.INVINCIBILITY_FRAMES * 16;

        // Screen shake
        camera.shake = 10;

        // Damage particle
        particles.push(new Particle(this.x, this.y, "#FF0000", 40, "ring", 200));

        if (this.health <= 0) {
            endGame();
        }
    }

    addWeapon(weaponId) {
        // Check if already have weapon
        const existing = this.weapons.find(w => w.id === weaponId);
        if (existing) {
            existing.level = Math.min(existing.level + 1, 8);
        } else {
            this.weapons.push({
                id: weaponId,
                level: 1,
                lastFire: 0
            });
        }
    }

    draw() {
        ctx.save();

        // Flicker when invincible
        if (this.invincible && Math.floor(this.invincibilityTimer / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        // Shield visual
        if (this.shieldActive) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size + 10, 0, Math.PI * 2);
            ctx.strokeStyle = "#00FFFF";
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.closePath();
        }

        // Body
        const bobY = Math.sin(this.animFrame * Math.PI / 2) * 3;

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + this.size / 2 + 5, this.size / 2, this.size / 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Character circle
        const gradient = ctx.createRadialGradient(
            this.x - 10, this.y - 10 + bobY, 5,
            this.x, this.y + bobY, this.size / 2
        );
        gradient.addColorStop(0, "#0088DD");
        gradient.addColorStop(1, "#004477");

        ctx.beginPath();
        ctx.arc(this.x, this.y + bobY, this.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Emoji face
        ctx.font = `${this.size * 0.6}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.emoji, this.x, this.y + bobY);

        // Direction indicator
        const indicatorX = this.x + (this.facingRight ? this.size / 2 + 10 : -this.size / 2 - 10);
        ctx.fillStyle = "#FFD700";
        ctx.beginPath();
        ctx.arc(indicatorX, this.y + bobY, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// ============================================
// Enemy Class
// ============================================
class Enemy {
    constructor(type, x, y) {
        const def = ENEMY_TYPES[type];

        this.type = type;
        this.x = x;
        this.y = y;
        this.size = def.size;
        this.maxHealth = def.health;
        this.health = this.maxHealth;
        this.damage = def.damage;
        this.speed = def.speed;
        this.color = def.color;
        this.emoji = def.emoji;
        this.xp = def.xp;
        this.isBoss = def.isBoss || false;

        // Animation
        this.animFrame = 0;
        this.animTimer = 0;
        this.hitFlash = 0;
    }

    update(dt) {
        // Move toward player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 0) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }

        // Animation
        this.animTimer += dt;
        if (this.animTimer > 150) {
            this.animFrame = (this.animFrame + 1) % 2;
            this.animTimer = 0;
        }

        // Hit flash decay
        if (this.hitFlash > 0) {
            this.hitFlash -= dt;
        }

        // Collision with player
        if (dist < (this.size + player.size) / 2) {
            player.takeDamage(this.damage);
        }
    }

    takeDamage(amount) {
        // Critical hit
        const isCrit = Math.random() < player.critChance;
        const finalDamage = isCrit ? amount * 2 : amount;

        this.health -= finalDamage;
        this.hitFlash = 100;

        // Damage number
        showDamageNumber(this.x, this.y - this.size / 2, Math.floor(finalDamage), isCrit);

        // Hit particle
        particles.push(new Particle(
            this.x + (Math.random() - 0.5) * this.size,
            this.y + (Math.random() - 0.5) * this.size,
            isCrit ? "#FFFF00" : "#FFFFFF",
            10,
            "spark",
            200
        ));

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        // Remove from array
        const idx = enemies.indexOf(this);
        if (idx > -1) enemies.splice(idx, 1);

        // Stats
        score += this.xp * 10;
        killCount++;

        // Drop XP orb
        xpOrbs.push(new XPOrb(this.x, this.y, this.xp));

        // Death particles
        for (let i = 0; i < 8; i++) {
            particles.push(new Particle(
                this.x,
                this.y,
                this.color,
                15,
                "burst",
                400
            ));
        }

        // Boss special death
        if (this.isBoss) {
            for (let i = 0; i < 20; i++) {
                particles.push(new Particle(
                    this.x + (Math.random() - 0.5) * 100,
                    this.y + (Math.random() - 0.5) * 100,
                    "#FFD700",
                    25,
                    "burst",
                    600
                ));
            }
        }
    }

    draw() {
        ctx.save();

        const wobble = Math.sin(this.animFrame * Math.PI) * 3;

        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + this.size / 2, this.size / 2, this.size / 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hit flash
        if (this.hitFlash > 0) {
            ctx.globalAlpha = 0.7 + Math.sin(this.hitFlash * 0.1) * 0.3;
        }

        // Body
        const gradient = ctx.createRadialGradient(
            this.x - this.size / 4, this.y - this.size / 4 + wobble, this.size / 6,
            this.x, this.y + wobble, this.size / 2
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, this.darkenColor(this.color, 40));

        ctx.beginPath();
        ctx.arc(this.x, this.y + wobble, this.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Boss outline
        if (this.isBoss) {
            ctx.strokeStyle = "#FFD700";
            ctx.lineWidth = 4;
            ctx.stroke();

            // Health bar for boss
            const barWidth = this.size * 1.5;
            const barHeight = 8;
            const barX = this.x - barWidth / 2;
            const barY = this.y - this.size / 2 - 20;

            ctx.fillStyle = "#333";
            ctx.fillRect(barX, barY, barWidth, barHeight);

            ctx.fillStyle = "#FF4444";
            ctx.fillRect(barX, barY, barWidth * (this.health / this.maxHealth), barHeight);

            ctx.strokeStyle = "#FFD700";
            ctx.lineWidth = 2;
            ctx.strokeRect(barX, barY, barWidth, barHeight);
        }

        // Emoji face
        ctx.font = `${this.size * 0.6}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.emoji, this.x, this.y + wobble);

        ctx.restore();
    }

    darkenColor(hex, amount) {
        const num = parseInt(hex.slice(1), 16);
        const r = Math.max(0, (num >> 16) - amount);
        const g = Math.max(0, ((num >> 8) & 0x00FF) - amount);
        const b = Math.max(0, (num & 0x0000FF) - amount);
        return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
    }
}

// ============================================
// Projectile Class
// ============================================
class Projectile {
    constructor(x, y, vx, vy, damage, pierce, aoe, emoji) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.pierce = pierce;
        this.aoe = aoe;
        this.emoji = emoji;
        this.size = 20;
        this.hitEnemies = new Set();
        this.age = 0;
    }

    update(dt) {
        this.x += this.vx;
        this.y += this.vy;
        this.age += dt;

        // Trail particle
        if (Math.random() < 0.3) {
            particles.push(new Particle(
                this.x + (Math.random() - 0.5) * 10,
                this.y + (Math.random() - 0.5) * 10,
                "#FFD700",
                8,
                "trail",
                200
            ));
        }

        // Hit detection
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (this.hitEnemies.has(enemy)) continue;

            const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (dist < (enemy.size + this.size) / 2) {
                enemy.takeDamage(this.damage);
                this.hitEnemies.add(enemy);

                // AoE explosion
                if (this.aoe > 0) {
                    this.explode();
                    this.pierce = 0;
                }

                this.pierce--;
                if (this.pierce < 0) {
                    return true; // Remove projectile
                }
            }
        }

        // Off-screen check
        return this.x < -50 || this.x > canvas.width + 50 ||
            this.y < -50 || this.y > canvas.height + 50 ||
            this.age > 3000;
    }

    explode() {
        // Damage all enemies in range
        enemies.forEach(enemy => {
            const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (dist < this.aoe && !this.hitEnemies.has(enemy)) {
                enemy.takeDamage(this.damage * 0.5);
            }
        });

        // Explosion particles
        for (let i = 0; i < 12; i++) {
            particles.push(new Particle(
                this.x,
                this.y,
                "#FF6600",
                25,
                "burst",
                400
            ));
        }
        particles.push(new Particle(this.x, this.y, "#FFFF00", this.aoe, "ring", 300));
    }

    draw() {
        ctx.save();

        // Glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#FFD700";

        // Bullet shape or emoji
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.emoji, this.x, this.y);

        ctx.restore();
    }
}

// ============================================
// Orbital Projectile
// ============================================
class OrbitalProjectile {
    constructor(player, damage, radius, angle, weaponId, emoji) {
        this.player = player;
        this.damage = damage;
        this.radius = radius;
        this.angle = angle;
        this.weaponId = weaponId;
        this.emoji = emoji;
        this.size = 25;
        this.orbital = true;
        this.rotationSpeed = 0.05;
        this.x = 0;
        this.y = 0;
    }

    update(dt) {
        this.angle += this.rotationSpeed;
        this.x = this.player.x + Math.cos(this.angle) * this.radius;
        this.y = this.player.y + Math.sin(this.angle) * this.radius;

        // Hit detection
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (dist < (enemy.size + this.size) / 2) {
                enemy.takeDamage(this.damage);
            }
        }

        return false; // Never remove orbital
    }

    draw() {
        ctx.save();

        // Trail
        ctx.strokeStyle = "rgba(0, 200, 255, 0.3)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(this.player.x, this.player.y, this.radius, this.angle - 0.5, this.angle);
        ctx.stroke();

        // Orbital
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#00DDFF";

        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.emoji, this.x, this.y);

        ctx.restore();
    }
}

// ============================================
// XP Orb
// ============================================
class XPOrb {
    constructor(x, y, value) {
        this.x = x;
        this.y = y;
        this.value = value;
        this.size = 8 + Math.min(value, 10);
        this.bobOffset = Math.random() * Math.PI * 2;
    }

    draw() {
        const bob = Math.sin(performance.now() * 0.005 + this.bobOffset) * 3;

        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#00DDFF";

        const gradient = ctx.createRadialGradient(
            this.x, this.y + bob, 0,
            this.x, this.y + bob, this.size
        );
        gradient.addColorStop(0, "#FFFFFF");
        gradient.addColorStop(0.3, "#00DDFF");
        gradient.addColorStop(1, "#0066AA");

        ctx.beginPath();
        ctx.arc(this.x, this.y + bob, this.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.restore();
    }
}

// ============================================
// Ground Effect (Fire, Water zones)
// ============================================
class GroundEffect {
    constructor(x, y, damage, range, duration, type) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.range = range;
        this.duration = duration;
        this.maxDuration = duration;
        this.type = type;
        this.lastDamage = 0;
        this.damageInterval = type === "fire" ? 200 : 500;
    }

    update(dt) {
        this.duration -= dt;

        const now = performance.now();
        if (now - this.lastDamage > this.damageInterval) {
            this.lastDamage = now;
            enemies.forEach(e => {
                const dist = Math.hypot(e.x - this.x, e.y - this.y);
                if (dist < this.range) {
                    e.takeDamage(this.damage);
                }
            });
        }

        return this.duration <= 0;
    }

    draw() {
        const alpha = Math.min(1, this.duration / this.maxDuration + 0.3);
        ctx.save();
        ctx.globalAlpha = alpha * 0.6;

        const color = this.type === "fire" ? "#FF4400" : "#4488FF";
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.range);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.restore();
    }
}

// ============================================
// Particle System
// ============================================
class Particle {
    constructor(x, y, color, size, type, lifetime) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.maxSize = size;
        this.type = type;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;

        // Velocity for burst particles
        if (type === "burst" || type === "spark") {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        } else {
            this.vx = 0;
            this.vy = 0;
        }
    }

    update(dt) {
        this.lifetime -= dt;
        this.x += this.vx;
        this.y += this.vy;

        // Slow down
        this.vx *= 0.95;
        this.vy *= 0.95;

        return this.lifetime <= 0;
    }

    draw() {
        const alpha = Math.max(0, this.lifetime / this.maxLifetime);
        ctx.save();
        ctx.globalAlpha = alpha;

        switch (this.type) {
            case "ring":
            case "wave":
                const radius = this.maxSize * (1 - alpha + 0.2);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 3 * alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
                ctx.stroke();
                break;

            case "flash":
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
                ctx.fill();
                break;

            case "burst":
            case "spark":
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
                ctx.fill();
                break;

            case "trail":
                ctx.fillStyle = this.color;
                ctx.globalAlpha = alpha * 0.5;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
                ctx.fill();
                break;
        }

        ctx.restore();
    }
}

// ============================================
// Damage Numbers
// ============================================
function showDamageNumber(x, y, amount, isCrit) {
    const div = document.createElement('div');
    div.className = 'damage-number';
    div.textContent = Math.floor(amount);
    div.style.left = x + 'px';
    div.style.top = y + 'px';
    div.style.fontSize = isCrit ? '28px' : '18px';
    div.style.color = isCrit ? '#FFFF00' : '#FFFFFF';
    div.style.textShadow = isCrit ? '0 0 10px #FF8800' : '0 0 5px #000';

    document.body.appendChild(div);

    setTimeout(() => div.remove(), CONFIG.DAMAGE_NUMBER_DURATION);
}

// ============================================
// Enemy Spawning
// ============================================
let spawnTimer = 0;
let spawnRate = CONFIG.ENEMY_SPAWN_RATE_INITIAL;
let bossSpawned = {};

function spawnEnemies(dt) {
    spawnTimer += dt;

    // Increase difficulty over time
    if (spawnTimer > spawnRate) {
        spawnTimer = 0;
        spawnRate = Math.max(CONFIG.ENEMY_SPAWN_RATE_MIN, spawnRate * CONFIG.ENEMY_SPAWN_ACCELERATION);

        // Determine spawn position (outside screen)
        const side = Math.floor(Math.random() * 4);
        let x, y;

        switch (side) {
            case 0: // Top
                x = Math.random() * canvas.width;
                y = -50;
                break;
            case 1: // Right
                x = canvas.width + 50;
                y = Math.random() * canvas.height;
                break;
            case 2: // Bottom
                x = Math.random() * canvas.width;
                y = canvas.height + 50;
                break;
            case 3: // Left
                x = -50;
                y = Math.random() * canvas.height;
                break;
        }

        // Choose enemy type based on game time
        const types = getAvailableEnemyTypes();
        const chosenType = types[Math.floor(Math.random() * types.length)];

        enemies.push(new Enemy(chosenType, x, y));
    }

    // Boss spawning at certain intervals
    const minutes = Math.floor(gameTime / 60000);
    if (minutes >= 2 && !bossSpawned[2]) {
        bossSpawned[2] = true;
        spawnBoss('boss_microtransaction');
    }
    if (minutes >= 5 && !bossSpawned[5]) {
        bossSpawned[5] = true;
        spawnBoss('boss_crunch');
    }
}

function getAvailableEnemyTypes() {
    const minutes = gameTime / 60000;
    const types = ['troll'];

    if (minutes >= 0.5) types.push('bug');
    if (minutes >= 1) types.push('clickbait');
    if (minutes >= 2) types.push('hater');

    return types;
}

function spawnBoss(bossType) {
    const side = Math.floor(Math.random() * 4);
    let x, y;

    switch (side) {
        case 0: x = canvas.width / 2; y = -100; break;
        case 1: x = canvas.width + 100; y = canvas.height / 2; break;
        case 2: x = canvas.width / 2; y = canvas.height + 100; break;
        case 3: x = -100; y = canvas.height / 2; break;
    }

    enemies.push(new Enemy(bossType, x, y));

    // Boss warning
    waveNumber++;
}

// ============================================
// Level Up System
// ============================================
function showLevelUpModal() {
    const modal = document.getElementById('levelUpModal');
    const optionsContainer = document.getElementById('upgradeOptions');

    optionsContainer.innerHTML = '';

    // Get 3 random upgrades
    const availableUpgrades = Object.entries(UPGRADES).filter(([key, upg]) => {
        // Filter out weapons player already has (unless can level up)
        if (upg.isWeapon) {
            const hasWeapon = player.weapons.some(w => w.id === upg.weaponId);
            const weaponMaxed = player.weapons.some(w => w.id === upg.weaponId && w.level >= 8);
            return !weaponMaxed;
        }
        return true;
    });

    const shuffled = availableUpgrades.sort(() => Math.random() - 0.5);
    const options = shuffled.slice(0, 3);

    options.forEach(([key, upgrade]) => {
        const card = document.createElement('div');
        card.className = `upgrade-card ${upgrade.rarity === 'legendary' ? 'legendary' : ''}`;
        card.innerHTML = `
            <div class="upgrade-icon">${upgrade.emoji}</div>
            <div class="upgrade-name">${upgrade.name}</div>
            <div class="upgrade-desc">${upgrade.description}</div>
            <div class="upgrade-rarity ${upgrade.rarity}">${upgrade.rarity.toUpperCase()}</div>
        `;

        card.addEventListener('click', () => {
            applyUpgrade(key, upgrade);
            modal.style.display = 'none';
            currentState = GameState.PLAYING;
        });

        optionsContainer.appendChild(card);
    });

    modal.style.display = 'flex';
}

function applyUpgrade(key, upgrade) {
    if (upgrade.isWeapon) {
        player.addWeapon(upgrade.weaponId);
    } else if (upgrade.effect) {
        upgrade.effect(player);
    }

    updateWeaponsHUD();
}

// ============================================
// UI Updates
// ============================================
function updateHUD() {
    // Health
    const healthPercent = (player.health / player.maxHealth) * 100;
    document.getElementById('healthFill').style.width = `${healthPercent}%`;
    document.getElementById('healthText').textContent = `${Math.ceil(player.health)} / ${player.maxHealth}`;

    // XP
    const xpPercent = (player.xp / player.xpToLevel) * 100;
    document.getElementById('xpFill').style.width = `${xpPercent}%`;
    document.getElementById('levelBadge').textContent = player.level;

    // Timer
    const minutes = Math.floor(gameTime / 60000);
    const seconds = Math.floor((gameTime % 60000) / 1000);
    document.getElementById('timer').textContent =
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Score & Kills
    document.getElementById('scoreValue').textContent = score.toLocaleString();
    document.getElementById('killValue').textContent = killCount;

    // Wave
    document.getElementById('waveIndicator').textContent = `WELLE ${waveNumber}`;
}

function updateWeaponsHUD() {
    const container = document.getElementById('weaponsContainer');
    container.innerHTML = '';

    player.weapons.forEach((weapon, i) => {
        const def = WEAPONS[weapon.id];
        const slot = document.createElement('div');
        slot.className = 'weapon-slot' + (i === 0 ? ' active' : '');
        slot.innerHTML = `
            <div class="weapon-icon">${def.emoji}</div>
            <div class="weapon-level">${weapon.level}</div>
        `;
        container.appendChild(slot);
    });
}

// ============================================
// Game Over
// ============================================
function endGame() {
    currentState = GameState.GAME_OVER;

    // Calculate coins earned
    coinsEarned = Math.floor(score / 100) + Math.floor(gameTime / 10000) * 5 + killCount;
    metaProgression.totalCoins += coinsEarned;
    saveMetaProgression();

    document.getElementById('finalTime').textContent = document.getElementById('timer').textContent;
    document.getElementById('finalScore').textContent = score.toLocaleString();
    document.getElementById('finalKills').textContent = killCount;
    document.getElementById('finalCoins').textContent = coinsEarned;
    document.getElementById('totalCoins').textContent = metaProgression.totalCoins;

    document.getElementById('gameOverScreen').style.display = 'flex';
}

// ============================================
// Meta Progression Functions
// ============================================
function loadMetaProgression() {
    const saved = localStorage.getItem('gssurvivors_meta');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            metaProgression = { ...metaProgression, ...data };
        } catch (e) { console.log('No saved data'); }
    }
}

function saveMetaProgression() {
    localStorage.setItem('gssurvivors_meta', JSON.stringify(metaProgression));
}

function purchaseMetaUpgrade(upgradeKey) {
    const upgrade = META_UPGRADES[upgradeKey];
    const currentLevel = metaProgression.upgrades[upgradeKey];

    if (currentLevel >= upgrade.cost.length) return false; // Maxed

    const cost = upgrade.cost[currentLevel];
    if (metaProgression.totalCoins < cost) return false;

    metaProgression.totalCoins -= cost;
    metaProgression.upgrades[upgradeKey]++;
    saveMetaProgression();
    return true;
}

function getMetaBonus(type) {
    const level = metaProgression.upgrades[type] || 0;
    const upgrade = META_UPGRADES[type];
    return level * upgrade.bonus;
}

// ============================================
// Background Drawing
// ============================================
function drawBackground() {
    // Grid pattern for infinite feel
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = 'rgba(0, 100, 150, 0.2)';
    ctx.lineWidth = 1;

    const gridSize = 60;
    const offsetX = (player.worldX % gridSize);
    const offsetY = (player.worldY % gridSize);

    for (let x = -offsetX; x < canvas.width + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = -offsetY; y < canvas.height + gridSize; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Vignette
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.height * 0.3,
        canvas.width / 2, canvas.height / 2, canvas.height * 0.8
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// ============================================
// Main Game Loop
// ============================================
function gameLoop(timestamp) {
    deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    // Cap delta time to prevent large jumps
    if (deltaTime > 100) deltaTime = 100;

    if (currentState === GameState.PLAYING) {
        gameTime += deltaTime;
        frameCount++;

        // Camera shake
        let shakeX = 0, shakeY = 0;
        if (camera.shake > 0) {
            shakeX = (Math.random() - 0.5) * camera.shake;
            shakeY = (Math.random() - 0.5) * camera.shake;
            camera.shake *= 0.9;
            if (camera.shake < 0.5) camera.shake = 0;
        }

        ctx.save();
        ctx.translate(shakeX, shakeY);

        // Draw
        drawBackground();

        // Update entities
        player.update(deltaTime);
        spawnEnemies(deltaTime);

        // Update projectiles
        for (let i = projectiles.length - 1; i >= 0; i--) {
            if (projectiles[i].update(deltaTime)) {
                projectiles.splice(i, 1);
            }
        }

        // Update particles
        for (let i = particles.length - 1; i >= 0; i--) {
            if (particles[i].update(deltaTime)) {
                particles.splice(i, 1);
            }
        }

        // Limit particles
        while (particles.length > CONFIG.PARTICLE_LIMIT) {
            particles.shift();
        }

        // Update ground effects
        for (let i = groundEffects.length - 1; i >= 0; i--) {
            groundEffects[i].x -= (player.worldX - camera.x) / 10;
            groundEffects[i].y -= (player.worldY - camera.y) / 10;
            if (groundEffects[i].update(deltaTime)) {
                groundEffects.splice(i, 1);
            }
        }

        // Update enemies (relative to player movement)
        enemies.forEach(enemy => {
            enemy.x -= (player.worldX - camera.x) / 10;
            enemy.y -= (player.worldY - camera.y) / 10;
            enemy.update(deltaTime);
        });

        // Update XP orbs (relative movement)
        xpOrbs.forEach(orb => {
            orb.x -= (player.worldX - camera.x) / 10;
            orb.y -= (player.worldY - camera.y) / 10;
        });

        camera.x = player.worldX;
        camera.y = player.worldY;

        // Draw order: ground -> XP -> enemies -> projectiles -> player -> particles
        groundEffects.forEach(ge => ge.draw());
        xpOrbs.forEach(orb => orb.draw());
        enemies.forEach(enemy => enemy.draw());
        projectiles.forEach(proj => proj.draw());
        player.draw();
        particles.forEach(p => p.draw());

        ctx.restore();

        // Update HUD
        updateHUD();
    }

    requestAnimationFrame(gameLoop);
}

// ============================================
// Initialization
// ============================================
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Input listeners
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;

        if (e.key === 'Escape' && currentState === GameState.PLAYING) {
            currentState = GameState.PAUSED;
            document.getElementById('pauseOverlay').style.display = 'flex';
        } else if (e.key === 'Escape' && currentState === GameState.PAUSED) {
            currentState = GameState.PLAYING;
            document.getElementById('pauseOverlay').style.display = 'none';
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Character selection
    document.querySelectorAll('.character-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedCharacter = card.dataset.character;
        });
    });

    // Starter weapon selection
    document.querySelectorAll('.weapon-select-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.weapon-select-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedStarterWeapon = card.dataset.weapon;
        });
    });

    // Load meta progression
    loadMetaProgression();
    updateMetaUI();

    // Start button
    document.getElementById('startBtn').addEventListener('click', startGame);

    // Restart button
    document.getElementById('restartBtn').addEventListener('click', () => {
        location.reload();
    });

    // Shop button
    const shopBtn = document.getElementById('shopBtn');
    if (shopBtn) {
        shopBtn.addEventListener('click', () => {
            document.getElementById('shopModal').style.display = 'flex';
            renderShop();
        });
    }

    // Start game loop (will wait for state change)
    requestAnimationFrame(gameLoop);
}

function updateMetaUI() {
    const coinsDisplay = document.getElementById('metaCoinsDisplay');
    if (coinsDisplay) coinsDisplay.textContent = metaProgression.totalCoins;
}

function renderShop() {
    const container = document.getElementById('shopUpgrades');
    if (!container) return;
    container.innerHTML = '';

    Object.entries(META_UPGRADES).forEach(([key, upgrade]) => {
        const level = metaProgression.upgrades[key];
        const maxed = level >= upgrade.cost.length;
        const cost = maxed ? 'MAX' : upgrade.cost[level];
        const canAfford = !maxed && metaProgression.totalCoins >= cost;

        const card = document.createElement('div');
        card.className = `shop-card ${maxed ? 'maxed' : ''} ${canAfford ? 'affordable' : ''}`;
        card.innerHTML = `
            <div class="shop-icon">${upgrade.emoji}</div>
            <div class="shop-name">${upgrade.name}</div>
            <div class="shop-level">Lvl ${level}/${upgrade.cost.length}</div>
            <div class="shop-cost">${maxed ? '✓ MAX' : '🪙 ' + cost}</div>
        `;

        if (canAfford) {
            card.addEventListener('click', () => {
                if (purchaseMetaUpgrade(key)) {
                    renderShop();
                    updateMetaUI();
                }
            });
        }
        container.appendChild(card);
    });
}

function closeShop() {
    document.getElementById('shopModal').style.display = 'none';
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('hud').style.display = 'flex';

    player = new Player(selectedCharacter);

    // Apply meta-progression bonuses
    player.maxHealth += getMetaBonus('maxHealth');
    player.health = player.maxHealth;
    player.damageMultiplier += getMetaBonus('damage');
    player.speed *= (1 + getMetaBonus('speed'));
    player.xpMultiplier = 1 + getMetaBonus('xpGain');

    // Override with selected starter weapon
    if (selectedStarterWeapon && selectedStarterWeapon !== player.weapons[0].id) {
        player.weapons[0] = { id: selectedStarterWeapon, level: 1, lastFire: 0 };
    }

    enemies = [];
    projectiles = [];
    particles = [];
    xpOrbs = [];
    groundEffects = [];

    score = 0;
    killCount = 0;
    coinsEarned = 0;
    gameTime = 0;
    waveNumber = 1;
    spawnRate = CONFIG.ENEMY_SPAWN_RATE_INITIAL;
    bossSpawned = {};

    updateWeaponsHUD();

    currentState = GameState.PLAYING;
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);
