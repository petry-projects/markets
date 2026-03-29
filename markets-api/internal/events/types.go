// Package events provides a domain event bus with publish/subscribe pattern.
package events

import "time"

// Event is the interface that all domain events must implement.
type Event interface {
	EventType() string
}

// VendorCheckedIn is published when a vendor checks in to a market.
type VendorCheckedIn struct {
	VendorID  string
	MarketID  string
	Timestamp time.Time
}

// EventType returns the dotted event type string.
func (e VendorCheckedIn) EventType() string { return "vendor.checked_in" }

// UserCreated is published when a new user is created.
type UserCreated struct {
	UserID string
	Role   string
}

// EventType returns the dotted event type string.
func (e UserCreated) EventType() string { return "user.created" }

// ManagerAssigned is published when a manager is assigned to a market.
type ManagerAssigned struct {
	UserID   string
	MarketID string
}

// EventType returns the dotted event type string.
func (e ManagerAssigned) EventType() string { return "manager.assigned" }

// ManagerRemoved is published when a manager is removed from a market.
type ManagerRemoved struct {
	UserID   string
	MarketID string
}

// EventType returns the dotted event type string.
func (e ManagerRemoved) EventType() string { return "manager.removed" }

// MarketCreated is published when a new market is created.
type MarketCreated struct {
	MarketID  string
	ManagerID string
}

// EventType returns the dotted event type string.
func (e MarketCreated) EventType() string { return "market.created" }

// MarketUpdated is published when a market profile is updated.
type MarketUpdated struct {
	MarketID string
}

// EventType returns the dotted event type string.
func (e MarketUpdated) EventType() string { return "market.updated" }

// MarketCancelled is published when a market is cancelled or ended early.
type MarketCancelled struct {
	MarketID string
	Reason   string
	Message  string
}

// EventType returns the dotted event type string.
func (e MarketCancelled) EventType() string { return "market.cancelled" }

// VendorNotificationSent is published when a notification is sent to vendors.
type VendorNotificationSent struct {
	MarketID string
	SenderID string
	Message  string
}

// EventType returns the dotted event type string.
func (e VendorNotificationSent) EventType() string { return "vendor.notification.sent" }

// VendorInvited is published when a manager invites a vendor to a market.
type VendorInvited struct {
	MarketID string
	VendorID string
}

// EventType returns the dotted event type string.
func (e VendorInvited) EventType() string { return "vendor.invited" }

// VendorProfileCreated is published when a vendor creates their profile.
type VendorProfileCreated struct {
	VendorID string
	UserID   string
}

// EventType returns the dotted event type string.
func (e VendorProfileCreated) EventType() string { return "vendor.profile.created" }

// VendorProfileUpdated is published when a vendor updates their profile.
type VendorProfileUpdated struct {
	VendorID string
}

// EventType returns the dotted event type string.
func (e VendorProfileUpdated) EventType() string { return "vendor.profile.updated" }

// ProductCreated is published when a vendor adds a product.
type ProductCreated struct {
	ProductID string
	VendorID  string
}

// EventType returns the dotted event type string.
func (e ProductCreated) EventType() string { return "product.created" }

// ProductUpdated is published when a vendor updates a product.
type ProductUpdated struct {
	ProductID string
}

// EventType returns the dotted event type string.
func (e ProductUpdated) EventType() string { return "product.updated" }

// ProductDeleted is published when a vendor deletes a product.
type ProductDeleted struct {
	ProductID string
}

// EventType returns the dotted event type string.
func (e ProductDeleted) EventType() string { return "product.deleted" }
