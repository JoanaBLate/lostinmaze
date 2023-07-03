"use strict"

var portuguese = {
    // creatures
    "Explorer": "Explorer",
    "Stranger": "Estranho",
    "Orion": "Orion",
    "Redzag": "Redzag",
    "Wood Golem": "Wood Golem",
    "Stone Golem": "Stone Golem",
    "Living Fog": "Living Fog",
    "Gangrene": "Gangrene",
    "Greedy Soul": "Greedy Soul",
    // general
    "a bright gem" : "uma gema brilhante",
    "a copper key" : "uma chave de cobre",
    "a sword" : "uma espada",
    "a wooden key" : "uma chave de madeira",
    "an iron key" : "uma chave de ferro",
    "antidote potion" : "poção de antídoto",
    "antidote potions" : "poções de antídoto",
    "Chest is empty." : "Arca está vazia.",
    "Fail..." : "Eita...",
    "Feeling heavy." : "Me sinto pesado.",
    "Feeling slow." : "Me sinto lento.",
    "Grabbing antidote potion.": "Catando poção de antídoto.",
    "Grabbing health potion." : "Catando poção de saúde.",
    "Grabbing mana potion." : "Catando poção de mana.",
    "Grabbing spear." : "Catando lança.",
    "Grabbing speed oil." : "Catando óleo de velocidade.",
    "health potion" : "poção de saúde",
    "health potions" : "poções de saúde",
    "mana potion" : "poção de mana",
    "mana potions" : "poções de mana",
    "Mana shield full." : "Escudo de mana cheio.",
    "Missing copper key." : "Falta chave de cobre.",
    "Missing iron key." : "Falta chave de ferro.",
    "Miss." : "Errei.",
    "Missing wooden key." : "Falta chave de madeira.",
    "Moving now." : "Estou andando.",
    "New target." : "Novo alvo.",
    "No potion." : "Sem poção.",
    "No oil." : "Sem óleo.",
    "No need." : "Não preciso.",
    "No pick up.": "Nada a catar.",
    "No purple bubble." : "Sem bolha roxa.",
    "No space." : "Sem espaço.",
    "No spear." : "Sem lança.",
    "No target." : "Sem alvo.",
    "No torch." : "Sem tocha.",
    "No weapon." : "Sem arma.",
    "Normal speed." : "Velocidade normal.",
    "Not hurt!" : "Não ferido!",
    "Not poisoned!" : "Não envenenado!",
    "Not working now." : "Tentar mais tarde.",
    "Ouch." : "Ai.",
    "purple bubble" : "bolha roxa",
    "purple bubbles" : "bolhas roxas",
    "pYou have found " : "pVocê achou ",
    "pWooden key has broken." : "pA chave de madeira quebrou.",
    "spear": "lança",
    "spears": "lanças",
    "Still cursed." : "Amaldiçoado ainda.",
    "Still fast!" : "Ainda rápido!",
    "Stop!" : "Pare!",
    "Strong!" : "Forte!",
    "speed oil" : "óleo de velocidade",
    "speed oils" : "óleos de velocidade",
    "Thank you!" : "Obrigado!",
    "Too soon!" : "Cedo demais!",
    "torch": "tocha",
    "torches": "tochas",
    "Torch is on." : "Tocha acesa.",
    "Using copper key." : "Usando chave de cobre.",
    "Using iron key." : "Usando chave de ferro.",
    "Using wooden key." : "Usando chave de madeira.",
    "Well is empty." : "Poço está vazio.",
    "Zooom!" : "Zuuum!",
    // restart
    "So... you have no idea!" : "Não sabe o que fazer, não é?",
    "It is not that easy!" : "Não é tão fácil assim!",
    "Oh, no! Again?" : "Oh, não! Tudo de novo?",
    "You don't give up?" : "Você não desiste?",
    "Just one more time, right?" : "Só mais esta vez, certo?",
    "Don't let me down! Hehehe..." : "Não me decepcione! Hehehe...",
    "I think you should call your mom." : "Acho que você deveria chamar sua mãe.",
    // episode
    "Presto!": "Presto!"
}

///////////////////////////////////////////////////////////////////////////////

function translate(txt) { // overrides
    const transl = portuguese[txt]
    if (transl != undefined) { return transl }
    //
    if (txt.startsWith("Ahhh.")) { return txt } // also works for succinctDouble
    if (txt.startsWith("Gulp.")) { return txt } // also works for succinctDouble
    if (txt.startsWith("Ssssssss.")) { return txt } // also works for succinctDouble
    //
    if (DEVELOPMENT) { alert("MISSING TRANSLATION: " + txt) }
    return txt
}

///////////////////////////////////////////////////////////////////////////////

