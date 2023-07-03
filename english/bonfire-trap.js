"use strict"

// demands 3:00 to finish //

function setBasicConfig() {
    EPISODE = "bonfire-trap"
    MAP = "bonfire-trap"
    TITLE = "Bonfire Trap"
}

function setEpisodeObjects() { }

function setEpisodeCreatures() {
    makeAvatar(20, 15)
}

function setEpisodeTriggers() {
    setAltarObelisk(18,37, 18,32)
    setOpenedChest(12, 22, "speed-oil", 6)
    setOpenedChest(23, 11, "bright-gem", 1)
    setOpenedChest(12, 24, "health-potion", 2)
    setOpenedChest(27, 25, "antidote-potion", 1)
    //
    setSelfEraseTriggers([13,30], runMenuHint)
}

// scripts ////////////////////////////////////////////////////////////////////

function runOverture() {
    dismissDisplay()
    startTeleportIn(avatar)
    scheduleByTime(runOvertureWatching, 2000)
}

function runOvertureWatching() {
    displayStandardPage(PAGES["+watching"], runOvertureWatching_)
}

function runOvertureWatching_() {
    dismissDisplay()
    scheduleByTime(runOvertureClose, 1500)
}

function runOvertureClose() {
    displayStandardPage(PAGES["+close"])
}

///////////////////////////////////////////////////////////////////////////////

function runMenuHint() {
    displayStandardPage(pageMenuHint)
}

// texts //////////////////////////////////////////////////////////////////////

function setEpisodePages() {

    PAGES["+watching"] =
        "7lmThe Maze Master says:\n" +
        "2lmI may be far away, but I am watching everything...\n"

    PAGES["+close"] =
        "5laI understand...\n" +
        "2laWhat if you keep your eyes closed?\n"
}

