use solana_program::{
    entrypoint::ProgramResult,
    program_error::ProgramError,
};

use crate::errors::StreamError::InvalidInstruction;
use std::convert::TryInto;
pub struct StreamInstruction {}

impl StreamInstruction {

    pub fn unpack_init_instruction(input: &[u8]) -> Result<(u64, u64, u64), ProgramError> {
    
        // let deposit_amount = extract_u64(input.get(..8).unwrap()).unwrap();
        let deposit_amount = input
            .get(..8)
            .and_then(|slice| slice.try_into().ok())
            .map(u64::from_le_bytes)
            .ok_or(InvalidInstruction)?;
        
        let start_time = input
            .get(8..16)
            .and_then(|slice| slice.try_into().ok())
            .map(u64::from_le_bytes)
            .ok_or(InvalidInstruction)?;
    
        let end_time = input
            .get(16..24)
            .and_then(|slice| slice.try_into().ok())
            .map(u64::from_le_bytes)
            .ok_or(InvalidInstruction)?;
    
        Ok((deposit_amount, start_time, end_time))
    }
    
    pub fn unpack_withdraw_instruction(input: &[u8]) -> Result<u64, ProgramError> {
        
        let withdraw_amount = input
            .get(..8)
            .and_then(|slice| slice.try_into().ok())
            .map(u64::from_le_bytes)
            .ok_or(InvalidInstruction)?;
    
        Ok(withdraw_amount)
    }
}