import Command from "@ainuotestgroup/command";
import {getGitPlatform,} from "@ainuotestgroup/utils";

class Index extends Command {
    gitAPI = null;

    get command() {
        return "commit";
    }

    get options() {
        return [];
    }

    get description() {
        return "commit code";
    }

    async action(name, options) {
        const platformInstance = await getGitPlatform()
        this.gitAPI = platformInstance;
        process.exit();
    }
}

export default function Committer(program) {
    return new Index(program);
}
