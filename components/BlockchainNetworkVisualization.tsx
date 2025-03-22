/* eslint-disable */
"use client"
import React, { useEffect, useState, useRef } from 'react';

interface Node {
  id: number;
  x: number;
  y: number;
  size: number;
  pulseSpeed: number;
  delay: number;
  type: 'validator' | 'miner' | 'fullnode' | 'wallet' | 'oracle';
}

interface Connection {
  id: string;
  source: number;
  target: number;
  strength: number;
  animated: boolean;
  speed: number;
  color: 'consensus' | 'mining' | 'data' | 'p2p';
}

interface Block {
  id: number;
  x: number;
  y: number;
  hash: string;
  txCount: number;
  progress: number;
  animationDelay: number;
}

interface Transaction {
  id: number;
  source: number;
  target: number;
  amount: number;
  speed: number;
  delay: number;
  confirmed: boolean;
}

const BlockchainNetworkVisualization: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialize nodes and connections
  useEffect(() => {
    // Create nodes with blockchain-specific types
    const nodeCount = 16;
    const newNodes: Node[] = Array.from({ length: nodeCount }).map((_, i) => {
      // Create a more structured layout
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 30 + Math.random() * 35; // Distance from center with some randomness
      
      // Add some nodes in center, some in middle ring, some in outer ring
      const ringFactor = i % 3 === 0 ? 0.4 : i % 3 === 1 ? 0.7 : 1;
      
      // Assign blockchain-specific node types
      let type: Node['type'];
      if (i % 5 === 0) type = 'validator';
      else if (i % 5 === 1) type = 'miner';
      else if (i % 5 === 2) type = 'fullnode';
      else if (i % 5 === 3) type = 'wallet';
      else type = 'oracle';
      
      return {
        id: i,
        x: 50 + Math.cos(angle) * radius * ringFactor,
        y: 50 + Math.sin(angle) * radius * ringFactor,
        size: type === 'validator' ? 5 : type === 'miner' ? 4.5 : type === 'fullnode' ? 4 : 3,
        pulseSpeed: 2 + Math.random() * 3,
        delay: i * 0.2,
        type: type,
      };
    });
    
    setNodes(newNodes);
    
    // Create blockchain-specific connections
    const newConnections: Connection[] = [];
    
    // Connect nodes in a blockchain network topology
    newNodes.forEach((node, i) => {
      // Validators connect to all miners and each other
      if (node.type === 'validator') {
        newNodes.filter(n => n.type === 'miner' || n.type === 'validator').forEach(target => {
          if (node.id !== target.id) { // Don't connect to self
            newConnections.push({
              id: `${node.id}-${target.id}`,
              source: node.id,
              target: target.id,
              strength: 0.8 + Math.random() * 0.2,
              animated: true,
              speed: 2 + Math.random() * 1,
              color: 'consensus'
            });
          }
        });
      }
      
      // Miners connect to full nodes
      if (node.type === 'miner') {
        newNodes.filter(n => n.type === 'fullnode').forEach(target => {
          if (Math.random() > 0.3) {
            newConnections.push({
              id: `${node.id}-${target.id}`,
              source: node.id,
              target: target.id,
              strength: 0.6 + Math.random() * 0.2,
              animated: true,
              speed: 3 + Math.random() * 2,
              color: 'mining'
            });
          }
        });
      }
      
      // Full nodes connect to wallets and oracles
      if (node.type === 'fullnode') {
        newNodes.filter(n => n.type === 'wallet' || n.type === 'oracle').forEach(target => {
          if (Math.random() > 0.5) {
            newConnections.push({
              id: `${node.id}-${target.id}`,
              source: node.id,
              target: target.id,
              strength: 0.4 + Math.random() * 0.3,
              animated: Math.random() > 0.3,
              speed: 4 + Math.random() * 2,
              color: 'data'
            });
          }
        });
      }
      
      // Add cross-connections for network redundancy
      if (Math.random() > 0.8) {
        const randomNodeIndex = Math.floor(Math.random() * newNodes.length);
        if (randomNodeIndex !== i) {
          newConnections.push({
            id: `${node.id}-${newNodes[randomNodeIndex].id}-random`,
            source: node.id,
            target: newNodes[randomNodeIndex].id,
            strength: 0.3 + Math.random() * 0.2,
            animated: Math.random() > 0.5,
            speed: 3 + Math.random() * 3,
            color: 'p2p'
          });
        }
      }
    });
    
    setConnections(newConnections);
    
    // Create blockchain blocks
    const blockCount = 8;
    const newBlocks: Block[] = Array.from({ length: blockCount }).map((_, i) => {
      return {
        id: i,
        x: 50 + Math.cos((i / blockCount) * Math.PI * 2) * 20,
        y: 50 + Math.sin((i / blockCount) * Math.PI * 2) * 20,
        hash: Array.from({ length: 8 }).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        txCount: Math.floor(Math.random() * 15) + 3,
        progress: i === blockCount - 1 ? Math.random() * 0.9 : 1, // Latest block is being mined
        animationDelay: i * 0.5
      };
    });
    
    setBlocks(newBlocks);
    
    // Create transactions
    const txCount = 20;
    const newTransactions: Transaction[] = Array.from({ length: txCount }).map((_, i) => {
      const sourceNodeIndex = Math.floor(Math.random() * newNodes.length);
      let targetNodeIndex;
      do {
        targetNodeIndex = Math.floor(Math.random() * newNodes.length);
      } while (targetNodeIndex === sourceNodeIndex);
      
      return {
        id: i,
        source: sourceNodeIndex,
        target: targetNodeIndex,
        amount: Math.floor(Math.random() * 100) / 10,
        speed: 3 + Math.random() * 5,
        delay: i * 0.3,
        confirmed: Math.random() > 0.3
      };
    });
    
    setTransactions(newTransactions);
  }, []);
  
  // Hash visualization
  const HashBackground: React.FC = () => {
    return (
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div 
            key={i}
            className="absolute text-green-400 text-opacity-60 font-mono text-xs leading-none whitespace-nowrap"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: 'rotate(90deg)',
              animationDuration: `${10 + Math.random() * 10}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          >
            {Array.from({ length: 12 }).map((_, j) => (
              <div key={j}>
                {Array.from({ length: 64 }).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Animation for data packets/transactions traveling along connections
  const TransactionPackets: React.FC = () => {
    return (
      <>
        {transactions.map(tx => {
          const sourceNode = nodes.find(n => n.id === tx.source);
          const targetNode = nodes.find(n => n.id === tx.target);
          
          if (!sourceNode || !targetNode) return null;
          
          return (
            <div
              key={`tx-${tx.id}`}
              className={`absolute w-2 h-2 rounded-full ${tx.confirmed ? 'bg-green-400 shadow-green-500/50' : 'bg-yellow-400 shadow-yellow-500/50'} shadow-lg`}
              style={{
                left: `${sourceNode.x}%`,
                top: `${sourceNode.y}%`,
                animation: `movePacket-tx-${tx.id} ${tx.speed}s infinite`,
                animationDelay: `${tx.delay}s`
              }}
            />
          );
        })}
      </>
    );
  };

  const getNodeColorByType = (type: Node['type']): string => {
    switch(type) {
      case 'validator': return 'bg-purple-500';
      case 'miner': return 'bg-red-500';
      case 'fullnode': return 'bg-blue-500';
      case 'wallet': return 'bg-green-500';
      case 'oracle': return 'bg-yellow-500';
      default: return 'bg-white';
    }
  };

  const getConnectionColor = (type: Connection['color']): string => {
    switch(type) {
      case 'consensus': return 'rgba(147, 51, 234, 0.7)'; // Purple for consensus
      case 'mining': return 'rgba(239, 68, 68, 0.7)'; // Red for mining
      case 'data': return 'rgba(59, 130, 246, 0.7)'; // Blue for data
      case 'p2p': return 'rgba(16, 185, 129, 0.7)'; // Green for p2p
      default: return 'rgba(255, 255, 255, 0.5)';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative h-96 bg-gray-900 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black to-gray-900"></div>
      <HashBackground />
      
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="consensusGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#9333ea" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#9333ea" stopOpacity="0.2" />
          </linearGradient>
          
          <linearGradient id="miningGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
          </linearGradient>
          
          <linearGradient id="dataGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
          </linearGradient>
          
          <linearGradient id="p2pGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
          </linearGradient>
          
          {/* Add styles for transaction animations */}
          <style>
            {transactions.map(tx => {
              const sourceNode = nodes.find(n => n.id === tx.source);
              const targetNode = nodes.find(n => n.id === tx.target);
              
              if (!sourceNode || !targetNode) return '';
              
              return `
                @keyframes movePacket-tx-${tx.id} {
                  0% {
                    left: ${sourceNode.x}%;
                    top: ${sourceNode.y}%;
                    opacity: 0;
                  }
                  10% {
                    opacity: 1;
                  }
                  90% {
                    opacity: 1;
                  }
                  100% {
                    left: ${targetNode.x}%;
                    top: ${targetNode.y}%;
                    opacity: 0;
                  }
                }
              `;
            }).join('')}
          </style>
        </defs>
        
        {/* Render connections with relevant styling */}
        {connections.map(conn => {
          const sourceNode = nodes.find(n => n.id === conn.source);
          const targetNode = nodes.find(n => n.id === conn.target);
          
          if (!sourceNode || !targetNode) return null;
          
          let gradientId: string;
          switch(conn.color) {
            case 'consensus': gradientId = "consensusGradient"; break;
            case 'mining': gradientId = "miningGradient"; break;
            case 'data': gradientId = "dataGradient"; break;
            case 'p2p': gradientId = "p2pGradient"; break;
            default: gradientId = "p2pGradient";
          }
          
          return (
            <line 
              key={conn.id}
              x1={`${sourceNode.x}%`} 
              y1={`${sourceNode.y}%`} 
              x2={`${targetNode.x}%`} 
              y2={`${targetNode.y}%`} 
              stroke={`url(#${gradientId})`}
              strokeOpacity={conn.strength}
              strokeWidth={conn.strength * 2}
              strokeDasharray={conn.animated ? "5,5" : "none"}
              className={conn.animated ? "animate-pulse" : ""}
              style={{
                animationDuration: `${conn.speed}s`
              }}
            />
          );
        })}
      </svg>
      
      {/* Blockchain Visualization */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40">
        {blocks.map((block, index) => {
          const prevBlock = index > 0 ? blocks[index - 1] : null;
          
          return (
            <div key={block.id} className="absolute">
              {/* Block */}
              <div 
                className="absolute flex flex-col justify-center items-center bg-gray-800 border border-gray-600 rounded shadow-lg"
                style={{
                  left: `${block.x}%`,
                  top: `${block.y}%`,
                  width: '40px',
                  height: '30px',
                  transform: 'translate(-50%, -50%)',
                  opacity: block.progress < 1 ? 0.7 : 1,
                  animationDelay: `${block.animationDelay}s`
                }}
              >
                <div className="text-xs text-green-400 font-mono">#{block.id}</div>
                <div className="text-xs text-gray-400 font-mono truncate w-full text-center">{block.hash}</div>
              </div>
              
              {/* Chain link */}
              {prevBlock && (
                <svg 
                  className="absolute w-full h-full left-0 top-0 z-0"
                  style={{
                    opacity: block.progress < 1 ? 0.5 : 0.8
                  }}
                >
                  <line 
                    x1={`${prevBlock.x}%`}
                    y1={`${prevBlock.y}%`}
                    x2={`${block.x}%`}
                    y2={`${block.y}%`}
                    stroke="#4ade80"
                    strokeWidth="1"
                    strokeDasharray="3,2"
                  />
                </svg>
              )}
              
              {/* Mining progress indicator for the latest block */}
              {block.progress < 1 && (
                <div 
                  className="absolute bg-red-500 h-1 rounded-full animate-pulse"
                  style={{
                    width: `${40 * block.progress}px`,
                    left: `${block.x - 20}%`,
                    top: `${block.y + 15}%`,
                    transform: 'translateY(-50%)'
                  }}
                ></div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Network nodes */}
      {nodes.map(node => (
        <div 
          key={node.id}
          className={`absolute rounded-full ${getNodeColorByType(node.type)} animate-pulse z-10`}
          style={{
            left: `${node.x}%`,
            top: `${node.y}%`,
            width: `${node.size * 2}px`,
            height: `${node.size * 2}px`,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 ${node.size * 2}px ${getNodeColorByType(node.type).replace('bg-', '')}`,
            animationDuration: `${node.pulseSpeed}s`,
            animationDelay: `${node.delay}s`
          }}
        >
          <div className={`absolute inset-0 rounded-full ${getNodeColorByType(node.type)} animate-ping opacity-50`}
            style={{
              animationDuration: `${node.pulseSpeed * 1.5}s`,
              animationDelay: `${node.delay}s`
            }}
          />
        </div>
      ))}
      
      {/* Transactions */}
      <TransactionPackets />
      
      {/* Legend */}
      <div className="absolute bottom-2 right-2 bg-black/70 p-2 rounded text-xs text-white">
        <div className="font-bold mb-1 text-center border-b border-gray-600 pb-1">Blockchain Network</div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
          <span>Validator</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <span>Miner</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span>Full Node</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span>Wallet</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          <span>Oracle</span>
        </div>
      </div>
      
      {/* Blockchain Stats */}
      <div className="absolute top-2 left-2 bg-black/70 p-2 rounded text-xs text-white">
        <div className="font-bold mb-1 text-center border-b border-gray-600 pb-1">Blockchain Stats</div>
        <div className="flex justify-between mb-1">
          <span>Blocks:</span>
          <span className="font-mono">{blocks.length}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Last Block:</span>
          <span className="font-mono">#{blocks.length > 0 ? blocks[blocks.length-1].id : '0'}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Mining:</span>
          <span className="font-mono text-red-400 animate-pulse">In Progress</span>
        </div>
        <div className="flex justify-between">
          <span>Tx Pool:</span>
          <span className="font-mono">{transactions.length}</span>
        </div>
      </div>
    </div>
  );
};

export default BlockchainNetworkVisualization;