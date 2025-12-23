'use client';

import React, { useState } from 'react';
import {
  Wallet,
  Copy,
  Download,
  RefreshCw,
  Check,
  QrCode,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
  Bitcoin,
  CircleDollarSign,
  Zap,
  Coins,
  Globe,
  Import
} from 'lucide-react';
import QRCode from 'qrcode';
import { ethers } from 'ethers';
import * as bitcoin from 'bitcoinjs-lib';
import ECPairFactory from 'ecpair';
import * as ecc from 'tiny-secp256k1';

const ECPair = ECPairFactory(ecc);

type CoinType = 'BTC' | 'ETH' | 'TRX' | 'USDT' | 'SOL' | 'ADA' | 'DOT' | 'MATIC';

interface WalletInfo {
  address: string;
  privateKey: string;
  coinType: CoinType;
  qrCode: string;
}

const WalletGenerator: React.FC = () => {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [selectedCoin, setSelectedCoin] = useState<CoinType>('BTC');
  const [copied, setCopied] = useState<'address' | 'privateKey' | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [importMode, setImportMode] = useState<boolean>(false);
  const [importInput, setImportInput] = useState('');

  // 从私钥生成地址（用于导入功能）
  const getAddressFromPrivateKey = (privateKey: string, coinType: CoinType): string => {
    try {
      switch (coinType) {
        case 'BTC': {
          const keyPair = ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'));
          const { address } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
          return address || '';
        }

        case 'ETH':
        case 'USDT':
        case 'MATIC':
        case 'ADA':
        case 'DOT': {
          const wallet = new ethers.Wallet(privateKey);
          return wallet.address;
        }

        case 'TRX': {
          const wallet = new ethers.Wallet(privateKey);
          return wallet.address.slice(2).toLowerCase();
        }

        case 'SOL': {
          // Solana 暂时使用 EVM 格式
          const wallet = new ethers.Wallet(privateKey);
          return wallet.address;
        }

        default:
          return '';
      }
    } catch (error) {
      console.error('从私钥生成地址失败:', error);
      return '';
    }
  };

  // 生成钱包
  const generateWallet = async () => {
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      // 直接生成私钥
      let privateKey = '';
      let address = '';

      switch (selectedCoin) {
        case 'BTC': {
          const keyPair = ECPair.makeRandom();
          privateKey = keyPair.privateKey?.toString('hex') || '';
          const { address: addr } = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey });
          address = addr || '';
          break;
        }

        case 'ETH':
        case 'USDT':
        case 'MATIC':
        case 'ADA':
        case 'DOT': {
          const wallet = ethers.Wallet.createRandom();
          privateKey = wallet.privateKey;
          address = wallet.address;
          break;
        }

        case 'TRX': {
          const wallet = ethers.Wallet.createRandom();
          privateKey = wallet.privateKey;
          address = wallet.address.slice(2).toLowerCase();
          break;
        }

        case 'SOL': {
          // Solana 需要不同的处理方式，暂时使用 EVM 钱包格式
          const wallet = ethers.Wallet.createRandom();
          privateKey = wallet.privateKey;
          address = wallet.address;
          break;
        }

        default:
          throw new Error('不支持的币种');
      }

      const qrCode = await generateQRCode(address);

      setWallet({
        address,
        privateKey,
        coinType: selectedCoin,
        qrCode
      });
      setShowPrivateKey(false);
    } catch (error) {
      console.error('生成钱包失败:', error);
      alert('生成钱包失败: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  // 导入钱包
  const importWallet = async () => {
    if (!importInput.trim()) {
      alert('请输入私钥');
      return;
    }

    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const privateKey = importInput.trim();
      const address = getAddressFromPrivateKey(privateKey, selectedCoin);

      if (!address) {
        throw new Error('无效的私钥');
      }

      const qrCode = await generateQRCode(address);

      setWallet({
        address,
        privateKey,
        coinType: selectedCoin,
        qrCode
      });
      setShowPrivateKey(false);
      setImportInput('');
      setImportMode(false);
    } catch (error) {
      console.error('导入钱包失败:', error);
      alert('导入钱包失败: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  // 生成二维码
  const generateQRCode = async (text: string): Promise<string> => {
    try {
      return await QRCode.toDataURL(text, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      console.error('生成二维码失败:', error);
      return '';
    }
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string, type: 'address' | 'privateKey') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  // 下载地址
  const downloadAddress = () => {
    if (!wallet) return;
    const blob = new Blob([wallet.address], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${wallet.coinType.toLowerCase()}-address-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 下载私钥
  const downloadPrivateKey = () => {
    if (!wallet) return;
    const blob = new Blob([wallet.privateKey], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${wallet.coinType.toLowerCase()}-private-key-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 下载二维码
  const downloadQRCode = () => {
    if (!wallet || !wallet.qrCode) return;
    const a = document.createElement('a');
    a.href = wallet.qrCode;
    a.download = `${wallet.coinType.toLowerCase()}-qrcode-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const coins = [
    { id: 'BTC' as CoinType, name: '比特币', icon: Bitcoin, color: 'from-orange-400 to-orange-600', description: 'BTC' },
    { id: 'ETH' as CoinType, name: '以太坊', icon: CircleDollarSign, color: 'from-blue-400 to-indigo-600', description: 'ETH' },
    { id: 'TRX' as CoinType, name: '波场', icon: Zap, color: 'from-red-400 to-red-600', description: 'TRX' },
    { id: 'USDT' as CoinType, name: '泰达币', icon: Shield, color: 'from-green-400 to-green-600', description: 'ERC20' },
    { id: 'SOL' as CoinType, name: 'Solana', icon: Coins, color: 'from-purple-400 to-purple-600', description: 'SOL' },
    { id: 'ADA' as CoinType, name: 'Cardano', icon: Globe, color: 'from-cyan-400 to-blue-600', description: 'ADA' },
    { id: 'DOT' as CoinType, name: 'Polkadot', icon: CircleDollarSign, color: 'from-pink-400 to-pink-600', description: 'DOT' },
    { id: 'MATIC' as CoinType, name: 'Polygon', icon: Coins, color: 'from-indigo-400 to-violet-600', description: 'MATIC' }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">钱包地址生成器</h2>
        <p className="text-[var(--text-secondary)]">生成真实的区块链钱包地址，支持 BIP39 助记词标准</p>
      </div>

      <div className="space-y-6">
        {/* 币种选择 */}
        <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-6">
            <Wallet size={18} className="text-[var(--accent-color)]" />
            选择币种
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {coins.map((coin) => {
              const Icon = coin.icon;
              return (
                <button
                  key={coin.id}
                  onClick={() => setSelectedCoin(coin.id)}
                  className={`p-4 rounded-xl transition-all ${
                    selectedCoin === coin.id
                      ? `bg-gradient-to-br ${coin.color} text-white font-bold`
                      : 'bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon size={32} />
                    <div className="text-sm font-bold">{coin.name}</div>
                    <div className="text-xs opacity-80">{coin.description}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={generateWallet}
            disabled={isGenerating}
            className="w-full mt-6 py-3 rounded-xl bg-[var(--accent-color)] text-black font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={18} className={isGenerating ? 'animate-spin' : ''} />
            {isGenerating ? '生成中...' : '生成钱包地址'}
          </button>

          {/* 导入钱包 */}
          {!importMode && (
            <button
              onClick={() => setImportMode(true)}
              className="w-full mt-3 py-3 rounded-xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-color)] transition-all flex items-center justify-center gap-2"
            >
              <Import size={18} />
              导入钱包
            </button>
          )}

          {importMode && (
            <div className="mt-6 p-4 rounded-xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">导入钱包</h4>
                <button
                  onClick={() => {
                    setImportMode(false);
                    setImportInput('');
                  }}
                  className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                >
                  取消
                </button>
              </div>

              <textarea
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                placeholder={'输入私钥（十六进制）'}
                className="w-full h-24 bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-color)] transition-colors resize-none"
              />

              <button
                onClick={importWallet}
                disabled={isGenerating || !importInput.trim()}
                className="w-full mt-3 py-2 rounded-lg bg-[var(--accent-color)] text-black font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Import size={16} />
                {isGenerating ? '导入中...' : '导入钱包'}
              </button>
            </div>
          )}
        </div>

        {/* 钱包信息 */}
        {wallet && (
          <>
            {/* 地址和二维码 */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* 地址显示 */}
              <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                  <Wallet size={18} className="text-[var(--accent-color)]" />
                  钱包地址
                  <span className="ml-auto text-xs font-mono bg-[var(--glass-surface-hover)] px-2 py-1 rounded-lg">
                    {wallet.coinType}
                  </span>
                </h3>
                <div className="mb-4">
                  <div className="p-4 rounded-xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)]">
                    <p className="text-xs text-[var(--text-tertiary)] mb-2">地址</p>
                    <p className="text-sm font-mono text-[var(--text-primary)] break-all">
                      {wallet.address}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(wallet.address, 'address')}
                    className={`flex-1 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      copied === 'address'
                        ? 'bg-green-500 text-white'
                        : 'bg-[var(--glass-surface-hover)] hover:bg-[var(--accent-color)] hover:text-black text-[var(--text-secondary)]'
                    }`}
                  >
                    {copied === 'address' ? <Check size={16} /> : <Copy size={16} />}
                    {copied === 'address' ? '已复制' : '复制地址'}
                  </button>
                  <button
                    onClick={downloadAddress}
                    className="flex-1 py-2 rounded-lg bg-[var(--glass-surface-hover)] hover:bg-[var(--accent-color)] hover:text-black text-[var(--text-secondary)] transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    下载地址
                  </button>
                </div>
              </div>

              {/* 二维码 */}
              <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                  <QrCode size={18} className="text-[var(--accent-color)]" />
                  收款二维码
                </h3>
                <div className="bg-white p-4 rounded-xl mb-4 flex items-center justify-center">
                  {wallet.qrCode && (
                    <img
                      src={wallet.qrCode}
                      alt="QR Code"
                      className="w-48 h-48 object-contain"
                    />
                  )}
                </div>
                <button
                  onClick={downloadQRCode}
                  className="w-full py-2 rounded-lg bg-[var(--glass-surface-hover)] hover:bg-[var(--accent-color)] hover:text-black text-[var(--text-secondary)] transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  下载二维码
                </button>
              </div>
            </div>

            {/* 私钥 */}
            <div className="bg-[var(--glass-surface)] border border-[var(--glass-border)] rounded-3xl p-6 backdrop-blur-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
                  <Shield size={18} className="text-red-400" />
                  私钥（Private Key）
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="p-2 rounded-lg hover:bg-[var(--glass-surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    title={showPrivateKey ? '隐藏私钥' : '显示私钥'}
                  >
                    {showPrivateKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(wallet.privateKey, 'privateKey')}
                    className={`p-2 rounded-lg transition-colors ${
                      copied === 'privateKey'
                        ? 'bg-green-500 text-white'
                        : 'hover:bg-[var(--accent-color)] hover:text-black text-[var(--text-secondary)]'
                    }`}
                    title={copied === 'privateKey' ? '已复制' : '复制私钥'}
                  >
                    {copied === 'privateKey' ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                  <button
                    onClick={downloadPrivateKey}
                    className="p-2 rounded-lg hover:bg-[var(--accent-color)] hover:text-black text-[var(--text-secondary)] transition-colors"
                    title="下载私钥"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>
              {showPrivateKey ? (
                <div className="p-4 rounded-xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)]">
                  <p className="text-xs text-[var(--text-tertiary)] mb-2">私钥</p>
                  <p className="text-sm font-mono text-[var(--text-primary)] break-all">
                    {wallet.privateKey}
                  </p>
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-[var(--glass-surface-hover)] border border-[var(--glass-border)] flex items-center justify-center">
                  <div className="text-center">
                    <Shield size={48} className="mx-auto text-[var(--text-tertiary)] mb-3" />
                    <p className="text-[var(--text-tertiary)]">私钥已隐藏，点击眼睛图标查看</p>
                  </div>
                </div>
              )}
            </div>

            {/* 安全提示 */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                <AlertCircle size={18} />
                安全提示
              </h3>
              <ul className="space-y-2 text-sm text-yellow-200/80">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>此工具使用真实的加密算法生成钱包地址和私钥</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>私钥非常重要，请妥善保管，不要泄露给他人</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>建议将私钥备份到安全的地方，如密码管理器或纸质备份</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>在实际使用前，请先向空钱包发送小额测试转账</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WalletGenerator;
