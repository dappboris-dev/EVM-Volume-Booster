import * as fs from 'fs';
import { ContractAbi } from 'web3';
import { ChainId } from './types';
import { BSC_ENDPOINT, BSC_RPC_ENDPOINT, ETH_ENDPOINT, WBNB_ADDRESS, WETH_ADDRESS } from './constants';

export function get_bsc_factory_abi(): ContractAbi {
  const data = fs.readFileSync('abi/bsc_factory_v2.json', 'utf8');
  return JSON.parse(data);
}

export function get_router_abi(): ContractAbi {
  const data = fs.readFileSync('abi/router_v2.json', 'utf8');
  return JSON.parse(data);
}

export function get_bsc_router_abi(): ContractAbi {
  const data = fs.readFileSync('abi/bsc_router_v2.json', 'utf8');
  return JSON.parse(data);
}

export function get_factory_v2_abi(): ContractAbi {
  const data = fs.readFileSync('abi/uniswap_factory_v2.json', 'utf8');
  return JSON.parse(data);
}

export function get_factory_v3_abi(): ContractAbi {
  const data = fs.readFileSync('abi/uniswap_factory_v3.json', 'utf8');
  return JSON.parse(data);
}

export function get_router_v3_abi(): ContractAbi {
  const data = fs.readFileSync('abi/router_v3.json', 'utf8');
  return JSON.parse(data);
}

export function get_pair_abi(): ContractAbi {
  const data = fs.readFileSync('abi/pair.json', 'utf8');
  return JSON.parse(data);
}

export function get_erc20_abi(): ContractAbi {
  const data = fs.readFileSync('abi/erc20.json', 'utf8');
  return JSON.parse(data);
}

export function get_volume_boost_contract_abi(): ContractAbi {
  const data = fs.readFileSync('abi/volume_boost.json', 'utf8');
  return JSON.parse(data);
}