"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const io = __importStar(require("@actions/io"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let azPath = yield io.which("az", true);
        const ressourceGroup = core.getInput('ressourceGroup');
        const templateFile = core.getInput('templateFile');
        /*
            az group deployment create --resource-group
                                    [--aux-subs]
                                    [--aux-tenants]
                                    [--handle-extended-json-format]
                                    [--mode {Complete, Incremental}]
                                    [--name]
                                    [--no-wait]
                                    [--parameters]
                                    [--rollback-on-error]
                                    [--subscription]
                                    [--template-file]
                                    [--template-uri]
                */
        yield executeAzureCliCommand(azPath, `group deployment create --resource-group ${ressourceGroup} --template-file ${templateFile}`);
    });
}
function executeAzureCliCommand(cliPath, command) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exec.exec(`"${cliPath}" ${command}`, [], {});
        }
        catch (error) {
            throw new Error(error);
        }
    });
}
main();
