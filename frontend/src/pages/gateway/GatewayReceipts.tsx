import React, { useState, useEffect } from 'react';
import { Download, Printer, Send, Search } from 'lucide-react';
import { gatewayTransactions } from '../../services/gatewayApi';

const GatewayReceipts: React.FC = () => {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const data = await gatewayTransactions.getAll({ limit: 100 });
      setReceipts(data.data.filter((tx: any) => tx.status === 'SUCCESS'));
    } catch (err) {
      console.error('Failed to fetch receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = (tx: any) => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) return;
    
    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${tx.mpesaReceiptNo || tx._id}</title>
          <style>
            body { font-family: monospace; padding: 20px; max-width: 300px; margin: auto; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .border { border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 10px 0; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin: 5px 0; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="center">
            <h2>FLUXPAY</h2>
            <p>Payment Receipt</p>
          </div>
          <div class="border">
            <div class="row"><span>Date:</span><span>${new Date(tx.transactionDate).toLocaleString()}</span></div>
            <div class="row"><span>Receipt No:</span><span>${tx.mpesaReceiptNo || 'N/A'}</span></div>
            <div class="row"><span>Transaction ID:</span><span>${tx._id.slice(-8)}</span></div>
          </div>
          <div class="border">
            <div class="row"><span>Amount:</span><span class="bold">KES ${tx.amountKes.toLocaleString()}</span></div>
            <div class="row"><span>Status:</span><span class="bold">SUCCESS</span></div>
          </div>
          <div class="border">
            <div class="row"><span>Reference:</span><span>${tx.accountReference}</span></div>
            <div class="row"><span>Phone:</span><span>${tx.phoneNumber}</span></div>
          </div>
          <div class="center" style="margin-top: 20px;">
            <p>Thank you for your payment!</p>
            <p style="font-size: 12px;">Powered by FluxPay</p>
          </div>
        </body>
      </html>
    `);
    receiptWindow.document.close();
    receiptWindow.print();
  };

  const emailReceipt = async (tx: any) => {
    alert(`Email receipt functionality coming soon.\nReceipt: ${tx.mpesaReceiptNo || tx._id}`);
  };

  const filteredReceipts = receipts.filter((tx) =>
    tx.mpesaReceiptNo?.includes(search) ||
    tx.accountReference?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Receipts</h1>
          <p className="text-gray-500">Generate and manage payment receipts</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by receipt number or reference..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Receipt No</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Reference</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No receipts found</td>
                </tr>
              ) : (
                filteredReceipts.map((tx) => (
                  <tr key={tx._id}>
                    <td className="p-4 font-mono text-sm">{tx.mpesaReceiptNo || '-'}</td>
                    <td className="p-4 text-sm">{new Date(tx.transactionDate).toLocaleString()}</td>
                    <td className="p-4 font-semibold">KES {tx.amountKes.toLocaleString()}</td>
                    <td className="p-4 text-sm">{tx.accountReference}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => printReceipt(tx)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Print Receipt"
                        >
                          <Printer size={16} />
                        </button>
                        <button
                          onClick={() => emailReceipt(tx)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Email Receipt"
                        >
                          <Send size={16} />
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(tx.mpesaReceiptNo || '');
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Copy Receipt No"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GatewayReceipts;