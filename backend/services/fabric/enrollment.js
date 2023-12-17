/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const adminUserId = "admin";
const adminUserPasswd = "adminpw";

/**
 *
 * @param {*} FabricCAServices
 * @param {*} ccp
 */
export const buildCAClient = (FabricCAServices, ccp, caHostName) => {
  // Create a new CA client for interacting with the CA.
  const caInfo = ccp.certificateAuthorities[caHostName]; //lookup CA details from config
  const caTLSCACerts = caInfo.tlsCACerts.pem;
  const caClient = new FabricCAServices(
    caInfo.url,
    { trustedRoots: caTLSCACerts, verify: false },
    caInfo.caName,
  );

  console.log(`Built a CA Client named ${caInfo.caName}`);
  return caClient;
};

export const enrollAdmin = async (caClient, wallet, orgMspId) => {
  try {
    // Check to see if we've already enrolled the admin user.
    const identity = await wallet.get(adminUserId);
    if (identity) {
      console.log(
        "An identity for the admin user already exists in the wallet",
      );
      return;
    }

    // Enroll the admin user, and import the new identity into the wallet.
    const enrollment = await caClient.enroll({
      enrollmentID: adminUserId,
      enrollmentSecret: adminUserPasswd,
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: orgMspId,
      type: "X.509",
    };
    await wallet.put(adminUserId, x509Identity);
    console.log(
      "Successfully enrolled admin user and imported it into the wallet",
    );
  } catch (error) {
    console.error(`Failed to enroll admin user : ${error}`);
  }
};

export const registerAndEnrollUser = async (
  caClient,
  wallet,
  orgMspId,
  userId,
  affiliation,
  role
) => {
  try {
    // Check to see if we've already enrolled the user
    const userIdentity = await wallet.get(userId);
    if (userIdentity) {
      console.log(
        `An identity for the user ${userId} already exists in the wallet`,
      );
      return;
    }

    // Must use an admin to register a new user
    const adminIdentity = await wallet.get(adminUserId);
    if (!adminIdentity) {
      console.log(
        "An identity for the admin user does not exist in the wallet",
      );
      console.log("Enroll the admin user before retrying");
      return;
    }
    // build a user object for authenticating with the CA
    const provider = wallet
      .getProviderRegistry()
      .getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, adminUserId);

    // Register the user, enroll the user, and import the new identity into the wallet.
    // if affiliation is specified by client, the affiliation value must be configured in CA
    const secret = await caClient.register(
      {
        // affiliation: affiliation,
        // affiliation: "org1.department1",
        affiliation: "org1.CNTT&TT",
        enrollmentID: userId,
        role: "client", attrs: [{ name: 'role', value: role, ecert: true }]
      },
      adminUser,
    );

    const enrollment = await caClient.enroll({
      enrollmentID: userId,
      enrollmentSecret: secret,
    });
    const x509Identity = {
      credentials: {
        certificate: enrollment.certificate,
        privateKey: enrollment.key.toBytes(),
      },
      mspId: orgMspId,
      type: "X.509",
    };
    await wallet.put(userId, x509Identity);
    // console.log("enrollment key is:", enrollment);
    // console.log("Public key is:", enrollment.key._key.pubKeyHex);
    const publickey = enrollment.key._key.pubKeyHex;

    console.log(
      `Successfully registered and enrolled user ${userId} and imported it into the wallet`,
    );
    return publickey;
    // let userKeys = await walletUtils.createNewWalletEntity(enrollment, email);
    // logger.info(`Successfully registered and enrolled  user ${email} and imported it into the wallet`);
    // return userKeys;
  } catch (error) {
    console.error(`Failed to register user : ${error}`);
  }
};

export default { enrollAdmin, registerAndEnrollUser };
