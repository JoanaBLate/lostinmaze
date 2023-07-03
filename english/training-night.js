"use strict"

// demands 0:00 to finish //

var monitor

function setBasicConfig() {
    EPISODE = "training-night"
    MAP = "training-night"
    TITLE = "Training Night"
    DARKNESS = true
}

function setEpisodeObjects() { // all 20 spears are needed!
    placeObjectOnSquare("spear-east", 10, 29)
    placeObjectOnSquare("spear-south", 10, 29)
    placeObjectOnSquare("spear-northwest", 10, 29)
    placeObjectOnSquare("spear-north", 11, 26)
    placeObjectOnSquare("spear-east", 11, 26)
    placeObjectOnSquare("spear-southwest", 11, 26)
    placeObjectOnSquare("spear-west", 11, 30)
    placeObjectOnSquare("spear-south", 11, 30)
    placeObjectOnSquare("spear-southeast", 11, 30)
    placeObjectOnSquare("spear-north", 12, 32)
    placeObjectOnSquare("spear-south", 12, 32)
    placeObjectOnSquare("spear-southeast", 12, 32)
    placeObjectOnSquare("spear-west", 13, 27)
    placeObjectOnSquare("spear-south", 13, 27)
    placeObjectOnSquare("spear-northeast", 13, 27)
    placeObjectOnSquare("spear-east", 13, 29)
    placeObjectOnSquare("spear-north", 13, 29)
    placeObjectOnSquare("spear-west", 14, 31)
    placeObjectOnSquare("spear-southwest", 14, 31)
    placeObjectOnSquare("spear-northwest", 14, 31)
    //
    includeObelisk(getSquare(11, 25))
    includeObelisk(getSquare(13, 14))
    includeObelisk(getSquare(15, 27))
    includeObelisk(getSquare(19, 17))
    includeObelisk(getSquare(20, 21))
    includeObelisk(getSquare(20, 25))
}

function setEpisodeCreatures() {
    makeAvatar(21, 7)
    //
    monitor = makeWoodGolem(0, 0)
    monitor.script = null
    //
    const monsterA = makeWoodGolem(19, 30)
    monsterA.life = 22
    monsterA.script = null
    monsterA.ondeath = runMonsterADead
    //
    const monsterB = makeWoodGolem(11, 18)
    monsterB.life = 22
    monsterB.script = null
    monsterB.ondeath = runMonsterBDead
}

function setEpisodeTriggers() {
    setOpenedChest(15,  8, "bright-gem", 1)
    setOpenedChest(16, 15, "torch", 33, runChestTorch)
    setOpenedChest(18, 20, "speed-oil", 6)
    setOpenedChest(18, 24, "sword", null, runChestSword)
    //
    setSelfEraseTriggers([19,18], runInsideSpeedOilRoom)
    setSelfEraseTriggers([21,21], runInsideSwordRoom)
    setSelfEraseTriggers([20,26], runInsideMonsterARoom)
    setSelfEraseTriggers([14,27], runInsideSpearsRoom)
    setSelfEraseTriggers([11,24], runInsideMonsterBRoom)
    //
    setSelfEraseTriggers([21, 10], runMenuHint)
    setSelfEraseTriggers([11, 25], runRemoveSword)
}

// scripts ////////////////////////////////////////////////////////////////////

function runOverture() {
    dismissDisplay()
    startTeleportIn(avatar)
    scheduleByTime(runOvertureDark, 1000)
}

function runOvertureDark() {
    displayStandardPage(PAGES["+dark"], runOvertureDark_)
}

function runOvertureDark_() {
    dismissDisplay()
    scheduleByTime(runOvertureSun, 1000)
}

function runOvertureSun() {
    displayStandardPage(PAGES["+sun"], runOvertureSun_)
}

function runOvertureSun_() {
    dismissDisplay()
    scheduleByTime(runOverturePatience, 1500)
}

function runOverturePatience() {
    displayStandardPage(PAGES["+patience"])
}

///////////////////////////////////////////////////////////////////////////////

function runChestTorch() {
    displayStandardPage(PAGES["+torch"])
    obeliskToEther(getSquare(19, 17))
}

function runInsideSpeedOilRoom() {
    displayStandardPage(PAGES["+amplify"])
    obeliskToSolid(getSquare(19, 17))
    monitor.script = checkAmplifiedLight
}

function checkAmplifiedLight() {
    if (avatarTorchStatus != "plus") { return }
    //
    obeliskToEther(getSquare(20, 21))
    monitor.script = null
}

function runInsideSwordRoom() {
    obeliskToSolid(getSquare(20, 21))
}

function runChestSword() {
    displayStandardPage(PAGES["+sword"])
    obeliskToEther(getSquare(20, 25))
}

function runInsideMonsterARoom() {
    obeliskToSolid(getSquare(20, 25))
}

function runMonsterADead() {
    obeliskToEther(getSquare(15, 27))
}

function runInsideSpearsRoom() {
    displayStandardPage(PAGES["+pickup"])
    obeliskToSolid(getSquare(15, 27))
    //
    monitor.script = checkSpears
}

function checkSpears() {
    if (avatar.spears < 20) { return }
    //
    obeliskToEther(getSquare(11, 25))
    monitor.script = null
}

function runRemoveSword() {
    displayStandardPage(PAGES["+remove"])
    avatarMeleeWeapon = "none"
    shallUpdateMainBar = true
}

function runInsideMonsterBRoom() {
    displayStandardPage(PAGES["+spear"])
    obeliskToSolid(getSquare(11, 25))
}

function runMonsterBDead() {
    obeliskToEther(getSquare(13, 14))
}

function runMenuHint() {
    displayStandardPage(pageMenuHint)
}

// texts //////////////////////////////////////////////////////////////////////

function setEpisodePages() {

    PAGES["+dark"] =
        "7laOh!  It is dark here...\n"

    PAGES["+sun"] =
        "8lmThe Maze Master says:\n" +
        "2lmI have taken the sun away!\n"

    PAGES["+patience"] =
        "8laI can believe that...\n" +
        "2layou also took my patience away.\n"

    PAGES["+torch"] =
        "5lpPress  T  to light a torch.\n" +
        "2lpPress  T  again to amplify its light (reducing the\n" +
        "1lpdurability).\n" +
        "2lpPress  T  once more to extinguish the light.\n" +
        "2lpA torch lasts 120 seconds. Or 60 seconds with\n" +
        "1lpamplified light.\n"

    PAGES["+amplify"] =
        "7lpUse your torch lit with  *amplified*  light to\n" +
        "1lpdissolve the next obelisk.\n"

    PAGES["+sword"] =
        "5lpPress and *release*   Z  to attack with a sword.\n" +
        "2lpThis starts the aiming mode:  you can spin to any\n" +
        "1lpdirection, including diagonals, without pressing\n" +
        "1lpShift.\n" +
        "2lpWhen the aiming mode ends the attack happens.\n" +
        "2lpMoving targets take more damage.\n"

    PAGES["+pickup"] =
        "3lp\n" + // just jumping
        "6lpPress  C  to pick up an object under your feet.\n"

    PAGES["+remove"] =
        "3lp\n" + // just jumping
        "6lpYour sword is being removed.\n"

    PAGES["+spear"] =
        "3lpPress and *release*   X  to throw a spear.\n" +
        "2lpThis starts the aiming mode:  you can spin to any\n" +
        "1lpdirection, including diagonals, without pressing\n" +
        "1lpShift.\n" +
        "2lpWhen the aiming mode ends the pitching happens.\n" +
        "2lpMoving targets take more damage.\n" +
        "2lpImportant:  Spears are weak for melee combat.\n"
}

