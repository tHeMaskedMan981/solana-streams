
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;


/// Define the type of state stored in accounts
#[repr(C)]
#[derive(BorshSerialize, BorshDeserialize, PartialEq, Debug, Clone)]
pub struct Stream {
    /// number of greetings
    pub is_finalized: bool,
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub deposit_amount: u64,
    pub start_time: u64,
    pub end_time: u64,
    pub tokens_per_second: u64,
    pub withdrawed_amount: u64
}

impl  Stream {

    pub const LEN: usize = 105;
    pub fn is_finalized(&self) -> bool {
        
        self.is_finalized
    }
}
