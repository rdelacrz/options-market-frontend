import React, { FunctionComponent, useState } from 'react';
import styled from 'styled-components';

import './styles.scss';

const logo = require('@assets/logo.png').default;

const HeaderPage = styled.div({
    height: '252px',
})

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
    padding: '8px 0',
    margin: '0 auto'
})

export const Header: FunctionComponent<{}> = () => {
    
    return (
        <HeaderPage className='header-wrapper'>
            <Logo />
            <Title>Options.Market</Title>
            <Nav />
            <div className='header-links-container'>
                <a href='https://medium.com/options-market' target='_blank'>About</a>
                <a href='https://options-market.gitbook.io/options-market/ama' target='_blank'>Launch</a>
                <a href='https://medium.com/options-market/option-market-roadmap-2021-deb82330e2de' target='_blank'>Roadmap</a>
            </div>
        </HeaderPage>
    )
}