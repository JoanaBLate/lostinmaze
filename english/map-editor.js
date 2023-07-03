// EDITOR of the browser game Lost In Maze
// Copyright (c) 2014-2024 Feudal Code Limitada

// ### file: apply.js ###

"use strict"

var applyLayerClock = 0

var maybeSquareChanged = false


var processorFor = {
    // A
    "beach"      : applyBeach,
    "desert"     : applyDesert,
    "floor"      : applyFloor,
    "grass"      : applyGrass,
    "ocean"      : applyLayerA,
    "sand"       : applyLayerA,
    "sanddesert" : applySandDesert,
    "sandgrass"  : applySandGrass,
    "swamp"      : applySwamp,
    // B
    "ballast"    : applyLayerB,
    "fields"     : applyLayerB,
    "flower"     : applyLayerB,
    "gravel"     : applyLayerB,
    "weed"       : applyLayerB,
    // C
    "basalt"     : applyLayerC,
    "block"      : applyLayerC,
    "others"     : applyLayerC,
    "stone"      : applyLayerC,
    "tree"       : applyLayerC
}

// clean square ///////////////////////////////////////////////////////////////

function cleanSquare() { // DELETE
    const sqr = getSquare(avatar.row, avatar.col)
    sqr.layerB = ""
    sqr.layerC = ""
    sqr.deltaTop  = 0
    sqr.deltaLeft = 0
    maybeSquareChanged = true
}

// apply (auto) ///////////////////////////////////////////////////////////////

function applyLayerAuto() { // ENTER
    const sqr = getSquare(avatar.row, avatar.col)
    //
    if (FAMILY == "beach") {
        autoBeach()
        applyBeach()
    }
    else if (FAMILY == "sanddesert") {
        autoSandDesert()
        sqr.layerA = SPRITE + sufixForDesert(avatar.row,  avatar.col)
    }
    else if (FAMILY == "sandgrass") {
        autoSandGrass()
        sqr.layerA = SPRITE + sufixForGrass(avatar.row,  avatar.col)
    }
    else {
        return
    }
    maybeSquareChanged = true
}

// apply (route) //////////////////////////////////////////////////////////////

function maybeApplyLayer() {
    if (! spaceKeyPressed) { return }
    //
    if (POSTALCARD) { return }
    if (displayStatus != "no-display") { return } // probably not necessary
    //
    if (LOOP - applyLayerClock < 6) { return }
    //
    applyLayerClock = LOOP
    applyLayer()
}

function applyLayer() { // SPACE functions
    const func = processorFor[FAMILY]
    func()
    maybeSquareChanged = true
    if (SPRITE.startsWith("beach-")) { return } // already drawn by applyBeach
    editor_drawLayerA(0, 0)
}

// layerA - standard //////////////////////////////////////////////////////////

function applyLayerA() {
    const sqr = getSquare(avatar.row, avatar.col)
    sqr.layerA = SPRITE
}

// layerA - floor /////////////////////////////////////////////////////////////

function applyFloor() {
    const sqr = getSquare(avatar.row, avatar.col)
    sqr.layerA = SPRITE
    if (isBigFloor()) {
        sqr.layerA += sufixForGrass(avatar.row, avatar.col)
    }
}

function isBigFloor() {
    if (SPRITE == "floor-b") { return true }
    if (SPRITE == "floor-c") { return true }
    return false
}

// layerA - desert ////////////////////////////////////////////////////////////

function applyDesert() {
    const sqr = getSquare(avatar.row, avatar.col)
    sqr.layerA = "desert-" + sufixForDesert(avatar.row, avatar.col)
}

function sufixForDesert(row, col) {
    const side = 3 // number of squares
    row = row % side
    col = col % side
    const index = (row * side) + col
    return "abcdefghi"[index]
}

// layerA - sand desert ///////////////////////////////////////////////////////

function applySandDesert() {
    const sqr = getSquare(avatar.row, avatar.col)
    sqr.layerA = SPRITE + sufixForDesert(avatar.row,  avatar.col)
}

// layerA - grass /////////////////////////////////////////////////////////////

function applyGrass() {
    const sqr = getSquare(avatar.row, avatar.col)
    sqr.layerA = "grass-" + sufixForGrass(avatar.row,  avatar.col)
    fixSwampBorderArea()
}

function sufixForGrass(row, col) {
    const side = 2 // number of squares
    row = row % side
    col = col % side
    const index = (row * side) + col
    return "abcd"[index]
}

// layerA - sand grass ////////////////////////////////////////////////////////

function applySandGrass() {
    const sqr = getSquare(avatar.row, avatar.col)
    sqr.layerA = SPRITE + sufixForGrass(avatar.row,  avatar.col)
}

// layerA - swamp /////////////////////////////////////////////////////////////

function applySwamp() {
    const sqr = getSquare(avatar.row, avatar.col)
    sqr.layerA = "swamp-" + sufixForGrass(avatar.row,  avatar.col)
    fixSwampBorderArea()
}

function fixSwampBorderArea() {
    for (let row = avatar.row - 5; row < avatar.row + 5; row++) {
        for (let col = avatar.col - 5; col < avatar.col + 5; col++) {
            fixSwampBorderAt(row, col)
        }
    }
}

function fixSwampBorderAt(row, col) {
    const sqr = getSquare(row, col)
    if (sqr == null) { return }
    if (! sqr.layerA.startsWith("swamp-")) { return }
    //
    let border = ""
    if (layerAIsGrass(row - 1, col)) { border += "n" }
    if (layerAIsGrass(row + 1, col)) { border += "s" }
    if (layerAIsGrass(row, col + 1)) { border += "e" }
    if (layerAIsGrass(row, col - 1)) { border += "w" }
    //
    sqr.layerA = sqr.layerA.substr(0, 7)
    if (border != "") { sqr.layerA += "+" + border }
}

function layerAIsGrass(row, col) {
    const sqr = getSquare(row, col)
    if (sqr == null) { return false }
    return sqr.layerA.startsWith("grass-")
}

// layerA - clear beach ///////////////////////////////////////////////////////

function clearBeach() { // not in use
    let row = avatar.row
    let col = avatar.col
    if (row % 2 == 0) { row += 1 } // finds BOTTOM RIGHT corner of area
    if (col % 2 == 0) { col += 1 } // it is never on even row or even col
    clearBeachAt(row - 1, col - 1)
    clearBeachAt(row - 1, col    )
    clearBeachAt(row    , col - 1)
    clearBeachAt(row    , col    )
}

function clearBeachAt(row, col) {
    const sqr = getSquare(row, col)
    if (sqr == null) { return }
    sqr.layerA = "ocean"
    sqr.layerB = ""
    sqr.layerC = ""
    sqr.deltaTop  = 0
    sqr.deltaLeft = 0
}

// layerA - apply beach ///////////////////////////////////////////////////////

function applyBeach() {
    let row = avatar.row
    let col = avatar.col
    if (row % 2 == 0) { row += 1 } // finds BOTTOM RIGHT corner of area
    if (col % 2 == 0) { col += 1 } // it is never on even row or even col
    if (getSquare(row, col) == null) { return }
    //
    applyBeachAt(SPRITE + "nw", row - 1, col - 1)
    applyBeachAt(SPRITE + "ne", row - 1, col)
    applyBeachAt(SPRITE + "sw", row, col - 1)
    applyBeachAt(SPRITE + "se", row, col)
}

function applyBeachAt(layer, row, col) {
    const sqr = getSquare(row, col)
    if (sqr == null) { return }
    //
    if (layer == "beach-a1nw") { layer = "ocean" }
    if (layer == "beach-a2ne") { layer = "ocean" }
    if (layer == "beach-a3sw") { layer = "ocean" }
    if (layer == "beach-a4se") { layer = "ocean" }
    //
    if (layer == "beach-b1se") { layer = "sand" }
    if (layer == "beach-b2sw") { layer = "sand" }
    if (layer == "beach-b3ne") { layer = "sand" }
    if (layer == "beach-b4nw") { layer = "sand" }
    //
    sqr.layerA = layer
    sqr.layerB = ""
    sqr.layerC = ""
    sqr.deltaTop  = 0
    sqr.deltaLeft = 0
    //
    editor_drawLayerA(avatar.row - row, avatar.col - col)
}

// layerB /////////////////////////////////////////////////////////////////////

function applyLayerB() {
    const sqr = getSquare(avatar.row, avatar.col)
    sqr.layerB = SPRITE
    sqr.layerC = ""
    sqr.deltaTop  = 0
    sqr.deltaLeft = 0
}

// layerC /////////////////////////////////////////////////////////////////////

function applyLayerC() {
    const sqr = getSquare(avatar.row, avatar.col)
    sqr.layerC = SPRITE
    sqr.deltaTop  = topForLayerC()
    sqr.deltaLeft = leftForLayerC()
}

function leftForLayerC() {
    if (SPRITE == "block-c") { return   6 }
    if (SPRITE == "block-d") { return   6 }
    if (SPRITE == "block-x") { return  12 } // temp
    if (SPRITE == "portal")  { return  30 }
    if (SPRITE == "tree-a")  { return  30 }
    if (SPRITE == "tree-b")  { return  30 }
    if (SPRITE == "tree-c")  { return  30 }
    if (SPRITE == "tree-j")  { return  20 }
    if (SPRITE == "tree-r")  { return  50 }
    return 0
}

function topForLayerC() {
    if (SPRITE == "portal") { return  15 }
    if (SPRITE == "tree-a") { return -10 }
    if (SPRITE == "tree-j") { return -10 }
    if (SPRITE == "tree-r") { return -10 }
    return 0
}

// special ////////////////////////////////////////////////////////////////////

