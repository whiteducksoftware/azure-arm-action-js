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
        // determine az path
        const azPath = yield io.which("az", true);
        // retrieve action variables
        const resourceGroupName = core.getInput('resourceGroupName');
        const templateLocation = core.getInput('templateLocation');
        const deploymentMode = core.getInput('deploymentMode');
        const deploymentName = core.getInput('deploymentName');
        const parameters = core.getInput('parameters');
        // create the parameter list
        let azDeployParameters = [
            resourceGroupName ? `--resource-group ${resourceGroupName}` : undefined,
            templateLocation ? `--template-file ${templateLocation}` : undefined,
            deploymentMode ? `--mode ${deploymentMode}` : undefined,
            deploymentName ? `--name ${deploymentName}` : undefined,
            parameters ? `--parameters ${parameters}` : undefined
        ].filter(Boolean).join(' ');
        yield executeAzureCliCommand(azPath, `group deployment create ${azDeployParameters}`);
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
