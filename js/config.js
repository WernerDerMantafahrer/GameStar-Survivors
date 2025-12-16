/* ============================================
   GameStar Survivors - Configuration
   ============================================ */

const CONFIG = {
    // Player
    PLAYER_BASE_SPEED: 6,
    PLAYER_BASE_HEALTH: 100,

    // XP & Leveling
    XP_BASE_REQUIREMENT: 20,
    XP_SCALING: 1.7,

    // Enemies - HARDER
    ENEMY_BASE_SPEED: 2.8,
    ENEMY_SPAWN_RATE_INITIAL: 900,
    ENEMY_SPAWN_RATE_MIN: 150,
    ENEMY_SPAWN_ACCELERATION: 0.94,

    // Combat
    INVINCIBILITY_FRAMES: 45,

    // Visual
    PARTICLE_LIMIT: 50,
    DAMAGE_NUMBER_DURATION: 800,
    ENABLE_BLOOM: true,
    ENABLE_PARTICLES: true,
    ENABLE_SCREEN_SHAKE: true,
    ENABLE_DAMAGE_NUMBERS: true,

    // Performance Limits
    MAX_XP_ORBS: 150,
    MAX_ENEMIES: 150,
    MAX_GROUND_EFFECTS: 30,
    XP_ORB_LIFETIME: 30000,
    XP_ORB_MERGE_DISTANCE: 40,
    ENEMY_DESPAWN_DISTANCE: 1200,

    // Audio
    SOUND_ENABLED: true,
    MASTER_VOLUME: 0.3,
    MUSIC_ENABLED: true,
};

// Game States
const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    LEVEL_UP: 'levelUp',
    GAME_OVER: 'gameOver'
};

// Characters - GameStar Redaktion
const CHARACTERS = {
    heiko: {
        name: "Heiko Klinge",
        emoji: "👓",
        sprite: "assets/sprites/char_heiko.png",
        health: 90,
        speed: 12,
        power: 1.1,
        startingWeapon: "rotstift",
        description: "Chefredakteur - Kritischer Blick"
    },
    petra: {
        name: "Petra Schmitz",
        emoji: "📰",
        sprite: "assets/sprites/char_petra.png",
        health: 100,
        speed: 11,
        power: 1.0,
        startingWeapon: "druckerpresse",
        description: "Print-Chefin - Ausbalanciert"
    },
    michael: {
        name: "Michael Graf",
        emoji: "🎙️",
        sprite: "assets/sprites/char_michael.png",
        health: 120,
        speed: 10,
        power: 0.9,
        startingWeapon: "podcast_welle",
        description: "Podcast-Chef - Tank & Support"
    },
    dimi: {
        name: "Dimi Halley",
        emoji: "📋",
        sprite: "assets/sprites/char_dimi.png",
        health: 85,
        speed: 14,
        power: 1.2,
        startingWeapon: "deadline_laser",
        description: "Redaktionsleiter - Schnell & Stark"
    },
    mary: {
        name: "Mary Marx",
        emoji: "💬",
        sprite: "assets/sprites/char_mary.png",
        health: 95,
        speed: 13,
        power: 1.0,
        startingWeapon: "ban_hammer",
        description: "Community-Chefin - Crowd Control"
    }
};

// Enemy Types
const ENEMY_TYPES = {
    troll: {
        name: "Kommentar-Troll",
        emoji: "👹",
        sprite: "assets/sprites/enemy_troll.png",
        health: 25,
        damage: 10,
        speed: 1.4,
        xp: 2,
        size: 35,
        color: "#4CAF50"
    },
    bug: {
        name: "Release-Bug",
        emoji: "🐛",
        sprite: "assets/sprites/enemy_bug.png",
        health: 15,
        damage: 8,
        speed: 2.0,
        xp: 3,
        size: 28,
        color: "#FF5722"
    },
    clickbait: {
        name: "Clickbait-Geist",
        emoji: "👻",
        sprite: "assets/sprites/enemy_clickbait.png",
        health: 35,
        damage: 15,
        speed: 2.5,
        xp: 5,
        size: 40,
        color: "#9C27B0"
    },
    hater: {
        name: "Hater-Horde",
        emoji: "😠",
        health: 45,
        damage: 12,
        speed: 1.2,
        xp: 4,
        size: 32,
        color: "#F44336"
    },
    boss_microtransaction: {
        name: "Microtransaktions-Monster",
        emoji: "💰",
        sprite: "assets/sprites/boss_microtransaction.png",
        health: 500,
        damage: 25,
        speed: 0.8,
        xp: 50,
        size: 80,
        color: "#FFD700",
        isBoss: true
    },
    boss_crunch: {
        name: "Crunch-Krake",
        emoji: "🐙",
        health: 800,
        damage: 30,
        speed: 1.0,
        xp: 80,
        size: 100,
        color: "#E91E63",
        isBoss: true
    }
};

