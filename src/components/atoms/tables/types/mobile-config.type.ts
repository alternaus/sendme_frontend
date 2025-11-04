export interface MobileFieldConfig {
  field: string
  fallbackFields?: string[]
}

export interface MobileMetadataConfig {
  field: string
  label?: string
  position?: 'left' | 'right'
  separator?: string
}

export interface MobileConfig {
  avatar?: MobileFieldConfig
  title?: MobileFieldConfig
  subtitle?: MobileFieldConfig
  metadata?: MobileMetadataConfig[]
  status?: MobileFieldConfig
  showAvatar?: boolean
}
