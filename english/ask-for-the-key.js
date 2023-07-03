"use strict"

// demands 5:00 to finish //

var janitor
var squaresMeeting  = [10,26, 11,26, 16,26, 17,26]
var squaresMeeting2 = [10,27, 11,27, 12,27, 16,27, 17,27]

function setBasicConfig() {
    EPISODE = "ask-for-the-key"
    MAP = "ask-for-the-key"
    TITLE = "Ask For The Key"
}

function setEpisodeObjects() {
    placeObjectOnSquare("spear-east", 12, 38)
    placeObjectOnSquare("spear-northeast", 14, 37)
}

function setEpisodeCreatures() {
    makeAvatar(8, 10)
    janitor = makeRedzag(13, 31)
    janitor.target = null
    janitor.altern = null // avoiding wander
    janitor.loot = "wooden-key"
    janitor.ondeath = runJanitorDead
}

function setEpisodeTriggers() {
    setOpenedChest(9, 36, "spear", 3)
    setLockedChest(19, 10, "wooden-key", "bright-gem", 1, null)
    setSelfEraseTriggers(squaresMeeting, runMeeting)
    setSelfEraseTriggers(squaresMeeting2, runMeeting2)
}

// scripts ////////////////////////////////////////////////////////////////////

function runOverture() {
    dismissDisplay()
    startTeleportIn(avatar)
    scheduleByTime(runOvertureMission, 2000)
}

function runOvertureMission() {
    displayStandardPage(PAGES["+mission"], runOvertureMission_)
}

function runOvertureMission_() {
    dismissDisplay()
    scheduleByTime(runOvertureReply, 2000)
}

function runOvertureReply() {
    displayStandardPage(PAGES["+reply"])
}

function skipOverture() {
    dismissDisplay()
    avatar.visible = true
    eraseTriggers(squaresMeeting)
    eraseTriggers(squaresMeeting2)
    leaveSquare(avatar.row, avatar.col)
    avatar.row = 13
    avatar.col = 24
    enterSquare(avatar, avatar.row, avatar.col)
    avatar.direction = "east"
    runAlienAttack()
}

///////////////////////////////////////////////////////////////////////////////

function runMeeting() {
    displayStandardPage(PAGES["+meeting"])
}

function runMeeting2() {
    displayStandardPage(PAGES["+meeting2"], runAlienAttack)
}

function runAlienAttack() {
    dismissDisplay()
    janitor.target = avatar
    setWanderAsAlternScript(janitor)
}

function runJanitorDead() { // janitor.ondeath callback
    defaultDeathScript(janitor)
    if (FAILURE) { return } // maybe avatar is dead now
    displayStandardPage(PAGES["+dead"])
}

// texts //////////////////////////////////////////////////////////////////////

function setEpisodePages() {
    
    PAGES["+mission"] =
        "9lmThe Maze Master says:\n" +
        "2lmFind the janitor of this small island.\n" +
        "2lmAsk him about the wooden key.\n"
    
    PAGES["+reply"] =
        "9laSure. I like receiving orders from nowhere.\n"
    
    PAGES["+meeting"] =
        "8laI see an alien there!\n" +
        "2laMaybe he is the one I should talk to.\n"
    
    PAGES["+meeting2"] =
        "7laGreetings!\n" +
        "2laYou are the local janitor, I presume!\n" +
        "3la(Hum... no answer...\n" +
        "1laAm I too far away to be heard?)\n"
    
    PAGES["+dead"] =
        "1lp\n" + // just jumping
        "9laThe monster left a wooden key on the floor.\n" +
        "3laHe was the local janitor as I correctly presumed!\n"
}

