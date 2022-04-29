let { GWE } = require('gwe');
let { UIStatus } = require('../ui/ui_status');

class MenuStatusScreen extends GWE.Screen {
  constructor(app) {
    super(app);
    this.hero = null;
    this.uiTitle = null;
    this.uiStatus = null;
  }

  handleEvent(event) {
    if (event instanceof GWE.KeydownOnceEvent) {
      if (event.key == GWE.InputKeyEnum.CANCEL) {
        GWE.screenManager.requestPopScreen();
      }
    }
  }

  onEnter(args) {
    if (!args.hero) {
      throw new Error('StatusScreen::constructor : hero is missing !');
    }

    this.hero = args.hero;

    this.uiTitle = new GWE.UIText();
    this.uiTitle.setText('Status');
    GWE.uiManager.addWidget(this.uiTitle, 'position:absolute; top:0; left:0; width:100%; height:50px');

    this.uiStatus = new UIStatus();
    this.uiStatus.setHero(this.hero);
    GWE.uiManager.addWidget(this.uiStatus, 'position:absolute; top:50px; left:0; bottom:0; width:100%');
  }

  onExit() {
    GWE.uiManager.removeWidget(this.uiTitle);
    GWE.uiManager.removeWidget(this.uiStatus);
  }
}

module.exports.MenuStatusScreen = MenuStatusScreen;