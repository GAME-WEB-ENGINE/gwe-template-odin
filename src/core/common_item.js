let fs = require('fs');
let { ItemAbstract } = require('./item_abstract');
let { Effect } = require('./effect');
let { ITEM_TYPE } = require('./enums');

class CommonItem extends ItemAbstract {
  constructor(data) {
    super(data);
    this.effect = null;

    if (!(
      data['Type'] == ITEM_TYPE.POTION ||
      data['Type'] == ITEM_TYPE.FOOD ||
      data['Type'] == ITEM_TYPE.OTHER)) {
      return;
    }

    if (data.hasOwnProperty('Effect')) {
      this.effect = new Effect(data['Effect']);
    }
  }

  static createFromFile(path) {
    let data = JSON.parse(fs.readFileSync(path));
    return new CommonItem(data);
  }

  hasEffect() {
    return this.effect ? true : false;
  }

  getEffect() {
    return this.effect;
  }

  isTarget(fromChar, toChar) {
    return this.effect && this.effect.isTargetConditionCheck(fromChar, toChar);
  }

  apply(fromChar, toChar) {
    this.effect.apply(fromChar, toChar);
  }
}

module.exports.CommonItem = CommonItem;