// Weapons
const WEAPONS = {
    faktenschleuder: {
        name: "Faktenschleuder",
        emoji: "📰",
        description: "Schnelle Projektile",
        baseDamage: 10,
        fireRate: 400,
        projectileSpeed: 12,
        pierce: 1,
        type: "projectile",
        maxLevel: 5,
        levelUpgrades: [
            { desc: "+20% Schaden", effect: "damage" },
            { desc: "+1 Durchdringung", effect: "pierce" },
            { desc: "+25% Feuerrate", effect: "fireRate" },
            { desc: "+30% Schaden", effect: "damage" },
            { desc: "+2 Durchdringung", effect: "pierce" }
        ]
    },
    wertungsblitz: {
        name: "Wertungsblitz",
        emoji: "⚡",
        description: "Hoher Schaden, langsam",
        baseDamage: 25,
        fireRate: 1000,
        projectileSpeed: 15,
        pierce: 2,
        type: "projectile",
        maxLevel: 5,
        levelUpgrades: [
            { desc: "+25% Schaden", effect: "damage" },
            { desc: "+25% Feuerrate", effect: "fireRate" },
            { desc: "+1 Durchdringung", effect: "pierce" },
            { desc: "+30% Schaden", effect: "damage" },
            { desc: "+40% Feuerrate", effect: "fireRate" }
        ]
    },
    news_nova: {
        name: "News Nova",
        emoji: "💥",
        description: "Explosiver Flächenschaden",
        baseDamage: 12,
        fireRate: 800,
        projectileSpeed: 8,
        pierce: 2,
        aoe: 50,
        type: "explosive",
        maxLevel: 5,
        levelUpgrades: [
            { desc: "+30% AOE-Radius", effect: "aoe" },
            { desc: "+20% Schaden", effect: "damage" },
            { desc: "+25% Feuerrate", effect: "fireRate" },
            { desc: "+40% AOE-Radius", effect: "aoe" },
            { desc: "+35% Schaden", effect: "damage" }
        ]
    },
    kaffee_aura: {
        name: "Kaffee-Aura",
        emoji: "☕",
        description: "Schaden um den Spieler",
        baseDamage: 5,
        fireRate: 500,
        range: 80,
        type: "aura",
        maxLevel: 5,
        levelUpgrades: [
            { desc: "+25% Reichweite", effect: "range" },
            { desc: "+30% Schaden", effect: "damage" },
            { desc: "+20% Feuerrate", effect: "fireRate" },
            { desc: "+35% Reichweite", effect: "range" },
            { desc: "+50% Schaden", effect: "damage" }
        ]
    },
    mausklick: {
        name: "Mausklick-Massaker",
        emoji: "🖱️",
        description: "Radiale Wellen",
        baseDamage: 15,
        fireRate: 2000,
        range: 150,
        type: "radial",
        maxLevel: 5,
        levelUpgrades: [
            { desc: "+30% Reichweite", effect: "range" },
            { desc: "+25% Schaden", effect: "damage" },
            { desc: "+30% Feuerrate", effect: "fireRate" },
            { desc: "+40% Reichweite", effect: "range" },
            { desc: "+40% Schaden", effect: "damage" }
        ]
    },
    deadline_drohne: {
        name: "Deadline-Drohne",
        emoji: "🚁",
        description: "Kreist um den Spieler",
        baseDamage: 12,
        fireRate: 100,
        range: 100,
        type: "orbital",
        maxLevel: 5,
        levelUpgrades: [
            { desc: "+1 Drohne", effect: "orbitalCount" },
            { desc: "+25% Schaden", effect: "damage" },
            { desc: "+1 Drohne", effect: "orbitalCount" },
            { desc: "+30% Reichweite", effect: "range" },
            { desc: "+1 Drohne", effect: "orbitalCount" }
        ]
    },
    kettenblitz: {
        name: "Kettenblitz",
        emoji: "⚡",
        description: "Springt zwischen Feinden",
        baseDamage: 18,
        fireRate: 800,
        chainCount: 4,
        chainRange: 150,
        type: "chain",
        maxLevel: 5,
        levelUpgrades: [
            { desc: "+2 Ketten-Sprünge", effect: "chain" },
            { desc: "+25% Schaden", effect: "damage" },
            { desc: "+25% Feuerrate", effect: "fireRate" },
            { desc: "+3 Ketten-Sprünge", effect: "chain" },
            { desc: "+40% Schaden", effect: "damage" }
        ]
    },
    flammenspur: {
        name: "Flammenspur",
        emoji: "🔥",
        description: "Hinterlässt brennenden Boden",
        baseDamage: 6,
        fireRate: 100,
        duration: 3000,
        type: "trail",
        maxLevel: 5,
        levelUpgrades: [
            { desc: "+30% Brandschaden", effect: "damage" },
            { desc: "+50% Dauer", effect: "duration" },
            { desc: "+35% Brandschaden", effect: "damage" },
            { desc: "+50% Dauer", effect: "duration" },
            { desc: "+50% Brandschaden", effect: "damage" }
        ]
    },
    heiliges_wasser: {
        name: "Heiliges Wasser",
        emoji: "💧",
        description: "Schadenszonen am Boden",
        baseDamage: 15,
        fireRate: 2000,
        range: 100,
        duration: 4000,
        type: "zone",
        maxLevel: 5,
        levelUpgrades: [
            { desc: "+25% Zonenradius", effect: "range" },
            { desc: "+30% Schaden", effect: "damage" },
            { desc: "+40% Dauer", effect: "duration" },
            { desc: "+35% Zonenradius", effect: "range" },
            { desc: "+40% Schaden", effect: "damage" }
        ]
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
        type: "shotgun",
        maxLevel: 5,
        levelUpgrades: [
            { desc: "+2 Projektile", effect: "projectileCount" },
            { desc: "+20% Schaden", effect: "damage" },
            { desc: "+25% Feuerrate", effect: "fireRate" },
            { desc: "+2 Projektile", effect: "projectileCount" },
            { desc: "+1 Durchdringung", effect: "pierce" }
        ]
    },

    // === CHARACTER-SPECIFIC STARTING WEAPONS ===

    rotstift: {
        name: "Chefredakteurs-Rotstift",
        emoji: "✏️",
        description: "Markiert Feinde zum Löschen - hoher Crit-Schaden",
        baseDamage: 15,
        fireRate: 600,
        projectileSpeed: 14,
        pierce: 2,
        critBonus: 0.3,
        type: "projectile",
        maxLevel: 5,
        levelUpgrades: [
            { desc: "+15% Crit-Chance", effect: "crit" },
            { desc: "+25% Schaden", effect: "damage" },
            { desc: "+1 Durchdringung", effect: "pierce" },
            { desc: "+20% Crit-Chance", effect: "crit" },
            { desc: "+40% Schaden", effect: "damage" }
        ]
    },
    druckerpresse: {
        name: "Druckerpresse",
        emoji: "🗞️",
        description: "Schießt Magazine-Seiten - breiter Angriff",
        baseDamage: 12,
        fireRate: 500,
        projectileSpeed: 10,
        pierce: 3,
        projectileCount: 3,
        spread: 0.2,
        type: "shotgun",
        maxLevel: 5,
        levelUpgrades: [
            { desc: "+2 Seiten", effect: "projectileCount" },
            { desc: "+20% Schaden", effect: "damage" },
            { desc: "+25% Feuerrate", effect: "fireRate" },
            { desc: "+2 Seiten", effect: "projectileCount" },
            { desc: "+1 Durchdringung", effect: "pierce" }
        ]
    },
    podcast_welle: {
        name: "Podcast-Schallwelle",
        emoji: "🎙️",
        description: "Audio-Wellen heilen und schaden gleichzeitig",
        baseDamage: 8,
        fireRate: 800,
        range: 150,
        healAmount: 1,
        type: "radial",
        maxLevel: 5,
        levelUpgrades: [
            { desc: "+30% Reichweite", effect: "range" },
            { desc: "+1 HP/Welle Heilung", effect: "heal" },
            { desc: "+25% Schaden", effect: "damage" },
            { desc: "+1 HP/Welle Heilung", effect: "heal" },
            { desc: "+40% Reichweite", effect: "range" }
        ]
    },
    deadline_laser: {
        name: "Deadline-Laser",
        emoji: "⚡",
        description: "Schwenkender Laserstrahl - trifft alle in der Linie",
        baseDamage: 8,
        fireRate: 50,
        range: 300,
        sweepSpeed: 2,
        type: "laser",
        maxLevel: 5,
        levelUpgrades: [
            { desc: "+30% Laserbreite", effect: "width" },
            { desc: "+25% Schaden", effect: "damage" },
            { desc: "+20% Reichweite", effect: "range" },
            { desc: "+40% Schaden", effect: "damage" },
            { desc: "+50% Laserbreite", effect: "width" }
        ]
    },
    ban_hammer: {
        name: "Ban-Hammer",
        emoji: "🔨",
        description: "Hammer-Schlag auf nächsten Gegner - betäubt",
        baseDamage: 35,
        fireRate: 1200,
        range: 150,
        stunDuration: 800,
        aoeRadius: 60,
        type: "hammer",
        maxLevel: 5,
        levelUpgrades: [
            { desc: "+30% AOE-Radius", effect: "aoe" },
            { desc: "+25% Schaden", effect: "damage" },
            { desc: "+0.3s Stun-Dauer", effect: "stun" },
            { desc: "+25% Feuerrate", effect: "fireRate" },
            { desc: "+40% AOE-Radius", effect: "aoe" }
        ]
    }
};