function removeWeed() {
    for (const sqr of episodeTable) {
        if (! sqr.layerB.startsWith("weed")) { continue }
        sqr.layerB = ""
        if (sqr.layerC == "") {  sqr.deltaLeft = 0; sqr.deltaTop = 0 }
    }
}

// ### file: arrow.js ###

"use strict"


var edit_moveClock = 0

function editor_move(creature) {
    //
    if (POSTALCARD) { movePostalCard(creature); return }
    //
    if (shiftKeyPressed) {
        editDisplacement(deltaColFor[avatar.direction], deltaRowFor[avatar.direction]) // inverted
        return
    }
    //
    let moved // or is moving
    if (ctrlKeyPressed) {
        moved = superMove(creature)
    }
    else {
        moved = standardMove(creature)
    }
    //
    if (moved) { maybeMemorize() }
}

///////////////////////////////////////////////////////////////////////////////

function standardMove(creature) {
    let row = creature.row
    let col = creature.col
    //
    if (creature.direction.startsWith("north")) {
        row -= 1
    }
    else if (creature.direction.startsWith("south")) {
        row += 1
    }
    //
    if (creature.direction.endsWith("west")) {
        col -= 1
    }
    else if (creature.direction.endsWith("east")) {
        col += 1
    }
    //
    if (row < 0) { return false }
    if (col < 0) { return false }
    const maxrow = numberOfRows - 1
    const maxcol = numberOfCols - 1
    if (row > maxrow) { return false }
    if (col > maxcol) { return false }
    //
    creature.moveStatus = "move"
    return true
}

///////////////////////////////////////////////////////////////////////////////

function superMove(creature) {
    //
    if (LOOP - edit_moveClock < 6) { return false }
    edit_moveClock = LOOP
    //
    let row = creature.row
    let col = creature.col
    //
    if (creature.direction.startsWith("north")) {
        row -= 10
    }
    else if (creature.direction.startsWith("south")) {
        row += 10
    }
    //
    if (creature.direction.endsWith("west")) {
        col -= 10
    }
    else if (creature.direction.endsWith("east")) {
        col += 10
    }
    //
    if (row < 0) { row = 0 }
    if (col < 0) { col = 0 }
    const maxrow = numberOfRows - 1
    const maxcol = numberOfCols - 1
    if (row > maxrow) { row = maxrow }
    if (col > maxcol) { col = maxcol }
    //
    if (row == creature.row  &&  col == creature.col) { return false }
    //
    leaveSquare(creature.row, creature.col)
    creature.row = row
    creature.col = col
    enterSquare(creature, creature.row, creature.col)
    //
    return true
}

// ### file: beach.js ###

"use strict"


function autoBeach() { // Beach
    const collec = getBestBeaches()
    let index = collec.indexOf(SPRITE) + 1
    const max = collec.length - 1
    if (index > max) { index = 0 }
    SPRITE = collec[index]
}

function getBestBeaches() {  // best beaches to match neighbours
    let row = avatar.row
    let col = avatar.col
    if (row % 2 == 0) { row += 1 } // finds BOTTOM RIGHT corner of area
    if (col % 2 == 0) { col += 1 } // it is never on even row or even col
    //
    let beaches = []
    //
    pushNewItemsToArray(beaches, matchesForBeachFromNorth(row - 2, col))
    pushNewItemsToArray(beaches, matchesForBeachFromSouth(row + 2, col))
    pushNewItemsToArray(beaches, matchesForBeachFromWest(row, col - 2))
    pushNewItemsToArray(beaches, matchesForBeachFromEast(row, col + 2))
    //
    if (beaches.length == 0) { beaches = ["a1","a2","a3","a4"] }
    //
    for (let n = 0; n < beaches.length; n++) { beaches[n] = "beach-" + beaches[n] }
    return beaches
}

function matchesForBeachFromNorth(row, col) {
    const tail = getBeachTail(row, col)
    if (tail == "a1") { return ["b1","c3","d3"] }
    if (tail == "a2") { return ["b2","c4","d4"] }
    if (tail == "b3") { return ["a3","c3","d3"] }
    if (tail == "b4") { return ["a4","c4","d4"] }
    if (tail == "c3") { return ["a3","b1","c3","d3"] }
    if (tail == "c4") { return ["a4","b2","c4","d4"] }
    if (tail == "d3") { return ["a3","b1","c3","d3"] }
    if (tail == "d4") { return ["a4","b2","c4","d4"] }
    return [ ]
}

function matchesForBeachFromSouth(row, col) {
    const tail = getBeachTail(row, col)
    if (tail == "a3") { return ["b3","c3","d3"] }
    if (tail == "a4") { return ["b4","c4","d4"] }
    if (tail == "b1") { return ["a1","c3","d3"] }
    if (tail == "b2") { return ["a2","c4","d4"] }
    if (tail == "c3") { return ["a1","b3","c3","d3"] }
    if (tail == "c4") { return ["a2","b4","c4","d4"] }
    if (tail == "d3") { return ["a1","b3","c3","d3"] }
    if (tail == "d4") { return ["a2","b4","c4","d4"] }
    return [ ]
}

function matchesForBeachFromEast(row, col) {
    const tail = getBeachTail(row, col)
    if (tail == "a2") { return ["b2","c1","d1"] }
    if (tail == "a4") { return ["b4","c2","d2"] }
    if (tail == "b1") { return ["a1","c1","d1"] }
    if (tail == "b3") { return ["a3","c2","d2"] }
    if (tail == "c1") { return ["a1","b1","c1","d1"] }
    if (tail == "c2") { return ["a3","b4","c2","d2"] }
    if (tail == "d1") { return ["a1","b2","c1","d1"] }
    if (tail == "d2") { return ["a3","b4","c2","d2"] }
    return [ ]
}

function matchesForBeachFromWest(row, col) {
    const tail = getBeachTail(row, col)
    if (tail == "a1") { return ["b1","c1","d1"] }
    if (tail == "a3") { return ["b3","c2","d2"] }
    if (tail == "b2") { return ["a2","c1","d1"] }
    if (tail == "b4") { return ["a4","c2","d2"] }
    if (tail == "c1") { return ["a2","b1","c1","d1"] }
    if (tail == "c2") { return ["a4","b3","c2","d2"] }
    if (tail == "d1") { return ["a2","b1","c1","d1"] }
    if (tail == "d2") { return ["a4","b3","c2","d2"] }
    return [ ]
}

function getBeachTail(row, col) {
    // row, col comes already checked
    const nw = getBeachTailAt(row - 1, col - 1)
    if (nw != null) { return nw }

    const ne = getBeachTailAt(row - 1, col)
    if (ne != null) { return ne }

    const sw = getBeachTailAt(row, col - 1)
    if (sw != null) { return sw }

    const se = getBeachTailAt(row, col)
    if (se != null) { return se }

    return null
}

function getBeachTailAt(row, col) {
    const sqr = getSquare(row, col)
    if (sqr == null) { return null }
    if (sqr.layerA.indexOf("beach-") != 0) { return null }
    return sqr.layerA.substr(6, 2) // excludes beach-, nw, ne, sw, se
}

function pushNewItemsToArray(array, items) {
    if (items == undefined) { return }
    for (let n = 0; n < items.length; n += 1) {
        const item = items[n]
        if (array.indexOf(item) == -1) { array.push(item) }
    }
}

// ### file: check-beaches.js ###

"use strict"


function checkPatchPositionForBeaches(deltaCol, deltaRow) {
    //
    for (let row = 0; row < patchNumberOfRows; row++) {
        for (let col = 0; col < patchNumberOfCols; col++) {
            const index = (row * patchNumberOfCols) + col
            const sqr = patchTable[index]
            const status = checkPatchPositionThisBeach(sqr.layerA, row + deltaRow, col + deltaCol)
            if (status != "ok") { return status }
        }
    }
    //
    return "ok"
}

function checkPatchPositionThisBeach(layer, row, col) {
    //
    if (layer.indexOf("beach-") != 0) { return "ok" }
    //
    const corner = layer.substr(8)
    if (corner == "nw") {
        if (row % 2  !=  0) { return "row" }
        if (col % 2  !=  0) { return "col" }
    }
    else if (corner == "ne") {
        if (row % 2  !=  0) { return "row" }
        if (col % 2  ==  0) { return "col" }
    }
    else if (corner == "sw") {
        if (row % 2  ==  0) { return "row" }
        if (col % 2  !=  0) { return "col" }
    }
    else { // corner == "sw"
        if (row % 2  ==  0) { return "row" }
        if (col % 2  ==  0) { return "col" }
    }
    //
    return "ok"
}

// ### file: displacement.js ###

"use strict"


var displacementClock = 0 // moment of last accepted displacement

function editDisplacement(deltaLeft, deltaTop) {
    if (LOOP - displacementClock < 5) { return } // (for too fast keyboard input)
    displacementClock = LOOP
    //
    const sqr = getSquare(avatar.row, avatar.col)
    setDisplacementLeft(sqr, deltaLeft)
    setDisplacementTop(sqr, deltaTop)
}

function setDisplacementLeft(sqr, delta) { // SHIFT LEFT   SHIFT RIGHT
    if (delta == 0) { return }
    //
    let min, max
    //
    if (sqr.layerB != "") { min = -45; max = +45 }
    if (sqr.layerC != "") {
        min = -30; max = +30
        if (sqr.layerC == "tree-a") { min =   0; max = 60 }
        if (sqr.layerC == "tree-j") { min = -15; max = 50 }
        if (sqr.layerC == "tree-r") { min =  20; max = 80 }
    }
    if (min == undefined) { return } // no layerB nor layerC
    //
    sqr.deltaLeft += delta
    if (sqr.deltaLeft < min) { sqr.deltaLeft = min }
    if (sqr.deltaLeft > max) { sqr.deltaLeft = max }
}

