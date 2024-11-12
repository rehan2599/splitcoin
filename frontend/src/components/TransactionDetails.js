import React, { useEffect, useState } from 'react';
import { callReadOnlyFunction } from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';

function TransactionDetails({ purchaseId, userSession }) {
  const [purchaseDetails, setPurchaseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  

  useEffect(() => {
    const fetchPurchaseDetails = async () => {
      try {
        const result = await callReadOnlyFunction({
          network: STACKS_TESTNET,
          contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          contractName: 'split-purchase',
          functionName: 'get-purchase',
          functionArgs: [purchaseId],
          senderAddress: userSession.loadUserData().profile.stxAddress.testnet,
        });

        if (result?.value) {
          setPurchaseDetails(result.value);
        } else {
          setError('No data found for this purchase ID.');
        }
      } catch (err) {
        setError('Failed to fetch purchase details.');
      } finally {
        setLoading(false);
      }
    };

    if (purchaseId) {
      fetchPurchaseDetails();
    }
  }, [purchaseId, userSession]);

  if (loading) {
    return <div>Loading transaction details...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Transaction Details</h2>
      <p>Purchase ID: {purchaseId}</p>
      <p>Total Amount: {purchaseDetails['total-amount']} STX</p>
      <p>Installment Amount: {purchaseDetails['installment-amount']} STX</p>
      <p>Installments Paid: {purchaseDetails['installments-paid']}/5</p>
      <p>Completed: {purchaseDetails.completed ? 'Yes' : 'No'}</p>
    </div>
  );
}

export default TransactionDetails;
