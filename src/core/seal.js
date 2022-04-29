let fs = require('fs');
let { Effect } = require('./effect');
let { Modifier } = require('./modifier');

class Seal {
  constructor(data) {
    this.id = '';
    this.name = '';
    this.description = '';
    this.iconFile = '';
    this.stackable = false;
    this.numTurns = 0;
    this.onTurnEffect = null;
    this.modifiers = [];
    this.turnCount = 0;
    this.fromChar = null;

    if (!data.hasOwnProperty('Id')) {
      return;
    }
    if (!data.hasOwnProperty('Name')) {
      return;
    }
    if (!data.hasOwnProperty('Description')) {
      return;
    }
    if (!data.hasOwnProperty('IconFile')) {
      return;
    }
    if (!data.hasOwnProperty('Stackable')) {
      return;
    }
    if (!data.hasOwnProperty('NumTurns')) {
      return;
    }
    if (!data.hasOwnProperty('Modifiers')) {
      return;
    }

    this.id = data['Id'];
    this.name = data['Name'];
    this.description = data['Description'];
    this.iconFile = data['IconFile'];
    this.stackable = data['Stackable'];
    this.numTurns = data['NumTurns'];

    if (data.hasOwnProperty('OnTurnEffect')) {
      this.onTurnEffect = new Effect(data['OnTurnEffect']);
    }

    for (let obj of data['Modifiers']) {
      this.modifiers.push(new Modifier(obj));
    }
  }

  static createFromFile(path) {
    let data = JSON.parse(fs.readFileSync(path));
    return new Seal(data);
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

  getIconFile() {
    return this.iconFile;
  }

  getStackable() {
    return this.stackable;
  }

  getNumTurns() {
    return this.numTurns;
  }

  getModifiers() {
    return this.modifiers;
  }

  getTurnCount() {
    return this.turnCount;
  }

  incTurnCount() {
    this.turnCount++;
  }
  
  getFromChar() {
    return this.fromChar;
  }
}

module.exports.Seal = Seal;