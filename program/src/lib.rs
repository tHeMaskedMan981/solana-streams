use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    msg,
    entrypoint::ProgramResult,
    program_error::ProgramError,
    pubkey::Pubkey,
    clock::{Clock},
    sysvar::Sysvar
};


pub mod errors;
pub mod instruction;
pub mod state;

use crate::{
    errors::StreamError::InvalidInstruction,
    errors::StreamError,
    instruction::StreamInstruction,
    state::Stream
};

// Declare and export the program's entrypoint
entrypoint!(process_instruction);



// Program entrypoint's implementation
pub fn process_instruction(
    program_id: &Pubkey, // Public key of the account the streams program was loaded into
    accounts: &[AccountInfo], // The accounts required in the transaction
    instruction_data: &[u8], 
) -> ProgramResult {
    msg!("Hello World Rust program entrypoint");

    let (tag, rest) = instruction_data.split_first().ok_or(InvalidInstruction)?;

        Ok(match tag {
            // Init stream
            0 => {
                let (deposit_amount, start_time, end_time) = StreamInstruction::unpack_init_instruction(rest)?;
                init_stream(program_id, accounts, deposit_amount, start_time, end_time);
            },
            // Withdraw money
            1 => {
                let withdraw_amount = StreamInstruction::unpack_withdraw_instruction(rest)?;
                withdraw(program_id, accounts, withdraw_amount);
            },
            // Close stream
            2 => {
                close_stream(program_id, accounts);
            },
            _ => return Err(InvalidInstruction.into()),
        })
    
}


