// import { main } from "../src/main";
// import * as assert from 'assert';

// // Unit Tests
// export async function runTests() {
//     let result = await main()
//     assert.equal(result.exitCode, 0, `Expected exit code 0 but got ${result.exitCode}`)
//     assert.equal(Object.keys(result.outputs).length, 2, `Expected output count of 2 but got ${Object.keys(result.outputs).length}`)
//     assert.equal(result.outputs["containerName"].value, "github-action", `Got invalid value for location key, expected github-action but got ${result.outputs["containerName"].value}`)
//     assert.equal(result.outputs["location"].value, "westeurope", `Got invalid value for location key, expected westeurope but got ${result.outputs["location"].value}`)
// }

// runTests().catch(e => {
//     console.error(e)
//     process.exit(1)
// })