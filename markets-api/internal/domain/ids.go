// Package domain provides shared value objects used across bounded contexts.
package domain

// UserID is a typed identifier for users.
type UserID string

// MarketID is a typed identifier for markets.
type MarketID string

// VendorID is a typed identifier for vendors.
type VendorID string

// ProductID is a typed identifier for products.
type ProductID string

// CheckInID is a typed identifier for check-ins.
type CheckInID string

// CustomerID is a typed identifier for customers.
type CustomerID string

// AuditLogID is a typed identifier for audit log entries.
type AuditLogID string

// String returns the string representation of the ID.
func (id UserID) String() string     { return string(id) }
func (id MarketID) String() string   { return string(id) }
func (id VendorID) String() string   { return string(id) }
func (id ProductID) String() string  { return string(id) }
func (id CheckInID) String() string  { return string(id) }
func (id CustomerID) String() string { return string(id) }
func (id AuditLogID) String() string { return string(id) }
