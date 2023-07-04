// Engine of the browser game Lost In Maze
// Copyright (c) 2014-2024 Feudal Code Limitada

// ### file: animate.js ###

"use strict"

// special animation + callbacks
const portalsToAnimate = [ ]  // sqrObjs
const obelisksToAnimate = [ ] // sqrObjs

// for 30 pfs
const obeliskTime =  3
const portalTime  = 25
const smokeTime   = 45
const bonfireTime = 35
const beachTime  = 150

let bonfireClock = bonfireTime
let portalClock  = portalTime
let smokeClock   = smokeTime
let beachClock   = beachTime // also for ocean

let beachTurns   = [ "beach-low" ] // , "beach-high" ]
let bonfireTurns = [ "1", "2" ]
let oceanTurns   = [ "1", "2", "3" ]  // also used to animate lava and pool
let portalTurns  = "123456"
let smokeTurns   = [ "1", "2", "3", "4" ]


function beachTurn() {
    return beachTurns[0]
}

function oceanTurn() {
    return oceanTurns[0]
}

function smokeTurn() {
    return smokeTurns[0]
}

function bonfireTurn() {
    return bonfireTurns[0]
}

function updateAnimation() {
    updatePortalTurns()
    updateSmokeTurns()
    updateBonfireTurns()
    updateBeachAndOceanTurns()
    //
    for (const sqr of obelisksToAnimate) { updateObeliskEffect(sqr) }
}

function updateBeachAndOceanTurns() {
    if (LOOP < beachClock) { return }
    //
    beachClock = LOOP + beachTime
    beachTurns.push(beachTurns.shift())
    oceanTurns.push(oceanTurns.shift())
}

function updateBonfireTurns() {
    if (LOOP < bonfireClock) { return }
    //
    bonfireClock = LOOP + bonfireTime
    bonfireTurns.push(bonfireTurns.shift())
}

function updatePortalTurns() {
    if (LOOP < portalClock) { return }
    //
    portalClock = LOOP + portalTime
    const turn = portalTurns[0]
    portalTurns = portalTurns.substr(1) + turn
}

function updateSmokeTurns() {
    if (LOOP < smokeClock) { return }
    //
    smokeClock = LOOP + smokeTime
    smokeTurns.push(smokeTurns.shift())
}

// portal /////////////////////////////////////////////////////////////////////

// individual effect for each portal

function includePortal(sqr) {
    portalsToAnimate.push(sqr)
}

function portalBmp(sqr) {
    if (sqr.effect == "activated-portal") { return "portal*!" }
    return "portal*" + portalTurns[0]
}

function activatePortal(sqr) {
    setSquareEffect(sqr, "activated-portal", LOOP) // LOOP is not necessary
}

// obelisk ////////////////////////////////////////////////////////////////

function includeObelisk(sqr) { obelisksToAnimate.push(sqr) }

function obeliskToSolid(sqr) {
    sqr.blocked = true
    sqr.walkable = false
    setSquareEffect(sqr, "omkigfedc", LOOP)
}

function obeliskToEther(sqr) {
    sqr.blocked = false
    sqr.walkable = true
    setSquareEffect(sqr, "#ccddeeffgghhii^", LOOP)
}

function keepObeliskEthereal(sqr) {
    setSquareEffect(sqr, "jjkkllmmnnoopp+", LOOP)
}

function updateObeliskEffect(sqr) {
    if (sqr.effect == "")  { return }
    const timer = sqr.effectClock + obeliskTime
    if (LOOP < timer) { return }
    //
    const head = sqr.effect[0]
    sqr.effect = sqr.effect.substr(1)
    sqr.effectClock = LOOP
    //
    if (sqr.effect.endsWith("+")) {
        sqr.effect = sqr.effect.replace("+", head + "+")
        return
    }
    if (sqr.effect == "^") { keepObeliskEthereal(sqr) }
}

function obeliskBmp(sqr) {
    if (sqr.effect == "") { return "block-e" }
    return "block-e*" + sqr.effect[0]
}

// ### file: audio-monovox.js ###

"use strict"

// AudioContext demands any action by the user on the webpage

let audioCtx
let masterGain

let pulse   // oscillator
let output  // gain
let lfoA    // oscillator // modulates pulse
let volA    // gain
let lfoB    // oscillator // modulates output
let volB    // gain

let frequencies = {
    "C4" : 261.626, // middle C
    "C#4": 277.183,
    "D4" : 293.665,
    "D#4": 311.127,
    "E4" : 329.628,
    "F4" : 349.228,
    "F#4": 369.994,
    "G4" : 391.995,
    "G#4": 415.305,
    "A4" : 440.000,
    "A#4": 466.164,
    "B4" : 493.883
}

// init ///////////////////////////////////////////////////////////////////

function maybeInitMonovox() {
    //
    if (audioCtx) { return } // already done
    //
    if (typeof AudioContext == "undefined") { return } // not possible
    //
    audioCtx = new AudioContext()
    fillFrequencies()
    //
    masterGain = audioCtx.createGain()
    masterGain.connect(audioCtx.destination)
    masterGain.gain.setValueAtTime(5.0, audioCtx.currentTime)
    //
    output = audioCtx.createGain()
    output.connect(masterGain)
    output.gain.setValueAtTime(0.0, audioCtx.currentTime)
    //
    pulse = audioCtx.createOscillator()
    pulse.connect(output)
    pulse.frequency.setValueAtTime(0.0, audioCtx.currentTime)
    pulse.start()
    //
    volA = audioCtx.createGain()
    volA.gain.setValueAtTime(0.0, audioCtx.currentTime)
    volA.connect(pulse.frequency)
    //
    lfoA = audioCtx.createOscillator()
    lfoA.frequency.setValueAtTime(0.0, audioCtx.currentTime)
    lfoA.connect(volA)
    lfoA.start()
    //
    volB = audioCtx.createGain()
    volB.gain.setValueAtTime(0.0, audioCtx.currentTime)
    volB.connect(output.gain)
    //
    lfoB = audioCtx.createOscillator()
    lfoB.frequency.setValueAtTime(0.0, audioCtx.currentTime)
    lfoB.connect(volB)
    lfoB.start()
}

function fillFrequencies() {
    const notes = "C,C#,D,D#,E,F,F#,G,G#,A,A#,B".split(",")
    for (let n = 0; n < 12; n++) {
        const note = notes[n]
        frequencies[note + "1"] = frequencies[note + "4"]  /  8
        frequencies[note + "2"] = frequencies[note + "4"]  /  4
        frequencies[note + "3"] = frequencies[note + "4"]  /  2
        frequencies[note + "5"] = frequencies[note + "4"]  *  2
        frequencies[note + "6"] = frequencies[note + "4"]  *  4
        frequencies[note + "7"] = frequencies[note + "4"]  *  8
        frequencies[note + "8"] = frequencies[note + "4"]  * 16
    }
}

function isValidFrequency(token) {
    return frequencies[token] != undefined
}

function monovoxReady() {
    return audioCtx != undefined
}

// play - release - mute - decay //////////////////////////////////////////

function playNote(instrument, tone) {
    //
    cancelAudioScheduledValues()
    //
    const freq = frequencies[tone]
    //
    if (instrument == "organ") { playNoteOrgan(freq); return }
    if (instrument == "organ2") { playNoteOrgan2(freq); return }
    if (instrument == "organ3") { playNoteOrgan3(freq); return }
    if (instrument == "organ4") { playNoteOrgan4(freq); return }
    if (instrument == "spatial") { playNoteSpatial(freq); return }
    if (instrument == "organ-dry") { playNoteOrganDry(freq); return }
    if (instrument == "organ-bell") { playNoteOrganBell(freq); return }
    if (instrument == "organ-simple") { playNoteOrganSimple(freq); return }
}

function releaseNote(instrument) {
    //
    cancelAudioScheduledValues()
    //
    if (instrument == "organ") { releaseNoteOrgan(); return }
    if (instrument == "organ2") { releaseNoteOrgan2(); return }
    if (instrument == "organ3") { releaseNoteOrgan3(); return }
    if (instrument == "organ4") { releaseNoteOrgan4(); return }
    if (instrument == "spatial") { releaseNoteSpatial(); return }
    if (instrument == "organ-dry") { releaseNoteOrganDry(); return }
    if (instrument == "organ-bell") { releaseNoteOrganBell(); return }
    if (instrument == "organ-simple") { releaseNoteOrganSimple(); return }
}

function muteNote(duration) {
    //
    if (! duration) { duration = 0.1 }
    //
    cancelAudioScheduledValues()
    //
    output.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + duration)
}

function decayNote(duration) {
    //
    if (! duration) { duration = 0.1 }
    //
    cancelAudioScheduledValues()
    //
    output.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + duration)
}

function cancelAudioScheduledValues() {
    //
    output.gain.cancelScheduledValues(audioCtx.currentTime)
    //
    pulse.frequency.cancelScheduledValues(audioCtx.currentTime)
    //
    volA.gain.cancelScheduledValues(audioCtx.currentTime)
    volB.gain.cancelScheduledValues(audioCtx.currentTime)
    //
    lfoA.frequency.cancelScheduledValues(audioCtx.currentTime)
    lfoB.frequency.cancelScheduledValues(audioCtx.currentTime)
}

// instrument - organ /////////////////////////////////////////////////////

function playNoteOrgan(freq) {
    //
    volA.gain.setValueAtTime(0.0, audioCtx.currentTime) // no use
    volB.gain.setValueAtTime(0.0, audioCtx.currentTime) // no use
    //
    pulse.type = "sine"
    pulse.frequency.setValueAtTime(freq, audioCtx.currentTime)
    //
    output.gain.setValueAtTime(2.5, audioCtx.currentTime) // attack (sudden)
    output.gain.setTargetAtTime(5.5, audioCtx.currentTime + 0.1, 0.4) // sustain (strong)
}

function releaseNoteOrgan() {
    //
    pulse.type = "sine"
    lfoA.type = "square"
    lfoA.frequency.setValueAtTime(10.0, audioCtx.currentTime)
    volA.gain.setValueAtTime(0.1, audioCtx.currentTime)
    output.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 3.0)
}

// instrument - organ2 ////////////////////////////////////////////////////

function playNoteOrgan2(freq) {
    //
    volB.gain.setValueAtTime(0.0, audioCtx.currentTime) // no use
    //
    lfoA.type  = "sawtooth"
    lfoA.frequency.setValueAtTime(3.0, audioCtx.currentTime)
    volA.gain.setValueAtTime(1.0, audioCtx.currentTime)
    //
    pulse.type = "sine"
    pulse.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.01)
    //
    output.gain.setTargetAtTime(2.5, audioCtx.currentTime, 0.1) // attack
    output.gain.setTargetAtTime(5.5, audioCtx.currentTime + 0.1, 0.4) // decay
}

function releaseNoteOrgan2() {
    //
    output.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 2.0)
    //
    lfoA.type = "square"
    lfoA.frequency.linearRampToValueAtTime(6.0, audioCtx.currentTime + 1.0)
}

// instrument - organ3 ////////////////////////////////////////////////////

function playNoteOrgan3(freq) {
    //
    volB.gain.setValueAtTime(0.0, audioCtx.currentTime) // no use
    //
    lfoA.type   = "sawtooth"
    lfoA.frequency.setValueAtTime(7.0, audioCtx.currentTime)
    volA.gain.setValueAtTime(1.0, audioCtx.currentTime)
    //
    pulse.type = "triangle"
    pulse.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.01)
    //
    output.gain.setTargetAtTime(2.5, audioCtx.currentTime, 0.1) // attack
    output.gain.setTargetAtTime(5.5, audioCtx.currentTime + 0.1, 0.4) // decay
}

function releaseNoteOrgan3() {
    //
    output.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 2.0)
    //
    lfoA.type = "square"
    lfoA.frequency.linearRampToValueAtTime(5.0, audioCtx.currentTime + 1.0)
}

// instrument - organ4 ////////////////////////////////////////////////////

function playNoteOrgan4(freq) {
    //
    volA.gain.setValueAtTime(0.0, audioCtx.currentTime) // no use
    //
    lfoB.type   = "square"
    lfoB.frequency.setValueAtTime(5.0, audioCtx.currentTime)
    volB.gain.setValueAtTime(0.0, audioCtx.currentTime)
    volB.gain.linearRampToValueAtTime(5.0, audioCtx.currentTime + 0.5)
    //
    pulse.type = "triangle"
    pulse.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.01)
    //
    output.gain.setTargetAtTime(2.5, audioCtx.currentTime, 0.1) // attack
    output.gain.setTargetAtTime(5.5, audioCtx.currentTime + 0.1, 0.4) // decay
}

function releaseNoteOrgan4() {
    //
    output.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 2.0)
    volB.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 1.5)
}

// instrument - organ dry /////////////////////////////////////////////////

function playNoteOrganDry(freq) {
    //
    volA.gain.setValueAtTime(0.0, audioCtx.currentTime) // no use
    volB.gain.setValueAtTime(0.0, audioCtx.currentTime) // no use
    //
    pulse.type = "square"
    pulse.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.01)
    //
    output.gain.setTargetAtTime(5.0, audioCtx.currentTime, 0.1) // attack
    output.gain.setTargetAtTime(0.2, audioCtx.currentTime + 0.1, 0.1) // decay
}

function releaseNoteOrganDry() {
    output.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 0.1)
}

// instrument - spatial ///////////////////////////////////////////////////

function playNoteSpatial(freq) {
    //
    volB.gain.setValueAtTime(0.0, audioCtx.currentTime) // no use
    //
    lfoA.type = "sine"
    lfoA.frequency.setValueAtTime(3.0, audioCtx.currentTime)
    volA.gain.setValueAtTime(10.0, audioCtx.currentTime)
    //
    pulse.type = "triangle"
    pulse.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.01)
    //
    output.gain.setValueAtTime(0.3, audioCtx.currentTime) // almost muting previous note
    output.gain.setTargetAtTime(2.5, audioCtx.currentTime, 0.1) // attack
    output.gain.setTargetAtTime(5.5, audioCtx.currentTime + 0.1, 0.4) // decay
}

function releaseNoteSpatial() {
    //
    output.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 1.0)
    //
    volA.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 1.0)
}

// instrument - organ bell ////////////////////////////////////////////////

function playNoteOrganBell(freq) {
    //
    volA.gain.setValueAtTime(0.0, audioCtx.currentTime) // no use
    volB.gain.setValueAtTime(0.0, audioCtx.currentTime) // no use
    //
    pulse.type = "triangle"
    pulse.frequency.setValueAtTime(freq, audioCtx.currentTime)
    //
    output.gain.setValueAtTime(2.0, audioCtx.currentTime) // attack (sudden)
}

function releaseNoteOrganBell() {
    output.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 1.0)
}

// instrument - organ simple //////////////////////////////////////////////

function playNoteOrganSimple(freq) {
    volA.gain.setValueAtTime(0.0, audioCtx.currentTime) // no use
    volB.gain.setValueAtTime(0.0, audioCtx.currentTime) // no use
    //
    pulse.type = "sine"
    pulse.frequency.setValueAtTime(freq, audioCtx.currentTime)
    //
    output.gain.setValueAtTime(2.5, audioCtx.currentTime) // attack (sudden)
    output.gain.setTargetAtTime(5.5, audioCtx.currentTime + 0.1, 0.4) // sustain (strong)
}

function releaseNoteOrganSimple() {
    output.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 1.0)
}

// ### file: audio-music.js ###

"use strict"

let musicTokens
let musicInstrument = "organ" // make safe for stopMusic

let musics = {

    "success": "@c3 @c1 @c2 @c1 @c2 @c4",

    "failure": "@d1 @d2",


    "c1": "[organ-dry] (3 A#3 2) (2 A3 2) (3 F3 2) (3 A#3 1) (2 A3 2) (2 F3 2)",

    "c2": "[organ-dry] (3 G#2 2) (2 G2 2) (3 D#2 2) (3 G#2 1) (2 G2 2) (2 D#2 2)",

    "c3": "[organ-dry] (3 A4 2) (2 G#4 2) (3 E4 2) (3 A4 1) (2 G#4 2) (2 E4 2)",

    "c4": "[organ3] (3 A4 9) (1 G#4 9) (1 E4 20) [organ-dry] (5 A4 1) (2 G#4 4) (1 E4 1)",


    "d1": "[organ3] (0 F2 34) (16 D#2 2) (17 F2 2) (7 F2 41) (0 G#2 41) (13 F2 27) (3 G#2 1) (1 F2 28) (0 G#2 2) (1 F2 32) (0 D2 2) [organ] (17 D2 2) [organ3] (2 D2 24)",

    "d2": "[organ3] (0 G#2 2) (1 F2 3) (3 G#2 2) (1 F2 8) (3 G#2 2) (1 F2 32)",


    "e": "[organ3] (3 G#2 4) (5 G2 4) (5 D#2 4) (3 G#2 5) (0 G2 3) (2 D#2 1) (2 D#2 10)"
}

// init ///////////////////////////////////////////////////////////////////

function initMusic() {
    //
    adjustMusic("success")
    adjustMusic("failure")
}

function adjustMusic(key) { // replaces keys for true music segments
    //
    const tokens = musics[key].split(" ")
    //
    let s = ""
    //
    for (const token of tokens) {
        //
        if (s != "") { s += " " }
        //
        s += musics[token.substr(1)] // excludes @
    }
    //
    musics[key] = s
}

// stop ///////////////////////////////////////////////////////////////////

function stopMusic() {
    if (! monovoxReady()) { return }
    //
    musicTokens = [ ]
    releaseNote(musicInstrument)
}

// play ///////////////////////////////////////////////////////////////////

function playMusic(s) {
    maybeInitMonovox()
    if (! monovoxReady()) { return }
    //
    stopMusic()
    musicTokens = musics[s].split(" ")
    processMusicToken()
}

function processMusicToken() {
    //
    if (musicTokens.length == 0) { return }
    //
    const token = musicTokens.shift()
    //
    // THE ORDER HERE IS IMPORTANT:
    //
    if (token.startsWith("[")) {
        processSpecialMusicToken(token)
        processMusicToken()
        return
    }
    //
    if (token.startsWith("(")) {
        const delay = 100 * parseInt(token.replace("(", ""))
        setTimeout(processMusicToken, delay)
        return
    }
    //
    if (token.endsWith(")")) {
        const duration = 100 * parseInt(token.replace(")", ""))
        setTimeout(function () { releaseNote(musicInstrument); processMusicToken() }, duration)
        return
    }
    // must be the tone to be played now (or dirty)
    if (isValidFrequency(token)) { playNote(musicInstrument, token) }
    processMusicToken()
}

function processSpecialMusicToken(token) {
    //
    if (token == "[mute]")    { muteNote(0.1); return }
    if (token == "[decay]")   { decayNote(0.1); return }
    if (token == "[organ]")   { musicInstrument = "organ"; return }
    if (token == "[organ2]")  { musicInstrument = "organ2"; return }
    if (token == "[organ3]")  { musicInstrument = "organ3"; return }
    if (token == "[organ4]")  { musicInstrument = "organ4"; return }
    if (token == "[spatial]") { musicInstrument = "spatial"; return }
    if (token == "[organ-dry]")  { musicInstrument = "organ-dry"; return }
    if (token == "[organ-bell]") { musicInstrument = "organ-bell"; return }
    if (token == "[organ-simple]") { musicInstrument = "organ-simple"; return }
}

// ### file: avatar.js ###

"use strict"

var avatarPickUpClock = 0

var avatarHasScroll = false

var avatarHotkeyAction = null

var avatarAltarSkullClock = 0


// action by keyboard /////////////////////////////////////////////////////////

function setAvatarHotkeyAction(action) {
    //
    if (avatarHotkeyAction != null) { return }
    //
    avatarHotkeyAction = action
}

// script /////////////////////////////////////////////////////////////////////

function defaultAvatarScript() { // this is the default script; other script may be used
    //
    if (avatar.disabled) { return }
    //
    if (avatarHotkeyAction != null) { avatarHotkeyAction(); avatarHotkeyAction = null }
    //
    handleAvatarAttack()
    //
    handleArrowKeysForAvatar()
}

// square /////////////////////////////////////////////////////////////////////

function isFreeSquareForAvatar(row, col) {
    //
    const status = squareStatusForAvatar(row, col)
    //
    if (status == "free")  { return true }
    if (status == "field") { return true }
    //
    return false
}

function squareStatusForAvatar(row, col) {
    //
    // free, field, creature, pusher, block //
    //
    const sqr = getSquare(row, col)
    //
    if (sqr == null) { return "block" }
    //
    // portal
    if (sqr.layerC == "portal") {
        return (avatarBrightGem ? "free" : "block")
    }
    // walkable
    if (sqr.walkable) {
        if (sqr.creature != null)    { return "creature" }
        if (sqr.layerB == "smoke")   { return "field" }
        if (sqr.layerB == "bonfire") { return "field" }
        return "free"
    }
    // not walkable
    if (sqr.trigger != null) { return "pusher" } // so can push altar (for example) to activate trigger
    //
    return "block"
}

// monster ahead //////////////////////////////////////////////////////////////

function monsterAheadAvatar() {
    //
    const creature = creatureAheadAvatar()
    //
    if (creature == null) { return null }
    //
    if (creature.name == "Orion") { return null } // orion may be undefined
    //
    return null
}

function creatureAheadAvatar() {
    //
    const futureRow = avatar.row + deltaRowFor[avatar.direction]
    const futureCol = avatar.col + deltaColFor[avatar.direction]
    //
    const sqr = getSquare(futureRow, futureCol)
    //
    if (sqr == null) { return null }
    if (sqr.creature == null)  { return null }
    if (sqr.creature.disabled) { return null }
    //
    return sqr.creature
}

// pick up ////////////////////////////////////////////////////////////////////

function avatarPickUp() {
    //
    if (! readyToMove(avatar)) { return }
    //
    if (LOOP < avatarPickUpClock + 5) { return }
    //
    const sqr = getSquare(avatar.row, avatar.col)
    //
    if (sqr.objects == null) { speak(avatar, "No pick up."); return }
    //
    avatarPickUpClock = LOOP
    //
    const item = removeObjectFromSquare(avatar.row, avatar.col)
    //
    avatarPickUp2(item)
    //
    shallUpdateMainBar = true
}

function avatarPickUp2(item) { // inventory self limits everything to 999!
    //
    if (item.startsWith("spear-")) {
        avatar.spears += 1
        speak(avatar, "Grabbing spear.")
        return
    }
    //
    if (item == "bright-gem") { scriptFoundBrightGem(); return }
    if (item == "wooden-key") { scriptFoundWoodenKey(); return }
    if (item == "iron-key")   { scriptFoundIronKey();   return }
    if (item == "copper-key") { scriptFoundCopperKey(); return }
    //
    if (item == "health-potion") {
        speak(avatar, "Grabbing health potion.")
        avatar.healthPotions += 1
        return
    }
    //
    if (item == "speed-oil") {
        speak(avatar, "Grabbing speed oil.")
        avatar.speedOils += 1
        return
    }
    //
    if (item == "mana-potion") {
        speak(avatar, "Grabbing mana potion.")
        avatar.manaPotions += 1
        return
    }
    //
    if (item == "antidote-potion") {
        speak(avatar, "Grabbing antidote potion.")
        avatar.antidotePotions += 1
        return
    }
    //
    alert("ERROR while picking up " + item)
}

// ### file: avatar-attack.js ###

"use strict"

var avatarStopAimTimer = 0

var avatarAttackStatus = "none" // "wanting-aim", "aiming"

var avatarAttackFunction = null

// keyboard handlers //////////////////////////////////////////////////////////

function avatarTryMeleeAttack() {
    //
    if (avatarAttackStatus != "none") { return }
    //
    if (LOOP < avatar.attackClock + 20) { succinct(avatar, "Too soon!"); return }
    //
    avatarAttackFunction = avatarMeleeAttack
    //
    avatarTryAim()
}

function avatarTryThrowSpear() {
    //
    if (avatarAttackStatus != "none") { return }
    //
    if (LOOP < avatar.attackClock + 20) { succinct(avatar, "Too soon!"); return }
    //
    avatarAttackFunction = avatarThrowSpear
    //
    avatarTryAim()
}

function avatarTryThrowPurpleBubble() {
    //
    if (avatarAttackStatus != "none") { return }
    //
    if (LOOP < avatar.attackClock + 20) { succinct(avatar, "Too soon!"); return }
    //
    avatarAttackFunction = avatarThrowPurpleBubble
    //
    avatarTryAim()
}

// aim ////////////////////////////////////////////////////////////////////////

function avatarTryAim() {
    //
    if (avatar.moveStatus != "stand") { avatarAttackStatus = "wanting-aim"; return }
    //
    avatarStartAim()
}

function avatarStartAim() {
    //
    avatarAttackStatus = "aiming"
    //
    avatarStopAimTimer = LOOP + 20
}

function shallDrawAimMark() {
    //
    return LOOP < avatarStopAimTimer // also draws after aiming
}

// manager ////////////////////////////////////////////////////////////////////

function handleAvatarAttack() {
    //
    if (avatarAttackStatus == "none") { return }
    //
    if (avatarAttackStatus == "wanting-aim") {
        //
        if (avatar.moveStatus == "stand") { avatarStartAim() }
        //
        return
    }
    //
    if (avatarAttackStatus == "aiming") {
        //
        if (LOOP < avatarStopAimTimer) { return }
        //
        avatarAttackStatus = "none"
        avatarAttackFunction()
        return
    }
}

// spear //////////////////////////////////////////////////////////////////////

function avatarThrowSpear() {
    //
    avatar.attackClock = LOOP
    avatarStopAimTimer = LOOP + 10 // so aim mark keeps being drawn
    //
    if (avatar.spears == 0) { succinct(avatar, "No spear."); return }
    //
    avatar.spears -= 1
    shallUpdateMainBar = true
    //
    throwSpear(avatar, avatar.row, avatar.col, avatar.direction, 10, 20)
}

// purple bubble //////////////////////////////////////////////////////////////

function avatarThrowPurpleBubble() {
    //
    avatar.attackClock = LOOP
    avatarStopAimTimer = LOOP + 10 // so aim mark keeps being drawn
    //
    if (avatar.purpleBubbles == 0) { succinct(avatar, "No purple bubble."); return }
    //
    avatar.purpleBubbles -= 1
    shallUpdateMainBar = true
    //
    throwPurpleBubble(avatar, avatar.row, avatar.col, avatar.direction, 18, 30)
}

// melee //////////////////////////////////////////////////////////////////////

function avatarMeleeAttack() {
    //
    avatar.attackClock = LOOP
    avatarStopAimTimer = LOOP + 2 // so aim mark keeps being drawn
    //
    if (avatarMeleeWeapon == "none") { succinct(avatar, "No weapon."); return }
    //
    let target = creatureAheadAvatar()
    if (target == null) { succinct(avatar, "Miss."); return }
    //
    receiveMeleeAttack(avatar, target, 12, 20)
}

// ### file: avatar-inventory.js ###

"use strict"

var avatarArmor = "none"
var avatarShield = "none"
var avatarMeleeWeapon = "none"

var avatarIronKey = false
var avatarWoodenKey = false
var avatarCopperKey = false
var avatarBrightGem = false

// health potion //////////////////////////////////////////////////////////////

function avatarDrinkHealthPotion(altar) {
    //
    if (avatar.life == avatar.maxLife) { succinct(avatar, "Not hurt!"); return false }
    //
    if (! altar) {
        //
        if (avatar.healthPotions == 0) { succinct(avatar, "No potion."); return false }
        //
        avatar.healthPotions -= 1
    }
    //
    const hurt = avatar.maxLife - avatar.life
    const heal = Math.min(50, hurt)
    avatar.life += heal
    reportDamage(avatar, "heal", heal)
    succinctDouble(avatar, "Ahhh.")
    shallUpdateMainBar = true
    return true
}

// antidote potion ////////////////////////////////////////////////////////////

function avatarDrinkAntidotePotion(altar) {
    //
    if (avatar.poisoning.length == 0  &&  avatar.dizziness == 0) {
        succinct(avatar, "No need.")
        return false
    }
    //
    if (! altar) {
        //
        if (avatar.antidotePotions == 0) { succinct(avatar, "No potion."); return false }
        //
        avatar.antidotePotions -= 1
    }
    //
    avatar.poisoning = []
    avatar.dizziness = 0
    speak(avatar, "Gulp.")
    shallUpdateMainBar = true
    return true
}

// speed oil //////////////////////////////////////////////////////////////////

function avatarDrinkSpeedOil(altar) {
    //
    if (avatar.speedEffect == "fast") { succinct(avatar, "Still fast!"); return false }
    //
    if (! altar) {
        //
        if (avatar.speedOils == 0) { succinct(avatar, "No oil."); return false }
        //
        avatar.speedOils -= 1
    }
    //
    avatar.speedEffect = "fast"
    avatar.speedTimer = LOOP + 1800 // 60s
    speak(avatar, "Zooom!")
    shallUpdateMainBar = true
    return true
}

// mana potion ////////////////////////////////////////////////////////////////

function avatarDrinkManaPotion(altar) {
    //
    if (avatar.manaShield > 299) { succinct(avatar, "Mana shield full."); return false }
    //
    if (! altar) {
        //
        if (avatar.manaPotions == 0) { succinct(avatar, "No potion."); return false }
        //
        avatar.manaPotions -= 1
    }
    //
    avatar.manaShield = Math.min(300, avatar.manaShield + 100)
    succinct(avatar, "Ssssssss.")
    shallUpdateMainBar = true
    return true
}

// ### file: avatar-move.js ###

"use strict"

//   This system for input is not just for diagonals, it is
//   very stable, much better than just respond directly to
//   keyboard events during avatar continuous movement...
//   maybe because of keyboard delay/speed configuration.

var tryingsToLeaveDiagonal = 0 // makes easy to release arrow keys of diagonal direction //

var lastTryingToLeaveDiagonalClock = 0

var tryingsToStepOnField = 0

var lastTryingToStepOnFieldClock = 0


function handleArrowKeysForAvatar() {
    //
    if (! readyToMove(avatar)) { return }
    //
    const direction = readArrowKeys()
    //
    if (direction == "error") { return }
    if (direction == "none")  { return }
    //
    if (direction == avatar.direction) { tryMoveAvatar(); return }
    //
    if (! avatarMaySpin()) { return }
    //
    spin(avatar, direction)
    //
    tryMoveAvatar()
}

function avatarMaySpin() {
    //
    if (! avatar.isDiagonal) { return true }
    // current direction is diagonal
    const obsolet = (LOOP - lastTryingToLeaveDiagonalClock) > 1
    //
    lastTryingToLeaveDiagonalClock = LOOP
    //
    if (obsolet) { tryingsToLeaveDiagonal = 0 }
    //
    tryingsToLeaveDiagonal += 1
    //
    return tryingsToLeaveDiagonal > 4
}

function tryMoveAvatar() {
    //
    if (shiftKeyPressed)  { return }
    //
    if (! readyToMove(avatar)) { return }
    //
    if (avatarAttackStatus == "aiming") { return }
    //
    if (avatar.isDiagonal) {
        //
        if (diagonalIsLuxury(avatar.direction, avatar.row, avatar.col)) { return }
    }
    //
    const futureRow = avatar.row + deltaRowFor[avatar.direction]
    const futureCol = avatar.col + deltaColFor[avatar.direction]
    //
    const status = squareStatusForAvatar(futureRow, futureCol)
    //
    // must be this order:
    //
    if (status == "block") { return } // or else messes avatar on field trying to move to blocked square
    //
    if (status == "creature") { return }
    //
    if (status == "pusher") {  // not really a move
        //
        stand(avatar)
        //
        getSquare(futureRow, futureCol).trigger()
        //
        return
    }
    //
    if (status == "field") {
        //
        if (! avatarReadyToStepOnField()) { return }
    }
    //
    move(avatar)
}

// direction control
function readArrowKeys() {
    //
    if (leftKeyPressed && rightKeyPressed) { return "error" }
    if (upKeyPressed   && downKeyPressed)  { return "error" }
    //
    if (upKeyPressed   && rightKeyPressed) { return "northeast" }
    if (upKeyPressed   && leftKeyPressed)  { return "northwest" }
    if (downKeyPressed && rightKeyPressed) { return "southeast" }
    if (downKeyPressed && leftKeyPressed)  { return "southwest" }
    //
    if (upKeyPressed)                      { return "north" }
    if (downKeyPressed)                    { return "south" }
    if (rightKeyPressed)                   { return "east" }
    if (leftKeyPressed)                    { return "west" }
    //
    return "none"
}

function diagonalIsLuxury(direction, row, col) {
    //
    if (direction == "northeast") {
        if (isFreeNoFieldSquare(row - 1, col)) { return true }
        if (isFreeNoFieldSquare(row, col + 1)) { return true }
        return false
    }
    //
    if (direction == "northwest") {
        if (isFreeNoFieldSquare(row - 1, col)) { return true }
        if (isFreeNoFieldSquare(row, col - 1)) { return true }
        return false
    }
    //
    if (direction == "southeast") {
        if (isFreeNoFieldSquare(row + 1, col)) { return true }
        if (isFreeNoFieldSquare(row, col + 1)) { return true }
        return false
    }
    //
    if (direction == "southwest") {
        if (isFreeNoFieldSquare(row + 1, col)) { return true }
        if (isFreeNoFieldSquare(row, col - 1)) { return true }
        return false
    }
    //
    return true // this line should not be reached
}

function avatarReadyToStepOnField() {
    //
    const obsolet = (LOOP - lastTryingToStepOnFieldClock) > 1
    //
    lastTryingToStepOnFieldClock = LOOP
    //
    if (obsolet) { tryingsToStepOnField = 0 }
    //
    tryingsToStepOnField += 1
    //
    return tryingsToStepOnField > 9
}

// ### file: avatar-torch.js ###

"use strict"

var torchMaxLife  = 3600 // 120s

var avatarTorchAlertClock = 0

var avatarTorchLife = 3600 // 120s

var avatarTorchStatus = "off" // on, plus


// update /////////////////////////////////////////////////////////////////////

function updateAvatarTorch() {
    //
    if (avatarTorchStatus == "off") { return }
    //
    maybeAlertAvatarTorchOn()
    //
    avatarTorchLife -= (avatarTorchStatus == "on") ? 1 : 2 // 'on' or 'plus'
    //
    if (avatarTorchLife > 0) { return }
    //
    completelyFadeAvatarTorch()
    //
    avatarTorchStatus = "off"
    shallUpdateMainBar = true
}

// toggle on-off //////////////////////////////////////////////////////////////

function avatarToggleTorchStatus() {
    //
    if (avatarTorchStatus == "off") {
        //
        turnAvatarTorchOn()
    }
    else if (avatarTorchStatus == "on") {
        //
        if (avatarTorchLife > 300) { avatarTorchStatus = "plus"; return }
        //
        turnAvatarTorchOffOrRenewIt()
    }
    else { // "plus"
        //
        turnAvatarTorchOffOrRenewIt()
    }
}

function turnAvatarTorchOn() {
    //
    if (! DARKNESS) { succinct(avatar, "No need."); return }
    //
    if (avatar.torches == 0) { succinct(avatar, "No torch."); return }
    //
    if (avatar.torches > 1  &&  avatarTorchLife < 301) { completelyFadeAvatarTorch() }
    //
    avatarTorchStatus = "on"
    shallUpdateMainBar = true
}

function turnAvatarTorchOffOrRenewIt() {
    //
    if (! DARKNESS)            { turnAvatarTorchOff(); return } // no need to renew
    if (avatarTorchLife > 300) { turnAvatarTorchOff(); return } // no need to renew
    if (avatar.torches  ==  1) { turnAvatarTorchOff(); return } // can't renew
    //
    renewAvatarTorch()
}

function turnAvatarTorchOff() {
    //
    avatarTorchStatus = "off"
    shallUpdateMainBar = true
}

