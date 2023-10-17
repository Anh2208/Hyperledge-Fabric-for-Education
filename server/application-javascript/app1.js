// 'use strict';

// const { Gateway, Wallets } = require('fabric-network');
// const FabricCAServices = require('fabric-ca-client');
// const path = require('path');
// const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('../test-application/javascript/CAUtil.js');
// const { buildCCPOrg1, buildWallet } = require('../test-application/javascript/AppUtil.js');
// const {registerAndEnrollStudent} = require('../test-application/Controller/authenticator.js')

// const channelName = 'mychannel';
// const chaincodeName = 'ledger';
// const mspOrg1 = 'Org1MSP';

// const walletPath = path.join(__dirname, 'wallet');
// const userId = 'appUser';
// const studentId = "B1906425"

// function prettyJSONString(inputString) {
//     return JSON.stringify(JSON.parse(inputString), null, 2);
// }

// async function main() {
//     let skipInit = false;
//     if (process.argv.length > 2) {
//         if (process.argv[2] === 'skipInit') {
//             skipInit = true;
//         }
//     }

//     try {
//         const ccp = buildCCPOrg1();

//         const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');

//         const wallet = await buildWallet(Wallets, walletPath);

//         await enrollAdmin(caClient, wallet, mspOrg1);

//         await registerAndEnrollUser(caClient, wallet, mspOrg1, userId, 'org1.department1');

//         await registerAndEnrollStudent(caClient, wallet, mspOrg1, studentId, 'org1.department1');

//         const gateway = new Gateway();

//         try {
//             await gateway.connect(ccp, {
//                 wallet,
//                 identity: userId,
//                 discovery: { enabled: true, asLocalhost: true }
//             });

//             const network = await gateway.getNetwork(channelName);

//             const contract = network.getContract(chaincodeName);

//             if (!skipInit) {
//                 try {
//                     console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger');
//                     await contract.submitTransaction('InitLedger');
//                     console.log('*** Result: committed');
//                 } catch (initError) {
//                     console.log(`******** initLedger failed :: ${initError}`);
//                 }
//             } else {
//                 console.log('*** not executing "InitLedger"');
//             }

//             let result;

//             console.log('\n--> Evaluate Transaction: GetAllStudents, function returns all students');
//             result = await contract.evaluateTransaction('GetAllStudents');
//             console.log(`*** Result: ${prettyJSONString(result.toString())}`);

//             //end test basic

//             // console.log('\n--> Submit Transaction: CreateStudent, creates a new student with ID (B1906425)');
//             // await contract.submitTransaction('CreateStudent', 'B1906425', 'Ronaldo', '21', '789 Elm St');
//             // console.log('*** Result: committed');

//             // console.log('\n--> Evaluate Transaction: ReadStudent, function returns information about a student with ID (B1906425)');
//             // result = await contract.evaluateTransaction('ReadStudent', 'B1906425');
//             // console.log(`*** Result: ${prettyJSONString(result.toString())}`);

//             // console.log('\n--> Submit Transaction: UpdateStudent, updates information about a student with ID (B1906425)');
//             // await contract.submitTransaction('UpdateStudent', 'B1906425', 'David Beck ', '2123', '789 Elm St');
//             // console.log('*** Result: committed');

//             // console.log('\n--> Evaluate Transaction: GetAllStudents, function returns all students');
//             // result = await contract.evaluateTransaction('GetAllStudents');

//             // console.log('\n--> Evaluate Transaction: ReadStudent, function returns updated information about a student with ID (student4)');
//             // result = await contract.evaluateTransaction('ReadStudent', 'B1906425');
//             // console.log(`*** Result: ${prettyJSONString(result.toString())}`);

//             // console.log('\n--> Submit Transaction: DeleteStudent, deletes a student with ID (student4)');
//             // await contract.submitTransaction('DeleteStudent', 'B1906425');
//             // console.log('*** Result: committed');

//             // console.log('\n--> Evaluate Transaction: GetAllStudents, function returns all students');
//             // result = await contract.evaluateTransaction('GetAllStudents');
//             // console.log(`*** Result: ${prettyJSONString(result.toString())}`);
//         } finally {
//             gateway.disconnect();
//         }
//     } catch (error) {
//         console.error(`******** FAILED to run the application: ${error}`);
//     }
// }

