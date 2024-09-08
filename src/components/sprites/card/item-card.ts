import { BaseCard } from "./base-card";
import { CardType } from "./type";
import {
  AttackDirection,
  OptionalCharacterProps,
} from "../../../types/character";
import { ClockIcon } from "../icons/clock-icon";
import { Text } from "kontra";
import { COMMON_TEXT_CONFIG, FONT } from "../../../constants/text";
import { WeightIcon } from "../icons/weight-icon";
import { tween } from "../../../utils/tween-utils";
import { SwordIcon } from "../icons/sword-icon";
import { COLOR } from "../../../constants/color";
import { ShieldIcon } from "../icons/shield-icon";
import { PotionIcon } from "../icons/potion-icon";
import { getItemPropsDescText } from "../../../utils/desc-utils";
import { GameManager } from "../../../managers/game-manager";
import { randomPick } from "../../../utils/random-utils";
import { BASE_WEIGHT_MAP } from "../../../constants/weight";
import { WarningIcon } from "../icons/warning-icon";
import { checkIfBuff } from "../../../utils/buff-utils";

export type ItemCardProps = {
  type: CardType;
  x: number;
  y: number;
  // props
  duration: number;
  weight: number;
};

const MAX_ITEM_LEVEL = 4;
const MAX_ITEM_COLOR_MAP = {
  [CardType.WEAPON]: COLOR.DARK_6,
  [CardType.SHIELD]: COLOR.BROWN_8,
  [CardType.POTION]: COLOR.GREEN_6,
};

export class ItemCard extends BaseCard {
  protected descriptionText: Text;
  protected durationText: Text;
  protected weightText: Text;
  public buff: OptionalCharacterProps;
  public duration: number;
  public weight: number;
  public level: number = 1;
  private warningIcon: WarningIcon | null = null;

  constructor({ type, x, y, duration, weight }: ItemCardProps) {
    super({ type, x, y });
    this.duration = duration;
    this.weight = weight;

    this.buff = this.pickBuff();
    this.descriptionText = Text({
      x: 0,
      y: 18,
      text: getItemPropsDescText(this.buff),
      ...COMMON_TEXT_CONFIG,
      textAlign: "center",
    });
    this.durationText = Text({
      text: `${duration}`,
      x: 42,
      y: 40,
      ...COMMON_TEXT_CONFIG,
    });
    this.weightText = Text({
      text: `${weight}`,
      x: -24,
      y: 40,
      ...COMMON_TEXT_CONFIG,
    });
    this.main.addChild([
      this.descriptionText,
      new ClockIcon(22, 32),
      this.durationText,
      new WeightIcon(-46, 32),
      this.weightText,
    ]);
    this.resetProps();
  }

  protected getMainIcon() {
    switch (this.type) {
      case CardType.WEAPON:
        return new SwordIcon(-11, -32, 1);
      case CardType.SHIELD:
        return new ShieldIcon(-10, -31, 1, COLOR.WHITE_6);
      case CardType.POTION:
        return new PotionIcon(-9, -36);
      default:
        throw new Error();
    }
  }

  public async equip() {
    this.duration = Math.max(this.duration, 2);
    await Promise.all([
      tween(this.main, { targetY: -24 }, 300, 50),
      this.setChildrenOpacity(0, 300),
    ]);
    this.main.y = 0; // reset
  }

  protected resetProps(): void {
    this.durationText.text = `${this.duration}`;
    this.weightText.text = `${this.weight}`;
    if (this.type === CardType.POTION) {
      if (!this.warningIcon) {
        this.warningIcon = new WarningIcon(6, -14);
        this.addChild(this.warningIcon);
      }
      const isBuff = checkIfBuff(this.buff);
      this.warningIcon.opacity = isBuff ? 0 : 1;
    }
    if (this.level === MAX_ITEM_LEVEL) {
      // @ts-ignore
      this.circle.color = MAX_ITEM_COLOR_MAP[this.type];
    }
  }

  public updateDuration(value: number): boolean {
    this.duration += value;
    if (this.duration <= 0) return false;
    this.durationText.text = `${this.duration}`;
    return true;
  }

  public upgrade(card: ItemCard) {
    this.level += card.level;
    this.level = Math.min(this.level, MAX_ITEM_LEVEL);
    this.duration += card.duration;
    this.duration = Math.min(this.duration, 10);
    this.weight = getItemWeight(this.type, this.level);

    this.buff = this.pickBuff();
    const description = getItemPropsDescText(this.buff);
    this.descriptionText.text = description;
    if (description.split("\n").length > 2) {
      this.descriptionText.font = `12px ${FONT}`;
      this.descriptionText.y = 14;
    }
    this.resetProps();
  }

  public pickBuff() {
    const { isKnight, isWizard, isDefender, level } = GameManager.getInstance();
    const factor = level + 1;
    switch (this.type) {
      case CardType.WEAPON:
        return getWeaponLevelBuff(this.level, factor, isKnight);
      case CardType.SHIELD:
        return getShieldLevelBuff(this.level, factor, isDefender);
      case CardType.POTION:
        return getPotionLevelBuff(this.level, factor, isWizard);
      default:
        throw new Error();
    }
  }
}

const getItemWeight = (type: CardType, level: number) => {
  if (type === CardType.POTION) return 0;

  const { cls } = GameManager.getInstance();
  const baseWeight =
    BASE_WEIGHT_MAP[cls!][type as CardType.WEAPON | CardType.SHIELD];
  return baseWeight + level;
};

const getWeaponLevelBuff = (
  level: number,
  factor: number,
  isKnight: boolean
): OptionalCharacterProps => {
  const attack = isKnight ? factor + 2 * level : 1;
  const random = Math.random();
  if (level === 1) {
    return { attack };
  } else if (level === 2) {
    return random < 0.6
      ? { attack, critical: 0.05 }
      : { attack, hitRate: 0.05 };
  } else if (level === 3) {
    return {
      attack,
      attackDirection: AttackDirection.AROUND,
      hitBack: 1 * factor,
    };
  } else {
    return {
      attack,
      attackDirection: AttackDirection.CROSS,
      hitBack: 3 * factor,
    };
  }
};
const getShieldLevelBuff = (
  level: number,
  factor: number,
  isDefender: boolean
): OptionalCharacterProps => {
  return {
    shield: Math.floor(factor / 2 + (isDefender ? 3.7 : 2) * level),
  };
};
const getPotionLevelBuff = (
  level: number,
  factor: number,
  isWizard: boolean
): OptionalCharacterProps => {
  const random = Math.random();
  const baseVal = Math.ceil(level / 3);
  const baseRate = 0.025 + 0.025 * level;
  const decreaseFactor = isWizard ? 0.05 : 0.1;
  const buffs: OptionalCharacterProps[] = [
    {
      health:
        factor * (random > 0.65 - decreaseFactor * level ? baseVal : -baseVal),
    },
    {
      critical:
        factor * random > 0.95 - decreaseFactor * level ? baseRate : -baseRate,
    },
    {
      hitRate:
        factor * random > 0.95 - decreaseFactor * level ? baseRate : -baseRate,
    },
  ];

  return randomPick(buffs);
};
