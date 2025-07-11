import { defineStore } from 'pinia'

type BusinessType = 'retail' | 'restaurant' | 'online' | 'personal_services' | 'on_the_go' | null

interface BusinessInfo {
  name?: string
  industry?: string
  volume?: number
  description?: string
}

interface Location {
  name: string
  address: string
  contact: string
}

interface Document {
  file: string
  type: string
  data: any
  confidence: number
}

interface HardwareItem {
  name: string
  model: string
  price: number
  description: string
  category: 'stationary' | 'portable' | 'accessory'
}

interface SolutionPackage {
  name: string
  type: 'basic' | 'mobile' | 'essentials_light' | 'essentials' | 'restaurant' | 'retail' | 'virtual_terminal' | 'ecommerce'
  description: string
  recommendedFor: string[]
  devices: string[]
  features: string[]
  hardware: HardwareItem[]
  totalCost: number
}

export const useApplicationStore = defineStore('application', {
  state: () => ({
    businessType: null as BusinessType,
    businessInfo: {} as BusinessInfo,
    selectedPackage: null as SolutionPackage | null,
    locations: [] as Location[],
    documents: [] as Document[],
    extractedData: {} as Record<string, string>, // Flat key-value pairs from AI conversation
    applicationComplete: false,
  }),
  actions: {
    setBusinessType(type: BusinessType) {
      this.businessType = type
    },
    updateBusinessInfo(info: Partial<BusinessInfo>) {
      this.businessInfo = { ...this.businessInfo, ...info }
    },
    setSelectedPackage(pkg: SolutionPackage) {
      this.selectedPackage = pkg
    },
    addLocation(location: Location) {
      this.locations.push(location)
    },
    addDocument(doc: Document) {
      this.documents.push(doc)
    },
    updateExtractedData(data: Record<string, string>) {
      this.extractedData = { ...this.extractedData, ...data }
    },
    completeApplication() {
      this.applicationComplete = true
    },
    getData() {
      return {
        businessType: this.businessType,
        businessInfo: this.businessInfo,
        selectedPackage: this.selectedPackage,
        locations: this.locations,
        documents: this.documents,
        extractedData: this.extractedData,
      }
    },
    reset() {
      this.businessType = null
      this.businessInfo = {}
      this.selectedPackage = null
      this.locations = []
      this.documents = []
      this.extractedData = {}
      this.applicationComplete = false
    }
  },
}) 