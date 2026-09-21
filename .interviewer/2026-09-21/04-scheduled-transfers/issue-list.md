# 非公開 / 正答公開まで開示しない

1. useTransfers: concurrent list responses overwrite latest filters, and old requests clear loading/error. Add request ownership or cancellation/ignore cleanup. Test with controlled response ordering.
2. useTransfers.cancel: optimistic update has no rollback/reconciliation on failure. tr-fail reproduces. Protect overlapping refresh/cancel operations; a pending state or pessimistic alternative is acceptable.
3. TransferForm: parseInt truncates decimal/mixed strings and accepts negative values. Validate whole string, safe integer, positive amount, balance/limit; preserve intended amount before serialization.
4. TransferForm: saving only changes text; repeated submits issue multiple create requests. Prevent duplicate in-flight submissions, disable relevant inputs and release guard on failure. Mention server idempotency for production; backend implementation is out of scope.
5. TransferPage: reservedAmount sums completed/cancelled transfers. Compute sum of SCHEDULED in current filtered items.
6. TransferPage: selected is a copied Transfer object. After cancellation/refresh detail shows old values. Keep selected ID and derive current transfer; close when no longer visible.

Minor observations such as naming dailyLimit, date restrictions and server transaction design are disclosed scope assumptions, not extra scored defects.
