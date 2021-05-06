// @ts-nocheck
import Web3 from 'web3';

export const getWeb3 = () => {
  return new Promise(async (resolve, reject) => {
    if (typeof window !== 'undefined') {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          await window.ethereum.enable();
          resolve(web3);
        } catch (error) {
          // reject(error); Don't need to do anything if user cancels
        }
      } else if (window.web3) {
        const web3 = window.web3;
        resolve(web3);
      }
    } 
  });
};