function renewAvatarTorch() {
    //
    completelyFadeAvatarTorch()
    //
    avatarTorchStatus = "on"
    shallUpdateMainBar = true
}

// helper /////////////////////////////////////////////////////////////////////

function completelyFadeAvatarTorch() {
    //
    avatarTorchLife = torchMaxLife
    avatar.torches -= 1
}

function maybeAlertAvatarTorchOn() {
    //
    if (DARKNESS) { return }
    if (avatarTorchLife < 300)   { return }
    if (avatar.speaches != null) { return }
    if (LOOP - avatarTorchAlertClock < 300) { return }
    //
    avatarTorchAlertClock = LOOP
    speak(avatar, "Torch is on.")
}

// ### file: connection.js ###

"use strict"

var INTERNET

function httpDownloadText(path, callback, timeout) {
    //
    const req = new XMLHttpRequest()
    //
    req.open("GET", path) // best position!
    req.setRequestHeader("Content-Type", "text/plain")
    req.overrideMimeType("text/plain")
    req.onerror = httpConnectionProblem
    //
    if (timeout) {
        req.timeout = timeout
        req.ontimeout = httpConnectionProblem
    }
    //
    req.onload = function () {
        if (req.status != 200) { httpConnectionProblem(); return }
        callback(path, req.responseText)
    }
    //
    req.send()
}

function httpDownloadImage(path, callback) {
    //
    const img = new Image()
    img.onload = function (e) { callback(path, e.srcElement) }
    img.onerror = httpConnectionProblem
    img.src = path
}

function httpUploadText(path, data, timeout) {
    //
    const req = new XMLHttpRequest()
    //
    req.open("PUT", path) // best position !
    req.setRequestHeader("Content-Type", "text/plain")
    req.overrideMimeType("text/plain")
    req.onerror = httpConnectionProblem
    //
    if (timeout) {
        req.timeout = timeout
        req.ontimeout = httpConnectionProblem
    }
    //
    req.onload = function () { if (req.status != 200) { httpConnectionProblem() } }
    //
    req.send(data)
}

function httpShowLoadingMessage(dots) {
    //
    if (INTERNET != "loading") { return }
    //
    drawConnectionMessage("loading" + dots, 250, 300)
    //
    dots += "."
    if (dots == "....") { dots = "." }
    //
    setTimeout(function () { httpShowLoadingMessage(dots) }, 1000)
}

function httpConnectionProblem() {
    //
    INTERNET = "connection-problem"
    //
    drawConnectionMessage("failed to load game!", 100, 300)
}

// ### file: creature-attack.js ###

"use strict"

// melee //////////////////////////////////////////////////////////////////////

function monsterMeleeAttack(attacker, target, min, max) {
    //
    attacker.attackClock = LOOP
    spinToTarget(attacker, target)
    receiveMeleeAttack(attacker, target, min, max)
}

function createMeleeSequence() { // for moving close to target
    //
    const list = [
        ".xxxx.xx.x.xx.xx.x.x.xx.xx.xx.xxx.x",
        "xx.xx.x.xx.x.xx.x.xx.xx.x..xx.xx.x.",
        "x.x.xx.xxx.xx.x..xxx.xx..x.x..xx.xx",
        "x.x.x.xx.xx.x.xx.xx.x.x.xx.x.xxx..x"
    ]
    //
    return randomItemFrom(list)
}

function shallBeLazyAfterCloseAttack(creature) {
    //
    const flag = creature.meleeSequence[0]
    creature.meleeSequence = creature.meleeSequence.substr(1) + flag
    //
    return flag == "."
}

// shoot sequence /////////////////////////////////////////////////////////////

function createHeavyShootSequence() {
    //
    const list = [
        ".x.xx..x.x.xx.x..x.x.xx..x.x..xx..x",
        "xx..x.x.xx.x..x.x.xx..x.x..xx..x.x.",
        "..x.xx.x.x.xx.x..x.x.xx..x.x..xx..x",
        "..x.x.xx..x.x.xx.x..x.x.xx.x..xx..x"
    ]
    return randomItemFrom(list)
}

function sequenceSaysShoot(creature) {
    //
    const flag = creature.shootSequence[0]
    creature.shootSequence = creature.shootSequence.substr(1) + flag
    //
    return flag == "x"
}

// target /////////////////////////////////////////////////////////////////////

function updateTargetStatus(creature) {
    //
    if (creature.target == null)  { creature.targetStatus = "none"; return } // must be checked first
    //
    if (creature.target.disabled) { creature.targetStatus = "none"; return }
    //
    const close = isCloseToTarget(creature, creature.target)
    //
    creature.targetStatus = close ? "close" : "distant"
}

function isCloseToTarget(creature, target) { // assumes target is ok
    //
    const deltaRow = creature.row - target.row
    //
    if (deltaRow > +1) { return false }
    if (deltaRow < -1) { return false }
    //
    const deltaCol = creature.col - target.col
    //
    if (deltaCol > +1) { return false }
    if (deltaCol < -1) { return false }
    //
    return true
}

function targetReallyClose(attacker, target) { // for melee attack
    // squares proximity were already checked
    if (target.walkedPixels < 21) { return true }
    //
    // creature may spin before or after current check!
    const direction = directionToAim(attacker, target.row, target.col)
    //
    if (direction == "north") { return true }
    if (direction == "south") { return true }
    if (direction == "east")  { return true }
    if (direction == "west")  { return true }
    // compares direction of the attacker with direction of the target
    if (direction == "northeast") {
        if (target.direction == "east")  { return false }
        if (target.direction == "north") { return false }
        if (target.direction == "northeast") { return false }
    }
    else if (direction == "northwest") {
        if (target.direction == "west")  { return false }
        if (target.direction == "north") { return false }
        if (target.direction == "northwest") { return false }
    }
    else if (direction == "southeast") {
        if (target.direction == "east")  { return false }
        if (target.direction == "south") { return false }
        if (target.direction == "southeast") { return false }
    }
    else if (direction == "southwest") {
        if (target.direction == "west")  { return false }
        if (target.direction == "south") { return false }
        if (target.direction == "southwest") { return false }
    }
    //
    return true
}

// aiming /////////////////////////////////////////////////////////////////////

function spinToTarget(creature, target) {
    //
    const direction = directionToAim(creature, target.row, target.col)
    //
    if (direction != creature.direction) { spin(creature, direction) }
}

function directionToAim(creature, row, col) {
    //
    let deltaRow = row - creature.row
    let deltaCol = col - creature.col
    //
    let vertical = ""
    if (deltaRow < 0) { vertical = "north" }
    if (deltaRow > 0) { vertical = "south" }
    //
    let horizontal = ""
    if (deltaCol < 0) { horizontal = "west" }
    if (deltaCol > 0) { horizontal = "east" }
    // precise
    if (deltaRow == 0) { return horizontal }
    if (deltaCol == 0) { return vertical   }
    // turning deltas absolute
    if (deltaRow < 0) { deltaRow *= -1 }
    if (deltaCol < 0) { deltaCol *= -1 }
    //
    if (deltaRow == deltaCol) { return vertical + horizontal }
    // not precise
    if (deltaRow == 1  &&  deltaCol > 2) { return horizontal }
    if (deltaCol == 1  &&  deltaRow > 2) { return vertical }
    //
    return vertical + horizontal
}

// ### file: creature-defend.js ###

"use strict"

// passive actions: must check if creature is disabled //

// includes attacks by bonfires and smokes //

function createPoisonArray() { return [6,5,5,5,4,4,4,4,3,3,3,3,2,2,2,2,1,1,1,1] }

// mana shield ////////////////////////////////////////////////////////////////

function reduceDamageByManaShield(creature, damage) {
    //
    const reduction = Math.min(damage, creature.manaShield)
    //
    if (reduction == 0) { return damage }
    //
    creature.manaShield -= reduction
    shallUpdateMainBar = true
    reportDamage(creature, "mana", reduction)
    startPuddleAnimation(creature, "mana")
    //
    return damage - reduction
}

// receive spear attack ///////////////////////////////////////////////////////

function receiveSpearAttack(creature, shot) {
    //
    if (creature.disabled) { return }
    //
    checkFriendlyFire(creature, shot.shooter)
    //
    let attack = amongMinMax(shot.min, shot.max)
    const closeShot = (shot.walkedSquares == 1  &&  shot.walkedPixels < 20)
    const hasBonus  = creature.moveStatus != "stand"  &&  ! closeShot
    //
    if (closeShot) {
        attack = amongMinMax(shot.min, attack)
    }
    else if (hasBonus) { // if close shot, spear has no bonus!
        attack = bonused50(shot.max) // bonus on attack, NOT on maxAttack!!! (or else would be too strong)
    }
    //
    let damage = attack - creature.defense
    if (damage < 1) { return }
    //
    damage = reduceDamageByManaShield(creature, damage)
    if (damage == 0) { return }
    //
    sufferDamage(creature, "blood", damage)
}

// receive melee attack ///////////////////////////////////////////////////////

function receiveMeleeAttack(attacker, target, min, max) {
    //
    if (target.disabled) { return }
    //
    let attack = amongMinMax(min, max)
    //
    checkFriendlyFire(target, attacker)
    //
    const hasBonus = target.moveStatus != "stand"
    //
    if (hasBonus) {
        attack = bonused50(max)
        startBigSwordAnimation(target)
    }
    else {
        startSmallSwordAnimation(target)
    }
    //
    let damage = attack - target.defense
    if (damage < 1) { return }
    //
    damage = reduceDamageByManaShield(target, damage)
    if (damage == 0) { return }
    //
    sufferDamage(target, "blood", damage)
}

// step on field //////////////////////////////////////////////////////////////

function stepOnBonfire(creature) {
    //
    if (creature.disabled)   { return }
    if (creature.immuneFire) { return }
    //
    startFlameAnimation(creature)
    //
    let damage = 20
    damage = reduceDamageByManaShield(creature, damage)
    //
    if (damage == 0) { return }
    //
    sufferDamage(creature, "fire", damage)
}

function stepOnSmoke(creature) {
    //
    if (creature.disabled) { return }
    if (creature.immunePoison) { return }
    //
    startPoisonAnimation(creature)
    //
    const array = createPoisonArray()
    const damage = reduceDamageByManaShield(creature, array.shift())
    if (damage == 0) { return } // mana shield may protect from the whole poisoning
    //
    sufferDamage(creature, "poison", damage)
    setPoisoning(creature, array)
}

// receive fire dart attack ///////////////////////////////////////////////////

function receiveFireDartAttack(creature, shot) {
    //
    if (creature.disabled)   { return }
    if (creature.immuneFire) { return }
    //
    checkFriendlyFire(creature, shot.shooter)
    //
    let damage = amongMinMax(shot.min, shot.max)
    damage = reduceDamageByManaShield(creature, damage)
    if (damage == 0) { return }
    //
    sufferDamage(creature, "fire", damage)
}

// receive smoke ball attack //////////////////////////////////////////////////

function receiveSmokeBallAttack(creature, shot) { // HAS POISONING EFFECTS
    //
    if (creature.disabled) { return }
    if (creature.immunePoison) { return }
    //
    checkFriendlyFire(creature, shot.shooter)
    //
    startPoisonAnimation(creature)
    //
    const array = createPoisonArray()
    const damage = reduceDamageByManaShield(creature, array.shift())
    if (damage == 0) { return }
    //
    sufferDamage(creature, "poison", damage)
    setPoisoning(creature, array)
}

// friendly fire //////////////////////////////////////////////////////////////

function checkFriendlyFire(creature, attacker) {
    //
    if (isMonster(creature)) { return }
    if (isMonster(attacker)) { return }
    //
    speak(creature, "Stop!")
}

// animation //////////////////////////////////////////////////////////////////

/*
function startArmorAnimation(creature) {
    //
    if (creature.armorBmpTimer == 0) { creature.armorBmpTimer = LOOP + 25; return } // standard
    if (creature.armorBmpTimer > 0)  { creature.armorBmpTimer *= -1 }  // negative value signals to repeat
}

function startShieldAnimation(creature) {
    if (creature.shieldBmpTimer == 0) { creature.shieldBmpTimer = LOOP + 20; return } // standard
    if (creature.shieldBmpTimer > 0)  { creature.shieldBmpTimer *= -1 }  // negative value signals to repeat
}
*/

function startSmallSwordAnimation(creature) {
    //
    if (creature.smallSwordBmpTimer == 0) { creature.smallSwordBmpTimer = LOOP + 25; return } // standard
    if (creature.smallSwordBmpTimer > 0)  { creature.smallSwordBmpTimer *= -1 }  // negative value signals to repeat
}

function startBigSwordAnimation(creature) {
    //
    if (creature.bigSwordBmpTimer == 0) { creature.bigSwordBmpTimer = LOOP + 25; return } // standard
    if (creature.bigSwordBmpTimer > 0)  { creature.bigSwordBmpTimer *= -1 }  // negative value signals to repeat
}

// ### file: creature-effect.js ###

"use strict"

// The kind of attack (blood, fire, poison) is for damage report only.

// Each damage (life or mana) leaves puddle on the ground.

// passive actions: must check if creature is disabled //

// speed - effect /////////////////////////////////////////////////////////////

function slow(creature) {
    //
    if (creature.disabled) { return }
    //
    creature.speedEffect = "slow"
    creature.speedTimer  = LOOP + 900 // 30s
    speak(creature, "Feeling slow.")
}

function updateSpeedEffect(creature) {
    //
    if (creature.disabled) { return }
    if (creature.speedTimer == 0) { return }
    if (LOOP != creature.speedTimer) { return }
    //
    creature.speedTimer = 0
    creature.speedEffect = "normal"
    speak(creature, "Normal speed.")
}

// speed - update /////////////////////////////////////////////////////////////

function updateSpeed(creature) {
    //
    let effect = creature.speedEffect
    //
    creature.speed = speedByRaceAndEffect(creature.race, effect)
}

// dizziness //////////////////////////////////////////////////////////////////

function dizzy(creature) {
    //
    if (creature.disabled) { return }
    //
    creature.dizziness = 0.2
    creature.dizzinessTimer = LOOP + 1800 // 30s
    speak(creature, "Feeling dizzy.")
}

function blind(creature) {
    //
    if (creature.disabled) { return }
    //
    creature.dizziness = 0.7
    creature.dizzinessTimer = LOOP + 1800 // 30s
    speak(creature, "I can't see.")
}

function updateDizziness(creature) {
    //
    if (creature.disabled) { return }
    if (creature.dizzinessTimer == 0) { return }
    if (LOOP != creature.dizzinessTimer) { return }
    //
    creature.dizzinessTimer = 0
    creature.dizziness = 0
    speak(creature, "I see clear now.")
}

// receive purple bubble //////////////////////////////////////////////////////

function receivePurpleBubbleHealing(creature, shot) {
    //
    if (creature.disabled) { return }
    if (creature.life == creature.maxLife) { succinct(creature, "Not hurt!"); return }
    //
    let heal = amongMinMax(shot.min, shot.max)
    const maxHeal = creature.maxLife - creature.life
    if (heal > maxHeal) { heal = maxHeal }
    creature.life += heal
    //
    reportDamage(creature, "heal", heal)
    if (creature == avatar) { shallUpdateMainBar = true }
    speak(creature, "Thank you!")
}

// poisoning //////////////////////////////////////////////////////////////////

function setPoisoning(creature, array) {
    // mana shield already considered
    // first damage already taken (by smoke shot or stepping on smoke field)
    // startPoisonAnimation already called
    creature.poisoning = array
    creature.poisoningTimer = LOOP + 150
}

function updatePoisoning(creature) {
    //
    if (creature.disabled) { return }
    if (creature.poisoning.length == 0)  { return }
    if (LOOP != creature.poisoningTimer) { return }
    //
    startPoisonAnimation(creature)
    //
    let damage = creature.poisoning.shift()
    damage = reduceDamageByManaShield(creature, damage)
    if (damage != 0) { sufferDamage(creature, "poison", damage) }
    //
    if (creature.poisoning.length != 0) { creature.poisoningTimer = LOOP + 150 }
}

// suffer damage //////////////////////////////////////////////////////////////

function sufferDamage(creature, color, damage) {
    // mana shield already considered
    // animations already started (except for puddle)
    reportDamage(creature, color, damage)
    startPuddleAnimation(creature, "blood")
    //
    creature.life -= damage
    if (creature.life < 1)  { creature.life = 0; kill(creature) }
    if (creature == avatar) { shallUpdateMainBar = true }
}

// animation //////////////////////////////////////////////////////////////////

function startPuddleAnimation(creature, kind) {
    //
    const sqr = getSquare(creature.row, creature.col)
    //
    sqr.puddleKind = kind
    sqr.puddleTimer = LOOP + 225
}

function startFlameAnimation(creature) {
    //
    creature.flameBmpTimer = LOOP + 25
}

function startPoisonAnimation(creature) {
    //
    if (creature.poisonBmpTimer == 0) { creature.poisonBmpTimer = LOOP + 25; return } // standard
    if (creature.poisonBmpTimer > 0)  { creature.poisonBmpTimer *= -1 }  // negative value signals to repeat
}

function startBleedAnimation(creature) {
    //
    if (creature.bleedBmpTimer == 0) { creature.bleedBmpTimer = LOOP + 40; return } // standard
    if (creature.bleedBmpTimer > 0)  { creature.bleedBmpTimer *= -1 }  // negative value signals to repeat
}

function startMagicAnimation(creature) {
    //
    if (creature.magicBmpTimer == 0) { creature.magicBmpTimer = LOOP + 30; return } // standard
    if (creature.magicBmpTimer > 0)  { creature.magicBmpTimer *= -1 }  // negative value signals to repeat
}

// ### file: creature-move.js ###

"use strict"

// creature spins and starts move in same loop
// creature does *not* stop and spin (or start move) in same loop

function stand(creature) {
    //
    resetMovementData(creature)
    creature.moveStatus = "stand"
    creature.stopClock = 0 // or else bmp may not change
    applyMoveDelay(creature, 1) // avoids stop/forced-stand/move in the same loop
}

function spin(creature, direction) {
    //
    creature.spinClock = LOOP
    creature.isDiagonal = direction.length > 6
    creature.direction  = direction
}

function stop(creature) {
    // finished move in current loop;
    // not moving anymore;
    // but also not ready to move again in this loop;
    // fires trigger;
    //
    if (creature.isDiagonal) { applyMoveDelay(creature, 15) }
    //
    resetMovementData(creature)
    creature.moveStatus = "stop"
    creature.legAtStop = creature.bmpleg
    creature.stopClock = LOOP // for bmp control
    //
    const sqr = getSquare(creature.row, creature.col)
    //
    if (sqr.field == "smoke")   { stepOnSmoke(creature) }
    if (sqr.field == "bonfire") { stepOnBonfire(creature) }
    if (sqr.field == "blufire") { convertBlufire(sqr) }
    //
    if (sqr.trigger != null  &&  creature == avatar) {
        // ONLY AVATAR CAN FIRE TRIGGERS
        stand(creature)
        sqr.trigger()
    }
}

function move(creature) {
    // must not be accepted if creature is not standing;
    //
    misdirect(creature)  // (at least one (the current) direction is valid
    //
    creature.moveStatus = "move"
    //
    updateMovement(creature) // or else movement starts only on next loop!!!
}

function readyToMove(creature) {
    //
    if (LOOP < creature.moveDelayTimer) { return false }
    //
    return creature.moveStatus == "stand" // "stop" means creature is still moving
}

function abortStep(creature) { // will not have field effect
    //
    applyMoveDelay(creature, 15)
    //
    stand(creature)
}

function applyMoveDelay(creature, delay) {
    //
    const newtimer = LOOP + delay
    //
    if (newtimer > creature.moveDelayTimer) { creature.moveDelayTimer = newtimer }
}

function resetMovementData(creature) {
    //
    creature.walkedPixels = 0
    creature.deltaTop  = 0
    creature.deltaLeft = 0
    creature.abortStepChecked = false
    creature.changeSquareChecked = false
}

// delay advancing on field //////////////////////////////////////////////////////

function shouldDelayAdvancingOnField(creature) { // already set to step on field
    //
    if (creature == avatar) { return false } // has own system
    //
    const futureRow = creature.row + deltaRowFor[creature.direction]
    const futureCol = creature.col + deltaColFor[creature.direction]
    //
    const sqr = getSquare(futureRow, futureCol)
    //
    if (sqr.field == "") { return false }
    //
    creature.delayBeforeAdvanceOnField += 1
    //
    if (creature.delayBeforeAdvanceOnField < 30) { return true }
    //
    creature.delayBeforeAdvanceOnField = 0
    //
    return false
}

// misdirect //////////////////////////////////////////////////////////////////

function misdirect(creature) {
    //
    if (creature.dizziness == 0) { return }
    if (Math.random() > creature.dizziness) { return }
    //
    const direction = calcMisdirection()
    //
    if (direction == "") { return }
    //
    if (direction != creature.direction) { spin(creature, direction) }
}

// ### file: creature-obj.js ###

"use strict"

// clock means past loop when something happened

// timer means future loop when something will happen
//     DON'T wait the next loop!
//     if timer <  LOOP return
//     if timer == LOOP do it
//     if timer >= LOOP do it

// no delay equals delay zero,
// things can run on the current loop;
// so, delay == 1 means things can run in the next loop

// some fields may keep obsolet value


function Creature() {
    // name & race
    this.race = ""
    this.name = ""
    // status
    this.visible = true
    this.disabled = false
    this.exists = true // not exists == shall delete
    // life
    this.life = 0
    this.maxLife = 0
    // protection
    this.defense = 0
    this.manaShield = 0
    this.immuneFire = false
    this.immunePoison = false
    // position
    this.row = 0
    this.col = 0
    this.deltaLeft = 0.0
    this.deltaTop  = 0.0
    // direction
    this.direction = "south"
    this.isDiagonal = false
    // movement
    this.moveStatus = "stand" // "move", "stop"
                              // "stop" means CREATURE IS MOVING (ending the movement)
                              // may fire trigger
                              // may not start another step
    this.walkedPixels = 0.0
    this.abortStepChecked = false
    this.changeSquareChecked = false
    this.spinClock = 0
    this.stopClock = 0 // for bmp control
    this.moveDelayTimer = 0
    this.delayBeforeAdvanceOnField = 0
    // speed
    this.speed = 0.0   // pixels per loop // after potion/curse and terrain influence
    this.speedTimer = 0
    this.speedEffect = "normal" // "slow", "fast" // potion/curse influence
    // teleport
    this.teleport = ""  // sequence of values
    // script
    this.script = null  // main script
    this.altern = null  // alternative script
    this.ondeath = null // script on death
    this.clock  = 0
    this.timer  = 0
    this.target = null
    this.loot = ""
    // attack
    this.attackClock = 0
    this.targetStatus  = "none" // close, distant
    this.meleeSequence = ""
    this.shootSequence = ""
    this.lazy = false  // when lazy creature stands after close attack
    // curses (slow curse uses speed data)
    this.poisoning = []
    this.poisoningTimer = 0
    this.dizziness = 0.0
    this.dizzinessTimer = 0
    // inventory
    this.spears = 0
    this.torches = 0
    this.speedOils = 0
    this.manaPotions = 0
    this.healthPotions = 0
    this.invisibleTeas = 0
    this.purpleBubbles = 0
    this.antidotePotions = 0
    // main sprite
    this.bmp = ""
    this.bmpleg = "stand" // "left", "right" ("after-left", "after-right")
    this.legAtStop = "right" // for golems
    this.previousBmpleg = "none" // for lateral spaceman
    this.bmpClock = 0 // also used for standing animations
    this.bmpTimer = 0 // standard change of bmp leg relies on timer
    // decorations
    this.speaches = []
    this.damages  = []
    this.flameBmpTimer  = 0
    this.poisonBmpTimer = 0
    this.magicBmpTimer  = 0
    this.bleedBmpTimer  = 0
    this.armorBmpTimer  = 0
    this.shieldBmpTimer = 0
    this.smallSwordBmpTimer = 0
    this.bigSwordBmpTimer = 0
}

function makeRawCreature() {
    const creature = new Creature()
    Object.seal(creature)
    return creature
}

// ### file: creature-teleport.js ###

"use strict"

// in /////////////////////////////////////////////////////////////////////////

function startTeleportIn(creature) {
    //
    const ref = extendString("onmlkjihgfeDCdcbCa", 8)
    //
    startTeleport(creature, ref)
}

// out ////////////////////////////////////////////////////////////////////////

function startTeleportOut(creature) {
    //
    const ref = "" +
    extendString("abBcCdDeEfFgGhH", 5) +
    extendString("ijkl", 7) +
    extendString("mnopqrstu", 4)
    //
    startTeleport(creature, ref)
}

// core ///////////////////////////////////////////////////////////////////////

function startTeleport(creature, str) {
    //
    creature.visible = true
    creature.disabled = true
    //
    creature.teleport = str
}

function updateTeleport(creature) {
    //
    if (creature.teleport == "") { return }
    //
    if (creature.teleport == "u") { // end of teleport out; creature must disappear while bmp has effect
        creature.exists = false
        return
    }
    //
    creature.teleport = creature.teleport.substr(1)
    //
    if (creature.teleport == "") { creature.disabled = false }
}

// helper /////////////////////////////////////////////////////////////////////

function extendString(s, count) {
    //
    let ss = ""
    const symbols = s.split("")
    for (const symbol of symbols) { ss += symbol.repeat(count) }
    //
    return ss
}

// ### file: creature-update-bmp.js ###

"use strict"

/////////////////////////////////////////////////////////////////////////
//  GOLDEN RULE FOR BMP LEG: WAIT [[ 4 ]] LOOPS BEFORE STAND  (30 FPS) //
/////////////////////////////////////////////////////////////////////////

// teleport will be handled only in module picture-creature


function updateCreatureBmp(creature) {
    //
    if (creature == avatar) { updateSpacemanBmp(creature); return }
    if (creature == orion)  { updateStandardCreatureBmp(creature); return }
    if (creature.race == "wood-golem") { updateWoodGolemBmp(creature); return }
    if (creature.race == "redzag")     { updateRedzagBmp(creature); return }
    //
    alert("Error at creatureBmpForAction for " + creature.race)
}

// update spaceman bmp ////////////////////////////////////////////////////////

function updateSpacemanBmp(creature) {
    //
    const simpledir = simpleDirection[creature.direction]
    //
    if (simpledir == "north") { updateStandardCreatureBmp(creature); return }
    if (simpledir == "south") { updateStandardCreatureBmp(creature); return }
    //
    updateTripleLateralBmp(creature) // east and right (and diagonals converted to east and right)
}

// update standard bmp ////////////////////////////////////////////////////////

function updateStandardCreatureBmp(creature) {
    //
    creature.bmpleg = legForStandardCreature(creature)
    //
    const simpledir = simpleDirection[creature.direction]
    //
    creature.bmp = creature.race + "-" + simpledir + "-" + creature.bmpleg
}

function legForStandardCreature(creature) {
    //
    if (creature.moveStatus == "stop")  { return creature.bmpleg }
    //
    if (creature.moveStatus == "stand") {
        //
        const standClock = creature.stopClock + 1
        //
        if (LOOP - standClock < 4) { return creature.bmpleg }
        //
        creature.previousBmpleg = "none" // for lateral triple position
        //
        return "stand"
    }
    // moving
    if (LOOP < creature.bmpTimer) { return creature.bmpleg }
    //
    const duration = (creature.speed > 2) ? 7 : 10
    //
    creature.bmpTimer = LOOP + duration
    //
    if (creature.bmpleg == "left")  { return "right" }
    //
    if (creature.bmpleg == "right") { return "left"  }
    //
    return (creature.row % 2 == 0) ? "left" : "right" // starting leg after standing
}

// update triple lateral bmp //////////////////////////////////////////////////

function updateTripleLateralBmp(creature) {
    //
    creature.bmpleg = legForTripleLateralCreature(creature)
    //
    const simpledir = simpleDirection[creature.direction]
    //
    creature.bmp = creature.race + "-" + simpledir + "-" + creature.bmpleg
}

function legForTripleLateralCreature(creature) {
    //
    if (creature.moveStatus == "stop")  { return creature.bmpleg }
    //
    if (creature.moveStatus == "stand") {
        //
        const standClock = creature.stopClock + 1
        //
        if (LOOP - standClock < 3) { return creature.bmpleg }
        //
        creature.previousBmpleg = "none"
        //
        return "stand"
    }
    // moving
    if (LOOP < creature.bmpTimer) { return creature.bmpleg }
    //
    const leg = lefForMoveTriple(creature)
    //
    let duration = (creature.speed > 2) ? 6 : 8
    //
    if (leg == "stand") { duration = (creature.speed > 2) ? 2 : 3 }
    //
    creature.bmpTimer = LOOP + duration
    //
    return leg
}

function lefForMoveTriple(creature) {
    //
    // previousBmpleg is only checked when current bmpleg == "stand"
    //
    if (creature.bmpleg == "left")  { creature.previousBmpleg = "left";  return "stand" }
    if (creature.bmpleg == "right") { creature.previousBmpleg = "right"; return "stand" }
    //
    // creature.bmpleg == "stand"
    //
    if (creature.previousBmpleg == "left")  { return "right" }
    if (creature.previousBmpleg == "right") { return "left" }
    //
    // creature.previousBmpleg == "none" // creature was trully standing
    return  (creature.col % 2 == 0) ? "left" : "right"
}

// update golem leg ///////////////////////////////////////////////////////////

function shallChangeGolemLeg(creature) {
    //
    if (LOOP == creature.spinClock) {
        //
        if (LOOP != creature.attackClock) { return true } // just a spin to move
        //
        return shallChangeGolemBmpAttackingAfterSpin(creature)
    }
    //
    if (creature.moveStatus == "stand") { // maybe creature is stuck far from target
        //
        if (LOOP - creature.stopClock < 31) { return false } // must be stuck
        //
        if (LOOP < creature.bmpTimer) { return false } // golem uses bmpTimer only if stuck
        //
        creature.bmpTimer = LOOP + 90
        //
        return shallBeLazyAfterCloseAttack(creature)
    }
    //
    const duration = bmpDurationForMovingGolem(creature)
    //
    if (LOOP < creature.bmpClock + duration) { return false }
    //
    if (creature.walkedPixels > 57) { return false }
    //
    return true
}

function shallChangeGolemBmpAttackingAfterSpin(creature) {
    //
    const direction = creature.direction
    //
    const bmp = creature.bmp.replace(creature.race + "-", "")
    //
    if (direction == "north") { return true }
    if (direction == "south") { return true }
    //
    if (direction == "east")  { return bmp == "south-left"   ||  bmp == "north-right" }
    if (direction == "west")  { return bmp == "south-right"  ||  bmp == "north-left" }
    //
    if (direction == "northeast") { return bmp != "north-left"  }
    if (direction == "northwest") { return bmp != "north-right" }
    if (direction == "southeast") { return bmp != "south-right" }
    if (direction == "southwest") { return bmp != "south-left"  }
}

function bmpDurationForMovingGolem(creature) {
    //
    if (creature.speed == 1) { return 15 }
    //
    if (creature.speed == 2) { return 10 }
    //
    return 22 // speed = 0.5
}

/*
// bmp - living fog ///////////////////////////////////////////////////////////

function livingFogLeg(creature) {
    //
    if (LOOP < creature.bmpTimer) { return creature.bmpleg }
    //
    creature.bmpTimer = LOOP + 30
    //
    return randomLeg(creature)
}

function randomLeg(creature) {
    //
    if (creature.bmpleg == "left")  { return randomItemFrom(["stand", "right"]) }
    //
    if (creature.bmpleg == "right") { return randomItemFrom(["stand", "left"]) }
    //
    return randomItemFrom(["left","right"])
}
*/

// ### file: creature-update-main.js ###

"use strict"

// actions like receive healing or receive damage
// are passive/extern and can not be controlled here

// logic //////////////////////////////////////////////////////////////////////

function updateMonsters() { // must run backwards
    //
    let n = creatures.length
    //
    while (true) {
        n -= 1
        if (n < 0) { return }
        const creature = creatures[n]
        //
        if (creature == avatar) { continue }
        if (creature == orion) { continue }
        //
        if (! creature.exists) {
            //
            leaveSquare(creature.row, creature.col)
            //
            creatures.splice(n, 1)
        }
        else {
            updateCreature(creature)
        }
    }
}

function updateCreature(creature) {
    //
    if (creature.disabled) { updateDisabledCreature(creature); return }
    //
    updatePoisoning(creature) // poisoning may have killed creature
    //
    if (creature.disabled) { updateDisabledCreature(creature); return }
    //
    updateDizziness(creature)
    //
    updateSpeedEffect(creature) // must come before updateSpeed
    //
    updateSpeed(creature) // must come before updateMovement
    //
    updateMovement(creature) // stepping on bonfire or smoke may have killed creature!!!!
    //
    if (creature.disabled) { updateDisabledCreature(creature); return }
    //
    if (creature != avatar) { updateTargetStatus(creature) }
    //
    if (creature.script != null) { creature.script(creature) }
    //
    updateDamages(creature)
    updateSpeaches(creature)
}

function updateDisabledCreature(creature) {
    //
    updateTeleport(creature)
    //
    updateDamages(creature)
    updateSpeaches(creature)
}

// bmp ////////////////////////////////////////////////////////////////////////

function updateCreaturesBmp() {
    //
    for (const creature of creatures) { updateCreatureBmp(creature) }
}

// ### file: creature-update-move.js ###

"use strict"

// updateMovement is called by two functions:
//  - updateCreatureEnabled
//  - move
//
// creature may start moving in the same loop where it stands

// movement update ////////////////////////////////////////////////////////////

function updateMovement(creature) {
    //
    if (creature.moveStatus == "stop") { creature.moveStatus = "stand"; return }
    //
    if (creature.moveStatus != "move") { return }
    //
    const deltaRow = deltaRowFor[creature.direction]
    const deltaCol = deltaColFor[creature.direction]
    //
    if (creature.walkedPixels == 0) {
        //
        if (shouldDelayAdvancingOnField(creature)) { return }
    }
    //
    creature.deltaLeft += deltaCol * creature.speed // picture will use rounded deltaLeft
    creature.deltaTop  += deltaRow * creature.speed // picture will use rounded deltaTop
    //
    creature.walkedPixels += creature.speed
    //
    // first pixels
    if (creature.walkedPixels < 18) { return } // use == is BAD because irregular number of walkedPixels are accepted
    // maybe abort (as soon as walked 18 pixels)
    if (! creature.abortStepChecked) { maybeAbortStep(creature, deltaRow, deltaCol); return }
    // first half yet
    if (creature.walkedPixels < 30) { return } // use == is BAD because irregular number of walkedPixels are accepted
    // abort or proceed (as soon as walked 30 pixels)
    if (! creature.changeSquareChecked) { abortOrProceedStep(creature, deltaRow, deltaCol); return }
    // second half (on new square)
    if (creature.walkedPixels < 60) { return } // use == is BAD because irregular number of walkedPixels are accepted
    // concluded
    stop(creature)
}

function maybeAbortStep(creature, deltaRow, deltaCol) {
    //
    creature.abortStepChecked = true
    //
    if (shallAbortStep(creature, deltaRow, deltaCol)) { abortStep(creature) }
}

function abortOrProceedStep(creature, deltaRow, deltaCol) {
    //
    creature.changeSquareChecked = true
    //
    if (shallAbortStep(creature, deltaRow, deltaCol)) { abortStep(creature); return }
    //
    proceedStep(creature, deltaRow, deltaCol)
}

function proceedStep(creature, deltaRow, deltaCol) {
    // leaving current square
    leaveSquare(creature.row, creature.col)
    // entering new square
    creature.col += deltaCol
    creature.row += deltaRow
    enterSquare(creature, creature.row, creature.col)
    // adjusting deltaLeft and deltaTop to new (row,col)
    if (deltaCol < 0) { creature.deltaLeft += 60 }
    if (deltaCol > 0) { creature.deltaLeft -= 60 }
    if (deltaRow < 0) { creature.deltaTop  += 60 }
    if (deltaRow > 0) { creature.deltaTop  -= 60 }
    //
    maybeEnterPortal(creature)
}

