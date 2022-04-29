let { GWE } = require('gwe');
let { Inventory } = require('../core/inventory');
let { UIInventory } = require('../ui/ui_inventory');
let { UIHeroes } = require('../ui/ui_heroes');
let { UIHeroesEquipment } = require('../ui/ui_heroes_equipment');

let SHOP_SCREEN_MODE = {
  COMMON_STORE: 'COMMON_STORE',
  EQUIPMENT_STORE: 'EQUIPMENT_STORE'
};

let CHECKOUT_DESC = {
  QUANTITY: 0,
  TOTAL: 1
};

let PLAYER_DESC = {
  GILS: 0,
  INVENTORY: 1
};

class ShopScreen extends GWE.Screen {
  constructor(app) {
    super(app);
    this.mode = '';
    this.shopInventory = null;
    this.player;
    this.inventory = null;
    this.uiText = null;
    this.uiTitle = null;
    this.uiDescription = null;
    this.uiInventory = null;
    this.uiPlayerDesc = null;
    this.uiCheckoutDesc = null;
    this.uiHeroes = null;
  }

  onEnter(args) {
    if (!(
      args.mode == SHOP_SCREEN_MODE.COMMON_STORE ||
      args.mode == SHOP_SCREEN_MODE.EQUIPMENT_STORE)) {
      throw new Error('ShopScreen::constructor : mode is invalid !');
    }
    if (!args.inventoryId) {
      throw new Error('ShopScreen::constructor : inventoryId is missing !');
    }

    this.mode = args.mode;
    this.shopInventory = Inventory.createFromFile('assets/models/' + args.inventoryId + '/data.json');
    this.player = this.app.getPlayer();
    this.inventory = this.player.getInventory();
    this.quantity = 0;

    this.uiText = new GWE.UIText();
    this.uiText.setText('Que voulez-vous acheter ?');
    GWE.uiManager.addWidget(this.uiText, 'position:absolute; top:0px; left:0; width:70%; height:50px;');

    this.uiTitle = new GWE.UIText();
    this.uiTitle.setText('Magasin');
    GWE.uiManager.addWidget(this.uiTitle, 'position:absolute; top:0; left:70%; width:30%; height:50px;');

    this.uiDescription = new GWE.UIText();
    this.uiDescription.setText('Description...');
    GWE.uiManager.addWidget(this.uiDescription, 'position:absolute; top:50px; left:0; width:100%; height:50px;');

    this.uiInventory = new UIInventory({ showPrice: true, showQuantity: false });
    this.uiInventory.setCollection(this.shopInventory);
    GWE.uiManager.addWidget(this.uiInventory, 'position:absolute; top:100px; left:0; bottom:0; width:50%;');

    this.uiPlayerDesc = new GWE.UIDescriptionList();
    this.uiPlayerDesc.addItem('Gils', this.player.getGils());
    this.uiPlayerDesc.addItem('Inventaire', 0);
    GWE.uiManager.addWidget(this.uiPlayerDesc, 'position:absolute; top:100px; left:50%; width:50%; height:84px');

    this.uiCheckoutDesc = new GWE.UIDescriptionList();
    this.uiCheckoutDesc.hide();
    this.uiCheckoutDesc.addItem('Quantite', 0);
    this.uiCheckoutDesc.addItem('Total', 0);
    this.uiCheckoutDesc.onKeyDownOnce = (data) => this.handleCheckoutKeyDownOnce(data);
    GWE.uiManager.addWidget(this.uiCheckoutDesc, 'position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); z-index:10;');

    this.uiHeroes = (args.mode == SHOP_SCREEN_MODE.COMMON_STORE) ? new UIHeroes() : new UIHeroesEquipment();
    this.uiHeroes.setCollection(new GWE.ArrayCollection(this.player.getHeroes()));
    GWE.uiManager.addWidget(this.uiHeroes, 'position:absolute; top:184px; left:50%; bottom:0; width:50%;');

    GWE.eventManager.subscribe(this.player, 'E_GILS_CHANGED', this, this.handlePlayerGilsChanged);
    GWE.eventManager.subscribe(this.uiInventory, 'E_CLOSED', this, this.handleInventoryClosed);
    GWE.eventManager.subscribe(this.uiInventory, 'E_MENU_ITEM_FOCUSED', this, this.handleInventoryItemFocused);
    GWE.eventManager.subscribe(this.uiInventory, 'E_MENU_ITEM_SELECTED', this, this.handleInventoryItemSelected);

    GWE.uiManager.focus(this.uiInventory);
  }

