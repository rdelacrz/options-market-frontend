import React, { PureComponent } from 'react';
import { Page } from '@layouts';

import './styles.scss'

export class VaultPage extends PureComponent {
    constructor() {
        super()
        this.state = {
            popupOpen: false
        }
        function CountdownTracker(label, value) {

            var el = document.createElement('span');

            el.className = 'flip-clock__piece';
            el.innerHTML = '<b class="flip-clock__card card"><b class="card__top"></b><b class="card__bottom"></b><b class="card__back"><b class="card__bottom"></b></b></b>' +
                '<span class="flip-clock__slot">' + label + '</span>';

            this.el = el;

            var top = el.querySelector('.card__top'),
                bottom = el.querySelector('.card__bottom'),
                back = el.querySelector('.card__back'),
                backBottom = el.querySelector('.card__back .card__bottom');

            this.update = function (val) {
                val = ('0' + val).slice(-2);
                if (val !== this.currentValue) {

                    if (this.currentValue >= 0) {
                        back.setAttribute('data-value', this.currentValue);
                        bottom.setAttribute('data-value', this.currentValue);
                    }
                    this.currentValue = val;
                    top.innerText = this.currentValue;
                    backBottom.setAttribute('data-value', this.currentValue);

                    this.el.classList.remove('flip');
                    void this.el.offsetWidth;
                    this.el.classList.add('flip');
                }
            }

            this.update(value);
        }

        // Calculation adapted from https://www.sitepoint.com/build-javascript-countdown-timer-no-dependencies/

        function getTimeRemaining(endtime) {
            var t = Date.parse(endtime) - Date.parse(new Date());
            return {
                'Total': t,
                'Days': Math.floor(t / (1000 * 60 * 60 * 24)),
                'Hours': Math.floor((t / (1000 * 60 * 60)) % 24),
                'Minutes': Math.floor((t / 1000 / 60) % 60),
                'Seconds': Math.floor((t / 1000) % 60)
            };
        }

        function getTime() {
            var t = new Date();
            return {
                'Total': t,
                'Hours': t.getHours() % 12,
                'Minutes': t.getMinutes(),
                'Seconds': t.getSeconds()
            };
        }

        function Clock(countdown, callback) {

            countdown = countdown ? new Date(Date.parse(countdown)) : false;
            callback = callback || function () { };

            var updateFn = countdown ? getTimeRemaining : getTime;

            this.el = document.createElement('div');
            this.el.className = 'flip-clock';

            var trackers = {},
                t = updateFn(countdown),
                key, timeinterval;

            for (key in t) {
                if (key === 'Total') { continue; }
                trackers[key] = new CountdownTracker(key, t[key]);
                this.el.appendChild(trackers[key].el);
            }

            var i = 0;
            function updateClock() {
                timeinterval = requestAnimationFrame(updateClock);

                // throttle so it's not constantly updating the time.
                if (i++ % 10) { return; }

                var t = updateFn(countdown);
                if (t.Total < 0) {
                    cancelAnimationFrame(timeinterval);
                    for (key in trackers) {
                        trackers[key].update(0);
                    }
                    callback();
                    return;
                }

                for (key in trackers) {
                    trackers[key].update(t[key]);
                }
            }

            setTimeout(updateClock, 500);
        }

        var deadline = new Date(1616763600000);
        this.c = new Clock(deadline, function () { alert('countdown complete') });

    }
    componentDidMount() {
        document.getElementsByClassName('timer')[0].appendChild(this.c.el)
    }

    changeModalStatus(type) {
        let { modalIsOpen } = this.state;
        this.setState({ modalIsOpen: !modalIsOpen, inputEth: '', modalType: type })
    }

