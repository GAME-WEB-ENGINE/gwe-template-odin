let fs = require('fs');
let { CharacterAbstract } = require('./character_abstract');
let { Effect } = require('./effect');
let { ENEMY_PATTERN_CONDITION_MAPPING } = require('./mappings/enemy_pattern_condition_mapping');
let { ENEMY_PATTERN_TARGET_SORT_MAPPING } = require('./mappings/enemy_pattern_target_sort_mapping');

class EnemyCharacter extends CharacterAbstract {
  constructor(data) {
    super(data);
    this.gils = 0;
    this.patterns = [];
    this.position = [0, 0, 0];

    if (!data.hasOwnProperty('Gils')) {
      return;
    }
    if (!data.hasOwnProperty('Patterns')) {
      return;
    }

    this.gils = data['Gils'];

    for (let obj of data['Patterns']) {
      this.patterns.push(new EnemyPattern(obj));
    }
  }

  static createFromFile(path) {
    let data = JSON.parse(fs.readFileSync(path));
    return new EnemyCharacter(data);
  }

  getGils() {
    return this.gils;
  }

  getPatterns() {
    return this.patterns;
  }

  getPosition() {
    return this.position;
  }

  setPosition(position) {
    this.position = position;
  }
}

class EnemyPattern {
  constructor(data) {
    this.name = '';
    this.effect = null;
    this.priority = 0;
    this.conditionId = '';
    this.conditionOpts = {};
    this.targetSortId = '';
    this.targetSortOpts = {};

    if (!data.hasOwnProperty('Name')) {
      return;
    }
    if (!data.hasOwnProperty('EffectId')) {
      return;
    }
    if (!data.hasOwnProperty('Priority')) {
      return;
    }
    if (!data.hasOwnProperty('ConditionId')) {
      return;
    }
    if (!data.hasOwnProperty('ConditionOpts')) {
      return;
    }
    if (!data.hasOwnProperty('TargetSortId')) {
      return;
    }
    if (!data.hasOwnProperty('TargetSortOpts')) {
      return;
    }

    this.name = data['Name'];
    this.effect = Effect.createFromFile('assets/models/' + data['EffectId'] + '/data.json');
    this.priority = data['Priority'];
    this.conditionId = data['ConditionId'];
    this.conditionOpts = data['ConditionOpts'];
    this.targetSortId = data['TargetSortId'];
    this.targetSortOpts = data['TargetSortOpts'];
  }

  isConditionCheck(battle, enemy) {
    let conditionFn = ENEMY_PATTERN_CONDITION_MAPPING[this.conditionId];
    return conditionFn(battle, enemy, this.conditionOpts);
  }

  targetSort(a, b) {
    let targetSortFn = ENEMY_PATTERN_TARGET_SORT_MAPPING[this.targetSortId];
    return targetSortFn(a, b);
  }
}

module.exports.EnemyCharacter = EnemyCharacter;
module.exports.EnemyPattern = EnemyPattern;