import { getCanvas, on } from "kontra";
import { GameState, GameManager } from "../../managers/game-manager";
import { EVENT } from "../../constants/event";
import { CustomButton, OverlayDialog } from "./shared-ui";
import { Templar } from "../sprites/templar";
import { LOCAL_STORAGE_KEY } from "../../constants/localstorage";

export class GameOverDialog extends OverlayDialog {
  private rBtn: CustomButton; // restart button
  private isShown: boolean = false;

  constructor() {
    const { width: w, height: h } = getCanvas();
    super(300, 180);
    this.tT.text = "Game Over";
    this.dT.text = "";
    this.rBtn = new CustomButton(w / 2, h / 2 + 50, "Restart");

    this.addChild([
      this.rBtn,
      new Templar({ x: w / 2 - 32, y: h / 2 - 214, condition: "d" }),
    ]);

    on(EVENT.GAME_OVER, this.show.bind(this));
  }

  private show() {
    if (this.isShown) return;
    this.isShown = true;
    const gm = GameManager.gI();
    let bestScore = window.highscores.getScore();
    const content = `Survived for ${gm.move} moves as a ${gm.cls}`;
    this.dT.text = `${content}!\nBest Score: ${bestScore}`;
    this.rBtn.bindClick(() => location.reload());
    localStorage.setItem(LOCAL_STORAGE_KEY.PLAYED, "t");
  }

  public render() {
    const gm = GameManager.gI();
    if (gm.state !== GameState.GAME_OVER) return;
    super.render();
  }
}