function setDisplacementTop(sqr, delta) { // SHIFT UP   SHIFT DOWN
    if (delta == 0) { return }
    //
    let min, max
    //
    if (sqr.layerB != "") { min = -45; max = +45 }
    if (sqr.layerC != "") { min = -30; max = +30 }
    if (min == undefined) { return } // no layerB nor layerC
    //
    sqr.deltaTop += delta
    if (sqr.deltaTop < min) { sqr.deltaTop = min }
    if (sqr.deltaTop > max) { sqr.deltaTop = max }
}

// ### file: draw.js ###

"use strict"


var shallShowInfo = true

///////////////////////////////////////////////////////////////////////////////

function editor_drawInfo() {
    drawMapName()
    drawInfoSize()
    drawInfoPosition()
    //
    if (! shallShowInfo) { return }
    //
    drawInfoSquare()
    drawInfoSelectedLayer()
}

function drawMapName() {
    pictureCtx.font = "bold 15px sans-serif"
    pictureCtx.fillStyle = "black"
    pictureCtx.fillText(MAP, 20, 632)
}

function drawInfoPosition() {
    pictureCtx.font = "bold 24px sans-serif"
    pictureCtx.fillStyle = "black"
    const r = "row " + (1 + avatar.row)
    const c = "col " + (1 + avatar.col)
    pictureCtx.fillText(r, 295, 633)
    pictureCtx.fillText(c, 415, 633)
}

function drawInfoSize() {
    pictureCtx.font = "bold 14px sans-serif"
    pictureCtx.fillStyle = "black"
    //
    let cols = "" + numberOfCols
    if (cols.length < 3) { cols = " " + cols }
    pictureCtx.fillText("width   " + cols, 690, 620)
    //
    let rows = "" + numberOfRows
    if (rows.length < 3) { rows = " " + rows }
    pictureCtx.fillText("height  " + rows, 690, 635)
}

///////////////////////////////////////////////////////////////////////////////

function drawInfoSquare() {
    let top  = -5
    const left =  5
    pictureCtx.fillStyle = "rgba(255,255,255)"
    pictureCtx.fillRect(0, 0, 150, 85)
    pictureCtx.font = "bolder 13px monospace, sans-serif"
    pictureCtx.fillStyle = "black"
    //
    const sqr = getSquare(avatar.row, avatar.col)
    fill("A " + sqr.layerA)
    fill("B " + sqr.layerB)
    fill("C " + sqr.layerC)
    //
    let txt = "left " + sqr.deltaLeft
    while (txt.length < 9) { txt += " " }
    txt += "top " + sqr.deltaTop
    fill(txt)
    //
    function fill(txt) {
        top += 20
        pictureCtx.fillText(txt, left, top)
    }
}

function drawInfoSelectedLayer() {
    pictureCtx.fillStyle = "rgba(255,255,255)"
    pictureCtx.fillRect(630, 0, 180, 25)
    pictureCtx.font = "bolder 13px monospace, sans-serif"
    pictureCtx.fillStyle = "red"
    pictureCtx.fillText(SPRITE, 635, 18)
}

///////////////////////////////////////////////////////////////////////////////

// draws layer A directly on background context,
// called by module apply.js
function editor_drawLayerA(deltaRow, deltaCol) {
    //
    const row = avatar.row - deltaRow
    const col = avatar.col - deltaCol
    //
    const sqr = getSquare(row, col)
    let bmp = "null"
    if (sqr != null) { bmp = sqr.layerA }
    //
    if (bmp.startsWith("beach-")) { bmp = bmp.replace("beach", "beach-low") + "-" + sufixForOcean(row, col) }
    //
    if (bmp == "ocean") { bmp = "ocean-" + sufixForOcean(row, col) }
    //
    const left = 420 - (60 * deltaCol)
    const top  = 300 - (60 * deltaRow)
    backgroundCtx.drawImage(sprites[bmp], left, top)
}

// ### file: EPISODE.js ###

"use strict"

function setBasicConfig() {
    EPISODE = "EDITOR"
    TITLE = "EDITOR"
    MAP = "default-sand-map"
    overwrite()
}

///////////////////////////////////////////////////////////////////////////////

function setEpisodePages() { }

function setEpisodeObjects() { }

function setEpisodeTriggers() { }

function setEpisodeCreatures() {
    const row = Math.floor(numberOfRows / 2)
    const col = Math.floor(numberOfCols / 2)
    makeAvatar(row, col)
    //
    avatar.visible = true
    avatar.immuneFire = true
    avatar.immunePoison = true
}

///////////////////////////////////////////////////////////////////////////////

function runOverture() {
    dismissDisplay()
    initFamilies()
    //
    scheduleByTime(function () { speak(avatar, "Press [ENTER]") }, 1500)
    //
 // getSquare(avatar.row - 2, avatar.col).layerC = "portal"
}

function runEnterPortal() { }

///////////////////////////////////////////////////////////////////////////////

function editor_mapLoaded(name, txt) {
    //
    MAP = name.substr(0, name.length - 4)
    //
    makeGlobalTableFromMap(txt.trim())
    resetMemory()
    drawFreshBackground()
    repositionAvatar()
}

function repositionAvatar() {
    avatar.row = Math.floor(numberOfRows / 2)
    avatar.col = Math.floor(numberOfCols / 2)
    enterSquare(avatar, avatar.row, avatar.col)
}

// ### file: families.js ###

"use strict"


var firstOfFamily = { } // limit for previousLayerInFamily: "basalt": "basalt-n1"

var lastOfFamily  = { } // limit for previousLayerInFamily: "basalt": "basalt-test"


