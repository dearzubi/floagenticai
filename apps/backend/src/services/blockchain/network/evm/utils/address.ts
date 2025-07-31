import { isAddress, getAddress } from 'viem'

/**
 * Checks if a string is a valid Ethereum (EVM) address with checksum
 * @param address The address to validate
 * @returns Boolean indicating if the address is valid
 */
export const isValidEthereumAddress = (address: string): boolean => {
  try {
    if (!address) {return false}
    return isAddress(getAddress(address.trim()), { strict: true })
  } catch (error) {
    return false
  }
}