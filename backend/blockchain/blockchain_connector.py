from web3 import Web3
import json
import os
from dotenv import load_dotenv

# Load environment variables (like PRIVATE_KEY, INFURA_URL etc.)
load_dotenv()

# Connect to blockchain node
infura_url = os.getenv("INFURA_URL")  # or your Alchemy/Quicknode endpoint
web3 = Web3(Web3.HTTPProvider(infura_url))

# Check if connection is successful
if not web3.isConnected():
    raise Exception("Failed to connect to the blockchain node")

# Load contract ABI
with open(os.path.join(os.path.dirname(__file__), 'contract_abi.json')) as f:
    contract_abi = json.load(f)

# Contract address
contract_address = web3.toChecksumAddress(os.getenv("CONTRACT_ADDRESS"))

# Initialize the contract
contract = web3.eth.contract(address=contract_address, abi=contract_abi)

# Wallet credentials
wallet_address = web3.toChecksumAddress(os.getenv("WALLET_ADDRESS"))
private_key = os.getenv("PRIVATE_KEY")

def send_transaction(function_name, *args):
    """Generic function to send transaction to the contract"""
    nonce = web3.eth.getTransactionCount(wallet_address)

    txn = getattr(contract.functions, function_name)(*args).buildTransaction({
        'chainId': int(os.getenv("CHAIN_ID", 1)),
        'gas': 300000,
        'gasPrice': web3.toWei('5', 'gwei'),
        'nonce': nonce,
    })

    signed_txn = web3.eth.account.signTransaction(txn, private_key=private_key)
    tx_hash = web3.eth.sendRawTransaction(signed_txn.rawTransaction)

    return web3.toHex(tx_hash)

def call_function(function_name, *args):
    """Generic function to call read-only function"""
    function = getattr(contract.functions, function_name)
    return function(*args).call()