// helper /////////////////////////////////////////////////////////////////////

function shallAbortStep(creature, deltaRow, deltaCol) {
    // maybe faster creature has taken future square
    const row = creature.row + deltaRow
    const col = creature.col + deltaCol
    //
    return ! isFreeSquareFor(creature, row, col)
}

// ### file: creatures.js ###

"use strict"

var avatar
var orion

var creatures = []

const speeds = { // slow, normal, fast
    //
 // "avatar":       [1, 2, 2], // for tests only
    "avatar":       [2, 4, 6],
    "orion":        [0.5, 1, 2],
    "redzag":       [0.5, 1, 2],
    "wood-golem":   [0.5, 1, 2]  /*,
    "ice-golem":    [1, 2, 2],
    "chess-golem":  [1, 2, 2],
    "walking-hole": [1, 2, 2],
    "living-fog":   [1, 2, 2],
    "gangrene":     [1, 2, 2],
    "greedy-soul":  [1, 2, 2],
    "stone-golem":  [1, 2, 2]  */
}

const spreadLeftByRace = { // constant adjust for bmp
    //
    "avatar":        0,
    "orion":         5,
    "redzag":       10,
    "wood-golem":    5   /*,
    "ice-golem":     5,
    "chess-golem":   5,
    "walking-hole":  5,
    "living-fog":    5,
    "gangrene":      5,
    "greedy-soul":  15,
    "stone-golem":   0    */
}

const spreadTopByRace = { // constant adjust for bmp
    //
    "avatar":      -15,
    "orion":       -10,
    "redzag":       -5,
    "wood-golem":   -5    /*,
    "ice-golem":    -5,
    "chess-golem":  -5,
    "walking-hole": -5,
    "living-fog":  -15,
    "gangrene":    -15,
    "greedy-soul": -15,
    "stone-golem": -15    */
}


// init ///////////////////////////////////////////////////////////////////////

function initCreatures() {
    //
    Object.freeze(speeds)
    Object.freeze(spreadLeftByRace)
    Object.freeze(spreadTopByRace)
}

// speeds /////////////////////////////////////////////////////////////////////

function speedByRaceAndEffect(race, effect) {
    //
    const arr = speeds[race]
    //
    if (effect == "slow")   { return arr[0] }
    if (effect == "normal") { return arr[1] }
    if (effect == "fast")   { return arr[2] }
    if (effect == "close")  { return arr[3] }
    //
    return 0 // should not happen
}

// make ///////////////////////////////////////////////////////////////////////

function makeCreature(race, name, row, col) {
    //
    const sqr = getSquare(row, col)
    //
    if (! checkSquareForCreatureRaising(sqr, row, col)) { return }
    //
    maybeCreateSpeachSprite("name-" + name, [255,255,255], name)
    //
    const creature = makeRawCreature()
    creature.race = race
    creature.name = name
    //
    creature.row = row
    creature.col = col
    enterSquare(creature, row, col)
    //
    creatures.push(creature)
    return creature
}

function checkSquareForCreatureRaising(sqr, row, col) {
    //
    if (mayRaiseCreatureHere(sqr))  { return true }
    //
    alert("ERROR: can not raise creature on " + row + ":" + col)
    //
    return false
}

function mayRaiseCreatureHere(sqr) {
    //
    if (sqr == null) { return false }
    if (sqr.blocked) { return false }
    //
    return sqr.walkable
}

// death //////////////////////////////////////////////////////////////////////

function kill(creature) {
    //
    defaultDeathScript(creature)
    //
    dropLoot(creature)
    //
    if (creature.ondeath != null) { creature.ondeath(); return }
}

function defaultDeathScript(creature) {
    //
    stand(creature)
    creature.disabled = true
    startTeleportOut(creature)
}

function dropLoot(creature) {
    //
    if (creature.loot == "") { return }
    //
    placeObjectOnSquare(creature.loot, creature.row, creature.col)
}

// creating ///////////////////////////////////////////////////////////////////

function makeAvatar(row, col) {
    //
    avatar = makeCreature("avatar", "Explorer", row, col)
    //
    avatar.life = 100
    avatar.maxLife = 100
    avatar.visible = false
    avatar.script = defaultAvatarScript
    avatar.bmp = "avatar-south-stand"
    avatar.ondeath = scriptAvatarDead
}

function makeOrion(row, col) {
    //
    orion = makeCreature("orion", "Orion", row, col)
    //
    orion.life = 100
    orion.maxLife = 100
    orion.defense = 5
    orion.bmp = "orion-south-stand"
    orion.ondeath = scriptOrionDead
}

function makeWoodGolem(row, col) {
    //
    const creature = makeCreature("wood-golem", "Wood Golem", row, col, "left")
    //
    creature.life = 120
    creature.maxLife = 120
    creature.defense = 10
    creature.meleeSequence = createMeleeSequence()
    creature.target = avatar
    creature.script = function () { woodGolemScript(creature) }
    setWanderAsAlternScript(creature)
    creature.bmpleg = "right"
    creature.bmp = "wood-golem-south-" + creature.bmpleg // necessary (when golem does not spin at start)
    //
    return creature
}

function makeRedzag(row, col) {
    //
    const creature = makeCreature("redzag", "Redzag", row, col)
    //
    creature.life = 120
    creature.maxLife = 120
    creature.defense = 10
    creature.immuneFire = true
    creature.shootSequence = createHeavyShootSequence()
    creature.target = avatar
    creature.script = function () { redzagScript(creature) }
    setWanderAsAlternScript(creature)
    creature.bmpleg = "right"
    creature.bmp = "redzag-south-" + creature.bmpleg // necessary (when golem does not spin at start)
    //
    return creature
}

/*
function makeLivingFog(row, col) {
    const creature = makeCreature("living-fog", "Living Fog", row, col)
    creature.life = 120
    creature.maxLife = 120
    creature.defense = 2
    creature.target = avatar
    setWanderAsAlternScript(creature)
    creature.bmp = XXX
    return creature
}

function makeGangrene(row, col) {
    const creature = makeCreature("gangrene", "Gangrene", row, col)
    creature.life = 30
    creature.maxLife = 30
    creature.defense = 2
    creature.target = avatar
    setWanderAsAlternScript(creature)
    creature.bmp = XXX
    return creature
}

function makeGreedySoul(row, col) {
    const creature = makeCreature("greedy-soul", "Greedy Soul", row, col)
    creature.life = 100
    creature.maxLife = 100
    creature.defense = 5
    creature.target = avatar
    setWanderAsAlternScript(creature)
    creature.bmp = XXX
    return creature
}

function makeStoneGolem(row, col) {
    const creature = makeCreature("stone-golem", "Stone Golem", row, col)
    creature.life = 300
    creature.maxLife = 300
    creature.defense = 30
    creature.target = avatar
    setWanderAsAlternScript(creature)
    creature.bmpleg = "right"
    creature.bmp = XXX
    return creature
}

function makeWalkingHole(row, col) {
    const creature = makeCreature("walking-hole", "Walking Hole", row, col)
    creature.life = 300
    creature.maxLife = 300
    creature.defense = 30
    creature.target = avatar
    setWanderAsAlternScript(creature)
    creature.bmpleg = "right"
    creature.bmp = XXX
    return creature
}
*/

// helper /////////////////////////////////////////////////////////////////////

function isMonster(creature) {
    //
    if (creature == avatar) { return false }
    if (creature == orion)  { return false }
    //
    return true
}

function setWanderAsAlternScript(creature) {
    //
    const top    = creature.row - 2
    const left   = creature.col - 2
    const bottom = creature.row + 2
    const right  = creature.col + 2
    //
    creature.altern = function () { walk(creature, top, left, bottom, right) }
}

// ### file: creatures-redzag.js ###

"use strict"

// script /////////////////////////////////////////////////////////////////////

function redzagScript(creature) {
    //
    if (! readyToMove(creature)) { return }
    //
    if (creature.targetStatus == "none") {
        //
        if (creature.altern != null) { creature.altern() }
        return
    }
    //
    const target = creature.target
    //
    const readyToAttack = (LOOP - creature.attackClock) > 30
    //
    if (creature.targetStatus == "close") {
        //
        if (readyToAttack) { redzagShoot(creature, target) }
        //
        moveClose(creature, target.row, target.col)
        //
        return
    }
    // distant
    if (readyToAttack) {
        //
        if (sequenceSaysShoot(creature)) {
            //
            redzagShoot(creature, target)
        }
        else {
            //
            creature.attackClock = LOOP
        }
    }
    //
    safeApproach(creature, target.row, target.col)
}

function redzagShoot(creature, target) {
    //
    spinToTarget(creature, target)
    //
    throwFireDart(creature, creature.row, creature.col, creature.direction, 15, 25)
    //
    creature.attackClock = LOOP
}

// bmp ////////////////////////////////////////////////////////////////////////

function updateRedzagBmp(creature) {
    //
    const leg = legForRedzag(creature)
    //
    if (leg == creature.bmpleg) { return }
    //
    creature.bmpleg = leg
    //
    creature.bmp = "redzag-" + simpleDirection[creature.direction] + "-" + creature.bmpleg
    //
    creature.bmpClock = LOOP
}

function legForRedzag(creature) {
    //
    if (creature.moveStatus == "stand") {
        //
        const time = randomItemFrom([120, 210, 300, 360, 420, 480])
        //
        if (LOOP - creature.bmpClock < time) { return creature.bmpleg }
        //
        return creature.bmpleg == "right" ? "left" : "right"
    }
    //
    const wp = creature.walkedPixels
    //
    if (wp == 0) { return creature.bmpleg } // just stopped or delaying advancing on field
    //
    let left = true
    //
    if (wp > 15) { left = false }
    //
    if (wp > 30) { left = true }
    //
    if (wp > 45) { left = false }
    //
    const leg = left ? "left" : "right"
    //
    if (creature.legAtStop == "right") { return leg }
    //
    return (leg == "left") ? "right" : "left"
}

// ### file: creatures-wood-golem.js ###

"use strict"

// script /////////////////////////////////////////////////////////////////////

function woodGolemScript(creature) {
    //
    if (! readyToMove(creature)) { return }
    //
    if (creature.targetStatus == "none") {
        //
        if (creature.altern != null) { creature.altern() }
        return
    }
    //
    const target = creature.target
    //
    if (creature.targetStatus == "distant") { safeApproach(creature, target.row, target.col); return }
    //
    if (! targetReallyClose(creature, target)) { moveClose(creature, target.row, target.col); return }
    //
    const timeFromLastAttack = LOOP - creature.attackClock
    //
    if (timeFromLastAttack > 29) {
        //
        monsterMeleeAttack(creature, target, 3, 15)
        applyMoveDelay(creature, 9) // during delay can't follow moving target
        creature.lazy = shallBeLazyAfterCloseAttack(creature)
        return
    }
    //
    if (creature.lazy) { return }
    //
    moveClose(creature, target.row, target.col)
}

// bmp ////////////////////////////////////////////////////////////////////////

function updateWoodGolemBmp(creature) {
    //
    if (! shallChangeGolemLeg(creature)) { return }
    //
    creature.bmpleg = (creature.bmpleg == "right") ? "left" : "right"
    creature.bmp = "wood-golem-" + directionForWoodGolemBmp(creature) + "-" + creature.bmpleg
    creature.bmpClock = LOOP
}

function directionForWoodGolemBmp(creature) {
    //
    if (creature.direction.startsWith("north")) { return "north" }
    if (creature.direction.startsWith("south")) { return "south" }
    //
    let current = "north"
    if (creature.bmp.indexOf("north") == -1) { current = "south" }
    //
    if (creature.targetStatus == "none")  { return current }
    if (creature.targetStatus == "close") { return current }
    // golem looks towards target while side walking
    if (creature.target.row < creature.row) { return "north" }
    //
    return "south"
}

// ### file: damage.js ###

"use strict"

function Damage(bmp, top) {
    //
    this.bmp = bmp
    this.top = top
}

// update /////////////////////////////////////////////////////////////////////

function updateDamages(creature) {
    //
    if (creature.damages.length == 0) { return }
    //
    const oldest = creature.damages[0]
    //
    if (oldest.top < 0) { creature.damages.shift() }
    // all remaining components are ok
    const len = creature.damages.length
    //
    let delta = 0.34
    //
    if (len == 4) { delta = 0.7 }
    if (len == 5) { delta = 1.5 }
    if (len == 6) { delta = 3.0 }
    if (len >  6) { delta = 6.0 }
    //
    for (const damage of creature.damages) { damage.top -= (4 * delta) } // adjusted to 30 FPS
}

// create /////////////////////////////////////////////////////////////////////

function reportDamage(creature, kind, value) {
    //
    const top = calcTopForNewDamage(creature.damages)
    //
    const bmp = "damage-" + kind + "-" + value
    //
    if (sprites[bmp] == undefined) { sprites[bmp] = makeDamageSprite(kind, value) }
    //
    const damage = new Damage(bmp, top)
    //
    creature.damages.push(damage)
}

function calcTopForNewDamage(damages) { // avoids overwriting
    //
    const len = damages.length
    //
    if (len == 0) { return 36 }
    //
    const last = damages[len - 1]
    const top  = last.top + 18
    //
    return (top < 36) ? 36 : top // standard bottom or below it
}

function makeDamageSprite(kind, num) {
    //
    let color = [255, 255, 255, 255]
 // if (kind == "heal")   { color = [175, 238, 238, 255] } // font blue 1
 // if (kind == "heal")   { color = [111, 255, 255, 255] } // font blue 2
 // if (kind == "mana")   { color = [ 64, 224, 208, 255] } // cyan like
    if (kind == "mana")   { color = [255, 230,  30, 255] } // yellow like
 // if (kind == "heal")   { color = [106,  90, 205, 255] } // slateblue
    if (kind == "heal")   { color = [130, 210, 210, 255] } //
    if (kind == "gold")   { color = [255, 197,  56, 255] } // font gold 2
    if (kind == "blood")  { color = [255,   0,   0, 255] } // red // crimson
    if (kind == "fire")   { color = [255,  99,  71, 255] } // tomato
 // if (kind == "poison") { color = [173, 255,  47, 255] } // greenyellow
 // if (kind == "poison") { color = [180, 180,   0, 255] } // (my) light olive
    if (kind == "poison") { color = [120, 120, 120, 255] } // dark grey
    //
    const keys = ("" + num).split("")
    const sprs = []
    let spr
    let width = 2 // or else canvas is too short
    //
    for (const key of keys) {
        //
        spr = fontDigit[key]
        sprs.push(spr)
        width += spr.width - 2
    }
    //
    const cnv = makeEmptyCanvas(width, spr.height) // all sprs come with same height
    const ctx = cnv.getContext("2d")
    //
    let left = 0
    //
    for (const spr of sprs) {
        //
        ctx.drawImage(spr, left, 0)
        //
        left += spr.width - 2
    }
    //
    if (color[0] + color[1] + color[2] != 765) { colorizeSprite(cnv, color) }
    //
    return cnv
}

// ### file: display-fill.js ###

"use strict"

// display has 16 lines

function fontForDisplay(code) {
    //
    if (code == "a") { return fontAvatar }
    if (code == "c") { return fontCaptain }
    if (code == "j") { return fontJournal }
    if (code == "m") { return fontMMaster }
    if (code == "o") { return fontOrion }
    if (code == "p") { return fontProgram }
    //
    alert("ERROR: invalid code for font: " + code)
}

function fillDisplay(linesAsString) {
    //
    const lines = linesAsString.split("\n")
    //
    textScreenCtx.clearRect(0, 0, 780, 640)
    //
    let top = 25
    //
    for (const line of lines) {
        // collect info
        let jumps = line[0] // *,#,0,1,2,3,4,5,6,7,8,9
        let pos   = line[1] // l, c, r
        let font  = fontForDisplay(line[2]) // a, j, m, o, p
        let txt   = line.substr(3)
        // jumps
        if (jumps == "*") {
            top = 560
        }
        else if (jumps == "#") {
            top = 600 // 585
        }
        else {
            top += 35 * parseInt(jumps)
            if (top > 585) { top = 600 }
        }
        // position
        let left = 25 // 25 is left margin
        //
        if (pos == "c") {
            left = pixelsToCenterText(txt)
        }
        else if (pos == "r") {
            left = pixelsToPadRight(txt) - 10 // 10 is right margin
        }
        //
        drawDisplayLine(txt, font, left, top)
    }
}

function drawDisplayLine(txt, font, left, top) {
    //
    let back = 2
    //
    if (LANGUAGE == "portuguese") { back = 3 }
    //
    let off = txt.length
    //
    for (let n = 0; n < off; n++) {
        //
        let c = txt[n]
        let spr = font[c]
        textScreenCtx.drawImage(spr, left, top)
        left += spr.width - back // writing characters close
    }
}

// helper /////////////////////////////////////////////////////////////////////

function pixelsToCenterText(txt) {
    //
    let freePixels = 780 - textWidthPixels(txt)
    //
    let pad = Math.floor(freePixels / 2)
    //
    return Math.max(0, pad)
}

function pixelsToPadRight(txt) {
    //
    let freePixels = 780 - textWidthPixels(txt)
    //
    return Math.max(0, freePixels)
}

function textWidthPixels(txt) {
    //
    let width = 0
    let back = 2
    //
    if (LANGUAGE == "portuguese") { back = 3 }
    //
    let off = txt.length
    //
    for (let n = 0; n < off; n++) {
        //
        let c = txt[n]
        let spr = fontProgram[c] // english or other
        width += spr.width - back // writing characters close
    }
    //
    return width + back // fixing last close, wich is excessive
}

// ### file: display-main.js ###

"use strict"

var displayStatus = "no-display" // waiting-init, increasing-alpha, displaying, decreasing-alpha

var displayBgKind = "black" // stone, game, cinematic

var displayGlobalAlpha = 1.0

var textScreen
var textScreenCtx // transparent background

var stoneScreen

var frozenGameScreen
var frozenGameScreenCtx

// init ///////////////////////////////////////////////////////////////////////

function initDisplay() {
    //
    pageTitle = pageTitle.replace("@title@", TITLE)
    pageSuccess = pageSuccess.replace("@title@", TITLE)
    pageSkipOrRun = pageSkipOrRun.replace("@title@", TITLE)
    //
    createTextScreen()
    createStoneScreen()
    createFrozenGameScreen()
}

function createTextScreen() {
    //
    textScreen = makeEmptyCanvas(780, 640)
    textScreenCtx = textScreen.getContext("2d")
}

function createFrozenGameScreen() {
    //
    frozenGameScreen = makeEmptyCanvas(780, 640)
    frozenGameScreenCtx = frozenGameScreen.getContext("2d")
}

function createStoneScreen() {
    //
    stoneScreen = makeEmptyCanvas(780, 640)
    const ctx = stoneScreen.getContext("2d")
    //
    for (const x of [0,120,240,360,480,600,720]) {
        for (const y of [0,120,240,360,480,600]) {
            ctx.drawImage(sprites["panel"], x, y)
        }
    }
}

// display core ///////////////////////////////////////////////////////////////

function displayCore(bg, txt, keys, action) {
    //
    displayBgKind = bg
    //
    fillDisplay(txt)
    //
    answerKeys = keys || [ ]
    //
    answerAction = action || null
    //
    if (avatar.moveStatus == "stop") { stand(avatar) }
    //
    displayStatus = "waiting-init"
}

// draw display ///////////////////////////////////////////////////////////////

function drawDisplay() {
    //
    if (displayStatus == "no-display") { return }
    //
    if (displayStatus == "waiting-init") { startDisplaying(); return }
    //
    if (displayStatus == "increasing-alpha") { drawDisplayIncreasingAlpha(); return }
    //
    if (displayStatus == "displaying") { drawDisplayFullAlpha(); return }
    //
    if (displayStatus == "decreasing-alpha") { drawDisplayDecreasingAlpha(); return }
}

function startDisplaying() {
    //
    if (displayBgKind == "black") {
        //
        freezeGame()
        //
        displayStatus = "displaying"
        //
        pictureCtx.fillStyle = "black"
        //
        pictureCtx.fillRect(0, 0, 780, 640)
        //
        pictureCtx.drawImage(textScreen, 0, 0)
        //
        return
    }
    //
    if (displayBgKind == "stone") {
        //
        freezeGame()
        //
        displayStatus = "displaying"
        //
        pictureCtx.drawImage(stoneScreen, 0, 0)
        //
        pictureCtx.drawImage(textScreen, 0, 0)
        //
        return
    }
    //
    if (displayBgKind == "game") {
        //
        frozenGameScreenCtx.drawImage(picture, 0, 0)
        //
        freezeGame()
        //
        displayStatus = "increasing-alpha"
        //
        displayGlobalAlpha = 0.1
        //
        drawDisplayIncreasingAlpha()
    }
    //
    if (displayBgKind == "cinematic") {
        //
        displayStatus = "increasing-alpha"
        //
        displayGlobalAlpha = 0.1
        //
        drawDisplayIncreasingAlpha()
    }
}

function drawDisplayIncreasingAlpha() {
    //
    if (! shallRunCoreLoop) {
        //
        pictureCtx.globalAlpha = 1.0
        pictureCtx.drawImage(frozenGameScreen, 0, 0)
    }
    //
    displayGlobalAlpha *= 1.11
    if (displayGlobalAlpha > 1.0) { displayGlobalAlpha = 1.0 }
    //
    pictureCtx.globalAlpha = displayGlobalAlpha
    pictureCtx.drawImage(textScreen, 0, 0)
    pictureCtx.globalAlpha = 1.0
    //
    if (displayGlobalAlpha == 1.0) { displayStatus = "displaying" }
}

function drawDisplayFullAlpha() {
    //
    if (displayBgKind == "black") { return }
    //
    if (displayBgKind == "stone") { return }
    //
    if (displayBgKind == "game")  { return }
    //
    // displayBgKind == "cinematic"
    //
    pictureCtx.drawImage(textScreen, 0, 0)
}

function drawDisplayDecreasingAlpha() {
    //
    if (! shallRunCoreLoop) {
        //
        pictureCtx.globalAlpha = 1.0
        pictureCtx.drawImage(frozenGameScreen, 0, 0)
    }
    //
    displayGlobalAlpha *= 0.77
    pictureCtx.globalAlpha = displayGlobalAlpha
    pictureCtx.drawImage(textScreen, 0, 0)
    pictureCtx.globalAlpha = 1.0
    //
    if (displayGlobalAlpha > 0.07) { return }
    //
    if (answerAction != null) { answerAction(choosenAnswer) } else { dismissDisplay() }
}

function dismissDisplay() {
    displayStatus = "no-display"
    unfreezeGame()
}

// ### file: display-page.js ###

"use strict"

// development ////////////////////////////////////////////////////////////////

function freezeForDevelopment() {
    if (! DEVELOPMENT) { return }
    displayCore("game", pagePressEnter, ["enter"], null)
}

// display case by case ///////////////////////////////////////////////////////

function displayWaitPage() {
    displayCore("cinematic", pageWait, [], null)
}

function releaseWaitPage(action) {
    if (action) { answerAction = action }
    displayStatus = "decreasing-alpha"
}

function displayBlack(txt, keys, action) {
    displayCore("black", txt, keys, action)
}

function displayStone(txt, keys, action) {
    displayCore("stone", txt, keys, action)
}

function displayStandardPage(txt, action) {
    displayCore("game", txt + pagePressEnter, ["enter"], action)
}

function displayTitlePage() {
    displayCore("black", pageTitle, ["enter"], scriptOverture)
}

function displayRunOrSkipPage() {
    displayCore("black", pageSkipOrRun, ["r", "enter"], scriptRunOrSkipOverture)
}

function displayChoicePage(txt, keys, action) {
    displayCore("game", txt + pagePressChoice, keys, action)
}

function displayYouFound(txt, amount, action) {
    txt = translate(txt)
    const strAmount = (amount == 0) ? "" : amount + " "
    const text = "9c" + translate("pYou have found ") + strAmount + txt + ".\n" + pagePressEnter
    displayCore("game", text, ["enter"], action)
}

// ### file: display-template.js ###

"use strict"

var PAGES = { } // for episode only (makes the translation easy)

var pageWait =
    "*rp<wait>"

var pagePressEnter =
    "*rp<press Enter to continue>"

var pagePressChoice =
    "*rp<press the letter of your choice>"

/*
var pageClickMe =
    "7cpClick this screen to activate keyboard.\n" +
    pagePressEnter
*/

var pageTitle =
    "7cp@title@\n" +
    pagePressEnter

var pageSkipOrRun =
    "7cp@title@\n" +
    "8rp<press  R  to run  introduction>\n" +
    "1rp<press  Enter  to skip introduction>"

var pageQuit =
    "8lmThe Maze Master says:\n" +
    "2lmWhat are you afraid of?\n" +
    "4rp<press Q to quit>\n" +
    "1rp<press Enter to cancel>"

var pageRestart =
    "8lmThe Maze Master says:\n" +
    "2lm@sarcasm@\n" +
    "4rp<press R to restart>\n" +
    "1rp<press Enter to cancel>"

var pageMission =
    "0cp- MISSION -\n" +
    "0lp\n" +
    "0lp\n" +
    "2lp\n" +
    "2lp\n" +
    "2lp\n" +
    "2lpExplore the maze and find a way out.\n" +
    "*rp<press Enter to continue>"

/*
var pageReportTime =
    "7cp@title@\n" +
    "4cpTime spent on episode:   @time@\n" +
    "4rp<press Enter to continue>"
*/

var pageSuccess =
    "7lmThe Maze Master says:\n" +
    "2lmCongratulations, little mouse!\n"

var pageFailure =
    "7lmThe Maze Master says:\n" +
    "2lm@fail@\n" +
    "2lmThe maze will be reset.\n" +
    "2lmYou will be reset.\n"

var pageReplacementFailureAvatar =
    "You failed to escape the maze."

var pageReplacementFailureOrion =
    "Orion failed to escape the maze."

var pageReplacementFailureMission =
    "You failed to accomplish the mission."

var pageMazeChange =
    "9cpThe maze is changing.\n"

var pageBecomeEthereal =
    "9cpSomething is becoming ethereal.\n"

var pageBecomeSolid =
    "9cpSomething is becoming solid.\n"

var pageMenuHint =
    "9cpPressing  Enter  opens menu  (and help).\n"

var pageMenu =
    "0cp- MENU -\n" +
    "4lpPress  H  for help.\n" +
    "2lpPress  M  for mission.\n" +
    "2lpPress  Q  to  quit.\n" +
    "2lpPress  R  to restart.\n" +
//  "2lpPress  U  to toggle music on-off.\n" +
    "*rp<press Enter to continue>"

var pageHelp1 =
    "0cp- HELP -\n" +
    "2laSpin\n" +
    "1lpPress  Shift  and  arrow key(s)  to spin without\n" +
    "1lpmoving.\n" +
    "2laDiagonal Step\n" +
    "1lpPress the two compatible arrow keys.\n" +
    "2laDiagonal Step (safely)\n" +
    "1lp1) press  Shift  and hold it\n" +
    "1lp2) press and hold the two compatible arrow keys\n" +
    "1lp3) release  Shift  only\n" +
    "2loDiagonal steps are available only when necessary.\n" +
    "#rp<press Enter to continue>"

var pageHelp2 =
    "0cp- HELP -\n" +
    "2laSword Attack\n" +
    "1lpPress and *release*   Z  to attack with a sword.\n" +
    "2lpThis starts the aiming mode:  you can spin to any\n" +
    "1lpdirection, including diagonals, without pressing\n" +
    "1lpShift.\n" +
    "2lpWhen the aiming mode ends the attack happens.\n" +
    "2loMoving targets take more damage.\n" +
    "2laMissile Throwing\n" +
    "1lpIt works as sword attack but pressing  X .\n" +
    "#rp<press Enter to continue>"

var pageHelp3 =
    "0cp- HELP -\n" +
    "2laTorch\n" +
    "1lpPress  T  to light a torch.\n" +
    "2lpPress  T  again to amplify its light (reducing the\n" +
    "1lpdurability).\n" +
    "2lpPress  T  once more to extinguish the light.\n" +
    "2lpA torch lasts 120 seconds. Or 60 seconds with\n" +
    "1lpamplified light.\n" +
    "#rp<press Enter to continue>"

var pageHelp4 =
    "0cp- HELP -\n" +
    "2laPicking Up\n" +
    "1lpPress  C  to pick up an object under your feet.\n" +
    "2laName Position\n" +
    "1lpPress  N  to change position of name (or race) of\n" +
    "1lpcreatures.\n" +
    "2laTutorial Episodes\n" +
    "1lpTraining Day  and  Training Night  are good\n" +
    "1lpepisodes for learning and for remembering.\n" +
    "#rp<press Enter to continue>"

var __pageCharacters =
        "2la A À Á Ã Â B C D E É Ê F G H I Í J K L M N O Ó Õ Ô P Q" +
        "2la R S T U Ú V W X Y Z Ç W" +
        "2la a à á ã â b c d e é ê f g h i í j k l m n o ó õ ô p q" +
        "2la r s t u ú v w x y z ç" +
        "2la 0 1 2 3 4 5 6 7 8 9 . : , ; ( * ! ? ' ) & $ % - { } [ ] # @ = + < >"

// ### file: font.js ###

"use strict"

// for future languages: use canvas.context.fillText!

var fontAvatar
var fontOrion
var fontCaptain
var fontMMaster
var fontProgram
var fontJournal
var fontSmall
var fontDigit


function makeFonts() {
    //
    fontAvatar  = makeFont(LANGUAGE, colorGold)
    fontOrion   = makeFont(LANGUAGE, colorGreen2)
    fontCaptain = makeFont(LANGUAGE, colorBlue)
    fontMMaster = makeFont(LANGUAGE, colorTomato) // red
    fontProgram = makeFont(LANGUAGE, colorWhite)
    fontJournal = makeFont(LANGUAGE, colorWhite) // khaki
    //
    let base = fontProgram // helper font
    //
    if (LANGUAGE != "portuguese") { base = makeFont("portuguese", colorWhite) }
    //
    fontSmall = makeFontSmall(base)
    fontDigit = makeFontDigit(base)
}

// standard fonts /////////////////////////////////////////////////////////////

function makeFont(language, color)  {
    //
    let src = sprites["font-" + language]
    //
    if (color != colorWhite) {
        const clone = cloneImage(src)
        src = clone
        colorizeSprite(src, color)
    }
    //
    const font = { }
    //
    if (language == "portuguese") {
        //
        fillFontPortuguese(font, src)
    }
    else {
        //
        fillFontEnglish(font, src)
    }
    return font
}

