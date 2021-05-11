import React, { FunctionComponent, useRef, useState } from 'react';
import classnames from 'classnames';
import { AddressField , ButtonBase, IconClose, Link, Popover } from '@aragon/ui';

import './styles.scss';

interface EthTokenProps {
    className?: string;
    popperTitle?: string;
    tokenAddress: string;
}

export const EthToken: FunctionComponent<EthTokenProps> = (props) => {
    const [visible, setVisible] = useState(false);
    const opener = useRef<HTMLButtonElement>();

    const ethIcon = require('@assets/icons/empty-eth-token.png').default;
    return (
        <div className={classnames('eth-token-wrapper', { [props.className]: !!props.className })}>
            <ButtonBase title={props.tokenAddress} onClick={() => setVisible(true)} ref={opener}>
                <img className='eth-icon' src={ethIcon} alt='ETH Token Icon' height={30} width={30} />
            </ButtonBase>
            <Popover visible={visible} opener={opener.current} onClose={() => setVisible(false)}>
                <div className='eth-token-popper-content-wrapper'>
                    <div className='popper-button-container'>
                        <div className='token-address-title'>{props.popperTitle}</div>
                        <ButtonBase className='popper-closer' onClick={() => setVisible(false)}>
                            <IconClose className='close-icon' size='small' />
                        </ButtonBase>
                    </div>
                    <div className='address-content-wrapper'>
                        <div className='address-field-container'>
                            <AddressField address={props.tokenAddress} />
                        </div>
                        <Link className='token-address' href={`https://etherscan.io/token/${props.tokenAddress}`} target='_blank'>
                            See on Etherscan
                        </Link>
                    </div>
                </div>
            </Popover>
        </div>
    )
}
