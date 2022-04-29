let { GWE } = require('gwe');

class BattleAction {
  constructor(battle) {
    this.battle = battle;
  }

  async exec() {}
}

class LetBattleAction extends BattleAction {
  constructor(battle, fromChar) {
    super(battle);
    this.fromChar = fromChar;
  }

  async exec() {
    this.fromChar.setReady(false);
    let characterQueue = this.battle.getCharacterQueue();
    characterQueue.splice(characterQueue.indexOf(this.fromChar), 1);
  }
}

class ApplyEffectBattleAction extends BattleAction {
  constructor(battle, effect, fromChar, toChar) {
    super(battle);
    this.effect = effect;
    this.fromChar = fromChar;
    this.toChar = toChar;
  }

  async exec() {
    await this.effect.apply(this.fromChar, this.toChar);
    this.fromChar.getAttributes().add('MP', - this.effect.getCost());
    this.fromChar.setReady(false);

    let characterQueue = this.battle.getCharacterQueue();
    characterQueue.splice(characterQueue.indexOf(this.fromChar), 1);
  }
}

class ApplyItemBattleAction extends BattleAction {
  constructor(battle, item, fromChar, toChar) {
    super(battle);
    this.item = item;
    this.fromChar = fromChar;
    this.toChar = toChar;
  }

  async exec() {
    let player = this.battle.getPlayer();
    let inventory = player.getInventory();
    let effect = this.item.getEffect();

    await effect.apply(this.fromChar, this.toChar);
    inventory.removeItemById(this.item.getId());
    this.fromChar.setReady(false);

    let characterQueue = this.battle.getCharacterQueue();
    characterQueue.splice(characterQueue.indexOf(this.fromChar), 1);
  }
}

class NewTurnBattleAction extends BattleAction {
  constructor(battle) {
    super(battle);
  }

  async exec() {
    let charArray = [...this.battle.getHeroes(), ...this.battle.getEnemies()];

    charArray = charArray.sort((a, b) => b.getAttribute('AGILITY') - a.getAttribute('AGILITY'));
    charArray = charArray.filter(char => char.getAttribute('HP') > 0);

    for (let char of charArray) {
      for (let seal of char.getActiveSeals()) {
        seal.incTurnCount();
        if (seal.onTurnEffect) {
          await seal.onTurnEffect.apply(seal.getFromChar(), char);
        }
        if (seal.getTurnCount() == seal.getNumTurns()) {
          char.removeSeal(seal.getId());
        }
      }

      char.setReady(false);
    }

    this.battle.incNumTurns();
    this.battle.setCharacterQueue(charArray);
    GWE.eventManager.emit(this.battle, 'E_NEW_TURN');
  }
}

module.exports.LetBattleAction = LetBattleAction;
module.exports.ApplyEffectBattleAction = ApplyEffectBattleAction;
module.exports.ApplyItemBattleAction = ApplyItemBattleAction;
module.exports.NewTurnBattleAction = NewTurnBattleAction;