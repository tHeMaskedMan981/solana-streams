import React from 'react'
import {
Table
} from "semantic-ui-react";
const Stream = ({stream, recipientBalance, senderBalance}) => {
    return (
        <div>
            <Table basic='very' celled collapsing>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell></Table.HeaderCell>
                  <Table.HeaderCell></Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                <Table.Row>
                  
                  <Table.Cell><b> Total Deposit Amount </b> </Table.Cell>
                  <Table.Cell>{stream.deposit_amount}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell> <b>Recipient</b> </Table.Cell>
                  <Table.Cell>{stream.recipient}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell> <b>Start Time</b> </Table.Cell>
                  <Table.Cell>{ new Date(Number(stream.start_time)*1000).toLocaleString() }</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell> <b>End Time</b> </Table.Cell>
                  <Table.Cell>{ new Date(Number(stream.end_time)*1000).toLocaleString() }</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell><b>Lamports streamed per second</b> </Table.Cell>
                  <Table.Cell> {stream.tokens_per_second}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell><b>Withdrawn Amount</b> </Table.Cell>
                  <Table.Cell> { stream.withdrawed_amount }</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell><b>Sender remaining balance</b> </Table.Cell>
                  <Table.Cell> {senderBalance}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell><b>Recipient remaining balance</b> </Table.Cell>
                  <Table.Cell> {recipientBalance}</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
        </div>
    )
}

export default Stream
