import {
    PublicKey
  } from '@solana/web3.js';


export class StreamAccount {
    static LEN = 105;
  
    is_finalized: boolean;
    sender : PublicKey;
    recipient: PublicKey;
    deposit_amount: number;
    start_time: number;
    end_time: number;
    tokens_per_second: number;
    withdrawed_amount: number;
  
    constructor(fields: {
      is_finalized:boolean,
      sender:PublicKey, 
      recipient:PublicKey, 
      deposit_amount:number, 
      start_time: number, 
      end_time:number,
      tokens_per_second:number,
      withdrawed_amount:number
    }) {
  
      this.is_finalized = fields.is_finalized;
      this.sender = fields.sender;
      this.recipient = fields.recipient;
      this.deposit_amount = fields.deposit_amount;
      this.start_time = fields.start_time;
      this.end_time = fields.end_time;
      this.tokens_per_second = fields.tokens_per_second;
      this.withdrawed_amount = fields.withdrawed_amount;
    
    }
  }
  
  /**
   * Borsh schema definition for Stream accounts
   */
  export const StreamSchema = new Map([
    [StreamAccount, {kind: 'struct', 
    fields: [
      ['is_finalized', [1]],
      ['sender', [32]], 
      ['recipient', [32]], 
      ['deposit_amount', 'u64'], 
      ['start_time', 'u64'], 
      ['end_time', 'u64'],
      ['tokens_per_second', 'u64'],
      ['withdrawed_amount', 'u64']
    
    ]}],
  ]);
  
  /**
   * The expected size of each Stream account.
   */
  export const Stream_SIZE = 105;
  