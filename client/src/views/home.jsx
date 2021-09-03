
import React, { useEffect } from "react";
import {useState} from 'react';
import Swal from 'sweetalert2'
import { getAccount1, getAccount2 } from "../scripts/utils";
import {getStream, initStream,getProgramId, 
  getStreamAccount, closeStream, withdraw, getLamportsBalance, setup} from '../scripts/stream';
import {
  Header, Container, Segment, Dimmer, Loader, Image,
  Divider, Button, Form, Menu, Input,Table,
  GridColumn,
  Icon
} from "semantic-ui-react";
import Logo  from '../images/logo.png';
import BN from "bn.js";
import Stream from './stream';

export const HomeView = () => {
  const [solBalance, setSolBalance] = useState(0);
  const [address, setAddress] = useState("");
  const [keyPair, setKeyPair] = useState(null);
  const [programId, setProgramId] = useState('');
  const [streamAccount, setStreamAccount] = useState('');
  const [tab, setTab] = useState('deposit');
  const [account, setAccount] = useState('account1');
  const [deposit, setDeposit] = useState(0);
  const [duration, setDuration] = useState(0);
  const [recipient, setRecipient] = useState('');
  const [stream, setStream] = useState({deposit_amount:'0'});
  const [senderBalance, setSenderBalance] = useState(0);
  const [recipientBalance, setRecipientBalance] = useState(0);
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [loader, setLoader] = useState(false)

  let changeAccount = async (account) => {
    let keyPair;
    if (account==='account1'){
      keyPair = (await getAccount1());
    } else if (account==='account2') {
      keyPair = (await getAccount2());
    }
    setAccount(account);
    setKeyPair(keyPair);
    setAddress(keyPair.publicKey.toBase58());
    let balance = await getLamportsBalance(keyPair.publicKey);
    if (balance==undefined) 
    { console.log('balance undefined'); setSolBalance(0);}
    else setSolBalance(balance);

  } 

  let refreshBalances = async () => {

    let sender_balance = await getSenderWithdrawableBalance();
    console.log("sender balance : ", sender_balance);
    setSenderBalance(sender_balance);

    let recipient_balance = await getRecipientWithdrawableBalance();
    console.log("recipient balance : ", recipient_balance);
    setRecipientBalance(recipient_balance);

    let balance = await getLamportsBalance(keyPair.publicKey);
    if (balance==undefined) 
    { console.log('balance undefined'); setSolBalance(0);}
    else setSolBalance(balance);

  }

  useEffect(() => {
    const refreshTotal = async () => {
      await setup();
      let programId = getProgramId();
      let streamAccount = getStreamAccount();
      setProgramId(programId.toBase58());
      setStreamAccount(streamAccount.toBase58());

      await changeAccount('account1');
      let stream = await getStream();
      console.log("stream : ", stream);
      setStream(stream);
      console.log(stream);

    };

    refreshTotal();

    return () => {

    };
  }, [
  ]);
  let handleCreateStream = async () => {
    setLoader(true);
    console.log("creating stream ...")
    let tx = await initStream(deposit, duration);
    console.log("create stream tx : ", tx);
    let stream = await getStream();
    console.log("stream : ", stream);
    setStream(stream);
    await refreshBalances();
    setLoader(false);
    Swal.fire({
      title: 'Success!',
      text: 'Stream created successfully',
      icon: 'success',
      confirmButtonText: 'Close'
    })
  }

  let handleWithdraw = async () => {
    setLoader(true);
    console.log("withdrawing money from stream ...")
    let tx = await withdraw(withdrawAmount);
    console.log( " withdraw tx : ", tx);
    let stream = await getStream();
    console.log("stream : ", stream);
    setStream(stream);
    await refreshBalances();
    setLoader(false);
    Swal.fire({
      title: 'Success!',
      text: 'Tokens withdrawn successfully',
      icon: 'success',
      confirmButtonText: 'Close'
    })

  }

  let handleCloseStream = async () => {
    setLoader(true);
    console.log("closing stream ...")
    let tx = await closeStream();
    console.log("close stream tx : ", tx);
    let stream = await getStream();
    console.log("stream : ", stream);
    setStream(stream);
    await refreshBalances();
    setLoader(false);
    Swal.fire({
      title: 'Success!',
      text: 'Stream closed successfully',
      icon: 'success',
      confirmButtonText: 'Close'
    })

  }
 
  async function getSenderWithdrawableBalance () {

    let stream = await getStream();
    console.log(stream);
    // if (stream.is_finalized) return 0;
    let current_timestamp = new BN(Math.floor(Date.now()/1000));
    let end_time = new BN(Number(stream.end_time));
    console.log(end_time.toString());
    let tokens_per_second = new BN(Number(stream.tokens_per_second));
    console.log(tokens_per_second.toString());
    if (end_time.lte(current_timestamp)) return 0;
    return ((end_time.sub(current_timestamp)).mul(tokens_per_second)).toString();
    
  }

  async function getRecipientWithdrawableBalance () {

    let stream = await getStream();
    let current_timestamp = new BN(Math.floor(Date.now()/1000));
    let start_time = new BN(Number(stream.start_time));
    let end_time = new BN(Number(stream.end_time));
    console.log(current_timestamp.toString(), end_time.toString())
    let delta;
    if (current_timestamp.gte(end_time)) {
      console.log('stream already over');
      delta = end_time.sub(start_time);
    }
    else delta = current_timestamp.sub(start_time);

    let tokens_per_second = new BN(Number(stream.tokens_per_second));
    let withdrawed_amount = new BN(Number(stream.withdrawed_amount));
    return (delta.mul(tokens_per_second)).sub(withdrawed_amount).toString();
    
  }

  let handleDepositChange = (e) => setDeposit(e.target.value);
  let handleDurationChange = (e) => setDuration(e.target.value);
  let handleRecipientChange = (e) => setRecipient(e.target.value);
  let handleWithdrawAmountChange = (e) => setWithdrawAmount(e.target.value);

  return (
    <>
    {

      loader? 
      <Dimmer active={loader}>
        <Loader> Processing ...</Loader>
      </Dimmer>
      :

    <Container  style={{marginTop:'30px', paddingLeft:'60px', paddingRight:'60px', paddingBottom:'40px'}}>

      <Segment inverted>
        <Header inverted as='h2' textAlign='center'>
          <Header.Content><Image src={Logo} size={'small'} /> <br /> STREAMS</Header.Content>
        
        </Header>
        </Segment>

      <Container>
      <Segment>
      <Menu secondary>
              <Menu.Item name="Account 1" 
                   active={account === 'account1'}
                  onClick={()=> changeAccount('account1')} /> 
              
              <Menu.Item name="Account 2" 

                active={account === 'account2'}
                  onClick={()=> changeAccount('account2')} /> 
              
              {/* <Menu.Item name="Account 3" 
                  onClick={()=> setAccount('account2')} />  */}
      </Menu>
      
          <p> <b>Address :</b>  {address} </p>
          <p> <b>Balance (Lamports) : </b> {solBalance} </p>  
          <br />
          <br />
          <p> <b> Solana-Streams Program Id : </b> {programId} </p>  

      </Segment>
        
        <br />
        <br />
      </Container>     
        <Menu secondary>
         <Menu.Item name="Create Stream" 
            active={tab==='deposit'}
            onClick={()=> setTab('deposit')} /> 
        
        <Menu.Item name="Withdraw stream" 
            active={tab==='withdraw'}
            onClick={()=> setTab('withdraw')} /> 
         
        </Menu>

        { tab==='deposit' && <>
        <Segment>
          <Header as='h2' textAlign='center'>
            <Header.Content> Current Streams</Header.Content>
          </Header>

                  {
                  stream.deposit_amount!=="0" && account==='account1' ? 
              <>
              <Divider />
              <br></br>
              <br />
              <p> <b>Stream Account address : </b> {streamAccount} </p>
              <Button primary onClick={refreshBalances} > Refresh </Button>
              <br />
              <br />
              <Stream stream={stream} recipientBalance={recipientBalance} senderBalance={senderBalance} />
              <br />
              <Button secondary onClick={handleCloseStream} >Close Stream</Button>
              </>
              : 
              <Header as='h5' textAlign='center'>No stream available</Header>
            // <p textAlign='center'> </p>
          }
          <Divider />
          <Header as='h2' textAlign='center'> <Icon name='send' size={'big'} /> Start streaming payments</Header>

          <Form>
            <Form.Field>
              <label> Deposit Amount (SOL) </label>
              <Form.Input
              placeholder='36000'
              name='deposit'
              value={deposit}
              onChange={handleDepositChange}
            />
            </Form.Field>
            <Form.Field>
              <label>Recipient</label>
              <Form.Input
              placeholder='address'
              name='recipient'
              value={recipient}
              onChange={handleRecipientChange}
            />
            </Form.Field>
            <Form.Field>
              <label>Duration (in seconds)</label>
              <Form.Input
              placeholder='3600'
              name='duration'
              value={duration}
              onChange={handleDurationChange}
            />
            </Form.Field>
            <Button secondary onClick={handleCreateStream} >Create Stream</Button>
          </Form>
           
        </Segment>
        </> 
      }


        { tab==='withdraw' && <>
        <Segment>
          <Header as='h2' textAlign='center'>Current Streams</Header>
                  {
                  stream.deposit_amount!=="0" && account==='account2' ? 
              <>
              <Divider />
              <br></br>
              <br />
              <p> <b>Stream Account address : </b> {streamAccount} </p>
              <Button primary onClick={refreshBalances} > Refresh </Button>
              <br />
              <br />
              <Stream stream={stream} recipientBalance={recipientBalance} senderBalance={senderBalance} />
              
              <Divider />
              <Header as='h2' textAlign='center'> <Icon name='usd' /> Withdraw money </Header>

          <Form>
            <Form.Field>
              <label> Withdraw Amount (Lamports) </label>
              <Form.Input
              placeholder='1000'
              name='withdraw'
              value={withdrawAmount}
              onChange={handleWithdrawAmountChange}
            />
            </Form.Field>
    
            <Button secondary onClick={handleWithdraw}  >Withdraw</Button>
          </Form>
              </>
              : 
              <Header as='h5' textAlign='center'>No stream available</Header>
              }

          
           
        </Segment>
        </> 
      }
       
    </Container>
  
    }
  </>
  );
};
