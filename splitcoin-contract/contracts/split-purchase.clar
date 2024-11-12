;; Define contract owner
(define-data-var contract-owner principal tx-sender)

;; Define purchases map
(define-map purchases 
  { purchase-id: uint }
  {
    buyer: principal,
    total-amount: uint,
    installment-amount: uint,
    installments-paid: uint,
    completed: bool
  }
)

;; Get owner
(define-read-only (get-owner)
  (var-get contract-owner)
)

;; Check if caller is contract owner
(define-private (is-contract-owner)
  (is-eq tx-sender (var-get contract-owner))
)

;; Create split purchase function
(define-public (create-split-purchase (purchase-id uint) (total-amount uint))
  (begin
    (asserts! (> total-amount u0) (err u400))
    (let ((installment-amount (/ (* total-amount u105) u500))) ;; 5% fee included
      (ok (map-set purchases { purchase-id: purchase-id }
        {
          buyer: tx-sender,
          total-amount: total-amount,
          installment-amount: installment-amount,
          installments-paid: u0,
          completed: false
        }))))
)

;; Pay installment function with proper post conditions
(define-public (pay-installment (purchase-id uint))
  (let 
    (
      (purchase (unwrap! (map-get? purchases { purchase-id: purchase-id }) (err u404)))
      (new-installments-paid (+ (get installments-paid purchase) u1))
    )
    (asserts! (is-eq (get buyer purchase) tx-sender) (err u403))
    (asserts! (not (get completed purchase)) (err u400))
    (asserts! (<= new-installments-paid u5) (err u400))
    
    ;; Transfer STX to contract owner instead of contract itself
    (try! (stx-transfer? 
      (get installment-amount purchase) 
      tx-sender 
      (var-get contract-owner)))
    
    (ok (map-set purchases { purchase-id: purchase-id }
      (merge purchase {
        installments-paid: new-installments-paid,
        completed: (is-eq new-installments-paid u5)
      })
    ))
  )
)

;; Get purchase details
(define-read-only (get-purchase (purchase-id uint))
  (map-get? purchases { purchase-id: purchase-id })
)

;; Update contract owner - only current owner can update
(define-public (set-contract-owner (new-owner principal))
  (begin
    (asserts! (is-contract-owner) (err u403))
    (ok (var-set contract-owner new-owner))
  )
)