// Create stream 
pub fn init_stream(
    program_id: &Pubkey, 
    accounts: &[AccountInfo], 
    deposit_amount: u64, 
    start_time: u64, 
    end_time: u64
) -> Result<(), ProgramError> {

    
    // Iterating accounts is safer then indexing
    let accounts_iter = &mut accounts.iter();

    // Get the accounts
    let stream_account_info = next_account_info(accounts_iter)?;
    let sender = next_account_info(accounts_iter)?;
    let recipient = next_account_info(accounts_iter)?;
    let clock_info = next_account_info(accounts_iter)?;
    let clock = &Clock::from_account_info(clock_info)?;

    // The account must be owned by the program in order to modify its data
    if stream_account_info.owner != program_id {
        msg!("Greeted account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    // Check if deposit amount is enough
    if deposit_amount > stream_account_info.lamports() {
        msg!("Deposited amount not enough");
        return Err(StreamError::InsufficientDeposit.into());
    }


    msg!("current balance of stream account : {}", stream_account_info.lamports());
    

    // get stream object
    let mut stream = Stream::try_from_slice(&stream_account_info.data.borrow())?;
    
    stream.is_finalized = false;
    stream.sender = *sender.key;
    stream.recipient = *recipient.key;
    stream.start_time = start_time;
    stream.end_time = end_time;
    stream.deposit_amount = deposit_amount;
    stream.tokens_per_second = deposit_amount/(end_time-start_time);
    stream.withdrawed_amount = 0;

    msg!(" stream data : {:?}", stream);
    stream.serialize(&mut &mut stream_account_info.data.borrow_mut()[..])?;

    Ok(())

}


// Withdraw money from the stream
pub fn withdraw(
    program_id: &Pubkey, 
    accounts: &[AccountInfo], 
    withdraw_amount: u64
) -> Result<(), ProgramError> {

    // Iterating accounts is safer then indexing
    let accounts_iter = &mut accounts.iter();

    // Get the accounts
    let stream_account_info = next_account_info(accounts_iter)?;
    let recipient = next_account_info(accounts_iter)?;
    let clock_info = next_account_info(accounts_iter)?;
    let clock = &Clock::from_account_info(clock_info)?;

    if stream_account_info.owner != program_id {
        msg!("Greeted account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    let mut stream = Stream::try_from_slice(&stream_account_info.data.borrow())?;
    msg!(" stream data : {:?}", stream);

    if stream.is_finalized {
        msg!("stream already finalized. Cannot withdraw further");
        return Err(StreamError::InvalidInstruction.into());
    }

    let time_delta: u64;
    if (clock.unix_timestamp as u64) > stream.end_time {
        stream.is_finalized = true;
        time_delta = stream.end_time - stream.start_time;
    } else {
        time_delta = (clock.unix_timestamp as u64)-stream.start_time;
    }
    
    let current_recipient_balance = time_delta*stream.tokens_per_second - stream.withdrawed_amount;
    msg!("current available recipient balance : {} ", current_recipient_balance);

    if withdraw_amount > current_recipient_balance {
        msg!("Not enough recipient balance");
        return Err(StreamError::WithdrawAmountOverflow.into());
    }

    msg!("stream account balance : {}, recipient balance: {} ",
    stream_account_info.lamports(), recipient.lamports());

    **stream_account_info.try_borrow_mut_lamports()? -= withdraw_amount;
    // Deposit lamports into the destination
    **recipient.try_borrow_mut_lamports()? += withdraw_amount;

    stream.withdrawed_amount += withdraw_amount;
    
    msg!("stream account balance : {}, recipient balance: {} ",
    stream_account_info.lamports(), recipient.lamports());

    // sol_log_slice(instruction_data);
    msg!(" stream data : {:?}", stream);
    // stream_account.end_time = 1630356175492;
    stream.serialize(&mut &mut stream_account_info.data.borrow_mut()[..])?;

    // msg!("data stored - start time :  {}, end t", stream.withdrawed_amount);

    Ok(())

}

// Close stream
pub fn close_stream(
    program_id: &Pubkey, 
    accounts: &[AccountInfo], 
) -> Result<(), ProgramError> {

    // Iterating acco   unts is safer then indexing
    let accounts_iter = &mut accounts.iter();

    // Get the account to say hello to
    let stream_account_info = next_account_info(accounts_iter)?;
    let sender = next_account_info(accounts_iter)?;
    let recipient = next_account_info(accounts_iter)?;
    let clock_info = next_account_info(accounts_iter)?;
    let clock = &Clock::from_account_info(clock_info)?;

    msg!("current timestamp : {}, {}", clock.slot, clock.unix_timestamp);
    // The account must be owned by the program in order to modify its data
    if stream_account_info.owner != program_id {
        msg!("Greeted account does not have the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    }

    // Increment and store the number of times the account has been greeted
    let mut stream = Stream::try_from_slice(&stream_account_info.data.borrow())?;
    msg!(" stream data : {:?}", stream);

    if (clock.unix_timestamp as u64) > stream.end_time {
        msg!("cannot cancel stream. stream duration is over");
        return Err(StreamError::InvalidInstruction.into());
    }

    let time_delta: u64 = (clock.unix_timestamp as u64)-stream.start_time;
    let current_sender_balance = stream.deposit_amount - time_delta*stream.tokens_per_second;
    let current_recipient_balance = time_delta*stream.tokens_per_second - stream.withdrawed_amount;
    msg!("current available recipient balance : {} ", current_recipient_balance);
    msg!("current available sender balance : {} ", current_sender_balance);

    msg!("stream account balance : {}, recipient balance: {} ",
    stream_account_info.lamports(), recipient.lamports());

    **stream_account_info.try_borrow_mut_lamports()? -= current_sender_balance + current_recipient_balance;
    // Deposit five lamports into the destination
    **recipient.try_borrow_mut_lamports()? += current_recipient_balance;
    **sender.try_borrow_mut_lamports()? += current_sender_balance;

    stream.withdrawed_amount += current_recipient_balance;
    stream.is_finalized = true;
    stream.deposit_amount = 0;
    
    msg!("stream account balance : {}, recipient balance: {} ",
    stream_account_info.lamports(), recipient.lamports());
    
    // sol_log_slice(instruction_data);
    msg!(" stream data : {:?}", stream);
    // stream_account.end_time = 1630356175492;
    stream.serialize(&mut &mut stream_account_info.data.borrow_mut()[..])?;

    Ok(())

}
