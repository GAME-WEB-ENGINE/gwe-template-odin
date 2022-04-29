let fs = require('fs');
let { GWE } = require('gwe');
let { EFFECT_TARGET_CONDITION_MAPPING } = require('./mappings/effect_target_condition_mapping');
let { EFFECT_MECHANIC_MAPPING } = require('./mappings/effect_mechanic_mapping');
let { ITEM_AVAILABILITY_TYPE } = require('./enums');

class Effect {
  constructor(data) {
    this.id = '';
    this.name = '';
    this.description = '';
    this.cost = 0;
    this.spriteAnimationName = '';
    this.availabilityType = '';
    this.mechanicId = '';
    this.mechanicOpts = {};
    this.targetConditionId = '';
    this.targetConditionOpts = {};

    if (!data.hasOwnProperty('Id')) {
      return;
    }
    if (!data.hasOwnProperty('Name')) {
      return;
    }
    if (!data.hasOwnProperty('Description')) {
      return;
    }
    if (!data.hasOwnProperty('Cost')) {
      return;
    }
    if (!data.hasOwnProperty('SpriteAnimationName')) {
      return;
    }
    if (!data.hasOwnProperty('AvailabilityType')) {
      return;
    }
    if (!(
      data['AvailabilityType'] == ITEM_AVAILABILITY_TYPE.ALL ||
      data['AvailabilityType'] == ITEM_AVAILABILITY_TYPE.MENU ||
      data['AvailabilityType'] == ITEM_AVAILABILITY_TYPE.BATTLE)) {
      return;
    }
    if (!data.hasOwnProperty('MechanicId')) {
      return;
    }
    if (!data.hasOwnProperty('MechanicOpts')) {
      return;
    }
    if (!data.hasOwnProperty('TargetConditionId')) {
      return;
    }
    if (!data.hasOwnProperty('TargetConditionOpts')) {
      return;
    }

    this.id = data['Id'];
    this.name = data['Name'];
    this.description = data['Description'];
    this.cost = data['Cost'];
    this.spriteAnimationName = data['SpriteAnimationName'];
    this.availabilityType = data['AvailabilityType'];
    this.mechanicId = data['MechanicId'];
    this.mechanicOpts = data['MechanicOpts'];
    this.targetConditionId = data['TargetConditionId'];
    this.targetConditionOpts = data['TargetConditionOpts'];
  }

  static createFromFile(path) {
    let data = JSON.parse(fs.readFileSync(path));
    return new Effect(data);
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

  getCost() {
    return this.cost;
  }

  getSpriteAnimationName() {
    return this.spriteAnimationName;
  }

  getAvailabilityType() {
    return this.availabilityType;
  }

  getMechanicId() {
    return this.mechanicId;
  }

  getMechanicOpts() {
    return this.mechanicOpts;
  }

  getTargetConditionId() {
    return this.targetConditionId;
  }

  getTargetConditionOpts() {
    return this.targetConditionOpts;
  }

  isMenuAvailable() {
    return this.availabilityType == ITEM_AVAILABILITY_TYPE.ALL || this.availabilityType == ITEM_AVAILABILITY_TYPE.MENU;
  }

  isBattleAvailable() {
    return this.availabilityType == ITEM_AVAILABILITY_TYPE.ALL || this.availabilityType == ITEM_AVAILABILITY_TYPE.BATTLE;
  }

  isUsable(fromChar) {
    return this.cost <= fromChar.getAttribute('MP');
  }

  isTargetConditionCheck(fromChar, toChar) {
    let targetFn = EFFECT_TARGET_CONDITION_MAPPING[this.targetConditionId];
    return targetFn(fromChar, toChar, this.targetConditionOpts);
  }

  async apply(fromChar, toChar) {
    await GWE.eventManager.emit(toChar, 'E_EFFECT_INFLICT', { effect: this });
    let mechanicFn = EFFECT_MECHANIC_MAPPING[this.mechanicId];
    await mechanicFn(fromChar, toChar, this.mechanicOpts);
  }
}

module.exports.Effect = Effect;