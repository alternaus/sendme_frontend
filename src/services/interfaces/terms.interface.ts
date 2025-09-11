export interface TermsAcceptance {
  id: string
  organizationId: string
  termsVersion: string
  acceptedAt: string
  ip: string
  userAgent: string
  acceptedBy: string
}

export interface TermsAcceptanceRequest {
  termsVersion: string
}

export interface Organization {
  id: string
  name: string
  email: string
  termsAcceptedVersion?: string
  termsAcceptedAt?: string
}

export interface TermsStatus {
  hasAccepted: boolean
  version?: string
  acceptedAt?: string
  loading?: boolean
  error?: string
}

export interface TermsError {
  code: string
  message: string
}
