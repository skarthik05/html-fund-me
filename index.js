import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withDrawButton = document.getElementById("withDrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withDrawButton.onclick = withDraw
async function connect() {
    console.log("Connecting...")
    if (typeof window.ethereum !== "undefined") {
        try {
            await ethereum.request({ method: "eth_requestAccounts" })
            connectButton.innerHTML = "Connected"
            const accounts = await ethereum.request({ method: "eth_accounts" })
            console.log("Connected account:", accounts[0])
        } catch (error) {
            console.error("Error connecting:", error)
            connectButton.innerHTML = "Connect"
            alert("Failed to connect. Please try again or check MetaMask.")
        }
    } else {
        connectButton.innerHTML = "Please install MetaMask"
    }
}

async function getBalance() {
    console.log("Fetching balance...")
    if (typeof window.ethereum !== "undefined") {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const balance = await provider.getBalance(contractAddress)
            console.log("Balance:", ethers.utils.formatEther(balance))
            alert("Your balance: " + ethers.utils.formatEther(balance) + " ETH")
        } catch (error) {
            console.error("Error getting balance:", error)
            alert("Failed to fetch balance. Please try again.")
        }
    } else {
        alert("Please install MetaMask to get balance.")
    }
}

async function withDraw() {
    console.log("Withdrawing...")
    if (typeof window.ethereum !== "undefined") {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(contractAddress, abi, signer)
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.error("Error withdrawing funds:", error)
            alert("Failed to withdraw funds. Please try again.")
        }
    } else {
        alert("Please install MetaMask to withdraw funds.")
    }
}

async function fund() {
    console.log("Funding...")
    const ethAmount = document.getElementById("ethAmount").value.trim()

    if (ethAmount === "") {
        alert("Please enter an amount to fund.")
        return
    }

    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(contractAddress, abi, signer)
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.error("Error funding:", error)
            alert("Failed to fund. Please try again.")
        }
    } else {
        alert("Please install MetaMask to fund.")
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}`)
    return new Promise((resolve, reject) => {
        try {
            provider.once(transactionResponse.hash, (transactionReceipt) => {
                console.log(`Completed with ${transactionReceipt.confirmations} confirmations.`)
                const transactionIdDiv = document.getElementById("transactionId")
                transactionIdDiv.innerHTML = `Transaction ID: ${transactionReceipt.transactionHash}`
                transactionIdDiv.style.display = "block"
                resolve()
            })
        } catch (error) {
            console.error("Error listening for transaction:", error)
            reject(error)
        }
    })
}
