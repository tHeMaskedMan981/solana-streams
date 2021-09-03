/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import os from 'os';
import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import {Keypair, Connection} from '@solana/web3.js';
import { account1, account2, solanastreams_keypair } from './config';

const KEY_PATH = path.resolve(__dirname, '../../keys');


export async function newAccountWithLamports(
  connection: Connection,
  lamports = 1000000,
): Promise<Keypair> {
  const keypair = Keypair.generate();
  const signature = await connection.requestAirdrop(
    keypair.publicKey,
    lamports,
  );
  await connection.confirmTransaction(signature);
  return keypair;
}

/**
 * @private
 */
async function getConfig(): Promise<any> {
  // Path to Solana CLI config file
  const CONFIG_FILE_PATH = path.resolve(
    os.homedir(),
    '.config',
    'solana',
    'cli',
    'config.yml',
  );
  const configYml = await fs.readFileSync(CONFIG_FILE_PATH, {encoding: 'utf8'});
  return yaml.parse(configYml);
}

/**
 * Load and parse the Solana CLI config file to determine which RPC url to use
 */
export async function getRpcUrl(): Promise<string> {
  try {
    const config = await getConfig();
    if (!config.json_rpc_url) throw new Error('Missing RPC URL');
    return config.json_rpc_url;
  } catch (err) {
    console.warn(
      'Failed to read RPC url from CLI config file, falling back to localhost',
    );
    return 'http://localhost:8899';
  }
}

/**
 * Load and parse the Solana CLI config file to determine which payer to use
 */
export async function getPayer(): Promise<Keypair> {
  return await getAccount1();
}

/**
 * Create a Keypair from a secret key stored in file as bytes' array
 */
export async function createKeypairFromFile(
  filePath: string,
): Promise<Keypair> {
  const secretKeyString = await fs.readFileSync(filePath, {encoding: 'utf8'});
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  return Keypair.fromSecretKey(secretKey);
}

export async function getAccount1(): Promise<Keypair> {

  return Keypair.fromSecretKey(Uint8Array.from(account1));
  // let key = await createKeypairFromFile(KEY_PATH+'/account1.json');
  // return key;
}

export async function getAccount2(): Promise<Keypair> {

  return Keypair.fromSecretKey(Uint8Array.from(account2));
}

// async function test() {

//   let file = fs.readFileSync('../../keys/account1.json', {encoding:"utf-8"});
//   console.log(file);

// }

// test();