function fillFontEnglish(font, img) {
    //
    fillFontWith(font, img, 0, "abcdefghijklmnopqrstuvwxyz ",
        [19,20,17,20,17,16,18,21,12,12,22,12,31,21,18,20,20,17,17,16,21,21,27,22,19,19,9])

    fillFontWith(font, img, 35, "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        [34,29,25,29,29,25,27,32,16,25,31,28,40,35,28,30,28,32,26,30,29,34,44,32,34,27])

    fillFontWith(font, img, 70, "0123456789.:,;(*!?')&$%-{}[]#@=+<>",
        [21,15,20,19,21,20,21,20,19,20,9,9,9,9,16,12,17,25,8,15,28,
         24,19,12,15,15,13,13,18,27,14,13,12,12])
}

function fillFontPortuguese(font, img) {
    //
    fillFontWith(font, img, 0, "AÀÁÃÂBCDEÉÊFGHIÍJKLMNOÓÕÔPQRSTUÚVWXYZÇ",
        [23,23,23,23,23,19,20,20,17,17,17,16,21,20,15,15,15,20,17,25,22,
         23,23,23,23,18,23,20,17,20,20,20,22,30,22,21,19,20])

    fillFontWith(font, img, 35, "aàáãâbcdeéêfghiíjklmnoóõôpqrstuúvwxyzç ",
        [18,18,18,18,18,18,17,19,19,19,19,16,20,18,11,12,13,19,10,26,18,
         19,19,19,19,18,19,15,16,16,18,18,20,26,20,20,17,17,10])

    fillFontWith(font, img, 70, "0123456789.:,;(*!?')&$%-{}[]#@=+<>",
        [19,15,19,19,20,18,18,19,18,19,11,11,12,12,13,19,11,17,10,14,23,
         18,28,14,15,15,13,13,22,26,18,18,18,18])
}

function fillFontWith(font, img, top, chars, widths) {
    //
    let left = 0
    //
    const off = chars.length
    //
    for (let n = 0; n < off; n++) {
        //
        const c = chars[n]
        font[c] = makeFontItem(img, left, top, widths[n])
        left += widths[n]
    }
}

function makeFontItem(img, left, top, width) {
    //
    const cnv = makeEmptyCanvas(width, 35)
    const ctx = cnv.getContext("2d")
    //
    ctx.drawImage(img, -left, -top)
    return cnv
}

// small font /////////////////////////////////////////////////////////////////

function makeFontSmall(base)  {
    //
    const font = { }
    //
    const keys = Object.keys(base)
    //
    for (const key of keys) {
        //
        const spr = base[key]
        font[key] = makeThisFontSmall(spr, 0.54)
    }
    // adjusting special cases
    font["i"] = enlargeThisFontSmall(font["i"], 1, 0)
    font["l"] = enlargeThisFontSmall(font["l"], 2, 1)
    font["!"] = enlargeThisFontSmall(font["!"], 2, 1)
    //
    return font
}

// digit font /////////////////////////////////////////////////////////////////

function makeFontDigit(base)  {
    //
    const font = { }
    //
    for (let n = 0; n < 10; n++) {
        //
        const key = "" + n
        font[key] = makeThisFontSmall(base[key], 0.66)
    }
    //
    return font
}

// helper /////////////////////////////////////////////////////////////////////

function makeThisFontSmall(spr, factor) {
    //
    const width  = Math.ceil(spr.width  * factor)
    const height = Math.ceil(spr.height * factor)
    //
    const cnv = makeEmptyCanvas(width, height)
    //
    cnv.getContext("2d").drawImage(spr, 0,0,spr.width,spr.height, 0,0,width,height)
    //
    return cnv
}

function enlargeThisFontSmall(spr, deltaWidth, left) {
    //
    const cnv = makeEmptyCanvas(spr.width + deltaWidth, spr.height)
    const ctx = cnv.getContext("2d")
    //
    ctx.drawImage(spr, left, 0)
    return cnv
}

// ### file: grid.js ###

"use strict"


var shallDrawGrid = false

function toggleGrid() {
    //
    shallDrawGrid = ! shallDrawGrid
}

function drawGrid() {
    //
    if (! shallDrawGrid) { return }
    //
    pictureCtx.lineWidth = 1
    pictureCtx.strokeStyle = "white"
    // grid is adjusted to avatar movement
    for (let top  = -30; top  < 660; top  += 60) { drawGridLine(-60,  top,  840, top) }
    for (let left =   0; left < 840; left += 60) { drawGridLine(left, -60, left, 660) }
}

function drawGridLine(x1, y1, x2, y2) {
    //
    pictureCtx.beginPath()
    pictureCtx.moveTo(x1 - pictureDeltaLeft, y1 - pictureDeltaTop)
    pictureCtx.lineTo(x2 - pictureDeltaLeft, y2 - pictureDeltaTop)
    pictureCtx.stroke()
}

// ### file: help.js ###

"use strict"

function openHelp() {
    //
    displayBlack(pageHelp1, ["enter"], showHelp2)
}

function showHelp2() {
    //
    displayBlack(pageHelp2, ["enter"], showHelp3)
}

function showHelp3() {
    //
    displayBlack(pageHelp3, ["enter"], showHelp4)
}

function showHelp4() {
    //
    displayBlack(pageHelp4, ["enter"], null)
}

// ### file: helper.js ###

"use strict"

// displacement ///////////////////////////////////////////////////////////////

const deltaRowFor = {
    //
    "north"     : -1,
    "south"     : +1,
    "east"      :  0,
    "west"      :  0,
    "northeast" : -1,
    "northwest" : -1,
    "southeast" : +1,
    "southwest" : +1
}

const deltaColFor = {
    //
    "north"     :  0,
    "south"     :  0,
    "east"      : +1,
    "west"      : -1,
    "northeast" : +1,
    "northwest" : -1,
    "southeast" : +1,
    "southwest" : -1
}

// direction //////////////////////////////////////////////////////////////////

const allDirections = [
    //
    "north",
    "northeast",
    "east",
    "southeast",
    "south",
    "southwest",
    "west",
    "northwest"
]

const simpleDirection = {
    //
    "north" : "north",
    "south" : "south",
    "east"  : "east",
    "west"  : "west",
    "northeast" : "east",
    "northwest" : "west",
    "southeast" : "east",
    "southwest" : "west"
}

/* reserved

const oppositeDirection = {
    "north" : "south",
    "south" : "north",
    "east"  : "west",
    "west"  : "east",
    "northeast" : "southwest",
    "northwest" : "southeast",
    "southeast" : "northwest",
    "southwest" : "northeast"
}

const neighbourDirections = {
    "north" : [ "northwest", "northeast" ],
    "south" : [ "southwest", "southeast" ],
    "east"  : [ "northeast", "southeast" ],
    "west"  : [ "northwest", "southwest" ],
    "northeast"  : [ "north", "east" ],
    "northwest"  : [ "north", "west" ],
    "southeast"  : [ "south", "east" ],
    "southwest"  : [ "south", "west" ]
}
*/

// colors /////////////////////////////////////////////////////////////////////

const colorGold   = [255, 215,   0, 255]
const colorGreen2 = [175, 255, 125, 255]
const colorTomato = [255,  99,  71, 255]
const colorWhite  = [255, 255, 255, 255]
const colorBlue   = [175, 238, 238, 255]

/* reserved
const colorBlack  = [  0,   0,   0, 255]
const colorBlue2  = [111, 255, 255, 255]
const colorGold2  = [255, 197,  56, 255]
const colorGray   = [224, 224, 224, 255]
const colorGreen  = [152, 251, 152, 255]
const colorGreen3 = [148, 222,  69, 255]
const colorGreen4 = [154, 255,  50, 255]
const colorKhaki  = [240, 230, 140, 255]
const colorKhaki2 = [223, 213, 155, 255]
const colorLilac  = [224, 183, 238, 255]
const colorNone   = [  0,   0,   0,   0]
const colorOlive  = [205, 207,  90, 255]
const colorOlive2 = [182, 211,  51, 255]
const colorOrange = [255, 145,   0, 255]
const colorRed    = [255,  20,  20, 255]
const colorSalmon = [255, 180, 107, 255]
*/

// fighting calc //////////////////////////////////////////////////////////////

function amongMinMax(min, max) {
    //
    const delta = (max - min) * Math.random()
    //
    return min + Math.round(delta)
}

function bonused50(max) {
    //
    let delta = Math.round(max * 0.5 * Math.random())
    //
    if (delta == 0) { delta = 1 }
    //
    return max + delta
}

// other //////////////////////////////////////////////////////////////////////

function SqrPoint(row, col) {
    //
    this.row = row
    //
    this.col = col
}

function randomItemFrom(list) {
    //
    const index = Math.floor(Math.random() * list.length)
    //
    return list[index]
}

/* reserved

function randomDirection() {
    return randomItemFrom(allDirections)
}

function randomIntegerAmong(min, max) {
    const delta = max - min
    return min + Math.round(Math.random() * delta)
}
*/

// ### file: info.js ###

"use strict"

var shallRoundTimes = true

function drawInfo() {
    //
    if (! DEVELOPMENT) { return }
    //
    pictureCtx.font = "bold 30px arial"
    pictureCtx.fillStyle = "white"
    //
    let txt = avatar.row + "  : " + avatar.col
    txt += "      " + avatar.direction
    //
    pictureCtx.fillText(txt, 20, 30)
    //
    pictureCtx.textAlign = "end"
    //
    if (shallRoundTimes) {
        pictureCtx.fillText(Math.round(avgExecTime), 770, 30)
        pictureCtx.fillText(Math.round(minExecTime), 770, 80)
        pictureCtx.fillText(Math.round(maxExecTime), 770, 130)
    }
    else {
        pictureCtx.fillText(Math.round(10 * avgExecTime) / 10, 770, 30)
        pictureCtx.fillText(Math.round(10 * minExecTime) / 10, 770, 80)
        pictureCtx.fillText(Math.round(10 * maxExecTime) / 10, 770, 130)
    }
    //
    let worst = "worst " + Math.round(10 * worstFps) / 10
    //
    if (worst.length < 10) { worst += ".0" }
    //
    pictureCtx.fillText(worst, 170, 600)
    //
    pictureCtx.textAlign = "start"
}

// ### file: keyboard.js ###

"use strict"

//   Keyboard does not accept double press of normal (arrow) keys.
//   It just raises key down event for the *LAST* pressed key.
//   Sends key up event for *ALL* keys that raised key down event.
//   If many normal keys are pressed at same time, not all of them
//   raise events.

var answerKeys   = []
var answerAction = null
var choosenAnswer = ""

var ctrlKeyPressed  = false
var altKeyPressed   = false
var shiftKeyPressed = false

var leftKeyPressed  = false
var upKeyPressed    = false
var rightKeyPressed = false
var downKeyPressed  = false

var spaceKeyPressed = false  // for editor


// init ///////////////////////////////////////////////////////////////////////

function initKeyboardListeners() {
    //
    document.onkeyup   = keyUpHandler
    document.onkeydown = mainKeyDownHandler
}

// key up handler general /////////////////////////////////////////////////////

function keyUpHandler(e) {
    //
    ctrlKeyPressed  = e.ctrlKey
    altKeyPressed   = e.altKey
    shiftKeyPressed = e.shiftKey
    //
    const low = e.key.toLowerCase()
    // console.log(low)
    if (low == " ")          { spaceKeyPressed = false; return false }
    if (low == "arrowup")    { upKeyPressed    = false; return false }
    if (low == "arrowdown")  { downKeyPressed  = false; return false }
    if (low == "arrowleft")  { leftKeyPressed  = false; return false }
    if (low == "arrowright") { rightKeyPressed = false; return false }
    //
    return false
}

// key down handler general ///////////////////////////////////////////////////

function mainKeyDownHandler(e) {
    //
    if (e.repeat) { return false } // necessary: makes all keyboards work the same way; avoids bugs!!!!!!
    //
    shiftKeyPressed = e.shiftKey
    ctrlKeyPressed  = e.ctrlKey
    altKeyPressed   = e.altKey
    //
    const low = e.key.toLowerCase()
    // console.log(low)
    //
    if (low == "escape"  &&  e.shiftKey) { return true } // so Chrome monitor can be opened
    if (low == "f5"  &&  DEVELOPMENT) { return true }
    if (low == "f11") { return true }
    if (low == "f12") { return true }
    if (low == "-"  &&  e.ctrlKey) { return true }
    if (low == "+"  &&  e.ctrlKey) { return true }
    if (low == "="  &&  e.ctrlKey) { return true }
    if (low == "j"  &&  e.ctrlKey  &&  e.shiftKey) { return true }
    if (low == "u"  &&  e.ctrlKey) { return true }
    //
    mainKeyDownHandler2(low)
    //
    return false
}

function mainKeyDownHandler2(low) {
    // console.log(low)
    //
    if (displayStatus != "no-display") { keyDownHandlerDisplay(low); return }
    //
    if (low == "arrowup")    { upKeyPressed    = true; return }
    if (low == "arrowdown")  { downKeyPressed  = true; return }
    if (low == "arrowleft")  { leftKeyPressed  = true; return }
    if (low == "arrowright") { rightKeyPressed = true; return }
    //
    if (low == " ")  { spaceKeyPressed = true }
    //
    if (DEVELOPMENT  &&  low == "tab") { testTAB(); return }
    if (DEVELOPMENT  &&  low == ";") { toggleGrid(); return }
    if (DEVELOPMENT  &&  low == "1") { test1(); return }
    if (DEVELOPMENT  &&  low == "2") { test2(); return }
    if (DEVELOPMENT  &&  low == "3") { test3(); return }
    if (DEVELOPMENT  &&  low == "4") { test4(); return }
    if (DEVELOPMENT  &&  low == "5") { test5(); return }
    if (DEVELOPMENT  &&  low == "6") { test6(); return }
    if (DEVELOPMENT  &&  low == "7") { test7(); return }
    if (DEVELOPMENT  &&  low == "8") { test8(); return }
    if (DEVELOPMENT  &&  low == "9") { test9(); return }
    if (DEVELOPMENT  &&  low == "0") { test0(); return }
    //
    keyDownHandlerGame(low)
}

// for display ////////////////////////////////////////////////////////////////

function keyDownHandlerDisplay(low) {
    if (displayStatus == "waiting-init") { return }
    if (displayStatus == "increasing-alpha") { return }
    if (displayStatus == "decreasing-alpha") { return }
    if (! answerKeys.includes(low)) { return }
    //
    if (displayBgKind == "black"  ||  displayBgKind == "stone") {
        if (answerAction != null) { answerAction(low) } else { dismissDisplay() }
        return
    }
    // displayBgKind == "game"  ||  displayBgKind == "cinematic"
    choosenAnswer = low
    displayStatus = "decreasing-alpha"
}

// for game ///////////////////////////////////////////////////////////////////

function keyDownHandlerGame(low) {
    //
    if (low == "n") { toggleNameOnTop(); return }
    if (low == "f5")     { openMenu(); return }
    if (low == "enter")  { openMenu(); return }
    if (low == "escape") { freezeForDevelopment(); return }
    //
    if (avatar.disabled) { return }
    //
    if (low == " ") { setAvatarHotkeyAction(avatarDrinkHealthPotion); return }
    if (low == "a") { setAvatarHotkeyAction(avatarDrinkAntidotePotion); return }
    if (low == "c") { setAvatarHotkeyAction(avatarPickUp); return }
 // if (low == "l") { setAvatarHotkeyAction(openScroll); return }
    if (low == "m") { setAvatarHotkeyAction(avatarDrinkManaPotion); return }
    if (low == "p") { setAvatarHotkeyAction(avatarTryThrowPurpleBubble); return }
    if (low == "s") { setAvatarHotkeyAction(avatarDrinkSpeedOil); return }
    if (low == "t") { setAvatarHotkeyAction(avatarToggleTorchStatus); return }
    if (low == "x") { setAvatarHotkeyAction(avatarTryThrowSpear); return }
    if (low == "z") { setAvatarHotkeyAction(avatarTryMeleeAttack); return }
}

// ### file: light-create.js ###

"use strict"

// old algorithm was slow because of often calls to getImageData (wich is slow by nature)

/*
    light VIRTUAL table:
        19 rows: 4 + 5 + avatar + 5 + 4
        21 cols: 4 + 6 + avatar + 6 + 4
*/


var bonfireLight // 9 x 9 squares, 540 x 540 source (big image for on demand processing)

var lights = { } // { (deltaLeft,deltaTop): (56*56 img *data*) }; for bonfires
                 // 54+2px x 54+2px  (2px is for borders; 1px per side; for displaced drawing by walk)


var lightScreen   // 78 x 64    (10 x 10 smaller than picture)
var lightScreenCtx
var lightScreenImageData

var torchLightDataOff  // *data* 78 x 64 px (ready to use)
var torchLightDataOn // *data* 78 x 64 px (ready to use)
var torchLightDataPlus // *data* 78 x 64 px (ready to use)


// init ///////////////////////////////////////////////////////////////////////

function initLight() {
    lightScreen = makeEmptyCanvas(78, 64)
    lightScreenCtx = lightScreen.getContext("2d")
    lightScreenImageData = lightScreenCtx.getImageData(0, 0, 78, 64)
    //
    bonfireLight = makeBonfireLight()
    torchLightDataOff  = makeTorchLightOff().getContext("2d").getImageData(0, 0, 78, 64).data
    torchLightDataOn   = makeTorchLightOn().getContext("2d").getImageData(0, 0, 78, 64).data
    torchLightDataPlus = makeTorchLightPlus().getContext("2d").getImageData(0, 0, 78, 64).data
}

// make bonfire light /////////////////////////////////////////////////////////

function makeBonfireLight() {
    const cnv = makeEmptyCanvas(540, 540)
    const ctx = cnv.getContext("2d")
    //
    const grd = ctx.createRadialGradient(270,270,0, 270,270,270)
    grd.addColorStop(0.0, "rgba(0,0,0,0.0)")
 // grd.addColorStop(0.3, "rgba(0,0,0,0.1)")
    grd.addColorStop(0.7, "rgba(0,0,0,0.7)")
    grd.addColorStop(0.9, "rgba(0,0,0,1.0)")
    //
    ctx.fillStyle = grd
    ctx.fillRect(0,0,540,540)
    //
    return cnv
}

// make torch light off ///////////////////////////////////////////////////////

function makeTorchLightOff() {
    const cnv = makeEmptyCanvas(780, 640)
    const ctx = cnv.getContext("2d")
    //
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, 780, 640)
 // ctx.clearRect(360, 220, 60, 100) // more light
    ctx.clearRect(365, 215, 50, 90)
    //
    const cnv2 = makeEmptyCanvas(78,64)
    const ctx2 = cnv2.getContext("2d")
    ctx2.filter = "blur(3px)"
    ctx2.drawImage(cnv, 0,0,780,640, 0,0,78,64)
    ctx2.filter = "none"
    // filling sides (necessary because blur filter was used)
    ctx2.fillStyle = "black"
    ctx2.fillRect(0,  0, 78, 10) // top
    ctx2.fillRect(0, 54, 78, 10) // bottom
    ctx2.fillRect( 0, 0, 10, 64) // left
    ctx2.fillRect(68, 0, 10, 64) // right
    //
    return cnv2
}

// make torch light weak //////////////////////////////////////////////////////

/* unused
function makeTorchLightWeak() {
    const cnv = makeEmptyCanvas(780, 640)
    const ctx = cnv.getContext("2d")
    //
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, 780, 640)
    ctx.clearRect(190, 120, 400, 400)
    ctx.drawImage(bonfireLight, 0,0,540,540, 190,120,400,400)
    //
    const cnv2 = makeEmptyCanvas(78, 64)
    const ctx2 = cnv2.getContext("2d")
    ctx2.drawImage(cnv, 0,0,780,640, 0,0,78,64)
    //
    return cnv2
}
*/

// make torch light average ///////////////////////////////////////////////////

function makeTorchLightOn() {
    const cnv = makeEmptyCanvas(780, 640)
    const ctx = cnv.getContext("2d")
    //
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, 780, 640)
    ctx.clearRect(120, 50, 540, 540)
    ctx.drawImage(bonfireLight, 120, 50)
    //
    const cnv2 = makeEmptyCanvas(78, 64)
    const ctx2 = cnv2.getContext("2d")
    ctx2.drawImage(cnv, 0,0,780,640, 0,0,78,64)
    //
    return cnv2
}

// make torch light full //////////////////////////////////////////////////////

function makeTorchLightPlus() {
    const cnv = makeEmptyCanvas(240, 200)
    const ctx = cnv.getContext("2d")
    //
    const rayA = 15
    const rayB = 90
    //
    const grd = ctx.createRadialGradient(120,100,rayA, 120,100,rayB)
    grd.addColorStop(0.0, "rgba(0,0,0,0)")
    grd.addColorStop(0.5, "rgba(0,0,0,0.5)")
    grd.addColorStop(1.0, "black")
    //
    ctx.fillStyle = grd
    ctx.fillRect(0,0,240,200)
    //
    const cnv2 = makeEmptyCanvas(78, 64)
    const ctx2 = cnv2.getContext("2d")
    ctx2.drawImage(cnv, 0,0,240,200, -10,-10,98,84) // ok!
    //
    return cnv2
}

// serve (reduced) bonfire light on demand ////////////////////////////////////

function getLightData(deltaLeft, deltaTop) {
    if (deltaLeft == -0) { deltaLeft = 0 } // happens when rounding small negative number
    if (deltaTop  == -0) { deltaTop  = 0 } // happens when rounding small negative number
    //
    const key = "" + deltaLeft + "," + deltaTop
    let data = lights[key]
    if (data != undefined) { return data }
    //
    data = createLightData(deltaLeft, deltaTop)
    lights[key] = data
    return data
}

function createLightData(deltaLeft, deltaTop) {
    const big = makeEmptyCanvas(560,560)
    const bigCtx = big.getContext("2d")
    bigCtx.fillStyle = "black"
    bigCtx.fillRect(0, 0, 560, 560)
    bigCtx.clearRect(20, 20, 520, 520)
    bigCtx.drawImage(bonfireLight, deltaLeft, deltaTop)
    //
    const cnv = makeEmptyCanvas(56,56)
    const ctx = cnv.getContext("2d")
    ctx.drawImage(big, 0,0,560,560, 0,0,56,56)
    return ctx.getImageData(0, 0, 56, 56).data
}

// ### file: light-draw.js ###

"use strict"

// draw light /////////////////////////////////////////////////////////////////

function drawLight() {
// startTiming()
    resetLightScreen()  // direct on data
    drawBonfireLights() // direct on data
    blurLightScreen()   // direct on data
    lightScreenCtx.putImageData(lightScreenImageData, 0, 0)
    pictureCtx.drawImage(lightScreen, 0,0,78,64,  0,0,780,640)
// endTiming()
}

// reset light screen /////////////////////////////////////////////////////////

function resetLightScreen() { // direct on data // uses torchOn or torchOff
    const width  = 78
    const height = 64
    const data = lightScreenImageData.data
    const srcdata = lightDataForReset()
    //
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let index = 4 * (y * width + x)
            data[index + 3] = srcdata[index + 3]
        }
    }
}

function lightDataForReset() {
    if (avatarTorchStatus == "off") { return torchLightDataOff }
    //
    if (isTorchInDarkPhase()) { return torchLightDataOff }
    //
    if (avatarTorchStatus == "on")  { return torchLightDataOn }
    //
    return torchLightDataPlus
}

function isTorchInDarkPhase() {
    const factor = (avatarTorchStatus == "plus") ? 1 : 0.5
    if (avatarTorchLife > 300 * factor) { return false  }
    if (avatarTorchLife > 275 * factor) { return true }
    if (avatarTorchLife > 200 * factor) { return false  }
    if (avatarTorchLife > 175 * factor) { return true }
    if (avatarTorchLife > 100 * factor) { return false  }
    if (avatarTorchLife >  75 * factor) { return true }
    return false
}

// blur light screen //////////////////////////////////////////////////////////

function blurLightScreen() {
    const width  = 78
    const height = 64
    //
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            blurLightScreenPixel(x, y)
        }
    }
}

function blurLightScreenPixel(x, y) { //dirty algorithm
    const width  = 78
    const data   = lightScreenImageData.data
    //
    const index = 4 * (y * width + x)
    const base  = data[index + 3]
    const factor = 1 / 4
    const d = 3 // distance
    //
    let res = 0
    res += getAlphaAt(x    , y - d, base, data) * factor // north
    res += getAlphaAt(x    , y + d, base, data) * factor // south
    res += getAlphaAt(x - d, y    , base, data) * factor // west
    res += getAlphaAt(x + d, y    , base, data) * factor // east
    //
    data[index + 3] = Math.floor(res)
}

function getAlphaAt(x, y, base, data) {
    const width  = 78
    const height = 64
    //
    if (x < 0) { return base }
    if (y < 0) { return base }
    if (x >= width)  { return base }
    if (y >= height) { return base }
    //
    const index = 4 * (y * width + x)
    return data[index + 3]
}

// draw bonfire lights ////////////////////////////////////////////////////////

function drawBonfireLights() { // direct on data
    const rowAdjust = avatar.row -  9
    const colAdjust = avatar.col - 10
    // virtual table
    for (let row = 0; row < 19; row++) {
        for (let col = 0; col < 21; col++) {
            const sqr = getSquare(row + rowAdjust, col + colAdjust)
            // light (virtual) table must be bigger than picture table
            // because bonfire lights are large (9 x 9 squares);
            // must adjust row and col (from light table to picture table):
            drawBonfireLight(sqr, row-3, col-2)
        }
    }
}

function drawBonfireLight(sqr, row, col) {
    if (sqr == null) { return }
    let ok = false
    if (sqr.layerB == "bonfire") { ok = true }
    if (sqr.layerB == "blufire") { ok = true }
    if (ok) { drawBonfireLight2(row, col) }
}

function drawBonfireLight2(row, col) { // row and col of the canvas (not the map)
    let left = (col * 60) - 120 - pictureDeltaLeft
    let top  = (row * 60) -  90 - pictureDeltaTop
    // adjusting coordinates to 9X9 squares image
    left -= 240
    top  -= 240
    // setting coordinates for reduced screen
    const rLeft = Math.floor(left / 10)
    const rTop  = Math.floor(top  / 10)
    // setting micro deltas (0 to 9 pixels each one)
    let deltaLeft = left % 10
    let deltaTop  = top  % 10
    //
    if (deltaLeft < 0) { deltaLeft += 10 } // really needed
    if (deltaTop  < 0) { deltaTop  += 10 } // really needed
    //
    const data = getLightData(deltaLeft, deltaTop)
    pasteBonfireLight(data, rLeft, rTop)
}

function pasteBonfireLight(srcdata, startX, startY) {
    const width  = 56
    const height = 56
    //
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = 4 * (y * width + x)
            pasteBonfirePixel(x + startX, y + startY, srcdata[index+3])
        }
    }
}

function pasteBonfirePixel(x, y, alpha) {
    const width  = 78
    const height = 64
    if (x < 0) { return }
    if (y < 0) { return }
    if (x >= width)  { return }
    if (y >= height) { return }
    //
    const data = lightScreenImageData.data
    const index = 4 * (y * width + x)
    const old = data[index + 3]
    //
    data[index + 3] = Math.min(old, alpha)
}

// ### file: MAIN-LOOP.js ###

"use strict"

var LOOP = 0 // number of current loop of game //

var previousTimeStamp = 0

var shallRunCoreLoop = false

function runMainLoop(timeStamp) {
    //
    const elapsed = timeStamp - previousTimeStamp
    //
    if (elapsed < 30) { requestAnimationFrame(runMainLoop); return }
    //
    previousTimeStamp = timeStamp
    //
    startTiming()
    //
    if (shallRunCoreLoop) { runCoreLoop() }
    //
    drawDisplay()
    //
    endTiming()
    //
    requestAnimationFrame(runMainLoop)
}

function runCoreLoop() {
    //
    LOOP += 1
    //
    updateSomething() // exceptional
    //
    updateSchedule()
    //
    updateAvatarTorch()
    //
    updateShots()
    //
    updateMonsters()
    //
    if (orion) { updateCreature(orion) }
    //
    updateCreature(avatar) // in this loop: Orion will not be killed after Avatar enters portal
    //
    updateAnimation()
    //
    updateCreaturesBmp()
    //
    drawPicture()
}

function freezeGame() {
    shallRunCoreLoop = false
}

function unfreezeGame() {
    shallRunCoreLoop = true
}

// ### file: main.js ###

"use strict"

var EPISODE = "EPISODE"

var MAP = "MAP"

var LANGUAGE = "english"

var TITLE = "TITLE"

var DEVELOPMENT = false

var DARKNESS = false

var FAILURE = false // avoids running the failure script twice; helpful for success checks

const LOOP_DURATION_IN_MS = 1000 / 30 // 30 FPS

// init & config //////////////////////////////////////////////////////////////

function main() {
    //
    if (window.location.origin == "http://localhost:8080") { DEVELOPMENT = true }
    //
    if (! hasGoodOrigin()) { goHome(); return }
    //
    document.body.onselectstart = function () { return false }
    //
    setBasicConfig()
    overrideByLanguage()
    translateMainPages()
    main2()
}

function main2() {
    // the order is important
    initPicture()
    resetPictureTopMargin()
    window.onresize = resetPictureTopMargin
    //
    INTERNET = "loading" // must come first
    httpShowLoadingMessage("")
    //
    main3()
}

// loading ////////////////////////////////////////////////////////////////////

function main3() { // to be overwritten by editor
    //
    loadSprites()
    loadMap("/maps/" + MAP + ".map")
    //
    waitFinishLoading()
}

function waitFinishLoading() {
    //
    if (spritesAreReady  &&  tableIsReady) { afterLoading(); return }
    //
    setTimeout(waitFinishLoading, 30)
}

// after loading //////////////////////////////////////////////////////////////

function afterLoading() {
    //
    window.onbeforeunload = basicOnBeforeUnload
    //
    INTERNET = "done"
    //
    initDisplay()
    initMusic()
    initCreatures()
    initDirectionsAI()
    initSeek()
    initLight()
    setAltarsAuto()
    setPortalsAuto()
    setEpisodeObjects()
    setEpisodeCreatures()
    setEpisodeTriggers()
    setEpisodePages()
    initKeyboardListeners() // shall be the last to init
    //
    console.log("the game loop starts now")
    runMainLoop()
    scriptTitle()
}

// window.location.href ///////////////////////////////////////////////////////

function hasGoodOrigin() {
    // home page already checked game episode and not framed
    if (DEVELOPMENT) { return true }
    //
    if (document.referrer == window.location.href) { return true } // episode was restarted
    //
    const s = document.referrer.replace(window.location.protocol + "//", "")
    const hostname = "lostinmaze.com"
    return s.startsWith(hostname)
}

function restart() {
    //
    window.onbeforeunload = function () { }
    //
    const uri = window.location.href
    //
    window.top.location = uri
}

function goHome() {
    //
    window.onbeforeunload = function () { }
    //
    const a = DEVELOPMENT ? "/" : window.location.protocol + "//www.lostinmaze.com/"
    //
    const b = (LANGUAGE == "english") ? "" : LANGUAGE + "/"
    //
    const uri = a + b + "index"
    //
    window.top.location = uri
}

// for restart by mouse click on browser header;
// overrided by editor
function basicOnBeforeUnload() {
    //
    return (DEVELOPMENT ? null : "Are you sure?")
}

// ### file: mainbar.js ###

"use strict"

var mainbarCtx // set by sprites-reform1.js"

var shallUpdateMainBar = false


function setMainbarCtx(ctx) {
    mainbarCtx = ctx
}

function maybeUpdateMainBar() {
    if (! shallUpdateMainBar) { return }
    shallUpdateMainBar = false
    updateMainBar()
}

function updateMainBar() {
    mainbarCtx.drawImage(sprites["main-bar-raw"], 0, 0)
    //
    drawHealthPotion()
    drawAntidote()
    drawSpeedOil()
    drawManaPotion()
 // drawStrengthElixir()
    drawInvisibleTea()
    drawArmor()
    drawSword()
    drawSpear()
    drawShield()
    drawPurpleBubble()
    drawManaShield()
    drawScroll()
    drawTorch()
    drawWoodenKey()
    drawIronKey()
    drawCopperKey()
    drawBrightGem()
    drawAvatarLife()
    //
    shallUpdateMainBar = false
}

// components /////////////////////////////////////////////////////////////////

function drawHealthPotion() {
    if (avatar.healthPotions == 0) { return }
    mainbarCtx.drawImage(sprites["icon-health-potion"], 2, 3)
    drawSlotAmmount(avatar.healthPotions, 36, 15)
}

function drawAntidote() {
    if (avatar.antidotePotions == 0) { return }
    mainbarCtx.drawImage(sprites["icon-antidote-potion"], 46, 3)
    drawSlotAmmount(avatar.antidotePotions, 72, 15)
}

function drawSpeedOil() {
    if (avatar.speedOils == 0) { return }
    mainbarCtx.drawImage(sprites["icon-speed-oil"], 82, 3)
    drawSlotAmmount(avatar.speedOils, 114, 15)
}

function drawManaPotion() {
    if (avatar.manaPotions == 0) { return }
    mainbarCtx.drawImage(sprites["icon-mana-potion"], 125, 3)
    drawSlotAmmount(avatar.manaPotions, 160, 15)
}

/*
function drawStrengthElixir() {
    if (avatarStrengthElixirs == 0) { return }
    mainbarCtx.drawImage(sprites["icon-strength-elixir"], 160, 3)
    drawSlotAmmount(avatarStrengthElixirs, 195, 15)
}
*/

function drawInvisibleTea() {
    if (avatar.invisibleTeas == 0) { return }
    mainbarCtx.drawImage(sprites["icon-invisible-tea"], 170, 3)
    drawSlotAmmount(avatar.invisibleTeas, 202, 15)
}

function drawArmor() {
    if (avatarArmor == "none") { return }
    mainbarCtx.drawImage(sprites["icon-armor"], 255, 3)
}

function drawSword() {
    if (avatarMeleeWeapon == "none") { return }
    mainbarCtx.drawImage(sprites["icon-sword"], 290, 3)
}

function drawSpear() {
    if (avatar.spears == 0) { return }
    mainbarCtx.drawImage(sprites["icon-spear"], 325, 3)
    drawSlotAmmount(avatar.spears, 350, 15)
}

function drawShield() {
    if (avatarShield == "none") { return }
    mainbarCtx.drawImage(sprites["icon-shield"], 355, 3)
}

function drawPurpleBubble() {
    if (avatar.purpleBubbles == 0) { return }
    mainbarCtx.drawImage(sprites["icon-purple-bubble"], 415, 3)
    drawSlotAmmount(avatar.purpleBubbles, 453, 15)
}

function drawManaShield() {
    if (avatar.manaShield == 0) { return }
    mainbarCtx.drawImage(sprites["icon-mana-shield"], 460, 3)
    drawSlotAmmount(avatar.manaShield, 495, 15)
}

function drawScroll() {
    if (! avatarHasScroll) { return }
    mainbarCtx.drawImage(sprites["icon-scroll"], 505, 3)
}

function drawTorch() {
    if (avatar.torches == 0) { return }
    const id = (avatarTorchStatus == "off") ? "icon-torch-grey" : "icon-torch"
    mainbarCtx.drawImage(sprites[id], 555, 3)
    drawSlotAmmount(avatar.torches, 580, 15)
}

function drawWoodenKey() {
    if (! avatarWoodenKey) { return }
    mainbarCtx.drawImage(sprites["icon-wooden-key"], 590, 3)
}

function drawIronKey() {
    if (! avatarIronKey) { return }
    mainbarCtx.drawImage(sprites["icon-iron-key"], 630, 3)
}

function drawCopperKey() {
    if (! avatarCopperKey) { return }
    mainbarCtx.drawImage(sprites["icon-copper-key"], 670, 3)
}

function drawBrightGem() {
    if (! avatarBrightGem) { return }
    mainbarCtx.drawImage(sprites["icon-bright-gem"], 710, 3)
}

function drawAvatarLife() {
    drawSlotAmmount(avatar.life, 780, 15)
}

// helpers ////////////////////////////////////////////////////////////////////

function drawSlotAmmount(val, x, y) {
    const txt = "" + val
    for (const c of txt) {
        if (c == "1") { x -= 9 } else { x -= 12 }
    }
    drawSlotAmmount2(txt, x, y)
}

function drawSlotAmmount2(txt, x, y) {
    let left = 0
    for (const c of txt) {
        const spr = fontDigit[c]
        mainbarCtx.drawImage(spr, x + Math.floor(left), y)
        left += spr.width - 1.33 // writing characters close
    }
}

// ### file: menu.js ###

"use strict"

var messagesForRestart = [
    "So... you have no idea!",
    "It is not that easy!",
    "Oh, no! Again?",
    "You don't give up?",
    "Just one more time, right?",
    "Don't let me down! Hehehe...",
    "I think you should call your mom."
]

///////////////////////////////////////////////////////////////////////////////

function openMenu() {
    const text = pageMenu
    const keys = ["h", "m", "q", "r", "enter"]
    displayBlack(text, keys, openMenu2)
}

function openMenu2(answer) {
    if (answer == "h") { openHelp(); return }
    if (answer == "m") { showMission(); return }
    if (answer == "q") { menuQuit(); return }
    if (answer == "r") { menuRestart(); return }
 // answer == "enter"
    dismissDisplay()
}

///////////////////////////////////////////////////////////////////////////////

function showMission() {
    displayBlack(pageMission, ["enter"], null)
}

///////////////////////////////////////////////////////////////////////////////

function menuRestart() {
    const msg = randomItemFrom(messagesForRestart)
    const text = pageRestart.replace("@sarcasm@", translate(msg))
    displayBlack(text, ["r", "enter"], confirmRestart)
}

function confirmRestart(answer) {
    if (answer == "r") { restart() } else { dismissDisplay() }
}

///////////////////////////////////////////////////////////////////////////////

function menuQuit() {
    displayBlack(pageQuit, ["q", "enter"], confirmQuit)
}

function confirmQuit(answer) {
    if (answer == "q") { goHome() } else { dismissDisplay() }
}

// ### file: OVERRIDABLE.js ###

"use strict"

// to be overwritten by the episode code

function setBasicConfig() { }

function overrideByLanguage() { }

function translateMainPages() { }

function translate(txt) { return txt }

function updateSomething() { }

function setEpisodePages() { }

function setEpisodeObjects() { }

function setEpisodeTriggers() { }

function setEpisodeCreatures() { }

function runOverture() { }

function skipOverture() {
    dismissDisplay()
    avatar.visible = true
}

function runEnterPortal() { scriptSuccess(pageSuccess) }

// ### file: path-approach.js ###

"use strict"

// for target that isn't close

// conditions already checked in creature script


function anyApproach(creature, targetRow, targetCol) {
    const ok = safeApproach(creature, targetRow, targetCol)
    if (ok) { return }
    panicApproach(creature, targetRow, targetCol)
}

function safeApproach(creature, targetRow, targetCol) {
    respectFields()
    return coreApproach(creature, targetRow, targetCol)
}

function panicApproach(creature, targetRow, targetCol) { // ignores fields
    ignoreFields()
    return coreApproach(creature, targetRow, targetCol)
}

function coreApproach(creature, targetRow, targetCol) {
    const direction = directionToApproach(creature, targetRow, targetCol)
    //
    if (direction == "") { return false }
    //
    if (direction != creature.direction) { spin(creature, direction) }
    move(creature)
    return true
}

function directionToApproach(creature, targetRow, targetCol) {
    let direction = directionForSmart(creature, targetRow, targetCol)
    if (direction != "") { return direction }
    //
    direction = directionForSeek(creature, targetRow, targetCol)
    if (direction != "") { return direction }
    //
    direction = directionForChase(creature, targetRow, targetCol)
    if (direction != "") { return direction }
    //
    return ""
}

// ### file: path-chase.js ###

"use strict"

// chase works as 'walk' inside a 3x3 square centered on target

// chase is excelent for autosolve small obstacles,
// gives the sensation of holding position and
// introduces some uncertainty, while being very fast
// but for a simple hunt it is not best because it does not seek the center position


function chase(creature) {
    if (! readyToMove(creature)) { return }
    //
    const direction = directionForChase(creature, creature.target.row, creature.target.col)
    if (direction == "") { return }
    //
    if (direction != creature.direction) { spin(creature, direction) }
    move(creature)
}

function directionForChase(creature, targetRow, targetCol) { // 25 ms for 100k executions
    const top  = targetRow - 1
    const left = targetCol - 1
    const bottom = targetRow + 1
    const right  = targetCol + 1
    //
    return directionForWalk(creature, top, left, bottom, right)
}

// ### file: path-close.js ###

"use strict"

// this algorithm:
//      is only for close target
//      does not walk away from target
//
// conditions already checked in module creature-script


