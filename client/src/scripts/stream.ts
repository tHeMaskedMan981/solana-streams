/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// @ts-nocheck
import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
  AccountMeta,
  SYSVAR_CLOCK_PUBKEY
} from '@solana/web3.js';
import BN from "bn.js";
import fs from 'mz/fs';
import path from 'path';
import * as borsh from 'borsh';
import {StreamAccount, StreamSchema, Stream_SIZE} from './state';
import {
  getPayer,
  getRpcUrl,
  newAccountWithLamports,
  createKeypairFromFile,
  getAccount1,
  getAccount2
} from './utils'; 
import { account1, account2, solanastreams_keypair } from './config';


/**
 * Connection to the network
 */
let connection: Connection;

/**
 * Keypair associated to the fees' payer
 */
let payer: Keypair;

/**
 * Hello world's program id
 */
let programId: PublicKey;

/**
 * The public key of the account we are saying hello to
 */
let streamPubkey: PublicKey;

/**
 * Path to program files
 */
const PROGRAM_PATH = path.resolve(__dirname, '../../../dist/program');

/**
 * Path to program shared object file which should be deployed on chain.
 * This file is created when running either:
 *   - `npm run build:program-c`
 *   - `npm run build:program-rust`
 */
const PROGRAM_SO_PATH = path.join(PROGRAM_PATH, 'solanastreams.so');

/**
 * Path to the keypair of the deployed program.
 * This file is created when running `solana program deploy dist/program/solanastreams.so`
 */
const PROGRAM_KEYPAIR_PATH = path.join(PROGRAM_PATH, 'solanastreams-keypair.json');

/**
 * The state of a Stream account managed by the hello world program
 */


console.log("Stream size: ", Stream_SIZE);
/**
 * Establish a connection to the cluster
 */
export async function establishConnection(): Promise<void> {
  const rpcUrl = await getRpcUrl();
  connection = new Connection(rpcUrl, 'confirmed');
  const version = await connection.getVersion();
  console.log('Connection to cluster established:', rpcUrl, version);
}

/**
 * Establish an account to pay for everything
 */
export async function establishPayer(): Promise<void> {
      payer = await getPayer();
}

/**
 * Check if the hello world BPF program has been deployed
 */
export async function checkProgram(): Promise<void> {
  // Read program id from keypair file
  try {

    const programKeypair = Keypair.fromSecretKey(Uint8Array.from(solanastreams_keypair));
    //  await createKeypairFromFile(PROGRAM_KEYPAIR_PATH);
    programId = programKeypair.publicKey;
  } catch (err) {
    const errMsg = (err as Error).message;
    throw new Error(
      `Failed to read program keypair at '${PROGRAM_KEYPAIR_PATH}' due to error: ${errMsg}. Program may need to be deployed with \`solana program deploy dist/program/solanastreams.so\``,
    );
  }

  // Check if the program has been deployed
  const programInfo = await connection.getAccountInfo(programId);
  // console.log("program Info : ", programInfo);
  // if (programInfo === null) {
  //   if (fs.existsSync(PROGRAM_SO_PATH)) {
  //     throw new Error(
  //       'Program needs to be deployed with `solana program deploy dist/program/solanastreams.so`',
  //     );
  //   } else {
  //     throw new Error('Program needs to be built and deployed');
  //   }
  // } else if (!programInfo.executable) {
  //   throw new Error(`Program is not executable`);
  // }
  console.log(`Using program ${programId.toBase58()}`);

  // Derive the address (public key) of a Stream account from the program so that it's easy to find later.
  const STREAM_SEED = 'stream';
  streamPubkey = await PublicKey.createWithSeed(
    payer.publicKey,
    STREAM_SEED,
    programId,
  );
  
  console.log("using stream account : ", streamPubkey.toBase58());
  // Check if the Stream account has already been created
  const streamAccount = await connection.getAccountInfo(streamPubkey);
  // console.log("streamAccount info : ", streamAccount);
  if (streamAccount === null) {
    console.log(
      'Creating account',
      streamPubkey.toBase58(),
      'to say hello to',
    );
    const lamports = await connection.getMinimumBalanceForRentExemption(
      Stream_SIZE,
    );

    console.log("stream account : ", streamPubkey.toBase58(), "Stream size : ", Stream_SIZE);
    const transaction = new Transaction().add(
      SystemProgram.createAccountWithSeed({
        fromPubkey: payer.publicKey,
        basePubkey: payer.publicKey,
        seed: STREAM_SEED,
        newAccountPubkey: streamPubkey,
        lamports,
        space: Stream_SIZE,
        programId,
      }),
    );
    await sendAndConfirmTransaction(connection, transaction, [payer]);
  }
}

/**
 * Initialize Stream
 */

export async function setup() {
  
  await establishConnection();
  await establishPayer();
  await checkProgram();
}