// Meta Progression Upgrades (Shop)
const META_UPGRADES = {
    maxHealth: {
        name: "Lebenskraft",
        emoji: "❤️",
        description: "+10 Max HP pro Level",
        cost: [50, 100, 200, 400, 800],
        bonus: 10
    },
    damage: {
        name: "Waffenöl",
        emoji: "⚔️",
        description: "+10% Waffenschaden pro Level",
        cost: [75, 150, 300, 600],
        bonus: 0.1
    },
    speed: {
        name: "Koffein-Kick",
        emoji: "👟",
        description: "+10% Bewegungstempo pro Level",
        cost: [50, 100, 200, 400],
        bonus: 0.1
    },
    xpGain: {
        name: "Schnellleser",
        emoji: "📚",
        description: "+15% XP-Gewinn pro Level",
        cost: [100, 200, 400],
        bonus: 0.15
    },
    armor: {
        name: "Dickes Fell",
        emoji: "🛡️",
        description: "-5% erlittener Schaden pro Level",
        cost: [80, 160, 320, 640],
        bonus: 0.05
    },
    luck: {
        name: "Glückspilz",
        emoji: "🍀",
        description: "+10% bessere Drop-Chance pro Level",
        cost: [100, 200, 400],
        bonus: 0.1
    },
    magnetRange: {
        name: "Langer Arm",
        emoji: "🧲",
        description: "+25% XP-Aufnahmeradius pro Level",
        cost: [60, 120, 240],
        bonus: 0.25
    },
    revival: {
        name: "Zweite Chance",
        emoji: "💫",
        description: "Einmal pro Runde mit 50% HP wiederbeleben",
        cost: [500],
        bonus: 1
    }
};

