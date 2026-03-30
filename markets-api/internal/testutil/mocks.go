// Package testutil provides shared mock implementations for integration tests.
package testutil

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/petry-projects/markets-api/internal/customer"
	"github.com/petry-projects/markets-api/internal/domain"
	"github.com/petry-projects/markets-api/internal/market"
	"github.com/petry-projects/markets-api/internal/notify"
	"github.com/petry-projects/markets-api/internal/user"
	"github.com/petry-projects/markets-api/internal/vendor"
)

// ---------- MockUserRepo ----------

// MockUserRepo implements user.Repository with in-memory storage.
type MockUserRepo struct {
	mu    sync.RWMutex
	Users map[string]*user.User
	Err   error
}

// NewMockUserRepo creates a new MockUserRepo.
func NewMockUserRepo() *MockUserRepo {
	return &MockUserRepo{Users: make(map[string]*user.User)}
}

func (m *MockUserRepo) Create(_ context.Context, u *user.User) error {
	if m.Err != nil {
		return m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	if u.ID == "" {
		u.ID = domain.UserID(fmt.Sprintf("user-%d", len(m.Users)+1))
	}
	u.CreatedAt = time.Now()
	m.Users[u.FirebaseUID] = u
	return nil
}

func (m *MockUserRepo) FindByFirebaseUID(_ context.Context, firebaseUID string) (*user.User, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	u, ok := m.Users[firebaseUID]
	if !ok {
		return nil, fmt.Errorf("user not found: %s", firebaseUID)
	}
	return u, nil
}

// ---------- MockMarketRepo ----------

// MockMarketRepo implements market.Repository with in-memory storage.
type MockMarketRepo struct {
	mu          sync.RWMutex
	Markets     map[domain.MarketID]*market.MarketRecord
	Assignments []market.ManagerAssignment
	Schedules   map[domain.MarketID]*market.ScheduleRecord
	Rosters     map[string]*market.RosterEntry
	Invitations map[string]*market.InvitationRecord
	Updates     []*market.MarketUpdateRecord
	Err         error
	counter     int
}

// NewMockMarketRepo creates a new MockMarketRepo.
func NewMockMarketRepo() *MockMarketRepo {
	return &MockMarketRepo{
		Markets:     make(map[domain.MarketID]*market.MarketRecord),
		Schedules:   make(map[domain.MarketID]*market.ScheduleRecord),
		Rosters:     make(map[string]*market.RosterEntry),
		Invitations: make(map[string]*market.InvitationRecord),
	}
}

func (m *MockMarketRepo) nextID() string {
	m.counter++
	return fmt.Sprintf("mock-%d", m.counter)
}

func (m *MockMarketRepo) IsManagerAssigned(_ context.Context, managerID domain.UserID, marketID domain.MarketID) (bool, error) {
	if m.Err != nil {
		return false, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	for _, a := range m.Assignments {
		if a.ManagerID == managerID && a.MarketID == marketID {
			return true, nil
		}
	}
	return false, nil
}

func (m *MockMarketRepo) AssignManager(_ context.Context, managerID domain.UserID, marketID domain.MarketID) (*market.ManagerAssignment, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	a := market.ManagerAssignment{
		ID:        m.nextID(),
		ManagerID: managerID,
		MarketID:  marketID,
		CreatedAt: time.Now(),
	}
	m.Assignments = append(m.Assignments, a)
	return &a, nil
}

func (m *MockMarketRepo) RemoveManager(_ context.Context, managerID domain.UserID, marketID domain.MarketID) error {
	if m.Err != nil {
		return m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	for i, a := range m.Assignments {
		if a.ManagerID == managerID && a.MarketID == marketID {
			m.Assignments = append(m.Assignments[:i], m.Assignments[i+1:]...)
			return nil
		}
	}
	return fmt.Errorf("assignment not found")
}

func (m *MockMarketRepo) GetManagersByMarket(_ context.Context, marketID domain.MarketID) ([]market.ManagerAssignment, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []market.ManagerAssignment
	for _, a := range m.Assignments {
		if a.MarketID == marketID {
			result = append(result, a)
		}
	}
	return result, nil
}

func (m *MockMarketRepo) CreateMarket(_ context.Context, rec *market.MarketRecord, managerID domain.UserID, recoveryContact string) (*market.MarketRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	rec.ID = domain.MarketID(m.nextID())
	rec.Status = "active"
	rec.CreatedAt = time.Now()
	rec.UpdatedAt = time.Now()
	m.Markets[rec.ID] = rec
	m.Assignments = append(m.Assignments, market.ManagerAssignment{
		ID:              m.nextID(),
		ManagerID:       managerID,
		MarketID:        rec.ID,
		RecoveryContact: recoveryContact,
		CreatedAt:       time.Now(),
	})
	return rec, nil
}

func (m *MockMarketRepo) UpdateMarket(_ context.Context, rec *market.MarketRecord) (*market.MarketRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	rec.UpdatedAt = time.Now()
	m.Markets[rec.ID] = rec
	return rec, nil
}

func (m *MockMarketRepo) FindMarketByID(_ context.Context, id domain.MarketID) (*market.MarketRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	rec, ok := m.Markets[id]
	if !ok {
		return nil, fmt.Errorf("market not found: %s", id)
	}
	return rec, nil
}

func (m *MockMarketRepo) FindMarketsByManagerID(_ context.Context, managerID domain.UserID) ([]*market.MarketRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []*market.MarketRecord
	for _, a := range m.Assignments {
		if a.ManagerID == managerID {
			if rec, ok := m.Markets[a.MarketID]; ok {
				result = append(result, rec)
			}
		}
	}
	return result, nil
}

func (m *MockMarketRepo) ListMarkets(_ context.Context, _ *int32, _ *int32) ([]*market.MarketRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []*market.MarketRecord
	for _, rec := range m.Markets {
		result = append(result, rec)
	}
	return result, nil
}

func (m *MockMarketRepo) CreateSchedule(_ context.Context, s *market.ScheduleRecord) (*market.ScheduleRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	s.ID = domain.MarketID(m.nextID())
	s.CreatedAt = time.Now()
	s.UpdatedAt = time.Now()
	m.Schedules[s.ID] = s
	return s, nil
}

func (m *MockMarketRepo) UpdateSchedule(_ context.Context, s *market.ScheduleRecord) (*market.ScheduleRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	s.UpdatedAt = time.Now()
	m.Schedules[s.ID] = s
	return s, nil
}

func (m *MockMarketRepo) DeleteSchedule(_ context.Context, _ domain.MarketID) error {
	return m.Err
}

func (m *MockMarketRepo) FindScheduleByID(_ context.Context, id domain.MarketID) (*market.ScheduleRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	s, ok := m.Schedules[id]
	if !ok {
		return nil, fmt.Errorf("schedule not found: %s", id)
	}
	return s, nil
}

func (m *MockMarketRepo) FindSchedulesByMarketID(_ context.Context, marketID domain.MarketID) ([]*market.ScheduleRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []*market.ScheduleRecord
	for _, s := range m.Schedules {
		if s.MarketID == marketID {
			result = append(result, s)
		}
	}
	return result, nil
}

func (m *MockMarketRepo) UpdateMarketRules(_ context.Context, marketID domain.MarketID, rulesText string) (*market.MarketRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	rec, ok := m.Markets[marketID]
	if !ok {
		return nil, fmt.Errorf("market not found: %s", marketID)
	}
	rec.RulesText = rulesText
	now := time.Now()
	rec.RulesUpdatedAt = &now
	return rec, nil
}

func (m *MockMarketRepo) CancelMarket(_ context.Context, marketID domain.MarketID, status, reason, message string) (*market.MarketRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	rec, ok := m.Markets[marketID]
	if !ok {
		return nil, fmt.Errorf("market not found: %s", marketID)
	}
	rec.Status = status
	rec.CancellationReason = reason
	rec.CancellationMessage = message
	now := time.Now()
	rec.CancelledAt = &now
	return rec, nil
}

func (m *MockMarketRepo) ReactivateMarket(_ context.Context, marketID domain.MarketID) (*market.MarketRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	rec, ok := m.Markets[marketID]
	if !ok {
		return nil, fmt.Errorf("market not found: %s", marketID)
	}
	rec.Status = "active"
	rec.CancelledAt = nil
	return rec, nil
}

func (m *MockMarketRepo) CreateNotification(_ context.Context, n *market.NotificationRecord) (*market.NotificationRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	n.ID = m.nextID()
	n.SentAt = time.Now()
	return n, nil
}

func (m *MockMarketRepo) CreateInvitation(_ context.Context, inv *market.InvitationRecord) (*market.InvitationRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	inv.ID = m.nextID()
	inv.CreatedAt = time.Now()
	inv.UpdatedAt = time.Now()
	m.Invitations[inv.ID] = inv
	return inv, nil
}

func (m *MockMarketRepo) UpdateInvitationStatus(_ context.Context, id string, status string) (*market.InvitationRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	inv, ok := m.Invitations[id]
	if !ok {
		return nil, fmt.Errorf("invitation not found: %s", id)
	}
	inv.Status = status
	inv.UpdatedAt = time.Now()
	return inv, nil
}

func (m *MockMarketRepo) GetInvitationsByVendor(_ context.Context, vendorID domain.UserID) ([]*market.InvitationRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []*market.InvitationRecord
	for _, inv := range m.Invitations {
		if inv.VendorID == vendorID {
			result = append(result, inv)
		}
	}
	return result, nil
}

func (m *MockMarketRepo) CreateRosterEntries(_ context.Context, marketID domain.MarketID, vendorID domain.UserID, dates []string, status string, rulesAcknowledged bool) ([]*market.RosterEntry, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	var entries []*market.RosterEntry
	for _, d := range dates {
		e := &market.RosterEntry{
			ID:                m.nextID(),
			MarketID:          marketID,
			VendorID:          vendorID,
			Date:              d,
			Status:            status,
			RulesAcknowledged: rulesAcknowledged,
			CreatedAt:         time.Now(),
			UpdatedAt:         time.Now(),
		}
		m.Rosters[e.ID] = e
		entries = append(entries, e)
	}
	return entries, nil
}

func (m *MockMarketRepo) UpdateRosterEntryStatus(_ context.Context, id string, status string) (*market.RosterEntry, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	e, ok := m.Rosters[id]
	if !ok {
		return nil, fmt.Errorf("roster entry not found: %s", id)
	}
	e.Status = status
	e.UpdatedAt = time.Now()
	return e, nil
}

func (m *MockMarketRepo) RejectRosterEntry(_ context.Context, id string, reason string) (*market.RosterEntry, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	e, ok := m.Rosters[id]
	if !ok {
		return nil, fmt.Errorf("roster entry not found: %s", id)
	}
	e.Status = "rejected"
	e.RejectionReason = reason
	e.UpdatedAt = time.Now()
	return e, nil
}

func (m *MockMarketRepo) FindRosterEntryByID(_ context.Context, id string) (*market.RosterEntry, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	e, ok := m.Rosters[id]
	if !ok {
		return nil, fmt.Errorf("roster entry not found: %s", id)
	}
	return e, nil
}

func (m *MockMarketRepo) DeleteRosterEntry(_ context.Context, id string) error {
	if m.Err != nil {
		return m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.Rosters, id)
	return nil
}

func (m *MockMarketRepo) GetRosterByDate(_ context.Context, marketID domain.MarketID, date string) ([]*market.RosterEntry, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []*market.RosterEntry
	for _, e := range m.Rosters {
		if e.MarketID == marketID && e.Date == date {
			result = append(result, e)
		}
	}
	return result, nil
}

func (m *MockMarketRepo) GetDayPlans(_ context.Context, _ domain.MarketID, _, _ string) ([]*market.DayPlan, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return nil, nil
}

func (m *MockMarketRepo) SearchVendors(_ context.Context, _, _ string, _ *int32) ([]market.VendorSummary, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return nil, nil
}

func (m *MockMarketRepo) CreateMarketUpdate(_ context.Context, u *market.MarketUpdateRecord) (*market.MarketUpdateRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	u.ID = m.nextID()
	u.CreatedAt = time.Now()
	m.Updates = append(m.Updates, u)
	return u, nil
}

func (m *MockMarketRepo) FindMarketUpdates(_ context.Context, _ domain.MarketID, _, _ int32) ([]*market.MarketUpdateRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.Updates, nil
}

// ---------- MockVendorRepo ----------

// MockVendorRepo implements vendor.Repository with in-memory storage.
type MockVendorRepo struct {
	mu       sync.RWMutex
	Vendors  map[domain.VendorID]*vendor.VendorRecord
	Products map[domain.ProductID]*vendor.ProductRecord
	CheckIns map[domain.CheckInID]*vendor.CheckInRecord
	Err      error
	counter  int
}

// NewMockVendorRepo creates a new MockVendorRepo.
func NewMockVendorRepo() *MockVendorRepo {
	return &MockVendorRepo{
		Vendors:  make(map[domain.VendorID]*vendor.VendorRecord),
		Products: make(map[domain.ProductID]*vendor.ProductRecord),
		CheckIns: make(map[domain.CheckInID]*vendor.CheckInRecord),
	}
}

func (m *MockVendorRepo) nextID() string {
	m.counter++
	return fmt.Sprintf("vmock-%d", m.counter)
}

func (m *MockVendorRepo) CreateVendor(_ context.Context, v *vendor.VendorRecord) (*vendor.VendorRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	v.ID = domain.VendorID(m.nextID())
	v.CreatedAt = time.Now()
	v.UpdatedAt = time.Now()
	m.Vendors[v.ID] = v
	return v, nil
}

func (m *MockVendorRepo) UpdateVendor(_ context.Context, v *vendor.VendorRecord) (*vendor.VendorRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	v.UpdatedAt = time.Now()
	m.Vendors[v.ID] = v
	return v, nil
}

func (m *MockVendorRepo) FindVendorByID(_ context.Context, id domain.VendorID) (*vendor.VendorRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	v, ok := m.Vendors[id]
	if !ok {
		return nil, vendor.ErrVendorNotFound
	}
	return v, nil
}

func (m *MockVendorRepo) FindVendorByUserID(_ context.Context, userID domain.UserID) (*vendor.VendorRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	for _, v := range m.Vendors {
		if v.UserID == userID {
			return v, nil
		}
	}
	return nil, vendor.ErrVendorNotFound
}

func (m *MockVendorRepo) CreateProduct(_ context.Context, p *vendor.ProductRecord) (*vendor.ProductRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	p.ID = domain.ProductID(m.nextID())
	p.CreatedAt = time.Now()
	p.UpdatedAt = time.Now()
	m.Products[p.ID] = p
	return p, nil
}

func (m *MockVendorRepo) UpdateProduct(_ context.Context, p *vendor.ProductRecord) (*vendor.ProductRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	p.UpdatedAt = time.Now()
	m.Products[p.ID] = p
	return p, nil
}

func (m *MockVendorRepo) FindProductByID(_ context.Context, id domain.ProductID) (*vendor.ProductRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	p, ok := m.Products[id]
	if !ok {
		return nil, vendor.ErrProductNotFound
	}
	return p, nil
}

func (m *MockVendorRepo) FindProductsByVendorID(_ context.Context, vendorID domain.VendorID) ([]*vendor.ProductRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []*vendor.ProductRecord
	for _, p := range m.Products {
		if p.VendorID == vendorID {
			result = append(result, p)
		}
	}
	return result, nil
}

func (m *MockVendorRepo) DeleteProduct(_ context.Context, id domain.ProductID) error {
	if m.Err != nil {
		return m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.Products, id)
	return nil
}

func (m *MockVendorRepo) SearchMarkets(_ context.Context, _ string, _, _, _ *float64, _, _ *int32) ([]vendor.MarketSearchRow, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return nil, nil
}

func (m *MockVendorRepo) GetVendorMarketDates(_ context.Context, _ domain.UserID) ([]vendor.VendorMarketDateRow, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return nil, nil
}

func (m *MockVendorRepo) CreateCheckIn(_ context.Context, c *vendor.CheckInRecord) (*vendor.CheckInRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	c.ID = domain.CheckInID(m.nextID())
	m.CheckIns[c.ID] = c
	return c, nil
}

func (m *MockVendorRepo) UpdateCheckIn(_ context.Context, c *vendor.CheckInRecord) (*vendor.CheckInRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	m.CheckIns[c.ID] = c
	return c, nil
}

func (m *MockVendorRepo) FindCheckInByID(_ context.Context, id domain.CheckInID) (*vendor.CheckInRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	c, ok := m.CheckIns[id]
	if !ok {
		return nil, vendor.ErrCheckInNotFound
	}
	return c, nil
}

func (m *MockVendorRepo) FindActiveCheckInsByVendor(_ context.Context, vendorID domain.VendorID) ([]*vendor.CheckInRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []*vendor.CheckInRecord
	for _, c := range m.CheckIns {
		if c.VendorID == vendorID && c.Status == vendor.StatusCheckedIn {
			result = append(result, c)
		}
	}
	return result, nil
}

func (m *MockVendorRepo) FindCheckInsByVendor(_ context.Context, vendorID domain.VendorID) ([]*vendor.CheckInRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []*vendor.CheckInRecord
	for _, c := range m.CheckIns {
		if c.VendorID == vendorID {
			result = append(result, c)
		}
	}
	return result, nil
}

func (m *MockVendorRepo) FindCheckInsByMarketAndDate(_ context.Context, marketID domain.MarketID, _ string) ([]*vendor.CheckInRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []*vendor.CheckInRecord
	for _, c := range m.CheckIns {
		if c.MarketID == marketID {
			result = append(result, c)
		}
	}
	return result, nil
}

func (m *MockVendorRepo) FindActiveCheckInsByMarket(_ context.Context, marketID domain.MarketID) ([]*vendor.CheckInRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	var result []*vendor.CheckInRecord
	for _, c := range m.CheckIns {
		if c.MarketID == marketID && c.Status == vendor.StatusCheckedIn {
			result = append(result, c)
		}
	}
	return result, nil
}

func (m *MockVendorRepo) BatchCheckOut(_ context.Context, marketID domain.MarketID) (int, error) {
	if m.Err != nil {
		return 0, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	count := 0
	for _, c := range m.CheckIns {
		if c.MarketID == marketID && c.Status == vendor.StatusCheckedIn {
			c.Status = vendor.StatusCheckedOut
			now := time.Now()
			c.CheckedOutAt = &now
			count++
		}
	}
	return count, nil
}

// ---------- MockCustomerRepo ----------

// MockCustomerRepo implements customer.Repository with in-memory storage.
type MockCustomerRepo struct {
	mu        sync.RWMutex
	Customers map[domain.CustomerID]*customer.CustomerRecord
	Follows   map[domain.CustomerID][]*customer.FollowRecord
	Err       error
	counter   int
}

// NewMockCustomerRepo creates a new MockCustomerRepo.
func NewMockCustomerRepo() *MockCustomerRepo {
	return &MockCustomerRepo{
		Customers: make(map[domain.CustomerID]*customer.CustomerRecord),
		Follows:   make(map[domain.CustomerID][]*customer.FollowRecord),
	}
}

func (m *MockCustomerRepo) nextID() string {
	m.counter++
	return fmt.Sprintf("cmock-%d", m.counter)
}

func (m *MockCustomerRepo) CreateCustomer(_ context.Context, c *customer.CustomerRecord) (*customer.CustomerRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	c.ID = domain.CustomerID(m.nextID())
	c.CreatedAt = time.Now()
	c.UpdatedAt = time.Now()
	m.Customers[c.ID] = c
	return c, nil
}

func (m *MockCustomerRepo) FindCustomerByUserID(_ context.Context, userID domain.UserID) (*customer.CustomerRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	for _, c := range m.Customers {
		if c.UserID == userID {
			return c, nil
		}
	}
	return nil, customer.ErrCustomerNotFound
}

func (m *MockCustomerRepo) UpdateCustomer(_ context.Context, c *customer.CustomerRecord) (*customer.CustomerRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	c.UpdatedAt = time.Now()
	m.Customers[c.ID] = c
	return c, nil
}

func (m *MockCustomerRepo) Follow(_ context.Context, customerID domain.CustomerID, targetType string, targetID string) (*customer.FollowRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	f := &customer.FollowRecord{
		ID:         m.nextID(),
		CustomerID: customerID,
		TargetType: targetType,
		TargetID:   targetID,
		CreatedAt:  time.Now(),
	}
	m.Follows[customerID] = append(m.Follows[customerID], f)
	return f, nil
}

func (m *MockCustomerRepo) Unfollow(_ context.Context, customerID domain.CustomerID, targetType string, targetID string) error {
	if m.Err != nil {
		return m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	follows := m.Follows[customerID]
	for i, f := range follows {
		if f.TargetType == targetType && f.TargetID == targetID {
			m.Follows[customerID] = append(follows[:i], follows[i+1:]...)
			return nil
		}
	}
	return customer.ErrNotFollowing
}

func (m *MockCustomerRepo) GetFollows(_ context.Context, customerID domain.CustomerID) ([]*customer.FollowRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.Follows[customerID], nil
}

func (m *MockCustomerRepo) GetFollowerCount(_ context.Context, _ string, _ string) (int, error) {
	if m.Err != nil {
		return 0, m.Err
	}
	return 0, nil
}

func (m *MockCustomerRepo) DiscoverMarkets(_ context.Context, _, _, _ float64, _, _ int32) ([]*customer.DiscoveredMarket, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return nil, nil
}

func (m *MockCustomerRepo) DiscoverVendors(_ context.Context, _ domain.MarketID, _, _ int32) ([]*customer.DiscoveredVendor, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return nil, nil
}

func (m *MockCustomerRepo) GetFollowingFeed(_ context.Context, _ domain.CustomerID, _, _ int32) ([]*customer.FollowingFeedItem, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return nil, nil
}

// ---------- MockNotifyRepo ----------

// MockNotifyRepo implements notify.Repository with in-memory storage.
type MockNotifyRepo struct {
	mu     sync.RWMutex
	Tokens map[domain.UserID][]notify.DeviceTokenRecord
	Prefs  map[domain.UserID]*notify.NotificationPrefsRecord
	Feed   []notify.ActivityFeedItem
	Err    error
}

// NewMockNotifyRepo creates a new MockNotifyRepo.
func NewMockNotifyRepo() *MockNotifyRepo {
	return &MockNotifyRepo{
		Tokens: make(map[domain.UserID][]notify.DeviceTokenRecord),
		Prefs:  make(map[domain.UserID]*notify.NotificationPrefsRecord),
	}
}

func (m *MockNotifyRepo) RegisterDeviceToken(_ context.Context, userID domain.UserID, token string, platform string) error {
	if m.Err != nil {
		return m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	m.Tokens[userID] = append(m.Tokens[userID], notify.DeviceTokenRecord{
		UserID:   userID,
		Token:    token,
		Platform: platform,
	})
	return nil
}

func (m *MockNotifyRepo) UnregisterDeviceToken(_ context.Context, userID domain.UserID, token string) error {
	if m.Err != nil {
		return m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	tokens := m.Tokens[userID]
	for i, t := range tokens {
		if t.Token == token {
			m.Tokens[userID] = append(tokens[:i], tokens[i+1:]...)
			return nil
		}
	}
	return nil
}

func (m *MockNotifyRepo) GetDeviceTokensByUserID(_ context.Context, userID domain.UserID) ([]notify.DeviceTokenRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.Tokens[userID], nil
}

func (m *MockNotifyRepo) GetDeviceTokensForFollowers(_ context.Context, _ string, _ string) ([]notify.DeviceTokenRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return nil, nil
}

func (m *MockNotifyRepo) GetNotificationPrefs(_ context.Context, userID domain.UserID) (*notify.NotificationPrefsRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.RLock()
	defer m.mu.RUnlock()
	p, ok := m.Prefs[userID]
	if !ok {
		return nil, notify.ErrPrefsNotFound
	}
	return p, nil
}

func (m *MockNotifyRepo) UpdateNotificationPrefs(_ context.Context, userID domain.UserID, prefs *notify.NotificationPrefsRecord) (*notify.NotificationPrefsRecord, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	prefs.UserID = userID
	m.Prefs[userID] = prefs
	return prefs, nil
}

func (m *MockNotifyRepo) CreateActivityFeedItem(_ context.Context, item *notify.ActivityFeedItem) error {
	if m.Err != nil {
		return m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	m.Feed = append(m.Feed, *item)
	return nil
}

func (m *MockNotifyRepo) GetActivityFeed(_ context.Context, _ domain.UserID, _, _ int32) ([]notify.ActivityFeedItem, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return m.Feed, nil
}

func (m *MockNotifyRepo) GetMarketActivityFeed(_ context.Context, _ domain.MarketID, _, _ int32) ([]notify.ActivityFeedItem, error) {
	if m.Err != nil {
		return nil, m.Err
	}
	return nil, nil
}

// ---------- MockClaimsSetter ----------

// MockClaimsSetter implements auth.ClaimsSetter for testing.
type MockClaimsSetter struct {
	mu     sync.Mutex
	Claims map[string]map[string]interface{}
	Err    error
}

// NewMockClaimsSetter creates a new MockClaimsSetter.
func NewMockClaimsSetter() *MockClaimsSetter {
	return &MockClaimsSetter{Claims: make(map[string]map[string]interface{})}
}

func (m *MockClaimsSetter) SetCustomUserClaims(_ context.Context, uid string, claims map[string]interface{}) error {
	if m.Err != nil {
		return m.Err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	m.Claims[uid] = claims
	return nil
}

// ---------- MockFCMClient ----------

// MockFCMClient implements notify.FCMClient for testing.
type MockFCMClient struct {
	Err error
}

// SendToTopic is a no-op mock for FCM.
func (m *MockFCMClient) SendToTopic(_ context.Context, _, _, _ string, _ map[string]string) error {
	return m.Err
}
