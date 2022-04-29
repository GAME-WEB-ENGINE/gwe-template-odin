let { GWE } = require('gwe');
let { Attributes } = require('./attributes');
let { Effect } = require('./effect');
let { ELEMENT } = require('./enums');

class CharacterAbstract {
  constructor(data) {
    this.id = '';
    this.name = '';
    this.description = '';
    this.pictureFile = '';
    this.spriteFile = '';
    this.attributes = null;
    this.attackEffects = [];
    this.magicEffects = [];
    this.activeSeals = [];
    this.ready = false;

    if (!data.hasOwnProperty('Id')) {
      return;
    }
    if (!data.hasOwnProperty('Name')) {
      return;
    }
    if (!data.hasOwnProperty('Description')) {
      return;
    }
    if (!data.hasOwnProperty('PictureFile')) {
      return;
    }
    if (!data.hasOwnProperty('SpriteFile')) {
      return;
    }
    if (!data.hasOwnProperty('Attributes')) {
      return;
    }
    if (!data['Attributes'].hasOwnProperty('LV')) {
      return;
    }
    if (!data['Attributes'].hasOwnProperty('LV_MAX')) {
      return;
    }
    if (!data['Attributes'].hasOwnProperty('XP')) {
      return;
    }
    if (!data['Attributes'].hasOwnProperty('XP_MAX')) {
      return;
    }
    if (!data['Attributes'].hasOwnProperty('HP')) {
      return;
    }
    if (!data['Attributes'].hasOwnProperty('HP_MAX')) {
      return;
    }
    if (!data['Attributes'].hasOwnProperty('MP')) {
      return;
    }
    if (!data['Attributes'].hasOwnProperty('MP_MAX')) {
      return;
    }
    if (!data['Attributes'].hasOwnProperty('ATK')) {
      return;
    }
    if (!data['Attributes'].hasOwnProperty('DEF')) {
      return;
    }
    if (!data['Attributes'].hasOwnProperty('MAGIC_ATK')) {
      return;
    }
    if (!data['Attributes'].hasOwnProperty('MAGIC_DEF')) {
      return;
    }
    if (!data['Attributes'].hasOwnProperty('AGILITY')) {
      return;
    }
    if (!data['Attributes'].hasOwnProperty('ELEMENT')) {
      return;
    }
    if (!(
      data['Attributes']['ELEMENT'] == ELEMENT.RED ||
      data['Attributes']['ELEMENT'] == ELEMENT.BLUE ||
      data['Attributes']['ELEMENT'] == ELEMENT.BLACK ||
      data['Attributes']['ELEMENT'] == ELEMENT.WHITE)) {
      return;
    }
    if (!data.hasOwnProperty('AttackEffectIds')) {
      return;
    }
    if (!data.hasOwnProperty('MagicEffectIds')) {
      return;
    }

    this.id = data['Id'];
    this.name = data['Name'];
    this.description = data['Description'];
    this.pictureFile = data['PictureFile'];
    this.spriteFile = data['SpriteFile'];
    this.attributes = new Attributes(data['Attributes']);

    for (let effectId of data['AttackEffectIds']) {
      this.attackEffects.push(Effect.createFromFile('assets/models/' + effectId + '/data.json'));
    }

    for (let effectId of data['MagicEffectIds']) {
      this.magicEffects.push(Effect.createFromFile('assets/models/' + effectId + '/data.json'));
    }
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getDescription() {
    return this.description;
  }

  getPictureFile() {
    return this.pictureFile;
  }

  getSpriteFile() {
    return this.spriteFile;
  }

  getAttributes() {
    return this.attributes;
  }

  getAttribute(key) {
    return this.attributes.get(key);
  }

  getAttackEffects() {
    return this.attackEffects;
  }

  getMagicEffects() {
    return this.magicEffects;
  }

  getActiveSeals() {
    return this.activeSeals;
  }

  setReady(ready) {
    this.ready = ready;
  }

  isReady() {
    return this.ready;
  }

  async addSeal(seal) {
    if (!seal.stackable && this.activeSeals.find(s => s.id == seal.id)) {
      return GWE.eventManager.emit(this, 'E_SEAL_ADD_FAILED');
    }

    this.attributes.addModifiers(seal.modifiers);
    this.activeSeals.push(seal);
    await GWE.eventManager.emit(this, 'E_SEAL_ADDED');
  }

  async removeSeal(sealId) {
    let seal = this.activeSeals.find(s => s.id == sealId);
    if (!seal) {
      return GWE.eventManager.emit(this, 'E_SEAL_REMOVE_FAILED');
    }
  
    this.attributes.removeModifiers(seal.modifiers);
    this.activeSeals.remove(seal);
    await GWE.eventManager.emit(this, 'E_SEAL_REMOVED');
  }

  async increaseHP(amount, element = null) {
    let elementalFactor = GET_ELEMENTAL_OPPOSITION_FACTOR(element, this.attributes.get('ELEMENT'));
    amount = element ? amount * elementalFactor : amount;
    this.attributes.add('HP', + amount);
    await GWE.eventManager.emit(this, 'E_INCREASE_HP', { amount: amount });
  }

  async decreaseHP(amount, element = null) {
    let elementalFactor = GET_ELEMENTAL_OPPOSITION_FACTOR(element, this.attributes.get('ELEMENT'));
    amount = element ? amount * elementalFactor : amount;
    this.attributes.add('HP', - amount);
    await GWE.eventManager.emit(this, 'E_DECREASE_HP', { amount: amount });
  }

  async increaseMP(amount) {
    this.attributes.add('MP', + amount);
    await GWE.eventManager.emit(this, 'E_INCREASE_MP', { amount: amount });
  }

  async decreaseMP(amount) {
    this.attributes.add('MP', - amount);
    await GWE.eventManager.emit(this, 'E_DECREASE_MP', { amount: amount });
  }
}

// -------------------------------------------------------------------------------------------
// HELPFUL
// -------------------------------------------------------------------------------------------

function GET_ELEMENTAL_OPPOSITION_FACTOR(attackElement, defendElement) {
  if (
    (attackElement == ELEMENT.RED && defendElement == ELEMENT.BLUE) ||
    (attackElement == ELEMENT.BLUE && defendElement == ELEMENT.RED) ||
    (attackElement == ELEMENT.BLACK && defendElement == ELEMENT.WHITE) ||
    (attackElement == ELEMENT.WHITE && defendElement == ELEMENT.BLACK)) {
    return 2;
  }

  return 1;
}

module.exports.CharacterAbstract = CharacterAbstract;