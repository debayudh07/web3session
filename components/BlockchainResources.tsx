// components/BlockchainResources.jsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const BlockchainResources = () => {
  const resources = [
    {
      id: 1,
      name: 'Cyfrin Updraft',
      description: 'Smart contract security courses and auditing training platform.',
      url: 'https://updraft.cyfrin.io/',
      imageUrl: '/images/cyfrin-logo.png',
      tags: ['Security', 'Auditing', 'Smart Contracts']
    },
    {
      id: 2,
      name: 'CryptoZombies',
      description: 'Learn to code blockchain DApps by building simple games.',
      url: 'https://cryptozombies.io/',
      imageUrl: '/images/cryptozombies-logo.png',
      tags: ['Solidity', 'Games', 'Interactive']
    },
    {
      id: 3,
      name: 'OpenZeppelin',
      description: 'Library for secure smart contract development.',
      url: 'https://www.openzeppelin.com/',
      imageUrl: '/images/openzeppelin-logo.png',
      tags: ['Libraries', 'Security', 'Standards']
    },
    {
      id: 4,
      name: 'Ethereum.org',
      description: 'Official Ethereum documentation and learning resources.',
      url: 'https://ethereum.org/en/developers/',
      imageUrl: '/images/ethereum-logo.png',
      tags: ['Documentation', 'Ethereum', 'Development']
    }
  ];

  return (
    <section className="py-12 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-4">Blockchain Learning Resources</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Discover the best platforms and tools to enhance your blockchain development skills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {resources.map((resource) => (
            <div key={resource.id} className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
              <div className="h-48 relative bg-gray-800">
                {/* Replace with actual images in your project */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  {/* Fallback if image doesn't load */}
                  <span className="text-2xl font-bold text-gray-500">{resource.name}</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">{resource.name}</h3>
                <p className="text-gray-300 mb-4">{resource.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {resource.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-800 text-purple-300 px-2 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link href={resource.url} target="_blank" rel="noopener noreferrer" 
                      className="block text-center py-2 px-4 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                  Visit Resource
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlockchainResources;