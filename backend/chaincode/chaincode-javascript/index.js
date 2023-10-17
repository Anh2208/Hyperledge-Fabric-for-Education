/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 *
 * SPDX-License-Identifier: Apache-2.0
 */

"use strict";

const CC = require("./lib/asset_transfer_ledger_chaincode_store.js");

module.exports.CC = CC;
module.exports.contracts = [CC];
