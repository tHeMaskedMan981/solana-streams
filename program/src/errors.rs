use thiserror::Error;

use solana_program::program_error::ProgramError;


#[derive(Error, Debug, Copy, Clone)]
pub enum StreamError {
    /// Invalid instruction
    #[error("Invalid Instruction")]
    InvalidInstruction,
    /// Not Rent Exempt
    #[error("Not Rent Exempt")]
    NotRentExempt,
    /// Expected Amount Mismatch
    #[error("Expected Amount Mismatch")]
    ExpectedAmountMismatch,
    /// Amount Overflow
    #[error("Withdraw Amount Overflow")]
    WithdrawAmountOverflow,
    /// Aleardy in Use
    #[error("Already In Use")]
    AlreadyInUse,

    /// Aleardy in Use
    #[error("Insufficient Deposit")]
    InsufficientDeposit,
}

impl From<StreamError> for ProgramError {
    fn from(e: StreamError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
