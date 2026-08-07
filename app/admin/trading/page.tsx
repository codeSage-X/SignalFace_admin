import { TradingTable } from '@/components/trading-table'
import { WalletStats } from '@/components/wallet-stats'

export default function TradingPage() {
  return (
    <div className="space-y-6">
      <div className="border-b bg-background px-8 py-4">
        <h2 className="text-2xl font-bold capitalize">Trading & Wallets</h2>
      </div>
      <div className="px-8 space-y-6">
        <WalletStats />
        <TradingTable />
      </div>
    </div>
  )
}
