import React from 'react'
import './Donation.css'
import Razorpay_logo from '../../assets/razorpay.svg'
import paypal from '../../assets/paypal.png'
import usdt from '../../assets/usdt.jpeg'
import btc from '../../assets/upi.jpeg'
import Contributor from './Contributor'

const Donation = () => {
    function pay_razorpay() {
        window.open('https://rzp.io/rzp/aYMLI3hg', '_blank');
    }
    function pay_paypal() {
        alert(`Currently Paypal doesn't Worker. Sorry`);
    }
  return (
    <div className='donation-container'>
        <div className='title-container'>
            🖤 DONATE
        </div>
        <div className='description-container'>
            <p>Theme<span style={{color:'red', fontSize:'16.5px', fontFamily:'inherit'}}>CP</span> is a non-profit platform, and while donations and the amount of donation are user's choice, but they are greatly appreciated.</p>
            <p>The primary reason we ask for your support is to help cover the costs of hosting the website, which the developer personally bears. Your donation will help ensure continued access to the platform, enhance the user experience, and able to bring much more features and improvements.</p>
            <p>Thank you for your generosity and support!</p>
        </div>
        <div className='payment-option-container'>
            <p className='target'>Target Donation Jan: $ 4.78/12</p>
            <div style={{display:'grid', gridTemplateColumns:'1fr 2fr'}}>
                <img className='donation-logo' src={Razorpay_logo}></img>
                <img className='donation-logo' src={paypal}></img>
                <button onClick={pay_razorpay} className='donate-button'>Donate</button>
                <button onClick={pay_paypal} className='donate-button'>Donate</button>
                <img src={usdt} className='qr-code'></img>
                <img src={btc} className='qr-code'></img>
                <div className='qr-label'>USDT</div>
                <div className='qr-label'>UPI</div>
            </div>
            <center><a href='https://discord.gg/49Sva9JrmD'>Contact me @10zin</a></center>
        </div>
        <div className='contributor-list'>
            Contributors
            <Contributor name='SHIVANSH GUPTA' />
            <Contributor name='IRON MAN' />
            <Contributor name='TVN Rahul Bharadwaj' />
            <Contributor name='Ayush Kumar' />
        </div>
    </div>
  )
}

export default Donation
