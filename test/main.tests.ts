import { main } from "../src/main";
import * as assert from 'assert';

// Unit Tests
export async function runTests() {
    let result = await main()
    assert.equal(Object.keys(result).length, 3, `Expected output count of 3 but got ${Object.keys(result).length}`)
    assert.ok(result["generatedName"], `Got invalid value for generatedName key, got ${result["generatedName"]}`)
    assert.equal(result["containerName"].value, "github-action-override", `Got invalid value for location key, expected github-action-override but got ${result["containerName"].value}`)
    assert.equal(result["location"].value, "westeurope", `Got invalid value for location key, expected westeurope but got ${result["location"].value}`)
}

runTests().catch(e => {
    console.error(e)
    process.exit(1)
})