function moveClose(creature, targetRow, targetCol) {
    respectFields() // monster is already close to target, do not need to step on dangerous field!
    //
    const direction = directionForMoveClose(creature, targetRow, targetCol)
    if (direction == "") { return }
    //
    if (direction != creature.direction) { spin(creature, direction) }
    move(creature)
}

// direction //////////////////////////////////////////////////////////////////

function directionForMoveClose(creature, targetRow, targetCol) { // 20 ms for 100k executions
    setDirectionValuesForMoveClose(creature.row, creature.col, targetRow, targetCol) // ignores invalid moves
    overrideInvalidDirectionValues(creature)
    return getAnyBestDirection()
}

function setDirectionValuesForMoveClose(homeRow, homeCol, targetRow, targetCol) {
    // basic values:
    // -9: creature walks away and loses contact
    //  0: creature walks without lose contact (diagonals are no better than orthogonals)
    //
    if (targetRow < homeRow) { // target is to north
        valueNorth = 0
        valueSouth = -9
    }
    else if (targetRow > homeRow) { // target is to south
        valueNorth = -9
        valueSouth = 0
    }
    else { // creature and target are on same row
        valueNorth = 0
        valueSouth = 0
    }
    //
    if (targetCol < homeCol) { // target is to west
        valueEast = -9
        valueWest = 0
    }
    else if (targetCol > homeCol) { // target is to east
        valueEast = 0
        valueWest = -9
    }
    else { // creature and target are on same col
        valueEast = 0
        valueWest = 0
    }
    //
    valueNorthEast = valueNorth + valueEast
    valueNorthWest = valueNorth + valueWest
    valueSouthEast = valueSouth + valueEast
    valueSouthWest = valueSouth + valueWest
}

// ### file: path-directions.js ###

"use strict"

// checks blocked (all) directions and viable diagonals

// somewhere else values are applied to (desired) directions,
// here, restrictions (-9) are applied to (forbidden) directions


var valueNorth = 0
var valueSouth = 0
var valueEast  = 0
var valueWest  = 0
var valueNorthEast = 0
var valueNorthWest = 0
var valueSouthEast = 0
var valueSouthWest = 0


var directionsAI = [ ] // list of lists

var freeNorth = false
var freeSouth = false
var freeEast  = false
var freeWest  = false
var freeNorthEast = false
var freeNorthWest = false
var freeSouthEast = false
var freeSouthWest = false

var viableNorthEast = false
var viableNorthWest = false
var viableSouthEast = false
var viableSouthWest = false


// init ///////////////////////////////////////////////////////////////////////

function initDirectionsAI() {
    for (let n = 0; n < 256; n++) { fillDirectionsAIOnce(n) }
}

function fillDirectionsAIOnce(n) {
    const list = [ ]
    //
    if (n >= 128) { n -= 128; list.unshift("southwest") }
    if (n >=  64) { n -=  64; list.unshift("southeast") }
    if (n >=  32) { n -=  32; list.unshift("northwest") }
    if (n >=  16) { n -=  16; list.unshift("northeast") }
    if (n >=   8) { n -=   8; list.unshift("west") }
    if (n >=   4) { n -=   4; list.unshift("east") }
    if (n >=   2) { n -=   2; list.unshift("south") }
    if (n >=   1) { list.unshift("north") }
    //
    directionsAI.push(list)
}

// misdirect (not AI) /////////////////////////////////////////////////////////

function calcMisdirection(creature) {
    valueNorth = 0
    valueSouth = 0
    valueEast  = 0
    valueWest  = 0
    valueNorthEast = 0
    valueNorthWest = 0
    valueSouthEast = 0
    valueSouthWest = 0
    //
    overrideInvalidDirectionValues(creature)
    return getAnyBestDirection()
}

// reset //////////////////////////////////////////////////////////////////////

function overrideInvalidDirectionValues(creature) {
    resetFreeDirections(creature, creature.row, creature.col)
    resetViableDiagonals()
    resetInvalidDirectionValues()
}

// reset core /////////////////////////////////////////////////////////////////

function resetFreeDirections(creature, row, col) {
    freeNorth = isFreeSquareFor(creature, row - 1, col)
    freeSouth = isFreeSquareFor(creature, row + 1, col)
    freeEast  = isFreeSquareFor(creature, row, col + 1)
    freeWest  = isFreeSquareFor(creature, row, col - 1)
    //
    freeNorthEast = isFreeSquareFor(creature, row - 1, col + 1)
    freeNorthWest = isFreeSquareFor(creature, row - 1, col - 1)
    freeSouthEast = isFreeSquareFor(creature, row + 1, col + 1)
    freeSouthWest = isFreeSquareFor(creature, row + 1, col - 1)
}

function resetViableDiagonals() {
    viableNorthEast = true
    viableNorthWest = true
    viableSouthEast = true
    viableSouthWest = true
    // avoiding luxury diagonals and blocked diagonals
    if (freeNorth  ||  freeEast  || ! freeNorthEast) { viableNorthEast = false }
    if (freeNorth  ||  freeWest  || ! freeNorthWest) { viableNorthWest = false }
    if (freeSouth  ||  freeEast  || ! freeSouthEast) { viableSouthEast = false }
    if (freeSouth  ||  freeWest  || ! freeSouthWest) { viableSouthWest = false }
}

function resetInvalidDirectionValues() {
    if (! freeNorth) { valueNorth = -9 }
    if (! freeSouth) { valueSouth = -9 }
    if (! freeEast)  { valueEast  = -9 }
    if (! freeWest)  { valueWest  = -9 }
    // avoiding luxury diagonals and blocked diagonals
    if (! viableNorthEast) { valueNorthEast = -9 }
    if (! viableNorthWest) { valueNorthWest = -9 }
    if (! viableSouthEast) { valueSouthEast = -9 }
    if (! viableSouthWest) { valueSouthWest = -9 }
}

// best ///////////////////////////////////////////////////////////////////////

function getAnyBestDirection() {
    const directions = getBestDirections()
    if (directions == null) { return "" }
    return randomItemFrom(directions)
}

function getThisBestDirection(direction) {
    const directions = getBestDirections()
    if (directions == null) { return "" }
    //
    for (const direc of directions) {
        if (direc == direction) { return direction }
    }
    //
    return randomItemFrom(directions)
}

// best core //////////////////////////////////////////////////////////////////

function getBestDirections() {
    const best = findBestDirectionValue()
    if (best == -9) { return null } // no viable direction
    return getBestDirectionsCore(best)
}

function findBestDirectionValue() {
    let best = -9
    if (valueNorth > best) { best = valueNorth }
    if (valueSouth > best) { best = valueSouth }
    if (valueEast  > best) { best = valueEast  }
    if (valueWest  > best) { best = valueWest  }
    if (valueNorthEast > best) { best = valueNorthEast }
    if (valueNorthWest > best) { best = valueNorthWest }
    if (valueSouthEast > best) { best = valueSouthEast }
    if (valueSouthWest > best) { best = valueSouthWest }
    return best
}

function getBestDirectionsCore(best) {
    let key = 0
    if (valueNorth == best) { key += 1 }
    if (valueSouth == best) { key += 2 }
    if (valueEast  == best) { key += 4 }
    if (valueWest  == best) { key += 8 }
    if (valueNorthEast == best) { key +=  16 }
    if (valueNorthWest == best) { key +=  32 }
    if (valueSouthEast == best) { key +=  64 }
    if (valueSouthWest == best) { key += 128 }
    //
    return directionsAI[key]
}

// show ///////////////////////////////////////////////////////////////////////

function __showDirectionValues() {
    console.log("")
    console.log("north", valueNorth)
    console.log("south", valueSouth)
    console.log("east ", valueEast )
    console.log("west ", valueWest )
    console.log("northeast", valueNorthEast)
    console.log("northwest", valueNorthWest)
    console.log("southeast", valueSouthEast)
    console.log("southwest", valueSouthWest)
}

// ### file: path-seek.js ###

"use strict"

// 15 rows X 15 cols seekTable (7 + creature + 7)
// true positions are translated to the 15x15 seekTable
// works *backwards*: target is placed in the center of seekTable

//  -3  not walked nor selected
//  -2  blocked
//  -1  selected to future walk
//   0  home

// considers fields: calls isFreeSquareFor which asks SHALL_CONSIDER_FIELDS


var SEEK_ARRAYS_LENGTH = 225

var seekTranslationRow = 0 // helps find true square value in game table
var seekTranslationCol = 0 // helps find true square value in game table

var seekHomeRow = 7 // center row of seek table; will not change
var seekHomeCol = 7 // center col of seek table; will not change

var seekTargetRow = 0
var seekTargetCol = 0

var seekTable = [ ] // unidimensional array

var seekSquares = [ ] // *pool* of SqrPoints
var seekFutures = [ ] // *pool* of SqrPoints

var seekFuturesIndex = -1

var seekSuccess = false

// init ///////////////////////////////////////////////////////////////////////

function initSeek() {
    for (let n = 0; n < SEEK_ARRAYS_LENGTH; n++) {
        seekTable.push(-3)
        seekSquares.push(null)
        seekFutures.push(null)
    }
}

// reset //////////////////////////////////////////////////////////////////////

function resetSeekTable() {
    seekSuccess = false
    //
    for (let n = 0; n < SEEK_ARRAYS_LENGTH; n++) { seekTable[n] = -3 }
    //
    while (seekFuturesIndex > -1) {
        seekFutures[seekFuturesIndex] = null
        seekFuturesIndex -= 1
    }
}

// start //////////////////////////////////////////////////////////////////////

function directionForSeek(c, targetRow, targetCol) { // setting constants (with exchanged roles)
    // home position (true target) is already set as center (7:7)
    // setting translation constants
    seekTranslationRow = targetRow - seekHomeRow
    seekTranslationCol = targetCol - seekHomeCol
    // setting target position (true home)
    seekTargetRow = c.row - seekTranslationRow
    seekTargetCol = c.col - seekTranslationCol
    //
    return directionForSeek2(c)
}

function directionForSeek2(c) {
    if (seekTargetRow <  0) { return "" }
    if (seekTargetRow > 14) { return "" }
    if (seekTargetCol <  0) { return "" }
    if (seekTargetCol > 14) { return "" }
    //
    resetSeekTable()
    walkSeekTable(c)
//  showSeekTable()
/*    if (DEVELOPMENT) {
        console.log("seeking from  row", seekTargetRow + seekTranslationRow, " col", seekTargetCol + seekTranslationCol)
    }
*/
    return findFirstStep()
}

// walk ///////////////////////////////////////////////////////////////////////

function walkSeekTable(c) {
    let distance = 0
    seekSquares[0] = new SqrPoint(seekHomeRow, seekHomeCol) // home
    //
    while (true) {
        seekFuturesIndex = -1
        walkSeekTableTurn(c, distance)
        if (seekSuccess) { return }
        if (seekFutures[0] == null) { return }
        //
        const temp = seekSquares
        seekSquares = seekFutures
        seekFutures = temp
        distance += 1
    }
}

function walkSeekTableTurn(c, distance) {
    for (let n = 0; n < SEEK_ARRAYS_LENGTH; n++) {
        const sqrPoint = seekSquares[n]
        if (sqrPoint == null) { return }
        seekSquares[n] = null
        processSeekTableSquare(c, sqrPoint.row, sqrPoint.col, distance)
    }
}

function processSeekTableSquare(c, row, col, distance) {
    seekTable[row * 15 + col] = distance
    grabNewSqrPoint(c, row - 1, col) // north
    grabNewSqrPoint(c, row + 1, col) // south
    grabNewSqrPoint(c, row, col + 1) // east
    grabNewSqrPoint(c, row, col - 1) // west
    if (isSeekDiagonal(row, col, -1, +1)) { grabNewSqrPoint(c, row - 1, col + 1) } // northeast
    if (isSeekDiagonal(row, col, -1, -1)) { grabNewSqrPoint(c, row - 1, col - 1) } // northwest
    if (isSeekDiagonal(row, col, +1, +1)) { grabNewSqrPoint(c, row + 1, col + 1) } // southeast
    if (isSeekDiagonal(row, col, +1, -1)) { grabNewSqrPoint(c, row + 1, col - 1) } // southwest
}

function isSeekDiagonal(row, col, drow, dcol) {
    if (row <  0) { return false }
    if (col <  0) { return false }
    if (row > 14) { return false }
    if (col > 14) { return false }
    if (row + drow <  0) { return false }
    if (col + dcol <  0) { return false }
    if (row + drow > 14) { return false }
    if (col + dcol > 14) { return false }
    const index1 = (row+drow) * 15 + col
    const index2 = row * 15 + (col+dcol)
    if (seekTable[index1] != -2) { return false }
    if (seekTable[index2] != -2) { return false }
    return true
}

function grabNewSqrPoint(c, row, col) {
    if (row <  0) { return }
    if (col <  0) { return }
    if (row > 14) { return }
    if (col > 14) { return }
    //
    const index = row * 15 + col
    //
    if (row == seekTargetRow  &&  col == seekTargetCol) { seekSuccess = true }
    //
    if (seekTable[index] != -3) { return } // blocked or already walked
    //
    const free = isFreeSquareFor(c, row + seekTranslationRow, col + seekTranslationCol) // accessing main table square
    if (! free) { seekTable[index] = -2; return }
    //
    seekTable[index] = -1
    //
    seekFuturesIndex += 1
    seekFutures[seekFuturesIndex] = new SqrPoint(row, col)
}

// find first step ////////////////////////////////////////////////////////////

function findFirstStep() {
    // the algorithm must be this because of some special cases
    if (! seekSuccess) { return "" }
    //
    const row = seekTargetRow
    const col = seekTargetCol
    let best = 999
    let directions = "" // examples: "north", "north;east;southwest"
    let isSingle = true
    //
    setDirections("north", -1,  0)
    setDirections("south", +1,  0)
    setDirections("east",   0, +1)
    setDirections("west",   0, -1)
    if (isSeekDiagonal(row, col, -1, +1)) { setDirections("northeast", -1, +1) }
    if (isSeekDiagonal(row, col, -1, -1)) { setDirections("northwest", -1, -1) }
    if (isSeekDiagonal(row, col, +1, +1)) { setDirections("southeast", +1, +1) }
    if (isSeekDiagonal(row, col, +1, -1)) { setDirections("southwest", +1, -1) }
    //
    if (isSingle) { return directions }
    return randomItemFrom(directions.split(";"))
    //
    function setDirections(direction, drow, dcol) {
        if (row + drow <  0) { return }
        if (col + dcol <  0) { return }
        if (row + drow > 14) { return }
        if (col + dcol > 14) { return }
        //
        const dist = seekTable[(row+drow) * 15 + (col+dcol)]
        if (dist < 0) { return }
        if (dist < best)  {
            best = dist
            isSingle = true
            directions = direction
            return
        }
        if (dist == best) { isSingle = false; directions += ";" + direction }
    }
}

// show ///////////////////////////////////////////////////////////////////////

function __showSeekTable() {
    let s = "\n"
    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
            let val = seekTable[row * 15 + col] + ""
            if (val ==  "-3") { val = " ??" }
            if (val ==  "-2") { val = " ##" }
            if (val ==  "-1") { val = " !!" }
            if (row == seekTargetRow  &&  col == seekTargetCol) { val = " **" }
            while (val.length < 3) { val = " " + val }
            s += val
        }
        s += "\n"
    }
    console.log(s)
}

// ### file: path-smart.js ###

"use strict"

// smart imagines a rectangle with creature and target in opposite corners,

// then tries to walk on the edges of this rectangle;

// this algorithm is a very fast and very good solution,

// it's path is as short as could be;

// but smart does not cover all cases;


function directionForSmart(c, targetRow, targetCol) { // 3 ms to 15 ms for 100k executions
    //
    const deltaRow = targetRow - c.row
    const deltaCol = targetCol - c.col
    //
    if (Math.abs(deltaRow) > 7) { return "" }
    if (Math.abs(deltaCol) > 7) { return "" }
    //
    if (deltaCol == 0  &&  deltaRow < 0) { return smartNorthOnly(c, deltaRow) }
    if (deltaCol == 0  &&  deltaRow > 0) { return smartSouthOnly(c, deltaRow) }
    if (deltaRow == 0  &&  deltaCol > 0) { return smartEastOnly(c,  deltaCol) }
    if (deltaRow == 0  &&  deltaCol < 0) { return smartWestOnly(c,  deltaCol) }
    if (deltaRow <  0  &&  deltaCol > 0) { return smartNorthOrEast(c, deltaRow, deltaCol) }
    if (deltaRow <  0  &&  deltaCol < 0) { return smartNorthOrWest(c, deltaRow, deltaCol) }
    if (deltaRow >  0  &&  deltaCol > 0) { return smartSouthOrEast(c, deltaRow, deltaCol) }
    if (deltaRow >  0  &&  deltaCol < 0) { return smartSouthOrWest(c, deltaRow, deltaCol) }
    //
    return ""
}

// straight path to target ////////////////////////////////////////////////////

function smartNorthOnly(c, deltaRow) {
    const ok = smartFreeToNorth(c, c.row, c.col, -deltaRow - 1)
    return ok ? "north" : ""
}

function smartSouthOnly(c, deltaRow) {
    const ok = smartFreeToSouth(c, c.row, c.col, deltaRow - 1)
    return ok ? "south" : ""
}

function smartEastOnly(c, deltaCol) {
    const ok = smartFreeToEast(c, c.row, c.col, deltaCol - 1)
    return ok ? "east" : ""
}

function smartWestOnly(c, deltaCol) {
    const ok = smartFreeToWest(c, c.row, c.col, -deltaCol - 1)
    return ok ? "west" : ""
}

// path in 'L' to target //////////////////////////////////////////////////////

function smartNorthOrEast(c, deltaRow, deltaCol) {
    // first north then east
    let north = smartFreeToNorth(c, c.row, c.col, -deltaRow)
    if (north) {
        north = smartFreeToEast(c, c.row + deltaRow, c.col, deltaCol - 1)
    }
    // first east then north
    let east = smartFreeToEast(c, c.row, c.col, deltaCol)
    if (east) {
        east = smartFreeToNorth(c, c.row, c.col + deltaCol, -deltaRow - 1)
    }
    //
    if (north && east) { return (Math.random() > 0.5) ? "north" : "east" }
    if (north) { return "north" }
    if (east)  { return "east" }
    return ""
}

function smartNorthOrWest(c, deltaRow, deltaCol) {
    // first north then west
    let north = smartFreeToNorth(c, c.row, c.col, -deltaRow)
    if (north) {
        north = smartFreeToWest(c, c.row + deltaRow, c.col, -deltaCol - 1)
    }
    // first west then north
    let west = smartFreeToWest(c, c.row, c.col, -deltaCol)
    if (west) {
        west = smartFreeToNorth(c, c.row, c.col + deltaCol, -deltaRow - 1)
    }
    //
    if (north &&  west) { return (Math.random() > 0.5) ? "north" : "west" }
    if (north) { return "north" }
    if (west)  { return "west" }
    return ""
}

function smartSouthOrEast(c, deltaRow, deltaCol) {
    // first south then east
    let south = smartFreeToSouth(c, c.row, c.col, deltaRow)
    if (south) {
        south = smartFreeToEast(c, c.row + deltaRow, c.col, deltaCol - 1)
    }
    // first east then south
    let east = smartFreeToEast(c, c.row, c.col, deltaCol)
    if (east) {
        east = smartFreeToSouth(c, c.row, c.col + deltaCol, deltaRow - 1)
    }
    //
    if (south &&  east) { return (Math.random() > 0.5) ? "south" : "east" }
    if (south) { return "south" }
    if (east)  { return "east" }
    return ""
}

function smartSouthOrWest(c, deltaRow, deltaCol) {
    // first south then west
    let south = smartFreeToSouth(c, c.row, c.col, deltaRow)
    if (south) {
        south = smartFreeToWest(c, c.row + deltaRow, c.col, -deltaCol - 1)
    }
    // first west then south
    let west = smartFreeToWest(c, c.row, c.col, -deltaCol)
    if (west) {
        west = smartFreeToSouth(c, c.row, c.col + deltaCol, deltaRow - 1)
    }
    //
    if (south &&  west) { return (Math.random() > 0.5) ? "south" : "west" }
    if (south) { return "south" }
    if (west)  { return "west" }
    return ""
}

// helper /////////////////////////////////////////////////////////////////////

/*
    square zero is creature position and must not be checked

    all checked squares must be free
*/

function smartFreeToNorth(c, row, col, interval) {
    let steps = 0
    while (true) {
        steps += 1
        if (steps > interval) { return true }
        if (! isFreeSquareFor(c, row - steps, col)) { return false }
    }
}

function smartFreeToSouth(c, row, col, interval) {
    let steps = 0
    while (true) {
        steps += 1
        if (steps > interval) { return true }
        if (! isFreeSquareFor(c, row + steps, col)) { return false }
    }
}

function smartFreeToEast(c, row, col, interval) {
    let steps = 0
    while (true) {
        steps += 1
        if (steps > interval) { return true }
        if (! isFreeSquareFor(c, row, col + steps)) { return false }
    }
}

function smartFreeToWest(c, row, col, interval) {
    let steps = 0
    while (true) {
        steps += 1
        if (steps > interval) { return true }
        if (! isFreeSquareFor(c, row, col - steps)) { return false }
    }
}

// ### file: path-walk.js ###

"use strict"

// free walk in a rectangle (include edges)

// not related to approach


function walk(creature, top, left, bottom, right) {
    if (! readyToMove(creature)) { return }
    respectFields()
    const direction = directionForWalk(creature, top, left, bottom, right)
    if (direction == "") { return }
    if (direction != creature.direction) { spin(creature, direction) }
    move(creature)
}

function directionForWalk(creature, top, left, bottom, right) { // 30 ms for 100k executions
    setDirectionValuesForWalk(creature.row, creature.col, top, left, bottom, right) // ignores invalid moves
    overrideInvalidDirectionValues(creature)
    //
    if (Math.random() < 0.8) { return getThisBestDirection(creature.direction) }
    return getAnyBestDirection()
}

function setDirectionValuesForWalk(row, col, top, left, bottom, right) {
    // basic values:
    // -3: creature is outside and walks away
    // -2: creature is on edge and walks away (-2 for no diagonal mess)
    //  0: creature is inside or is outside and does neutral step
    //  1: creature is outside and approaches area
    // north:
    if (row == top) { // on the edge
        valueNorth = -2
    }
    else if (row < top) { // outside
        valueNorth = -3
        valueSouth = +1
    }
    else { // inside
        valueNorth = 0
    }
    // south:
    if (row == bottom) { // on the edge
        valueSouth = -2
    }
    else if (row > bottom) { // outside
        valueSouth = -3
        valueNorth = +1
    }
    else { // inside
        valueSouth = 0
    }
    // east:
    if (col == right) { // on the edge
        valueEast = -2
    }
    else if (col > right) { // outside
        valueEast = -3
        valueWest = +1
    }
    else { // inside
        valueEast = 0
    }
    // west:
    if (col == left) { // on the edge
        valueWest = -2
    }
    else if (col < left) { // outside
        valueWest = -3
        valueEast = +1
    }
    else { // inside
        valueWest = 0
    }
    //
    valueNorthEast = valueNorth + valueEast
    valueNorthWest = valueNorth + valueWest
    valueSouthEast = valueSouth + valueEast
    valueSouthWest = valueSouth + valueWest
}

// ### file: picture-background.js ###

"use strict"

//
//  BACKGROUND TABLE (15 cols x 12 rows) -> 900 x 720 px
//
//     13 stand cols (6 squares + avatar + 6 squares)
//      2 extra col  (left and right) // for movement // necessary to be 2
//     15 total cols
//
//     11 stand rows (halfsquare + 4 squares + avatar + 4 squares + halfsquare)
//      1 extra row  (top or bottom) // for movement
//     12 total rows


var background
var backgroundCtx

var bgStartRow
var bgStartCol
var bgStartRowLast = 9999
var bgStartColLast = 9999

// init ///////////////////////////////////////////////////////////////////////

function initBackground() {
    background = makeEmptyCanvas(900, 720)
    backgroundCtx = background.getContext("2d")
}

// main ///////////////////////////////////////////////////////////////////////

function drawBackground() {
    bgStartRow = pictureRowAdjust + 1
    bgStartCol = pictureColAdjust + 1
    //
    drawBackgroundCore()
    //
    pictureCtx.drawImage(background, -60 - pictureDeltaLeft, -30 - pictureDeltaTop)
    //
    bgStartRowLast = bgStartRow
    bgStartColLast = bgStartCol
}

function drawBackgroundCore() {
    if (bgStartRow == bgStartRowLast  &&  bgStartCol == bgStartColLast) { return }
    //
    if (shallDrawFreshBackground()) { drawFreshBackground(); return }
    //
    drawComposedBackground()
}

function shallDrawFreshBackground() {
    //
    if (bgStartRow == undefined) { return true }
    //
    if (Math.abs(bgStartRowLast - bgStartRow) > 1) { return true }
    //
    if (Math.abs(bgStartColLast - bgStartCol) > 1) { return true }
    //
    return false
}

// fresh //////////////////////////////////////////////////////////////////////

function drawFreshBackground() {
    for (let row = 0; row < 12; row++) {
        for (let col = 0; col < 15; col++) {
            const sqr = getSquare(row + bgStartRow, col + bgStartCol)
            bgDrawLayerA(sqr, row, col)
        }
    }
}

// composed ///////////////////////////////////////////////////////////////////

function drawComposedBackground() { // composed by old background and new border(s)
    const x = -60 * (bgStartCol - bgStartColLast)
    const y = -60 * (bgStartRow - bgStartRowLast)
    backgroundCtx.drawImage(background, x, y)
    //
    if (x == -60) { fillBackgroundAtLeft() }
    if (x == +60) { fillBackgroundAtRight() }
    if (y == +60) { fillBackgroundAtTop() }
    if (y == -60) { fillBackgroundAtBottom() }
}

function fillBackgroundAtLeft() {
    for (let row = 0; row < 12; row++) {
        const sqr = getSquare(row + bgStartRow, 14 + bgStartCol)
        bgDrawLayerA(sqr, row, 14)
    }
}

function fillBackgroundAtRight() {
    for (let row = 0; row < 12; row++) {
        const sqr = getSquare(row + bgStartRow, bgStartCol)
        bgDrawLayerA(sqr, row, 0)
    }
}

function fillBackgroundAtTop() {
    for (let col = 0; col < 15; col++) {
        const sqr = getSquare(bgStartRow, col + bgStartCol)
        bgDrawLayerA(sqr, 0, col)
    }
}

function fillBackgroundAtBottom() {
    for (let col = 0; col < 15; col++) {
        const sqr = getSquare(11 + bgStartRow, col + bgStartCol)
        bgDrawLayerA(sqr, 11, col)
    }
}

// core ///////////////////////////////////////////////////////////////////////

function bgDrawLayerA(sqr, row, col) {
    //
    const bmp = bmpForLayerA(sqr, row, col)
    //
    backgroundCtx.drawImage(sprites[bmp], col * 60, row * 60)
}

function bmpForLayerA(sqr, row, col) {
    //
    if (sqr == null) { return bmpForNullSquare(row, col) }
    //
    let bmp = sqr.layerA
    //
    if (bmp == "ocean") { return "ocean-" + sufixForOcean(row, col) }
    //
    if (bmp.startsWith("beach-")) {
        bmp = bmp.replace("beach", beachTurn())
        return bmp + "-" + sufixForOcean(row, col)
    }
    //
    return bmp
}

// ### file: picture-creature.js ###

"use strict"

var nameOnTop = false

// toggle name on top /////////////////////////////////////////////////////////

function toggleNameOnTop() {
    //
    nameOnTop = ! nameOnTop
}

// set creature ///////////////////////////////////////////////////////////////

function setCreatureToDraw(sqr, rawBottom, rawRight) {
    //
    const creature = sqr.creature
    //
    if (creature == null) { return }
    //
    /*
        >>> Math.floor makes the creature image tremble on fractionary walkedPixels!!!!
        const bottom = rawBottom + spreadTopByRace[creature.race]  + Math.floor(creature.deltaTop)
        const right  = rawRight  + spreadLeftByRace[creature.race] + Math.floor(creature.deltaLeft)
    */
    const bottom = rawBottom + spreadTopByRace[creature.race]  + creature.deltaTop
    const right  = rawRight  + spreadLeftByRace[creature.race] + creature.deltaLeft
    //
    let bmp = creature.bmp
    //
    if (creature.teleport != "") { bmp += "*" + creature.teleport[0] }
    //
    const obj = newDrawObject("creature", bmp, bottom, right)
    //
    obj.creature  = creature
    obj.rawBottom = rawBottom
    obj.rawRight  = rawRight
    //
    pushToVolumes(obj)
    //
    setSpeachesToDraw(creature.speaches, bmp, bottom, right)
}

// set speaches ///////////////////////////////////////////////////////////////

function setSpeachesToDraw(speaches, bmp, bottom, right) {
    if (speaches.length == 0) { return }
    //
    const spr = getSprite(bmp)
    for (const speach of speaches) {
        setSpeachToDraw(speach, spr, bottom, right)
    }
}

function setSpeachToDraw(speach, spr, bottom, right) {
    bottom += - spr.height + speach.top
    const deltaWidth = getSprite(speach.bmp).width - spr.width
    right  += Math.floor(deltaWidth / 2)
    const obj = newDrawObject("speach", speach.bmp, bottom, right)
    pushToSpeaches(obj)
}

// draw creature //////////////////////////////////////////////////////////////

function drawCreature(obj) {
    //
    const creature = obj.creature
    //
    if (! creature.visible) { return }
    //
    const sqr = getSquare(creature.row, creature.col)
    const spr = getSprite(obj.bmp)
    const width  = spr.width
    const height = spr.height
    //
    const bottom = obj.bottom
    const right  = obj.right
    //
    const aim = drawAimOrDirectionMark(creature, obj.rawBottom, obj.rawRight)
    //
    drawSprite(obj.bmp, bottom, right) // creature
    //
    if (! aim) {
        drawSmokeBubble(creature, obj.rawBottom, obj.rawRight, sqr)
        drawBonfireFire(creature, obj.rawBottom, obj.rawRight, sqr)
        drawBlufireFire(creature, obj.rawBottom, obj.rawRight, sqr)
    }
//  drawCreatureArmor   (creature, bottom, right, width)
//  drawCreatureShield  (creature, bottom, right, width)
    drawCreatureFlame   (creature, bottom, right, width)
    drawCreatureBleeding   (creature, bottom, right, width)
    drawCreatureSmallSword (creature, bottom, right, width)
    drawCreatureBigSword   (creature, bottom, right, width)
    drawCreaturePoison  (creature, bottom, right, width)
    drawCreatureMagic   (creature, bottom, right, width)
    drawCreatureLifeBar (creature, bottom, right, width, height)
    drawCreatureName    (creature, bottom, right, width, height)
    drawDamages         (creature, bottom, right, width, height)
}

// draw aim mark //////////////////////////////////////////////////////////////

function drawAimOrDirectionMark(creature, bottom, right) { // raw coordinates
    //
    if (creature != avatar) { return false }
    //
    if (creature.moveStatus != "stand") { return false }
    //
    if (avatar.disabled) { return false }
    //
    if (shallDrawAimMark()) {
        //
        drawSprite("seta-" + avatar.direction, bottom, right)
        //
        return true
    }
    //
    if (shiftKeyPressed) {
        //
        drawSprite("seta2-" + avatar.direction, bottom, right)
        //
        return true
    }
    //
    return false
}

// draw smoke bubble //////////////////////////////////////////////////////////

function drawSmokeBubble(creature, bottom, right, sqr) { // raw coordinates
    if (sqr.layerB != "smoke") { return }
    if (creature.deltaTop > 10) { return }
    //
    const bmp = "bubbles-" + sufixForSmoke(creature.row, creature.col)
    drawSprite(bmp, bottom + sqr.deltaTop - 5, right + sqr.deltaLeft)
}

// draw bonfire fire //////////////////////////////////////////////////////////

function drawBonfireFire(creature, bottom, right, sqr) { // raw coordinates
    if (sqr.layerB != "bonfire") { return }
    if (creature.deltaTop > 10) { return }
    //
    const bmp = "flame-" + sufixForBonfire(creature.row, creature.col)
    drawSprite(bmp, bottom + sqr.deltaTop - 4, right + sqr.deltaLeft)
}

// draw blufire fire //////////////////////////////////////////////////////////

function drawBlufireFire(creature, bottom, right, sqr) { // inactive! // raw coordinates
    if (sqr.layerB != "blufire") { return }
    if (creature.deltaTop > 10) { return }
    //
    const bmp = "bluflame-" + sufixForBonfire(creature.row, creature.col)
    drawSprite(bmp, bottom + sqr.deltaTop - 4, right + sqr.deltaLeft)
}

// draw creature flame ////////////////////////////////////////////////////////

function drawCreatureFlame(creature, bottom, right, width) {
    if (creature.flameBmpTimer == 0) { return }
    //
    const remain = creature.flameBmpTimer - LOOP
    const time = 25 - remain
    //
    bottom += - time + 10
    right  += - Math.floor(width / 2) + 30
    //
    let bmp = "flame-1"
    if (time >  4  && time < 11) { bmp = "flame-2" }
    if (time > 14  && time < 21) { bmp = "flame-2" }
    drawSprite(bmp, bottom, right)
    //
    if (time == 25) { creature.flameBmpTimer = 0; return }
}

// draw bleeding //////////////////////////////////////////////////////////////

function drawCreatureBleeding(creature, bottom, right, width) {
    if (creature.bleedBmpTimer == 0) { return }
    //
    const repeat = creature.bleedBmpTimer < 0 // negative value signals to repeat
    const remain = Math.abs(creature.bleedBmpTimer) - LOOP
    const time = 40 - remain
    //
    const bmp = "blood-drop"
    let deltaTop  = (time / 2) - 35
    if (time > 20) { deltaTop += (time - 20) * 0.3 }
    //
    bottom += Math.floor(deltaTop)
    right  += - Math.floor(width / 2) - 10
    //
    drawSprite(bmp, bottom, right)
    //
    if (time == 40) { creature.bleedBmpTimer = repeat ? LOOP + 40 : 0; return }
}

/*
// draw armor /////////////////////////////////////////////////////////////////

function drawCreatureArmor(creature, bottom, right, width) {
    if (creature.armorBmpTimer == 0) { return }
    //
    const repeat = creature.armorBmpTimer < 0 // negative value signals to repeat
    const remain = Math.abs(creature.armorBmpTimer) - LOOP
    const time = 25 - remain
    //
    const bmp = "armor1"
    if (time > 12) { bmp = "armor2" }
    //
    bottom += - 15
    right  += - Math.floor(width / 2) + 30
    drawSprite(bmp, bottom, right)
    //
    if (time == 25) { creature.armorBmpTimer = repeat ? LOOP + 25 : 0 }
}

// draw shield ////////////////////////////////////////////////////////////////

function drawCreatureShield(creature, bottom, right, width) {
    if (creature.shieldBmpTimer == 0) { return }
    //
    const repeat = creature.shieldBmpTimer < 0 // negative value signals to repeat
    const remain = Math.abs(creature.shieldBmpTimer) - LOOP
    const time  = 20 - remain
    //
    const bmp = "shield"
    if (creature == avatar) { bmp += "2" }
    //
    bottom += - 15
    const delta = Math.floor(time * 1.5)
    if (delta > 15) { delta = 30 - delta }
    right  += - Math.floor(width / 2) + 25 + delta
    drawSprite(bmp, bottom, right)
    //
    if (time == 20) { creature.shieldBmpTimer = repeat ? LOOP + 20 : 0 }
}

// draw sword animated ////////////////////////////////////////////////////////

function drawCreatureSword(creature, bottom, right, width) {
    if (creature.swordBmpTimer == 0) { return }
    //
    const repeat = creature.swordBmpTimer < 0 // negative value signals to repeat
    const remain = Math.abs(creature.swordBmpTimer) - LOOP
    const time = 25 - remain
    //
    const bmp = "sword2"
    if (time > 10) { bmp = "sword" }
    if (time > 20) { bmp = "sword2" }
    //
    bottom += - 15
    right  += - Math.floor(width / 2) + 30
    drawSprite(bmp, bottom, right)
    //
    if (time == 25) { creature.swordBmpTimer = repeat ? LOOP + 25 : 0 }
}
*/

