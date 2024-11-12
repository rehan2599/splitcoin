import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useConnect } from '@stacks/connect-react';
import { uintCV } from '@stacks/transactions';


function InstallmentModal({ open, handleClose, product, stxToUsd, userSession }) {
  const [totalAmount, setTotalAmount] = useState(0);
  const [installmentAmount, setInstallmentAmount] = useState(0);
  const [stxEquivalent, setStxEquivalent] = useState(0);
  const [installmentsPaid, setInstallmentsPaid] = useState(0);
  const { doContractCall } = useConnect();

  useEffect(() => {
    if (product) {
      const total = Math.floor(product.price * 1.05 / stxToUsd); // 5% charge, convert to microSTX
      const installment = Math.floor(total / 5);
      console.log('Total amount:', total);
      setTotalAmount(total);
      setInstallmentAmount(installment);
      setStxEquivalent(installment / 1000000); // Convert back to STX for display
    }
  }, [product, stxToUsd]);

  const createSplitPurchase = async () => {
    if (!product) return;
    
    const purchaseId = Math.floor(Date.now() / 1000); // Generate unique purchaseId using timestamp
    const userAddress = userSession?.loadUserData().profile.stxAddress.testnet;

    console.log('Creating split purchase with:', {
      purchaseId,
      totalAmount,
      userAddress,
    });
    
    try {
      await doContractCall({
        network: 'testnet',
        contractAddress: 'ST1V9217ADPXCY5SK9MWPTXT7C5C9XRRPBGHPRHVC',
        contractName: 'split-puchase',
        functionName: 'create-split-purchase',
        functionArgs: [
          uintCV(purchaseId),
          uintCV(totalAmount)
        ],
        onFinish: (data) => {
          console.log('Split purchase created!', data);
          payInstallment(purchaseId);
        },
        onCancel: () => {
          console.log('Transaction canceled');
        },
      });
    } catch (error) {
      console.error('Error in creating split purchase:', error);
    }
  };

  const payInstallment = async (purchaseId) => {
    if (!purchaseId) return;
    const userAddress = userSession?.loadUserData().profile.stxAddress.testnet;
    
    try {
      await doContractCall({
        network: 'testnet',
        contractAddress: 'ST1V9217ADPXCY5SK9MWPTXT7C5C9XRRPBGHPRHVC',
        contractName: 'split-puchase',
        functionName: 'pay-installment',
        functionArgs: [uintCV(purchaseId)],
        onFinish: (data) => {
          console.log('Installment paid!', data);
          setInstallmentsPaid(prev => prev + 1);
        },
        onCancel: () => {
          console.log('Transaction canceled');
        },
      });
    } catch (error) {
      console.error('Error in paying installment:', error);
    }
  };

  const handleBuy = async () => {
    console.log(userSession.isUserSignedIn());
    if (!userSession.isUserSignedIn()) {

      alert('Please connect your wallet first');
      return;
    }
    await createSplitPurchase();
  };

  return (
    <Modal open={open} onClose={handleClose} className="installmodal">
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
      }}>
        <Typography variant="h6" component="h2">
          Split Purchase for {product?.title}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          Total amount (including 5% charge): ${(product?.price * 1.05).toFixed(2)} USD
        </Typography>
        <Typography sx={{ mt: 2 }}>
          Per installment charges: ${(product?.price * 1.05 / 5).toFixed(2)} USD
        </Typography>
        <Typography sx={{ mt: 2 }}>
          Per installment conversion: {installmentAmount.toFixed(6)} STX
        </Typography>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="contained" 
            onClick={handleBuy} 
            sx={{ flex: 1, mr: 1 }}
          >
            Buy with STX
          </Button>
          <Button 
            variant="outlined" 
            onClick={handleClose} 
            sx={{ flex: 1, ml: 1 }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default InstallmentModal;