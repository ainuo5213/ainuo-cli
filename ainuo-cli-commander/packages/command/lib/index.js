export default class Command {
  constructor(commanderInstance) {
    if (!commanderInstance) {
      throw new Error("commander instance cannot be null");
    }
    this._commander = commanderInstance;
    const cmd = this._commander.command(this.command);
    cmd.hook("preAction", () => {
      this.preAction();
    });
    cmd.hook("postAction", () => {
      this.postAction();
    });
    cmd.description(this.description);
    this.options.forEach((r) => {
      cmd.option(...r);
    });
    cmd.action((...args) => {
      this.action(...args);
    });
  }

  get name() {
    throw new Error("name must not be empty");
  }

  get description() {
    throw new Error("description must not be empty");
  }

  get options() {
    return [];
  }

  action() {
    throw new Error("action must not be empty");
  }

  postAction() {}

  preAction() {}
}
