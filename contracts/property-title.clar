;; property-title contract

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-title-exists (err u101))
(define-constant err-title-not-found (err u102))
(define-constant err-not-title-owner (err u103))

;; Data structures
(define-map property-titles
    { title-id: uint }
    {
        owner: principal,
        property-address: (string-ascii 256),
        description: (string-ascii 256),
        timestamp: uint
    }
)

(define-map title-owners
    { owner: principal }
    { titles: (list 100 uint) }
)

;; Public functions
(define-public (register-title (title-id uint) (property-address (string-ascii 256)) (description (string-ascii 256)))
    (let ((existing-title (get-title title-id)))
        (if (is-some existing-title)
            err-title-exists
            (begin
                (map-set property-titles
                    { title-id: title-id }
                    {
                        owner: tx-sender,
                        property-address: property-address,
                        description: description,
                        timestamp: block-height
                    }
                )
                (ok true)
            )
        )
    )
)

(define-public (transfer-title (title-id uint) (new-owner principal))
    (let ((title-data (get-title title-id)))
        (match title-data
            title-info (if (is-eq (get owner title-info) tx-sender)
                (begin
                    (map-set property-titles
                        { title-id: title-id }
                        {
                            owner: new-owner,
                            property-address: (get property-address title-info),
                            description: (get description title-info),
                            timestamp: block-height
                        }
                    )
                    (ok true)
                )
                err-not-title-owner
            )
            err-title-not-found
        )
    )
)

;; Read only functions
(define-read-only (get-title (title-id uint))
    (map-get? property-titles { title-id: title-id })
)

(define-read-only (get-title-owner (title-id uint))
    (match (get-title title-id)
        title-info (ok (get owner title-info))
        err-title-not-found
    )
)

(define-read-only (verify-title-owner (title-id uint) (owner principal))
    (match (get-title title-id)
        title-info (ok (is-eq (get owner title-info) owner))
        err-title-not-found
    )
)
