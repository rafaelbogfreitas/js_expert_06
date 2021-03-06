export default class View {
  constructor() {
    this.btnStart = document.getElementById("start");
    this.btnStop = document.getElementById("stop");
    this.buttons = () => Array.from(document.querySelectorAll("button"));
    this.ignoreButton = new Set(['unassigned']);
    this.DISABLE_BTN_TIMEOUT = 200;

    async function onBtnClick() {};
    this.onBtnClick = onBtnClick;
  }

  onLoad() {
    this.changeCommandButtonsVisibility();
    this.btnStart.onclick = this.onStartClicked.bind(this);
  }

  changeCommandButtonsVisibility(hide = true) {
    const cmdButtons = Array.from(document.querySelectorAll("[name='command']"));

    cmdButtons.forEach(btn => {
      const action = hide ? "add" : "remove";
      btn.classList[action]("unassigned");

      function onClickReset(){}
      btn.onclick = onClickReset;
    });
  }

  configureOnBtnClick(fn) {
    this.onBtnClick = fn;
  }

  async onCommandClick(btn) {
    const {
      srcElement: {
        classList,
        innerText,
      }
    } = btn;

    this.toggleDisableCommandBtn(classList);
    await this.onBtnClick(innerText);
    setTimeout(() => this.toggleDisableCommandBtn(classList), this.DISABLE_BTN_TIMEOUT);
  }

  toggleDisableCommandBtn(classList) {
    if(!classList.contains('active')) {
      classList.add('active');
      return;
    }

    classList.remove('active');
  }
  onStopBtn({ srcElement: { innerText }}) {
    this.toggleBtnStart(false);
    this.changeCommandButtonsVisibility(true);

    this.onBtnClick(innerText);
  }

  async onStartClicked({ srcElement: { innerText }}) {
    const btnText = innerText;

    await this.onBtnClick(btnText);
    this.toggleBtnStart();
    this.changeCommandButtonsVisibility(false);

    this.buttons()
      .filter(btn => this.isUnassignedButton(btn))
      .forEach(btn => this.setUpBtnAction(btn));
  }

  setUpBtnAction(btn) {
    const text = btn.innerText.toLowerCase();

    if(text.includes("start")) {
      return;
    }

    if(text.includes("stop")) {
      btn.onclick = this.onStopBtn.bind(this);
      return;
    }

    btn.onclick = this.onCommandClick.bind(this);
  }

  isUnassignedButton(btn) {
    const classes = Array.from(btn.classList);

    return !(!!classes.find(item => this.ignoreButton.has(item)));
  }

  toggleBtnStart(active = true) {
    if(active) {
      this.btnStart.classList.add('hidden');
      this.btnStop.classList.remove('hidden');
      return;
    }
    
    this.btnStart.classList.remove('hidden');
    this.btnStop.classList.add('hidden');
  }
}