var families = { // must be fixed on start
    // layerA
    "beach"      : [ "a1","a2","a3","a4","b1","b2","b3","b4","c1","c2","c3","c4","d1","d2","d3","d4" ],

    "desert"     : [ "desert" ],

    "floor"      : [ "b", "g" ],

    "grass"      : [ "grass" ],

    "ocean"      : [ "ocean" ],

    "sand"       : [ "sand" ],

    "sanddesert" : [ "a1","a2","a3","a4","b1","b2","b3","b4","c1","c2","c3","c4",
                     "d1","d2","d3","d4","f1","f2","f3","f4","g1","g2","g3","g4"],

    "sandgrass"  : [ "a1","a2","a3","a4","b1","b2","b3","b4","c1","c2","c3","c4",
                     "d1","d2","d3","d4","f1","f2","f3","f4","g1","g2","g3","g4"],

    "swamp"      : [ "swamp" ],

    // layerB
    "ballast"    : [ "a", "b", "c", "d", "e", "f" ],

    "fields"     : [ "bonfire", "minibonfire", "smoke", "blufire", "miniblufire" ],

    "flower"     : [ "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "j2", "y", "z1", "z2", "z3", "z4" ],

    "gravel"     : [ "a", "b", "c", "d" ],

    "weed"       : [ "g1", "g2", "g3", "s1", "s2" ],

    // layerC
 // "basalt"     : [ "n1", "n2", "n3", "w1", "w2", "nwc", "nwb", "s1", "e1", "r", "test" ], // nwc=nw-corner, nwb=nw-beak

    "block"      : [ "a", "a2", "b", "c", "d", "e" ], //, "i", "j", "y", "z" ],

    "others"     : [ "altar", "altar-chain", "altar-antidote", "altar-health",
                     "altar-mana", "altar-bright-gem", "altar-dark-gem",
                     "altar-copper-key", "altar-iron-key", "altar-wooden-key",
                     "altar-scroll", "altar-skull-left", "altar-skull-right","chest",
                     "pedestal-bright-gem", "pedestal-dark-gem", "portal", "well", "door" ],

    "stone"      : [ "a", "b", "c", "d", "x", "y", "z" ],

    "tree"       : [ "a", "b", "c", "j", "j2", "r" ]
}


// init ///////////////////////////////////////////////////////////////////////

function initFamilies() {
    fixFamilies() // must come first
    //
    const keys = Object.keys(families)
    for (const key of keys) { setFirstAndLastOfFamily(key) }
}

// fix families ---------------------------------------------------------------

function fixFamilies() {
    const list = [ "beach", "floor", "sanddesert", "sandgrass",
                 "ballast", "flower", "gravel", "weed",
              // "basalt",
                 "block", "stone", "tree" ]
     //
     for (const prefix of list) { fixFamily(prefix) }
}

function fixFamily(prefix) {
    const layers = families[prefix]
    for (let n = 0; n < layers.length; n++) { layers[n] = prefix + "-" + layers[n] }
}

// first and last of each family ----------------------------------------------

function setFirstAndLastOfFamily(family) {
    const list = families[family]
    firstOfFamily[family] = list[0]
    lastOfFamily[family]  = list[list.length - 1]
}

// ### file: file.js ###

"use strict"


var fileSelector
var downloadLink


// CLICK HTML ELEMENT! ////////////////////////////////////////////////////////

function clickHtmlElement(element) {
    // Firefox (and Edge) does not click link that is not body's child
    const e = document.createEvent("MouseEvents")
    e.initEvent("click", true, true) // event type, can bubble?, cancelable?
    element.dispatchEvent(e)
}

// init ///////////////////////////////////////////////////////////////////////

function initFileSelector() {
    fileSelector = document.createElement("input")
    fileSelector.type = "file"
    fileSelector.onchange = editor_loadMap2
}

// load map ///////////////////////////////////////////////////////////////////

function editor_loadMap() {
    if (fileSelector == undefined) { initFileSelector() }
    //
    resetKeyboard() // or else ctrlPressed keeps true!!!
    //
    fileSelector.value = "" // or else same file will not trigger onchange event on second (consecutive) time
    clickHtmlElement(fileSelector)
}

function editor_loadMap2() {
    const file = fileSelector.files[0]
    //
    if (file == undefined) { console.log("file loading aborted"); return } // should not happen
    //
 // console.log("loading:", file.type, "  ", file.name, "  bytes:", file.size)
    //
    if (! file.name.endsWith(".map")) { alert("ERROR: file extension must be    .map"); return }
    //
    const reader = new FileReader()
    reader.onload = function (e) { editor_loadMap3(file.name, e.target.result) }
    reader.readAsText(file)
}

function editor_loadMap3(name, txt) {
    console.log("loaded", name)
    //
    if (POSTALCARD) {
        patchLoaded(txt)
    }
    else {
        editor_mapLoaded(name, txt)
    }
}

// download text //////////////////////////////////////////////////////////////

function downloadText(filename, map) {
    console.log("downloading", filename)
    //
    if (downloadLink == undefined) { downloadLink = document.createElement("a") }
    //
    downloadLink.download = filename
    downloadLink.href = "data:text/plain;charset=utf-8," + encodeURIComponent(map)
    //
    clickHtmlElement(downloadLink)
}

// ### file: instructions.js ###

"use strict"

const editor_instructions1 =
    "0lpENTER .......................................... open these instructions\n" +
    "2lpCTRL M ................................................................ new map\n" +
    "1lpCTRL L ................................................................. load map\n" +
    "1lpCTRL S .......................................................... dowload map\n" +
    "1lpCTRL SHIFT S .............................. show map code in popup\n" +
    "2lpARROWs ................................................... standard move\n" +
    "1lpCTRL  ARROWs ................................................. fast move\n" +
    "1lpSHIFT ARROWs ............... displace layer (not for layer A)\n" +
    "2lpCTRL Z  or  BACKSPACE ............................................. undo\n" +
    "1lpCTRL Y  or  SHIFT BACKSPACE ................................... redo\n" +
    "2lpCTRL P .......................................... start postal card mode\n" +
    pagePressEnter.replace("*", "#")

const editor_instructions2 =
    "1lp; ...................................................................... toggle grid\n" +
    "2lpTAB .................................................. toggle shallow mode\n" +
    "1lpSHIFT TAB .............................................. toggle show info\n" +
    "2lpESCAPE ........................................ toggle avatar visibility\n" +
    "2lpPAGEUP  and  PAGEDOWN ............... select layer in family\n" +
    "2lpSPACE .............................................................. apply layer\n" +
    "1lpSHIFT L ......... auto apply (beach, sandgrass, sanddesert)\n" +
    "2lpDELETE ...................................... erase layer B and layer C\n" +
    pagePressEnter.replace("*", "#")

const editor_instructions3 =
    "1lpA ........................................ ballast and gravel (repeat  A)\n" +
    "1lpB ........................................... beach and ocean (repeat  B)\n" +
 // "1lpC ..... basalt\n" +
    "1lpD ........................... sandgrass  and sanddesert (repeat  D)\n" +
    "1lpE ............................................................................... stone\n" +
    "1lpF ............................................................................. flower\n" +
    "1lpG .............................................................................. grass\n" +
    "1lpI ................................................................................ field\n" +
    "1lpK ............................................................................... block\n" +
    "1lpP ............................................................................. swamp\n" +
    "1lpO ............................................................................... floor\n" +
    "1lpS ............................................ sand and desert (repeat  S)\n" +
    "1lpT ................................................................................ tree\n" +
    "1lpW ............................................................................. weed\n" +
    "1lpY ............................................................................ others\n" +
    pagePressEnter.replace("*", "#")

///////////////////////////////////////////////////////////////////////////////

function showInstructions() {
    displayStone(editor_instructions1, ["enter"], showInstructions2)
}

function showInstructions2() {
    displayStone(editor_instructions2, ["enter"], showInstructions3)
}

function showInstructions3() {
    displayStone(editor_instructions3, ["enter"])
}

// ### file: keyboard.js ###

"use strict"

function resetKeyboard() {
    // avoiding keep CTRL pressed after release file selector
    ctrlKeyPressed  = false
    shiftKeyPressed = false
    upKeyPressed    = false
    downKeyPressed  = false
    leftKeyPressed  = false
    rightKeyPressed = false
    spaceKeyPressed = false
}

///////////////////////////////////////////////////////////////////////////////

function editor_keyDownHandler(low) {
    //
    if (low == "arrowup")    { upKeyPressed    = true; return }
    if (low == "arrowdown")  { downKeyPressed  = true; return }
    if (low == "arrowleft")  { leftKeyPressed  = true; return }
    if (low == "arrowright") { rightKeyPressed = true; return }
    //
    if (low == " ")  { spaceKeyPressed = true }
    //
    if (displayStatus != "no-display") { keyDownHandlerDisplay(low); return }
    //
    if (POSTALCARD) { keyDownHandlerPostalCard(low); return }
    //
    keyDownHandlerEdit(low)
}

///////////////////////////////////////////////////////////////////////////////

function keyDownHandlerEdit(low) {
    //
    if (low == "backspace"  &&  shiftKeyPressed) { redo(); return }
    if (low == "backspace") { undo(); return }
    if (low == "delete")    { cleanSquare(); return }
    if (low == "escape")    { avatar.visible = ! avatar.visible; return }
    if (low == "tab"  &&  shiftKeyPressed) { shallShowInfo  = ! shallShowInfo; return }
    if (low == "tab")       { isShallowMode  = ! isShallowMode; return }
    //
    if (low == "pageup")    { previousSpriteInFamily(); return }
    if (low == "pagedown")  { nextSpriteInFamily(); return }
    if (low == "enter")     { showInstructions(); return }
    if (low == ";")         { toggleGrid(); return }
    if (low == "l"  &&  shiftKeyPressed) { applyLayerAuto(); return }
    if (low == "l"  &&  ctrlKeyPressed)  { editor_loadMap(); return }
    if (low == "m"  &&  ctrlKeyPressed)  { createNewMap(); return }
    if (low == "s"  &&  ctrlKeyPressed)  { saveMap(shiftKeyPressed); return }
    if (low == "y"  &&  ctrlKeyPressed)  { redo(); return }
    if (low == "z"  &&  ctrlKeyPressed)  { undo(); return }
    if (low == "p"  &&  ctrlKeyPressed)  { startPostalCard(); return }
    //
    changeFamily(low)
}

///////////////////////////////////////////////////////////////////////////////

function keyDownHandlerPostalCard(low) {
    //
    if (low == "backspace"  &&  shiftKeyPressed) { redo(); return }
    if (low == "backspace") { undo(); return }
    if (low == "escape") { endPostalCardMode(); return }
    if (low == "m") { markerOn = true; return }
    if (low == "p") { markerOn = false; return }
    if (low == "c"  &&  ctrlKeyPressed) { setPatchFromMarker(); return }
    if (low == "l"  &&  ctrlKeyPressed) { loadPatch(); return }
    if (low == "s"  &&  ctrlKeyPressed) { savePatch(); return }
    if (low == "v"  &&  ctrlKeyPressed) { pastePatch(); return }
    if (low == "y"  &&  ctrlKeyPressed) { redo(); return }
    if (low == "z"  &&  ctrlKeyPressed) { undo(); return }
}

// ### file: map-from-table.js ###

"use strict"


///////////////////////////////////////////////////////////////////////////////

function mapFromTable(table, width, height) {
    let map = ""
    map += width + " "
    map += height  // ' ' will be inserted by makeMapDataFromTable
    map += mapDataFromTable(table)
    return map
}

function mapDataFromTable(table) {
    let data = ""
    let n = -1
    for (const sqr of table) {
        n += 1
        const row = Math.floor(n / numberOfCols)
        const col = n - (row * numberOfCols)
        data += " " + mapDataFromSquare(sqr, row, col)
    }
    return data
}

function mapDataFromSquare(sqr, row, col) {
    const a = mapEncodeLayerA(sqr.layerA, row, col)  // "value"
    let   b = mapEncodeLayerB(sqr.layerB, row, col)  //  ""  or  "value"
    let   c = mapEncodeLayerC(sqr.layerC, row, col)  //  ""  or  "value"
    const d = mapEncodeDisplacement(sqr)  //  ""  or  ";value"  (already prefixed)
    //
    if (b != ""  ||  c != "") { b = ";" + b }  // ";"  or ";value"
    if (c != ""  ||  d != "") { c = ";" + c }  // ";"  or ";value"
    return a + b + c + d
}

// >>> single code and group (tail) code must not share first letter!
// concrete case:
// "b" was for minibonfire then "bb" was introduced for miniblufire,
// but "bb" was alread used for ballast...
// so miniblufire suddenly appeared on episode brave-new-world!

function mapEncodeLayerA(s, row, col) {
 // if (s == "") { return "" }
    const parts = s.split("-")
    const head = parts[0]
    const tail = parts[1]
    //
    if (head == "sand")   { return "s" }
    if (head == "ocean")  { return "o" }
    if (head == "beach")  { return "b" + tail }
    if (head == "desert") { return "d" + tail }
    if (head == "floor")  { return "f" + tail }
    if (head == "grass")  { return "g" + tail }
    if (head == "sandgrass")  { return "G" + tail }
    if (head == "sanddesert") { return "D" + tail }
    if (head == "swamp")  { return "w" + tail }
    alert("ERROR: layer A at " + row + ":" + col + " has undefined encoding [" + s + "]")
}

function mapEncodeLayerB(s, row, col) {
    if (s == "") { return "" }
    const parts = s.split("-")
    const head = parts[0]
    const tail = parts[1]
    //
    if (head == "smoke")       { return "S" }
    if (head == "bonfire")     { return "B" }
    if (head == "minibonfire") { return "Bm" }
    if (head == "blufire")     { return "Bb" }
    if (head == "miniblufire") { return "Bbm" }
    if (head == "ballast") { return "b" + tail }
    if (head == "flower")  { return "f" + tail }
    if (head == "gravel")  { return "g" + tail }
    if (head == "weed")    { return "w" + tail }
    alert("ERROR: layer B at " + row + ":" + col + " has undefined encoding [" + s + "]")
}

function mapEncodeLayerC(s, row, col) {
    if (s == "")      { return "" }
    if (s == "altar") { return "A" }
    if (s == "altar-chain")      { return "AC"  }
    if (s == "altar-antidote")   { return "Aa"  }
    if (s == "altar-health")     { return "Ah"  }
    if (s == "altar-bright-gem") { return "Abg" }
    if (s == "altar-dark-gem")   { return "Adg" }
    if (s == "altar-copper-key") { return "Akc" }
    if (s == "altar-iron-key")   { return "Aki" }
    if (s == "altar-mana")       { return "Am"  }
    if (s == "altar-wooden-key") { return "Akw" }
    if (s == "altar-scroll")     { return "Ac"  }
    if (s == "altar-skull-left") { return "Asl" }
    if (s == "altar-skull-right")   { return "Asr" }
    if (s == "pedestal-bright-gem") { return "Pbg" }
    if (s == "pedestal-dark-gem")   { return "Pdg" }
    if (s == "chest")  { return "C" }
    if (s == "door")   { return "D" }
    if (s == "portal") { return "P" }
    if (s == "well")   { return "W" }
    //
    const parts = s.split("-")
    const head = parts[0]
    const tail = parts[1]
    //
    if (head == "basalt")  { return "b" + tail }
    if (head == "block")   { return "k" + tail }
    if (head == "stone")   { return "s" + tail }
    if (head == "tree")    { return "t" + tail }
    alert("ERROR: layer C at " + row + ":" + col + " has undefined encoding [" + s + "]")
}

function mapEncodeDisplacement(sqr) {
    // erases obsolet marks
    if (sqr.LayerB  == ""  &&  sqr.LayerC  == "")  { return "" }
    if (sqr.deltaTop == 0  &&  sqr.deltaLeft == 0) { return "" }
    return ";" + sqr.deltaTop + "," + sqr.deltaLeft
}

// ### file: map-new-save-show.js ###

"use strict"



///////////////////////////////////////////////////////////////////////////////

function showMapInOtherTab(name, map) {
 // const options = "width=900,height=600,left=200,top=50" // open window as popup
    const options = "menubar=yes,location=yes,scrollbars=yes,status=yes" // open as another tab
    //
    // scrollbars=no opens as simplified window
    //
    const popup = window.open("", "_blank", options)
    popup.document.title = name
    popup.document.body.style.margin = "0px"
    popup.document.body.style.fontSize = "12px"
    popup.document.body.style.fontFamily = "sans-serif"
    popup.document.body.innerHTML = map
}

///////////////////////////////////////////////////////////////////////////////

function saveMap(popup) {
    //
    let name = prompt("> save map with this name:", MAP)
    if (name == null) { return }
    //
    name = name.trim()
    if (name.endsWith(".map")) { name = name.substr(0, name.length - 4).trim() }
    if (name == "")   { return }
    //
    MAP = name
    //
    const map = mapFromTable(episodeTable, numberOfCols, numberOfRows)
    //
    if (popup) {
        showMapInOtherTab(name, map)
    }
    else {
        downloadText(name + ".map", map)
    }
}

///////////////////////////////////////////////////////////////////////////////

function createNewMap() {
    const txt = "" +
    "0cpDownload of a 100 x 100 new map\n" +
    "4lpThis download will not mess the current map.\n" +
    "2lpLater you can extract a smaller map from the new one.\n" +
    "2lpYou may choose Grass, Sand, Desert or Ocean.\n" +
    "#rp<press  G, S, D, O  or  Enter  to  cancel>"
    //
    displayStone(txt, ["g", "s", "d", "o", "enter"], createNewMap2)
}

function createNewMap2(answer) {
    dismissDisplay()
    if (answer == "enter") { return }
    //
    let map = ""
    let filename = ""
    //
    if (answer == "g") {
        filename = "100x100-grass.map"
        map = makeGrassMap(100, 100)
    }
    else if (answer == "s") {
        filename = "100x100-sand.map"
        map = makeSandMap(100, 100)
    }
    else if (answer == "d") {
        filename = "100x100-desert.map"
        map = makeDesertMap(100, 100)
    }
    else if (answer == "o") {
        filename = "100x100-ocean.map"
        map = makeOceanMap(100, 100)
    }
    //
    downloadText(filename, map)
}

///////////////////////////////////////////////////////////////////////////////

function makeSandMap(width, height) {
    return "" + width + " " + height + (" s".repeat(width * height))
}

function makeOceanMap(width, height) {
    return "" + width + " " + height + (" o".repeat(width * height))
}

function makeGrassMap(width, height) {
    let map = "" + width + " " + height
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            map += " g" + sufixForGrass(row, col)
        }
    }
    return map
}

