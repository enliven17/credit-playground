const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy SendenCredit contract
  const SendenCredit = await hre.ethers.getContractFactory("SendenCredit");
  const sendenCredit = await SendenCredit.deploy(1000000); // 1M initial supply

  await sendenCredit.waitForDeployment();
  const contractAddress = await sendenCredit.getAddress();

  console.log("SendenCredit deployed to:", contractAddress);
  console.log("Transaction hash:", sendenCredit.deploymentTransaction().hash);
  
  // Verify contract on explorer (if supported)
  console.log("Contract deployed successfully!");
  console.log("Explorer URL:", `https://explorer.cc3-testnet.creditcoin.network/address/${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });