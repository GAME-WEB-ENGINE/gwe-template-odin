let fs = require('fs');
let { GWE } = require('gwe');
let { EnemyCharacter } = require('./enemy_character');
let { NewTurnBattleAction, ApplyEffectBattleAction, LetBattleAction } = require('./battle_actions');

class Battle {
  constructor(data, player) {
    this.backgroundImage = '';
    this.enemies = [];
    this.player = player;
    this.heroes = player.getHeroes();
    this.numTurns = 0;
    this.characterQueue = [];

    if (!data.hasOwnProperty('BackgroundImage')) {
      return;
    }
    if (!data.hasOwnProperty('Enemies')) {
      return;
    }

    this.backgroundImage = data['BackgroundImage'];

    for (let obj of data['Enemies']) {
      let enemy = EnemyCharacter.createFromFile('assets/models/' + obj['EnemyId'] + '/data.json');
      enemy.setPosition(obj['Position']);
      this.enemies.push(enemy);
    }
  }

  static createFromFile(path, player) {
    let data = JSON.parse(fs.readFileSync(path));
    return new Battle(data, player);
  }

  getBackgroundImage() {
    return this.backgroundImage;
  }

  getEnemies() {
    return this.enemies;
  }

  getPlayer() {
    return this.player;
  }

  getHeroes() {
    return this.heroes;
  }

  getNumTurns() {
    return this.numTurns;
  }

  incNumTurns() {
    this.numTurns++;
  }

  getCharacterQueue() {
    return this.characterQueue;
  }

  setCharacterQueue(characterQueue) {
    this.characterQueue = characterQueue;
  }

  startup() {
    this.runAction(new NewTurnBattleAction(this));
  }

  async runAction(action) {
    await action.exec();

    for (let char of this.characterQueue) {
      if (char.getAttribute('HP') == 0) {
        this.characterQueue.splice(this.characterQueue.indexOf(char), 1);
      }
    }

    let sumHeroHealth = this.heroes.reduce((s, hero) => s + hero.getAttribute('HP'), 0);
    if (sumHeroHealth == 0) {
      return GWE.eventManager.emit(this, 'E_LOST');
    }

    let sumEnemyHealth = this.enemies.reduce((s, enemy) => s + enemy.getAttribute('HP'), 0);
    if (sumEnemyHealth == 0) {
      return GWE.eventManager.emit(this, 'E_WIN');
    }

    if (this.characterQueue.length == 0) {
      return this.runAction(new NewTurnBattleAction(this));
    }

    let ready = this.characterQueue.filter(char => char.isReady());
    if (ready.length == 0) {
      let i = 0;
      while (i < this.characterQueue.length && this.characterQueue[0].constructor.name == this.characterQueue[i].constructor.name) {
        ready.push(this.characterQueue[i]);
        this.characterQueue[i].setReady(true);
        i++;
      }
    }

    GWE.eventManager.emit(this, 'E_CHAR_READY', { char: ready[0] });

    if (ready[0] instanceof EnemyCharacter) {
      this.handleAI();
    }
  }

  handleAI() {
    let enemy = this.characterQueue[0];
    let charArray = [...this.heroes, ...this.enemies];

    let orderedPatterns = enemy.patterns.sort((a, b) => a.priority - b.priority);
    let availablePatterns = orderedPatterns.filter(pattern => pattern.isConditionCheck(this, enemy));

    let selectedEffect = null;
    let selectedTarget = null;

    if (availablePatterns.length > 0) {
      for (let pattern of availablePatterns) {
        let targets = charArray.filter(char => pattern.effect.isTargetConditionCheck(enemy, char));
        if (targets.length > 0) {
          selectedEffect = pattern.effect;
          selectedTarget = targets.sort(pattern.targetSort)[0];
          break;
        }
      }
    }
    else {
      let indexes = GWE.Utils.RANDARRAY(0, enemy.patterns.length - 1);
      for (let index of indexes) {
        let pattern = enemy.patterns[index];
        let targets = charArray.filter(char => pattern.effect.isTargetConditionCheck(enemy, char));
        if (targets.length > 0) {
          selectedEffect = pattern.effect;
          selectedTarget = targets.sort((a, b) => pattern.targetSort(a, b))[0];
          break;
        }
      }
    }

    if (selectedEffect && selectedTarget) {
      this.runAction(new ApplyEffectBattleAction(this, selectedEffect, enemy, selectedTarget));
    }
    else {
      this.runAction(new LetBattleAction(this, enemy));
    }
  }
}

module.exports.Battle = Battle;