function makeDesertMap(width, height) {
    let map = "" + width + " " + height
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            map += " d" + sufixForDesert(row, col)
        }
    }
    return map
}

// ### file: marker.js ###

"use strict"

// all coordinates are square based


var markerOn = true
var markerLeft = 0
var markerTop  = 0

var markerNumberOfCols = 10
var markerNumberOfRows = 10


///////////////////////////////////////////////////////////////////////////////

function resetMarker() {
    markerOn = true
    markerLeft = 0
    markerTop  = 0
    markerNumberOfCols = Math.min(10, pictureNumberOfCols)
    markerNumberOfRows = Math.min(10, pictureNumberOfRows)
    //
    pictureCtx.fillStyle = "rgba(250,0,0,0.75)"
}

///////////////////////////////////////////////////////////////////////////////

function drawMarker() {
    const left = markerLeft + postalCardLeft
    const top  = markerTop  + postalCardTop
    //
    pictureCtx.fillRect(15 * left, 15 * top, 15 * markerNumberOfCols, 15 * markerNumberOfRows)
}

///////////////////////////////////////////////////////////////////////////////

function moveMarker(deltaLeft, deltaTop) { // marker position is related to postalCard (NOT to picture)
    //
    if (LOOP - edit_moveClock < 3) { return false }
    edit_moveClock = LOOP
    //
    markerLeft += deltaLeft
    markerTop  += deltaTop
    //
    const minLeft = 1 - markerNumberOfCols
    const maxLeft = numberOfCols - 1
    //
    const minTop = 1 - markerNumberOfRows
    const maxTop = numberOfRows - 1
    //
    if (markerLeft < minLeft) { markerLeft = minLeft }
    if (markerLeft > maxLeft) { markerLeft = maxLeft }
    //
    if (markerTop < minTop) { markerTop = minTop }
    if (markerTop > maxTop) { markerTop = maxTop }
}

///////////////////////////////////////////////////////////////////////////////

function resizeMarker(deltaWidth, deltaHeight) { // marker position is related to postalCard (NOT to picture)
    //
    if (LOOP - edit_moveClock < 3) { return false }
    edit_moveClock = LOOP
    //
    if (deltaWidth  == -1) { decreaseMarkerNumberOfCols() }
    if (deltaWidth  == +1) { increaseMarkerNumberOfCols() }
    if (deltaHeight == -1) { decreaseMarkerNumberOfRows() }
    if (deltaHeight == +1) { increaseMarkerNumberOfRows() }
}

function decreaseMarkerNumberOfCols() {
    if (markerNumberOfCols == 1) { return }
    if (postalCardLeft + markerLeft + markerNumberOfCols < 2) { return }
    markerNumberOfCols -= 1
}

function increaseMarkerNumberOfCols() {
    if (markerNumberOfCols >= numberOfCols) { return }
    if (postalCardLeft + markerLeft + markerNumberOfCols >= pictureNumberOfCols) { return }
    markerNumberOfCols += 1
}

function decreaseMarkerNumberOfRows() {
    if (markerNumberOfRows == 1) { return }
    if (postalCardTop + markerTop  + markerNumberOfRows < 2) { return }
    markerNumberOfRows -= 1
}

function increaseMarkerNumberOfRows() {
    if (markerNumberOfRows >= numberOfRows) { return }
    if (postalCardTop  + markerTop  + markerNumberOfRows >= pictureNumberOfRows) { return }
    markerNumberOfRows += 1
}

// ### file: memory.js ###

"use strict"


// function maybeMemorizeBeforeUndo (Redo)
// creates special memory slot:
// same map new avatar position


var memory = [ ] // list of positionMapObjects
var memoryIndex = 0


///////////////////////////////////////////////////////////////////////////////

function EditorMemoryObject(row, col, map) {
    this.row = row
    this.col = col
    this.map = map
}

///////////////////////////////////////////////////////////////////////////////

function createPositionMapObject() {
    let row = Math.floor(numberOfRows / 2)
    let col = Math.floor(numberOfCols / 2)
    //
    if (avatar != undefined) { row = avatar.row; col = avatar.col }
    //
    const map =  mapFromTable(episodeTable, numberOfCols, numberOfRows)
    return new EditorMemoryObject(row, col, map)
}

///////////////////////////////////////////////////////////////////////////////

function resetMemory() {
    const pm = createPositionMapObject()
    memory = [ pm ]
    memoryIndex = 0
}

