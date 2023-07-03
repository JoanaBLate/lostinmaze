"use strict"

// demands 9:00 to finish //

var squaresMeeting    = [47,49]
var squaresWestCheck  = [49,45]
var squaresNorthCheck = [48,56]
var squaresSouthCheck = [58,53]

function setBasicConfig() {
    EPISODE = "frozen-hell"
    MAP = "frozen-hell"
    TITLE = "Frozen Hell"
}

function setEpisodeObjects() {
    // start
    placeObjectOnSquare("speed-oil", 47, 49)
    // west maze
    placeObjectOnSquare("speed-oil", 40, 11)
    placeObjectOnSquare("speed-oil", 45, 17)
    placeObjectOnSquare("speed-oil", 47, 14)
    placeObjectOnSquare("speed-oil", 50, 30)
    placeObjectOnSquare("speed-oil", 49, 40)
    placeObjectOnSquare("speed-oil", 55, 40)
    // north maze
    placeObjectOnSquare("speed-oil", 44, 67)
    // south maze
    placeObjectOnSquare("speed-oil", 61, 50)
    placeObjectOnSquare("speed-oil", 66, 48)
    placeObjectOnSquare("speed-oil", 67, 51)
    placeObjectOnSquare("health-potion", 60, 44)
    placeObjectOnSquare("antidote-potion", 81, 49)
    placeObjectOnSquare("antidote-potion", 80, 51)
}

function setEpisodeCreatures() {
    makeAvatar(55, 56)
    makeOrion(44, 51)
    spin(orion, "east")
}

function setEpisodeTriggers() {
    // start
    setSelfEraseTriggers(squaresMeeting, runMeeting)
    // trigger for runStepWarn will be set later
    setSelfEraseTriggers([50, 49], runMenuHint)

    // west maze
    setAltarObelisk(31,7, 54,12)
    setAltarTrigger(52, 9, runManaAltar) // overwriting
    setTriggers(squaresWestCheck, runWestCheck)

    // north maze
    setAltarObelisk(31,53, 35,56)
    setTriggers(squaresNorthCheck, runNorthCheck)

    // south maze
    setAltarObelisk(79,51, 75,51)
    setAltarObelisk(69,49, 77,53)
    setLockedDoor(60, 52, "copper-key")
    setLockedDoor(64, 53, "copper-key")
    setTriggers(squaresSouthCheck, runSouthCheck)

    // east maze
    setLockedDoor(58, 59, "wooden-key")
    setLockedDoor(60, 59, "iron-key")
    setLockedDoor(62, 59, "copper-key")
    setAltarObelisk(76,62, 62,61)
    setSelfEraseTriggers([63,59], runDoingWell)
}

// scripts ////////////////////////////////////////////////////////////////////

function runOverture() {
    dismissDisplay()
    startTeleportIn(avatar)
    scheduleByTime(runOvertureMMaster, 2000)
}

function runOvertureMMaster() {
    displayStandardPage(PAGES["+mmaster"], runOvertureMMaster_)
}

function runOvertureMMaster_() {
    dismissDisplay()
    scheduleByTime(runOvertureGuess, 1000)
}

function runOvertureGuess() {
    displayStandardPage(PAGES["+guess"])
}

function skipOverture() {
    avatar.visible = true
    eraseTriggers(squaresMeeting)
    leaveSquare(avatar.row, avatar.col)
    avatar.row = 47
    avatar.col = 49
    enterSquare(avatar, avatar.row, avatar.col)
    spin(avatar, "north")
    runPresto()
}

// start ----------------------------------------------------------------------

function runMenuHint() {
    displayStandardPage(pageMenuHint)
}

function runMeeting() {
    spin(orion, "south")
    displayStandardPage(PAGES["+meeting"], runMeeting2)
}

function runMeeting2() {
    displayStandardPage(PAGES["+meeting2"], runPresto)
}

function runPresto() {
    dismissDisplay()
    displayWaitPage()
    scheduleByTime(runPresto2, 1000)
}

function runPresto2() {
    spin(orion, "east")
    scheduleByTime(runPresto3, 1000)
}

function runPresto3() {
    speak(orion, "Presto!")
    setBlufires()
    scheduleByTime(runPresto4, 1000)
}

function runPresto4() {
    setSelfEraseTriggers([48,49], runStepWarn)
    releaseWaitPage()
}

