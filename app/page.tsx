// app/page.tsx
/* eslint-disable */


'use client'

import { useState, useEffect, useRef } from 'react'

declare global {
  interface Window {
    ethereum?: any;
  }
}
import { ethers } from 'ethers'
import Image from 'next/image'
import ConsensusVisualizer from '@/components/BlockchainVisualization';
import BlockchainNetworkVisualization from '@/components/BlockchainNetworkVisualization';

// Define TypeScript interfaces
interface Block {
  id: number
  hash: string
  timestamp: number
  transactions: Transaction[]
}

interface Transaction {
  id: string
  from: string
  to: string
  amount: string
  status: 'pending' | 'confirmed'
}

interface WalletState {
  address: string
  balance: string
  connected: boolean
  chainId: number | null
  provider: any
  signer: any
}

// Sepolia testnet chain ID
const SEPOLIA_CHAIN_ID = 11155111

export default function BlockchainLanding() {
  // State for blockchain data visualization
  const [blocks, setBlocks] = useState<Block[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [wallet, setWallet] = useState<WalletState>({
    address: '',
    balance: '0',
    connected: false,
    chainId: null,
    provider: null,
    signer: null
  })
  
  // Form state
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Animation refs
  const networkRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)

  // Check for MetaMask on load
  useEffect(() => {
    const checkMetaMask = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        // MetaMask is installed
        try {
          // Listen for account changes
          window.ethereum.on('accountsChanged', handleAccountsChanged)
          
          // Listen for chain changes
          window.ethereum.on('chainChanged', (chainId: string) => {
            window.location.reload()
          })
          
          // Check if already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts.length > 0) {
            connectWallet()
          }
        } catch (error) {
          console.error("Error checking MetaMask connection:", error)
        }
      }
    }

    checkMetaMask()
    generateDemoData()
    
    const interval = setInterval(() => {
      addNewBlock()
    }, 15000)
    
    return () => {
      clearInterval(interval)
      // Clean up event listeners
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  // Create particles effect
  useEffect(() => {
    if (particlesRef.current) {
      const container = particlesRef.current;
      
      // Create particles
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'matrix-particle';
        
        // Random position
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        
        // Random size
        const size = Math.random() * 2 + 1;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Random animation delay
        particle.style.animationDelay = `${Math.random() * 5}s`;
        
        container.appendChild(particle);
      }
    }
  }, []);

  // Handle account changes
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // User disconnected their account
      setWallet({
        address: '',
        balance: '0',
        connected: false,
        chainId: null,
        provider: null,
        signer: null
      })
    } else {
      // Update with new account
      connectWallet()
    }
  }

  // Fetch real blockchain data
  useEffect(() => {
    if (wallet.connected && wallet.provider) {
      fetchRealBlocks()
    }
  }, [wallet.connected, wallet.provider])

  const fetchRealBlocks = async () => {
    try {
      const provider = wallet.provider
      const currentBlock = await provider.getBlockNumber()
      
      const newBlocks: Block[] = []
      
      // Fetch the latest 5 blocks
      for (let i = 0; i < 5; i++) {
        if (currentBlock - i < 0) break
        
        const block = await provider.getBlock(currentBlock - i)
        if (block) {
          const blockTransactions: Transaction[] = []
          
          // Get a subset of transactions for UI display
          const txCount = Math.min(block.transactions.length, 3)
          for (let j = 0; j < txCount; j++) {
            try {
              const txHash = block.transactions[j]
              const tx = await provider.getTransaction(txHash)
              
              if (tx) {
                const txObj: Transaction = {
                  id: tx.hash.substring(0, 10),
                  from: tx.from || 'Unknown',
                  to: tx.to || 'Contract Creation',
                  amount: tx.value ? ethers.formatEther(tx.value) : '0',
                  status: 'confirmed'
                }
                
                blockTransactions.push(txObj)
                
                // Add to global transactions list
                setTransactions(prev => {
                  // Check if transaction already exists
                  if (!prev.find(t => t.id === txObj.id)) {
                    return [...prev, txObj]
                  }
                  return prev
                })
              }
            } catch (err) {
              console.error("Error fetching transaction details:", err)
            }
          }
          
          newBlocks.push({
            id: block.number,
            hash: block.hash.substring(0, 10),
            timestamp: block.timestamp ? block.timestamp * 1000 : Date.now(),
            transactions: blockTransactions
          })
        }
      }
      
      // Merge with existing blocks
      setBlocks(prev => {
        // Filter out duplicates
        const existingBlockIds = new Set(prev.map(b => b.id))
        const newUniqueBlocks = newBlocks.filter(b => !existingBlockIds.has(b.id))
        return [...prev, ...newUniqueBlocks].sort((a, b) => b.id - a.id).slice(0, 10)
      })
      
    } catch (error) {
      console.error("Error fetching blockchain data:", error)
    }
  }

  const generateDemoData = () => {
    const demoBlocks: Block[] = []
    const demoTransactions: Transaction[] = []
    
    for (let i = 1; i <= 5; i++) {
      const blockTransactions: Transaction[] = []
      
      for (let j = 0; j < Math.floor(Math.random() * 3) + 1; j++) {
        const tx: Transaction = {
          id: ethers.id(`tx-${i}-${j}`).substring(0, 10),
          from: generateRandomAddress(),
          to: generateRandomAddress(),
          amount: (Math.random() * 2).toFixed(4),
          status: 'confirmed'
        }
        
        blockTransactions.push(tx)
        demoTransactions.push(tx)
      }
      
      demoBlocks.push({
        id: i,
        hash: ethers.id(`block-${i}`).substring(0, 10),
        timestamp: Date.now() - (5-i) * 1000 * 60 * 2,
        transactions: blockTransactions
      })
    }
    
    setBlocks(demoBlocks)
    setTransactions(demoTransactions)
  }

  const addNewBlock = async () => {
    // If connected to real network, fetch real blocks
    if (wallet.connected && wallet.provider) {
      await fetchRealBlocks()
      return
    }
    
    // Demo block generation
    const pendingTxs = transactions
      .filter(tx => tx.status === 'pending')
      .map(tx => ({...tx, status: 'confirmed' as const}))
    
    if (pendingTxs.length > 0) {
      const newBlock: Block = {
        id: blocks.length + 1,
        hash: ethers.id(`block-${Date.now()}`).substring(0, 10),
        timestamp: Date.now(),
        transactions: pendingTxs
      }
      
      setBlocks(prev => [...prev, newBlock])
      
      // Update transaction status
      setTransactions(prev => 
        prev.map(tx => 
          tx.status === 'pending' ? {...tx, status: 'confirmed'} : tx
        )
      )
    }
  }

  const switchToSepolia = async () => {
    try {
      setLoading(true)
      setError('')
      
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed")
      }
      
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
      })
      
      // Reconnect to get updated chain info
      await connectWallet()
      
    } catch (error: any) {
      // Chain doesn't exist, let's add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
                chainName: 'Sepolia Testnet',
                nativeCurrency: {
                  name: 'Sepolia Ether',
                  symbol: 'ETH',
                  decimals: 18
                },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io']
              },
            ],
          })
          
          // Try connecting again
          await connectWallet()
          
        } catch (addError) {
          setError("Failed to add Sepolia network to MetaMask")
          console.error("Failed to add Sepolia:", addError)
        }
      } else {
        setError("Failed to switch to Sepolia network")
        console.error("Failed to switch to Sepolia:", error)
      }
    } finally {
      setLoading(false)
    }
  }

  const connectWallet = async () => {
    setLoading(true)
    setError('')
    
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed")
      }
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      
      if (accounts.length === 0) {
        throw new Error("No accounts found")
      }
      
      // Create ethers provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      
      // Get chain ID
      const network = await provider.getNetwork()
      const chainId = Number(network.chainId)
      
      // Get balance
      const balance = await provider.getBalance(address)
      const formattedBalance = ethers.formatEther(balance)
      
      setWallet({
        address,
        balance: Number(formattedBalance).toFixed(4),
        connected: true,
        chainId,
        provider,
        signer
      })
      
      // If not on Sepolia, show warning or switch
      if (chainId !== SEPOLIA_CHAIN_ID) {
        setError("Please switch to Sepolia testnet for full functionality")
      }
      
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      setError(error.message || "Failed to connect wallet")
      
      setWallet({
        address: '',
        balance: '0',
        connected: false,
        chainId: null,
        provider: null,
        signer: null
      })
    } finally {
      setLoading(false)
    }
  }

  const sendTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!recipient || !amount || parseFloat(amount) <= 0) {
      setError("Please provide a valid recipient and amount")
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      if (!wallet.connected || !wallet.signer) {
        throw new Error("Wallet not connected")
      }
      
      // Check if on Sepolia
      if (wallet.chainId !== SEPOLIA_CHAIN_ID) {
        throw new Error("Please switch to Sepolia testnet to send transactions")
      }
      
      // Validate address
      if (!ethers.isAddress(recipient)) {
        throw new Error("Invalid recipient address")
      }
      
      // Create transaction
      const tx = await wallet.signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount)
      })
      
      // Add to pending transactions
      const newTx: Transaction = {
        id: tx.hash.substring(0, 10),
        from: wallet.address,
        to: recipient,
        amount: amount,
        status: 'pending'
      }
      
      setTransactions(prev => [...prev, newTx])
      
      // Update UI to show transaction is pending
      if (networkRef.current) {
        const newDot = document.createElement('div')
        newDot.className = 'transaction-dot'
        networkRef.current.appendChild(newDot)
        
        // Random position
        const x = Math.random() * 80 + 10
        const y = Math.random() * 80 + 10
        
        newDot.style.left = `${x}%`
        newDot.style.top = `${y}%`
        
        // Animate
        setTimeout(() => {
          newDot.classList.add('pulse')
          setTimeout(() => {
            newDot.remove()
          }, 2000)
        }, 100)
      }
      
      // Wait for transaction to be mined
      const receipt = await tx.wait()
      
      if (receipt) {
        // Update transaction status
        setTransactions(prev => 
          prev.map(t => 
            t.id === newTx.id ? {...t, status: 'confirmed'} : t
          )
        )
        
        // Update balance
        if (wallet.provider) {
          const newBalance = await wallet.provider.getBalance(wallet.address)
          setWallet(prev => ({
            ...prev,
            balance: Number(ethers.formatEther(newBalance)).toFixed(4)
          }))
        }
        
        // Clear form
        setRecipient('')
        setAmount('')
      }
      
    } catch (error: any) {
      console.error("Transaction error:", error)
      setError(error.message || "Transaction failed")
    } finally {
      setLoading(false)
    }
  }

  const generateRandomAddress = () => {
    return `0x${Array.from({length: 20}, () => 
      Math.floor(Math.random() * 16).toString(16)).join('')}`
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const truncateAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Matrix particles background */}
      <div ref={particlesRef} className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
      </div>
      
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/80 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white animate-pulse" />
            <h1 className="text-xl font-bold text-white glitch-text">
              BlockChain Explorer
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {wallet.connected && wallet.chainId !== SEPOLIA_CHAIN_ID && (
              <button
                onClick={switchToSepolia}
                disabled={loading}
                className="px-3 py-1 bg-white text-black hover:bg-gray-300 rounded-md text-sm transition-all duration-300 disabled:opacity-50"
              >
                Switch to Sepolia
              </button>
            )}
            
            {!wallet.connected ? (
              <button 
                onClick={connectWallet}
                disabled={loading}
                className="px-4 py-2 bg-white text-black hover:bg-gray-300 rounded-md transition-all duration-300 disabled:opacity-50 flex items-center gap-2 glitch-border"
              >
                {loading ? 'Connecting...' : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 35 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M32.9582 1L19.8241 10.7183L22.2541 5.11667L32.9582 1Z" fill="#000" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2.04183 1L15.0487 10.809L12.7458 5.11667L2.04183 1Z" fill="#000" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M28.2204 23.4514L24.6729 28.7722L32.3119 30.7635L34.5458 23.5786L28.2204 23.4514Z" fill="#000" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M0.46875 23.5786L2.69271 30.7635L10.3317 28.7722L6.78417 23.4514L0.46875 23.5786Z" fill="#000" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9.91576 14.5149L7.83984 17.6097L15.4317 17.9547L15.1503 9.81787L9.91576 14.5149Z" fill="#000" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M25.0842 14.5149L19.7769 9.72705L19.5682 17.9547L27.1601 17.6097L25.0842 14.5149Z" fill="#000" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10.3317 28.7722L14.9685 26.6326L10.9769 23.6333L10.3317 28.7722Z" fill="#000" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20.0315 26.6326L24.6682 28.7722L24.0231 23.6333L20.0315 26.6326Z" fill="#000" stroke="#000" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Connect MetaMask
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-gray-900 px-3 py-1 rounded-full border border-white/50 hover:border-white transition-all duration-300">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>{truncateAddress(wallet.address)}</span>
                <span className="text-white">{wallet.balance} ETH</span>
                {wallet.chainId === SEPOLIA_CHAIN_ID && (
                  <span className="bg-white/10 text-white text-xs px-2 py-0.5 rounded-full">Sepolia</span>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Hero section */}
      <section className="relative z-10 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight glitch-heading">
             <span className="text-white typewriter">Blockchain Technology</span>
            </h2>
            <p className="text-lg text-gray-400 mb-8 typing-text">
              Explore, interact, and send real transactions on the Sepolia Testnet
            </p>
            
            {error && (
              <div className="bg-white/5 border border-white/20 text-white p-3 rounded-lg mb-6 glitch-error">
                {error}
              </div>
            )}
            
            {wallet.connected && (
              <div className="bg-black/80 backdrop-blur-sm p-6 rounded-xl border border-white/20 max-w-md mx-auto hover:border-white/40 transition-all duration-500 glitch-card">
                <h3 className="text-xl font-semibold mb-4 text-white">Send Sepolia ETH</h3>
                <form onSubmit={sendTransaction} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Recipient Address</label>
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="0x..."
                      className="w-full p-2 bg-black border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Amount (ETH)</label>
                    <input
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.0"
                      className="w-full p-2 bg-black border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !recipient || !amount || wallet.chainId !== SEPOLIA_CHAIN_ID}
                    className="w-full py-2 bg-white hover:bg-gray-200 text-black rounded-md transition-all duration-300 disabled:opacity-50 glitch-button"
                  >
                    {loading ? 'Processing...' : 'Send Tokens'}
                  </button>
                  
                  {wallet.chainId !== SEPOLIA_CHAIN_ID && (
                    <p className="text-sm text-white/80 mt-2">
                      Please switch to Sepolia network to send transactions
                    </p>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Network Visualization */}
      <section className="relative z-10 py-12 bg-black/60">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center text-white glitch-subtitle">
            {wallet.connected && wallet.chainId === SEPOLIA_CHAIN_ID 
              ? 'Sepolia Network Visualization'
              : 'Blockchain Network'
            }
          </h2>
          
          <BlockchainNetworkVisualization/>
          <ConsensusVisualizer/>
          
          {/* Blockchain and transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Blocks */}
            <div className="bg-black backdrop-blur-sm rounded-xl border border-white/20 p-6 hover:border-white/40 transition-all duration-500 opacity-90 hover:opacity-100">
              <h3 className="text-xl font-semibold mb-4 text-white">Latest Blocks</h3>
              <div className="space-y-4">
                {blocks.slice().sort((a, b) => b.id - a.id).slice(0, 5).map((block, idx) => (
                  <div 
                    key={block.id} 
                    className="bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-all duration-500 block-item"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-white data-value">Block #{block.id}</span>
                      <span className="text-sm text-gray-400">{formatTime(block.timestamp)}</span>
                    </div>
                    <div className="text-sm text-gray-300">
                      <p><span className="text-gray-400">Hash:</span> <span className="data-value">{block.hash}</span></p>
                      <p><span className="text-gray-400">Transactions:</span> <span className="data-value">{block.transactions.length}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Transactions */}
            <div className="bg-black backdrop-blur-sm rounded-xl border border-white/20 p-6 hover:border-white/40 transition-all duration-500 opacity-90 hover:opacity-100">
              <h3 className="text-xl font-semibold mb-4 text-white">Recent Transactions</h3>
              <div className="space-y-4">
                {transactions.slice().reverse().slice(0, 5).map((tx, idx) => (
                  <div 
                    key={tx.id} 
                    className={`
                      bg-white/5 p-4 rounded-lg transition-all duration-500 transaction-item
                      ${tx.status === 'pending' ? 'border-l-4 border-white/50' : 'border-l-4 border-white'}
                    `}
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-white data-value">Tx: {tx.id}</span>
                      <span className={`
                        text-sm px-2 py-0.5 rounded-full
                        ${tx.status === 'pending' ? 'bg-white/10 text-white/80' : 'bg-white/20 text-white'}
                      `}>
                        {tx.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-300">
                      <p><span className="text-gray-400">From:</span> <span className="data-value">{truncateAddress(tx.from)}</span></p>
                      <p><span className="text-gray-400">To:</span> <span className="data-value">{truncateAddress(tx.to)}</span></p>
                      <p><span className="text-gray-400">Amount:</span> <span className="data-value">{tx.amount} ETH</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Global styles */}
    </main>
  )
}