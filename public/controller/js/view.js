export default class View {

  onLoad() {
    this.changeCommandButtonsVisibility();
  }

  changeCommandButtonsVisibility(hide = true) {
    const cmdButtons = [...document.querySelectorAll("[name='command']")];

    cmdButtons.forEach(btn => {
      const action = hide ? "add" : "remove";
      btn.classList[action]("unassigned");

      btn.onClick = function onClickReset(){};
    });
  }
}