///////////////////////////////////////////////////////////////////////////////

function maybeMemorize() {
    //
    if (! maybeSquareChanged) { return }
    //
    maybeSquareChanged = false
    //
    tryMemorize()
}

///////////////////////////////////////////////////////////////////////////////

function maybeMemorizeBeforeUndo() { // same map new avatar position
    //
    if (! maybeSquareChanged) { return }
    //
    maybeSquareChanged = false
    //
    const map = (memory[memoryIndex]).map
    //
    const didmem = tryMemorize()
    if (! didmem) { return }
    //
    const last = memory.pop()
    const mo = new EditorMemoryObject(avatar.row, avatar.col, map)
    memory.push(mo)
    memory.push(last)
}

function maybeMemorizeBeforeRedo() {
    maybeMemorizeBeforeUndo()
}

///////////////////////////////////////////////////////////////////////////////

function maybeMemorizeAfterPastePatch() {
    let left = patchLeft
    if (left < 0) { left = 0 }
    //
    let right = patchLeft + patchNumberOfCols
    if (right > numberOfCols) { right = numberOfCols }
    //
    let top = patchTop
    if (top < 0) { top = 0 }
    //
    let bottom = patchTop + patchNumberOfRows
    if (bottom > numberOfRows) { bottom = numberOfRows }
    //
    const avarow = avatar.row
    const avacol = avatar.col
    //
    // for createPositionMapObject
    avatar.row = top  + Math.floor((bottom - top) / 2)
    avatar.col = left + Math.floor((right - left) / 2)
    //
    const didmem = tryMemorize()
    //
    if (! didmem) {
        avatar.col = avacol
        avatar.row = avarow
        return
    }
    //
    leaveSquare(avarow, avacol)
    enterSquare(avatar, avatar.row, avatar.col)
}

///////////////////////////////////////////////////////////////////////////////

function tryMemorize() {
    const candidate = createPositionMapObject()
    const last = memory[memory.length - 1]
    //
    if (last.map == candidate.map) { return false } // square has not changed
    //
    memory.push(candidate)
    if (memory.length > 100) { memory.shift() }
    //
    memoryIndex = memory.length - 1
    //
    return true
}

///////////////////////////////////////////////////////////////////////////////

function undo() {
    if (POSTALCARD  &&  ! markerOn) { alert("Can not undo: patch is on"); return }
    //
    if (memoryIndex == 0) { return }
    //
    maybeMemorizeBeforeUndo() // avatar has not left and maybe has edited square
    //
    memoryIndex -= 1
    recover()
}

function redo() {
    if (POSTALCARD  &&  ! markerOn) { alert("Can not redo: patch is on"); return }
    //
    if (memoryIndex == memory.length - 1) { return }
    //
    let index = memoryIndex
    maybeMemorizeBeforeRedo() // avatar has not left and maybe has edited square
    memoryIndex = index
    //
    memoryIndex += 1
    recover()
}

///////////////////////////////////////////////////////////////////////////////

function recover() {
    const pm = memory[memoryIndex]
    makeGlobalTableFromMap(pm.map)
    //
    avatar.row = pm.row
    avatar.col = pm.col
    enterSquare(avatar, avatar.row, avatar.col)
    //
    if (POSTALCARD) { postalCard = createPostalCard(episodeTable, numberOfCols, numberOfRows) }
}

// ### file: overwrite.js ###

"use strict"


function __editor_dirtyrat_quiet() {
    console.log(overwrite, startTeleportIn, clearBeach, removeWeed, setTitle, showPostalCard)
}

///////////////////////////////////////////////////////////////////////////////

function overwrite() {

    LANGUAGE = "portuguese"

    // MAIN
    main3 = editor_main3
    basicOnBeforeUnload = editor_beforeUnload

    // START
    scriptTitle = runOverture

    // KEYBOARD
    mainKeyDownHandler2 = editor_keyDownHandler

    // MOVEMENT
    move = editor_move
    tryMoveAvatar = function () { move(avatar) }
    isFreeSquareForAvatar = function () { return true }
    updateSpeed = function (creature) { creature.speed = 10 }

    // TABLE & TRIGGERS
    setAltarsAuto  = function () { }
    setPortalsAuto = function () { }
    maybeEnterPortal = function () { }

    // PICTURE
    drawInfo = editor_drawInfo
 //   drawAimMark = function () { }
    drawCreatureName = function () { }
    drawHeartOnMainBar = function () { }
    drawCreatureLifeBar = function () { }
    bmpForNullSquare = function () { return "null" }

    // MAIN LOOP
    updateSomething = maybeApplyLayer
}

///////////////////////////////////////////////////////////////////////////////

function editor_main3() {
    loadSprites()
    //
    makeGlobalTableFromMap(makeSandMap(30,30)) // .replace("s", "s;;ka;15,15")
    resetMemory()
    tableIsReady = true
    //
    waitFinishLoading()
}

function editor_beforeUnload() {
    return ""
}

// ### file: patch.js ###

"use strict"

// all coordinates are square based


var patchTable = null
var patchNumberOfCols = 0
var patchNumberOfRows = 0

var patchImage = null
var patchLeft = 0
var patchTop  = 0


///////////////////////////////////////////////////////////////////////////////

function resetPatch() {
    patchLeft = 0
    patchTop  = 0
    //
    if (patchTable != null) { return }
    const map = makeGrassMap(10, 10)
    makePatch(map)
}

///////////////////////////////////////////////////////////////////////////////

function loadPatch() {
    editor_loadMap()
}

///////////////////////////////////////////////////////////////////////////////

function patchLoaded(txt) {
    markerOn = false
    makePatch(txt.trim())
}

///////////////////////////////////////////////////////////////////////////////

function makePatch(map) {
    const obj = makeTableObjFromMap(map)
    //
    patchTable = obj.table
    patchNumberOfRows = obj.height
    patchNumberOfCols = obj.width
    //
    makePatchImage()
}

function makePatchImage() {
    patchImage = createPostalCard(patchTable, patchNumberOfCols, patchNumberOfRows)
    //
    const w = patchImage.width
    const h = patchImage.height
    const ctx = patchImage.getContext("2d")
    ctx.fillStyle = "red"
    ctx.fillRect(0,     0, w, 3) // north
    ctx.fillRect(0,   h-3, w, 3) // south
    ctx.fillRect(w-3,   0, 3, h) // east
    ctx.fillRect(0,     0, 3, h) // west
}

///////////////////////////////////////////////////////////////////////////////

function drawPatch() {
    const left = patchLeft + postalCardLeft
    const top  = patchTop  + postalCardTop
    //
    pictureCtx.drawImage(patchImage, 15 * left, 15 * top)
}

///////////////////////////////////////////////////////////////////////////////

function movePatch(deltaLeft, deltaTop) { // patch position is related to postalCard (NOT to picture)
    //
    if (LOOP - edit_moveClock < 3) { return false }
    edit_moveClock = LOOP
    //
    patchLeft += deltaLeft
    patchTop  += deltaTop
    //
    const minLeft =  1 - patchNumberOfCols
    const maxLeft = numberOfCols - 1
    //
    const minTop = 1 - patchNumberOfRows
    const maxTop = numberOfRows - 1
    //
    if (patchLeft < minLeft) { patchLeft = minLeft }
    if (patchLeft > maxLeft) { patchLeft = maxLeft }
    //
    if (patchTop < minTop) { patchTop = minTop }
    if (patchTop > maxTop) { patchTop = maxTop }
}

///////////////////////////////////////////////////////////////////////////////

function savePatch() {
    if (markerOn) { alert("Can not save patch: patch is not on"); return }
    //
    let name = prompt("> save *PATCH* with this name:", "patch")
    if (name == null) { return }
    //
    name = name.trim()
    if (name.endsWith(".map")) { name = name.substr(0, name.length - 4).trim() }
    if (name == "")   { return }
    //
    const map = mapFromTable(patchTable, patchNumberOfCols, patchNumberOfRows)
    //
    downloadText(name + ".map", map)
}

///////////////////////////////////////////////////////////////////////////////

function setPatchFromMarker() {
    if (! markerOn) { alert("Can not set patch from marker: marker is not on"); return }
    //
    const minCol = Math.max(0, markerLeft)
    const maxCol = Math.min(markerLeft + markerNumberOfCols - 1, numberOfCols - 1)
    //
    const minRow = Math.max(0, markerTop)
    const maxRow = Math.min(markerTop + markerNumberOfRows - 1, numberOfRows - 1)
    //
    patchTable = [ ]
    patchNumberOfCols = maxCol - minCol + 1
    patchNumberOfRows = maxRow - minRow + 1
    //
    for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
            const src = getSquare(row, col)
            const sqr = cloneSquare(src)
            patchTable.push(sqr)
        }
    }
    //
    makePatchImage()
    //
    patchLeft = markerLeft
    patchTop = markerTop
    markerOn = false
}

function cloneSquare(src) {
    const sqr = makeSquare()
    sqr.layerA = src.layerA
    sqr.layerB = src.layerB
    sqr.layerC = src.layerC
    sqr.deltaTop = src.deltaTop
    sqr.deltaLeft = src.deltaLeft
    //
    return sqr
}

///////////////////////////////////////////////////////////////////////////////

function pastePatch() {
    if (markerOn) { alert("Can not paste patch: patch is not on"); return }
    //
    const check = checkPatchPositionForBeaches(patchLeft % 2, patchTop % 2)
    if (check != "ok") { alert("Can not paste patch: bad " + check + " for beach(es)"); return }
    //
    for(let row = 0; row < patchNumberOfRows; row++) {
        for(let col = 0; col < patchNumberOfCols; col++) {
            const index = row * patchNumberOfCols + col
            const src = patchTable[index]
            pastePatchSquare(src, row + patchTop, col + patchLeft)
        }
    }
    //
    maybeMemorizeAfterPastePatch()
    postalCard = createPostalCard(episodeTable, numberOfCols, numberOfRows)
}

