import { useWeb3Contract, useMoralis } from "react-moralis"
import { contractAddresses, abi } from "../constants"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled, account } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")
    const dispatch = useNotification()
    const { data, runContractFunction: enterRaffle, isFetching, isLoading } = useWeb3Contract()
    const options = {
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    }
    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })
    const { runContractFunction: getNumOfPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumOfPlayers",
        params: {},
    })
    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })
    async function updateUI() {
        const entranceFeeFromCall = (await getEntranceFee()).toString()
        const numPlayersFromCall = (await getNumOfPlayers()).toString()
        const recentWinnerFromCall = await getRecentWinner()
        setEntranceFee(entranceFeeFromCall)
        setNumPlayers(numPlayersFromCall)
        setRecentWinner(recentWinnerFromCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            if (raffleAddress) {
                updateUI()
            }
        }
    }, [isWeb3Enabled, account])

    const handleSuccess = async function (tx) {
        const txReceipt = await tx.wait(1)
        const raffleEntered = txReceipt.events[0]
        console.log(raffleEntered.event)
        handleNewNotification(tx, raffleEntered)
        updateUI()
    }
    const handleNewNotification = function (tx, raffleEntered) {
        dispatch({
            type: "info",
            message: "Tx Received by Metamask",
            title: "Tx Notification",
            position: "topR",
            icon: "",
            key: "0",
        })
        if (raffleEntered) {
            dispatch({
                type: "info",
                message: "Raffle Entered",
                title: "Tx Notification",
                position: "topR",
                icon: "",
                key: "1",
            })
        } else {
            dispatch({
                type: "info",
                message: "Raffle Enter Failed",
                title: "Tx Notification",
                position: "topR",
                icon: "",
                key: "2",
            })
        }
    }
    return (
        <div className="p-5">
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                        onClick={async () => {
                            await enterRaffle({
                                params: options,
                                onSuccess: handleSuccess, //checks to see if the tx was successfuly sent to Metamask
                                onError: (error) => console.log(error),
                            })
                        }}
                        disabled={isFetching || isLoading}
                    >
                        {isFetching || isLoading ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Raffle</div>
                        )}
                    </button>
                    <h5>Entrance Fee is {ethers.utils.formatUnits(entranceFee, "ether")} ETH</h5>
                    <h5>Number of Players is {numPlayers}</h5>
                    <h5>Recent Winner is {recentWinner}</h5>
                </div>
            ) : (
                <div>No Raffle Address Detected</div>
            )}
        </div>
    )
}
