'use client'

import { useState } from 'react'
import { MapPin, Plus, Trash2, Star, Loader2 } from 'lucide-react'
import { AccountLayout } from '@/components/account/AccountLayout'
import { AddressForm } from '@/components/account/AddressForm'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useAuthStore } from '@/stores/authStore'
import { shopifyClient } from '@/lib/shopify/client'
import {
  CUSTOMER_ADDRESS_CREATE,
  CUSTOMER_ADDRESS_UPDATE,
  CUSTOMER_ADDRESS_DELETE,
  CUSTOMER_DEFAULT_ADDRESS_UPDATE,
} from '@/lib/shopify/customerMutations'
import { cn } from '@/lib/utils/cn'
import type { ShopifyCustomerAddress, AddressFormData } from '@/types/customer'

export default function AddressesPage() {
  const { customer } = useRequireAuth()
  const { accessToken, fetchCustomer } = useAuthStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<ShopifyCustomerAddress | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null)

  const addresses = customer?.addresses.edges.map((edge) => edge.node) || []
  const defaultAddressId = customer?.defaultAddress?.id

  const openAddModal = () => {
    setEditingAddress(null)
    setIsModalOpen(true)
  }

  const openEditModal = (address: ShopifyCustomerAddress) => {
    setEditingAddress(address)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingAddress(null)
  }

  const handleSubmit = async (data: AddressFormData) => {
    if (!accessToken) return

    setIsSubmitting(true)

    try {
      if (editingAddress) {
        // Update existing address
        await shopifyClient.request(CUSTOMER_ADDRESS_UPDATE, {
          customerAccessToken: accessToken,
          id: editingAddress.id,
          address: data,
        })
      } else {
        // Create new address
        await shopifyClient.request(CUSTOMER_ADDRESS_CREATE, {
          customerAccessToken: accessToken,
          address: data,
        })
      }

      await fetchCustomer()
      closeModal()
    } catch (error) {
      console.error('Failed to save address:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (addressId: string) => {
    if (!accessToken || !confirm('Are you sure you want to delete this address?')) return

    setDeletingId(addressId)

    try {
      await shopifyClient.request(CUSTOMER_ADDRESS_DELETE, {
        customerAccessToken: accessToken,
        id: addressId,
      })
      await fetchCustomer()
    } catch (error) {
      console.error('Failed to delete address:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleSetDefault = async (addressId: string) => {
    if (!accessToken) return

    setSettingDefaultId(addressId)

    try {
      await shopifyClient.request(CUSTOMER_DEFAULT_ADDRESS_UPDATE, {
        customerAccessToken: accessToken,
        addressId,
      })
      await fetchCustomer()
    } catch (error) {
      console.error('Failed to set default address:', error)
    } finally {
      setSettingDefaultId(null)
    }
  }

  return (
    <AccountLayout title="Addresses" description="Manage your shipping addresses">
      {/* Add Address Button */}
      <div className="mb-6">
        <Button variant="primary" glow="cyan" onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Address
        </Button>
      </div>

      {/* Address List */}
      {addresses.length === 0 ? (
        <div className="text-center py-12 bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl">
          <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-white/30" />
          </div>
          <h2 className="font-display text-xl text-white mb-2">No Addresses Yet</h2>
          <p className="text-white/60">
            Add a shipping address to speed up checkout.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((address) => {
            const isDefault = address.id === defaultAddressId
            return (
              <div
                key={address.id}
                className={cn(
                  'bg-bg-card/50 backdrop-blur-sm border rounded-xl p-4 relative',
                  isDefault ? 'border-neon-cyan/50' : 'border-border-subtle'
                )}
              >
                {/* Default Badge */}
                {isDefault && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-neon-cyan/20 text-neon-cyan text-xs font-medium rounded">
                    Default
                  </span>
                )}

                {/* Address Content */}
                <div className="pr-16">
                  <p className="font-medium text-white">
                    {address.firstName} {address.lastName}
                  </p>
                  {address.company && (
                    <p className="text-white/70">{address.company}</p>
                  )}
                  <p className="text-white/60 text-sm mt-2">
                    {address.formatted.join(', ')}
                  </p>
                  {address.phone && (
                    <p className="text-white/50 text-sm mt-1">{address.phone}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border-subtle">
                  <button
                    onClick={() => openEditModal(address)}
                    className="text-sm text-neon-cyan hover:underline"
                  >
                    Edit
                  </button>

                  {!isDefault && (
                    <>
                      <span className="text-white/20">|</span>
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        disabled={settingDefaultId === address.id}
                        className="text-sm text-white/60 hover:text-white flex items-center gap-1"
                      >
                        {settingDefaultId === address.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Star className="w-3 h-3" />
                        )}
                        Set Default
                      </button>
                    </>
                  )}

                  <span className="text-white/20">|</span>
                  <button
                    onClick={() => handleDelete(address.id)}
                    disabled={deletingId === address.id}
                    className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
                  >
                    {deletingId === address.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Address Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
        size="lg"
      >
        <AddressForm
          initialData={editingAddress}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </AccountLayout>
  )
}
