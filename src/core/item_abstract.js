class ItemAbstract {
  constructor(data) {
    this.id = '';
    this.type = '';
    this.name = '';
    this.description = '';
    this.pictureFile = '';
    this.soldable = true;
    this.price = 0;
    this.quantity = 1;

    if (!data.hasOwnProperty('Id')) {
      return;
    }
    if (!data.hasOwnProperty('Type')) {
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
    if (!data.hasOwnProperty('Soldable')) {
      return;
    }
    if (!data.hasOwnProperty('Price')) {
      return;
    }

    this.id = data['Id'];
    this.type = data['Type'];
    this.name = data['Name'];
    this.description = data['Description'];
    this.pictureFile = data['PictureFile'];
    this.soldable = data['Soldable'];
    this.price = data['Price'];
  }

  getId() {
    return this.id;
  }

  getType() {
    return this.type;
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

  getSoldable() {
    return this.soldable;
  }

  getPrice() {
    return this.price;
  }

  getQuantity() {
    return this.quantity;
  }

  setQuantity(quantity) {
    this.quantity = quantity;
  }
}

module.exports.ItemAbstract = ItemAbstract;