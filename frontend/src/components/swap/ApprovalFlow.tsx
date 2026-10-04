"use client";

import { memo, useState, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";

interface ApprovalFlowProps {
  tokenAddress: string;
  tokenSymbol: string;
  spenderAddress: string;
  onApproved: () => void;
  onCancel: () => void;
}

const ApprovalFlow = memo(function ApprovalFlow({
  tokenAddress,
  tokenSymbol,
  spenderAddress,
  onApproved,
  onCancel,
}: ApprovalFlowProps) {
  const [isInitiated, setIsInitiated] = useState(false);

  const { writeContract, data: hash, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle successful confirmation
  if (isSuccess && isInitiated) {
    setTimeout(() => onApproved(), 500);
  }

  const handleApprove = useCallback(() => {
    setIsInitiated(true);
    const maxApproval = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: [
        {
          name: "approve",
          type: "function",
          stateMutability: "nonpayable",
          inputs: [
            { name: "spender", type: "address" },
            { name: "amount", type: "uint256" },
          ],
          outputs: [{ type: "bool" }],
        },
      ],
      functionName: "approve",
      args: [spenderAddress as `0x${string}`, maxApproval],
    });
  }, [tokenAddress, spenderAddress, writeContract]);

  return (
    <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg mt-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-warning text-lg">⚠️</span>
        <p className="text-sm text-text-primary">
          <strong>{tokenSymbol}</strong> requires approval before swapping.
        </p>
      </div>

      <p className="text-xs text-text-muted mb-4">
        This is a one-time approval per token. You only need to approve once.
      </p>

      <div className="flex gap-2">
        <button
          onClick={handleApprove}
          disabled={isPending || isConfirming}
          className="btn-primary flex-1 disabled:opacity-50"
        >
          {isConfirming
            ? "Confirming..."
            : isPending
              ? "Check Wallet..."
              : `Approve ${tokenSymbol}`}
        </button>
        <button
          onClick={onCancel}
          className="btn-secondary"
          disabled={isPending || isConfirming}
        >
          Cancel
        </button>
      </div>

      {hash && (
        <p className="text-xs text-text-muted mt-2">
          TX: {hash.slice(0, 10)}...{hash.slice(-8)}
        </p>
      )}
    </div>
  );
});

export default ApprovalFlow;
