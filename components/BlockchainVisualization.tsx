/* eslint-disable */
import React, { useState, useEffect } from 'react';

// Define interfaces outside of component
interface PowBlock {
  id: number;
  hash: string;
  nonce: number;
  timestamp: number;
  transactions: number;
  previousHash: string;
  miner: string;
  difficulty: number;
  energyUsed: number;
  timeToMine: number | string;
}

interface PosBlock {
  id: number;
  hash: string;
  nonce?: number; // Made optional since it's not used in all cases
  timestamp: number;
  transactions: number;
  previousHash: string;
  validator: string;
  stake: number;
  rewards: number;
  energyUsed: string | number;
}

interface Validator {
  id: number;
  name: string;
  stake: number;
  totalStaked: number;
  blocksValidated: number;
  reputation: number;
}

const ConsensusVisualizer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pow' | 'pos'>('pow');
  const [powBlocks, setPowBlocks] = useState<PowBlock[]>([]);
  const [posBlocks, setPosBlocks] = useState<PosBlock[]>([]);
  const [selectedPowBlock, setSelectedPowBlock] = useState<PowBlock | null>(null);
  const [selectedPosBlock, setSelectedPosBlock] = useState<PosBlock | null>(null);
  const [powMiningInProgress, setPowMiningInProgress] = useState<boolean>(false);
  const [powHashAttempts, setPowHashAttempts] = useState<number>(0);
  const [powDifficulty, setPowDifficulty] = useState<number>(2);
  const [validators, setValidators] = useState<Validator[]>([]);
  const [currentValidator, setCurrentValidator] = useState<Validator | null>(null);

  // Initialize blockchain data
  useEffect(() => {
    generateInitialPowBlocks();
    generateInitialPosBlocks();
    generateValidators();
  }, []);

  // Generate initial Proof of Work blocks
  const generateInitialPowBlocks = (): void => {
    const initialBlocks: PowBlock[] = [];
    
    // Genesis block
    const genesisBlock: PowBlock = {
      id: 1,
      hash: "000" + generateHash().substring(3),
      nonce: 4251,
      timestamp: Date.now(),
      transactions: 3,
      previousHash: "0000000000000000",
      miner: "Miner 3",
      difficulty: powDifficulty,
      energyUsed: 125, // kWh
      timeToMine: 12 // seconds
    };
    
    initialBlocks.push(genesisBlock);
    
    // Generate additional initial blocks
    for (let i = 2; i <= 5; i++) {
      const prevBlock: PowBlock = initialBlocks[i-2];
      const energyUsed = Math.floor(Math.random() * 100) + 75;
      const timeToMine = Math.floor(Math.random() * 30) + 5;
      
      const newBlock: PowBlock = {
        id: i,
        hash: "000" + generateHash().substring(3),
        nonce: Math.floor(Math.random() * 10000),
        timestamp: prevBlock.timestamp + 600000 + Math.floor(Math.random() * 300000),
        transactions: Math.floor(Math.random() * 10) + 3,
        previousHash: prevBlock.hash,
        miner: `Miner ${Math.floor(Math.random() * 5) + 1}`,
        difficulty: powDifficulty,
        energyUsed: energyUsed,
        timeToMine: timeToMine
      };
      
      initialBlocks.push(newBlock);
    }
    
    setPowBlocks(initialBlocks);
  };
  
  // Generate initial Proof of Stake blocks
  const generateInitialPosBlocks = (): void => {
    const initialBlocks: PosBlock[] = [];
    
    // Genesis block
    const genesisBlock: PosBlock = {
      id: 1,
      hash: generateHash(),
      nonce: Math.floor(Math.random() * 10000),
      timestamp: Date.now() - 9000000,
      transactions: 5,
      previousHash: "0000000000000000",
      validator: "Validator 1",
      stake: 15000,
      rewards: 12,
      energyUsed: 0.5 // kWh
    };
    
    initialBlocks.push(genesisBlock);
    
    // Generate additional initial blocks
    for (let i = 2; i <= 5; i++) {
      const prevBlock: PosBlock = initialBlocks[i-2];
      const validatorNum = Math.floor(Math.random() * 5) + 1;
      const stake = 5000 + (validatorNum * 2000);
      const newBlock: PosBlock = {
        id: i,
        hash: generateHash(),
        nonce: Math.floor(Math.random() * 10000),
        timestamp: prevBlock.timestamp + 15000 + Math.floor(Math.random() * 30000),
        transactions: Math.floor(Math.random() * 15) + 3,
        previousHash: prevBlock.hash,
        validator: `Validator ${validatorNum}`,
        stake: stake,
        rewards: Math.floor(stake * 0.001),
        energyUsed: (Math.random() * 0.4 + 0.3).toFixed(2) // kWh
      };
        
      initialBlocks.push(newBlock);
    }
      
    setPosBlocks(initialBlocks);
  };
  
  // Generate random hash
  const generateHash = (): string => {
    return Array(64).fill(0).map(() => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };
  
  // Generate proof-of-work hash that meets difficulty
  const generatePowHash = (difficulty: number): { hash: string; attempts: number } => {
    let hash = '';
    let attempts = 0;
    const prefix = '0'.repeat(difficulty);
    
    do {
      hash = generateHash();
      attempts++;
      
      // Update hash attempts for UI
      if (attempts % 5 === 0) {
        setPowHashAttempts(attempts);
      }
    } while (!hash.startsWith(prefix) && attempts < 300);
    
    setPowHashAttempts(attempts);
    return { hash, attempts };
  };
  
  // Generate validators for PoS
  const generateValidators = (): void => {
    const newValidators: Validator[] = [];
    
    for (let i = 1; i <= 5; i++) {
      const baseStake = 5000 + (i * 2000);
      
      newValidators.push({
        id: i,
        name: `Validator ${i}`,
        stake: baseStake,
        totalStaked: baseStake + Math.floor(Math.random() * 3000),
        blocksValidated: Math.floor(Math.random() * 50) + 10,
        reputation: 80 + Math.floor(Math.random() * 20)
      });
    }
    
    setValidators(newValidators);
  };
  
  // Mine a new Proof of Work block
  const mineNewPowBlock = async (): Promise<void> => {
    if (powMiningInProgress || powBlocks.length === 0) return;
    
    setPowMiningInProgress(true);
    setPowHashAttempts(0);
    
    const prevBlock = powBlocks[powBlocks.length - 1];
    const startTime = Date.now();
    
    // Simulate the mining process with some delay
    setTimeout(() => {
      const { hash, attempts } = generatePowHash(powDifficulty);
      const mineTime = (Date.now() - startTime) / 1000;
      
      const newBlock: PowBlock = {
        id: prevBlock.id + 1,
        hash: hash,
        nonce: Math.floor(Math.random() * 10000),
        timestamp: Date.now(),
        transactions: Math.floor(Math.random() * 10) + 3,
        previousHash: prevBlock.hash,
        miner: `Miner ${Math.floor(Math.random() * 5) + 1}`,
        difficulty: powDifficulty,
        energyUsed: Math.floor(attempts * 0.5), // kWh (simplified model)
        timeToMine: mineTime.toFixed(1)
      };
      
      setPowBlocks([...powBlocks, newBlock]);
      setPowMiningInProgress(false);
    }, 2000);
  };
  
  // Create a new Proof of Stake block
  const createNewPosBlock = (): void => {
    if (posBlocks.length === 0 || !validators.length) return;
    
    const prevBlock = posBlocks[posBlocks.length - 1];
    
    // Select validator (in real PoS this would be based on stake weight)
    const selectedValidator = validators[Math.floor(Math.random() * validators.length)];
    setCurrentValidator(selectedValidator);
    
    // Create new block with a short delay to simulate consensus
    setTimeout(() => {
      const newBlock: PosBlock = {
        id: prevBlock.id + 1,
        hash: generateHash(),
        timestamp: Date.now(),
        transactions: Math.floor(Math.random() * 15) + 3,
        previousHash: prevBlock.hash,
        validator: selectedValidator.name,
        stake: selectedValidator.stake,
        rewards: Math.floor(selectedValidator.stake * 0.001),
        energyUsed: (Math.random() * 0.4 + 0.3).toFixed(2) // kWh
      };
      
      setPosBlocks([...posBlocks, newBlock]);
      setCurrentValidator(null);
    }, 1000);
  };
  
  // Format timestamp
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  // Get difficulty indicator
  const getDifficultyIndicator = (difficulty: number): string => {
    return "■".repeat(difficulty);
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto p-4 bg-black text-white">
      {/* Consensus Selection Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'pow' ? 'border-b-2 border-blue-400' : 'text-gray-400'}`}
          onClick={() => setActiveTab('pow')}
        >
          Proof of Work
        </button>
        <button 
          className={`py-2 px-4 font-medium ${activeTab === 'pos' ? 'border-b-2 border-blue-400' : 'text-gray-400'}`}
          onClick={() => setActiveTab('pos')}
        >
          Proof of Stake
        </button>
      </div>
      
      {/* Proof of Work View */}
      {activeTab === 'pow' && (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold">Proof of Work Blockchain</h2>
            <p className="text-sm text-gray-400 mt-1">
              Miners compete to solve a cryptographic puzzle by finding a hash with a specific number of leading zeros.
            </p>
          </div>
          
          {/* PoW Mining Status */}
          {powMiningInProgress && (
            <div className="mb-4 p-3 border border-gray-700 rounded bg-gray-900">
              <div className="text-sm font-semibold mb-1">Mining in progress...</div>
              <div className="flex items-center">
                <div className="w-full bg-gray-800 rounded-full h-2.5 mr-4">
                  <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${Math.min(powHashAttempts / 3, 100)}%` }}></div>
                </div>
                <span className="text-xs">{powHashAttempts} attempts</span>
              </div>
            </div>
          )}
          
          {/* PoW Blockchain visualization */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex items-center p-4 space-x-3">
              {powBlocks.map((block) => (
                <div 
                  key={block.id}
                  onClick={() => setSelectedPowBlock(block)}
                  className={`relative flex-shrink-0 w-32 h-48 border rounded-md p-3 cursor-pointer transition-all duration-300 hover:shadow-md ${
                    selectedPowBlock?.id === block.id 
                      ? 'bg-gray-800 border-blue-400' 
                      : 'bg-gray-900 border-gray-700'
                  }`}
                >
                  <div className="text-sm font-semibold mb-1">Block #{block.id}</div>
                  <div className="absolute top-3 right-3 text-xs bg-blue-600 text-white px-1 rounded">
                    {getDifficultyIndicator(block.difficulty)}
                  </div>
                  <div className="text-xs text-gray-400 mb-1 truncate">
                    Txs: {block.transactions}
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    {formatTime(block.timestamp)}
                  </div>
                  <div className="text-xs text-gray-400 mb-1 truncate">
                    Nonce: {block.nonce}
                  </div>
                  <div className="text-xs text-gray-400 mb-1 truncate">
                    Miner: {block.miner}
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    Energy: {block.energyUsed} kWh
                  </div>
                  <div className="text-xs text-gray-400">
                    Time: {block.timeToMine}s
                  </div>
                </div>
              ))}
              
              {powMiningInProgress && (
                <div className="flex-shrink-0 w-32 h-48 border border-dashed border-gray-600 rounded-md p-3 flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <div className="inline-block animate-spin h-6 w-6 border-2 border-blue-400 border-t-transparent rounded-full mb-2"></div>
                    <div className="text-xs text-gray-400">Mining...</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* PoW Selected block details */}
          {selectedPowBlock && (
            <div className="border border-gray-700 rounded-lg p-4 bg-gray-900 mb-6">
              <h3 className="text-lg font-bold mb-3">Block #{selectedPowBlock.id} Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-gray-300">Hash (with leading zeros):</div>
                    <div className="text-xs font-mono bg-gray-800 p-2 rounded border border-gray-700 overflow-x-auto">
                      {selectedPowBlock.hash}
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-gray-300">Previous Hash:</div>
                    <div className="text-xs font-mono bg-gray-800 p-2 rounded border border-gray-700 overflow-x-auto">
                      {selectedPowBlock.previousHash}
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-gray-300">Nonce:</div>
                    <div>{selectedPowBlock.nonce}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      The nonce is adjusted by miners to find a hash with the required number of leading zeros
                    </div>
                  </div>
                </div>
                <div>
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-gray-300">Difficulty:</div>
                    <div>{getDifficultyIndicator(selectedPowBlock.difficulty)} ({selectedPowBlock.difficulty})</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Represents the number of leading zeros required in the hash
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-gray-300">Energy Consumed:</div>
                    <div>{selectedPowBlock.energyUsed} kWh</div>
                    <div className="text-xs text-gray-500 mt-1">
                      PoW requires significant computational power and energy
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-gray-300">Miner:</div>
                    <div>{selectedPowBlock.miner}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      The miner who successfully found a valid hash first
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* PoW controls */}
          <div className="flex justify-center space-x-4 mb-6">
            <button 
              className={`px-4 py-2 bg-blue-600 text-white rounded ${powMiningInProgress ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              onClick={mineNewPowBlock}
              disabled={powMiningInProgress}
            >
              Mine New Block
            </button>
            <div className="flex items-center">
              <span className="mr-2 text-sm">Difficulty:</span>
              <select 
                className="border border-gray-700 rounded px-2 py-1 bg-gray-800 text-white"
                value={powDifficulty}
                onChange={(e) => setPowDifficulty(parseInt(e.target.value))}
                disabled={powMiningInProgress}
              >
                <option value="1">1 (Easy)</option>
                <option value="2">2 (Medium)</option>
                <option value="3">3 (Hard)</option>
                <option value="4">4 (Very Hard)</option>
              </select>
            </div>
          </div>
          
          {/* PoW Explanation */}
          <div className="border border-gray-700 rounded p-4 bg-gray-900">
            <h3 className="font-bold mb-2">How Proof of Work Functions:</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Miners compete to solve a cryptographic puzzle by finding a hash with specific properties (leading zeros).</li>
              <li>They adjust a "nonce" value repeatedly until they find a valid hash.</li>
              <li>The first miner to find a valid solution broadcasts it to the network.</li>
              <li>Other nodes verify the solution is correct (which is easy to do).</li>
              <li>The winning miner receives block rewards and transaction fees.</li>
            </ol>
            <div className="mt-3 text-sm">
              <strong>Key characteristics:</strong>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>High energy consumption</li>
                <li>Strong security through computational work</li>
                <li>Competitive mining process</li>
                <li>Used by Bitcoin and other cryptocurrencies</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Proof of Stake View */}
      {activeTab === 'pos' && (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold">Proof of Stake Blockchain</h2>
            <p className="text-sm text-gray-400 mt-1">
              Validators are selected to create blocks based on the amount of cryptocurrency they have staked.
            </p>
          </div>
          
          {/* PoS Validators */}
          <div className="mb-6 overflow-x-auto">
            <h3 className="text-md font-semibold mb-2">Validators</h3>
            <div className="grid grid-cols-5 gap-2">
              {validators.map((validator) => (
                <div 
                  key={validator.id}
                  className={`border rounded-md p-2 text-xs ${
                    currentValidator?.id === validator.id 
                      ? 'bg-gray-800 border-blue-400' 
                      : 'bg-gray-900 border-gray-700'
                  }`}
                >
                  <div className="font-semibold">{validator.name}</div>
                  <div className="mt-1">Stake: {validator.totalStaked.toLocaleString()}</div>
                  <div className="mt-1 w-full bg-gray-800 h-1.5">
                    <div 
                      className="bg-blue-500 h-1.5"
                      style={{ width: `${Math.min((validator.totalStaked / 25000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* PoS Blockchain visualization */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex items-center p-4 space-x-3">
              {posBlocks.map((block) => (
                <div 
                  key={block.id}
                  onClick={() => setSelectedPosBlock(block)}
                  className={`relative flex-shrink-0 w-32 h-48 border rounded-md p-3 cursor-pointer transition-all duration-300 hover:shadow-md ${
                    selectedPosBlock?.id === block.id 
                      ? 'bg-gray-800 border-blue-400' 
                      : 'bg-gray-900 border-gray-700'
                  }`}
                >
                  <div className="text-sm font-semibold mb-1">Block #{block.id}</div>
                  <div className="text-xs text-gray-400 mb-1 truncate">
                    Txs: {block.transactions}
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    {formatTime(block.timestamp)}
                  </div>
                  <div className="text-xs text-gray-400 mb-1 truncate">
                    Validator: {block.validator}
                  </div>
                  <div className="text-xs text-gray-400 mb-1 truncate">
                    Stake: {block.stake.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400 mb-1">
                    Rewards: {block.rewards}
                  </div>
                  <div className="text-xs text-gray-400">
                    Energy: {block.energyUsed} kWh
                  </div>
                </div>
              ))}
              
              {currentValidator && (
                <div className="flex-shrink-0 w-32 h-48 border border-dashed border-gray-600 rounded-md p-3 flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-2">{currentValidator.name}</div>
                    <div className="inline-block animate-pulse h-6 w-6 border-2 border-blue-400 rounded-full mb-2"></div>
                    <div className="text-xs text-gray-400">Validating...</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* PoS Selected block details */}
          {selectedPosBlock && (
            <div className="border border-gray-700 rounded-lg p-4 bg-gray-900 mb-6">
              <h3 className="text-lg font-bold mb-3">Block #{selectedPosBlock.id} Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-gray-300">Hash:</div>
                    <div className="text-xs font-mono bg-gray-800 p-2 rounded border border-gray-700 overflow-x-auto">
                      {selectedPosBlock.hash}
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-gray-300">Previous Hash:</div>
                    <div className="text-xs font-mono bg-gray-800 p-2 rounded border border-gray-700 overflow-x-auto">
                      {selectedPosBlock.previousHash}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-gray-300">Validator:</div>
                    <div>{selectedPosBlock.validator}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      The validator selected to create this block based on their stake
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-gray-300">Stake Amount:</div>
                    <div>{selectedPosBlock.stake.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      The amount of cryptocurrency the validator has staked
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-gray-300">Energy Consumed:</div>
                    <div>{selectedPosBlock.energyUsed} kWh</div>
                    <div className="text-xs text-gray-500 mt-1">
                      PoS consumes significantly less energy than PoW
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* PoS controls */}
          <div className="flex justify-center mb-6">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={createNewPosBlock}
              disabled={currentValidator !== null}
            >
              Create New Block
            </button>
          </div>
          
          {/* PoS Explanation */}
          <div className="border border-gray-700 rounded p-4 bg-gray-900">
            <h3 className="font-bold mb-2">How Proof of Stake Functions:</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>Validators lock up (stake) a certain amount of cryptocurrency as collateral.</li>
              <li>The blockchain protocol selects validators to create new blocks based primarily on how much they have staked.</li>
              <li>When selected, a validator verifies transactions and creates a new block.</li>
              <li>Other nodes verify the block is valid.</li>
              <li>The validator receives transaction fees as rewards.</li>
              <li>If a validator acts maliciously, they can lose part or all of their stake (slashing).</li>
            </ol>
            <div className="mt-3 text-sm">
              <strong>Key characteristics:</strong>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Energy efficient (no computational puzzles)</li>
                <li>Security through economic incentives</li>
                <li>Non-competitive block creation</li>
                <li>Used by Ethereum 2.0, Cardano, and others</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsensusVisualizer;