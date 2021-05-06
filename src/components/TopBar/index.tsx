import React, { FunctionComponent, useRef, useState } from 'react';
import { Bar, Button, IconHome, IconConnect, IconSettings } from '@aragon/ui'
import classnames from 'classnames';
import styled from 'styled-components';
import { useScrollPosition } from '@n8tb1t/use-scroll-position';

import './styles.scss';

const logo = require('@assets/logo.png').default;

const Logo = styled.div({
    backgroundImage: `url(${logo})`,
    backgroundSize: 'cover',
    height: '50px',
    width: '50px',
    margin: '50px auto 30px'
})

const Title = styled.div({
    width: '70%',
    margin: '0 auto',
    fontSize: '40px',
    textAlign: 'center',
    fontWeight: 'bold',
    paddingBottom: '20px',
    borderBottom: '1px solid black',
})

const Nav = styled.div({
    display: 'flex',
    justifyContent: 'space-between',
    width: '210px',
    padding: '20px 0',
    margin: '0 auto'
})

interface TopBarProps {
    className?: string;
}

export const TopBar: FunctionComponent<TopBarProps> = () => {
    const [solid, setSolid] = useState(false);

    useScrollPosition(({ currPos }) => {
        const solidNow = currPos.y > 0;
        if (solidNow !== solid) {
            setSolid(solidNow);     // Only performs action if value has changed
        }
    }, [solid], undefined, true, 100);

    return (
        <React.Fragment>
            <Bar className={classnames('top-bar-wrapper', {'solid': solid})} primary={
                <React.Fragment>
                    <Button id='homeBtn' className='primary' label='Home' display='icon' icon={<IconHome className='icon' />} />
                </React.Fragment>
                }
                secondary={
                    <div className='action-buttons'>
                        <Button id='osmBtn' className='primary' label='OSM' />
                        <Button id='connectAccountBtn' className='primary' label='Connect Account' icon={<IconConnect className='icon' />} />
                        <Button id='settingsBtn' className='primary' label='Settings' display='icon' icon={<IconSettings className='icon' />} />
                    </div>
                }
            />
            <div className='top-bar-fixed-buffer' />
        </React.Fragment>
    )
}