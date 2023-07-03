"use strict"

// demands 2:30 to finish //

function setBasicConfig() {
    EPISODE = "training-day"
    MAP = "training-day"
    TITLE = "Training Day"
}

function setEpisodeObjects() { }

function setEpisodeCreatures() {
    makeAvatar(16, 17)
    const monster = makeRedzag(12, 48)
    monster.script = null
}

function setEpisodeTriggers() {
    setOpenedChest(8,  35, "antidote-potion", 1, runChestAntidotePotion)
    setOpenedChest(11,  9, "health-potion", 1, runChestHealthPotion)
    setOpenedChest(13, 19, "speed-oil", 5, runChestSpeedOil)
    setOpenedChest(13, 41, "mana-potion", 1, runChestManaPotion)
    //
    setAltarObelisk(19,31, 20,27)
    //
    setSelfEraseTriggers([17,10], runLife)
    setSelfEraseTriggers([12,15], runSmoke)
    setSelfEraseTriggers([17,7],  runBonfire)
    setSelfEraseTriggers([9,43],  runUgly)
    setSelfEraseTriggers([20,43], runDiagonal)
    setSelfEraseTriggers([18,25], runMenuHint)
}

// scripts ////////////////////////////////////////////////////////////////////

function runOverture() {
    displayStone(PAGES["+pyramid"], ["enter"], runOvertureEnter)
}

function runOvertureEnter() {
    displayStone(PAGES["+enter"], ["enter"], runOvertureEnter_)
}

function runOvertureEnter_() {
    dismissDisplay()
    startTeleportIn(avatar)
    scheduleByTime(runOvertureDissolving, 1000)
}

function runOvertureDissolving() {
    displayStandardPage(PAGES["+dissolving"], runOvertureDissolving_)
}

function runOvertureDissolving_() { 
    dismissDisplay()
    scheduleByTime(runOvertureNoise, 2000)
}  

function runOvertureNoise() {
    displayStandardPage(PAGES["+noise"], runOvertureMMaster)
}

function runOvertureMMaster() {
    displayStandardPage(PAGES["+mmaster"], runOvertureExist)
}

function runOvertureExist() {
    displayStandardPage(PAGES["+exist"], runOvertureExist_)
}

function runOvertureExist_() { 
    dismissDisplay()
    avatar.script = afterTeleporting
}

function afterTeleporting() {
    if (avatar.teleport != "") { return }
    avatar.script = defaultAvatarScript
    //
    displayStandardPage(PAGES["+nothing"], runOvertureArrow)
}

function runOvertureArrow() {
    displayStandardPage(PAGES["+arrow"])
}

///////////////////////////////////////////////////////////////////////////////

function runChestSpeedOil() {
    displayStandardPage(PAGES["+speed-oil"], runDissolveObelisk)
}

function runDissolveObelisk() {
    dismissDisplay()
    const obelisk = getSquare(17, 13)
    includeObelisk(obelisk)
    obeliskToEther(obelisk)
}

function runChestHealthPotion() {
    displayStandardPage(PAGES["+health-potion"])
}

function runChestAntidotePotion() {
    displayStandardPage(PAGES["+antidote-potion"])
}

function runChestManaPotion() {
    displayStandardPage(PAGES["+mana-potion"])
}

///////////////////////////////////////////////////////////////////////////////

function runLife() {
    displayStandardPage(PAGES["+life"])
}

function runBonfire() {
    displayStandardPage(PAGES["+bonfire"])
}

function runSmoke() {
    displayStandardPage(PAGES["+smoke"])
}

function runUgly() {
    displayStandardPage(PAGES["+ugly"])
}

function runDiagonal() {
    displayStandardPage(PAGES["+diagonal"])
}

function runMenuHint() {
    displayStandardPage(pageMenuHint)
}

// texts //////////////////////////////////////////////////////////////////////

