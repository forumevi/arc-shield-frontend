'use client';

import { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Lock, RefreshCw, ExternalLink, Play, Github } from 'lucide-react';

const GATEWAY_URL = 'https://arc-shield-gateway-373439937684.europe-west1.run.app';
const GITHUB_URL = 'https://github.com/forumevi/arc-shield-x402';

export default function Home() {
  const [targetAddress, setTargetAddress] = useState('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'IDLE' | 'PAYMENT_REQUIRED' | 'ANALYZING' | 'SUCCESS'>('IDLE');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const res = await fetch(`${GATEWAY_URL}/api/v1/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_address: targetAddress, chain_id: 'arc-mainnet' }),
      });

      if (res.status === 402) {
        const data = await res.json();
        setPaymentDetails(data);
        setStep('PAYMENT_REQUIRED');
      } else {
        const data = await res.json();
        if (data.analysis) {
          setResult(data);
          setStep('SUCCESS');
        } else {
          setErrorMessage('Unexpected response from gateway.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Gateway Connection Failed: ' + (err.message || 'Server not responding'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!txHash) return alert('Please enter a valid transaction hash!');
    setLoading(true);
    setErrorMessage(null);
    setStep('ANALYZING');

    try {
      const res = await fetch(`${GATEWAY_URL}/api/v1/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-payment-proof': txHash,
        },
        body: JSON.stringify({ target_address: targetAddress, chain_id: 'arc-mainnet' }),
      });

      const data = await res.json();
      if (data.success || data.analysis) {
        setResult(data);
        setStep('SUCCESS');
      } else {
        setErrorMessage('Payment could not be verified: ' + (data.error || data.message || 'Unknown error'));
        setStep('PAYMENT_REQUIRED');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('An error occurred during analysis: ' + err.message);
      setStep('PAYMENT_REQUIRED');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { label: 'Request', desc: 'Agent requests security analysis' },
    { label: '402 Response', desc: 'Gateway requires 0.001 USDC' },
    { label: 'On-Chain Payment', desc: 'Agent pays via Arc Mainnet' },
    { label: 'AI Analysis', desc: 'Gemini evaluates the target' },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-xl">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                ArcShield Security Oracle
              </h1>
              <p className="text-sm text-slate-400">Powered by Gemini AI & x402 Micropayments on Arc Mainnet</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className="p-2 border border-slate-800 rounded-lg hover:border-slate-600 transition"
              title="View source on GitHub"
            >
              <Github className="w-5 h-5 text-slate-300" />
            </a>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Arc Mainnet Live
            </span>
          </div>
        </div>

        {/* How it works strip */}
        <div className="grid grid-cols-4 gap-3">
          {steps.map((s, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 text-center">
              <div className="text-xs font-bold text-blue-400 mb-1">{i + 1}</div>
              <div className="text-xs font-semibold text-slate-200">{s.label}</div>
              <div className="text-[10px] text-slate-500 mt-1">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Input Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
          <label className="block text-sm font-medium text-slate-300">Target Contract / Wallet Address</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-blue-500 transition"
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 font-semibold px-6 py-3 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              Request Analysis
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Every analysis costs 0.001 USDC — a fraction of what the same request would cost in gas on Ethereum L1.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: x402 Payment Required Prompt */}
        {paymentDetails && step === 'PAYMENT_REQUIRED' && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-amber-400 font-semibold">
              <Lock className="w-5 h-5" />
              HTTP 402 Payment Required (x402 Protocol)
            </div>
            <p className="text-sm text-slate-300">
              Please send a micropayment of <strong>{paymentDetails.amount_usdc || '0.001'} USDC</strong> to the address below to start the analysis:
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-blue-300 break-all">
              Recipient: {paymentDetails.recipient_address}
            </div>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-medium text-slate-400">Transaction Hash (Payment Proof)</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleVerifyPayment}
                  disabled={loading}
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-6 py-2 rounded-xl transition flex items-center gap-2"
                >
                  {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  Verify & Analyze
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Gemini AI Analysis Report Result */}
        {result && step === 'SUCCESS' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                {result.analysis?.safety_status === 'SAFE' ? (
                  <ShieldCheck className="w-7 h-7 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-7 h-7 text-rose-400" />
                )}
                <div>
                  <h3 className="font-bold text-lg">Gemini AI Security Evaluation</h3>
                  <span className="text-xs text-slate-400">Target: {result.analysis?.target_address}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-blue-400">{result.analysis?.risk_score}</div>
                <div className="text-xs text-slate-400">Risk Score</div>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm leading-relaxed text-slate-300">
              {result.analysis?.analysis_summary}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Detected Threats
                </div>
                <ul className="text-xs space-y-1 text-slate-300 list-disc list-inside">
                  {result.analysis?.detected_threats?.map((t: string, i: number) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Recommendations
                </div>
                <ul className="text-xs space-y-1 text-slate-300 list-disc list-inside">
                  {result.analysis?.recommendations?.map((r: string, i: number) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-xs text-slate-500 pt-2 border-t border-slate-800 flex justify-between items-center">
              <span>Verified On-Chain Block: #{result.payment_info?.blockNumber}</span>
              
                href={`https://explorer.arc.network/tx/${result.payment_info?.transactionHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-1"
              >
                View Transaction Explorer <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        <footer className="text-center text-xs text-slate-600 pt-4">
          Built for the Build with Gemini XPRIZE — Agentic Economy Prize
        </footer>

      </div>
    </main>
  );
}