// draw small sword ///////////////////////////////////////////////////////////

function drawCreatureSmallSword(creature, bottom, right, width) {
    if (creature.smallSwordBmpTimer == 0) { return }
    //
    const repeat = creature.smallSwordBmpTimer < 0 // negative value signals to repeat
    const remain = Math.abs(creature.smallSwordBmpTimer) - LOOP
    const time = 25 - remain
    //
    if (time < 21) { // reserves blank time preparing to repeat
        bottom += - 15
        right  += - Math.floor(width / 2) + 30
        drawSprite("sword2", bottom, right)
    }
    //
    if (time == 25) { creature.smallSwordBmpTimer = repeat ? LOOP + 25 : 0 }
}

// draw big sword /////////////////////////////////////////////////////////////

function drawCreatureBigSword(creature, bottom, right, width) {
    if (creature.bigSwordBmpTimer == 0) { return }
    //
    const repeat = creature.bigSwordBmpTimer < 0 // negative value signals to repeat
    const remain = Math.abs(creature.bigSwordBmpTimer) - LOOP
    const time = 25 - remain
    //
    if (time < 21) { // reserves blank time preparing to repeat
        bottom += - 15
        right  += - Math.floor(width / 2) + 30
        drawSprite("sword", bottom, right)
    }
    //
    if (time == 25) { creature.bigSwordBmpTimer = repeat ? LOOP + 25 : 0 }
}

// draw poison ////////////////////////////////////////////////////////////////

function drawCreaturePoison(creature, bottom, right, width) {
    if (creature.poisonBmpTimer == 0) { return }
    //
    const repeat = creature.poisonBmpTimer < 0 // negative value signals to repeat
    const remain = Math.abs(creature.poisonBmpTimer) - LOOP
    const time = 25 - remain
    //
    let bmp = "poison-1"
    if (time > 10) { bmp = "poison-2" }
    if (time > 20) { bmp = "poison-1" }
    //
    bottom += - 15
    right  += - Math.floor(width / 2) + 30
    drawSprite(bmp, bottom, right)
    //
    if (time == 25) { creature.poisonBmpTimer = repeat ? LOOP + 25 : 0 }
}

// draw magic /////////////////////////////////////////////////////////////////

function drawCreatureMagic(creature, bottom, right, width) {
    if (creature.magicBmpTimer == 0) { return }
    //
    const repeat = creature.magicBmpTimer < 0 // negative value signals to repeat
    const remain = Math.abs(creature.magicBmpTimer) - LOOP
    const time = 30 - remain
    //
    let bmp = "circle-2"
    if (time >  7) { bmp = "circle-1" }
    if (time > 15) { bmp = "circle-4" }
    if (time > 22) { bmp = "circle-3" }
    //
    bottom += - 15
    right  += - Math.floor(width / 2) + 30
    drawSprite(bmp, bottom, right)
    //
    if (time == 30) { creature.magicBmpTimer = repeat ? LOOP + 25 : 0 }
}

// draw life bar //////////////////////////////////////////////////////////////

function drawCreatureLifeBar(creature, bottom, right, width, height) {
    const life = Math.round(100 * creature.life / creature.maxLife)
    const bmp = "lifebar-" + life
    //
    bottom += nameOnTop ? 7 : (- height)
    right  += - Math.floor(width / 2) + 15
    drawSprite(bmp, bottom, right)
}

// draw name //////////////////////////////////////////////////////////////////

function drawCreatureName(creature, bottom, right, width, height) {
    const bmp = "name-" + creature.name
    const large = getSprite(bmp).width
    //
    bottom += nameOnTop ? (- height + 1) : 15
    right  += - Math.floor((width - large) / 2)
    drawSprite(bmp, bottom, right)
}

// draw damages ///////////////////////////////////////////////////////////////

function drawDamages(creature, bottom, right, width, height) {
    if (creature.damages.length == 0) { return }
    //
    for (const damage of creature.damages) {
        drawDamage(damage, bottom, right, width, height)
    }
}

function drawDamage(damage, bottom, right, width, height) {
    bottom += - height + Math.floor(damage.top)
    right  += - width + 70
    drawSprite(damage.bmp, bottom, right)
}

// ### file: picture-helper.js ###

"use strict"

// constructor ////////////////////////////////////////////////////////////////

function newDrawObject(kind, bmp, bottom, right) {
    const obj = new DrawObject()
    obj.kind = kind
    obj.bmp = bmp
    obj.bottom = bottom
    obj.right = right
    return obj
}

function DrawObject() {
    this.kind = ""
    this.bmp = ""
    this.bottom = 0
    this.right = 0
    this.creature = null
    // for drawing fields complements based on square, not based on creature
    this.rawBottom = 0
    this.rawRight  = 0
}

// sufix and null square //////////////////////////////////////////////////////

function sufixForSmoke(row, col) {
    const r = Math.abs(row + pictureRowAdjust) % 4
    const c = Math.abs(col + pictureColAdjust) % 4
    const t = parseInt(smokeTurn())
    const n = (r + c + t) % 4 + 1
    return n
}

function sufixForBonfire(row, col) {
    const r = Math.abs(row + pictureRowAdjust) % 2
    const c = Math.abs(col + pictureColAdjust) % 2
    const t = parseInt(bonfireTurn())
    const n = (r + c + t) % 2 + 1
    return n
}

function sufixForOcean(row, col) {
    const r = Math.abs(row + pictureRowAdjust) % 3
    const c = Math.abs(col + pictureColAdjust) % 3
    const n = (r + c + oceanTurn()) % 3 + 1
    return n
}

function bmpForNullSquare(row, col) { // to be overwritten by editor
    return "ocean-" + sufixForOcean(row, col)
}

// push to list ///////////////////////////////////////////////////////////////

function pushToList(list, obj ) {
    list.push(obj)
    const pos = list.length - 1
    sortByBottomRight(list, pos)
}

function sortByBottomRight(list, pos) {
    // recursive
    // assumes that none or *just one* obj is out of order
    if (pos == 0) { return }
    //
    const current  = list[pos]
    const previous = list[pos - 1]
    if (! shallSwapByBottomRight(current, previous)) { return }
    //
    list[pos] = previous
    list[pos - 1] = current
    //
    sortByBottomRight(list, pos - 1)
}

function shallSwapByBottomRight(current, previous) {
    if (previous.bottom < current.bottom) { return false }
    if (previous.bottom > current.bottom) { return true  }
    // objects are on same bottom line now
    if (previous.right < current.right) { return false }
    if (previous.right > current.right) { return true  }
    return false
}

// ### file: picture-main.js ###

"use strict"

//  basic sprite: 60 x 60 px
//  avatar dimension = 60 x 75 px
//  squares = 60 x 60 px
//
//
//  *VIRTUAL* TABLE (14 rows x 17 cols):
//
//     11 stand rows (halfsquare + 4 squares + avatar + 4 squares + halfsquare)
//      3 extra rows (1 top + 2 bottom)
//     14 total rows
//
//     13 stand cols (6 squares + avatar + 6 squares)
//      4 extra cols (2 left + 2 right)
//     17 total cols
//
//      extra rows and cols are needed when
//        - avatar moves
//        - there is 120 x 120px sprite outside screen
//        - both
//
//
//  PICTURE (780 x 640 px):
//
//     height: 600px: stand rows (halfsquare + 4 squares + avatar + 4 squares + halfsquare)
//     height:  40px: main bar
//
//     width:  780px: 13 stand cols (6 squares + avatar + 6 squares)
//
//   CENTER (AVATAR) POSITION IN PICTURE: row:6  col:7
//
//   TO KEEP GOOD PERSPECTIVE, **ORDER OF DRAWING VOLUME IMAGES IS bottom-right**
//   the bottom-right coordinates are automatically transposed to top-left coordinates
//   just by considering sprites's height and width...
//   sprites like damage-report and shots need adjusts to fix their positions!
//
//   Fields can not be treated as volumes because creatures are supposed to NEVER stand behind it!!!
//   Creature, not the field, draws field effect!

var picture
var pictureCtx

var pictureRowAdjust = 0 // refers to avatar.row
var pictureColAdjust = 0 // refers to avatar.col
var pictureDeltaTop  = 0 // refers to avatar.deltaTop
var pictureDeltaLeft = 0 // refers to avatar.deltaLeft

var flats   =  []  // layerB except fields and minibonfire; so layerA doesn't override right/down displaced layerB)
var puddles =  []  // puddle
var fields  =  []  // bonfire, smoke, minibonfire
var objects =  []  // spear, loot, dropped itens (sqr.objects)
var volumes =  []  // trees, stones, creatures, shots, damage-reports...
var speaches = []  // must be drawn over all other things

var isShallowMode = false // for editor

// init ///////////////////////////////////////////////////////////////////////

function initPicture() {
    picture = makeEmptyCanvas(780, 640)
    picture.style.display = "inline-block"
    picture.style.margin = "0"
    picture.style.border = "2px solid black"
    resetPictureTopMargin()
    document.body.appendChild(picture)
    //
    pictureCtx = picture.getContext("2d", { "alpha": false }) //, "willReadFrequently": true })
    pictureCtx.font = "italic 60px arial"
    pictureCtx.fillStyle = "white"
    //
    initBackground()
}

function resetPictureTopMargin() { // also called by window.onresize
    //
    const height = window.innerHeight - 4 // -4 for borders
    const delta = height - 640
    const topo = (delta < 2) ? 0 : Math.floor(delta / 2)
    //
    picture.style.marginTop = topo + "px"
}

function drawConnectionMessage(msg, left, top) {
    //
    pictureCtx.clearRect(0, 0, picture.width, picture.height)
    //
    pictureCtx.fillText(msg, left, top)
}

// draw ///////////////////////////////////////////////////////////////////////

function drawPicture() {
    //
    pictureRowAdjust = avatar.row - 6
    pictureColAdjust = avatar.col - 8
    pictureDeltaTop  = Math.floor(avatar.deltaTop)  // (*)
    pictureDeltaLeft = Math.floor(avatar.deltaLeft) // (*)
    //
    drawBackground() // layerA
    drawSquares()
    if (DARKNESS) { drawLight() }
    drawMainBar()
    drawInfo()
    //
    // (*)  must use Math.floor: Math.round makes avatar tremble on low and fractional speeds
}

function drawMainBar() { // to be overwritten by editor
    //
    maybeUpdateMainBar()
    //
    const height = 604 // Math.min(640, window.innerHeight) - 36 // 604 is the standard
    //
    pictureCtx.drawImage(mainbarCtx.canvas, 0, height)
}

// core ///////////////////////////////////////////////////////////////////////

function drawSquares() {
    //
    for (let row = 0; row < 14; row++) {
        for (let col = 0; col < 17; col++) {
            //
            const sqr = getSquare(row + pictureRowAdjust, col + pictureColAdjust)
            //
            processSquareToDraw(sqr, row, col)
        }
    }
    //
    drawGrid()
    drawItemsFrom(flats)
    drawItemsFrom(puddles)
    drawItemsFrom(fields)
    drawItemsFrom(objects)
    drawItemsFrom(volumes)
    drawItemsFrom(speaches)
}

function processSquareToDraw(sqr, row, col) {
    //
    if (sqr == null) { return }
    //
    const right  = (col * 60) - 60 - pictureDeltaLeft
    const bottom = (row * 60) - 30 - pictureDeltaTop
    //
    setLayerBToDraw(sqr, bottom, right, row, col) // flats or fields
    setPuddleToDraw(sqr,  bottom, right)      // puddles
    setObjectsToDraw(sqr,  bottom, right)     // objects
    setLayerCToDraw(sqr,   bottom, right)     // volumes
    setCreatureToDraw(sqr, bottom, right)     // volumes
    setShotsToDraw(sqr,    bottom, right)     // volumes
}

// set layerB /////////////////////////////////////////////////////////////////

function setLayerBToDraw(sqr, bottom, right, row, col) {
    //
    let bmp = sqr.layerB
    //
    if (bmp == "") { return }
    //
    if (sqr.layerC == "") { // layerB assumes displacement for itself
        //
        bottom += sqr.deltaTop
        right  += sqr.deltaLeft
    }
    //
    let kind = "flat"
    let list = flats
    if (bmp == "smoke")       { list = fields; kind = "field"; bmp = "smoke-"   + sufixForSmoke(row,   col) }
    if (bmp == "bonfire")     { list = fields; kind = "field"; bmp = "bonfire-" + sufixForBonfire(row, col) }
    if (bmp == "blufire")     { list = fields; kind = "field"; bmp = "blufire-" + sufixForBonfire(row, col) }
    if (bmp == "minibonfire") { list = fields; kind = "field"; bmp = "minibonfire-" + sufixForBonfire(row, col) }
    if (bmp == "miniblufire") { list = fields; kind = "field"; bmp = "miniblufire-" + sufixForBonfire(row, col) }
    //
    const obj = newDrawObject(kind, bmp, bottom, right)
    //
    pushToList(list, obj)
}

// set puddle /////////////////////////////////////////////////////////////////

function setPuddleToDraw(sqr, bottom, right) {
    //
    if (sqr.puddleTimer == 0) { return }
    //
    const kind = "puddle-" + sqr.puddleKind
    //
    const remain = sqr.puddleTimer - LOOP
    //
    const time = 225 - remain
    //
    let bmp = kind + "-1"
    //
    if (time >  90) { bmp = kind + "-2" }
    if (time > 135) { bmp = kind + "-3" }
    if (time > 180) { bmp = kind + "-4" }
    if (time > 225) { sqr.puddleTimer = 0; return }
    //
    const obj = newDrawObject("puddle", bmp, bottom, right)
    //
    puddles.push(obj) // need not to be sorted
}

// set objects ////////////////////////////////////////////////////////////////

function setObjectsToDraw(sqr, bottom, right) {
    //
    if (sqr.objects == null) { return }
    //
    for (const bmp of sqr.objects) {
        //
        const obj = newDrawObject("object", bmp, bottom, right)
        //
        objects.push(obj) // shall not to be sorted
    }
}

// set layerC /////////////////////////////////////////////////////////////////

function setLayerCToDraw(sqr, bottom, right) {
    //
    let bmp = getBmpForLayerC(sqr)
    //
    if (bmp == "") { return }
    //
    if (isShallowMode) {  // for editor
        //
        bmp = "null"
    }
    else {
        bottom += sqr.deltaTop
        right += sqr.deltaLeft
    }
    //
    const obj = newDrawObject("volume", bmp, bottom, right)
    //
    pushToList(volumes, obj)
}

function getBmpForLayerC(sqr) {
    //
    const bmp = sqr.layerC
    if (bmp == "") { return "" }
    //
    if (bmp == "portal")  { return portalBmp(sqr) }
    if (bmp == "block-e") { return obeliskBmp(sqr) }
    //
    return bmp
}

// set shots //////////////////////////////////////////////////////////////////

function setShotsToDraw(sqr, bottom, right) {
    //
    if (sqr.shots == null) { return }
    //
    for (const shot of sqr.shots) { setShotToDraw(shot, bottom, right) }
}

function setShotToDraw(shot, bottom, right) {
    //
    bottom += shot.spreadTop  + Math.floor(shot.deltaTop)
    right  += shot.spreadLeft + Math.floor(shot.deltaLeft)
    //
    const bmp = getShotBmp(shot)
    const obj = newDrawObject("shot", bmp, bottom, right)
    //
    pushToList(volumes, obj)
}

// helper /////////////////////////////////////////////////////////////////////

function pushToSpeaches(obj) { // exporting only
    //
    pushToList(speaches, obj)
}

function pushToVolumes(obj) { // exporting only
    //
    pushToList(volumes, obj)
}

// core draw //////////////////////////////////////////////////////////////////

function drawItemsFrom(list) {
    //
    while (list.length != 0) {
        //
        const obj = list.shift()
        //
        if (obj.creature != null) { drawCreature(obj); continue }
        //
        drawSprite(obj.bmp, obj.bottom, obj.right)
    }
}

function drawSprite(bmp, bottom, right) {
    //
    const sprite = getSprite(bmp)
    const left = right  - sprite.width
    const top  = bottom - sprite.height
    //
    pictureCtx.drawImage(sprite, left, top)
}

// ### file: schedule.js ###

"use strict"

var schedule = [ ] // to be used by the episode code


function Schedule(func, timer) { // constructor
    //
    this.func = func
    this.timer = timer
}

function scheduleByTime(func, miliseconds) { // delay argument in milliseconds
    //
    scheduleByLoop(func, Math.round(miliseconds / LOOP_DURATION_IN_MS))
}

function scheduleByLoop(func, loops) { // delay argument in loops
    //
    const timer = LOOP + Math.max(1, loops)
    const obj = new Schedule(func, timer)
    //
    schedule.push(obj)
}

function updateSchedule() {
    //
    if (schedule.length == 0) { return }
    //
    const list = [ ]
    //
    for (const obj of schedule) {
        //
        if (LOOP < obj.timer) {
            list.push(obj)
        }
        else {
            obj.func()
        }
    }
    schedule = list
}

// ### file: script.js ###

"use strict"

// title & overture ///////////////////////////////////////////////////////////

function scriptTitle() { // THE START OF THE GAME!
    //
    const shallAsk = (localStorage["fresh-start"] != "true")
    localStorage["fresh-start"] = "false"
    //
    if (shallAsk) {
        displayRunOrSkipPage()
    }
    else {
        displayTitlePage()
    }
    //
    shallUpdateMainBar = true // forces show avatar life not just the heart
}

function scriptOverture() { // ENTER was pressed
    runOverture()
}

function scriptRunOrSkipOverture(low) {
    if (low == "r")     { runOverture();  return }
    if (low == "enter") { skipOverture(); return }
}

// portal /////////////////////////////////////////////////////////////////////

function setPortalsAuto() { // called by module main
    for (const sqr of episodeTable) {
        if (sqr.layerC != "portal") { continue }
        includePortal(sqr)
    }
}

function maybeEnterPortal(creature) {
    // called by creature-update-move before complete the step;
    // only avatar with bright gem can reach the portal square
    const sqr = getSquare(creature.row, creature.col)
    if (sqr.layerC != "portal") { return }
    //
    avatar.disabled = true
    avatar.visible = false
    activatePortal(sqr)
    //
    runEnterPortal() // episode code
}

// hero dead //////////////////////////////////////////////////////////////////

function scriptAvatarDead() { // obviously avatar is not in portal
    //
    if (FAILURE) { return }
    //
    FAILURE = true
    //
    defaultDeathScript(avatar)
    //
    scheduleByTime(callback, 3000)
    //
    function callback() {
        //
        const text = pageFailure.replace("@fail@", pageReplacementFailureAvatar)
        //
        scriptFailure(text)
    }
}

function scriptOrionDead() {
    //
    if (FAILURE) { return }
    //
    FAILURE = true
    //
    defaultDeathScript(orion)
    //
    scheduleByTime(callback, 3000)
    //
    function callback() {
        //
        const text = pageFailure.replace("@fail@", pageReplacementFailureOrion)
        //
        scriptFailure(text)
    }
}

// missions ///////////////////////////////////////////////////////////////////

function includeMission(mission) {
    const lines = pageMission.split("\n")
    const indexes = [ 5, 4, 3, 2 ,1 ]
    for (const index of indexes) {
        const line = lines[index]
        if (line == "0lp"  ||  line == "2lp") { lines[index] = "2lp" + mission; break }
    }
    pageMission = lines.join("\n")
}

// success or failure /////////////////////////////////////////////////////////

function scriptSuccess(text) {
    //
    localStorage["finished-episode"] = EPISODE
    //
    playMusic("success")
    //
    displayStandardPage(text, goHome)
}

function scriptFailure(text) {
    //
    playMusic("failure")
    //
    displayStandardPage(text, restart)
}

// (ground) triggers //////////////////////////////////////////////////////////

function setTriggers(list, callback) {
    let n = 0
    while (n < list.length) {
         getSquare(list[n], list[n+1]).trigger = callback
         n += 2
     }
}

function setSelfEraseTriggers(list, action) { // action may not be null
    setTriggers(list, callback)
    //
    function callback() { eraseTriggers(list); action() }
}

function eraseTriggers(list) {
    let n = 0
    while (n < list.length) {
        getSquare(list[n], list[n+1]).trigger = null
         n += 2
     }
}

// chests - manual ////////////////////////////////////////////////////////////

function setEmptyChest(row, col) {
    if (! chestExists(row, col)) { return }
    getSquare(row, col).trigger   = scriptEmptyChest
    getSquare(row, col-1).trigger = scriptEmptyChest
}

function setOpenedChest(row, col, kind, amount, action) {
    if (! chestExists(row, col)) { return }
    //
    getSquare(row, col).trigger   = callback
    getSquare(row, col-1).trigger = callback
    //
    function callback() {
        setEmptyChest(row, col)
        scriptYouFound(kind, amount, action)
    }
}

function setLockedChest(row, col, neededKey, kind, amount, action) {
    if (! chestExists(row, col)) { return }
    //
    getSquare(row, col).trigger   = callback
    getSquare(row, col-1).trigger = callback
    //
    function callback() {
        if (! tryKey(neededKey)) { return }
        //
        setEmptyChest(row, col)
        scriptYouFound(kind, amount, action)
    }
}

function scriptEmptyChest() {
    succinct(avatar, "Chest is empty.")
}

function chestExists(row, col) {
    const msg = "ERROR while setting chest at row:" + row + " col:" + col
    const sqr = getSquare(row, col)
    if (sqr == null) { alert(msg); return false }
    if (sqr.layerC != "chest") { alert(msg); return false }
    return true
}

// altars - automatic /////////////////////////////////////////////////////////

function setAltarsAuto() { // called by module main!
    for (let row = 0; row < numberOfRows; row++) {
        for (let col = 0; col < numberOfCols; col++) {
            let layerC = getSquare(row, col).layerC
            let action = null
            if (layerC == "altar-antidote")   { action = scriptAltarAntidotePotion }
            if (layerC == "altar-health")     { action = scriptAltarHealthPotion }
            if (layerC == "altar-mana")       { action = scriptAltarManaPotion }
            if (layerC == "altar-bright-gem") { action = scriptAltarBrightGem }
            if (layerC == "altar-wooden-key") { action = scriptAltarWoodenKey }
            if (layerC == "altar-iron-key")   { action = scriptAltarIronKey   }
            if (layerC == "altar-copper-key") { action = scriptAltarCopperKey }
            //
            if (action != null) { setAltarTrigger(row, col, action) }
        }
    }
}

function setAltarTrigger(row, col, action) {
    getSquare(row, col).trigger   = callback
    getSquare(row, col-1).trigger = callback
    //
    function callback() { action(row, col) }
}

function scriptAltarHealthPotion(row, col) {
    if (! avatarDrinkHealthPotion(true)) { return }
    convertToSimpleAltar(row, col)
}

function scriptAltarAntidotePotion(row, col) {
    if (! avatarDrinkAntidotePotion(true)) { return }
    convertToSimpleAltar(row, col)
}

function scriptAltarManaPotion(row, col) {
    if (! avatarDrinkManaPotion(true)) { return }
    convertToSimpleAltar(row, col)
}

function scriptAltarBrightGem(row, col) {
    convertToSimpleAltar(row, col)
    scriptFoundBrightGem()
}

function scriptAltarWoodenKey(row, col) {
    convertToSimpleAltar(row, col)
    scriptFoundWoodenKey()
}

function scriptAltarIronKey(row, col) {
    convertToSimpleAltar(row, col)
    scriptFoundIronKey()
}

function scriptAltarCopperKey(row, col) {
    convertToSimpleAltar(row, col)
    scriptFoundCopperKey()
}

function convertToSimpleAltar(row, col) {
    const sqr = getSquare(row, col)
    sqr.layerC = "altar"
    //
    getSquare(row, col).trigger   = null
    getSquare(row, col-1).trigger = null
}

// altar - obelisk ////////////////////////////////////////////////////////////

function setAltarObelisk(altarRow, altarCol, obeliskRow, obeliskCol) {
    const altar = getSquare(altarRow, altarCol)
    const obelisk = getSquare(obeliskRow, obeliskCol)
    includeObelisk(obelisk)
    //
    function callback() { scriptObelisk(altar, obelisk) }
    //
    getSquare(altarRow, altarCol).trigger = callback    // right side
    getSquare(altarRow, altarCol-1).trigger = callback  // left side
}

function scriptObelisk(altar, obelisk) {
    if (LOOP < avatarAltarSkullClock + 20) { return }
    //
    avatarAltarSkullClock = LOOP
    //
    if (altar.layerC == "altar-skull-left") {
        scriptObeliskToEther(altar, obelisk)
    }
    else {
        scriptObeliskToSolid(altar, obelisk)
    }
}

function scriptObeliskToSolid(altar, obelisk) {
    altar.layerC = "altar-skull-left"
    displayStandardPage(pageBecomeSolid)
    obeliskToSolid(obelisk)
}

function scriptObeliskToEther(altar, obelisk) {
    altar.layerC = "altar-skull-right"
    displayStandardPage(pageBecomeEthereal)
    obeliskToEther(obelisk)
}

// well ///////////////////////////////////////////////////////////////////////

function scriptEmptyWell() {
    succinct(avatar, "Well is empty.")
}

// door ///////////////////////////////////////////////////////////////////////

function setLockedDoor(row, col, key) {
    getSquare(row, col).trigger = function () { scriptDoorLocked(row, col, key) }
}

function scriptDoorLocked(row, col, key) {
    if (! tryKey(key)) { return }
    //
    const sqr = getSquare(row, col)
    sqr.trigger = null
    convertToDoorLow(sqr)
}

// found //////////////////////////////////////////////////////////////////////

function scriptYouFound(kind, amount, action) {
    if (kind == "bright-gem") { scriptFoundBrightGem(action); return }
    if (kind == "wooden-key") { scriptFoundWoodenKey(action); return }
    if (kind == "iron-key")   { scriptFoundIronKey(action);   return }
    if (kind == "copper-key") { scriptFoundCopperKey(action); return }
    if (kind == "sword")      { scriptFoundSword(action);     return }
    //
    if (kind == "torch") { scriptFoundTorch(amount, action); return }
    if (kind == "spear") { scriptFoundSpear(amount, action); return }
    if (kind == "speed-oil")  { scriptFoundSpeedOil(amount, action); return }
    if (kind == "mana-potion")  { scriptFoundManaPotion(amount, action); return }
    if (kind == "purple-buble")  { scriptFoundPurpleBubble(amount, action); return }
    if (kind == "health-potion")   { scriptFoundHealthPotion(amount, action); return }
    if (kind == "antidote-potion") { scriptFoundAntidotePotion(amount, action); return }
}

function scriptFoundBrightGem(action) {
    avatarBrightGem = true
    displayYouFound("a bright gem", 0, action)
    shallUpdateMainBar = true
}

function scriptFoundWoodenKey(action) {
    avatarWoodenKey = true
    displayYouFound("a wooden key", 0, action)
    shallUpdateMainBar = true
}

function scriptFoundIronKey(action) {
    avatarIronKey = true
    displayYouFound("an iron key", 0, action)
    shallUpdateMainBar = true
}

function scriptFoundCopperKey(action) {
    avatarCopperKey = true
    displayYouFound("a copper key", 0, action)
    shallUpdateMainBar = true
}

function scriptFoundSword(action) {
    avatarMeleeWeapon = "sword"
    displayYouFound("a sword", 0, action)
    shallUpdateMainBar = true
}

function scriptFoundHealthPotion(amount, action) {
    avatar.healthPotions += amount
    let txt = "health potion"
    if (amount > 1) { txt = "health potions" }
    displayYouFound(txt, amount, action)
    shallUpdateMainBar = true
}

function scriptFoundAntidotePotion(amount, action) {
    avatar.antidotePotions += amount
    let txt = "antidote potion"
    if (amount > 1) { txt = "antidote potions" }
    displayYouFound(txt, amount, action)
    shallUpdateMainBar = true
}

function scriptFoundSpeedOil(amount, action) {
    avatar.speedOils += amount
    let txt = "speed oil"
    if (amount > 1) { txt = "speed oils" }
    displayYouFound(txt, amount, action)
    shallUpdateMainBar = true
}

function scriptFoundManaPotion(amount, action) {
    avatar.manaPotions += amount
    let txt = "mana potion"
    if (amount > 1) { txt = "mana potions" }
    displayYouFound(txt, amount, action)
    shallUpdateMainBar = true
}

function scriptFoundPurpleBubble(amount, action) {
    avatar.purpleBubbles += amount
    let txt = "purple bubble"
    if (amount > 1) { txt = "purple bubbles" }
    displayYouFound(txt, amount, action)
    shallUpdateMainBar = true
}

function scriptFoundSpear(amount, action) {
    avatar.spears += amount
    let txt = "spear"
    if (amount > 1) { txt = "spears" }
    displayYouFound(txt, amount, action)
    shallUpdateMainBar = true
}

function scriptFoundTorch(amount, action) {
    avatar.torches += amount
    let txt = "torch"
    if (amount > 1) { txt = "torches" }
    displayYouFound(txt, amount, action)
    shallUpdateMainBar = true
}

// helper /////////////////////////////////////////////////////////////////////

function tryKey(key) {
    const name = key.replace("-", " ")
    let ok = false
    if (key == "wooden-key"  &&  avatarWoodenKey) { ok = true }
    if (key == "iron-key"    &&  avatarIronKey)   { ok = true }
    if (key == "copper-key"  &&  avatarCopperKey) { ok = true }
    //
    if (ok) {
        speak(avatar, "Using " + name + ".")
        return true
    }
    else {
        succinct(avatar, "Missing " + name + ".")
        return false
    }
}

// ### file: shot.js ###

"use strict"

const shotBmpReference = "1324321234" // minimized

function Shot() {
    this.exists = true // if not, will be deleted
    this.kind = ""
    this.attack = 0
    this.row = 0
    this.col = 0
    this.direction = ""
    this.reach = 0   // squares
    this.speed = 0.0 // pixels per loop
    this.shooter = null // creature
    this.spreadLeft = 0   // for bmp only
    this.spreadTop  = 0   // for bmp only
    this.deltaLeft  = 0.0
    this.deltaTop   = 0.0
    this.walkedPixels = 0.0 // from 0 to 60
    this.walkedSquares = 0
    this.changedSquare = false
    // sprite
    // bmp is given on demand, not memorized
    this.bmpClock = 0
}

// new shot ///////////////////////////////////////////////////////////////////

function makeNewShot(kind, row, col, direction, min, max) {
    const shot = new Shot()
    shot.kind = kind
    shot.row = row
    shot.col = col
    shot.direction = direction
    shot.min = min
    shot.max = max
    shot.bmpClock = LOOP
    placeShotInSquare(shot)
    shots.push(shot)
    return shot
}

// bmp ////////////////////////////////////////////////////////////////////////

function getShotBmp(shot) {
    if (shot.kind == "spear") { return "spear-" + shot.direction }
    if (shot.kind == "smoke-ball") { return "smoke-ball-" + shotBmpFrame(20, shot.bmpClock) }
    if (shot.kind == "purple-bubble") { return "purple-bubbles-" + shotBmpFrame(12, shot.bmpClock) }
    if (shot.kind == "fire-dart") { return "copper-bubbles-" + shotBmpFrame(12, shot.bmpClock) }
    return ("*error*")
}

function shotBmpFrame(durationOfFrame, bmpClock) {
    const loops = LOOP - bmpClock
    const index = Math.floor(loops / durationOfFrame)
    return shotBmpReference[index]
}

// update /////////////////////////////////////////////////////////////////////

function updateShot(shot) {
    updateShotMovement(shot)
}

// update movement ////////////////////////////////////////////////////////////

// shot changes its current square in the middle of it (the current square)

// the current algorithm for shot collision fixes the ***trespassing spear bug***

function updateShotMovement(shot) {
    checkShotCollision(shot) // in previous loop, creatures were updated after shots update
    if (! shot.exists) { return }
    //
    shot.walkedPixels += shot.speed
    shot.deltaLeft += deltaColFor[shot.direction] * shot.speed // when shot goes to other square,
    shot.deltaTop  += deltaRowFor[shot.direction] * shot.speed // no delta matches walked pixels
    //
    checkShotCollision(shot)
    if (! shot.exists) { return }
    //
    if (shot.walkedPixels > 30  &&  ! shot.changedSquare) { // '== 30' is bad because of fractionary numbers
        changeShotSquare(shot)
        checkShotCollision(shot)
        return
    }
    if (shot.walkedPixels >= 60) { // '== 60' is bad because of fractionary numbers
        resetShotByAdvance(shot)
        checkShotCollision(shot)
        return
    }
}

function changeShotSquare(shot) {
    removeShotFromSquare(shot)
    //
    const deltaRow = deltaRowFor[shot.direction]
    const deltaCol = deltaColFor[shot.direction]
    shot.row += deltaRow
    shot.col += deltaCol
    //
    if (getSquare(shot.row, shot.col) == null) { shot.exists = false; return }
    //
    // adjusting deltaLeft and deltaTop to new (row, col)
    if (deltaCol < 0) { shot.deltaLeft += 60 }
    if (deltaCol > 0) { shot.deltaLeft -= 60 }
    if (deltaRow < 0) { shot.deltaTop  += 60 }
    if (deltaRow > 0) { shot.deltaTop  -= 60 }
    //
    placeShotInSquare(shot)
    shot.changedSquare = true
}

function resetShotByAdvance(shot) {
    shot.changedSquare = false
    shot.walkedPixels -= 60
    shot.deltaLeft = shot.walkedPixels * deltaColFor[shot.direction]
    shot.deltaTop  = shot.walkedPixels * deltaRowFor[shot.direction]
    //
    if (shot.kind == "smoke-ball") { shot.speed *= 0.9; return }
    //
    shot.walkedSquares += 1
    if (shot.walkedSquares < shot.reach) { return }
    //
    shot.exists = false
    removeShotFromSquare(shot)
    if (shot.kind == "spear") { placeSpearOnGround(shot) }
}

// collision //////////////////////////////////////////////////////////////////

function checkShotCollision(shot) {
    if (shot.walkedSquares == 0) { return } // does not shoot the shooter
    const sqr = getSquare(shot.row, shot.col)
    // free
    if (! sqr.blocked) { return } // not tree, stone, creature...
    // considered free
    if (sqr.creature == shot.shooter) { return } // avoid redzag shoot itself when diagonal //
    // blocked
    shot.exists = false
    removeShotFromSquare(shot)
    //
    if (sqr.creature != null) { shotHitCreature(shot, sqr.creature); return }
    //
    if (shot.kind == "spear") { placeSpearOnGroundBack(shot) }
}

function shotHitCreature(shot, creature) {
    if (shot.kind == "spear") {
        placeSpearOnGround(shot)
        receiveSpearAttack(creature, shot)
    }
    else if (shot.kind == "purple-bubble") {
        receivePurpleBubbleHealing(creature, shot)
    }
    else if (shot.kind == "smoke-ball") {
        receiveSmokeBallAttack(creature, shot)
    }
    else if (shot.kind == "fire-dart") {
        receiveFireDartAttack(creature, shot)
    }
}

// spear on ground ////////////////////////////////////////////////////////////

function placeSpearOnGround(shot) {
    placeSpearOnGroundCore(shot, shot.row, shot.col)
}

function placeSpearOnGroundBack(shot) { // spear hits a tree
    const row = shot.row - deltaRowFor[shot.direction]
    const col = shot.col - deltaColFor[shot.direction]
    placeSpearOnGroundCore(shot, row, col)
}