function setEpisodePages() {  
    
    PAGES["+pyramid"] = 
        "3lpYou are a famous archeologist hired by the\n" +
        "1lpgovernment to investigate a newly discovered\n" +
        "1lpsecret chamber inside an Egyptian pyramid.\n" + 
        "2lpThe chamber is small, with walls covered in\n" +
        "1lphieroglyphs - some never seen before.\n" +        
        "2lpIn the center of the chamber, there is a large\n" +
        "1lpglowing orb spinning non-stop, built with\n" +
        "1lpmaterials that do not exist on Earth.\n" +
        pagePressEnter        

    PAGES["+enter"] = 
        "4lpAfter studying the hieroglyphs in depth, you\n" +
        "1lpdiscover that the orb is a portal to other worlds,\n" + 
        "1lpbuilt by a god called The Maze Master.\n" + 
        "2lpOK. There are no gods. It is just a damn alien!\n" +
        "2lpYou figure out how to enter that bright sphere.\n" +
        "2lpAnd enter it...\n" +
        pagePressEnter

    PAGES["+dissolving"] =
        "1laWoowwww!\n" +
        "1laWhat is happening to me?\n" +
        "2laI feel like dissolving!\n" +
        "6laWOOOWWWWWW!!!!\n" +
        "2laMy body became translucent!\n" +
        "2laI hope my body will turn solid again.\n"
        
    PAGES["+noise"] =
        "4lpYou hear a strange whisper\n" +
        "1lpechoing from nowhere.\n" +
        "5lpBut somehow, your brain\n" +
        "1lpsenses meaningful words from that...\n"        
    
    PAGES["+mmaster"] =
        "7lmThe Maze Master says:\n" +
        "2lmWelcome to your first maze, little mouse!\n" +
        "2lmLet's see whether you are skilled enough to escape.\n" 

    PAGES["+exist"] =
        "7laSo, The Maze Master really existed.\n" +
        "2laAnd is still alive.\n" +
        "2laShow yourself!\n" 

    PAGES["+nothing"] =
        "9lpYou wait for the answer, but you get nothing.\n"
        
    PAGES["+arrow"] =
        "9lpPressing the arrow keys moves your avatar.\n"

    PAGES["+speed-oil"] =
        "1lp\n" + // just jumping
        "9lpPress  S  when you want to use speed oil.\n" +
        "2lpYou cannot use speed oil when you are fast.\n"

    PAGES["+life"] =
        "9lpYou start with 100 life points.\n" +
        "2lpChoose carefully your path.\n" +
        "2lpAvoid getting hurt whenever you can.\n"

    PAGES["+bonfire"] =
        "1lp\n" + // just jumping
        "9lpA bonfire burns the creature that steps on it.\n" +
        "2lpA creature will not get burnt again while\n" +
        "1lpstanding on the bonfire.\n"

    PAGES["+health-potion"] =
        "1lp\n" + // just jumping
        "8lpPress  Spacebar  when you want to drink a health\n" +
        "1lppotion  (heals a maximum of 50 life points).\n" +
        "2lpYou cannot drink a health potion if you are not\n" +
        "1lphurt.\n"

    PAGES["+smoke"] =
        "8lpSmoke poisons the creature that steps on it.\n" +
        "2lpA creature will not get poisoned again while\n" +
        "1lpstanding in the smoke.\n" +
        "2lpThe effects of poison will wear off.\n"

    PAGES["+antidote-potion"] =
        "9lpPress  A  when you want to drink antidote.\n" +
        "2lpYou can only consume an antidote if you are\n" +
        "1lppoisoned or dizzy.\n"

    PAGES["+ugly"] =
        "9laI see an orange red alien!\n" +
        "2laHow cute!\n"

    PAGES["+mana-potion"] =
        "5lpPress  M  to drink a mana potion  (provides 100\n" +
        "1lpmana points).\n" +
        "2lpMana creates a shield that absorbs all kinds of\n" +
        "1lpdamage at  a  1:1  ratio.\n" +
        "2lpIt also protects against dizziness and slowness.\n" +
        "2lpYou cannot drink a mana potion if your shield\n" +
        "1lpalready has 300 mana points.\n"

    PAGES["+diagonal"] =
        "4lpDiagonal step among bonfires and smokes:\n" +
        "2lp1)  press  Shift  and hold it\n" +
        "1lp2)  press two compatible arrow keys and hold them\n" +
        "1lp3)  release  Shift  only\n" +
        "3lpIf you feel confident, try without pressing  Shift.\n" +
        "2lpImportant:  Diagonal steps are available only when\n" +
        "1lpthey are necessary.\n"
}

