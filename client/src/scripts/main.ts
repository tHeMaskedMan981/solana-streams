/**
 * Hello world
 */

import {
  establishConnection,
  establishPayer,
  checkProgram,
  initStream,
  withdraw,
  getStream,
  getRecipientWithdrawableBalance,
  getSenderWithdrawableBalance
} from './stream';

async function main() {
  console.log("Let's say hello to a Solana account...");

  // Establish connection to the cluster
  await establishConnection();

  // Determine who pays for the fees
  await establishPayer();

  // Check if the program has been deployed
  await checkProgram();

  // Say hello to an account
  // await initStream();

  
  console.log(await getStream());

  await withdraw(1000);
  // Find out how many times that account has been greeted
  console.log(await getStream());
  let recipientWithdrawableBalance = await getRecipientWithdrawableBalance();
  console.log("remaining recipient balance : ", recipientWithdrawableBalance.toString());

  let senderWithdrawableBalance = await getSenderWithdrawableBalance();
  console.log("remaining sender balance : ", senderWithdrawableBalance.toString())
  console.log('Success');
  
}

main().then(
  () => process.exit(),
  err => {
    console.error(err);
    process.exit(-1);
  },
);
