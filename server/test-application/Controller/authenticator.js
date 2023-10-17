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

exports.registerAndEnrollStudent = async (
  caClient,
  wallet,
  orgMspId,
  userId,
  affiliation,
) => {
  try {
    // kiểm tra user được đăng ký có tồn tại trong wallet
    const userIdentity = await wallet.get(userId);
    if (userIdentity) {
      console.log(
        `An identity for the user ${userId} already exists in the wallet`,
      );
      return;
    }

    // Phải sử dụng admin để đăng ký
    const adminIdentity = await wallet.get(adminUserId);

    if (!adminIdentity) {
      console.log(
        "An identity for the admin user does not exist in the wallet",
      );
      console.log("Enroll the admin user before retrying");
      return;
    }

    // xây dựng đối tượng người dùng để xác thực với CA
    const provider = wallet
      .getProviderRegistry()
      .getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, adminUserId);

    //use user register
    let role = "Student";
    // if (userType === 'khoa') {
    //     role = 'khoa'; // Replace with the actual role for 'khoa'.
    // } else if (userType === 'giangvien') {
    //     role = 'giangvien'; // Replace with the actual role for 'giangvien'.
    // } else if (userType === 'sinhvien') {
    //     role = 'sinhvien'; // Replace with the actual role for 'sinhvien'.
    // }

    // Register the user, enroll the user, and import the new identity into the wallet.
    // if affiliation is specified by client, the affiliation value must be configured in CA
    const secret = await caClient.register(
      {
        affiliation: affiliation,
        enrollmentID: userId,
        role: role,
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
    console.log(
      `Successfully registered and enrolled user ${userId} and imported it into the wallet`,
    );
  } catch (error) {
    console.error(`Failed to register user Student: ${error}`);
  }
};
