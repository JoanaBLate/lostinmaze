"use strict"

const CALLBACKS = {
    "runDontRecognize": runDontRecognize,
    "runIsDoorSafe": runIsDoorSafe,
    "runBetterDoor": runBetterDoor,
    "runWtf": runWtf,
    "runTheEnd": runTheEnd
}

const SCRIPT = [
    // part A
    "spin west",
    "wait 40",
    "spin south",
    "wait 20",
    "spin east",
    "wait 40",
    "spin south",
    "wait 60",
    "spin north",
    "wait 40",
    "spin east",
    "wait 20",
    "move",
    "wait 10",
    "move",
    "wait 70",
    "spin north",
    "wait 40",
    "spin west",
    "wait 20",
    "move",
    "wait 10",
    "move",
    "wait 60",
    "func runDontRecognize",
    // part B
    "wait 20",
    "spin south",
    "move",
    "move",
    "spin east",
    "move",
    "move",
    "spin south",
    "move",
    "move",
    "wait 20",
    "move",
    "func runIsDoorSafe",
    // part C
    "move",
    "spin east",
    "wait 10",
    "move",
    "move",
    "move",
    "move",
    "spin north",
    "wait 20",
    "move",
    "move",
    "spin east",
    "wait 60",
    "move",
    "move",
    "move",
    "wait 30",
    "func runBetterDoor",
    // part D
    "wait 10",
    "spin west",
    "move",
    "move",
    "spin south",
    "move",
    "spin west",
    "move",
    "spin south",
    "move",
    "spin west",
    "move",
    "spin south",
    "wait 20",
    "move",
    "func runWtf",
    "wait 20",
    "speak 10",
    "wait 30",
    "speak 9",
    "wait 30",
    "speak 8",
    "wait 30",
    "speak 7",
    "wait 30",
    "speak 6",
    "wait 30",
    "speak 5",
    "wait 30",
    "speak 4",
    "wait 30",
    "speak 3",
    "wait 30",
    "speak 2",
    "wait 30",
    "speak 1",
    "wait 30",
    "func runTheEnd"
]

function setBasicConfig() {
    EPISODE = "cinematic"
    MAP = "cinematic"
    TITLE = "(cinematic)"
    //
    localStorage["fresh-start"] = "true" // avoids skipOrRun screen
    openMenu = function () { }
    toggleNameOnTop()
}

function setEpisodeObjects() {
    placeObjectOnSquare("spear-northwest", 12, 9)
    placeObjectOnSquare("spear-northeast", 17, 15)
    placeObjectOnSquare("spear-west", 17, 15)
    placeObjectOnSquare("spear-east", 18, 12)
    placeObjectOnSquare("spear-southwest", 17, 11)
}

function setEpisodeCreatures() {
    makeAvatar(6, 9)
    avatar.script = function () { }
}

function setEpisodeTriggers() { }

// scripts ////////////////////////////////////////////////////////////////////

function runOverture() {
    dismissDisplay()
    startTeleportIn(avatar)
    avatar.script = runTeleportFinished
}

function runTeleportFinished() {
    if (avatar.teleport != "") { return }
    displayStandardPage(PAGES["+teleported-again"], runTeleportFinished_)
}

function runTeleportFinished_() {
    dismissDisplay()
    avatar.script = runPuppet
}

function runDontRecognize() {
    avatar.script = function () { }
    stand(avatar)
    displayStandardPage(PAGES["+dont-recognize"], setPuppet)
}

function runIsDoorSafe() {
    avatar.script = function () { }
    stand(avatar)
    displayStandardPage(PAGES["+is-door-safe"], setPuppet)
}

function runBetterDoor() {
    avatar.script = function () { }
    stand(avatar)
    displayStandardPage(PAGES["+better-door"], setPuppet)
}

function runWtf() {
    avatar.script = function () { }
    stand(avatar)
    displayStandardPage(PAGES["+wtf"], runHey)
}

function runHey() {
    displayStandardPage(PAGES["+hey"], runTooBig)
}

function runTooBig() {
    displayStandardPage(PAGES["+too-big"], runRemember)
}

function runRemember() {
    displayStandardPage(PAGES["+remember"], runMessage)
}

function runMessage() {
    displayStandardPage(PAGES["+message"], runRedirect)
}

function runRedirect() {
    displayStandardPage(PAGES["+redirect"], runFailure)
}

function runFailure() {
    displayStandardPage(PAGES["+failure"], setPuppet)
}

function runTheEnd() {
    startTeleportOut(avatar)
    scheduleByTime(runTheEnd2, 5000)
}

function runTheEnd2() {
    playMusic("failure")
    displayBlack(PAGES["+mm"], [], null)
}

function runstand(creature) {
    creature.bmpleg = "stand"
}

// SCRIPT /////////////////////////////////////////////////////////////////////

function setPuppet() {
    dismissDisplay()
    avatar.script = runPuppet
}

function runPuppet() {

    if (SCRIPT.length == 0) { return }
    if (avatar.moveStatus != "stand") { return }

    const task = SCRIPT.shift()
 // console.log(LOOP, task)

    if (task == "move") {
        move(avatar)
        return
    }

    let tokens = task.split(" ") // tokenizing //

    if (tokens[0] == "wait") {
        const n = parseInt(tokens[1]) - 1
        if (n > 0) { SCRIPT.unshift("wait " + n) }
        return
    }

    if (tokens[0] == "spin") {
        spin(avatar, tokens[1])
        return
    }

    if (tokens[0] == "speak") {
        speak(avatar, tokens[1])
        return
    }

    if (tokens[0] == "func") {
        const callback = CALLBACKS[tokens[1]]
        callback()
        return
    }
}

// texts //////////////////////////////////////////////////////////////////////

function setEpisodePages() {

    PAGES["+teleported-again"] =
        "9laOh! The Maze Master has teleported me again...\n"

    PAGES["+dont-recognize"] =
        "9laI don't recognize this place.\n" +
        "2laMaybe I was sent to another galaxy!\n"

    PAGES["+is-door-safe"] =
        "9laI wonder whether it is safe to open that door.\n"

    PAGES["+better-door"] =
        "9laThis path does not look easy.\n" +
        "2laIt is better to try open that door.\n"

    PAGES["+wtf"] =
        "9laOh! What is this?\n" +
        "2laA giant alien is observing me from the skies...\n"

    PAGES["+hey"] =
        "9laHey, you giant creature,\n" +
        "2lacan you tell me the name of your asteroid?\n"

    PAGES["+too-big"] =
        "9laNo answer...\n" +
        "2laIs this another case of too-big-to-be-smart?\n"

    PAGES["+remember"] =
        "9laAll right!\n" +
        "2laI have just remembered my mission.\n" +
        "2laI must deliver a message.\n"

    PAGES["+message"] =
        "9laThe message is this:\n" +
        "2cpThe Maze Master is challenging\n" +
        "1cpall  creatures  to  enter  his  maze\n" +
        "2laHow cool is that?!\n"

    PAGES["+redirect"] =
        "9laIf you are interested in the challenge,\n" +
        "2laredirect your space browser to this coordinate:\n" +
        "2lawww.lostinmaze.com\n"

    PAGES["+failure"] =
        "9laMy mission will be considered a failure\n" +
        "2laif you don't land there in the next 10 seconds...\n" +
        "2lawww.lostinmaze.com\n"

    PAGES["+mm"] =
        "9lmThe Maze Master says:\n" +
        "2lmYou failed to accomplish the mission.\n" +
        "2lmThe maze will be reset.\n" +
        "2lmYou will be reset."
}

