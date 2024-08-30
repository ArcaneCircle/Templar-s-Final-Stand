import { getCanvas, Sprite, SpriteClass, Text } from "kontra";
import { COLOR } from "../../constants/color";
import { FONT } from "../../constants/text";

/**
 * @deprecated
 */
export class OverlayDialog extends SpriteClass {
  protected titleText: Text;
  protected descText: Text;

  constructor(width: number, height: number) {
    const { width: w, height: h } = getCanvas();
    super({
      width: w,
      height: h,
      opacity: 0.8,
      color: COLOR.DARK_6,
    });
    const wrapper = Sprite({
      x: w / 2,
      y: h / 2,
      width,
      height,
      anchor: { x: 0.5, y: 0.5 },
      color: COLOR.YELLOW_6,
    });
    this.titleText = Text({
      text: "",
      x: w / 2,
      y: h / 2 - 52,
      anchor: { x: 0.5, y: 0.5 },
      color: COLOR.BROWN_7,
      font: `24px ${FONT}`,
    });
    this.descText = Text({
      text: "",
      x: w / 2,
      y: h / 2,
      anchor: { x: 0.5, y: 0.5 },
      color: COLOR.BROWN_7,
      font: `16px ${FONT}`,
      textAlign: "center",
    });

    this.addChild([wrapper, this.titleText, this.descText]);
  }
}

export class CustomButton extends SpriteClass {
  private text: Text;

  constructor(x: number, y: number, text: string) {
    super({
      x,
      y,
      width: 96,
      height: 28,
      color: COLOR.BROWN_7,
      anchor: { x: 0.5, y: 0.5 },
    });
    this.text = Text({
      text,
      anchor: { x: 0.5, y: 0.5 },
      color: COLOR.WHITE_6,
      font: `16px ${FONT}`,
    });
    this.addChild(this.text);
  }

  public bindClick(callback: () => void) {
    const canvas = getCanvas();
    canvas.addEventListener("pointerdown", (event) => {
      const { offsetLeft, offsetTop } = event.target as HTMLCanvasElement;
      const { world } = this;
      const minX = world.x - world.width / 2;
      const maxX = world.x + world.width / 2;
      const minY = world.y - world.height / 2;
      const maxY = world.y + world.height / 2;

      const { width: w, height: h } = canvas;
      const scale = Math.min(innerWidth / w, innerHeight / h, devicePixelRatio);
      const x = (event.x - offsetLeft) / scale;
      const y = (event.y - offsetTop) / scale;
      if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
        callback();
      }
    });
  }
}