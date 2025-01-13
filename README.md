# Swartz: Decentralized Social Media Platform
## Technical Documentation

## 1. Project Overview
Swartz is a decentralized social media platform built on blockchain technology that combines traditional social media features with decentralized governance. The platform leverages smart contracts for core functionality and implements a sophisticated governance system for community-driven decision making.

## 2. Technical Architecture

### 2.1 Machine Learning Infrastructure
- TensorFlow-based content moderation
- Neural network recommendation system
- Real-time inference pipeline
- Model versioning and deployment
- Training data management

### 2.2 Smart Contracts

### 2.1 Smart Contracts

#### Main Contract (Swartz.sol)
The primary contract implements core social media functionality:

- **User Management**
  - Profile creation with IPFS-stored images
  - Follow/unfollow system
  - User data tracking
  
- **Content Management**
  - Post creation with titles, descriptions, and IPFS-stored images
  - Comment system
  - Like/unlike functionality
  - Post saving mechanism
  
- **Subgroup System**
  - Group creation and management
  - Membership tracking
  - Multi-group post association
  - Subscriber count tracking

#### Governance Contract (ReGovReactive.sol)
Implements decentralized decision-making:

- Cross-chain reactive architecture
- Event-driven proposal execution
- Three main governance events:
  - Vote FOR threshold reached
  - Vote AGAINST threshold reached
  - Deadline reached
- Gas-optimized callback system
- Sepolia testnet integration (Chain ID: 11155111)

### 2.2 Frontend Architecture

#### Technology Stack
- Next.js with TypeScript
- Web3.js for blockchain interaction
- React Context for state management
- Tailwind CSS for styling
- IPFS (via Pinata) for decentralized storage

#### Key Components

1. **Layout System**
```typescript
- RootLayout with ContractProvider
- Sidebar navigation
- Main content area
```

2. **Core Components**
- CreatePostModal: Post creation interface
- CreateUserModal: User profile creation
- PostCard: Post display and interaction
- SubgroupHeader: Group management and polling
- SearchBar: Content discovery
- WalletDropdown: Wallet management

3. **Authentication & Identity**
- MetaMask integration
- Web3 wallet connection
- Account management
- Transaction signing

## 3. Machine Learning Integration

### 3.1 Content Moderation Model
- **Model Architecture**
  - LSTM-based neural network for sensitive content detection
  - Built using TensorFlow and Keras
  - Trained on HateSpeech dataset
  - Components:
    - Embedding layer (5000 input dim, 128 output dim)
    - Dual LSTM layers (128 and 64 units)
    - Dense layers with ReLU and sigmoid activations
    - Dropout for regularization

- **Implementation Details**
  - Text tokenization with 5000-word vocabulary
  - Sequence padding to 1000 tokens
  - Binary classification (sensitive/non-sensitive)
  - Training metrics:
    - Loss: Binary crossentropy
    - Optimizer: Adam
    - Batch size: 64
    - Epochs: 100

### 3.2 Recommendation System
- Personalized content suggestions based on:
  - User interactions
  - Content similarity
  - Community engagement
  - Subgroup participation
- Real-time recommendation updates
- User preference learning
- Cross-subgroup content discovery

## 4. Feature Details

### 3.1 User System

#### Profile Creation
- Users create profiles with IPFS-stored images
- Profile data stored on-chain
- Automatic wallet address association

#### Social Connections
- Follow/Unfollow mechanism
- Follower/Following lists
- Relationship status tracking

### 3.2 Content System

#### Post Creation
```solidity
struct Post {
    string title;
    uint256 timestamp;
    uint256[] subgroups;
    string description;
    string imageHash;
    uint256 likeCount;
    uint256[] comments;
    address author;
    bool isDeleted;
}
```

Features:
- Multi-subgroup posting
- IPFS image storage
- Like/Unlike functionality
- Comment threading
- Post saving
- Content moderation flags

### 3.3 Subgroup System

#### Group Management
- Creation with unique names
- Membership tracking
- Post aggregation
- Subscriber metrics

#### Governance Integration
- Proposal creation
- Democratic voting
- Threshold-based execution
- Deadline management

### 3.4 Governance System

#### Proposal Lifecycle
1. Creation
2. Voting Period
3. Threshold Monitoring
4. Execution/Deletion
5. Result Implementation

#### Cross-Chain Communication
- Layer 1 to Layer 2 messaging
- Event subscription system
- Reactive execution model
- Gas-optimized callbacks

## 4. Technical Implementations

### 4.1 Smart Contract Security

#### Access Control
- Ownership management
- Function modifiers
- Role-based restrictions

#### Data Integrity
- Reentrancy protection
- State validation
- Error handling

### 4.2 Frontend Optimizations

#### Performance
- Lazy loading
- Component optimization
- State management
- Cache utilization

#### User Experience
- Responsive design
- Loading states
- Error handling
- Transaction feedback

### 4.3 IPFS Integration

#### Content Storage
- Image upload to Pinata
- Hash management
- Content retrieval
- Gateway configuration

## 5. Development Workflow

### 5.1 Smart Contract Deployment
1. Deploy Swartz contract
2. Deploy Governance contract
3. Configure cross-chain communication
4. Set up event listeners

### 5.2 Frontend Deployment
1. Environment configuration
2. Contract ABI integration
3. IPFS gateway setup
4. Web3 provider configuration

## 6. System Interactions

### 6.1 User Flow
1. Connect wallet
2. Create profile
3. Join subgroups
4. Create/interact with content
5. Participate in governance

### 6.2 Governance Flow
1. Proposal creation
2. Voting period
3. Threshold monitoring
4. Automatic execution
5. Result implementation

## 7. Technical Considerations

### 7.1 Scalability
- Gas optimization
- Batch processing
- IPFS content management
- State management

### 7.2 Security
- Smart contract auditing
- Access control
- Data validation
- Error handling

### 7.3 Maintenance
- Contract upgrades
- Frontend updates
- IPFS gateway management
- Performance monitoring

## 8. Future Improvements

### 8.1 Technical Enhancements
- Enhanced ML model performance
  - Expanded training datasets
  - Model fine-tuning
  - Multi-language support
  - Real-time content analysis
- Improved recommendation algorithms
  - Collaborative filtering
  - Content-based filtering
  - Hybrid recommendation approaches
  - Performance optimization
- Layer 2 scaling solutions
- Enhanced governance mechanisms
- Improved content discovery
- Advanced moderation tools

### 8.2 Feature Additions
- Token integration
- NFT support
- Advanced analytics
- Enhanced privacy features

## 9. Conclusion
Swartz represents a sophisticated implementation of a decentralized social media platform, combining traditional social features with blockchain-based governance. Its architecture provides a foundation for scalable, secure, and community-driven social interaction in the Web3 ecosystem.

---

*Note: This documentation represents the current state of the Swartz platform and may be updated as the project evolves.*
