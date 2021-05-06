import React, { FunctionComponent, useState } from 'react';
import { Main, Header as AragonHeader, Button, IconPlus, Tag } from '@aragon/ui'
import classnames from 'classnames';
import styled from 'styled-components';

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
    padding: '20px 0',
    margin: '0 auto'
})

export const Header: FunctionComponent<{}> = () => {
    
    return (
        <HeaderPage>
            <Logo />
            <Title>Options.Market</Title>
            <Nav />
        </HeaderPage>
    )
}