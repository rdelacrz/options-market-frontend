import React, { FunctionComponent, useCallback, useEffect } from 'react';
import { Button, IconConnect, IdentityBadge, useToast } from '@aragon/ui';
import classnames from 'classnames';
import { useWeb3React } from '@web3-react/core';
import { injectedConnector } from '@utilities';

import './styles.scss';

interface EthAccountButtonProps {
  className?: string;
}

const EthAccountButton: FunctionComponent<EthAccountButtonProps> = (props) => {
  const toast = useToast();

  // Gets Web3 attributes
  const { account, activate, active, connector, library, error } = useWeb3React();

  useEffect(() => {
    // Error message: request of type 'wallet_requestPermissions' already pending for origin
    if (error && error['code'] === -32002) {
      toast('Wallet permissions have already been requested. Please complete wallet authentication, then try again.');
    }
  }, [error]);

  const handleConnectionClick = useCallback(() => {
    if (typeof window !== 'undefined') {
      activate(injectedConnector);
    }
  }, [activate]);

  return (
    <div className={classnames('eth-account-button-wrapper', {[props.className]: !!props.className})}>
      {!active ? (
        <Button
          id='connectAccountBtn'
          className='primary'
          label='Connect Account'
          icon={<IconConnect className='icon' />}
          onClick={handleConnectionClick}
        />
      ) : (
        <IdentityBadge className='ethereum-address-badge' entity={account} connectedAccount />
      )}
    </div>
  );
};

export default EthAccountButton;
