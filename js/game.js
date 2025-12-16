/* ============================================
   GameStar Survivors - Das ultimative Redaktions-Roguelike
   Main Game Engine
   
   Dependencies (loaded before this file):
   - config.js: CONFIG, GameState, CHARACTERS, WEAPONS, ENEMY_TYPES, META_UPGRADES, ACHIEVEMENTS
   - audio.js: audioCtx, initAudio, playSound, playBackgroundMusic
   ============================================ */

// ============================================
// Game Runtime State
// ============================================
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
let lightningBolts = []; // New visual effect for chain lightning
let drops = [];  // Random pickup drops

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
        armor: 0,
        luck: 0,
        magnetRange: 0,
        revival: 0
    },
    unlockedWeapons: ['faktenschleuder', 'wertungsblitz', 'news_nova']
};

// Selected character (CHARACTERS defined in config.js)
let selectedCharacter = 'heiko';

// Input
const keys = {};
const mouse = { x: 0, y: 0 };

// Camera (for infinite map feel)
const camera = { x: 0, y: 0 };

// Sprite Cache
const spriteCache = {};

function loadSprite(path) {
    if (!path) return null;
    if (spriteCache[path]) return spriteCache[path];

    const img = new Image();
    img.src = path;
    spriteCache[path] = img;
    return img;
}

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
        description: "Neue Waffe: AoE-Wellen",
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
    },
    new_kettenblitz: {
        name: "Kettenblitz",
        emoji: "⚡",
        description: "Neue Waffe: Springt zwischen Gegnern",
        rarity: "rare",
        isWeapon: true,
        weaponId: "kettenblitz"
    },
    new_flammenspur: {
        name: "Flammenspur",
        emoji: "🔥",
        description: "Neue Waffe: Brennender Boden",
        rarity: "uncommon",
        isWeapon: true,
        weaponId: "flammenspur"
    },
    new_wasser: {
        name: "Heiliges Wasser",
        emoji: "💧",
        description: "Neue Waffe: Schadenszonen am Boden",
        rarity: "uncommon",
        isWeapon: true,
        weaponId: "heiliges_wasser"
    },
    new_schrotflinte: {
        name: "Schrotflinte",
        emoji: "💨",
        description: "Neue Waffe: Feuert breite Salve",
        rarity: "uncommon",
        isWeapon: true,
        weaponId: "schrotflinte"
    },
    new_fakten: {
        name: "Faktenschleuder",
        emoji: "📰",
        description: "Neue Waffe: Schnelle Projektile",
        rarity: "common",
        isWeapon: true,
        weaponId: "faktenschleuder"
    },
    new_nova: {
        name: "News-Nova",
        emoji: "💥",
        description: "Neue Waffe: Explosive Projektile",
        rarity: "rare",
        isWeapon: true,
        weaponId: "news_nova"
    },
    new_wertung: {
        name: "Wertungsblitz",
        emoji: "⚡",
        description: "Neue Waffe: Hochschaden-Laser",
        rarity: "uncommon",
        isWeapon: true,
        weaponId: "wertungsblitz"
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
        // Use direct properties (not nested stats) from config.js
        this.speed = char.speed || CONFIG.PLAYER_BASE_SPEED;
        this.maxHealth = char.health || CONFIG.PLAYER_BASE_HEALTH;
        this.health = this.maxHealth;

        // Stats
        this.damageMultiplier = char.power || 1.0;
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
        this.xpMultiplier = 1.0;

        // Weapons - use startingWeapon from config.js
        this.weapons = [{
            id: char.startingWeapon || 'faktenschleuder',
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
        this.sprite = char.sprite;
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
            case "laser":
                this.fireLaser(weapon, def);
                break;
            case "hammer":
                this.fireHammer(weapon, def);
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

        // Aura visual - Steam swirls
        particles.push(new Particle(this.x, this.y, "#884400", range, "ring", 200));

        // Spawn steam particles
        for (let i = 0; i < 3; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * range * 0.8;
            const px = this.x + Math.cos(angle) * r;
            const py = this.y + Math.sin(angle) * r;
            particles.push(new Particle(px, py, "rgba(255,255,255,0.4)", 8 + Math.random() * 8, "spark", 600));
        }
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
            lightningBolts.push(new LightningBolt(prevX, prevY, currentTarget.x, currentTarget.y, "#00FFFF", 4, 150));
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

    fireLaser(weapon, def) {
        // Initialize laser angle if not set
        if (weapon.laserAngle === undefined) {
            weapon.laserAngle = 0;
        }

        // Sweep the laser
        weapon.laserAngle += def.sweepSpeed * 0.016; // ~60fps delta approximation
        if (weapon.laserAngle > Math.PI * 2) weapon.laserAngle -= Math.PI * 2;

        const damage = def.baseDamage * this.damageMultiplier * (1 + (weapon.level - 1) * 0.2);
        const range = def.range * (1 + (weapon.level - 1) * 0.15);
        const beamWidth = 15 + weapon.level * 3;

        // Calculate beam end point
        const endX = this.x + Math.cos(weapon.laserAngle) * range;
        const endY = this.y + Math.sin(weapon.laserAngle) * range;

        // Check enemies in beam path
        enemies.forEach(enemy => {
            // Point-to-line distance check
            const dist = this.pointToLineDistance(
                enemy.x, enemy.y,
                this.x, this.y,
                endX, endY
            );

            if (dist < beamWidth + enemy.size / 2) {
                // Also check if enemy is within range
                const enemyDist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
                if (enemyDist < range) {
                    enemy.takeDamage(damage);
                }
            }
        });

        // Store for rendering
        weapon.laserEndX = endX;
        weapon.laserEndY = endY;
        weapon.laserActive = true;
    }

    fireHammer(weapon, def) {
        // Find closest enemy in range
        let closest = null;
        let minDist = Infinity;

        enemies.forEach(enemy => {
            const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (dist < def.range && dist < minDist) {
                minDist = dist;
                closest = enemy;
            }
        });

        if (!closest) return;

        const damage = def.baseDamage * this.damageMultiplier * (1 + (weapon.level - 1) * 0.25);
        const aoeRadius = (def.aoeRadius || 60) * (1 + (weapon.level - 1) * 0.1);

        // Slam effect at target location
        const slamX = closest.x;
        const slamY = closest.y;

        // Damage and stun enemies in AOE
        enemies.forEach(enemy => {
            const dist = Math.hypot(enemy.x - slamX, enemy.y - slamY);
            if (dist < aoeRadius) {
                enemy.takeDamage(damage);
                // Stun effect
                enemy.stunned = true;
                enemy.stunTimer = def.stunDuration || 500;
            }
        });

        // Hammer slam visual
        particles.push(new Particle(slamX, slamY, "#FF6600", aoeRadius, "slam", 400));
        particles.push(new Particle(slamX, slamY, "#FFD700", 30, "burst", 300));

        // Store for HUD line rendering
        weapon.lastSlamX = slamX;
        weapon.lastSlamY = slamY;
        weapon.lastSlamTime = performance.now();

        playSound('explosion');
    }

    // Helper for laser collision
    pointToLineDistance(px, py, x1, y1, x2, y2) {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) param = dot / lenSq;

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        return Math.hypot(px - xx, py - yy);
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
                    playSound('xp');

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
        playSound('levelup');
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

        // Play damage sound
        playSound('damage');

        // Screen shake
        camera.shake = 10;

        // Damage particle
        particles.push(new Particle(this.x, this.y, "#FF0000", 40, "ring", 200));

        if (this.health <= 0) {
            playSound('death');
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

        // Draw character sprite or fallback
        const spriteImg = loadSprite(this.sprite);
        if (spriteImg && spriteImg.complete && spriteImg.naturalWidth > 0) {
            ctx.save();
            // Flip sprite based on facing direction
            if (!this.facingRight) {
                ctx.scale(-1, 1);
                ctx.drawImage(spriteImg, -this.x - this.size / 2, this.y - this.size / 2 + bobY, this.size, this.size);
            } else {
                ctx.drawImage(spriteImg, this.x - this.size / 2, this.y - this.size / 2 + bobY, this.size, this.size);
            }
            ctx.restore();
        } else {
            // Fallback to circle + emoji
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

            ctx.font = `${this.size * 0.6}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(this.emoji, this.x, this.y + bobY);
        }

        // Draw laser beams for laser weapons
        this.weapons.forEach(weapon => {
            const def = WEAPONS[weapon.id];
            if (def.type === 'laser' && weapon.laserActive) {
                ctx.save();
                ctx.strokeStyle = '#00FFFF';
                ctx.lineWidth = 8 + weapon.level * 2;
                ctx.lineCap = 'round';
                ctx.shadowColor = '#00FFFF';
                ctx.shadowBlur = 20;
                ctx.globalAlpha = 0.8;

                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(weapon.laserEndX, weapon.laserEndY);
                ctx.stroke();

                // Core beam (brighter)
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 3 + weapon.level;
                ctx.shadowBlur = 10;
                ctx.globalAlpha = 1;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(weapon.laserEndX, weapon.laserEndY);
                ctx.stroke();

                ctx.restore();
            }
        });

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
        this.sprite = def.sprite;  // Load sprite path from config
        this.xp = def.xp;
        this.isBoss = def.isBoss || false;

        // Animation
        this.animFrame = 0;
        this.animTimer = 0;
        this.hitFlash = 0;
    }

    update(dt) {
        // Handle stun effect
        if (this.stunned) {
            this.stunTimer -= dt;
            if (this.stunTimer <= 0) {
                this.stunned = false;
            }
            // Don't move while stunned
            this.animTimer += dt;
            if (this.hitFlash > 0) this.hitFlash -= dt;
            return;
        }

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
        playSound('hit');

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

        // Try to spawn random drop
        trySpawnDrop(this.x, this.y);

        // Death sound (only play for bosses to avoid sound spam)
        if (this.isBoss) playSound('explosion');

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

        // Stun visual indicator
        if (this.stunned) {
            ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size / 2 + 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw enemy sprite or fallback
        const spriteImg = loadSprite(this.sprite);
        if (spriteImg && spriteImg.complete && spriteImg.naturalWidth > 0) {
            ctx.drawImage(spriteImg, this.x - this.size / 2, this.y - this.size / 2 + wobble, this.size, this.size);
        } else {
            // Fallback to gradient circle + emoji
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

            ctx.font = `${this.size * 0.6}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(this.emoji, this.x, this.y + wobble);
        }

        // Boss outline
        if (this.isBoss) {
            ctx.strokeStyle = "#FFD700";
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(this.x, this.y + wobble, this.size / 2, 0, Math.PI * 2);
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

// Emoji Cache for performance (Fixes text rendering lag)
const emojiCache = {};

function getCachedEmoji(emoji, size) {
    const key = emoji + size;
    if (emojiCache[key]) return emojiCache[key];

    try {
        const c = document.createElement('canvas');
        c.width = Math.ceil(size * 1.5);
        c.height = Math.ceil(size * 1.5);
        const cx = c.getContext('2d');
        cx.font = `${size}px Arial`;
        cx.textAlign = 'center';
        cx.textBaseline = 'middle';
        cx.fillText(emoji, c.width / 2, c.height / 2);

        emojiCache[key] = c;
        return c;
    } catch (e) {
        console.error("Failed to cache emoji", e);
        return null; // Fallback
    }
}

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

        // Visuals
        this.rotation = 0;
        this.spinSpeed = 0;

        // Custom behavior based on emoji/type
        if (emoji === "✏️") { // Rotstift
            this.spinSpeed = 0.2;
            this.trailColor = "#FF0000";
        } else if (emoji === "🗞️") { // Druckerpresse
            this.spinSpeed = 0.1;
            this.trailColor = "#FFFFFF";
        } else if (emoji === "💨") { // Schrotflinte
            this.trailColor = "#AAAAAA";
        } else {
            this.trailColor = "#FFD700";
        }
    }

    update(dt) {
        this.x += this.vx;
        this.y += this.vy;
        this.age += dt;
        this.rotation += this.spinSpeed;

        // Trail particle
        // Optimization: Reduce spawn rate to prevent lag with many projectiles
        let spawnChance = 0.05;
        if (this.emoji === "✏️") spawnChance = 0.1; // More trails for Rotstift (single projectile)

        if (Math.random() < spawnChance) {
            particles.push(new Particle(
                this.x + (Math.random() - 0.5) * 10,
                this.y + (Math.random() - 0.5) * 10,
                this.trailColor,
                8,
                "trail",
                200
            ));
        }

        // Hit detection
        // Optimization: Use squared distance to avoid Math.sqrt
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (this.hitEnemies.has(enemy)) continue;

            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distSq = dx * dx + dy * dy;
            const radiusSum = (enemy.size + this.size) / 2;

            if (distSq < radiusSum * radiusSum) {
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
        const count = 16;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            const px = this.x;
            const py = this.y;
            // Manually creating particles with velocity would require updating Particle class or just let "burst" handle it randomly
            // Let's use standard burst but more of them
            particles.push(new Particle(this.x, this.y, i % 2 === 0 ? "#FF4400" : "#FFFF00", 25, "burst", 400));
        }
        // Shockwave
        particles.push(new Particle(this.x, this.y, "#FF8800", this.aoe, "wave", 400));
        particles.push(new Particle(this.x, this.y, "#FFFFFF", this.aoe * 0.5, "ring", 200));
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation + Math.atan2(this.vy, this.vx) + Math.PI / 2);

        // Glow
        if (CONFIG.ENABLE_BLOOM) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.trailColor;
        }

        // Draw cached image instead of text
        if (typeof getCachedEmoji === 'function') {
            const img = getCachedEmoji(this.emoji, this.size);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);
        } else {
            // Fallback
            ctx.font = `${this.size}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(this.emoji, 0, 0);
        }

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
        this.size = 6 + Math.min(value, 8);
        this.spawnTime = performance.now();
    }

    isExpired() {
        return performance.now() - this.spawnTime > CONFIG.XP_ORB_LIFETIME;
    }

    draw() {
        // Simplified draw for performance
        ctx.fillStyle = this.value > 5 ? "#00FFFF" : "#00AADD";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ============================================
// Drop Class (Random Pickups)
// ============================================
class Drop {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.data = DROP_TYPES[type];
        this.size = 20;
        this.spawnTime = performance.now();
        this.lifetime = 15000; // Despawn after 15 seconds
        this.bobOffset = Math.random() * Math.PI * 2;
    }

    isExpired() {
        return performance.now() - this.spawnTime > this.lifetime;
    }

    collect() {
        // Apply effect based on type
        switch (this.type) {
            case 'xp_magnet':
                // Pull all XP orbs to player instantly
                xpOrbs.forEach(orb => {
                    player.xp += orb.value * player.xpMultiplier;
                });
                xpOrbs.length = 0;
                playSound('levelup');
                break;
            case 'health_pack':
                player.health = Math.min(player.health + 25, player.maxHealth);
                playSound('xp');
                break;
            case 'speed_boost':
                player.speedBoostTimer = this.data.duration;
                player.speedBoostMultiplier = 1.5;
                break;
            case 'damage_boost':
                player.damageBoostTimer = this.data.duration;
                player.damageBoostMultiplier = 1.5;
                break;
            case 'shield':
                player.shieldActive = true;
                player.shieldTimer = this.data.duration;
                break;
            case 'coin_rain':
                coinsEarned += 10;
                playSound('xp');
                break;
        }

        // Show notification
        showDropNotification(this.data.emoji, this.data.name);
    }

    draw() {
        const bobY = Math.sin((performance.now() / 200) + this.bobOffset) * 3;
        const pulse = 1 + Math.sin(performance.now() / 150) * 0.1;

        // Glow effect
        ctx.save();
        ctx.shadowColor = this.data.color;
        ctx.shadowBlur = 15;

        // Draw circle background
        ctx.fillStyle = this.data.color + '44';
        ctx.beginPath();
        ctx.arc(this.x, this.y + bobY, this.size * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Draw emoji
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.data.emoji, this.x, this.y + bobY);

        ctx.restore();
    }
}

function showDropNotification(emoji, name) {
    // Create temporary notification
    const notif = document.createElement('div');
    notif.className = 'drop-notification';
    notif.innerHTML = `<span class="drop-emoji">${emoji}</span><span class="drop-text">${name}!</span>`;
    document.body.appendChild(notif);

    setTimeout(() => notif.remove(), 2000);
}

function trySpawnDrop(x, y) {
    // Calculate total luck bonus
    const luckBonus = 1 + getMetaBonus('luck');

    for (const [type, drop] of Object.entries(DROP_TYPES)) {
        if (Math.random() < drop.rarity * luckBonus) {
            drops.push(new Drop(x, y, type));
            return; // Only spawn one drop per enemy
        }
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
        const alpha = Math.min(1, this.duration / this.maxDuration + 0.3) * 0.6;
        ctx.save();
        ctx.globalAlpha = alpha;

        const color = this.type === "fire" ? "#FF4400" : "#4488FF";

        // Spawn effect particles
        if (Math.random() < 0.1) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * this.range * 0.8;
            const px = this.x + Math.cos(angle) * r;
            const py = this.y + Math.sin(angle) * r;

            if (this.type === "fire") {
                particles.push(new Particle(px, py, "#FFCC00", 6, "spark", 300));
            } else {
                particles.push(new Particle(px, py, "#88FFFF", 10, "spark", 800)); // Bubbles
            }
        }

        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.range);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "transparent");

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Inner texture
        ctx.strokeStyle = '#FFFFFF';
        ctx.globalAlpha = alpha * 0.3;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range * 0.7 + Math.sin(performance.now() / 200) * 5, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }
}

// ============================================
// Lightning Visual Effect
// ============================================
class LightningBolt {
    constructor(x1, y1, x2, y2, color, thickness, duration) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.color = color || "#00FFFF";
        this.thickness = thickness || 3;
        this.lifetime = duration || 200;
        this.maxLifetime = this.lifetime;

        // Generate jagged path
        this.segments = [];
        this.generateSegments();
    }

    generateSegments() {
        const dist = Math.hypot(this.x2 - this.x1, this.y2 - this.y1);
        const steps = Math.max(3, Math.floor(dist / 30)); // Segment every ~30px

        let prevX = this.x1;
        let prevY = this.y1;

        for (let i = 1; i < steps; i++) {
            const t = i / steps;
            const seed = (Math.random() - 0.5) * 50; // Jaggedness
            // Normal vector for offset (approximate)
            // Or just random xy offset
            const x = this.x1 + (this.x2 - this.x1) * t + (Math.random() - 0.5) * 30;
            const y = this.y1 + (this.y2 - this.y1) * t + (Math.random() - 0.5) * 30;

            this.segments.push({ x1: prevX, y1: prevY, x2: x, y2: y });
            prevX = x;
            prevY = y;
        }
        // Last segment to target
        this.segments.push({ x1: prevX, y1: prevY, x2: this.x2, y2: this.y2 });
    }

    update(dt) {
        this.lifetime -= dt;
        return this.lifetime <= 0;
    }

    draw() {
        const alpha = this.lifetime / this.maxLifetime;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = alpha;

        // Glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.thickness + 2;

        ctx.beginPath();
        for (const seg of this.segments) {
            ctx.moveTo(seg.x1, seg.y1);
            ctx.lineTo(seg.x2, seg.y2);
        }
        ctx.stroke();

        // White core for intensity
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = this.thickness / 2;
        ctx.shadowBlur = 0;
        ctx.stroke();

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
                const radius = this.maxSize * (1 - alpha + 0.2);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 3 * alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
                ctx.stroke();
                break;

            case "wave":
                // Multiple concentric rings for sound wave
                const progress = 1 - alpha;
                for (let i = 0; i < 3; i++) {
                    const waveR = this.maxSize * (progress + i * 0.2);
                    if (waveR > this.maxSize) continue;

                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 4 * alpha * (1 - i * 0.1);
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, waveR, 0, Math.PI * 2);
                    ctx.stroke();
                }
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

            case "slam":
                // Hammer slam shockwave effect
                const slamRadius = this.maxSize * (1 - alpha * 0.5);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 5 * alpha;
                ctx.shadowColor = this.color;
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(this.x, this.y, slamRadius, 0, Math.PI * 2);
                ctx.stroke();
                // Inner ring
                ctx.strokeStyle = '#FFFF00';
                ctx.lineWidth = 2 * alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, slamRadius * 0.5, 0, Math.PI * 2);
                ctx.stroke();
                break;
        }

        ctx.restore();
    }
}

// ============================================
// Damage Numbers
// ============================================
// ============================================
// Damage Numbers (Canvas based for performance)
// ============================================
class DamageNumber {
    constructor(x, y, amount, isCrit) {
        this.x = x;
        this.y = y;
        this.amount = Math.floor(amount);
        this.isCrit = isCrit;
        this.lifetime = 800; // ms
        this.maxLifetime = 800;
        this.vy = -1; // Float up speed
        this.alpha = 1;
    }

    update(dt) {
        this.lifetime -= dt;
        this.y += this.vy * (dt / 16); // Move up
        this.alpha = this.lifetime / this.maxLifetime;
        return this.lifetime <= 0;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.isCrit ? '#FFFF00' : '#FFFFFF';
        ctx.font = this.isCrit ? 'bold 24px Orbitron' : '16px Orbitron';
        ctx.textAlign = 'center';

        // Shadow/Outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(this.amount, this.x, this.y);
        ctx.fillText(this.amount, this.x, this.y);

        ctx.restore();
    }
}

function showDamageNumber(x, y, amount, isCrit) {
    if (CONFIG.ENABLE_DAMAGE_NUMBERS) {
        damageNumbers.push(new DamageNumber(x, y, amount, isCrit));
    }
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

        // Only spawn if under limit
        if (enemies.length < CONFIG.MAX_ENEMIES) {
            enemies.push(new Enemy(chosenType, x, y));
        }
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
        // Filter out weapons player already has at max level
        if (upg.isWeapon) {
            const existingWeapon = player.weapons.find(w => w.id === upg.weaponId);
            const weaponDef = WEAPONS[upg.weaponId];
            const maxLevel = weaponDef?.maxLevel || 5;
            if (existingWeapon && existingWeapon.level >= maxLevel) {
                return false; // Skip maxed weapons
            }
        }
        return true;
    });

    const shuffled = availableUpgrades.sort(() => Math.random() - 0.5);
    const options = shuffled.slice(0, 3);

    options.forEach(([key, upgrade]) => {
        const card = document.createElement('div');
        card.className = `upgrade-card ${upgrade.rarity === 'legendary' ? 'legendary' : ''}`;

        let displayDesc = upgrade.description;
        let levelInfo = '';

        // If weapon upgrade, show current level and next upgrade info
        if (upgrade.isWeapon) {
            const existingWeapon = player.weapons.find(w => w.id === upgrade.weaponId);
            const weaponDef = WEAPONS[upgrade.weaponId];

            if (existingWeapon && weaponDef?.levelUpgrades) {
                const currentLevel = existingWeapon.level;
                const nextUpgrade = weaponDef.levelUpgrades[currentLevel - 1];
                levelInfo = `<div class="weapon-level">Lvl ${currentLevel} → ${currentLevel + 1}</div>`;
                if (nextUpgrade) {
                    displayDesc = nextUpgrade.desc;
                }
            } else {
                levelInfo = '<div class="weapon-level">NEU!</div>';
            }
        }

        card.innerHTML = `
            <div class="upgrade-icon">${upgrade.emoji}</div>
            <div class="upgrade-name">${upgrade.name}</div>
            ${levelInfo}
            <div class="upgrade-desc">${displayDesc}</div>
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
    // Calmer, darker background
    ctx.fillStyle = '#11111a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle Dot Pattern instead of hurting lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    const gridSize = 100;

    // Calculate offset to simulate movement
    // Handle wrap-around for infinite scroll effect
    const offsetX = player.worldX % gridSize;
    const offsetY = player.worldY % gridSize;

    // Draw dots
    for (let x = -offsetX; x < canvas.width + gridSize; x += gridSize) {
        for (let y = -offsetY; y < canvas.height + gridSize; y += gridSize) {
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Vignette (Keep for focus)
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.height * 0.4,
        canvas.width / 2, canvas.height / 2, canvas.height * 0.9
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
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
        if (CONFIG.ENABLE_SCREEN_SHAKE && camera.shake > 0) {
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
        if (CONFIG.ENABLE_PARTICLES) {
            for (let i = particles.length - 1; i >= 0; i--) {
                if (particles[i].update(deltaTime)) {
                    particles.splice(i, 1);
                }
            }
            // Limit particles
            while (particles.length > CONFIG.PARTICLE_LIMIT) {
                particles.shift();
            }
        } else {
            particles.length = 0;
        }

        // Update lightning bolts
        for (let i = lightningBolts.length - 1; i >= 0; i--) {
            // Apply camera movement
            lightningBolts[i].x1 -= (player.worldX - camera.x) / 10;
            lightningBolts[i].y1 -= (player.worldY - camera.y) / 10;
            lightningBolts[i].x2 -= (player.worldX - camera.x) / 10;
            lightningBolts[i].y2 -= (player.worldY - camera.y) / 10;

            // Re-generate segments if needed or just shift them?
            // Shifting segments is expensive. Better to just shift start/end and re-gen segments 
            // OR make segments relative. 
            // For now, simple shift of all segments
            lightningBolts[i].segments.forEach(seg => {
                seg.x1 -= (player.worldX - camera.x) / 10;
                seg.y1 -= (player.worldY - camera.y) / 10;
                seg.x2 -= (player.worldX - camera.x) / 10;
                seg.y2 -= (player.worldY - camera.y) / 10;
            });

            if (lightningBolts[i].update(deltaTime)) {
                lightningBolts.splice(i, 1);
            }
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

        // Update drops (relative movement - keep in world space)
        drops.forEach(drop => {
            drop.x -= (player.worldX - camera.x) / 10;
            drop.y -= (player.worldY - camera.y) / 10;
        });

        // Update damage numbers
        for (let i = damageNumbers.length - 1; i >= 0; i--) {
            damageNumbers[i].x -= (player.worldX - camera.x) / 10;
            damageNumbers[i].y -= (player.worldY - camera.y) / 10;
            if (damageNumbers[i].update(deltaTime)) {
                damageNumbers.splice(i, 1);
            }
        }

        // === GARBAGE COLLECTION (Performance Fix) ===

        // Remove expired XP orbs
        for (let i = xpOrbs.length - 1; i >= 0; i--) {
            if (xpOrbs[i].isExpired()) {
                xpOrbs.splice(i, 1);
            }
        }

        // Merge nearby XP orbs if too many
        if (xpOrbs.length > CONFIG.MAX_XP_ORBS) {
            // Sort by position to find nearby orbs
            for (let i = xpOrbs.length - 1; i >= 0 && xpOrbs.length > CONFIG.MAX_XP_ORBS / 2; i--) {
                const orb = xpOrbs[i];
                // Find nearby orb to merge with
                for (let j = i - 1; j >= 0; j--) {
                    const other = xpOrbs[j];
                    const dist = Math.hypot(orb.x - other.x, orb.y - other.y);
                    if (dist < CONFIG.XP_ORB_MERGE_DISTANCE) {
                        other.value += orb.value;
                        other.size = Math.min(20, 6 + Math.min(other.value, 15));
                        xpOrbs.splice(i, 1);
                        break;
                    }
                }
            }
            // Hard cap: remove oldest if still over limit
            while (xpOrbs.length > CONFIG.MAX_XP_ORBS) {
                xpOrbs.shift();
            }
        }

        // Despawn far enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
            if (dist > CONFIG.ENEMY_DESPAWN_DISTANCE && !enemy.isBoss) {
                enemies.splice(i, 1);
            }
        }

        // Limit ground effects
        while (groundEffects.length > CONFIG.MAX_GROUND_EFFECTS) {
            groundEffects.shift();
        }

        // === END GARBAGE COLLECTION ===

        camera.x = player.worldX;
        camera.y = player.worldY;

        // Draw order: ground -> XP -> drops -> enemies -> projectiles -> player -> particles
        groundEffects.forEach(ge => ge.draw());
        xpOrbs.forEach(orb => orb.draw());

        // Update and draw drops
        for (let i = drops.length - 1; i >= 0; i--) {
            const drop = drops[i];

            // Check collection
            const dist = Math.hypot(drop.x - player.x, drop.y - player.y);
            if (dist < player.pickupRange) {
                drop.collect();
                drops.splice(i, 1);
                continue;
            }

            // Check expiration
            if (drop.isExpired()) {
                drops.splice(i, 1);
                continue;
            }

            drop.draw();
        }

        enemies.forEach(enemy => enemy.draw());
        projectiles.forEach(proj => proj.draw());
        player.draw();
        particles.forEach(p => p.draw());
        lightningBolts.forEach(bolt => bolt.draw());
        damageNumbers.forEach(dn => dn.draw()); // Draw damage numbers on top

        ctx.restore();

        // Update HUD
        updateHUD();
    }

    requestAnimationFrame(gameLoop);
}

// ============================================
// Options / Pause
// ============================================
function toggleOptions(show) {
    const modal = document.getElementById('optionsModal');
    if (show) {
        currentState = GameState.PAUSED;
        modal.classList.remove('hidden');
    } else {
        currentState = GameState.PLAYING;
        modal.classList.add('hidden');
        lastTime = performance.now(); // Reset time to avoid jump
    }
}

// ============================================
// Initialization
// ============================================
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Init audio on first click (browser requirement)
    document.addEventListener('click', () => {
        if (!audioCtx) initAudio();
    }, { once: true });

    // Input listeners
    // Input listeners
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;

        if (e.key === 'Escape') {
            if (currentState === GameState.PLAYING) {
                toggleOptions(true);
            } else if (currentState === GameState.PAUSED) {
                toggleOptions(false);
            }
        }
    });

    // Options UI Handlers
    document.getElementById('resumeBtn').addEventListener('click', () => toggleOptions(false));

    document.getElementById('quitRunBtn').addEventListener('click', () => {
        toggleOptions(false);
        currentState = GameState.GAME_OVER; // Or START
        // Simple reload for now to ensure clean state, or resetGame()
        location.reload();
    });

    // Toggles
    const setupToggle = (id, configKey) => {
        const btn = document.getElementById(id);
        btn.textContent = CONFIG[configKey] ? "AN" : "AUS";
        btn.className = `toggle-btn ${CONFIG[configKey] ? 'active' : ''}`;

        btn.addEventListener('click', () => {
            CONFIG[configKey] = !CONFIG[configKey];
            btn.textContent = CONFIG[configKey] ? "AN" : "AUS";
            btn.className = `toggle-btn ${CONFIG[configKey] ? 'active' : ''}`;

            // Special handling for music
            if (configKey === 'MUSIC_ENABLED') {
                if (CONFIG.MUSIC_ENABLED) startBackgroundMusic();
                else stopBackgroundMusic();
            }
        });
    };

    setupToggle('toggleSound', 'SOUND_ENABLED');
    setupToggle('toggleMusic', 'MUSIC_ENABLED');
    setupToggle('toggleShake', 'ENABLE_SCREEN_SHAKE');
    setupToggle('toggleParticles', 'ENABLE_PARTICLES');
    setupToggle('toggleBloom', 'ENABLE_BLOOM');
    setupToggle('toggleDamageNumbers', 'ENABLE_DAMAGE_NUMBERS');

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
            console.log('Selected character:', selectedCharacter);
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

    // Weapons button
    const weaponsBtn = document.getElementById('weaponsBtn');
    if (weaponsBtn) {
        weaponsBtn.addEventListener('click', () => {
            document.getElementById('weaponsModal').style.display = 'flex';
            renderWeapons();
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

    // Update coins display
    const shopCoins = document.getElementById('shopCoinsDisplay');
    if (shopCoins) shopCoins.textContent = metaProgression.totalCoins;

    Object.entries(META_UPGRADES).forEach(([key, upgrade]) => {
        // Initialize upgrade level if not exists
        if (metaProgression.upgrades[key] === undefined) {
            metaProgression.upgrades[key] = 0;
        }

        const level = metaProgression.upgrades[key];
        const maxed = level >= upgrade.cost.length;
        const cost = maxed ? 'MAX' : upgrade.cost[level];
        const canAfford = !maxed && metaProgression.totalCoins >= cost;

        const card = document.createElement('div');
        card.className = `shop-card ${maxed ? 'maxed' : ''} ${canAfford ? 'affordable' : ''}`;
        card.innerHTML = `
            <div class="shop-icon">${upgrade.emoji}</div>
            <div class="shop-name">${upgrade.name}</div>
            <div class="shop-description">${upgrade.description || ''}</div>
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

// Weapons Info Modal
function renderWeapons() {
    const container = document.getElementById('weaponsGrid');
    if (!container) return;
    container.innerHTML = '';

    // Get starter weapons for highlighting
    const starterWeapons = Object.values(CHARACTERS).map(c => c.startingWeapon);

    Object.entries(WEAPONS).forEach(([id, weapon]) => {
        const isStarter = starterWeapons.includes(id);
        const card = document.createElement('div');
        card.className = `weapon-card ${isStarter ? 'starter' : ''}`;

        // Build stats display
        let stats = [];
        if (weapon.baseDamage) stats.push(`⚔️ ${weapon.baseDamage} DMG`);
        if (weapon.fireRate) stats.push(`🕐 ${weapon.fireRate}ms`);
        if (weapon.projectileSpeed) stats.push(`💨 ${weapon.projectileSpeed} Tempo`);
        if (weapon.pierce) stats.push(`🎯 ${weapon.pierce} Pierce`);
        if (weapon.range) stats.push(`📏 ${weapon.range}px`);
        if (weapon.aoe) stats.push(`💥 ${weapon.aoe}px AOE`);
        if (weapon.chainCount) stats.push(`⚡ ${weapon.chainCount} Ketten`);
        if (weapon.projectileCount) stats.push(`💨 ${weapon.projectileCount}x`);
        if (weapon.stunDuration) stats.push(`😵 ${weapon.stunDuration}ms Stun`);
        if (weapon.healAmount) stats.push(`💚 +${weapon.healAmount} HP`);

        card.innerHTML = `
            <div class="weapon-header">
                <div class="weapon-emoji">${weapon.emoji}</div>
                <div class="weapon-name">${weapon.name}${isStarter ? ' ⭐' : ''}</div>
            </div>
            <div class="weapon-desc">${weapon.description}</div>
            <div class="weapon-stats">
                ${stats.map(s => `<span class="weapon-stat">${s}</span>`).join('')}
            </div>
        `;
        container.appendChild(card);
    });
}

function closeWeapons() {
    document.getElementById('weaponsModal').style.display = 'none';
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
    player.pickupRange *= (1 + getMetaBonus('magnetRange'));
    player.armorBonus = getMetaBonus('armor');
    player.hasRevival = metaProgression.upgrades.revival > 0;

    enemies = [];
    projectiles = [];
    particles = [];
    xpOrbs = [];
    groundEffects = [];
    drops = [];

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
