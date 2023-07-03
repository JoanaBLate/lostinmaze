"use strict"

// demands 5:00 to finish //

var squareStartCheck = [ 29,68 ]

function setBasicConfig() {
    EPISODE = "fear-of-the-dark"
    MAP = "fear-of-the-dark"
    TITLE = "Fear Of The Dark"
    DARKNESS = true
}

function setEpisodeObjects() { }

function setEpisodeCreatures() { // original
    makeAvatar(23,68)
}

function setEpisodeTriggers() {
    // home maze
    setAltarObelisk(17,75, 28,68)
    setOpenedChest(17,71, "sword", null)
    setOpenedChest(22,75, "speed-oil", 5)
    setOpenedChest(17,78, "torch", 1)
    setTriggers(squareStartCheck, runStartCheck)
    // north maze
    setOpenedChest(15,87, "speed-oil", 5)
    setLockedDoor(28,79, "copper-key")
    // east maze
    setOpenedChest(42,90, "speed-oil", 5)
    setOpenedChest(46,85, "torch", 1)
    setOpenedChest(19,92, "torch", 1)
    // south-west maze
    setLockedDoor(58,72, "wooden-key")
    // south-east maze
    setAltarObelisk(74,79, 72,74)
    setOpenedChest(66,88, "antidote-potion", 1)
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
    scheduleByTime(runOvertureAfraid, 2000)
}

function runOvertureAfraid() {
    displayStandardPage(PAGES["+afraid"])
}

///////////////////////////////////////////////////////////////////////////////

function runStartCheck() {
    if (avatar.torches != 0) {
        eraseTriggers(squareStartCheck)
        displayStandardPage(PAGES["+waste-torch"])
        return
    }
    if (avatar.direction != "south") { return }
    //
    displayStandardPage(PAGES["+miss-torch"])
}

// texts //////////////////////////////////////////////////////////////////////

function setEpisodePages() {

    PAGES["+mmaster"] =
        "6lmThe Maze Master says:\n" +
        "2lmGreetings...\n" +
        "2lmI hope you can bring light into your darkness!\n"

    PAGES["+afraid"] =
        "8laWhy?\n" +
        "2laAre you afraid of the dark?\n"

    PAGES["+miss-torch"] =
        "8laI should not go this way without having any torch.\n"

    PAGES["+waste-torch"] =
        "8laI should light the torch only when necessary.\n"
}

