import { ethers, network } from 'hardhat';
import { updateConfig, config } from '@repo/config-contract';
import { getABI } from '../utils/abi';

export async function deployVeCare() {
    const deployer = (await ethers.getSigners())[0];
    console.log(`Deploying VeCare on ${network.name} with wallet ${deployer.address}...`);

    let REWARD_TOKEN_ADDRESS = config.TOKEN_ADDRESS;
    let X2EARN_REWARDS_POOL = config.X2EARN_REWARDS_POOL;
    let X2EARN_APPS = config.X2EARN_APPS;
    let APP_ID = config.APP_ID;

    // If we are running on the solo network, we need to deploy the mock contracts
    // and generate the appID for VeCare
    if (network.name === 'vechain_solo') {
        console.log(`Deploying mock RewardToken (B3TR)...`);
        const RewardTokenContract = await ethers.getContractFactory('B3TR_Mock');
        const rewardToken = await RewardTokenContract.deploy();
        await rewardToken.waitForDeployment();
        REWARD_TOKEN_ADDRESS = await rewardToken.getAddress();
        console.log(`B3TR Token deployed to ${REWARD_TOKEN_ADDRESS}`);

        console.log('Deploying X2EarnApps mock contract...');
        const X2EarnAppsContract = await ethers.getContractFactory('X2EarnAppsMock');
        const x2EarnApps = await X2EarnAppsContract.deploy();
        await x2EarnApps.waitForDeployment();
        X2EARN_APPS = await x2EarnApps.getAddress();
        console.log(`X2EarnApps deployed to ${await x2EarnApps.getAddress()}`);

        console.log('Deploying X2EarnRewardsPool mock contract...');
        const X2EarnRewardsPoolContract = await ethers.getContractFactory('X2EarnRewardsPoolMock');
        const x2EarnRewardsPool = await X2EarnRewardsPoolContract.deploy(
            deployer.address,
            REWARD_TOKEN_ADDRESS,
            await x2EarnApps.getAddress()
        );
        await x2EarnRewardsPool.waitForDeployment();
        X2EARN_REWARDS_POOL = await x2EarnRewardsPool.getAddress();
        console.log(`X2EarnRewardsPool deployed to ${await x2EarnRewardsPool.getAddress()}`);

        console.log('Adding VeCare app in X2EarnApps...');
        await x2EarnApps.addApp(deployer.address, deployer.address, 'VeCare');
        const appID = await x2EarnApps.hashAppName('VeCare');
        APP_ID = appID;
        console.log(`VeCare AppID: ${appID}`);

        console.log(`Funding rewards pool with B3TR tokens...`);
        await rewardToken.approve(await x2EarnRewardsPool.getAddress(), ethers.parseEther('100000'));
        await x2EarnRewardsPool.deposit(ethers.parseEther('50000'), appID);
        console.log('Rewards pool funded with 50,000 B3TR tokens');
    }

    console.log('Deploying VeCare contract...');
    const VeCareFactory = await ethers.getContractFactory('VeCare');

    const veCareInstance = await VeCareFactory.deploy(
        deployer.address,
        X2EARN_REWARDS_POOL, // mock in solo, from config in testnet/mainnet
        APP_ID, // mock in solo, from config in testnet/mainnet
    );
    await veCareInstance.waitForDeployment();

    const veCareAddress = await veCareInstance.getAddress();
    console.log(`VeCare deployed to: ${veCareAddress}`);

    // In solo network, we need to add the VeCare contract as a distributor
    if (network.name === 'vechain_solo') {
        console.log('Adding VeCare contract as reward distributor...');
        const x2EarnApps = await ethers.getContractAt('X2EarnAppsMock', X2EARN_APPS);
        await x2EarnApps.addRewardDistributor(APP_ID, veCareAddress);
        console.log('VeCare added as distributor');
    }

    // Get the ABI for the VeCare contract
    const veCareAbi = await getABI('VeCare');

    // Update config with VeCare contract address
    updateConfig(
        {
            ...config,
            VECARE_CONTRACT_ADDRESS: veCareAddress,
            TOKEN_ADDRESS: REWARD_TOKEN_ADDRESS,
            X2EARN_REWARDS_POOL: X2EARN_REWARDS_POOL,
            X2EARN_APPS: X2EARN_APPS,
            APP_ID: APP_ID,
        },
        veCareAbi,
        'VECARE_SOL_ABI'
    );

    console.log('\n=== VeCare Chain Deployment Summary ===');
    console.log(`Network: ${network.name}`);
    console.log(`VeCare Contract: ${veCareAddress}`);
    console.log(`B3TR Token: ${REWARD_TOKEN_ADDRESS}`);
    console.log(`X2EarnRewardsPool: ${X2EARN_REWARDS_POOL}`);
    console.log(`X2EarnApps: ${X2EARN_APPS}`);
    console.log(`App ID: ${APP_ID}`);
    console.log('=======================================\n');

    console.log('✅ VeCare Chain is ready to use!');
    console.log('📝 Next steps:');
    console.log('   1. Start the backend: yarn backend:dev');
    console.log('   2. Start the frontend: yarn frontend:dev');
    console.log('   3. Create your first medical campaign!');
}

// Execute deployment
deployVeCare()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
