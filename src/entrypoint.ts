import { setFailed, setOutput, debug } from '@actions/core';
import { main } from './main';

main()
    .then((outputs) => {
        for (const output of Object.entries(outputs)) {
            setOutput(output[0], output[1].value)
        }
        process.exit(0)
    })
    .catch((err: Error) => {
        debug(err.stack as string)
        setFailed(err.message);
        process.exit(1);
    });