function placeSpearOnGroundCore(shot, row, col) {
    const layerA = getSquare(row, col).layerA
    if (layerA.startsWith("beach")) { return }
    if (layerA.startsWith("ocean")) { return }
    //
    const direction = directionForDroppedSpear(shot.direction, row, col)
    placeObjectOnSquare("spear-" + direction, row, col)
}

function directionForDroppedSpear(direction, row, col) {
    const sqr = getSquare(row, col)
    const last = lastDroppedSpear(sqr)
    //
    if (last == "north")     { return "southeast" }
    if (last == "southeast") { return "west"      }
    if (last == "west")      { return "northeast" }
    if (last == "northeast") { return "south"     }
    if (last == "south")     { return "east"      }
    if (last == "east")      { return "northwest" }
    if (last == "northwest") { return "southwest" }
    if (last == "southwest") { return "north"     }
    return direction // last == ""
}

function lastDroppedSpear(sqr) {
    if (sqr.objects == null) { return "" }
    //
    let n = sqr.objects.length - 1
    while (n >= 0) {
        const item = sqr.objects[n]
        if (item.startsWith("spear-")) { return item.substr(6) }
        n -= 1
    }
    return ""
}

// ### file: shots.js ###

"use strict"

var shots = []

// updating ///////////////////////////////////////////////////////////////////

function updateShots() {
    let n = shots.length - 1 // must run backwards
    while (true) {
        if (n < 0) { return }
        const shot = shots[n]
        if (shot.exists) {
            updateShot(shot)
        }
        else {
            shots.splice(n, 1)
        }
        n -= 1
    }
}

// throw spear ////////////////////////////////////////////////////////////////

function throwSpear(shooter, row, col, direction, min, max) {
    const shot = makeNewShot("spear", row, col, direction, min, max)
    shot.reach = 5
    shot.speed = 12
    if (direction.length > 5) { // diagonal
        shot.reach = 4
        shot.speed = 9
    }
    shot.speed *= 2 // FAST SPEAR
    shot.spreadLeft =  -3
    shot.spreadTop  = -20
    shot.shooter = shooter
}

// throw purple bubble ////////////////////////////////////////////////////////

function throwPurpleBubble(shooter, row, col, direction, min, max) {
    const shot = makeNewShot("purple-bubble", row, col, direction, min, max)
    shot.reach = 6
    shot.speed = 8
    if (direction.length > 5) { // diagonal
        shot.reach = 5
        shot.speed = 4.5
    }
    shot.spreadLeft = -10
    shot.spreadTop  = -10
    shot.shooter = shooter
}

// throw fire dart ////////////////////////////////////////////////////////////

function throwFireDart(shooter, row, col, direction, min, max) {
    const shot = makeNewShot("fire-dart", row, col, direction, min, max)
    shot.reach = 6
    shot.speed = 4
    if (direction.length > 5) { // diagonal
        shot.reach = 5
        shot.speed = 2.5
    }
    shot.spreadLeft = -10
    shot.spreadTop  = -10
    shot.shooter = shooter
}

// throw smoke ball ///////////////////////////////////////////////////////////

function throwSmokeBall(shooter, row, col, direction, min, max) {
    const shot = makeNewShot("smoke-ball", row, col, direction, min, max)
    shot.reach = 6
    shot.speed = 4
    if (direction.length > 5) { // diagonal
        shot.reach = 5
        shot.speed = 2.5
    }
    shot.spreadLeft = -10
    shot.spreadTop  = -10
    shot.shooter = shooter
}

// ### file: speak.js ###

"use strict"

const speakDuration = 30

// constructor ////////////////////////////////////////////////////////////////

function Speach(txt, bmp) {
    this.txt = txt
    this.bmp = bmp // the name, not the sprite
    this.top = 0
    this.clock = speakDuration
}

function makeSpeachObj(color, txt) {
    const bmp = makeSpeachBmp(color, txt)
    return new Speach(txt, bmp)
}

function makeSpeachBmp(color, txt) {  // also used for creature name
    return "speach(" + color[0] + "," + color[1] + "," + color[2] + ")" + txt // the name, not the sprite
}

// speak //////////////////////////////////////////////////////////////////////

function speak(creature, txt, color) {
    if (color == undefined) { color = [255,255,255] }
    const obj = makeSpeachObj(color, txt)
    maybeCreateSpeachSprite(obj.bmp, color, txt)
    //
    creature.speaches.push(obj)
    if (creature.speaches.length == 4) { creature.speaches.shift() } // max is 3
    //
    // setting heights
    let top = 70
    const max = creature.speaches.length - 1
    for (let n = max; n >= 0; n--) { // starts from last (bottom)
        creature.speaches[n].top = top
        top -= 15
    }
}

function succinct(creature, txt, color) {
    const len = creature.speaches.length
    if (len == 0) { speak(creature, txt, color); return }
    //
    const last = creature.speaches[len - 1]
    if (last.txt != txt) { speak(creature, txt, color); return }
    //
    last.clock = speakDuration
}

function succinctDouble(creature, txt, color) {
    const len = creature.speaches.length
    if (len == 0) { speak(creature, txt, color); return }
    //
    const last = (creature.speaches[len - 1]).txt
    const double = txt + " " + txt
    const triple = txt + " " + txt + " " + txt
    //
    if (last == double) { creature.speaches.pop(); speak(creature, triple, color); return }
    //
    if (last == txt)    { creature.speaches.pop(); speak(creature, double, color); return }
    //
    speak(creature, txt, color)
}

// update /////////////////////////////////////////////////////////////////////

function updateSpeaches(creature) {
    if (creature.speaches.length == 0) { return }
    //
    const oldest = creature.speaches[0]
    if (oldest.clock < 1) { creature.speaches.shift() }
    // now creature.speaches is empty or all components are ok
    for (const speach of creature.speaches) { speach.clock -= 1 }
}

// sprite /////////////////////////////////////////////////////////////////////

function maybeCreateSpeachSprite(bmp, color, txt) { // also used for creature name
    if (sprites[bmp] != undefined) { return }
    //
    sprites[bmp] = makeSpeachSprite(color, txt)
}

function makeSpeachSprite(color, txt) {
    txt = translate(txt)
    const keys = txt.split("")
    const sprs = []
    let spr
    let width = 0
    for (const key of keys) {
        spr = fontSmall[key]
        sprs.push(spr)
        width += spr.width - 2
    }
    width += 2 // or else canvas is too short
    //
    const cnv = makeEmptyCanvas(width, spr.height) // all sprs come with same height
    const ctx = cnv.getContext("2d")
    let left = 0
    for (const spr of sprs) {
        ctx.drawImage(spr, left, 0)
        left += spr.width - 2
    }
    //
    if (color[0] + color[1] + color[2] != 765) { colorizeSprite(cnv, color) }
    return cnv
}

// ### file: sprite-helper.js ###

"use strict"

function getSprite(id) {
    const sprite = sprites[id]
    if (sprite != undefined) { return sprite }
// console.log("making sprite on demand: [" + id + "]")
    if (id.indexOf("*") != -1) {
        sprites[id] = makeTeleportSprite(id)
        return sprites[id]
    }
    alert("Could not find sprite [" + id + "]")
    return null
}

///////////////////////////////////////////////////////////////////////////////

function makeEmptyCanvas(width, height) {
    const cnv = document.createElement("canvas")
    cnv.width  = width
    cnv.height = height
    return cnv
}

function cloneImage(src) {
    const cnv = makeEmptyCanvas(src.width, src.height)
    cnv.getContext("2d").drawImage(src, 0 , 0)
    return cnv
}

function joinSprites(base, over) {
    return joinCanvases(sprites[base], sprites[over])
}

function joinCanvases(base, over) {
    const cnv = makeEmptyCanvas(base.width, base.height)
    const ctx = cnv.getContext("2d")
    ctx.drawImage(base, 0, 0)
    ctx.drawImage(over, 0, 0)
    return cnv
}

function horizontalReverse(spr) {
    const width  = spr.width
    const height = spr.height
    const cnv = makeEmptyCanvas(width, height)
    const ctx = cnv.getContext("2d")
    ctx.save()
    ctx.translate(width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(spr, 0, 0)
    ctx.restore()
    return cnv
}

function verticalReverse(spr) {
    const width  = spr.width
    const height = spr.height
    const cnv = makeEmptyCanvas(width, height)
    const ctx = cnv.getContext("2d")
    ctx.save()
    ctx.translate(0, height)
    ctx.scale(1, -1)
    ctx.drawImage(spr, 0, 0)
    ctx.restore()
    return cnv
}

function rotate90(src) {
    const srcwidth  = src.width
    const srcheight = src.height
    const srcctx  = src.getContext("2d")
    const srcdata = srcctx.getImageData(0, 0, srcwidth, srcheight).data
    //
    const width  = srcheight
    const height = srcwidth
    const cnv = makeEmptyCanvas(width, height)
    const ctx = cnv.getContext("2d")
    const imgdata = ctx.getImageData(0, 0, width, height)
    const data = imgdata.data
    //
    for (let srcX = 0; srcX < srcwidth; srcX++) {
        for (let srcY = 0; srcY < srcheight; srcY++) {
            const srcindex = 4 * (srcwidth * srcY + srcX)
            const x = srcheight - 1 - srcY
            const y = srcX
            const index = 4 * (width * y + x)
            data[index + 0] = srcdata[srcindex]     // red
            data[index + 1] = srcdata[srcindex + 1] // green
            data[index + 2] = srcdata[srcindex + 2] // blue
            data[index + 3] = srcdata[srcindex + 3] //alpha
        }
    }
    ctx.putImageData(imgdata, 0, 0, 0, 0, width, height)
    return cnv
}

function __rotateMix(src) {
    const srcwidth  = src.width
    const srcheight = src.height
    const srcctx  = src.getContext("2d")
    const srcdata = srcctx.getImageData(0, 0, srcwidth, srcheight).data
    //
    const width  = srcheight
    const height = srcwidth
    const cnv = makeEmptyCanvas(width, height)
    const ctx = cnv.getContext("2d")
    const imgdata = ctx.getImageData(0, 0, width, height)
    const data = imgdata.data
    //
    for (let srcX = 0; srcX < srcwidth; srcX++) {
        for (let srcY = 0; srcY < srcheight; srcY++) {
            const srcindex = 4 * (srcwidth * srcY + srcX)
            const x = srcY
            const y = srcX
            const index = 4 * (width * y + x)
            data[index + 0] = srcdata[srcindex]     // red
            data[index + 1] = srcdata[srcindex + 1] // green
            data[index + 2] = srcdata[srcindex + 2] // blue
            data[index + 3] = srcdata[srcindex + 3] //alpha
        }
    }
    ctx.putImageData(imgdata, 0, 0, 0, 0, width, height)
    return cnv
}

function scale(bmp, width, height) {
    const cnv = makeEmptyCanvas(width, height)
    const ctx = cnv.getContext("2d")
    const spr = sprites[bmp]
    ctx.drawImage(spr, 0,0,spr.width,spr.height, 0,0,cnv.width,cnv.height)
    return cnv
}

function divideBigSprite(big, a, b, c, d) {
    sprites[a] = makeSubSprite(big,   0,   0)
    sprites[b] = makeSubSprite(big, -60,   0)
    sprites[c] = makeSubSprite(big,   0, -60)
    sprites[d] = makeSubSprite(big, -60, -60)
}

function makeSubSprite(big, left, top) {
    const cnv = makeEmptyCanvas(60, 60)
    const ctx = cnv.getContext("2d")
    ctx.drawImage(big, left, top)
    return cnv
}

function replaceColor(cnv, oldColor, newColor) {
    const width  = cnv.width
    const height = cnv.height
    const ctx = cnv.getContext("2d")
    const imgdata = ctx.getImageData(0, 0, width, height)
    const data = imgdata.data
    //
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            replacePixelColor(data, x, y, width, oldColor, newColor)
        }
    }
    ctx.putImageData(imgdata, 0, 0, 0, 0, width, height)
}

function replacePixelColor(data, x, y, width, oldColor, newColor) {
    const index = 4 * (width * y + x)
    if (data[index    ] != oldColor[0]) { return }
    if (data[index + 1] != oldColor[1]) { return }
    if (data[index + 2] != oldColor[2]) { return }
    if (data[index + 3] != oldColor[3]) { return }
    //
    data[index    ] = newColor[0]
    data[index + 1] = newColor[1]
    data[index + 2] = newColor[2]
    data[index + 3] = newColor[3]
}

function swapColors(cnv, a, b) {
    const width = cnv.width
    const height = cnv.height
    const ctx = cnv.getContext("2d")
    const imgdata = ctx.getImageData(0, 0, width, height)
    const data = imgdata.data
    //
    for (let y = 0; y < cnv.height; y++) {
        for (let x = 0; x < width; x++) {
            const index = 4 * (width * y + x)
            const channelA = data[index + a]
            const channelB = data[index + b]
            data[index + a] = channelB
            data[index + b] = channelA
        }
    }
    ctx.putImageData(imgdata, 0, 0)
}

function colorizeSprite(sprite, color) { // called by font.js
    const width  = sprite.width
    const height = sprite.height
    const ctx = sprite.getContext("2d")
    const imgdata = ctx.getImageData(0, 0, width, height)
    const data = imgdata.data
    //
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            colorizePixel(data, x, y, width, color)
        }
    }
    ctx.putImageData(imgdata, 0, 0, 0, 0, width, height)
}

function colorizePixel(data, x, y, width, color) {
    const index = 4 * (width * y + x)
    const alpha = data[index + 3]
    if (alpha != 255) { return } // blank or antialiasing
    const light = data[index] + data[index + 1] + data[index + 2]
    if (light == 0) { return }   // must be outline now
    const shadow = light / 765
    data[index    ] = color[0] * shadow
    data[index + 1] = color[1] * shadow
    data[index + 2] = color[2] * shadow
}

// ### file: sprite-main.js ###

"use strict"

var sprites = { }

var spriteList     //  nome;left;top;width;height
var spriteSheet

var spriteGuideDone = false
var spritesAreReady = false

// downloading ////////////////////////////////////////////////////////////////

function loadSprites() {
    httpDownloadImage("/images/sprite-sheet.png", spriteSheetLoaded)
    httpDownloadText("/images/sprite-guide.txt", spriteGuideLoaded)
}

///////////////////////////////////////////////////////////////////////////////

function spriteGuideLoaded(path, data) {
    console.log("loaded", path)
    spriteList = data.trim().split("\n")
    spriteList.sort()
    spriteGuideDone = true
}

function spriteSheetLoaded(path, data) {
    console.log("loaded", path)
    spriteSheet = data
    tryProcessSpriteSheet()
}

function tryProcessSpriteSheet() {
    if (spriteGuideDone) { processSpriteSheet(); return }
    //
    setTimeout(tryProcessSpriteSheet, 10)
}

// core ///////////////////////////////////////////////////////////////////////

function processSpriteSheet() {
    unpackSpriteSheet()
    makeFonts()
    reformSprites()
    spritesAreReady = true
}

// unpack /////////////////////////////////////////////////////////////////////

function unpackSpriteSheet() {
    for (const item of spriteList) { unpackSprite(item) }
}

function unpackSprite(item) {
    const data = item.split(";")
    const nome = data[0]
    sprites[nome] = makeUnpackedSprite(data[1], data[2], data[3], data[4])
}

function makeUnpackedSprite(left, top, width, height) {
    const cnv = makeEmptyCanvas(width, height)
    const ctx = cnv.getContext("2d")
    ctx.drawImage(spriteSheet, 0 - left, 0 - top)
    return cnv
}

// ### file: sprite-reform1.js ###

"use strict"

function reformSprites() {
    reformAvatar()
    reformOrion()
    reformHorizontalReversions()
    reformIcons()
    reformMainBar()
    reformGrass()
    reformSwamp()
    reformDesert()
    reformTrees()
    reformFloor()
    reformBlocks()
    reformAltars()
    reformPedestals()
    reformBonfires()
    reformBlufires() // must come after reformBonfires
    reformWell()
    reformSpears()
    reformPoisonBall()
    reformStoneGolem()
    reformWoodGolem()
    reformSingleSpriteCreatures()
    reformDoubleSpriteCreatures()
    reformTripleSpriteCreatures()
    reformBubbles()
    reformLifeBars()
    reformSetas()
    reformBeachesLow()
 // reformBeachesHigh()  //  unused: beaches are not animated
    reformGemsForLoot()
    reformSword()
    reformArmor()
    reformShield()
    reformLoot() // items on the ground
    reformNullSprite()
    //
    const keys = Object.keys(sprites)
    for (const key of keys) { reformSprite2Turn(key) }
}

function reformSprite2Turn(id) {
    if (id.startsWith("sandgrass-")) { reformSandGrass(id); reformSandDesert(id); return }
    if (id.startsWith("beach-"))     { reformBeach(id); return }
}

// avatar /////////////////////////////////////////////////////////////////////

function reformAvatar() {
    const model = "spaceman"

    sprites["avatar-south-stand"] = sprites[model + "-south-stand"]
    sprites["avatar-south-left" ] = sprites[model + "-south-left" ]
    sprites["avatar-south-right"] = sprites[model + "-south-right"]

    sprites["avatar-north-stand"] = sprites[model + "-north-stand"]
    sprites["avatar-north-left" ] = sprites[model + "-north-left" ]
    sprites["avatar-north-right"] = sprites[model + "-north-right"]

    sprites["avatar-east-stand"] = sprites[model + "-east-stand"]
    sprites["avatar-east-left" ] = sprites[model + "-east-left" ]
    sprites["avatar-east-right"] = sprites[model + "-east-right"]

    sprites["avatar-west-stand"] = horizontalReverse(sprites[model + "-east-stand"])
    sprites["avatar-west-left" ] = horizontalReverse(sprites[model + "-east-right"])
    sprites["avatar-west-right"] = horizontalReverse(sprites[model + "-east-left" ])
}

// orion //////////////////////////////////////////////////////////////////////

function reformOrion() {

    sprites["orion-west-stand"] = horizontalReverse(sprites["orion-east-stand"])
    sprites["orion-west-left" ] = horizontalReverse(sprites["orion-east-right"])
    sprites["orion-west-right"] = horizontalReverse(sprites["orion-east-left" ])
}

// horizontal reversion ///////////////////////////////////////////////////////

function reformHorizontalReversions() {
    sprites["skull-right"] = horizontalReverse(sprites["skull-left"])
    sprites["flower-z2"] = horizontalReverse(sprites["flower-z1"])
    sprites["flower-z4"] = horizontalReverse(sprites["flower-z3"])
}

// main bar icons /////////////////////////////////////////////////////////////

function reformIcons() {
    reformIconHealthPotion()
    reformIconAntidotePotion()
    reformIconSpeedOil()
    reformIconManaPotion()
 // reformIconStrengthElixir()
    reformIconInvisibleTea()
    reformIconSword()
    reformIconSpear()
    reformIconShield()
    reformIconPurpleBubble()
    reformIconManaShield()
    reformIconScroll()
    reformIconTorch()
    reformIconTorchGrey()
    reformIconWoodenKey()
    reformIconIronKey()
    reformIconCopperKey()
    reformIconBrightGem()
}

function reformRawIcon(width, height, letter, left) { // helper
    const cnv = makeEmptyCanvas(width, height)
    const ctx = cnv.getContext("2d")
//  if (txt == "@") { ctx.fillStyle = "yellow"; ctx.fillRect(0,0,width,height) }
    if (! letter) { return ctx }
    //
    const x = 5 + (15 * "ABCDEFGHIJKLMNOPQRSTUVWXYZ-".indexOf(letter))
    //
    ctx.drawImage(sprites["minifont"], x,0,15,15, left,-2,15,15)
    return ctx
}

function reformIconHealthPotion() {
    const ctx = reformRawIcon(35, 30, "-", 25)
    ctx.drawImage(sprites["source-health-potion"], 0,0,60,60, -1,0,30,30)
    sprites["icon-health-potion"] = ctx.canvas
}

function reformIconAntidotePotion() {
    const ctx = reformRawIcon(25, 30, "A", 16)
    ctx.drawImage(sprites["source-antidote-potion"], 0,0,18,45, 1,1,12,28)
    sprites["icon-antidote-potion"] = ctx.canvas
}

function reformIconSpeedOil() {
    const ctx = reformRawIcon(30, 30, "S", 21)
    ctx.drawImage(sprites["source-speed-oil"], 0,0,27,45, 1,2,19,28)
    sprites["icon-speed-oil"] = ctx.canvas
}

function reformIconManaPotion() {
    const ctx = reformRawIcon(31, 30, "M", 21)
    ctx.drawImage(sprites["source-mana-potion"], 0,0,37,60, 1,2,22,28)
    sprites["icon-mana-potion"] = ctx.canvas
}

/*
function reformIconStrengthElixir() {
    const ctx = reformRawIcon(30, 30, "E", 18)
    ctx.drawImage(sprites["source-blue-elixir"], 0,0,33,51, 1,6,20,24)
    sprites["icon-strength-elixir"] = ctx.canvas
}
*/

function reformIconInvisibleTea() {
    const ctx = reformRawIcon(30, 30, "I", 20)
 // ctx.drawImage(sprites["source-invisible-tea"], 0,0,38,52, 1,3,22,26)
    ctx.drawImage(sprites["source-invisible-tea"], 0,0,38,52, 1,0,20,30)
    sprites["icon-invisible-tea"] = ctx.canvas
}

function reformIconSword() {
    const ctx = reformRawIcon(30, 30, "Z", 21)
    const temp = horizontalReverse(sprites["sword"])
    ctx.drawImage(temp, 0,0,60,60, 0,0,30,30)
    sprites["icon-sword"] = ctx.canvas
}

function reformIconSpear() {
    const ctx = reformRawIcon(22, 30, "X", 13)
    ctx.drawImage(sprites["spear-north"], 24,0,35,60, 1,1,30,28)
    sprites["icon-spear"] = ctx.canvas
}

function reformIconShield() {
    const ctx = reformRawIcon(40, 30) // , "C", 30)
    ctx.drawImage(sprites["icon-shield"], 0, 1)
    sprites["icon-shield"] = ctx.canvas
}

function reformIconPurpleBubble() {
    const ctx = reformRawIcon(37, 30, "P", 28)
    const cnv = sprites["purple-bubbles-2"]
    ctx.drawImage(cnv, 9,15,45,45, -2,1,30,30)
    sprites["icon-purple-bubble"] = ctx.canvas
}

function reformIconManaShield() {
    swapColors(sprites["icon-mana-shield"], 0, 2)
    swapColors(sprites["icon-mana-shield"], 1, 2)
}

/* reserved
function reformIconBackpack() {
    const ctx = reformRawIcon(30, 30, "I", 23)
    ctx.drawImage(sprites["backpack"], 0,0,30,40, 1,2,28,30)
    sprites["icon-backpack"] = ctx.canvas
}
*/

function reformIconScroll() {
    const ctx = reformRawIcon(30, 30, "L", 3)
    ctx.drawImage(sprites["scroll"], 0,0)//0,30,40, 1,2,28,30)
    sprites["icon-scroll"] = ctx.canvas
}

function reformIconTorch() {
    const ctx = reformRawIcon(30, 30, "T", 15)
    ctx.drawImage(sprites["torch"], 0,0,8,25, 1,0,12,30)
    sprites["icon-torch"] = ctx.canvas
}

function reformIconTorchGrey() {
    const ctx = reformRawIcon(30, 30, "T", 15)
    ctx.drawImage(sprites["torch-grey"], 0,0,8,25, 1,0,12,30)
    sprites["icon-torch-grey"] = ctx.canvas
}

function reformIconWoodenKey() {
    const ctx = reformRawIcon(35, 30)
    ctx.drawImage(sprites["wooden-key"], 3,15,52,27, 0,6,35,18)
    sprites["icon-wooden-key"] = ctx.canvas
}

function reformIconIronKey() {
    const ctx = reformRawIcon(35, 30)
    ctx.drawImage(sprites["iron-key"], 3,15,52,27, 0,6,35,18)
    sprites["icon-iron-key"] = ctx.canvas
}

function reformIconCopperKey() {
    const ctx = reformRawIcon(35, 30)
    ctx.drawImage(sprites["copper-key"], 3,15,52,27, 0,6,35,18)
    sprites["icon-copper-key"] = ctx.canvas
}

function reformIconBrightGem() {
    const ctx = reformRawIcon(30, 30)
    ctx.drawImage(sprites["bright-gem45"], 0,0,45,45, 0,1,30,28)
    sprites["icon-bright-gem"] = ctx.canvas
}

// main bar ///////////////////////////////////////////////////////////////////

function reformMainBar() {
    const cnv = makeEmptyCanvas(780, 36) // thin bar
    const ctx = cnv.getContext("2d")
    ctx.fillStyle = "rgb(230,230,230)"
    ctx.fillRect(0, 0, 780, 1)
    ctx.drawImage(sprites["main-bar-texture"], 0, 1)
    drawHeartOnMainBar(ctx)
    //
    setMainbarCtx(ctx)
    sprites["main-bar-raw"] = cloneImage(cnv)
}

function drawHeartOnMainBar(ctx) { // editor will overwrite
    ctx.drawImage(sprites["icon-heart"], 747, 4)
}

// loot ///////////////////////////////////////////////////////////////////////

function reformLoot() {
    reformLootSpeedOil()
    reformLootManaPotion()
    reformLootHealthPotion()
    reformLootAntidotePotion()
}

function reformLootSpeedOil() {
    const cnv = makeEmptyCanvas(60, 60)
    const ctx = cnv.getContext("2d")
    ctx.drawImage(sprites["source-speed-oil"], 0,0,27,45, 17,10,27,40)
    sprites["speed-oil"] = cnv
}

function reformLootHealthPotion() {
    const cnv = makeEmptyCanvas(60, 60)
    const ctx = cnv.getContext("2d")
    ctx.drawImage(sprites["source-health-potion"], 0,0,60,60, 10,10,42,42)
    sprites["health-potion"] = cnv
}

function reformLootManaPotion() {
    const cnv = makeEmptyCanvas(60, 60)
    const ctx = cnv.getContext("2d")
    ctx.drawImage(sprites["source-mana-potion"], 0,0,37,60, 15,12,30,32)
    sprites["mana-potion"] = cnv
}

function reformLootAntidotePotion() {
    const cnv = makeEmptyCanvas(60, 60)
    const ctx = cnv.getContext("2d")
    ctx.drawImage(sprites["source-antidote-potion"], 0,0,18,45, 21,15,18,35)
    sprites["antidote-potion"] = cnv
}

// grass //////////////////////////////////////////////////////////////////////

function reformGrass() {
    divideBigSprite(sprites["GRASS"], "grass-a", "grass-b", "grass-c", "grass-d")
}

// swamp //////////////////////////////////////////////////////////////////////

function reformSwamp() {
    divideBigSprite(sprites["SWAMP"], "swamp-a", "swamp-b", "swamp-c", "swamp-d")
    //
    sprites["swamp-border-south"] = verticalReverse(sprites["swamp-border-north"])
    sprites["swamp-border-east"]  = horizontalReverse(sprites["swamp-border-west"])
    //
    reformSwampSprite("a")
    reformSwampSprite("b")
    reformSwampSprite("c")
    reformSwampSprite("d")
}

function reformSwampSprite(tail) {
    const list = [ "n","s","e","w","ne","ns","nw","se","sw","ew","nse","nsw","new","sew", "nsew" ]
    for (const sufix of list) { reformSwampSpriteWith(tail, sufix) }
}

function reformSwampSpriteWith(tail, data) {
    let base = sprites["swamp-" + tail]
    const id = "swamp-" + tail + "+" + data
    //
    while (data != "") {
        const letter = data[0]
        data = data.substr(1)
        let sufix
        if (letter == "n") { sufix = "north" }
        if (letter == "s") { sufix = "south" }
        if (letter == "e") { sufix = "east" }
        if (letter == "w") { sufix = "west" }
        //
        base = joinCanvases(base, sprites["swamp-border-" + sufix])
    }
    sprites[id] = base
}

// desert /////////////////////////////////////////////////////////////////////

function reformDesert() {
    sprites["desert-a"] = makeDesert(   0,    0)
    sprites["desert-b"] = makeDesert( -60,    0)
    sprites["desert-c"] = makeDesert(-120,    0)
    sprites["desert-d"] = makeDesert(   0,  -60)
    sprites["desert-e"] = makeDesert( -60,  -60)
    sprites["desert-f"] = makeDesert(-120,  -60)
    sprites["desert-g"] = makeDesert(   0, -120)
    sprites["desert-h"] = makeDesert( -60, -120)
    sprites["desert-i"] = makeDesert(-120, -120)
}

function makeDesert(left, top) {
    const cnv = makeEmptyCanvas(60, 60)
    const ctx = cnv.getContext("2d")
    ctx.drawImage(sprites["DESERT"], left, top)
    return cnv
}

// trees //////////////////////////////////////////////////////////////////////

function reformTrees() {
    sprites["tree-j2"] = scale("tree-j", 60, 100)
}

// floor //////////////////////////////////////////////////////////////////////

function reformFloor() {
    divideBigSprite(sprites["floor-b"], "floor-ba", "floor-bb", "floor-bc", "floor-bd")
    divideBigSprite(sprites["floor-g"], "floor-ga", "floor-gb", "floor-gc", "floor-gd")
}

// sandgrass //////////////////////////////////////////////////////////////////

function reformSandGrass(id) {
    sprites[id + "a"] = joinSprites("grass-a",  id)
    sprites[id + "b"] = joinSprites("grass-b",  id)
    sprites[id + "c"] = joinSprites("grass-c",  id)
    sprites[id + "d"] = joinSprites("grass-d",  id)
}

// sanddesert /////////////////////////////////////////////////////////////////

function reformSandDesert(id) {
    const over = cloneImage(sprites[id])
    replaceColor(over, [137,170,75,255], [176,128,96,255])
    id = id.replace("grass", "desert")
    sprites[id + "a"] = joinCanvases(sprites["desert-a"], over)
    sprites[id + "b"] = joinCanvases(sprites["desert-b"], over)
    sprites[id + "c"] = joinCanvases(sprites["desert-c"], over)
    sprites[id + "d"] = joinCanvases(sprites["desert-d"], over)
    sprites[id + "e"] = joinCanvases(sprites["desert-e"], over)
    sprites[id + "f"] = joinCanvases(sprites["desert-f"], over)
    sprites[id + "g"] = joinCanvases(sprites["desert-g"], over)
    sprites[id + "h"] = joinCanvases(sprites["desert-h"], over)
    sprites[id + "i"] = joinCanvases(sprites["desert-i"], over)
}

// beach //////////////////////////////////////////////////////////////////////

function reformBeachesLow() {
    sprites["beach-low-a1"] = sprites["beach-a"]
    sprites["beach-low-a2"] = horizontalReverse(sprites["beach-a"])
    sprites["beach-low-a3"] = verticalReverse(sprites["beach-a"])
    sprites["beach-low-a4"] = verticalReverse(sprites["beach-low-a2"])
    //
    sprites["beach-low-b1"] = sprites["beach-b"]
    sprites["beach-low-b2"] = horizontalReverse(sprites["beach-b"])
    sprites["beach-low-b3"] = verticalReverse(sprites["beach-b"])
    sprites["beach-low-b4"] = verticalReverse(sprites["beach-low-b2"])
    //
    sprites["beach-low-c1"] = sprites["beach-c"]
    sprites["beach-low-c2"] = verticalReverse(sprites["beach-c"])
    sprites["beach-low-c3"] = rotate90(sprites["beach-low-c2"])
    sprites["beach-low-c4"] = horizontalReverse(sprites["beach-low-c3"])
    //
    sprites["beach-low-d1"] = sprites["beach-d"]
    sprites["beach-low-d2"] = verticalReverse(sprites["beach-d"])
    sprites["beach-low-d3"] = rotate90(sprites["beach-low-d2"])
    sprites["beach-low-d4"] = horizontalReverse(sprites["beach-low-d3"])
}

/* reserved

function reformBeachesHigh() {
    sprites["beach-high-a1"] = rotateMix(sprites["beach-low-a1"])
    sprites["beach-high-a2"] = rotateMix(sprites["beach-low-a3"])
    sprites["beach-high-a3"] = rotateMix(sprites["beach-low-a2"])
    sprites["beach-high-a4"] = rotateMix(sprites["beach-low-a4"])
    //
    sprites["beach-high-b1"] = rotateMix(sprites["beach-low-b1"])
    sprites["beach-high-b2"] = rotateMix(sprites["beach-low-b3"])
    sprites["beach-high-b3"] = rotateMix(sprites["beach-low-b2"])
    sprites["beach-high-b4"] = rotateMix(sprites["beach-low-b4"])
    //
    sprites["beach-high-c1"] = horizontalReverse(sprites["beach-low-c1"])
    sprites["beach-high-c2"] = horizontalReverse(sprites["beach-low-c2"])
    sprites["beach-high-c3"] = verticalReverse(sprites["beach-low-c3"])
    sprites["beach-high-c4"] = verticalReverse(sprites["beach-low-c4"])
    //
    sprites["beach-high-d1"] = horizontalReverse(sprites["beach-low-d1"])
    sprites["beach-high-d2"] = horizontalReverse(sprites["beach-low-d2"])
    sprites["beach-high-d3"] = verticalReverse(sprites["beach-low-d3"])
    sprites["beach-high-d4"] = verticalReverse(sprites["beach-low-d4"])
}
*/

function reformBeach(id) {
    if (id == "beach-a") { return }
    if (id == "beach-b") { return }
    if (id == "beach-c") { return }
    if (id == "beach-d") { return }
    //
    processBeach(id, "nw",  0,  0)
    processBeach(id, "ne", 60,  0)
    processBeach(id, "sw",  0, 60)
    processBeach(id, "se", 60, 60)
}

function processBeach(id, sufix, left, top) {
    const cnv = cloneImage(sprites["sand"])
    const ctx = cnv.getContext("2d")
    ctx.drawImage(sprites[id], -left, -top)
    replaceColor(cnv, [255,0,255,255], [0,0,0,0])
    //
    sprites[id + sufix + "-" + "1"] = joinCanvases(sprites["ocean-1"], cnv)
    sprites[id + sufix + "-" + "2"] = joinCanvases(sprites["ocean-2"], cnv)
    sprites[id + sufix + "-" + "3"] = joinCanvases(sprites["ocean-3"], cnv)
}

// ### file: sprite-reform2.js ###

"use strict"

// blocks /////////////////////////////////////////////////////////////////////

function reformBlocks() {
//  sprites["block-z"] = horizontalReverse(sprites["block-a"])
    sprites["block-b"] = makeBlock(65,120,0,0,0,30)
    sprites["block-c"] = makeBlock(75,120,10,0,0,30)
    sprites["block-d"] = makeBlock(75,120,0,0,10,30)
    sprites["block-e"] = verticalReverse(rotate90(sprites["altar"]))
}

function makeBlock(width, height, leftA, topA, leftB, topB) {
    const cnv = makeEmptyCanvas(width, height)
    const ctx = cnv.getContext("2d")
 // ctx.fillStyle="pink"
 // ctx.fillRect(0,0,width,height)
    ctx.drawImage(sprites["block-a"], leftA, topA)
    ctx.drawImage(sprites["block-a"], leftB, topB)
    return cnv
}

// altars /////////////////////////////////////////////////////////////////////

function reformAltars() {
    reformAltarChain()
    //
    reformAltarAntidote()
    reformAltarGem("bright-gem")
    reformAltarGem("dark-gem")
    reformAltarHealth()
    reformAltarKey("copper")
    reformAltarKey("iron")
    reformAltarKey("wooden")
    reformAltarMana()
    reformAltarScroll()
    reformAltarSkull("skull-left")
    reformAltarSkull("skull-right")
}

