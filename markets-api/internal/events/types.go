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
