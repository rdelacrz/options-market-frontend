import logo from '../assets/logo.png';
import styled from 'styled-components';

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
    width: '15%',
    padding: '20px 0',
    margin: '0 auto'
})

export const Header = () => {
    return (
        <HeaderPage>
            <Logo />
            <Title>Options.Market</Title>
            <Nav>
                <div>Home</div>
                <div>About</div>
                <div>Launch</div>
            </Nav>
        </HeaderPage>
    )
}