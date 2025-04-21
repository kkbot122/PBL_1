import { useState, useEffect } from "react";
import { listenForTransactions } from "../utils/contract";

export default function TransactionList() {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        listenForTransactions((newTx) => {
            setTransactions((prev) => [...prev, newTx]);
        });
    }, []);

    return (
        <div>
            <h2>Transaction Logs</h2>
            <table>
                <thead>
                    <tr>
                        <th>Sender</th>
                        <th>Amount (ETH)</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx, index) => (
                        <tr key={index}>
                            <td>{tx.sender}</td>
                            <td>{tx.amount}</td>
                            <td>{tx.isFraud ? "🚨 Fraud" : "✅ Safe"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
