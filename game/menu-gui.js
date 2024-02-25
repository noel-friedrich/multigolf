class MenuGui {

    static menuContainer = document.getElementById("menu-container")
    static openMenuButton = document.getElementById("open-menu")

    static currSection = "layouting"

    static showSection(name) {
        const sections = this.menuContainer.querySelectorAll("div[data-section]")
        for (let section of sections) {
            if (section.dataset.section == name) {
                section.style.display = "block"
            } else {
                section.style.display = "none"
            }
        }
    }

    static update() {
        if (gameState.phase == gamePhase.BUILDING) {
            this.currSection = "layouting"
        } else if (gameState.phase == gamePhase.PLACING_START) {
            this.currSection = "place-start"
        } else if (gameState.phase == gamePhase.PLACING_HOLE) {
            this.currSection = "place-hole"
        } else if (gameState.phase == gamePhase.PLAYING) {
            this.hideFinal()
        }

        this.showSection(this.currSection)
    }

    static show() {
        this.menuContainer.style.display = "block"
        this.openMenuButton.style.display = "none"
        this.showSection(this.currSection)
    }

    static hide() {
        this.menuContainer.style.display = "none"
        this.openMenuButton.style.display = "block"
    }

    static hideFinal() {
        this.menuContainer.style.display = "none"
        this.openMenuButton.style.display = "none"
    }

    static finishLayouting() {
        session.sendUpdate(gameState, new Update(updateType.PHASE, Date.now(),
            gameState.deviceIndex, {phase: gamePhase.PLACING_START}))
    }

    static finishStart() {
        session.sendUpdate(gameState, new Update(updateType.PHASE, Date.now(),
            gameState.deviceIndex, {phase: gamePhase.PLACING_HOLE}))
    }

    static finishHole() {
        session.sendUpdate(gameState, new Update(updateType.PHASE, Date.now(),
            gameState.deviceIndex, {phase: gamePhase.PLAYING}))
        this.hideFinal()
    }
    
}