import { Ed25519PublicKey, Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { MultiSigPublicKey } from "@mysten/sui/multisig";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { toBase64, fromBase64, bcs } from "@mysten/bcs";
import { Transaction } from "@mysten/sui/transactions";

import {
    SuiObjectChange,
    SuiTransactionBlockResponse,
    SuiObjectResponse,
} from "@mysten/sui/client";

const packageID = process.env.PACKAGE_ID as string;
const secretKey = process.env.TREASURY_KEY as string;

const treasuryKeyPair = Ed25519Keypair.fromSecretKey(secretKey);
const rpcUrl = getFullnodeUrl(
    process.env.NETWORK as "mainnet" | "testnet" | "devnet" | "localnet",
);
const client = new SuiClient({ url: rpcUrl });

export async function executeTx(bytes: string, signature: any) {
    return await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        requestType: "WaitForLocalExecution",
        options: {
            showEffects: true,
            showObjectChanges: true,
        },
    });
}

export async function publishModuleObject (
    name: string,
    type: string,
    image_url: string,
    thumbnail_url: string,
    description: string,
    creator_name: string
) {
    const tx = new Transaction();

    tx.moveCall({
        target: `${packageID}::Core::publish_module`,
        arguments: [
            tx.pure.string(name),
            tx.pure.string(type),
            tx.pure.string(image_url),
            tx.pure.string(thumbnail_url),
            tx.pure.string(description),
            tx.pure.string(creator_name),
        ],
    });
    tx.setSender(treasuryKeyPair.toSuiAddress());  // Should be set to frontend wallet address
    tx.setGasBudget(100000000);

    const { bytes, signature } = await tx.sign({
        client,
        signer: treasuryKeyPair,
    });


    const res = await executeTx(bytes, signature);

    let moduleID = null;
    if (!res.effects || res.effects.status.status !== "success")
        throw new Error("Tx was unsuccessful");

    if (res.objectChanges) {
        for (const change of res.objectChanges) {
            if (
                change.type === "created" &&
                change.objectType === `${packageID}::Core::ComposableModule`
            ) {
                moduleID = change.objectId;
                break;
            }
        }
    }
    if (!moduleID) throw new Error("Vault object creation unsuccessful");

    return moduleID;
}

export async function updateMarketplaceListing (
    moduleID: string,
    is_purchasable: boolean,
    price: number = 0
) {
    const tx = new Transaction();

    tx.moveCall({
        target: `${packageID}::Core::update_module_marketplace_listing`,
        arguments: [
            tx.object(moduleID),
            tx.pure.bool(is_purchasable),
            tx.pure.u64(price),
        ],
    });
    tx.setSender(treasuryKeyPair.toSuiAddress());  // Should be set to frontend wallet address
    tx.setGasBudget(100000000);

    const { bytes, signature } = await tx.sign({
        client,
        signer: treasuryKeyPair,
    });
    const res = await executeTx(bytes, signature);

    if (!res.effects || res.effects.status.status !== "success")
        throw new Error("Tx was unsuccessful");

    if (res.objectChanges) {
        return res.objectChanges;
    }

    return null;
}

// export async function buyAModule (
//     moduleID: string
// ) {
//     try {
//         const tx = new Transaction();
//
//         // Merge coins to buy object
//         const coins = await client.getCoins({
//             owner: treasuryKeyPair.toSuiAddress(),
//         });
//
//         let sum = 0;
//         const selectedCoins = [];
//         for (const coin of coins.data) {
//             sum += Number(coin.balance);
//             selectedCoins.push(tx.object(coin.coinObjectId));
//         }
//
//         const firstCoin = selectedCoins[0];
//
//         tx.mergeCoins(firstCoin, selectedCoins[1:]);
//
//         tx.moveCall({
//             target: `${packageID}::Core::buy_module`,
//             arguments: [
//                 tx.object(moduleID),
//             ],
//         });
//         tx.setSender(treasuryKeyPair.toSuiAddress());  // Should be set to frontend wallet address
//         tx.setGasBudget(100000000);
//
//         const { bytes, signature } = await tx.sign({
//             client,
//             signer: treasuryKeyPair,
//         });
//         const res = await executeTx(bytes, signature);
//
//         if (!res.effects || res.effects.status.status !== "success")
//             throw new Error("Tx was unsuccessful");
//
//         if (res.objectChanges) {
//             return res.objectChanges;
//         }
//
//         return null;
//     } catch (error) {
//         console.error(error);
//     }
// }