package db

import (
	"strings"
	"testing"
)

func TestSoftDeleteFilter_NoAlias(t *testing.T) {
	result := SoftDeleteFilter("")
	if result != "deleted_at IS NULL" {
		t.Errorf("expected 'deleted_at IS NULL', got '%s'", result)
	}
}

func TestSoftDeleteFilter_WithAlias(t *testing.T) {
	result := SoftDeleteFilter("u")
	if result != "u.deleted_at IS NULL" {
		t.Errorf("expected 'u.deleted_at IS NULL', got '%s'", result)
	}
}

func TestSoftDeleteFilter_InvalidAlias_Panics(t *testing.T) {
	defer func() {
		r := recover()
		if r == nil {
			t.Fatal("expected panic for invalid alias")
		}
	}()
	SoftDeleteFilter("'; DROP TABLE users; --")
}

func TestPaginationClause_Defaults(t *testing.T) {
	result := PaginationClause(DefaultPagination())
	if result != "LIMIT 20 OFFSET 0" {
		t.Errorf("expected 'LIMIT 20 OFFSET 0', got '%s'", result)
	}
}

func TestPaginationClause_ClampsNegatives(t *testing.T) {
	result := PaginationClause(PaginationParams{Limit: -1, Offset: -5})
	if !strings.Contains(result, "LIMIT 20") {
		t.Errorf("expected clamped limit, got '%s'", result)
	}
	if !strings.Contains(result, "OFFSET 0") {
		t.Errorf("expected clamped offset, got '%s'", result)
	}
}

func TestPaginationClause_ClampsMaxLimit(t *testing.T) {
	result := PaginationClause(PaginationParams{Limit: 5000, Offset: 0})
	if !strings.Contains(result, "LIMIT 1000") {
		t.Errorf("expected max-clamped limit, got '%s'", result)
	}
}
