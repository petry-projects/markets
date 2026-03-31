package vendor

import (
	"testing"
	"time"

	"github.com/petry-projects/markets-api/internal/domain"
)

func TestNewCheckIn(t *testing.T) {
	ci := NewCheckIn(NewCheckInParams{
		VendorID: domain.VendorID("v-1"),
		MarketID: domain.MarketID("m-1"),
	})
	if ci.VendorID != "v-1" {
		t.Errorf("expected vendor ID v-1, got %q", ci.VendorID)
	}
	if ci.MarketID != "m-1" {
		t.Errorf("expected market ID m-1, got %q", ci.MarketID)
	}
	if ci.Status != StatusCheckedIn {
		t.Errorf("expected status checked_in, got %q", ci.Status)
	}
	if ci.CheckedInAt.IsZero() {
		t.Error("expected checked_in_at to be set")
	}
}

func TestCheckOut_Success(t *testing.T) {
	ci := &CheckInRecord{
		ID:          domain.CheckInID("ci-1"),
		VendorID:    domain.VendorID("v-1"),
		MarketID:    domain.MarketID("m-1"),
		Status:      StatusCheckedIn,
		CheckedInAt: time.Now(),
	}

	err := ci.CheckOut()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if ci.Status != StatusCheckedOut {
		t.Errorf("expected checked_out, got %q", ci.Status)
	}
	if ci.CheckedOutAt == nil {
		t.Error("expected checked_out_at to be set")
	}
}

func TestCheckOut_NotCheckedIn(t *testing.T) {
	now := time.Now()
	ci := &CheckInRecord{
		ID:           domain.CheckInID("ci-1"),
		Status:       StatusCheckedOut,
		CheckedOutAt: &now,
	}

	err := ci.CheckOut()
	if err != ErrNotCheckedIn {
		t.Errorf("expected ErrNotCheckedIn, got %v", err)
	}
}

func TestReportException_Success(t *testing.T) {
	ci := &CheckInRecord{
		ID:          domain.CheckInID("ci-1"),
		VendorID:    domain.VendorID("v-1"),
		MarketID:    domain.MarketID("m-1"),
		Status:      StatusCheckedIn,
		CheckedInAt: time.Now(),
	}

	err := ci.ReportException("Running Late")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if ci.Status != StatusException {
		t.Errorf("expected exception, got %q", ci.Status)
	}
	if ci.ExceptionReason != "Running Late" {
		t.Errorf("expected 'Running Late', got %q", ci.ExceptionReason)
	}
	if ci.CheckedOutAt == nil {
		t.Error("expected checked_out_at to be set on exception")
	}
}

func TestReportException_EmptyReason(t *testing.T) {
	ci := &CheckInRecord{
		ID:     domain.CheckInID("ci-1"),
		Status: StatusCheckedIn,
	}

	err := ci.ReportException("")
	if err != ErrInvalidExceptionReason {
		t.Errorf("expected ErrInvalidExceptionReason, got %v", err)
	}
}

func TestReportException_NotCheckedIn(t *testing.T) {
	ci := &CheckInRecord{
		ID:     domain.CheckInID("ci-1"),
		Status: StatusCheckedOut,
	}

	err := ci.ReportException("Sold Out")
	if err != ErrNotCheckedIn {
		t.Errorf("expected ErrNotCheckedIn, got %v", err)
	}
}

func TestCheckConflict_NoActiveCheckIns(t *testing.T) {
	err := CheckConflict(nil, domain.MarketID("m-1"))
	if err != nil {
		t.Errorf("expected no error, got %v", err)
	}
}

func TestCheckConflict_SameMarket(t *testing.T) {
	active := []*CheckInRecord{
		{MarketID: domain.MarketID("m-1"), Status: StatusCheckedIn},
	}

	err := CheckConflict(active, domain.MarketID("m-1"))
	if err != ErrAlreadyCheckedIn {
		t.Errorf("expected ErrAlreadyCheckedIn, got %v", err)
	}
}

func TestCheckConflict_DifferentMarket(t *testing.T) {
	active := []*CheckInRecord{
		{MarketID: domain.MarketID("m-1"), Status: StatusCheckedIn},
	}

	err := CheckConflict(active, domain.MarketID("m-2"))
	if err != ErrConflictCheckIn {
		t.Errorf("expected ErrConflictCheckIn, got %v", err)
	}
}

func TestCheckConflict_IgnoresNonActive(t *testing.T) {
	active := []*CheckInRecord{
		{MarketID: domain.MarketID("m-1"), Status: StatusCheckedOut},
	}

	err := CheckConflict(active, domain.MarketID("m-2"))
	if err != nil {
		t.Errorf("expected no error for checked-out record, got %v", err)
	}
}