export async function initStream(_deposit_amount: number, duration: number): Promise<any> {

  await setup();
  const start_time = Math.floor(Date.now()/1000);
  const end_time = start_time + Number(duration);
  const deposit_amount = _deposit_amount*1000000000;
  
  const sender = await getAccount1();
  const recipient = await getAccount2();

  console.log(
    'sender : ', 
    sender.publicKey.toBase58(), 
    " recipient : ", 
    recipient.publicKey.toBase58(),
    'stream account : ',
    streamPubkey.toBase58()
  );

  const instruction = new TransactionInstruction({
    keys: [
      {pubkey: streamPubkey, isSigner: false, isWritable: true}, 
      {pubkey: sender.publicKey, isSigner: false, isWritable: true},
      {pubkey: recipient.publicKey, isSigner: false, isWritable: true}, 
      {pubkey:SYSVAR_CLOCK_PUBKEY, isSigner:false, isWritable: false}
    ],
    programId,
    data: Buffer.from(Uint8Array.of
      (0, 
      ...new BN(deposit_amount).toArray("le", 8),
      ...new BN(start_time).toArray("le", 8),
      ...new BN(end_time).toArray("le", 8)
      )), // All instructions are hellos
  });
  let result = await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [payer],
  );

  console.log("streaming txn : ", result);
  return result;

}

/**
 * Withdraw from stream
 */
export async function withdraw(withdraw_amount): Promise<void> {

  await setup();
  withdraw_amount = Number(withdraw_amount);
  const recipient = await getAccount2();

  console.log('withdraw amount : ', withdraw_amount);
  const instruction = new TransactionInstruction({
    keys: [
      {pubkey: streamPubkey, isSigner: false, isWritable: true}, 
      {pubkey: recipient.publicKey, isSigner: false, isWritable: true}, 
      {pubkey:SYSVAR_CLOCK_PUBKEY, isSigner:false, isWritable: false}
    ],
    programId,
    data: Buffer.from(Uint8Array.of
      (1, 
      ...new BN(withdraw_amount).toArray("le", 8)
      )), // All instructions are hellos
  });
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [payer],
  );
}


/**
 * Close the stream
 */
 export async function closeStream(): Promise<void> {

  await setup();
  const sender = await getAccount1();
  const recipient = await getAccount2();

  console.log(' closing the stream ');
  const instruction = new TransactionInstruction({
    keys: [
      {pubkey: streamPubkey, isSigner: false, isWritable: true}, 
      {pubkey: sender.publicKey, isSigner: true, isWritable: true},
      {pubkey: recipient.publicKey, isSigner: false, isWritable: true}, 
      {pubkey:SYSVAR_CLOCK_PUBKEY, isSigner:false, isWritable: false}
    ],
    programId,
    data: Buffer.from(Uint8Array.of
      (2
      )), // All instructions are hellos
  });
  await sendAndConfirmTransaction(
    connection,
    new Transaction().add(instruction),
    [payer],
  );
}

// export async function transferLamports() {

//   await setup();

// }

/**
 * Report the number of times the greeted account has been said hello to
 */
export async function getStream(): Promise<any> {
  await setup();
  const accountInfo = await connection.getAccountInfo(streamPubkey);
  if (accountInfo === null) {
    throw 'Error: cannot find the greeted account';
  }
  console.log("account info data : ", accountInfo.lamports);
  const Stream = borsh.deserialize(
    StreamSchema,
    StreamAccount,
    accountInfo.data,
  );

  let streamobj = {
    is_finalized: Boolean(Stream.is_finalized),
    sender:  (new PublicKey(Stream.sender)).toBase58(),
    recipient: (new PublicKey(Stream.recipient)).toBase58(),
    deposit_amount:  Stream.deposit_amount.toString(), 
    start_time:  Stream.start_time.toString(),
    end_time:  Stream.end_time.toString(),
    tokens_per_second: Stream.tokens_per_second.toString(),
    withdrawed_amount: Stream.withdrawed_amount.toString()
  }
  return streamobj;
}


export async function getLamportsBalance (publicKey: PublicKey) : Promise<number | undefined> {

  await establishConnection();
  return (await connection.getAccountInfo(publicKey))?.lamports;
}

export async function getRecipientWithdrawableBalance () : Promise<BN> {

  let stream = await getStream();
  let current_timestamp = new BN(Math.floor(Date.now()/1000));
  let start_time = new BN(stream.start_time);
  let tokens_per_second = new BN(stream.tokens_per_second);
  let withdrawed_amount = new BN(stream.withdrawed_amount);
  return ((current_timestamp.sub(start_time)).mul(tokens_per_second)).sub(withdrawed_amount);
  
}

export async function getSenderWithdrawableBalance () : Promise<BN> {

  let stream = await getStream();
  let current_timestamp = new BN(Math.floor(Date.now()/1000));
  let end_time = new BN(stream.end_time);
  let tokens_per_second = new BN(stream.tokens_per_second);
  return ((end_time.sub(current_timestamp)).mul(tokens_per_second));
  
}

export function getProgramId() {
  return programId;
}

export function getStreamAccount() {
  return streamPubkey;
}