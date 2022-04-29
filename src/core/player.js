let fs = require('fs');
let { GWE } = require('gwe');
let { HeroCharacter } = require('./hero_character');
let { Inventory } = require('./inventory');

class Player {
  constructor(data) {
    this.gils = 0;
    this.inventory = null;
    this.heroes = [];

    if (!data.hasOwnProperty('Gils')) {
      return false;
    }
    if (!data.hasOwnProperty('Inventory')) {
      return;
    }
    if (!data.hasOwnProperty('Heroes')) {
      return;
    }

    this.gils = data['Gils'];
    this.inventory = new Inventory(data['Inventory']);

    for (let obj of data['Heroes']) {
      this.heroes.push(new HeroCharacter(obj));
    }
  }

  static createFromFile(path) {
    let data = JSON.parse(fs.readFileSync(path));
    return new Player(data);
  }

  getGils() {
    return this.gils;
  }

  increaseGils(amount) {
    this.gils += amount;
    GWE.eventManager.emit(this, 'E_GILS_CHANGED', { gils: this.gils });
  }

  decreaseGils(amount) {
    if (this.gils - amount < 0) {
      throw new Error('Player::decreaseGils(): gils cannot be negative !');
    }

    this.gils -= amount;
    GWE.eventManager.emit(this, 'E_GILS_CHANGED', { gils: this.gils });
  }

  getInventory() {
    return this.inventory;
  }

  getHeroes() {
    return this.heroes;
  }
}

module.exports.Player = Player;