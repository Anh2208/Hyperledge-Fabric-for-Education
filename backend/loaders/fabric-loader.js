import { Wallets } from "fabric-network";
import FabricCAServices from "fabric-ca-client";

import fs from "fs";
import dotenv from "dotenv";
import {
  buildCAClient,
  enrollAdmin,
  registerAndEnrollUser,
} from "../services/fabric/enrollment.js";
import { buildCCPOrg1, buildWallet } from "../services/fabric/AppUtil.js";
import path from "path";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const walletPath = path.join(__dirname, "wallet");

dotenv.config();
// const ccp = path.resolve(__dirname, '..', '..', '..', 'server', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
// const channelName = 'mychannel';
// const chaincodeName = 'ledger';
const mspOrg11 = "Org1MSP";
// const adminUserId = 'admin';
// const adminUserPasswd = 'adminpw';
// const userId = 'appUser';
// const affiliation = 'student'

// const cppUser =  JSON.parse(fs.readFileSync(process.env.ccpPATH, 'utf8'));

const loadNetwork = async (mspOrg1) => {
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

    await enrollAdmin(caClient, wallet, mspOrg1);
  } catch (error) {
    console.error(`Failed to load network : ${error}`);
  }
};

// const loadNetwork2 = async (req, res) => {

//     try {

//         // caClient
//         const caURL = cppUser.certificateAuthorities['ca.org1.example.com'].url;
//         const caClient = new FabricCAServices(caURL);

//         //wallet
//         const wallet = await Wallets.newFileSystemWallet(process.env.wallet);

//         registerAndEnrollUser(caClient, wallet, mspOrg1, userId, 'org1.CNTT&TT' );

//     } catch (error) {
//         console.error(`Failed to load network hjhjhjhjhjhj: ${error}`);
//     }
// }

export default loadNetwork;