function translateMainPages() {

    pageWait =
        "*rp<espere>"

    pagePressEnter =
        "*rp(pressione Enter para continuar)"

    pagePressChoice =
        "*rp(pressione a letra de sua escolha)"

    pageSkipOrRun =
        "7cp@title@\n" +
        "7rp(pressione  R  para rodar a introdução)\n" +
        "1rp(pressione  Enter  para saltar a introdução)"

    pageQuit =
        "8lmO Mestre do Labirinto diz:\n" +
        "2lmVocê está com medo do que?\n" +
        "4rp(pressione Q para desistir)\n" +
        "1rp(pressione Enter para cancelar)"

    pageRestart =
        "8lmO Mestre do Labirinto diz:\n" +
        "2lm@sarcasm@\n" +
        "4rp(pressione R para reiniciar)\n" +
        "1rp(pressione Enter para cancelar)"
        
    pageMission =
        "0cp- MISSÃO -\n" +
        "0lp\n" +
        "0lp\n" +
        "2lp\n" +
        "2lp\n" +
        "2lp\n" +
        "2lp Explore o labirinto e encontre uma saída.\n" +
        "*rp(pressione Enter para continuar)"
        
    /*
    var pageReportTime =
        "7cp@title@\n" +
        "4cpTime spent on episode:   @time@\n" +
        "4rp<press Enter to continue>"
    */

    pageSuccess =
        "7lmO Mestre do Labirinto diz:\n" +
        "2lmParabéns, ratinho!\n"

    pageFailure =
        "7lmO Mestre do Labirinto diz:\n" +
        "2lm@fail@\n" +
        "2lmO labirinto vai ser reinicializado.\n" +
        "2lmVocê vai ser reinicializado.\n"

    pageReplacementFailureAvatar =
        "Você falhou em escapar do labirinto."

    pageReplacementFailureOrion =
        "Orion falhou em escapar do labirinto."

    pageReplacementFailureMission =
        "Você falhou em cumprir a missão."

    pageMazeChange =
        "9cpO labirinto está mudando.\n"

    pageBecomeEthereal =
        "9cpAlgo está ficando etéreo.\n"

    pageBecomeSolid =
        "9cpAlgo está ficando sólido.\n"

    pageMenuHint =
        "9cpPressionando  Enter  abre o menu  (e a ajuda).\n"

    pageMenu =
        "0cp- MENU -\n" +
        "4lpPressione  H  para ajuda.\n" +
        "2lpPression   M  para mission.\n" +
        "2lpPressione  Q  para desistir.\n" +
        "2lpPressione  R  para reiniciar.\n" +
     // "2lpPressione  U  para ligar-desligar a música.\n" +
        "*rp(pressione Enter para continuar)"

    pageHelp1 =
        "0cp- AJUDA -\n" +
        "2laGirar\n" +
        "1lpPressione  Shift  e  seta(s)  para girar sem se mover.\n" +
        "2laPasso Diagonal\n" +
        "1lpPressione as duas setas correspondentes.\n" +
        "2laPasso Diagonal (com segurança)\n" +
        "1lp1) pressione e segure  Shift\n" +
        "1lp2) pressione e segure as duas setas correspondentes\n" +
        "1lp3) solte apenas  Shift\n" +
        "2loPassos diagonais só podem ocorrer quando forem\n" +
        "1lorealmente necessários.\n" +
        "#rp<pressione Enter para continuar>"

    pageHelp2 =
        "0cp- AJUDA -\n" +
        "2laAtaque Com Espada\n" +
        "1lpPressione e *solte*   Z  para atacar com espada.\n" +
        "2lpIsto ativa o modo de mira:  você pode girar para qualquer\n" +
        "1lpdireção, incluindo diagonais, sem pressionar Shift.\n" +
        "2lpQuando o modo de mira termina o ataque acontece.\n" +
        "2loAlvos em movimento sofrem mais dano.\n" +
        "2laArremessos\n" +
        "1lpFuncionam como ataque com espada, mas pressionando  X .\n" +
        "#rp<pressione Enter para continuar>"

    pageHelp3 =
        "0cp- AJUDA -\n" +
        "2laTocha\n" +
        "1lpPressione  T  para acender uma tocha.\n" +
        "2lpPressione  T  novamente para ampliar a luz dela\n" +
        "1lp(diminuindo sua durabilidade).\n" +
        "2lpPressione  T  mais uma vez para apagar a tocha.\n" +
        "2lpUma tocha dura 120 segundos. Ou 60 segundos com a luz\n" +
        "1lpampliada.\n" +
        "#rp<pressione Enter para continuar>"

    pageHelp4 =
        "0cp- AJUDA -\n" +
        "2laCatando Objetos\n" +
        "1lpPressione  C  para catar um objeto sob seus pés.\n" +
        "2laPosição Do Nome\n" +
        "1lpPressione  N  para alterar a posição do nome (ou raça) das\n" +
        "1lpcriaturas.\n" +
        "2laEpisódios Tutoriais\n" +
        "1lpDia De Treinamento  e  Noite De Treinamento são bons\n" +
        "1lppara aprender e para relembrar o que se aprendeu.\n" +
        "#rp<pressione Enter para continuar>"
}