function runStepWarn() {
    displayStandardPage(PAGES["+step-warn"])
}

// west maze ------------------------------------------------------------------

function runManaAltar() {
    scriptAltarManaPotion(52, 9)
    displayStandardPage(PAGES["+mana-shield"])
}

function runWestCheck() {
    if (! avatarWoodenKey) { return }
    //
    eraseTriggers(squaresWestCheck)
    const id = (avatar.life == 100) ? "+west-ok" : "+key-but-hurt"
    displayStandardPage(PAGES[id])
}

// north maze -----------------------------------------------------------------

function runNorthCheck() {
    if (! avatarIronKey) { return }
    //
    eraseTriggers(squaresNorthCheck)
    const id = (avatar.life == 100) ? "+north-ok" : "+key-but-hurt"
    displayStandardPage(PAGES[id])
    //
    if (avatar.life != 100) {
        setTriggers(squaresNorthCheck, runNorthCheckAgain)
    }
}

function runNorthCheckAgain() {
    if (avatar.life != 100) { return }
    if (avatar.direction != "south") { return } // leaving north maze
    //
    eraseTriggers(squaresNorthCheck)
    displayStandardPage(PAGES["+north-ok"])
}

// south maze -----------------------------------------------------------------

function runSouthCheck() {
    if (! avatarCopperKey) { return }
    //
    eraseTriggers(squaresSouthCheck)
    const id = (avatar.life == 100) ? "+south-ok" : "+key-but-hurt"
    displayStandardPage(PAGES[id])
    //
    if (avatar.life != 100) {
        setTriggers(squaresSouthCheck, runSouthCheckAgain)
    }
}

function runSouthCheckAgain() {
    if (avatar.life != 100) { return }
    if (avatar.direction != "north") { return } // leaving south maze
    //
    eraseTriggers(squaresSouthCheck)
    displayStandardPage(PAGES["+south-ok"])
}

// east maze ------------------------------------------------------------------

function runDoingWell() {
    if (avatar.life < 20) { return } // not necessary; but I want to be sure
    displayStandardPage(PAGES["+doing-well"])
}

// helper /////////////////////////////////////////////////////////////////////

function setBlufires() {
    for (const sqr of episodeTable) {
        if (sqr.layerB != "bonfire") { continue }
        sqr.layerB = "blufire"
        sqr.field  = "blufire"
    }
}

// texts //////////////////////////////////////////////////////////////////////

function setEpisodePages() {
    
    PAGES["+mmaster"] =
        "6lmThe Maze Master says:\n" +
        "2lmGreetings...\n" +
        "2lmI hope you enjoy this maze!\n"
    
    PAGES["+guess"] =
        "7laGuess what...\n" +
        "2laI am getting tired of you!\n"
    
    PAGES["+meeting"] =
        "2laGreetings, Orion!\n" +
        "2loGreetings Explorer, my friend!\n" +
        "2laYou seem to be busy.\n" +
        "1laWhat are you doing, friend?\n" +
        "2loI am training to make hell freeze.\n" +
        "2la(Hum...)\n" +
        "2laOhhh! Very impressive!\n"
    
    PAGES["+meeting2"] =
        "5laAnd why do you want to make hell freeze, friend?\n" +
        "3loBecause my mom always said that I will achieve\n" +
        "1losuccess as an adult when hell freezes over.\n" +
        "3laHum... (no comment).\n"
    
    PAGES["+step-warn"] =
        "4laI must plan my steps carefully and\n" +
        "1laonly drink potions in the right moment.\n" +
        "5laLet's hope I remember how to walk diagonally.\n"
    
    PAGES["+mana-shield"] =
        "9laI love mana shield!\n"
    
    PAGES["+west-ok"] =
        "9laYou are not so smart after all, Maze Master!\n"
    
    PAGES["+north-ok"] =
        "9laThis sector was a piece of cake!\n"
    
    PAGES["+south-ok"] =
        "8laI wish Orion could see me now...\n" +
        "1laand his mother too!\n"
    
    PAGES["+key-but-hurt"] =
        "8laCrap!\n" +
        "2laI got the key,\n" +
        "1labut I am not at full health.\n"
    
    PAGES["+doing-well"] =
        "8laAlthough I am hurt,\n" +
        "1laI am sure I have done everything well.\n"
}