function reformAltarChain() {
    const cnv = makeEmptyCanvas(120, 70)
    const ctx = cnv.getContext("2d")
    ctx.drawImage(sprites["altar"], 0, 0)
    ctx.drawImage(sprites["ring-for-altar"], 37, 15)
    ctx.drawImage(sprites["ring-for-altar"], 50, 18)
    ctx.drawImage(sprites["ring-for-altar"], 75,  0)
    ctx.drawImage(sprites["ring-for-altar"], 65, 10)
    sprites["altar-chain"] = cnv
}

function reformAltarAntidote() {
    // remarked values are for tall bottle
    const cnv = makeEmptyCanvas(120, 80) // 95
    const ctx = cnv.getContext("2d")
    ctx.drawImage(sprites["altar"], 0, 10) // 25)
    const spr = sprites["source-antidote-potion"]
   // ctx.drawImage(spr, 55,0)
    ctx.drawImage(spr, 0,0,spr.width,spr.height, 54,0,spr.width,30)
    sprites["altar-antidote"] = cnv
}

function reformAltarGem(bmp) {
    const cnv = makeEmptyCanvas(120, 80)
    const ctx = cnv.getContext("2d")
    ctx.drawImage(sprites["altar"], 0, 10)
    const spr = sprites[bmp + "45"]
    ctx.drawImage(spr, 0,0,spr.width,spr.height, 47,0,30,30)
    sprites["altar-" + bmp] = cnv
}

function reformAltarHealth() {
    const cnv = makeEmptyCanvas(120, 90)
    const ctx = cnv.getContext("2d")
    ctx.drawImage(sprites["altar"], 0, 20)
    const spr = sprites["source-health-potion"]
    ctx.drawImage(spr, 0,0,spr.width,spr.height, 40,0,42,42)
    sprites["altar-health"] = cnv
}

function reformAltarKey(kind) {
    const cnv = makeEmptyCanvas(120, 80)
    const ctx = cnv.getContext("2d")
    ctx.drawImage(sprites["altar"], 0, 10)
    const spr = sprites[kind + "-key"]
    ctx.drawImage(spr, 38, -12)
    sprites["altar-" + kind + "-key"] = cnv
}

function reformAltarMana() {
    const cnv = makeEmptyCanvas(120, 90)
    const ctx = cnv.getContext("2d")
    ctx.drawImage(sprites["altar"], 0, 20)
    const spr = sprites["source-mana-potion"]
    ctx.drawImage(spr, 0,0,spr.width,spr.height, 40,0,42,42)
    sprites["altar-mana"] = cnv
}

function reformAltarScroll() {
    const cnv = makeEmptyCanvas(120, 80)
    const ctx = cnv.getContext("2d")
    ctx.drawImage(sprites["altar"], 0, 10)
    const spr = sprites["scroll"]
    ctx.drawImage(spr, 0,0,spr.width,spr.height, 40,0,40,40)
    sprites["altar-scroll"] = cnv
}

function reformAltarSkull(bmp) {
    const cnv = makeEmptyCanvas(120, 80)
    const ctx = cnv.getContext("2d")
    ctx.drawImage(sprites["altar"], 0, 10)
    const spr = sprites[bmp]
    ctx.drawImage(spr, 0,0,spr.width,spr.height, 45,0,35,35)
    sprites["altar-" + bmp] = cnv
}

// pedestals //////////////////////////////////////////////////////////////////

function reformPedestals() {
    reformPedestal("bright-gem")
    reformPedestal("dark-gem")
}

function reformPedestal(bmp) {
    const cnv = makeEmptyCanvas(64, 85)
    const ctx = cnv.getContext("2d")
    ctx.drawImage(sprites["block-a2"], 0, 15)
    const spr = sprites[bmp + "45"]
    ctx.drawImage(spr, 0,0,spr.width,spr.height, 16,1,30,30)
    sprites["pedestal-" + bmp] = cnv
}

// bonfire ////////////////////////////////////////////////////////////////////

function reformBonfires() {
    sprites["bonfire-1"] = sprites["bonfire"]
    sprites["bonfire-2"] = horizontalReverse(sprites["bonfire-1"])
    //
    makeMiniBonfire("bonfire-1")
    makeMiniBonfire("bonfire-2")
    makeFlame("bonfire-1", "flame-2")
    makeFlame("bonfire-2", "flame-1")
    drawFlameOnBonfire("bonfire-1", "flame-1")
    drawFlameOnBonfire("bonfire-2", "flame-2")
}

function makeMiniBonfire(bmp) {
    const cnv = makeEmptyCanvas(60, 60)
    const ctx = cnv.getContext("2d")
    const spr = sprites[bmp]
    ctx.drawImage(spr, 0,0,spr.width,spr.height, 15,15,30,30)
    sprites["mini" + bmp] = cnv
}

function makeFlame(bmp, name) {
    const cnv = makeEmptyCanvas(60, 40)
    const ctx = cnv.getContext("2d")
    const spr = sprites[bmp]
    ctx.drawImage(spr, 0,0,spr.width,spr.height, 6,0,50,40)
    sprites[name] = cnv
}

function drawFlameOnBonfire(a, b) {
    sprites[a].getContext("2d").drawImage(sprites[b], 0, 28)
}

// blufire ////////////////////////////////////////////////////////////////////

function reformBlufires() {
    makeBlufire("flame-1", "bluflame-1")
    makeBlufire("flame-2", "bluflame-2")
    makeBlufire("bonfire-1", "blufire-1")
    makeBlufire("bonfire-2", "blufire-2")
    makeBlufire("minibonfire-1", "miniblufire-1")
    makeBlufire("minibonfire-2", "miniblufire-2")
}

function makeBlufire(red, blu) {
    sprites[blu] = cloneImage(sprites[red])
    swapColors(sprites[blu], 0, 2) // red and blue
}

// well ///////////////////////////////////////////////////////////////////////

function reformWell() {
    sprites["well"] = scale("well", 120, 90)
}

// spears /////////////////////////////////////////////////////////////////////

function reformSpears() {
    sprites["spear-southeast"] = rotate90(sprites["spear-northeast"])
    sprites["spear-southwest"] = horizontalReverse(sprites["spear-southeast"])
    sprites["spear-northwest"] = horizontalReverse(sprites["spear-northeast"])
    sprites["spear-south"] = verticalReverse(sprites["spear-north"])
    sprites["spear-east"]  = rotate90(sprites["spear-north"])
    sprites["spear-west"]  = rotate90(sprites["spear-south"])
}

// setas //////////////////////////////////////////////////////////////////////

function reformSetas() {
    // seta (aim)
    sprites["seta-southeast"] = rotate90(sprites["seta-northeast"])
    sprites["seta-southwest"] = horizontalReverse(sprites["seta-southeast"])
    sprites["seta-northwest"] = horizontalReverse(sprites["seta-northeast"])
    sprites["seta-south"] = verticalReverse(sprites["seta-north"])
    sprites["seta-east"]  = rotate90(sprites["seta-north"])
    sprites["seta-west"]  = rotate90(sprites["seta-south"])
    // seta2 (direction)
    for (const dir of allDirections) {
        const cnv = cloneImage(sprites["seta-" + dir])
        swapColors(cnv, 1, 2)
        replaceColor(cnv, [255,0,0,255], [255,215,0,255])
        sprites["seta2-" + dir] = cnv
    }
}

// creatures stone golem //////////////////////////////////////////////////////

function reformStoneGolem() {
    sprites["stone-golem-north-right"] = horizontalReverse(sprites["stone-golem-north-left"])
    sprites["stone-golem-south-right"] = horizontalReverse(sprites["stone-golem-south-left"])
    sprites["stone-golem-west-stand"]  = horizontalReverse(sprites["stone-golem-east-stand"])
    sprites["stone-golem-west-left"]   = horizontalReverse(sprites["stone-golem-east-right"])
    sprites["stone-golem-west-right"]  = horizontalReverse(sprites["stone-golem-east-left"])
}

// creatures wood golem ///////////////////////////////////////////////////////

function reformWoodGolem() {
    // left or right means the foot that is closer to bottom,
    // according to the screen not the creature
    const front = sprites["wood-golem-front"]
    const back  = sprites["wood-golem-back"]
    const frontRev = horizontalReverse(front)
    const backRev  = horizontalReverse(back)
    //
    sprites["wood-golem-south-left"]  = front
    sprites["wood-golem-south-right"] = frontRev
    sprites["wood-golem-north-left"]   = back
    sprites["wood-golem-north-right"]  = backRev
}

// creatures single sprite ////////////////////////////////////////////////////

function reformSingleSpriteCreatures() {
    reformSingleSpriteCreature("redzag")
    reformSingleSpriteCreature("chess-golem")
    reformSingleSpriteCreature("ice-golem")
    reformSingleSpriteCreature("walking-hole")
}

function reformSingleSpriteCreature(name) {
    const spr = sprites[name]
    const rev = horizontalReverse(spr)
    //
    sprites[name + "-south-left" ] = spr
    sprites[name + "-south-right"] = rev
    //
    sprites[name + "-north-left" ] = spr
    sprites[name + "-north-right"] = rev
    //
    sprites[name + "-west-left" ] = spr
    sprites[name + "-west-right"] = rev
    //
    sprites[name + "-east-left" ] = spr
    sprites[name + "-east-right"] = rev
}

// creatures double sprite ////////////////////////////////////////////////////

function reformDoubleSpriteCreatures() {
    reformDoubleSpriteCreature("greedy-soul")
}

function reformDoubleSpriteCreature(name) {
    sprites[name + "-north" + "-left" ] = sprites[name + "-left" ]
    sprites[name + "-north" + "-right"] = sprites[name + "-right"]
    //
    sprites[name + "-south" + "-left" ] = sprites[name + "-left" ]
    sprites[name + "-south" + "-right"] = sprites[name + "-right"]
    //
    sprites[name + "-east"  + "-left" ] = sprites[name + "-left" ]
    sprites[name + "-east"  + "-right"] = sprites[name + "-right"]
    //
    sprites[name + "-west"  + "-left" ] = sprites[name + "-left" ]
    sprites[name + "-west"  + "-right"] = sprites[name + "-right"]
}

// creatures triple sprite ////////////////////////////////////////////////////

function reformTripleSpriteCreatures() {
    reformTripleSpriteCreature("gangrene")
    reformTripleSpriteCreature("living-fog")
}

function reformTripleSpriteCreature(name) { // also called by reformDoubleSpriteCreature
    sprites[name + "-north" + "-stand"] = sprites[name + "-stand"]
    sprites[name + "-north" + "-left" ] = sprites[name + "-left" ]
    sprites[name + "-north" + "-right"] = sprites[name + "-right"]
    //
    sprites[name + "-south" + "-stand"] = sprites[name + "-stand"]
    sprites[name + "-south" + "-left" ] = sprites[name + "-left" ]
    sprites[name + "-south" + "-right"] = sprites[name + "-right"]
    //
    sprites[name + "-east"  + "-stand"] = sprites[name + "-stand"]
    sprites[name + "-east"  + "-left" ] = sprites[name + "-left" ]
    sprites[name + "-east"  + "-right"] = sprites[name + "-right"]
    //
    sprites[name + "-west"  + "-stand"] = sprites[name + "-stand"]
    sprites[name + "-west"  + "-left" ] = sprites[name + "-left" ]
    sprites[name + "-west"  + "-right"] = sprites[name + "-right"]
}

// shots //////////////////////////////////////////////////////////////////////

function reformPoisonBall() {
    sprites["poison-ball-1"] = scale("smoke-1", 40, 40)
    sprites["poison-ball-2"] = scale("smoke-2", 40, 40)
    sprites["poison-ball-3"] = scale("smoke-3", 40, 40)
    sprites["poison-ball-4"] = scale("smoke-4", 40, 40)
}

// bubbles ////////////////////////////////////////////////////////////////////

function reformBubbles() { // smoke bubbles
    colorizeSprite(sprites["bubbles-1"], [160,160,160,255])
    colorizeSprite(sprites["bubbles-2"], [160,160,160,255])
    colorizeSprite(sprites["bubbles-3"], [160,160,160,255])
    colorizeSprite(sprites["bubbles-4"], [160,160,160,255])
}

// life bar ///////////////////////////////////////////////////////////////////

function reformLifeBars() {
    for (let n = 0; n < 101; n++) { reformLifeBar(n) }
}

function reformLifeBar(life) { // life: 0 to 100
    const cnv = cloneImage(sprites["lifebar-raw"])
    const ctx = cnv.getContext("2d")
    ctx.fillStyle = colorForLifeBar(life)
    // head
    if (life != 0) { ctx.fillRect(2, 3, 1, 2) }
    // body
    const width = Math.round(life / 100 * 24)
    ctx.fillRect(3, 2, width, 4)
    // tail
    if (life == 100) { ctx.fillRect(27, 3, 1, 2) }
    //
    sprites["lifebar-" + life] = cnv
 }

function colorForLifeBar(life) {
    const arr = arrayColorForLifeBar(life)
    return "rgb(" + arr[0] + "," + arr[1] + "," +  arr[2] +")"
}

function arrayColorForLifeBar(life) {
    if (life > 90) { return [ 70, 240, 90, 255] }
    if (life > 80) { return [110, 220, 90, 255] }
    if (life > 70) { return [160, 240,100, 255] }
    if (life > 60) { return [190, 220, 90, 255] }
    if (life > 50) { return [225, 200, 75, 255] }
    if (life > 40) { return [255, 215,  0, 255] }
    if (life > 30) { return [255,  99, 71, 255] }
    if (life > 20) { return [255,  69,  0, 255] }
    if (life > 10) { return [255,   0,  0, 255] }
    return [255, 0, 0, 255]
}

// loot gems //////////////////////////////////////////////////////////////////

function reformGemsForLoot() {
    reformGemForLoot("bright-gem")
    reformGemForLoot("dark-gem")
}

function reformGemForLoot(bmp) {
    const cnv = makeEmptyCanvas(60, 60)
    const ctx = cnv.getContext("2d")
    const spr = sprites[bmp + "45"]
    ctx.drawImage(spr, 0,0,45,45, 15,12,30,30)
    sprites[bmp] = cnv
}

// sword //////////////////////////////////////////////////////////////////////

function reformSword() {
    const cnv = makeEmptyCanvas(60, 60)
    const ctx = cnv.getContext("2d")
    ctx.drawImage(sprites["sword"], 0,0,60,60, 10,10,40,40)
    sprites["sword2"] = cnv
}

// armor //////////////////////////////////////////////////////////////////////

function reformArmor() {
    sprites["armor2"] = sprites["chain-armor"]
    //
    const cnv = makeEmptyCanvas(60, 60)
    const ctx = cnv.getContext("2d")
    ctx.drawImage(sprites["armor2"], 0,0,60,60, 10,10,40,40)
    sprites["armor1"] = cnv
}

// shield /////////////////////////////////////////////////////////////////////

function reformShield() {
    const cnv = makeEmptyCanvas(60, 60)
    const ctx = cnv.getContext("2d")
    ctx.drawImage(sprites["shield"], 0,0,60,60, 10,5,40,40)
    sprites["shield2"] = cnv
}

// null sprite ////////////////////////////////////////////////////////////////

function reformNullSprite() {
    const cnv = makeEmptyCanvas(60, 60)
    const ctx = cnv.getContext("2d")
    ctx.fillStyle = "rgb(20,30,10)"
    ctx.fillRect(0, 0, 60, 60)
    sprites["null"] = cnv
}

// ### file: sprite-teleport.js ###

"use strict"

var teleportTable = {
    // creature, block
    "a": { "opacity": 1.00, "chanceWN": 0.02 },
    "b": { "opacity": 0.98, "chanceWN": 0.05 },
    "c": { "opacity": 0.98, "chanceWN": 0.10 },
    "d": { "opacity": 0.98, "chanceWN": 0.20 },
    "e": { "opacity": 0.98, "chanceWN": 0.30 },
    "f": { "opacity": 0.94, "chanceWN": 0.30 },
    "g": { "opacity": 0.86, "chanceWN": 0.30 },
    "h": { "opacity": 0.78, "chanceWN": 0.30 },
    "i": { "opacity": 0.70, "chanceWN": 0.30 },
    "j": { "opacity": 0.59, "chanceWN": 0.30 },
    "k": { "opacity": 0.47, "chanceWN": 0.30 },
    "l": { "opacity": 0.35, "chanceWN": 0.30 },
    "m": { "opacity": 0.27, "chanceWN": 0.25 },
    "n": { "opacity": 0.19, "chanceWN": 0.22 },
    "o": { "opacity": 0.12, "chanceWN": 0.20 },
    "p": { "opacity": 0.10, "chanceWN": 0.17 },
    "q": { "opacity": 0.06, "chanceWN": 0.15 },
    "r": { "opacity": 0.04, "chanceWN": 0.12 },
    "s": { "opacity": 0.02, "chanceWN": 0.10 },
    "t": { "opacity": 0.02, "chanceWN": 0.05 },
    "u": { "opacity": 0.02, "chanceWN": 0.02 },
    // portal
    "1": { "opacity": 0.98, "chanceWN": 0.20 },
    "2": { "opacity": 0.98, "chanceWN": 0.20 },
    "3": { "opacity": 0.98, "chanceWN": 0.20 },
    "4": { "opacity": 0.98, "chanceWN": 0.20 },
    "5": { "opacity": 0.98, "chanceWN": 0.20 },
    "6": { "opacity": 0.98, "chanceWN": 0.20 },
    "!": { "opacity": 0.90, "chanceWN": 0.00 },
    // special
    "#": { "opacity": 1.00, "chanceWN": 0.00 }, // original
    " ": { "opacity": 0.00, "chanceWN": 0.00 }  // blank
}

function makeTeleportSprite(fullname) {
    const parts = fullname.split("*")
    const bmp = parts[0]
    const key = parts[1].toLowerCase() // Math.random makes sprite*a != sprite*A
    //
    let plus = 50
    if (bmp == "block-e") { plus = 0 }
    const item = teleportTable[key]
    return makeTeleportSpriteCore(sprites[bmp], item["opacity"], item["chanceWN"], plus)
}

// core ///////////////////////////////////////////////////////////////////////

function makeTeleportSpriteCore(src, opacity, chanceOfWhiteNoise, plus) {
    const cnv = cloneImage(src)
    const ctx = cnv.getContext("2d")
    const width   = cnv.width
    const height  = cnv.height
    const imgdata = ctx.getImageData(0, 0, width, height)
    //
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = 4 * (width * y + x)
            setTeleportPixel(imgdata.data, index, opacity, chanceOfWhiteNoise, plus)
        }
    }
    ctx.putImageData(imgdata, 0, 0)
    return cnv
}

function setTeleportPixel(data, index, opacity, chanceOfWhiteNoise, plus) {
    const r = data[index]
    const g = data[index + 1]
    const b = data[index + 2]
    const a = data[index + 3]
    //
    if (a == 0) { return } // blank
    //
    let alpha = a
    let grey = 230 // white noise
    //
    if (Math.random() > chanceOfWhiteNoise) { // so not white noise
        const temp =((r+g+b) / 3)
        grey = Math.floor(temp) + plus
        if (grey > 255) { grey = 255 }
        //
        alpha = Math.floor(a * opacity)
    }
    //
    data[index    ] = grey
    data[index + 1] = grey
    data[index + 2] = grey
    data[index + 3] = alpha
}

// ### file: square-obj.js ###

"use strict"

function Square() {
    // from map
    this.layerA = ""   // sea, sand, grass
    this.layerB = ""   // minibonfire, flowers...
    this.layerC = ""   // bonfire, smoke, trees, stones, portal, chest...
    this.deltaTop  = 0 // vertical displacement for B or C
    this.deltaLeft = 0 // horizontal displacement for B or C
    // from play
    this.shots   = null  // array of Shot
    this.objects = null  // array of String; loot, spears (are drawn under creatures and shots)
    this.creature = null
    // logic
    this.walkable = true // sea, tree, stone, chest, portal (**)
    this.blocked = false // tree, stone, chest, creature, portal (**) // important for *shots*
    this.field = ""      // bonfire, smoke, blufire (layerB)
    this.puddleKind = "" // puddle is drawn under any field, object, creature or shot
    this.puddleTimer = 0 //
    this.effect = ""     // string sequence for entered portal and withdrawable block
    this.effectClock = 0
    this.trigger = null  // for avatar, npc and/or monster; NOT a string!
}

// (*) shots are drawn over creatures

// (**) portal blocked is good for shots
//      portal not walkable is good for creatures; avatar is special case

function makeSquare() {
    const sqr = new Square()
    Object.seal(sqr)
    return sqr
}

// ### file: square-ops.js ###

"use strict"

var SHALL_CONSIDER_FIELDS = false

// creature ///////////////////////////////////////////////////////////////////

function enterSquare(creature, row, col) {
    const sqr = getSquare(row, col)
    sqr.creature = creature
    sqr.blocked = true
}

function leaveSquare(row, col) {
    const sqr = getSquare(row, col)
    sqr.creature = null
    sqr.blocked = false
}

// shots //////////////////////////////////////////////////////////////////////

function placeShotInSquare(shot) {
    const sqr = getSquare(shot.row, shot.col)
    if (sqr.shots == null) { sqr.shots = [ shot ]; return }
    sqr.shots.push(shot)
}

function removeShotFromSquare(shot) {
    const sqr = getSquare(shot.row, shot.col)
    if (sqr.shots.length == 1) { sqr.shots = null; return }
    //
    const index = sqr.shots.indexOf(shot)
    sqr.shots.splice(index, 1)
}

// objects ////////////////////////////////////////////////////////////////////

function placeObjectOnSquare(item, row, col) {
    const sqr = getSquare(row, col)
    if (sqr.objects == null) { sqr.objects = [ item ]; return }
    sqr.objects.push(item)
}

function removeObjectFromSquare(row, col) { // removes last item
    const sqr = getSquare(row, col)
    const item = sqr.objects.pop()
    if (sqr.objects.length == 0) { sqr.objects = null }
    return item
}

// volume /////////////////////////////////////////////////////////////////////

function removeVolumeFromSquare(sqr) {
    sqr.layerC = ""
    sqr.walkable = true
    sqr.blocked  = false
}

function placeVolumeOnSquare(sqr, volume) {
    sqr.layerC = volume
    sqr.walkable = false
    sqr.blocked  = true
}

function convertToDoorLow(sqr) {
    sqr.layerB = "door-low"
    sqr.layerC = ""
    sqr.walkable = true
    sqr.blocked = false
}

// blufire ////////////////////////////////////////////////////////////////////

function convertBlufire(sqr) {// from blue to red
    sqr.layerB = "bonfire"
    sqr.field  = "bonfire"
}

// effect /////////////////////////////////////////////////////////////////////

function setSquareEffect(sqr, effect, effectClock) {
    sqr.effect = effect
    sqr.effectClock = effectClock
}

// is free square /////////////////////////////////////////////////////////////

function respectFields() {
    SHALL_CONSIDER_FIELDS = true
}

function ignoreFields() {
    SHALL_CONSIDER_FIELDS = false
}

function isFreeSquare(row, col) {
    const sqr = getSquare(row, col)
    if (sqr == null)    { return false }
    if (! sqr.walkable) { return false }
    if (sqr.blocked)    { return false }
    return true
}

function isFreeNoFieldSquare(row, col) {
    const sqr = getSquare(row, col)
    if (sqr == null)     { return false }
    if (! sqr.walkable)  { return false }
    if (sqr.blocked)     { return false }
    if (sqr.field != "") { return false }
    return true
}

function isFreeSquareFor(creature, row, col) {
    if (creature == avatar) {
        return isFreeSquareForAvatar(row, col)
    }
    else if (SHALL_CONSIDER_FIELDS) {
        return isFreeSquareConsideringFields(creature, row, col)
    }
    else {
        return isFreeSquare(row, col)
    }
}

function isFreeSquareConsideringFields(creature, row, col) {
    const sqr = getSquare(row, col)
    if (sqr == null)     { return false }
    if (! sqr.walkable)  { return false }
    if (sqr.blocked)     { return false }
    if (sqr.field == "") { return true  }
    //
    if (sqr.field == "bonfire") { return creature.immuneFire }
    if (sqr.field == "smoke")   { return creature.immunePoison }
    //
    return false
}

// ### file: table.js ###

"use strict"

// when new sprites come, must check functions
// - markSquareByLayerC
// - markSquareByRightNeighbour

var numberOfRows = 0
var numberOfCols = 0

var episodeTable = null
var tableIsReady = false

// square /////////////////////////////////////////////////////////////////////

function getSquare(row, col) {
    if (row < 0) { return null }
    if (col < 0) { return null }
    if (row >= numberOfRows) { return null }
    if (col >= numberOfCols) { return null }
    //
    const n = row * numberOfCols + col
    return episodeTable[n]
}

// table //////////////////////////////////////////////////////////////////////

function loadMap(path) {
    tableIsReady = false
    httpDownloadText(path, mapLoaded)
}

function mapLoaded(path, txt) {
    console.log("loaded", path)
    //
    makeGlobalTableFromMap(txt.trim()) // trim() clears <EOF> in handmade files
    markSquares()
    tableIsReady = true
}

///////////////////////////////////////////////////////////////////////////////

function makeGlobalTableFromMap(s) {
    const obj = makeTableObjFromMap(s)
    episodeTable = obj.table
    numberOfRows = obj.height
    numberOfCols = obj.width
}

function makeTableObjFromMap(s) {
    const table = [ ] // for editor
    const tokens = s.split(" ")
    const width  = parseInt(tokens.shift())
    const height = parseInt(tokens.shift())
    //
    while (tokens.length != 0) {
        const token = tokens.shift()
        const sqr = makeSquareFromMapToken(token)
        table.push(sqr)
    }
    //
    return { "table": table, "height": height, "width": width }
}

function makeSquareFromMapToken(s) {
    const sqr = makeSquare()
    const tokens = s.split(";")
    const len = tokens.length
    //
    sqr.layerA = decodeLayerA(tokens[0])
    if (len == 1) { return sqr }
    //
    sqr.layerB = decodeLayerB(tokens[1])
    if (len == 2) { return sqr }
    //
    sqr.layerC = decodeLayerC(tokens[2])
    if (len == 3) { return sqr }
    // displacement
    const pair = tokens[3].split(",")
    sqr.deltaTop  = parseInt(pair[0])
    sqr.deltaLeft = parseInt(pair[1])
    return sqr
}

// decode /////////////////////////////////////////////////////////////////////

// >>> [single_code] and [group_code] must not share first letter!
// concrete case:
// "b" was for minibonfire then "bb" was produced for miniblufire,
// but "bb" was alread used for ballast...
// so miniblufire suddenly appeared on episode brave-new-world!

function decodeLayerA(s) {
    if (s == "")  { return "" }
    if (s == "s") { return "sand" }
    if (s == "o") { return "ocean" }
    if (s[0] == "b") { return "beach-"      + s.substr(1) }
    if (s[0] == "d") { return "desert-"     + s.substr(1) }
    if (s[0] == "D") { return "sanddesert-" + s.substr(1) }
    if (s[0] == "f") { return "floor-"      + s.substr(1) }
    if (s[0] == "g") { return "grass-"      + s.substr(1) }
    if (s[0] == "G") { return "sandgrass-"  + s.substr(1) }
    if (s[0] == "w") { return "swamp-"      + s.substr(1) }
    alert("ERROR: layer A has undefined decoding [" + s + "]")
    return ("*error*")
}

function decodeLayerB(s) {
    if (s == "")     { return "" }
    if (s == "B")    { return "bonfire" }
    if (s == "Bb")   { return "blufire" }
    if (s == "Bm")   { return "minibonfire" }
    if (s == "Bbm")  { return "miniblufire" }
    if (s == "S")    { return "smoke" }
    if (s[0] == "b") { return "ballast-"  + s.substr(1) }
    if (s[0] == "f") { return "flower-"   + s.substr(1) }
    if (s[0] == "g") { return "gravel-"   + s.substr(1) }
    if (s[0] == "w") { return "weed-"     + s.substr(1) }
    alert("ERROR: layer B has undefined decoding [" + s + "]")
    return ("*error*")
}

function decodeLayerC(s) {
    if (s == "")    { return "" }
    if (s == "A")   { return "altar" }
    if (s == "AC")  { return "altar-chain" }
    if (s == "Aa")  { return "altar-antidote" }
    if (s == "Ah")  { return "altar-health" }
    if (s == "Abg") { return "altar-bright-gem" }
    if (s == "Adg") { return "altar-dark-gem" }
    if (s == "Ac")  { return "altar-scroll" }
    if (s == "Akc") { return "altar-copper-key" }
    if (s == "Aki") { return "altar-iron-key" }
    if (s == "Akw") { return "altar-wooden-key" }
    if (s == "Am")  { return "altar-mana" }
    if (s == "Asl") { return "altar-skull-left" }
    if (s == "Asr") { return "altar-skull-right" }
    if (s == "Pbg") { return "pedestal-bright-gem" }
    if (s == "Pdg") { return "pedestal-dark-gem" }
    if (s == "C")   { return "chest" }
    if (s == "D")   { return "door" }
    if (s == "P")   { return "portal" }
    if (s == "W")   { return "well" }
    if (s[0] == "b") { return "basalt-"  + s.substr(1) }
    if (s[0] == "k") { return "block-"   + s.substr(1) }
    if (s[0] == "s") { return "stone-"   + s.substr(1) }
    if (s[0] == "t") { return "tree-"    + s.substr(1) }
    alert("ERROR: layer C has undefined decoding [" + s + "]")
    return ("*error*")
}

// mark ///////////////////////////////////////////////////////////////////////

function markSquares() {
    //
    for (let row = 0; row < numberOfRows; row++) {
        for (let col = 0; col < numberOfCols; col++) {
            const sqr = getSquare(row, col)
            markSquare(sqr, row, col)
        }
    }
}

function markSquare(sqr, row, col) {
    if (markSquareByLayerA(sqr)) { return }
    markSquareByLayerB(sqr)
    if (markSquareByLayerC(sqr, row, col)) { return }
    markSquareByRightNeighbour(sqr, row, col)
}

function markSquareByLayerA(sqr) {
    const layer = sqr.layerA
    if (layer == "ocean") { sqr.walkable = false; return true }
    if (layer.startsWith("beach-")) { return markSquareByBeach(sqr) }
    if (layer.startsWith("swamp-")) { sqr.walkable = false; return true }
    return false
}

function markSquareByBeach(sqr) {
    const layer = sqr.layerA
    if (layer == "beach-b1se") { return false }
    if (layer == "beach-b2sw") { return false }
    if (layer == "beach-b3ne") { return false }
    if (layer == "beach-b4nw") { return false }
    sqr.walkable = false
    return true
}

function markSquareByLayerB(sqr) {
    const layer = sqr.layerB
    if (layer == "smoke")   { sqr.field = "smoke"; }
    if (layer == "bonfire") { sqr.field = "bonfire"; }
    if (layer == "blufire") { sqr.field = "blufire"; }
}

function markSquareByLayerC(sqr, row, col) {
    const layer = sqr.layerC
    if (layer == "")  { return false }
    sqr.walkable = false
    sqr.blocked = true
    // checking group of 4 squares at once
    if (layer == "basalt-nwc") { markFourSquares(row-1,col-1, row-1,col, row,col-1, row,col) }
    if (layer == "basalt-nwb") { markFourSquares(row-1,col-1, row-1,col, row,col-1, row,col) }
    return true
}

function markSquareByRightNeighbour(sqr, row, col) {
    const right = getSquare(row, col+1)
    if (right == null) { return }
    const layer = right.layerC
    if (layer == "") { return }
    // sqr.blocked = true  avoids lose spear under big stone //
    //
    if (layer == "altar")   { sqr.walkable = false; sqr.blocked = true; return }
    if (layer == "chest")   { sqr.walkable = false; sqr.blocked = true; return }
    if (layer == "door")    { sqr.walkable = false; sqr.blocked = true; return }
    if (layer == "stone-a") { sqr.walkable = false; sqr.blocked = true; return }
    if (layer == "stone-b") { sqr.walkable = false; sqr.blocked = true; return }
    if (layer == "stone-c") { sqr.walkable = false; sqr.blocked = true; return }
    if (layer == "stone-d") { sqr.walkable = false; sqr.blocked = true; return }
    if (layer == "well")    { sqr.walkable = false; sqr.blocked = true; return }
    if (layer.startsWith("altar-")) { sqr.walkable = false; sqr.blocked = true; return }
}

function markFourSquares(a,b, c,d, e,f, g,h) {
    markBlockedNotWalkable(a, b)
    markBlockedNotWalkable(c, d)
    markBlockedNotWalkable(e, f)
    markBlockedNotWalkable(g, h)
}

function markBlockedNotWalkable(row, col) {
    const sqr = getSquare(row, col)
    sqr.walkable = false
    sqr.blocked = true
}

// ### file: TEST.js ###

"use strict"

function testTAB() {
    if (shiftKeyPressed) { avatar.speed = 5 }
    avatar.torches = 10
    avatar.healthPotions = 9
    avatar.antidotePotions = 9
    avatar.speedOils = 9
    avatar.spears = 22
    avatar.manaPotions = 6
    avatar.invisibleTeas = 5
    avatar.purpleBubbles = 14
 // avatarArmor = "armor"
    avatarMeleeWeapon = "sword"
 // avatarShield = "shield"
    avatarWoodenKey = true
    avatarIronKey  = true
    avatarCopperKey = true
    avatarBrightGem = true
//  avatar.manaShield = 300
    shallUpdateMainBar = true
}

function test1() { }

function test2() { }

function test3() { }

function test4() { }

function test5() { }

function test6() { }

function test7() { startBigSwordAnimation(avatar) }

function test8() { }

function test9() { }

function test0() {
    //
    const keys = Object.keys(PAGES)
    const pages = [ ]
    //
    for (const key of keys) {
        if (key[0] != "+") { alert("Bad Page Id: " + key); return }
        //
        if (key.startsWith("+replacement")) { continue }
        //
        pages.push(PAGES[key])
    }
    show()
    //
    function show(low) {
        if (low == "escape") { return }
        if (low == ",")  { pages.unshift(pages.pop()) }
        if (low == ".")  { pages.push(pages.shift())  }
        //
        const page = pages[0].trim() // removing the final "\n"
        displayStone(page, [",", ".", "escape"], show)
        //
        displayGlobalAlpha = 1.0
     }
}

// ### file: time.js ###

"use strict"

var timeStart
var execTimes = []

var minExecTime = 0
var maxExecTime = 0
var avgExecTime = 0
var worstFps = 0

var lastLoopEnd = 0
var timeDeltas = []


function startTiming() {
    if (! DEVELOPMENT) { return }
    //
    timeStart = window.performance.now()
}

function endTiming() {
    if (! DEVELOPMENT) { return }
    //
    const now = window.performance.now()
    reportExecTime(now - timeStart)
    reportFps(now)
}

function reportExecTime(time) {
    const len = 30
    execTimes.push(time)
    if (execTimes.length < len) { return }
    if (execTimes.length > len) { execTimes.shift() }
    //
    minExecTime = 9999
    maxExecTime = -9999
    let sum = 0
    for (const time of execTimes) {
        sum += time
        if (time < minExecTime) { minExecTime = time }
        if (time > maxExecTime) { maxExecTime = time }
    }
    avgExecTime = sum / len
}

function reportFps(time) {
    const len = 30
    if (lastLoopEnd == 0) { lastLoopEnd = time - (2 * 16.6) }
    //
    const delta = time - lastLoopEnd
    timeDeltas.push(delta)
    if (timeDeltas.length > len) { timeDeltas.shift() }
    //
    let max = 0
    for (const delta of timeDeltas) { if (delta > max) { max = delta } }
    worstFps = 1000 / max
    //
    lastLoopEnd = time
}

// episode duration ///////////////////////////////////////////////////////////

function episodeDuration() {
    const seconds = Math.round(LOOP * LOOP_DURATION_IN_MS)
    return new Date(seconds).toISOString().substr(11, 8)
}
