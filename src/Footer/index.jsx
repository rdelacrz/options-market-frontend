import styled from 'styled-components';
import uniswap from '../assets/icons/uniswap.png'
import coingecko from '../assets/icons/coingecko.png'
import dextools from '../assets/icons/dextools.png'
import discord from '../assets/icons/discord.png'
import gitbook from '../assets/icons/gitbook.png'
import github from '../assets/icons/github.png'
import medium from '../assets/icons/medium.png'
import telegram from '../assets/icons/telegram.png'
import twitter from '../assets/icons/twitter.png'

const Uniswap = styled.a({
    height: '40px',
    width: '40px',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundImage: `url(${uniswap})`,
    ':hover': {
        opacity: '0.8'
    }
})
const Coingecko = styled.div({
    height: '40px',
    width: '40px',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundImage: `url(${coingecko})`,
    ':hover': {
        opacity: '0.8'
    }
})
const Dextools = styled.a({
    height: '40px',
    width: '40px',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundImage: `url(${dextools})`,
    ':hover': {
        opacity: '0.8'
    }
})
const Discord = styled.a({
    height: '40px',
    width: '40px',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundImage: `url(${discord})`,
    ':hover': {
        opacity: '0.8'
    }
})
const Gitbook = styled.a({
    height: '40px',
    width: '40px',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundImage: `url(${gitbook})`,
    ':hover': {
        opacity: '0.8'
    }
})
const Github = styled.a({
    height: '40px',
    width: '40px',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundImage: `url(${github})`,
    ':hover': {
        opacity: '0.8'
    }
})
const Medium = styled.a({
    height: '40px',
    width: '40px',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundImage: `url(${medium})`,
    ':hover': {
        opacity: '0.8'
    }
})
const Telegram = styled.a({
    height: '40px',
    width: '40px',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundImage: `url(${telegram})`,
    ':hover': {
        opacity: '0.8'
    }
})
const Twitter = styled.a({
    height: '40px',
    width: '40px',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    backgroundImage: `url(${twitter})`,
    ':hover': {
        opacity: '0.8'
    }
})

const FooterSection = styled.div({
    padding: '70px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
})

const IconsWrap = styled.div({
    display: 'flex',
    justifyContent: 'space-between',
    width: '450px'
})

export const Footer = () => {
    return (
        <>
            <FooterSection>
                <IconsWrap className='icons'>
                    <Coingecko className='footer-icon' title='Comming soon' />
                    <Github className='footer-icon' rel="noopener noreferrer" target="_blank" href='https://github.com/degen-vc/options-market-core' />
                    <Uniswap className='footer-icon' rel="noopener noreferrer" target="_blank" href='https://www.app.uniswap.org/#/swap?inputCurrency=0x9b75848172677042269c63365b57b0a51c21d031&outputCurrency=ETH' />
                    <Discord className='footer-icon' rel="noopener noreferrer" target="_blank" href='https://www.discord.gg/jPvQYdGU4h' />
                    <Dextools className='footer-icon' rel="noopener noreferrer" target="_blank" href='https://www.dextools.io/app/uniswap/pair-explorer/0x853d6a51573fb3da673e20852fbfc79ca47ae6f6' />
                    <Gitbook className='footer-icon' rel="noopener noreferrer" target="_blank" href='https://www.options-market.gitbook.io/options-market/' />
                    <Twitter className='footer-icon' rel="noopener noreferrer" target="_blank" href='https://www.twiiter.com/osmtoken' />
                    <Telegram className='footer-icon' rel="noopener noreferrer" target="_blank" href='https://www.t.me/options_market' />
                    <Medium className='footer-icon' rel="noopener noreferrer" target="_blank" href='https://www.medium.com/options-market' />
                </IconsWrap>
            </FooterSection>
            <div style={{ fontSize: '22px', textAlign: 'center' }}>@2021 by Options.Market</div>
            <br />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <a style={{ fontSize: '22px', paddingBottom: '40px', color: 'black' }} className='policy' rel="noopener noreferrer" target="_blank" href='https://options-market.gitbook.io/options-market/disclaimers-and-policies'>Policies and disclaimer</a>
            </div>
        </>
    )
}