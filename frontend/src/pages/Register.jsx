import { useState } from 'react';
import { BrowserProvider, Contract, keccak256, randomBytes } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { api } from '../lib/api';

const REGISTRATION_ABI = ['function recordRegistration(bytes32 registrationHash)'];
const CONTRACT_ADDRESS = import.meta.env.VITE_REGISTRATION_CONTRACT_ADDRESS;
const AMOY_RPC_URL = import.meta.env.VITE_POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';
const AMOY_CHAIN_ID = '0x13882';

async function connectToAmoy() {
  if (!window.ethereum) {
    throw new Error('Install MetaMask (or another injected wallet) to create a blockchain registration receipt.');
  }

  if (!CONTRACT_ADDRESS) {
    throw new Error('The registration contract is not deployed/configured yet. Set VITE_REGISTRATION_CONTRACT_ADDRESS and try again.');
  }

  try {
    await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: AMOY_CHAIN_ID }] });
  } catch (error) {
    if (error.code !== 4902) throw error;

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: AMOY_CHAIN_ID,
        chainName: 'Polygon Amoy Testnet',
        nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
        rpcUrls: [AMOY_RPC_URL],
        blockExplorerUrls: ['https://amoy.polygonscan.com'],
      }],
    });
    await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: AMOY_CHAIN_ID }] });
  }

  const provider = new BrowserProvider(window.ethereum);
  await provider.send('eth_requestAccounts', []);
  const signer = await provider.getSigner();
  return { signer, walletAddress: await signer.getAddress() };
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { signer, walletAddress } = await connectToAmoy();
      await api('/register/check', { method: 'POST', body: { email, walletAddress } });
      const registrationHash = keccak256(randomBytes(32));
      const contract = new Contract(CONTRACT_ADDRESS, REGISTRATION_ABI, signer);
      const transaction = await contract.recordRegistration(registrationHash);
      await transaction.wait();

      await register({
        name,
        email,
        password,
        walletAddress,
        registrationHash,
        transactionHash: transaction.hash,
      });
      navigate('/progress');
    } catch (requestError) {
      setError(requestError.shortMessage || requestError.message || 'Unable to create your account.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto max-w-md px-4 py-14">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Start your journey</p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">Create an account</h1>
        <p className="mt-3 text-sm text-slate-600">
          Your email and password stay private. A wallet registration receipt is written to Polygon Amoy; test POL is needed for network fees.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="register-name">Full name</label>
            <input id="register-name" type="text" autoComplete="name" minLength="2" maxLength="120" required value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-400 focus:bg-white" placeholder="Your name" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="register-email">Email</label>
            <input id="register-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-400 focus:bg-white" placeholder="you@example.com" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="register-password">Password</label>
            <input id="register-password" type="password" autoComplete="new-password" minLength="10" maxLength="128" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-400 focus:bg-white" placeholder="At least 10 characters" />
          </div>

          {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

          <button type="submit" disabled={submitting} className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60">
            {submitting ? 'Confirming wallet transaction…' : 'Create account & record receipt'}
          </button>
        </form>
      </div>
    </section>
  );
}
