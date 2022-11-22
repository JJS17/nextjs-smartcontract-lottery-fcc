import { useMoralis } from "react-moralis"
import { useEffect } from "react"
export default function ManualHeader() {
    const { enableWeb3, account, isWeb3Enabled, Moralis, deactivateWeb3, isWeb3EnableLoading } =
        useMoralis()
    useEffect(() => {
        if (isWeb3Enabled) return

        if (typeof window !== "undefined") {
            if (window.localStorage.getItem("connected")) enableWeb3()
        }
    }, [isWeb3Enabled])
    useEffect(() => {
        if (typeof window !== "undefined") {
            Moralis.onAccountChanged((account) => {
                if (account == null) {
                    window.localStorage.removeItem("connected")
                    deactivateWeb3()
                    console.log(`Null account found`)
                } else if (account != null)
                    console.log(
                        `Account switched to ${account.slice(0, 6)}.....${account.slice(
                            account.length - 4
                        )}`
                    )
            })
        }
    }, [])
    return (
        <div>
            {account ? (
                <button>
                    Connected to {account.slice(0, 6)}.....{account.slice(account.length - 4)}
                </button>
            ) : (
                <button
                    onClick={async () => {
                        await enableWeb3()
                        if (typeof window !== "undefined") {
                            window.localStorage.setItem("connected", "injected")
                        }
                    }}
                    disabled={isWeb3EnableLoading}
                >
                    Connect
                </button>
            )}
        </div>
    )
}
