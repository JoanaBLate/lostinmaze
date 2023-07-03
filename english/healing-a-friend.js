"use strict"

// demands 03:15 to finish //

var squareSeeWell = [27,59]
var squaresWell  = [24,56, 24,57]
var squaresWell2 = [29,69, 29,70]
var squaresMeeting = [29,60, 29,61, 29,62]

function setBasicConfig() {
    EPISODE = "healing-a-friend"
    MAP = "healing-a-friend"
    TITLE = "Healing A Friend"
    includeMission("Heal Orion.")
}

function setEpisodeObjects() { }

function setEpisodeCreatures() {
    makeAvatar(23, 60)
    makeOrion(33, 61)
    spin(orion, "north")
    orion.life = 20
    orion.script = runOrionNotHealed
}

function setEpisodeTriggers() {
    setOpenedChest(31, 57, "speed-oil", 5)
    setOpenedChest(43, 69, "speed-oil", 5)
    setOpenedChest(45, 84, "speed-oil", 5)
    setOpenedChest(32, 70, "health-potion", 1)
    setOpenedChest(38, 84, "antidote-potion", 1)
    setOpenedChest(42, 83, "bright-gem", 1)
    setSelfEraseTriggers(squareSeeWell, runSeeWell)
    setTriggers(squaresWell, runWell)
    setTriggers(squaresWell2, runWell2)
    setSelfEraseTriggers(squaresMeeting, runMeeting) // must be manually erased if overture is skipped
}

// scripts ////////////////////////////////////////////////////////////////////

function runOverture() {
    dismissDisplay()
    startTeleportIn(avatar)
    scheduleByTime(runOvertureMMaster, 1500)
}

function runOvertureMMaster() {
    displayStandardPage(PAGES["+mmaster"], runOvertureMMaster_)
}

function runOvertureMMaster_() {
    dismissDisplay()
    scheduleByTime(runOvertureReply, 1500)
}

function runOvertureReply() {
    displayStandardPage(PAGES["+reply"])
}

function skipOverture() {
    dismissDisplay()
    avatar.visible = true
    leaveSquare(avatar.row, avatar.col)
    avatar.row = 29
    avatar.col = 61
    enterSquare(avatar, avatar.row, avatar.col)
    eraseTriggers(squaresMeeting)
}

///////////////////////////////////////////////////////////////////////////////

function runMeeting() {
    displayStandardPage(PAGES["+meeting"])
}

function runSeeWell() {
    displayStandardPage(PAGES["+see-well"])
}

function runWell() {
    displayChoicePage(PAGES["+well"], ["a", "b", "c", "d"], runWellAnswer)
}

function runWell2() {
    displayChoicePage(PAGES["+well2"], ["a", "b", "c", "d"], runWellAnswer2)
}

function runWellAnswer(low) {
    if (low == "a") {
        scriptFoundSpeedOil(10)
    }
    else if (low == "b") {
        scriptFoundPurpleBubble(6, runInstruction)
    }
    else if (low == "c") {
        scriptFoundHealthPotion(1)
    }
    else if (low == "d") {
        dismissDisplay()
        return // avoiding set runEmptyWell
    }
    setTriggers(squaresWell, scriptEmptyWell)
}

function runWellAnswer2(low) {
    if (low == "a") {
        scriptFoundAntidotePotion(10)
    }
    else if (low == "b") {
        scriptFoundPurpleBubble(6, runInstruction)
    }
    else if (low == "c") {
        scriptFoundHealthPotion(1)
    }
    else if (low == "d") {
        dismissDisplay()
        return // avoiding set runEmptyWell
    }
    setTriggers(squaresWell2, scriptEmptyWell)
}

function runInstruction() {
    displayStandardPage(PAGES["+instruction"])
}

function runOrionNotHealed() {
    spinToTarget(orion, avatar)
    if (orion.life < 70) { return }
    //
    displayStandardPage(PAGES["+healed"])
    orion.script = runOrionHealed
}

function runOrionHealed() {
    spinToTarget(orion, avatar)
}

function runEnterPortal() {
    if (orion.life > 69) { scriptSuccess(pageSuccess); return }
    //
    const text = pageFailure.replace("@fail@", PAGES["+replacement"])
    scriptFailure(text)
}

// texts //////////////////////////////////////////////////////////////////////

function setEpisodePages() {

    PAGES["+replacement"] = "You failed to save a friend."

    PAGES["+mmaster"] =
        "7lmThe Maze Master says:\n" +
        "2lmA creature nearby is in trouble.\n" +
        "2lmHelp him and win a friend.\n"

    PAGES["+reply"] =
        "7laDo you want to control my social life too?\n"
    
    PAGES["+meeting"] =
        "1loExplorer, please help me!\n" +
        "2laCreature, what happened?\n" +
        "2loI am Orion. I am very hurt.\n" +
        "2loIf I step on a bonfire\n" +
        "1loagain, I will die.\n" +
        "2laOh, no!! How can I help you?\n" +
        "2loPlease, find a way to\n" +
        "1loheal me.\n" +
        "2laI will do my best!\n"

    PAGES["+instruction"] =
        "1lp\n" + // just jumping
        "9lpPress  P  when you want to throw a purple bubble.\n" +
        "2lpPurple bubbles have healing power.\n"

    PAGES["+healed"] =
        "1loOh! My friend,\n" +
        "1lothank you very much!\n" +
        "2loNow it is time for you\n" +
        "1loto find your way out.\n" +
        "2loI will stay here, resting for a while.\n" +
        "2loFarewell, Explorer!\n" +
        "1laFarewell, Orion!\n"

    PAGES["+see-well"] =
        "8laI see a nice well...\n" +
        "2laand I am thirsty!\n"

    PAGES["+well"] =
        "5lpChoose a wish:\n" +
        "2lpA) 10 oils of speed\n" +
        "2lpB)  6 purple bubbles\n" +
        "2lpC)  1 health potion\n" +
        "2lpD)    (choose later)\n"

    PAGES["+well2"] =
        "5lpChoose a wish:\n" +
        "2lpA) 10 antidote potions\n" +
        "2lpB)  6 purple bubbles\n" +
        "2lpC)  1 health potion\n" +
        "2lpD)    (choose later)\n"
}