function pastePatchSquare(src, row, col) {
    const sqr = getSquare(row, col)
    if (sqr == null) { return }
    //
    sqr.layerA = adjustForLayerA(src.layerA, row, col)
    sqr.layerB = src.layerB
    sqr.layerC = src.layerC
    sqr.deltaTop  = src.deltaTop
    sqr.deltaLeft = src.deltaLeft
}

function adjustForLayerA(layerA, row, col) { // before paste
    if (layerA.startsWith("grass-"))  { return "grass-"  + sufixForGrass(row, col) }
    if (layerA.startsWith("desert-")) { return "desert-" + sufixForDesert(row, col) }
    if (layerA.startsWith("sandgrass-"))  { return layerA.substr(0,12) + sufixForGrass(row, col) }
    if (layerA.startsWith("sanddesert-")) { return layerA.substr(0,13) + sufixForDesert(row, col) }
    return layerA
}

// ### file: postalcard-img.js ###

"use strict"


const miniSprites = { }

///////////////////////////////////////////////////////////////////////////////

function showPostalCard() {
    const pc = createPostalCard(episodeTable, numberOfCols, numberOfRows)
    const options = "menubar=yes,location=yes,scrollbars=yes,status=yes" // open as another tab
    const popup = window.open("", "_blank", options)
    popup.document.title = MAP
    popup.document.body.style.margin = "0px"
    popup.document.body.style.textAlign = "center"
    popup.document.body.style.background = "seagreen"
    popup.document.body.appendChild(pc)
}

///////////////////////////////////////////////////////////////////////////////

function createPostalCard(table, numOfCols, numOfRows) {
    const canvas  = document.createElement("canvas")
    canvas.width  = 15 * numOfCols // 60 / 4
    canvas.height = 15 * numOfRows // 60 / 4
    const context = canvas.getContext("2d")
    //
    const flats   = [ ]  // layers B (so layerA doesn't override right/down displaced layerB)
    const volumes = [ ]  // layers C
    //
    for (let row = 0; row < numOfRows; row++) {
        for (let col = 0; col < numOfCols; col++) {
            const index = row * numOfCols + col
            const sqr = table[index]
            processPostalCardSquare(context, flats, volumes, sqr, row, col)
        }
    }
    //
    for (const obj of flats)   { pcDrawByBottomRight(context, obj.bmp, obj.bottom, obj.right) }
    for (const obj of volumes) { pcDrawByBottomRight(context, obj.bmp, obj.bottom, obj.right) }
    //
    return canvas
}

function processPostalCardSquare(context, flats, volumes, sqr, row, col) {
    pcDrawLayerA(context, sqr, row, col)
    pcSetLayerB(flats, sqr, row, col)
    pcSetLayerC(volumes, sqr, row, col)
}

///////////////////////////////////////////////////////////////////////////////

function pcDrawLayerA(context, sqr, row, col) {
    let bmp = sqr.layerA
    //
    if (bmp == "ocean") {
        bmp = "ocean-" + sufixForOcean(row, col)
    }
    else if (bmp.indexOf("beach-") == 0) {
        bmp = bmp.replace("beach", "beach-low")
        bmp += "-" + sufixForOcean(row, col)
    }
    //
    const left = col * 15
    const top  = row * 15
    context.drawImage(getMiniSprite(bmp), left, top)
}

///////////////////////////////////////////////////////////////////////////////

function pcSetLayerB(flats, sqr, row, col) {
    let bmp = sqr.layerB
    if (bmp == "") { return }
    if (bmp == "smoke")   { bmp += "-1" }
    if (bmp == "bonfire") { bmp += "-1" }
    if (bmp == "blufire") { bmp += "-1" }
    if (bmp == "minibonfire") { bmp += "-1" }
    if (bmp == "miniblufire") { bmp += "-1" }
    let bottom = (row * 15) + 15
    let right  = (col * 15) + 15
    if (sqr.layerC == "") {
        // layerC assumes displacement for itself
        bottom += Math.floor(sqr.deltaTop  / 4)
        right  += Math.floor(sqr.deltaLeft / 4)
    }
    const obj = newDrawObject("mini", bmp, bottom, right)
    flats.push(obj)
}

///////////////////////////////////////////////////////////////////////////////

function pcSetLayerC(volumes, sqr, row, col) {
    const bmp = sqr.layerC
    if (bmp == "") { return }
    //
    const bottom = (row * 15) + 15 + Math.floor(sqr.deltaTop  / 4)
    const right  = (col * 15) + 15 + Math.floor(sqr.deltaLeft / 4)
    //
    const obj = newDrawObject("mini", bmp, bottom, right)
    //
    volumes.push(obj)
    const pos = volumes.length - 1
    pcSortVolumes(volumes, pos)
}

function pcSortVolumes(volumes, pos) {
    // recursive
    // assumes that none or *just one* obj is out of order
    if (pos == 0) { return }
    const current  = volumes[pos]
    const previous = volumes[pos - 1]
    //
    if (previous.bottom < current.bottom) { return }
    if (previous.bottom == current.bottom  &&  previous.right <= current.right) { return }
    //
    const bmp    = previous.bmp
    const bottom = previous.bottom
    const right  = previous.right
    previous.bmp    = current.bmp
    previous.bottom = current.bottom
    previous.right  = current.right
    current.bmp    = bmp
    current.bottom = bottom
    current.right  = right
    pcSortVolumes(volumes, pos - 1)
}

///////////////////////////////////////////////////////////////////////////////

function pcDrawByBottomRight(context, bmp, bottom, right) {
    const mini = getMiniSprite(bmp)
    const left = right  - mini.width
    const top  = bottom - mini.height
    context.drawImage(mini, left, top)
}

///////////////////////////////////////////////////////////////////////////////

function getMiniSprite(bmp) {
    let mini = miniSprites[bmp]
    if (mini == undefined) {
        mini = makeMiniSprite(bmp)
        miniSprites[bmp] = mini
    }
    return mini
}

function makeMiniSprite(bmp) {
    const spr = sprites[bmp]
    if (spr == undefined) { alert("\npostal card: unknown sprite: [" + bmp + "]") }
    const w   = Math.ceil(spr.width  / 4)
    const h   = Math.ceil(spr.height / 4)
    const cnv = makeEmptyCanvas(w, h)
    const ctx = cnv.getContext("2d")
    ctx.drawImage(spr, 0,0,spr.width,spr.height, 0,0,w,h)
    return cnv
}

// ### file: postalcard-ops.js ###

"use strict"


// all coordinates are square based

var POSTALCARD = false

var postalCard = null

var postalCardLeft = 0
var postalCardTop = 0

var pictureNumberOfRows = 0
var pictureNumberOfCols = 0


var originalDrawPicture

///////////////////////////////////////////////////////////////////////////////

function startPostalCard() {
    const txt = "" +
    "0cpEntering postal card mode\n" +
    "2lpEscape .......................................... leave postal card mode\n" +
    "2lpARROWs ........................................................... move map\n" +
    "1lpSHIFT ARROWs ............................. move patch or marker\n" +
    "1lpCTRL ARROWs ............................................ resize marker\n" +
    "2lpM .................................................... marker on (patch off)\n" +
    "1lpP ..................................................... patch on (marker off)\n" +
    "2lpCTRL L .............................................................. load patch\n" +
    "1lpCTRL S ............................................................. save patch\n" +
    "1lpCTRL C .......................................... set patch from marker\n" +
    "1lpCTRL V ............................................... paste patch on map\n" +
    "1lpCTRL Z, Y ......................................................... undo, redo\n" +
    pagePressEnter.replace("*", "#")
    //
    displayStone(txt, ["enter"], startPostalCard2)
}

function startPostalCard2() {
    dismissDisplay()
    maybeMemorize()
    //
    POSTALCARD = true
    //
    postalCard = createPostalCard(episodeTable, numberOfCols, numberOfRows)
    postalCardLeft = 0
    postalCardTop  = 0
    //
    originalDrawPicture = drawPicture
    drawPicture = drawPostalCard
    //
    pictureNumberOfCols = Math.min(80, numberOfCols) // max is 1200 px
    pictureNumberOfRows = Math.min(42, numberOfRows) // max is  630 px (not 640)
    //
    picture.width  = pictureNumberOfCols * 15
    picture.height = pictureNumberOfRows * 15
    //
    resetMarker()
    resetPatch()
}

///////////////////////////////////////////////////////////////////////////////

function endPostalCardMode() {
    POSTALCARD = false
    picture.width = 780
    picture.height = 640 // 640 (not 630)
    drawPicture = originalDrawPicture
}

///////////////////////////////////////////////////////////////////////////////

function drawPostalCard() {
    pictureCtx.drawImage(postalCard, 15 * postalCardLeft, 15 * postalCardTop)
    //
    if (markerOn) { drawMarker() } else { drawPatch() }
}

///////////////////////////////////////////////////////////////////////////////