// Achievements
const ACHIEVEMENTS = {
    first_blood: { name: "Erster Kill", desc: "Besiege deinen ersten Gegner", emoji: "🩸", condition: (stats) => stats.totalKills >= 1 },
    centurion: { name: "Centurion", desc: "Besiege 100 Gegner in einer Runde", emoji: "⚔️", condition: (stats) => stats.killCount >= 100 },
    survivor_5: { name: "5-Minuten-Held", desc: "Überlebe 5 Minuten", emoji: "⏱️", condition: (stats) => stats.gameTime >= 300000 },
    survivor_10: { name: "Ausdauer-König", desc: "Überlebe 10 Minuten", emoji: "👑", condition: (stats) => stats.gameTime >= 600000 },
    boss_slayer: { name: "Boss-Bezwinger", desc: "Besiege einen Boss", emoji: "💀", condition: (stats) => stats.bossesKilled >= 1 },
    weapon_master: { name: "Waffenmeister", desc: "Habe 6 Waffen gleichzeitig", emoji: "🔫", condition: (stats) => stats.weaponCount >= 6 },
    level_10: { name: "Schnellaufsteiger", desc: "Erreiche Level 10", emoji: "📈", condition: (stats) => stats.level >= 10 },
    millionaire: { name: "Münzsammler", desc: "Sammle 1000 Münzen total", emoji: "🪙", condition: (stats) => stats.totalCoins >= 1000 }
};

// Random Drops
const DROP_TYPES = {
    xp_magnet: {
        name: "XP-Magnet",
        emoji: "🧲",
        description: "Zieht alle XP-Kugeln sofort an",
        color: "#00FFFF",
        rarity: 0.02,  // 2% chance
        duration: 0    // instant
    },
    health_pack: {
        name: "Erste Hilfe",
        emoji: "💊",
        description: "Stellt 25 HP wieder her",
        color: "#FF4444",
        rarity: 0.03,
        duration: 0
    },
    speed_boost: {
        name: "Adrenalin",
        emoji: "⚡",
        description: "+50% Tempo für 5 Sekunden",
        color: "#FFFF00",
        rarity: 0.02,
        duration: 5000
    },
    damage_boost: {
        name: "Rage Mode",
        emoji: "💥",
        description: "+50% Schaden für 5 Sekunden",
        color: "#FF8800",
        rarity: 0.02,
        duration: 5000
    },
    shield: {
        name: "Schutzschild",
        emoji: "🛡️",
        description: "Blockt den nächsten Treffer",
        color: "#8888FF",
        rarity: 0.01,
        duration: 10000
    },
    coin_rain: {
        name: "Geldregen",
        emoji: "🪙",
        description: "+10 Münzen sofort",
        color: "#FFD700",
        rarity: 0.03,
        duration: 0
    }
};