    render() {
        const { popupOpen } = this.state;
        return (
            <Page>
                <div className='title-vault'>Dual-Accelerator Vault</div>
                <div className='timer'></div>
                <section className='vault'>
                    <div className='stake-panel'>
                        <div className='header-panel'>
                            <div className='header-text'>
                                Send ETH. It is pooled with $OSM. Your discounted LP is locked for a period.
                            </div>
                            <div>
                                <div className='wrap-title second'>
                                    <div className='header-text'>Available $OSM</div>
                                    <div className='stake-value'>000000</div>
                                </div>
                            </div>
                        </div>
                        <div className='stake'>
                            <div className='stake-header'>
                                <div className='wrap-title first'>
                                    <div className='stake-title'>Max ETH</div>
                                    <div className='stake-value'>000000</div>
                                </div>
                                <div className='wrap-title first'>
                                    <div className='stake-title'>Lock Period</div>
                                    <div className='stake-value'>000000</div>
                                </div>
                                <div className='wrap-title first'>
                                    <div className='stake-title'>LP Discount</div>
                                    <div className='stake-value'>000000</div>
                                </div>
                                <div className='wrap-title first'>
                                    <div className='stake-title'>LP Burn</div>
                                    <div className='stake-value'>000000</div>
                                </div>
                                <div className='second-block'>
                                    <div className='wrap-title second'>
                                        <div className='stake-title'>Not yet claimable LP</div>
                                        <div className='stake-value'>000000</div>
                                    </div>
                                    <div className='wrap-title second'>
                                        <div className='stake-title'>Claimable LP</div>
                                        <div className='stake-value'>000000</div>
                                    </div>
                                </div>
                            </div>
                            <div className='stake-body'>
                                <div className='stake-input-wrap'>
                                    <input className='stake-input' type='text' placeholder='Amount' />
                                    <div style={{ color: 'white' }}>ETH</div>
                                </div>
                                <div className='stake-button btn unique' onClick={() => { this.setState({ popupOpen: true }) }}>SEND ETH</div>
                                <br/>
                                <br/>
                                
                                <div className='stake-button btn mr unique' onClick={() => { this.setState({ popupOpen: true }) }}>CLAIM</div>


                            </div>
                        </div>
                    </div>
                </section>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                    <a style={{ fontSize: '24px', color: 'black', borderBottom: '1px solid black' }} rel="noopener noreferrer" target="_blank" href='https://options-market.gitbook.io/options-market/accelerator-vault-explainer'>Learn more</a>
                </div>

                <div className='blue-text'>
                    <div style={{ fontSize: '48px', color: 'white', textAlign: 'center', fontWeight: ' ' }}>Options.Market</div>
                    <br />
                    <br />
                    <div>Options.Market's initial and core offering is a protocol layer (forked from a project called Siren Market) for creating, trading, and redeeming fully-collateralized options contracts for any
                    ERC20 token. Options allow traders the choice to buy or sell an asset at a predetermined price at a known time in the future. This allows hedging against possible price changes, as well as speculation on price changes.
                    </div>
                    <br />
                    <div>Both long and short sides of options contracts are tokenized uniquely creating secondary markets for both the long and short exposure. The buyer’s side (bToken) gives the holder the right to
                    purchase or sell the underlying asset at a predetermined strike price. The seller’s/writer’s side (wToken) allows the holder to withdraw the collateral (if the option was not exercised) or withdraw the exercise payment (if the option was exercised) from the contract after expiration.
                    </div>
                    <br />
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                        <a rel="noopener noreferrer" target="_blank" href='https://medium.com/options-market/about-options-market-44270bf981f5' style={{ fontSize: '22px', color: 'white', borderBottom: '1px solid white' }}>Full Story</a>
                    </div>
                </div>
                {popupOpen ? (
                    <div className='pop-up'>
                        <div className='pop-up-body'>
                            <div className='text-pop-up'>
                                Will be live soon
                        </div>
                            <div className='pop-up-button' onClick={() => { this.setState({ popupOpen: false }) }}>OK</div>
                        </div>
                    </div>
                ) : null}
            </Page>
        )
    }
}