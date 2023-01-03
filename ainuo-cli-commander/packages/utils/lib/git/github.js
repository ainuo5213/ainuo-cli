import AbstractGit from "./AbstractGit.js";

export default class Github extends AbstractGit {
  platform = "github";
  constructor() {
    super();
  }
}
