let fs = require('fs');
let { Modifier } = require('./modifier');
let { ItemAbstract } = require('./item_abstract');
let { ITEM_TYPE, EQUIPMENT_ITEM_SUBTYPE } = require('./enums');

class EquipmentItem extends ItemAbstract {
  constructor(data) {
    super(data);
    this.subType = '';
    this.modifiers = [];

    if (!(
      data['Type'] == ITEM_TYPE.WEAPON ||
      data['Type'] == ITEM_TYPE.HELMET ||
      data['Type'] == ITEM_TYPE.ARMOR ||
      data['Type'] == ITEM_TYPE.RELIC)) {
      return;
    }
    if (!data.hasOwnProperty('SubType')) {
      return;
    }
    if (!(
      data['SubType'] == EQUIPMENT_ITEM_SUBTYPE.WEAPON_DAGGER ||
      data['SubType'] == EQUIPMENT_ITEM_SUBTYPE.WEAPON_SWORD ||
      data['SubType'] == EQUIPMENT_ITEM_SUBTYPE.WEAPON_GUN ||
      data['SubType'] == EQUIPMENT_ITEM_SUBTYPE.HELMET_ARMOR ||
      data['SubType'] == EQUIPMENT_ITEM_SUBTYPE.HELMET_EVASION ||
      data['SubType'] == EQUIPMENT_ITEM_SUBTYPE.HELMET_MAGIC ||
      data['SubType'] == EQUIPMENT_ITEM_SUBTYPE.ARMOR_GENERAL ||
      data['SubType'] == EQUIPMENT_ITEM_SUBTYPE.ARMOR_MAGIC ||
      data['SubType'] == EQUIPMENT_ITEM_SUBTYPE.RELIC_PHYSICS ||
      data['SubType'] == EQUIPMENT_ITEM_SUBTYPE.RELIC_MAGIC)) {
      return;
    }
    if (!data.hasOwnProperty('Modifiers')) {
      return;
    }

    this.subType = data['SubType'];

    for (let obj of data['Modifiers']) {
      this.modifiers.push(new Modifier(obj));
    }
  }

  static createFromFile(path) {
    let data = JSON.parse(fs.readFileSync(path));
    return new EquipmentItem(data);
  }

  getSubType() {
    return this.subType;
  }

  getModifiers() {
    return this.modifiers;
  }
}

module.exports.EquipmentItem = EquipmentItem;