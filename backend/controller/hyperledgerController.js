import { Gateway, Wallets } from "fabric-network";
import FabricCAServices from "fabric-ca-client";
import {
  enrollAdmin,
  buildCAClient,
  registerAndEnrollUser,
} from "../services/fabric/enrollment.js";
import { buildWallet, buildCCPOrg1 } from "../services/fabric/AppUtil.js";

import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// import walletUtils from "../loaders/wallet-utils.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const walletPath = path.join(__dirname, "..", "wallet");

dotenv.config();
const mspOrg1 = "Org1MSP";
const cppUser = JSON.parse(fs.readFileSync(process.env.ccpPATH, "utf8"));
const userId = "appUser";
const channelName = "mychannel";
const chaincodeName = "ledger";
const nameOrg = "Cần Thơ University";
const symbolOrg = 'CTU';
export const fabric_initial_system = async (mspOrg1) => {
  try {
    const ccp = buildCCPOrg1();
    //build ca
    const caClient = buildCAClient(
      FabricCAServices,
      ccp,
      "ca.org1.example.com",
    );

    // //build wallet
    const wallet = await buildWallet(Wallets, walletPath);

    await enrollAdmin(caClient, wallet, mspOrg1, 'admin');

    console.log("Create fabric-initial-system successfully!!!");

  } catch (error) {
    console.error(`Failed to load network : ${error}`);
  }
};

export const InitializeNFT = async () => {

  const wallet = await buildWallet(Wallets, walletPath);
  const gateway = new Gateway();

  await gateway.connect(cppUser, {
    wallet,
    identity: String(userId),
    discovery: { enabled: true, asLocalhost: true },
  });

  const network = await gateway.getNetwork(channelName);
  const contract = network.getContract(chaincodeName);
  try {
    const nameKey = await contract.submitTransaction('Initialize', nameOrg, symbolOrg);
    console.log("InitializeNFT succsessfully!!!", nameKey);
    gateway.disconnect();
  } catch (err) {
    console.log("Error InitializeNFT,", err);
    gateway.disconnect();
  }
}

export const create_user = async (userId, role, req, res, next) => {
  try {
    // caClient
    const caURL = cppUser.certificateAuthorities["ca.org1.example.com"].url;

    // const caClient = new FabricCAServices(caURL);
    const caClient = buildCAClient(
      FabricCAServices,
      cppUser,
      "ca.org1.example.com",
    );

    //wallet
    const wallet = await Wallets.newFileSystemWallet(process.env.wallet);

    const publickey = registerAndEnrollUser(caClient, wallet, mspOrg1, userId, "org1.CNTT&TT", role);
    return publickey;
  } catch (error) {
    console.error(`Failed create new user with error: ${error}`);
  }
};
