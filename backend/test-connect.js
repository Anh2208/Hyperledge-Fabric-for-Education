// import Result from "../models/Result.js";

import { Wallets, Gateway } from "fabric-network";
import FabricCAServices from "fabric-ca-client";
import {
  enrollAdmin,
  buildCAClient,
  registerAndEnrollUser,
} from "./services/fabric/enrollment.js";
import { buildWallet, buildCCPOrg1 } from "./services/fabric/AppUtil.js";

import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const walletPath = path.join(__dirname, "wallet");

function prettyJSONString(inputString) {
  return JSON.stringify(JSON.parse(inputString), null, 2);
}

dotenv.config();
const userId = "appUser";
const channelName = "mychannel";
const chaincodeName = "ledger";
const mspOrg1 = "Org1MSP";
const cppUser = JSON.parse(fs.readFileSync(process.env.ccpPATH, "utf8"));
// create result
export const testConnect = async (req, res) => {
  // const newResult = new Result(req.body);

  try {
    const ccp = buildCCPOrg1();

    const caClient = buildCAClient(
      FabricCAServices,
      ccp,
      "ca.org1.example.com",
    );

    const wallet = await buildWallet(Wallets, walletPath);

    //

    const caURL = cppUser.certificateAuthorities["ca.org1.example.com"].url;

    const caClientt = new FabricCAServices(caURL);

    //wallet
    const wallett = await Wallets.newFileSystemWallet(process.env.wallet);

    const gateway = new Gateway();

    try {
      await gateway.connect(cppUser, {
        wallet,
        identity: String(userId),
        discovery: { enabled: true, asLocalhost: true },
      });

      const network = await gateway.getNetwork(channelName);

      const contract = network.getContract(chaincodeName);

      let result;

      console.log(
        "\n--> Submit Transaction: CreateResult, creates a new student with ID (B1906425)",
      );
      await contract.submitTransaction(
        "CreateResult",
        "B1906425",
        "3213213",
        "321313",
        "2",
        "2",
      );
      console.log("*** Result: committed");
      console.log(
        "\n--> Evaluate Transaction: ReadStudent, function returns updated information about a student with ID (student4)",
      );
      result = await contract.evaluateTransaction("ReadResult", "B1906425");
      console.log(`*** Result: `);
    } finally {
      console.log("End");

      gateway.disconnect();
      console.log("Test Success!!!");
    }
  } catch (err) {
    console.log(err);
  }
};