// main().then(() => {
//     console.log('*** Application finished successfully');
// }).catch((error) => {
//     console.error(`******** Failed to run the application: ${error}`);
// });

"use strict";

const { Gateway, Wallets } = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");
const path = require("path");
const {
  buildCAClient,
  registerAndEnrollUser,
  enrollAdmin,
} = require("../test-application/javascript/CAUtil.js");
const {
  buildCCPOrg1,
  buildWallet,
} = require("../test-application/javascript/AppUtil.js");
const {
  registerAndEnrollStudent,
} = require("../test-application/Controller/authenticator.js");

const channelName = "mychannel";
const chaincodeName = "ledger";
const mspOrg1 = "Org1MSP";

const walletPath = path.join(__dirname, "wallet");
const userId = "appUser";
const studentId = "B1906425";

function prettyJSONString(inputString) {
  return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function main() {
  let skipInit = false;
  if (process.argv.length > 2) {
    if (process.argv[2] === "skipInit") {
      skipInit = true;
    }
  }

  try {
    const ccp = buildCCPOrg1();

    const caClient = buildCAClient(
      FabricCAServices,
      ccp,
      "ca.org1.example.com",
    );

    const wallet = await buildWallet(Wallets, walletPath);

    await enrollAdmin(caClient, wallet, mspOrg1);

    await registerAndEnrollUser(
      caClient,
      wallet,
      mspOrg1,
      userId,
      "org1.department1",
    );

    await registerAndEnrollStudent(
      caClient,
      wallet,
      mspOrg1,
      studentId,
      "org1.department1",
    );

    const gateway = new Gateway();

    try {
      await gateway.connect(ccp, {
        wallet,
        identity: userId,
        discovery: { enabled: true, asLocalhost: true },
      });

      const network = await gateway.getNetwork(channelName);

      const contract = network.getContract(chaincodeName);

      if (!skipInit) {
        try {
          console.log(
            "\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger",
          );
          await contract.submitTransaction("InitLedger");
          console.log("*** Result: committed");
        } catch (initError) {
          console.log(`******** initLedger failed :: ${initError}`);
        }
      } else {
        console.log('*** not executing "InitLedger"');
      }

      let result;

      console.log(
        "\n--> Evaluate Transaction: GetAllStudents, function returns all students",
      );
      result = await contract.evaluateTransaction("GetAllStudents");
      console.log(`*** Result: ${prettyJSONString(result.toString())}`);

      // console.log('\n--> Submit Transaction: CreateStudent, creates a new student with ID (B1906425)');
      // await contract.submitTransaction('CreateStudent', 'B1906425', 'Ronaldo', '21', '789 Elm St');
      // console.log('*** Result: committed');

      // console.log('\n--> Evaluate Transaction: ReadStudent, function returns information about a student with ID (B1906425)');
      // result = await contract.evaluateTransaction('ReadStudent', 'B1906425');
      // console.log(`*** Result: ${prettyJSONString(result.toString())}`);

      // console.log('\n--> Submit Transaction: UpdateStudent, updates information about a student with ID (B1906425)');
      // await contract.submitTransaction('UpdateStudent', 'B1906425', 'David Beck ', '2123', '789 Elm St');
      // console.log('*** Result: committed');

      // console.log('\n--> Evaluate Transaction: GetAllStudents, function returns all students');
      // result = await contract.evaluateTransaction('GetAllStudents');

      // console.log('\n--> Evaluate Transaction: ReadStudent, function returns updated information about a student with ID (student4)');
      // result = await contract.evaluateTransaction('ReadStudent', 'B1906425');
      // console.log(`*** Result: ${prettyJSONString(result.toString())}`);

      // console.log('\n--> Submit Transaction: DeleteStudent, deletes a student with ID (student4)');
      // await contract.submitTransaction('DeleteStudent', 'B1906425');
      // console.log('*** Result: committed');

      // console.log('\n--> Evaluate Transaction: GetAllStudents, function returns all students');
      // result = await contract.evaluateTransaction('GetAllStudents');
      // console.log(`*** Result: ${prettyJSONString(result.toString())}`);
    } finally {
      gateway.disconnect();
    }
  } catch (error) {
    console.error(`******** FAILED to run the application: ${error}`);
  }
}

main()
  .then(() => {
    console.log("*** Application finished successfully");
  })
  .catch((error) => {
    console.error(`******** Failed to run the application: ${error}`);
  });
