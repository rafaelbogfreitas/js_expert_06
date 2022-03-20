export default class View {
  constructor() {
    this.btnStart = document.getElementById("start");
    this.btnStop = document.getElementById("stop");

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

  async onStartClicked({ srcElement: { innerText }}) {
    const btnText = innerText;

    await this.onBtnClick(btnText);
  }
}