import {
    Clarinet,
    Tx,
    Chain,
    Account,
    types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Can register a new property title",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('property-title', 'register-title', [
                types.uint(1),
                types.ascii("123 Main St"),
                types.ascii("2 bedroom house")
            ], deployer.address)
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
    }
});

Clarinet.test({
    name: "Cannot register duplicate title ID",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('property-title', 'register-title', [
                types.uint(1),
                types.ascii("123 Main St"),
                types.ascii("2 bedroom house")
            ], deployer.address),
            Tx.contractCall('property-title', 'register-title', [
                types.uint(1),
                types.ascii("456 Oak St"),
                types.ascii("3 bedroom house")
            ], deployer.address)
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[1].result.expectErr(types.uint(101)); // err-title-exists
    }
});

Clarinet.test({
    name: "Can transfer title ownership",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('property-title', 'register-title', [
                types.uint(1),
                types.ascii("123 Main St"),
                types.ascii("2 bedroom house")
            ], deployer.address),
            Tx.contractCall('property-title', 'transfer-title', [
                types.uint(1),
                types.principal(wallet1.address)
            ], deployer.address)
        ]);
        
        block.receipts[0].result.expectOk().expectBool(true);
        block.receipts[1].result.expectOk().expectBool(true);
        
        // Verify new owner
        let verifyBlock = chain.mineBlock([
            Tx.contractCall('property-title', 'verify-title-owner', [
                types.uint(1),
                types.principal(wallet1.address)
            ], deployer.address)
        ]);
        
        verifyBlock.receipts[0].result.expectOk().expectBool(true);
    }
});