  onExit() {
    GWE.uiManager.removeWidget(this.uiText);
    GWE.uiManager.removeWidget(this.uiTitle);
    GWE.uiManager.removeWidget(this.uiDescription);
    GWE.uiManager.removeWidget(this.uiInventory);
    GWE.uiManager.removeWidget(this.uiPlayerDesc);
    GWE.uiManager.removeWidget(this.uiCheckoutDesc);
    GWE.uiManager.removeWidget(this.uiHeroes);
  }

  handlePlayerGilsChanged() {
    this.uiPlayerDesc.setItem(PLAYER_DESC.GILS, this.player.getGils());
  }

  handleInventoryClosed() {
    GWE.screenManager.requestPopScreen();
  }

  handleInventoryItemFocused(data) {
    let item = this.uiInventory.getFocusedItem();
    let items = this.inventory.getItems();
    let itemPlayer = items.find(i => i.getId() == item.getId());

    this.uiDescription.setText(item.description);
    this.uiPlayerDesc.setItem(PLAYER_DESC.INVENTORY, itemPlayer ? itemPlayer.quantity : '0');

    if (this.mode == SHOP_SCREEN_MODE.COMMON_STORE) {
      for (let widget of this.uiHeroes.getWidgets()) {
        let hero = widget.getHero();
        widget.setEnabled(item.isTarget(hero, hero));
      }
    }
    else {
      for (let widget of this.uiHeroes.getWidgets()) {
        let hero = widget.getHero();
        widget.setEquipmentItem(item);
        widget.setEnabled(hero.isEquipableItem(item));
      }
    }
  }

  handleInventoryItemSelected() {
    this.uiCheckoutDesc.show();
    GWE.uiManager.focus(this.uiCheckoutDesc);
  }

  handleCheckoutKeyDownOnce(data) {
    let selectedItem = this.uiInventory.getSelectedItem();
    let quantity = parseInt(this.uiCheckoutDesc.getItemValue(CHECKOUT_DESC.QUANTITY));

    if (data.key == GWE.InputKeyEnum.UP) {
      let newQuantity = quantity + 1;
      this.uiCheckoutDesc.setItem(CHECKOUT_DESC.QUANTITY, newQuantity);
      this.uiCheckoutDesc.setItem(CHECKOUT_DESC.TOTAL, newQuantity * selectedItem.getPrice());
    }
    else if (data.key == GWE.InputKeyEnum.DOWN && quantity > 0) {
      let newQuantity = quantity - 1;
      this.uiCheckoutDesc.setItem(CHECKOUT_DESC.QUANTITY, newQuantity);
      this.uiCheckoutDesc.setItem(CHECKOUT_DESC.TOTAL, newQuantity * selectedItem.getPrice());
    }
    else if (data.key == GWE.InputKeyEnum.ENTER) {
      let totalPrice = quantity * selectedItem.price;
      if (this.player.getGils() - totalPrice < 0) {
        return
      }

      selectedItem.setQuantity(quantity);
      this.player.decreaseGils(totalPrice);
      this.inventory.addItem(selectedItem);

      this.uiCheckoutDesc.setItem(CHECKOUT_DESC.QUANTITY, 0);
      this.uiCheckoutDesc.setItem(CHECKOUT_DESC.TOTAL, 0);
      this.uiCheckoutDesc.hide();
      this.uiInventory.unselectWidgets();
      GWE.uiManager.focus(this.uiInventory);
    }
    else if (data.key == GWE.InputKeyEnum.CANCEL) {
      this.uiCheckoutDesc.setItem(CHECKOUT_DESC.QUANTITY, 0);
      this.uiCheckoutDesc.setItem(CHECKOUT_DESC.TOTAL, 0);
      this.uiCheckoutDesc.hide();
      this.uiInventory.unselectWidgets();
      GWE.uiManager.focus(this.uiInventory);
    }
  }
}

module.exports.SHOP_SCREEN_MODE = SHOP_SCREEN_MODE;
module.exports.ShopScreen = ShopScreen;