function movePostalCard(creature) {
    let left = 0
    let topo = 0
    //
    if (creature.direction.startsWith("north")) {
        topo = -1
    }
    else if (creature.direction.startsWith("south")) {
        topo = +1
    }
    //
    if (creature.direction.endsWith("west")) {
        left = -1
    }
    else if (creature.direction.endsWith("east")) {
        left = +1
    }
    //
    // routing
    if (shiftKeyPressed  &&  ! markerOn) { movePatch(left, topo); return }
    if (shiftKeyPressed) { moveMarker(left, topo); return }
    if (ctrlKeyPressed)  { resizeMarker(left, topo); return }
    //
    //
    postalCardLeft += left
    postalCardTop  += topo
    //
    const minLeft = Math.min(0, pictureNumberOfCols - numberOfCols)
    const maxLeft = 0
    //
    const minTop = Math.min(0, pictureNumberOfRows - numberOfRows)
    const maxTop = 0
    //
    if (postalCardLeft < minLeft) { postalCardLeft = minLeft }
    if (postalCardLeft > maxLeft) { postalCardLeft = maxLeft }
    //
    if (postalCardTop < minTop) { postalCardTop = minTop }
    if (postalCardTop > maxTop) { postalCardTop = maxTop }
}

// ### file: sanddesert.js ###

"use strict"


var sandDeserts = {
    // dese means desert (full extension)
    // sand means sand   (full extension)
    // left means sand at left
    // righ means sand at right
    // topo means sand at top
    // bott means sand at bottom
    //
    //    north south east west
    "a1": "sand-left-topo-sand",
    "a2": "sand-righ-sand-topo",
    "a3": "righ-sand-sand-bott",
    "a4": "left-sand-bott-sand",
    //
    "b1": "left-dese-dese-topo",
    "b2": "righ-dese-topo-dese",
    "b3": "dese-righ-bott-dese",
    "b4": "dese-left-dese-bott",
    //
    "c1": "sand-dese-topo-topo",
    "c2": "righ-righ-sand-dese",
    "c3": "dese-sand-bott-bott",
    "c4": "left-left-dese-sand",
    //
    "d1": "sand-dese-topo-topo",
    "d2": "righ-righ-sand-dese",
    "d3": "dese-sand-bott-bott",
    "d4": "left-left-dese-sand",
    //
    "f1": "sand-left-topo-sand",
    "f2": "sand-righ-sand-topo",
    "f3": "righ-sand-sand-bott",
    "f4": "left-sand-bott-sand",
    //
    "g1": "sand-left-topo-sand",
    "g2": "sand-righ-sand-topo",
    "g3": "righ-sand-sand-bott",
    "g4": "left-sand-bott-sand"
}

function autoSandDesert() {
    const list = makeSandDesertList()
    let index = list.indexOf(SPRITE) + 1
    const max = list.length - 1
    if (index > max) { index = 0 }
    SPRITE = list[index]
}

function makeSandDesertList() {
    //  border is the value that center must have to match neighbour //
    const northBorder = borderForSandDesertAt(avatar.row - 1, avatar.col, "south")
    const southBorder = borderForSandDesertAt(avatar.row + 1, avatar.col, "north")
    const eastBorder  = borderForSandDesertAt(avatar.row, avatar.col + 1, "west")
    const westBorder  = borderForSandDesertAt(avatar.row, avatar.col - 1, "east")
    //
    const result = [ ]
    const keys = Object.keys(sandDeserts)
    for (let n = 0; n < keys.length; n++) {
        const candidate = keys[n]
        const data = sandDeserts[candidate].split("-")
        //
        if (sandDesertBorderIncompatible(data[0], northBorder)) { continue }
        if (sandDesertBorderIncompatible(data[1], southBorder)) { continue }
        if (sandDesertBorderIncompatible(data[2], eastBorder))  { continue }
        if (sandDesertBorderIncompatible(data[3], westBorder))  { continue }
        //
        result.push("sanddesert-" + candidate)
    }
    if (result.length == 0) { result.push("sanddesert-a1") }
    return result
}

function borderForSandDesertAt(row, col, position) {
    const sqr = getSquare(row, col)
    if (sqr == null) { return "OTHER" }
    //
    const layer = sqr.layerA
    //
    if (layer == "sand") { return "SAND" }
    //
    if (layer.startsWith("desert-")) { return "DESERT" }
    //
    if (layer.startsWith("sanddesert-")) {
        const tail = layer.substr(11, 2)
        const dataAsString = sandDeserts[tail]
        const data = dataAsString.split("-")
        const index = (["north", "south", "east", "west"]).indexOf(position)
        return data[index]
    }
    //
    return "OTHER"
}

function sandDesertBorderIncompatible(centerBorder, neighbourBorder) {
    if (neighbourBorder == "SAND")   { return false }
    if (neighbourBorder == "DESERT") { return false }
    if (neighbourBorder == "OTHER")  { return false }
    if (centerBorder == neighbourBorder) { return false }
    return true
}

// ### file: sandgrass.js ###

"use strict"


var sandGrasses = {
    // gras means grass (full extension)
    // sand means sand  (full extension)
    // left means sand at left
    // righ means sand at right
    // topo means sand at top
    // bott means sand at bottom
    //
    //    north south east west
    "a1": "sand-left-topo-sand",
    "a2": "sand-righ-sand-topo",
    "a3": "righ-sand-sand-bott",
    "a4": "left-sand-bott-sand",
    //
    "b1": "left-gras-gras-topo",
    "b2": "righ-gras-topo-gras",
    "b3": "gras-righ-bott-gras",
    "b4": "gras-left-gras-bott",
    //
    "c1": "sand-gras-topo-topo",
    "c2": "righ-righ-sand-gras",
    "c3": "gras-sand-bott-bott",
    "c4": "left-left-gras-sand",
    //
    "d1": "sand-gras-topo-topo",
    "d2": "righ-righ-sand-gras",
    "d3": "gras-sand-bott-bott",
    "d4": "left-left-gras-sand",
    //
    "f1": "sand-left-topo-sand",
    "f2": "sand-righ-sand-topo",
    "f3": "righ-sand-sand-bott",
    "f4": "left-sand-bott-sand",
    //
    "g1": "sand-left-topo-sand",
    "g2": "sand-righ-sand-topo",
    "g3": "righ-sand-sand-bott",
    "g4": "left-sand-bott-sand"
}

function autoSandGrass() {
    const list = makeSandGrassList()
    let index = list.indexOf(SPRITE) + 1
    const max = list.length - 1
    if (index > max) { index = 0 }
    SPRITE = list[index]
}

function makeSandGrassList() {
    //  border is the value that center must have to match neighbour //
    const northBorder = borderForSandGrassAt(avatar.row - 1, avatar.col, "south")
    const southBorder = borderForSandGrassAt(avatar.row + 1, avatar.col, "north")
    const eastBorder  = borderForSandGrassAt(avatar.row, avatar.col + 1, "west")
    const westBorder  = borderForSandGrassAt(avatar.row, avatar.col - 1, "east")
    //
    const result = [ ]
    const keys = Object.keys(sandGrasses)
    for (let n = 0; n < keys.length; n++) {
        const candidate = keys[n]
        const data = sandGrasses[candidate].split("-")
        //
        if (sandGrassBorderIncompatible(data[0], northBorder)) { continue }
        if (sandGrassBorderIncompatible(data[1], southBorder)) { continue }
        if (sandGrassBorderIncompatible(data[2], eastBorder))  { continue }
        if (sandGrassBorderIncompatible(data[3], westBorder))  { continue }
        //
        result.push("sandgrass-" + candidate)
    }
    if (result.length == 0) { result.push("sandgrass-a1") }
    return result
}

function borderForSandGrassAt(row, col, position) {
    const sqr = getSquare(row, col)
    if (sqr == null) { return "OTHER" }
    //
    const layer = sqr.layerA
    //
    if (layer == "sand") { return "SAND" }
    //
    if (layer.startsWith("grass-")) { return "GRASS" }
    //
    if (layer.startsWith("sandgrass-")) {
        const tail = layer.substr(10, 2)
        const dataAsString = sandGrasses[tail]
        const data = dataAsString.split("-")
        const index = (["north", "south", "east", "west"]).indexOf(position)
        return data[index]
    }
    //
    return "OTHER"
}

function sandGrassBorderIncompatible(centerBorder, neighbourBorder) {
    if (neighbourBorder == "SAND")  { return false }
    if (neighbourBorder == "GRASS") { return false }
    if (neighbourBorder == "OTHER") { return false }
    if (centerBorder == neighbourBorder) { return false }
    return true
}

// ### file: selector.js ###

"use strict"

var HOTKEY = "k" // matches the key pressed in keyboard

var FAMILY = "block"

var SPRITE = "block-a"

var hotkeys = {
    // "slab", "lava", "pool"
    "a": [ "ballast", "gravel" ],
    "b": [ "beach", "ocean" ],
 // "c": [ "basalt" ], // cave
    "d": [ "sandgrass", "sanddesert" ],
    "e": [ "stone" ],
    "f": [ "flower" ],
    "i": [ "fields" ],
    "g": [ "grass" ],
    "k": [ "block" ],
    "o": [ "floor" ],
    "p": [ "swamp" ],
    "s": [ "sand", "desert" ],
    "t": [ "tree" ],
    "w": [ "weed" ],
    "y": [ "others" ]
}

function changeFamily(key) {
    const list = hotkeys[key]
    if (list == undefined) { return }
    //
    if (key == HOTKEY) {
        if (list.length == 1) { return }
        list.push(list.shift()) // rotation
    }
    else {
        HOTKEY = key
    }
    //
    FAMILY = list[0]
    //
    SPRITE = families[FAMILY][0]
}

function nextSpriteInFamily() {  // selected goes to first of list
    const list = families[FAMILY]
    if (list[0] != lastOfFamily[FAMILY]) { list.push(list.shift()) }
    SPRITE = list[0]
    applyLayer()
}

function previousSpriteInFamily() {
    const list = families[FAMILY]
    if (list[0] != firstOfFamily[FAMILY]) { list.unshift(list.pop()) }
    SPRITE = list[0]
    applyLayer()
}