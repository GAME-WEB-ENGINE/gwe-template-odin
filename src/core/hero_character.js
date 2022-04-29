let fs = require('fs');
let { CharacterAbstract } = require('./character_abstract');
let { EquipmentItem } = require('./equipment_item');
let { ITEM_TYPE } = require('./enums');

class HeroCharacter extends CharacterAbstract {
  constructor(data) {
    super(data);
    this.weapon = null;
    this.helmet = null;
    this.armor = null;
    this.relic = null;
    this.allowedEquipmentItemSubTypes = [];

    if (!data.hasOwnProperty('AllowedEquipmentItemSubTypes')) {
      return;
    }

    if (data['WeaponId']) {
      this.setEquipment(EquipmentItem.createFromFile('assets/models/' + data['WeaponId'] + '/data.json'));
    }
    if (data['HelmetId']) {
      this.setEquipment(EquipmentItem.createFromFile('assets/models/' + data['HelmetId'] + '/data.json'));
    }
    if (data['ArmorId']) {
      this.setEquipment(EquipmentItem.createFromFile('assets/models/' + data['ArmorId'] + '/data.json'));
    }
    if (data['RelicId']) {
      this.setEquipment(EquipmentItem.createFromFile('assets/models/' + data['RelicId'] + '/data.json'));
    }

    for (let subType of data['AllowedEquipmentItemSubTypes']) {
      this.allowedEquipmentItemSubTypes.push(subType);
    }
  }

  static createFromFile(path) {
    let data = JSON.parse(fs.readFileSync(path));
    return new HeroCharacter(data);
  }

  getWeapon() {
    return this.weapon;
  }

  getHelmet() {
    return this.helmet;
  }

  getArmor() {
    return this.armor;
  }

  getRelic() {
    return this.relic;
  }

  getAllowedEquipmentItemSubTypes() {
    return this.allowedEquipmentItemSubTypes;
  }

  isEquipableItem(item) {
    return item instanceof EquipmentItem && this.allowedEquipmentItemSubTypes.includes(item.getSubType());
  }

  getAttributesWith(equipmentItem) {
    let newAttributes = {};
    let oldEquipment = this.setEquipment(equipmentItem);

    for (let attributeKey in this.attributes.map) {
      newAttributes[attributeKey] = this.attributes.get(attributeKey);
    }

    if (oldEquipment) {
      this.setEquipment(oldEquipment);
    }
    else {
      this.removeEquipment(equipmentItem);
    }

    return newAttributes;
  }

  setEquipment(equipmentItem) {
    let oldEquipmentItem = null;
    if (equipmentItem.type == ITEM_TYPE.WEAPON) {
      oldEquipmentItem = this.weapon;
      this.weapon = equipmentItem;
    }
    else if (equipmentItem.type == ITEM_TYPE.HELMET) {
      oldEquipmentItem = this.helmet;
      this.helmet = equipmentItem;
    }
    else if (equipmentItem.type == ITEM_TYPE.ARMOR) {
      oldEquipmentItem = this.armor;
      this.armor = equipmentItem;
    }
    else if (equipmentItem.type == ITEM_TYPE.RELIC) {
      oldEquipmentItem = this.relic;
      this.relic = equipmentItem;
    }

    if (oldEquipmentItem) {
      this.attributes.removeModifiers(oldEquipmentItem.modifiers);
    }

    this.attributes.addModifiers(equipmentItem.modifiers);
    return oldEquipmentItem;
  }

  removeEquipment(equipmentItem) {
    if (equipmentItem == this.weapon) {
      this.attributes.removeModifiers(this.weapon.modifiers);
      this.weapon = null;
      return true;
    }
    else if (equipmentItem == this.helmet) {
      this.attributes.removeModifiers(this.helmet.modifiers);
      this.helmet = null;
      return true;
    }
    else if (equipmentItem == this.armor) {
      this.attributes.removeModifiers(this.armor.modifiers);
      this.armor = null;
      return true;
    }
    else if (equipmentItem == this.relic) {
      this.attributes.removeModifiers(this.relic.modifiers);
      this.relic = null;
      return true;
    }

    return false;
  }
}

module.exports.HeroCharacter = HeroCharacter;