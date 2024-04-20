import {ethers} from "ethers"
import {abi} from "./abi"
import dotenv from "dotenv"
import { createValidatorsAndBatcher } from "./createWallet"
import fs from "fs"
import path from "path"
dotenv.config()

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC)
const contractAddress = "0x06E341073b2749e0Bb9912461351f716DeCDa9b0"
// const rollUpContractCreator = new ethers.Contract(contractAddress,abi,provider)
const tokenAddressToBeNativeToken = "0x0000000000000000000000000000000000000000" /// ETHNative
const chainId = 43591758787 + Math.floor(Math.random() * 10) + 1;
const chainName = "Frutereishon"
const configPath = path.join(__dirname, '../config/nodeConfig.json');
const configPath2 = path.join(__dirname, '../config/orbitSetupScriptConfig.json')

async function interactWithContract(numValidators:number, tokenAddressToBeNativeToken:string, chainId:number, chainName:string) {
    try {
        const { validators, batcher } = await createValidatorsAndBatcher(numValidators);
        const batcherPrivateKey = batcher.privateKey;
        const validatorPrivateKey = validators[0].privateKey;
        // const signer = provider.getSigner();
        // const walletCreator = await signer.getAddress();
        const walletCreator = "0x0000000000000000000000000000000000000000" // TODO: change to walletCreator
        const deployParams = {
            config: [
                150, 0, "0x0000000000000000000000000000000000000000", 100000000000000000,
                "0x0754e09320c381566cc0449904c377a52bd34a6b9404432e80afd573b67f7b17",
                walletCreator, "0x0000000000000000000000000000000000000000",
                chainId, {
                    homesteadBlock: 0,
                    daoForkBlock: null,
                    daoForkSupport: true,
                    eip150Block: 0,
                    eip150Hash: "0x0000000000000000000000000000000000000000000000000000000000000000",
                    eip155Block: 0,
                    eip158Block: 0,
                    byzantiumBlock: 0,
                    constantinopleBlock: 0,
                    petersburgBlock: 0,
                    istanbulBlock: 0,
                    muirGlacierBlock: 0,
                    berlinBlock: 0,
                    londonBlock: 0,
                    clique: { period: 0, epoch: 0 },
                    arbitrum: {
                        EnableArbOS: true,
                        AllowDebugPrecompiles: false,
                        DataAvailabilityCommittee: false,
                        InitialArbOSVersion: 11,
                        GenesisBlockNum: 0,
                        MaxCodeSize: 24576,
                        MaxInitCodeSize: 49152,
                        InitialChainOwner: walletCreator
                    },
                    chainId: chainId
                }, 0, 5760, 48, 86400, 3600
            ],
            batchPoster: batcher.address,
            validators: validators.map(v => v.address),
            maxDataSize: 104857,
            nativeToken: tokenAddressToBeNativeToken,
            deployFactoriesToL2: true,
            maxFeePerGasForRetryables: 100000000
        };

        // const transactionResponse = await rollUpContractCreator.createRollup(deployParams);
        // console.log('Transaction successful:', transactionResponse);


        const configFile = fs.readFileSync(configPath, 'utf8');
        const configFile2 = fs.readFileSync(configPath2, 'utf8');
        const config = JSON.parse(configFile);
        const config2 = JSON.parse(configFile2);

        const chainInfo = JSON.parse(config.chain['info-json']);
        config2.chainId = chainId;
        config2.chainName = chainName;
        config2.batchPoster = batcher.address;
        config2.staker = validators.map(v => v.address);

        chainInfo.forEach(info => {
            if (info['chain-name'] === "Rafachain Testing") {
                info['chain-name'] = chainName;
            }
        });

        if (config.chain.name === "Rafachain Testing") {
            config.chain.name = chainName;
        }
        chainInfo[0]['chain-id'] = chainId;
        chainInfo[0]['chain-config']['chainId'] = chainId;
        config.node['batch-poster']['parent-chain-wallet']['private-key'] = batcherPrivateKey;
        config.node['staker']['parent-chain-wallet']['private-key'] = validatorPrivateKey;

        config.chain['info-json'] = JSON.stringify(chainInfo);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        fs.writeFileSync(configPath2, JSON.stringify(config2, null, 2));

    } catch (error) {
        console.error('Error interacting with contract:', error);
    }
}

interactWithContract(1, tokenAddressToBeNativeToken, chainId, chainName);
